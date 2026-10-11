from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from src.regulens.domain.entities import AISystemAudit, SystemAuditRequest
from src.regulens.services.auditor_engine import UpstreamOllamaError, audit_ai_system
from src.regulens.services.store import store

router = APIRouter(prefix="/audits", tags=["audits"])


@router.get("", response_model=list[AISystemAudit])
async def list_audits() -> list[AISystemAudit]:
    """Retrieve all tracked AI system regulatory audits."""
    return list(store.audits.values())


@router.get("/{audit_id}", response_model=AISystemAudit)
async def get_audit(audit_id: str) -> AISystemAudit:
    """Retrieve detailed regulatory audit report with framework scores and findings."""
    audit = store.audits.get(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail=f"Audit {audit_id} not found")
    return audit


@router.post("/evaluate", response_model=AISystemAudit)
async def evaluate_system(req: SystemAuditRequest) -> AISystemAudit:
    """
    Evaluates an AI system against EU AI Act, NIST AI RMF, ISO 42001, and GDPR Article 22.
    Synthesizes executive regulatory verdict using local GPU Ollama.
    """
    if not req.system_name.strip():
        raise HTTPException(status_code=400, detail="System name cannot be empty")

    try:
        audit = await audit_ai_system(req)
        store.audits[audit.id] = audit
        return audit
    except UpstreamOllamaError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "type": "https://regulens.ai/errors/upstream-unavailable",
                "title": "Local GPU LLM Engine Unavailable",
                "status": 503,
                "detail": str(exc),
            },
        )
