from __future__ import annotations

import time
import uuid
import httpx
from src.regulens.core.config import settings
from src.regulens.domain.entities import (
    AISystemAudit,
    SystemAuditRequest,
)
from src.regulens.services.compliance_engine import (
    classify_system_risk_tier,
    evaluate_compliance_controls,
)


class UpstreamOllamaError(Exception):
    """Raised when upstream Ollama inference fails."""
    pass


async def audit_ai_system(
    req: SystemAuditRequest,
) -> AISystemAudit:
    """
    Executes automated regulatory audit across international AI governance frameworks.
    """
    start_time = time.perf_counter()

    risk_tier = classify_system_risk_tier(req.deployment_domain, req.description)
    framework_scores, findings, overall_compliance = evaluate_compliance_controls(
        system_name=req.system_name,
        domain=req.deployment_domain,
        description=req.description,
        human_oversight=req.human_oversight_level,
    )

    system_instruction = (
        "You are ReguLens, a certified Principal AI Regulatory Auditor and Legal Governance Counsel. "
        "Evaluate the target AI system against the EU AI Act, NIST AI RMF, ISO 42001, and GDPR Article 22. "
        "State whether the deployment is COMPLIANT, PARTIAL_GAP, or NON_COMPLIANT, provide an executive audit verdict, "
        "and outline mandatory technical remediation steps."
    )
    user_prompt = (
        f"AI System: {req.system_name}\n"
        f"Deployment Domain: {req.deployment_domain}\n"
        f"Description: {req.description}\n"
        f"Data Types: {', '.join(req.data_types)}\n"
        f"Human Oversight: {req.human_oversight_level}\n"
        f"Classified Risk Tier: {risk_tier.value}\n"
        f"Calculated Framework Compliance: {overall_compliance}%\n"
        f"Detected Policy Gaps: {len(findings)}\n\n"
        "Please provide an authoritative executive audit verdict and required remediation priorities."
    )

    url = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"
    payload = {
        "model": req.model,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 512,
    }
    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    executive_verdict = ""
    try:
        async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
            resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            executive_verdict = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        else:
            raise UpstreamOllamaError(f"Ollama returned HTTP {resp.status_code}: {resp.text}")
    except httpx.RequestError as exc:
        raise UpstreamOllamaError(f"Connection failure to local GPU Ollama at {url}: {exc}") from exc

    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return AISystemAudit(
        id=f"aud_{uuid.uuid4().hex[:8]}",
        system_name=req.system_name,
        deployment_domain=req.deployment_domain,
        risk_tier=risk_tier,
        overall_compliance_score=overall_compliance,
        executive_verdict=executive_verdict or f"Regulatory audit completed for {req.system_name} ({risk_tier.value}) with {overall_compliance}% composite score.",
        framework_scores=framework_scores,
        findings=findings,
        audited_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        model=req.model,
        latency_ms=latency_ms,
    )
