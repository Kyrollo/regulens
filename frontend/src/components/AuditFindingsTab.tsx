import React, { useState } from 'react';
import {
  AISystemAudit,
  AuditFinding,
  ComplianceFramework,
  FindingSeverity,
} from '../types/regulens';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Filter,
  CheckSquare,
} from 'lucide-react';

interface AuditFindingsTabProps {
  audit: AISystemAudit;
}

export const AuditFindingsTab: React.FC<AuditFindingsTabProps> = ({ audit }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredFindings = audit.findings.filter((f) => {
    if (selectedSeverity === 'all') return true;
    return f.severity === selectedSeverity;
  });

  const getSeverityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase font-mono">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            <span>CRITICAL GAP</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-mono">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>WARNING</span>
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase font-mono">
            <Info className="w-3 h-3 text-blue-400" />
            <span>INFORMATIONAL</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-y-auto p-6 space-y-6 bg-background">
      {/* Header and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-foreground">
              Audit Findings & Technical Remediation Plan
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mandatory policy gaps identified during multi-framework evaluation for{' '}
            <strong className="text-foreground">{audit.system_name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs py-1.5 px-3 bg-muted/80 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Severities ({audit.findings.length})</option>
            <option value="CRITICAL">Critical Gaps Only</option>
            <option value="WARNING">Warnings Only</option>
            <option value="INFO">Informational Only</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-sm hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted border border-border text-foreground">
                    {finding.framework}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">
                    {finding.clause_reference}
                  </span>
                  {getSeverityBadge(finding.severity)}
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    finding.status === 'NON_COMPLIANT'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  Status: {finding.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground">{finding.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {finding.description}
                </p>
              </div>

              {/* Remediation Step Action Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Required Technical Remediation:</span>
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {finding.remediation_step}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 rounded-xl bg-card border border-border text-center text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-foreground">Zero Findings for Selected Filter</h4>
            <p className="text-xs text-muted-foreground mt-1">
              All mandatory controls in this category meet framework requirements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
