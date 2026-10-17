from __future__ import annotations

import csv
import io
import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None

router = APIRouter(prefix="/files", tags=["files"])

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

FILE_REGISTRY: dict[str, dict[str, Any]] = {}


class FileMetadata(BaseModel):
    id: str
    filename: str
    size_bytes: int
    content_type: str
    uploaded_at: str
    processed: bool = False
    details: dict[str, Any] = Field(default_factory=dict)


@router.post("/upload", response_model=FileMetadata)
async def upload_file(file: UploadFile = File(...)) -> FileMetadata:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")

    ext = Path(file.filename).suffix.lower()
    allowed_extensions = {".pdf", ".docx", ".txt", ".csv", ".json", ".md"}
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed: {', '.join(sorted(allowed_extensions))}",
        )

    file_id = f"file_{uuid.uuid4().hex[:10]}"
    dest_path = UPLOAD_DIR / f"{file_id}_{file.filename}"

    content = await file.read()
    dest_path.write_bytes(content)

    meta = {
        "id": file_id,
        "filename": file.filename,
        "size_bytes": len(content),
        "content_type": file.content_type or "application/octet-stream",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "processed": False,
        "stored_path": str(dest_path),
        "details": {"extension": ext},
    }
    FILE_REGISTRY[file_id] = meta

    return FileMetadata(**meta)


@router.get("", response_model=list[FileMetadata])
async def list_files() -> list[FileMetadata]:
    return [FileMetadata(**meta) for meta in FILE_REGISTRY.values()]


@router.get("/{file_id}", response_model=FileMetadata)
async def get_file(file_id: str) -> FileMetadata:
    if file_id not in FILE_REGISTRY:
        raise HTTPException(status_code=404, detail="File record not found")
    return FileMetadata(**FILE_REGISTRY[file_id])


@router.delete("/{file_id}")
async def delete_file(file_id: str) -> dict[str, str]:
    if file_id not in FILE_REGISTRY:
        raise HTTPException(status_code=404, detail="File record not found")

    stored_path = Path(FILE_REGISTRY[file_id]["stored_path"])
    if stored_path.exists():
        stored_path.unlink()

    del FILE_REGISTRY[file_id]
    return {"status": "deleted", "id": file_id}


@router.post("/{file_id}/process")
async def process_file(file_id: str) -> dict[str, Any]:
    if file_id not in FILE_REGISTRY:
        raise HTTPException(status_code=404, detail="File record not found")

    meta = FILE_REGISTRY[file_id]
    file_path = Path(meta["stored_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Stored file binary missing")

    extracted_text = ""
    pages_count = 1

    if meta["filename"].endswith(".pdf") and pypdf:
        try:
            reader = pypdf.PdfReader(str(file_path))
            pages_count = len(reader.pages)
            extracted_text = "\n".join(p.extract_text() or "" for p in reader.pages[:10])
        except Exception:
            extracted_text = f"[Binary PDF compliance document: {meta['filename']}]"
    elif meta["filename"].endswith(".docx") and docx:
        try:
            doc = docx.Document(str(file_path))
            extracted_text = "\n".join(p.text for p in doc.paragraphs if p.text)
        except Exception:
            extracted_text = f"[Binary DOCX compliance policy: {meta['filename']}]"
    else:
        extracted_text = file_path.read_text(encoding="utf-8", errors="replace")

    # Detect frameworks mentioned in text
    frameworks_detected = []
    for fw in ["EU AI Act", "NIST AI RMF", "ISO 42001", "GDPR", "HIPAA", "SOC2"]:
        if fw.lower() in extracted_text.lower():
            frameworks_detected.append(fw)

    meta["processed"] = True
    meta["details"]["pages"] = pages_count
    meta["details"]["frameworks"] = frameworks_detected

    return {
        "status": "success",
        "file_id": file_id,
        "filename": meta["filename"],
        "pages_analyzed": pages_count,
        "frameworks_matched": frameworks_detected or ["General AI Governance"],
        "word_count": len(extracted_text.split()),
        "text_preview": extracted_text[:1200],
        "message": f"Compliance document mapped against regulatory framework radar ({len(frameworks_detected)} frameworks identified).",
    }
