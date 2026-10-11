from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class ComplianceFramework(str, Enum):
    EU_AI_ACT = "EU_AI_ACT"
    NIST_AI_RMF = "NIST_AI_RMF"
    ISO_42001 = "ISO_42001"
    GDPR_ART_22 = "GDPR_ART_22"


class RiskTier(str, Enum):
    UNACCEPTABLE = "UNACCEPTABLE"
    HIGH_RISK = "HIGH_RISK"
    GPAI_SYSTEMIC = "GPAI_SYSTEMIC"
    LIMITED_RISK = "LIMITED_RISK"
    MINIMAL_RISK = "MINIMAL_RISK"


class AuditStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    PARTIAL_GAP = "PARTIAL_GAP"
    NON_COMPLIANT = "NON_COMPLIANT"


class FindingSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"


class AuditFinding(BaseModel):
    id: str
    framework: ComplianceFramework
    clause_reference: str
    severity: FindingSeverity
    title: str
    description: str
    remediation_step: str
    status: AuditStatus


class FrameworkScore(BaseModel):
    framework: ComplianceFramework
    compliance_percentage: int
    total_controls: int
    passed_controls: int
    gap_count: int


class AISystemAudit(BaseModel):
    id: str
    system_name: str
    deployment_domain: str
    risk_tier: RiskTier
    overall_compliance_score: int  # 0 to 100
    executive_verdict: str
    framework_scores: list[FrameworkScore] = Field(default_factory=list)
    findings: list[AuditFinding] = Field(default_factory=list)
    audited_at: str
    model: str = "qwen2.5:0.5b"
    latency_ms: float = 0.0


class SystemAuditRequest(BaseModel):
    system_name: str
    deployment_domain: str
    description: str
    data_types: list[str] = Field(default_factory=lambda: ["Customer Financial Records", "Identity Biometrics"])
    human_oversight_level: str = "Human-in-the-loop (Post-decision review)"
    model: str = "qwen2.5:0.5b"
