from __future__ import annotations

from src.regulens.domain.entities import (
    ComplianceFramework,
    FindingSeverity,
    RiskTier,
)
from src.regulens.services.compliance_engine import (
    classify_system_risk_tier,
    evaluate_compliance_controls,
)


def test_classify_system_risk_tier() -> None:
    assert classify_system_risk_tier("Credit & Lending", "Automated underwriting algorithm") == RiskTier.HIGH_RISK
    assert classify_system_risk_tier("Healthcare", "Medical imaging triage model") == RiskTier.HIGH_RISK
    assert classify_system_risk_tier("Recruitment", "Resume parsing and hiring score") == RiskTier.HIGH_RISK
    assert classify_system_risk_tier("Customer Service", "General FAQ chatbot") == RiskTier.LIMITED_RISK
    assert classify_system_risk_tier("Internal Dev", "Code syntax auto-formatter") == RiskTier.MINIMAL_RISK


def test_evaluate_compliance_controls_high_risk() -> None:
    scores, findings, overall = evaluate_compliance_controls(
        system_name="LendingBot",
        domain="Credit & Underwriting",
        description="Scoring consumer loan applications without audited demographic parity",
        human_oversight="Fully automated with no override",
    )

    assert len(scores) == 4
    frameworks = {s.framework for s in scores}
    assert ComplianceFramework.EU_AI_ACT in frameworks
    assert ComplianceFramework.GDPR_ART_22 in frameworks

    assert len(findings) >= 2
    crits = [f for f in findings if f.severity == FindingSeverity.CRITICAL]
    assert len(crits) >= 1
    assert overall < 70
