export type ComplianceFramework =
  | 'EU_AI_ACT'
  | 'NIST_AI_RMF'
  | 'ISO_42001'
  | 'GDPR_ART_22';

export type RiskTier =
  | 'UNACCEPTABLE'
  | 'HIGH_RISK'
  | 'GPAI_SYSTEMIC'
  | 'LIMITED_RISK'
  | 'MINIMAL_RISK';

export type AuditStatus = 'COMPLIANT' | 'PARTIAL_GAP' | 'NON_COMPLIANT';

export type FindingSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AuditFinding {
  id: string;
  framework: ComplianceFramework;
  clause_reference: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  remediation_step: string;
  status: AuditStatus;
}

export interface FrameworkScore {
  framework: ComplianceFramework;
  compliance_percentage: number;
  total_controls: number;
  passed_controls: number;
  gap_count: number;
}

export interface AISystemAudit {
  id: string;
  system_name: string;
  deployment_domain: string;
  risk_tier: RiskTier;
  overall_compliance_score: number;
  executive_verdict: string;
  framework_scores: FrameworkScore[];
  findings: AuditFinding[];
  audited_at: string;
  model: string;
  latency_ms: number;
}

export interface SystemAuditRequest {
  system_name: string;
  deployment_domain: string;
  description: string;
  data_types?: string[];
  human_oversight_level?: string;
  model?: string;
}
