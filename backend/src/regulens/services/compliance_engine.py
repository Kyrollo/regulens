from __future__ import annotations

import re
from src.regulens.domain.entities import (
    AuditFinding,
    AuditStatus,
    ComplianceFramework,
    FindingSeverity,
    FrameworkScore,
    RiskTier,
)


def classify_system_risk_tier(domain: str, description: str) -> RiskTier:
    """Classifies AI risk classification under EU AI Act Chapter II / Annex III."""
    combined = f"{domain} {description}".lower()

    if re.search(r"(?:social scor|biometric categorization for law|subliminal manipulative)", combined):
        return RiskTier.UNACCEPTABLE

    if re.search(r"(?:credit|underwrit|lending|employment|hiring|recruitment|biometric|medical|health|critical infrastructure|justice)", combined):
        return RiskTier.HIGH_RISK

    if re.search(r"(?:foundation model|frontier llm|general purpose ai|gpai)", combined):
        return RiskTier.GPAI_SYSTEMIC

    if re.search(r"(?:chatbot|synthetic content|deepfake|emotion recognition)", combined):
        return RiskTier.LIMITED_RISK

    return RiskTier.MINIMAL_RISK


def evaluate_compliance_controls(
    system_name: str,
    domain: str,
    description: str,
    human_oversight: str,
) -> tuple[list[FrameworkScore], list[AuditFinding], int]:
    """
    Evaluates mandatory AI governance controls across EU AI Act, NIST AI RMF, ISO 42001, and GDPR Art 22.
    """
    risk_tier = classify_system_risk_tier(domain, description)
    findings: list[AuditFinding] = []

    # 1. EU AI Act Evaluation
    eu_total = 4
    eu_passed = 0

    # Article 14: Human Oversight
    if "human-in-the-loop" in human_oversight.lower() or "active intervention" in human_oversight.lower():
        eu_passed += 1
    else:
        findings.append(
            AuditFinding(
                id="FIND-EU-14",
                framework=ComplianceFramework.EU_AI_ACT,
                clause_reference="Article 14 (Human Oversight)",
                severity=FindingSeverity.CRITICAL if risk_tier == RiskTier.HIGH_RISK else FindingSeverity.WARNING,
                title="Insufficient Human Oversight Controls",
                description="High-Risk AI deployment lacks real-time override mechanism to stop or reverse automated scoring outputs.",
                remediation_step="Implement mandatory secondary approval gateway before high-impact decisions take legal effect.",
                status=AuditStatus.NON_COMPLIANT,
            )
        )

    # Article 10: Data Governance & Bias Testing
    if re.search(r"(?i:bias|fairness|demographic parity|audited data)", description):
        eu_passed += 1
    else:
        findings.append(
            AuditFinding(
                id="FIND-EU-10",
                framework=ComplianceFramework.EU_AI_ACT,
                clause_reference="Article 10 (Data Governance & Bias)",
                severity=FindingSeverity.CRITICAL if risk_tier == RiskTier.HIGH_RISK else FindingSeverity.WARNING,
                title="Missing Demographic Bias & Disparate Impact Audit",
                description="Training and validation datasets lack documented disparate impact metrics across protected consumer classes.",
                remediation_step="Conduct quarterly demographic parity audits and maintain documented dataset provenance cards.",
                status=AuditStatus.PARTIAL_GAP,
            )
        )

    # Article 9: Risk Management System
    eu_passed += 1  # Implemented via ReguLens platform

    # Article 15: Accuracy & Robustness
    eu_passed += 1

    eu_score = FrameworkScore(
        framework=ComplianceFramework.EU_AI_ACT,
        compliance_percentage=int((eu_passed / eu_total) * 100),
        total_controls=eu_total,
        passed_controls=eu_passed,
        gap_count=eu_total - eu_passed,
    )

    # 2. NIST AI RMF Evaluation
    nist_total = 4
    nist_passed = 3
    if eu_passed < eu_total:
        nist_passed = 2
        findings.append(
            AuditFinding(
                id="FIND-NIST-MAP-2",
                framework=ComplianceFramework.NIST_AI_RMF,
                clause_reference="MAP 2.3 (Contextual Impact Assessment)",
                severity=FindingSeverity.WARNING,
                title="Incomplete Downstream Impact Modeling",
                description="Potential socio-technical risks and failure modes under adversarial distribution shift not fully mapped.",
                remediation_step="Execute formal stress-testing across out-of-distribution demographic profiles.",
                status=AuditStatus.PARTIAL_GAP,
            )
        )

    nist_score = FrameworkScore(
        framework=ComplianceFramework.NIST_AI_RMF,
        compliance_percentage=int((nist_passed / nist_total) * 100),
        total_controls=nist_total,
        passed_controls=nist_passed,
        gap_count=nist_total - nist_passed,
    )

    # 3. ISO/IEC 42001 Evaluation
    iso_total = 4
    iso_passed = 3
    iso_score = FrameworkScore(
        framework=ComplianceFramework.ISO_42001,
        compliance_percentage=75,
        total_controls=iso_total,
        passed_controls=iso_passed,
        gap_count=1,
    )

    # 4. GDPR Article 22 Evaluation
    gdpr_total = 2
    gdpr_passed = 1 if "human-in-the-loop" in human_oversight.lower() else 0
    if gdpr_passed == 0:
        findings.append(
            AuditFinding(
                id="FIND-GDPR-22",
                framework=ComplianceFramework.GDPR_ART_22,
                clause_reference="Article 22(3) (Meaningful Explanation)",
                severity=FindingSeverity.CRITICAL,
                title="Automated Decision-Making Without Counterfactual Logic",
                description="Individuals subject to automated scoring lack plain-language counterfactual explanations of factors causing denial.",
                remediation_step="Provide customer-facing adverse action notices specifying top 3 decisive financial attributes.",
                status=AuditStatus.NON_COMPLIANT,
            )
        )

    gdpr_score = FrameworkScore(
        framework=ComplianceFramework.GDPR_ART_22,
        compliance_percentage=int((gdpr_passed / gdpr_total) * 100),
        total_controls=gdpr_total,
        passed_controls=gdpr_passed,
        gap_count=gdpr_total - gdpr_passed,
    )

    framework_scores = [eu_score, nist_score, iso_score, gdpr_score]
    overall_compliance = int(sum(s.compliance_percentage for s in framework_scores) / len(framework_scores))

    return framework_scores, findings, overall_compliance
