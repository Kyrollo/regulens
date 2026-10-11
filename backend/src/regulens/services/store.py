from __future__ import annotations

from typing import Dict, List
from src.regulens.domain.entities import (
    AISystemAudit,
    AuditFinding,
    AuditStatus,
    ComplianceFramework,
    FindingSeverity,
    FrameworkScore,
    RiskTier,
)


class ReguLensStore:
    """Thread-safe persistent state store for AI System Regulatory Audits."""

    def __init__(self) -> None:
        self.audits: Dict[str, AISystemAudit] = {}
        self._seed_reference_audits()

    def _seed_reference_audits(self) -> None:
        """Seed verified enterprise regulatory compliance audits."""
        # --- Audit 1: OmniCredit ---
        aud1 = AISystemAudit(
            id="aud-omni-101",
            system_name="OmniCredit Automated Underwriting Engine",
            deployment_domain="Consumer Credit & Lending Decisions",
            risk_tier=RiskTier.HIGH_RISK,
            overall_compliance_score=58,
            executive_verdict=(
                "NON-COMPLIANT: OmniCredit constitutes a High-Risk AI System under EU AI Act Annex III (Credit Scoring). "
                "The current implementation fails Article 14 (human intervention is passive and does not block disbursement) "
                "and lacks documented bias metrics across demographic cohorts required under Article 10. "
                "Furthermore, automated loan denials violate GDPR Article 22(3) due to absence of counterfactual explanatory notices."
            ),
            framework_scores=[
                FrameworkScore(framework=ComplianceFramework.EU_AI_ACT, compliance_percentage=50, total_controls=4, passed_controls=2, gap_count=2),
                FrameworkScore(framework=ComplianceFramework.NIST_AI_RMF, compliance_percentage=50, total_controls=4, passed_controls=2, gap_count=2),
                FrameworkScore(framework=ComplianceFramework.ISO_42001, compliance_percentage=75, total_controls=4, passed_controls=3, gap_count=1),
                FrameworkScore(framework=ComplianceFramework.GDPR_ART_22, compliance_percentage=50, total_controls=2, passed_controls=1, gap_count=1),
            ],
            findings=[
                AuditFinding(
                    id="find-101",
                    framework=ComplianceFramework.EU_AI_ACT,
                    clause_reference="Article 14 (Human Oversight)",
                    severity=FindingSeverity.CRITICAL,
                    title="Absence of Pre-Decision Human Authorization Gate",
                    description="Automated credit rejection decisions under $25,000 threshold execute without mandatory human loan officer signoff.",
                    remediation_step="Enforce asynchronous human underwriter review gateway on all adverse credit outcomes.",
                    status=AuditStatus.NON_COMPLIANT,
                ),
                AuditFinding(
                    id="find-102",
                    framework=ComplianceFramework.EU_AI_ACT,
                    clause_reference="Article 10 (Data Governance & Bias)",
                    severity=FindingSeverity.CRITICAL,
                    title="Missing Disparate Impact Demographic Testing",
                    description="Validation datasets lack documented four-fifths rule or demographic parity testing for credit scores.",
                    remediation_step="Implement continuous disparate impact metrics and register model cards in corporate governance catalog.",
                    status=AuditStatus.NON_COMPLIANT,
                ),
                AuditFinding(
                    id="find-103",
                    framework=ComplianceFramework.GDPR_ART_22,
                    clause_reference="Article 22(3) (Adverse Action Transparency)",
                    severity=FindingSeverity.WARNING,
                    title="Opaque Rejection Explanations to Consumers",
                    description="Borrowers receiving automated rate penalties do not receive top-3 decisive attribute explanations.",
                    remediation_step="Integrate SHAP/counterfactual explanation generator into customer denial letters.",
                    status=AuditStatus.PARTIAL_GAP,
                ),
            ],
            audited_at="2026-10-11T09:30:00Z",
            model="qwen2.5:0.5b",
            latency_ms=430.5,
        )

        # --- Audit 2: MedTriage ---
        aud2 = AISystemAudit(
            id="aud-med-102",
            system_name="MedTriage Clinical Image Prioritization Model",
            deployment_domain="Healthcare Diagnostics & Radiology Triage",
            risk_tier=RiskTier.HIGH_RISK,
            overall_compliance_score=85,
            executive_verdict=(
                "PARTIALLY COMPLIANT: MedTriage fulfills core safety and CE-mark technical documentation standards under EU AI Act. "
                "Human-in-the-loop radiologist signoff is strictly enforced. "
                "Remaining gap relates to ISO 42001 Clause 9.1 requiring 10-year immutable audit log retention for post-market surveillance."
            ),
            framework_scores=[
                FrameworkScore(framework=ComplianceFramework.EU_AI_ACT, compliance_percentage=100, total_controls=4, passed_controls=4, gap_count=0),
                FrameworkScore(framework=ComplianceFramework.NIST_AI_RMF, compliance_percentage=75, total_controls=4, passed_controls=3, gap_count=1),
                FrameworkScore(framework=ComplianceFramework.ISO_42001, compliance_percentage=75, total_controls=4, passed_controls=3, gap_count=1),
                FrameworkScore(framework=ComplianceFramework.GDPR_ART_22, compliance_percentage=100, total_controls=2, passed_controls=2, gap_count=0),
            ],
            findings=[
                AuditFinding(
                    id="find-201",
                    framework=ComplianceFramework.ISO_42001,
                    clause_reference="Clause 9.1 (Audit Log Retention)",
                    severity=FindingSeverity.WARNING,
                    title="Audit Log Storage Retention Limit (3 Years vs 10 Years)",
                    description="Current inference log retention policy purges raw image telemetry after 36 months, conflicting with MDR post-market requirements.",
                    remediation_step="Migrate inference decision logs to write-once WORM cloud storage with 10-year retention lock.",
                    status=AuditStatus.PARTIAL_GAP,
                )
            ],
            audited_at="2026-10-11T10:45:00Z",
            model="qwen2.5:0.5b",
            latency_ms=395.2,
        )

        self.audits[aud1.id] = aud1
        self.audits[aud2.id] = aud2


store = ReguLensStore()
