# ReguLens REST API Reference

The ReguLens API runs on port 8007 (or configured port) under prefix `/api/v1`.

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/info` | Service metadata, architecture archetype, and version. |
| `GET` | `/api/v1/readyz` | Liveness and dependency readiness probes. |
| `GET` | `/api/v1/audits` | List all tracked AI system regulatory audits. |
| `GET` | `/api/v1/audits/{id}` | Retrieve complete regulatory audit with framework scores and findings. |
| `POST` | `/api/v1/audits/evaluate` | Submit AI system for live multi-framework evaluation and GPU audit. |

---

## Detailed Endpoint Specifications

### 1. `POST /api/v1/audits/evaluate`
Evaluates an artificial intelligence system against EU AI Act, NIST AI RMF, ISO 42001, and GDPR Article 22, synthesizing executive legal counsel verdicts using local GPU Ollama (`qwen2.5:0.5b`).

**Request Body:**
```json
{
  "system_name": "OmniCredit Automated Underwriting Engine",
  "deployment_domain": "Consumer Credit & Lending Decisions",
  "description": "Automated ML credit scoring model calculating default risk without human pre-decision intervention.",
  "data_types": [
    "Financial Transaction Logs",
    "Credit Bureau Records"
  ],
  "human_oversight_level": "Post-decision passive monitoring (No block)",
  "model": "qwen2.5:0.5b"
}
```

**Response (HTTP 200 OK):**
```json
{
  "id": "aud_19f3a8b2",
  "system_name": "OmniCredit Automated Underwriting Engine",
  "deployment_domain": "Consumer Credit & Lending Decisions",
  "risk_tier": "HIGH_RISK",
  "overall_compliance_score": 58,
  "executive_verdict": "NON-COMPLIANT: OmniCredit constitutes a High-Risk AI System under EU AI Act Annex III...",
  "framework_scores": [
    {
      "framework": "EU_AI_ACT",
      "compliance_percentage": 50,
      "total_controls": 4,
      "passed_controls": 2,
      "gap_count": 2
    },
    {
      "framework": "NIST_AI_RMF",
      "compliance_percentage": 50,
      "total_controls": 4,
      "passed_controls": 2,
      "gap_count": 2
    },
    {
      "framework": "ISO_42001",
      "compliance_percentage": 75,
      "total_controls": 4,
      "passed_controls": 3,
      "gap_count": 1
    },
    {
      "framework": "GDPR_ART_22",
      "compliance_percentage": 50,
      "total_controls": 2,
      "passed_controls": 1,
      "gap_count": 1
    }
  ],
  "findings": [
    {
      "id": "FIND-EU-14",
      "framework": "EU_AI_ACT",
      "clause_reference": "Article 14 (Human Oversight)",
      "severity": "CRITICAL",
      "title": "Insufficient Human Oversight Controls",
      "description": "High-Risk AI deployment lacks real-time override mechanism...",
      "remediation_step": "Implement mandatory secondary approval gateway before high-impact decisions take legal effect.",
      "status": "NON_COMPLIANT"
    }
  ],
  "audited_at": "2026-10-11T14:28:00Z",
  "model": "qwen2.5:0.5b",
  "latency_ms": 3967.9
}
```

**Error Response (HTTP 503 Service Unavailable — RFC 7807):**
```json
{
  "type": "https://regulens.ai/errors/upstream-unavailable",
  "title": "Local GPU LLM Engine Unavailable",
  "status": 503,
  "detail": "Connection failure to local GPU Ollama at http://127.0.0.1:11434/chat/completions"
}
```
