from __future__ import annotations

from fastapi import APIRouter
from .health import router as health_router
from .auth import router as auth_router
from .audits import router as audits_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(audits_router)


@api_v1_router.get("/info", tags=["info"])
async def get_system_info() -> dict[str, str]:
    return {
        "name": "Regulens",
        "slug": "regulens",
        "archetype": "Regulatory Radar & Compliance Operations Dashboard",
        "version": "1.0.0",
        "description": "Multi-Framework AI Regulatory Compliance Radar: automated audits across EU AI Act, NIST AI RMF, ISO 42001, and GDPR with local GPU executive remediation synthesis",
    }
