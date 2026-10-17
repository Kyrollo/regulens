import React from 'react';
import {
  AISystemAudit,
  ComplianceFramework,
  FrameworkScore,
} from '../types/regulens';
import {
  Scale,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Layers,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface FrameworkMatrixTabProps {
  audit: AISystemAudit;
}

const FRAMEWORK_META: Record<
  ComplianceFramework,
  { name: string; jurisdiction: string; desc: string; icon: React.ReactNode }
> = {
  EU_AI_ACT: {
    name: 'EU AI Act',
    jurisdiction: 'European Union',
    desc: 'Mandatory risk management, dataset governance, human oversight, and post-market tracking for High-Risk systems.',
    icon: <Scale className="w-4 h-4 text-emerald-400" />,
  },
  NIST_AI_RMF: {
    name: 'NIST AI RMF 1.0',
    jurisdiction: 'United States / Federal',
    desc: 'Govern, Map, Measure, and Manage functions for managing socio-technical risks and trustworthiness.',
    icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
  },
  ISO_42001: {
    name: 'ISO/IEC 42001:2023',
    jurisdiction: 'International Standards',
    desc: 'Artificial Intelligence Management System (AIMS) lifecycle policies and continuous auditing controls.',
    icon: <Layers className="w-4 h-4 text-purple-400" />,
  },
  GDPR_ART_22: {
    name: 'GDPR Article 22',
    jurisdiction: 'EU Data Protection',
    desc: 'Restrictions on solely automated individual decisions, requiring human intervention and counterfactual logic.',
    icon: <FileText className="w-4 h-4 text-amber-400" />,
  },
};

export const FrameworkMatrixTab: React.FC<FrameworkMatrixTabProps> = ({ audit }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-y-auto p-6 space-y-6 bg-background">
      {/* Executive Regulatory Verdict Banner */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Executive Legal Counsel & Audit Verdict (Ollama {audit.model})</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/60 px-3 py-1 rounded-lg border border-border">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Latency: {audit.latency_ms}ms</span>
          </div>
        </div>

        <MarkdownRenderer content={audit.executive_verdict} defaultMaxHeight="max-h-[500px]" />

        <div className="pt-3 border-t border-border flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
          <span>Deployment Domain: <strong className="text-foreground">{audit.deployment_domain}</strong></span>
          <span>•</span>
          <span>Risk Classification: <strong className="text-foreground">{audit.risk_tier}</strong></span>
          <span>•</span>
          <span>Audited Date: <strong className="text-foreground">{audit.audited_at}</strong></span>
        </div>
      </div>

      {/* 4 Multi-Framework Audit Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Multi-Framework Compliance Scores ({audit.framework_scores.length} Frameworks)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {audit.framework_scores.map((score) => {
            const meta = FRAMEWORK_META[score.framework];
            const isHigh = score.compliance_percentage >= 80;
            const isMid = score.compliance_percentage >= 60;

            return (
              <div
                key={score.framework}
                className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {meta.icon}
                      <span className="text-xs font-bold text-foreground">{meta.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {meta.jurisdiction}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {meta.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-foreground">
                      {score.compliance_percentage}%
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {score.passed_controls} / {score.total_controls} Controls
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-emerald-500' : isMid ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${score.compliance_percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                    <span className={score.gap_count > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {score.gap_count > 0 ? `${score.gap_count} Gaps Identified` : 'Full Alignment'}
                    </span>
                    <span className="text-muted-foreground">
                      Status: {score.compliance_percentage >= 80 ? 'PASS' : 'REMEDY'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
