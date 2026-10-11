import React from 'react';
import {
  Scale,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AISystemAudit, RiskTier } from '../types/regulens';

interface HeaderProps {
  currentAudit: AISystemAudit | null;
  audits: AISystemAudit[];
  onSelectAudit: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAudit,
  audits,
  onSelectAudit,
}) => {
  const getRiskTierBadge = (tier?: RiskTier) => {
    switch (tier) {
      case 'UNACCEPTABLE':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600/20 text-rose-300 border border-rose-500/50 font-mono animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>UNACCEPTABLE RISK</span>
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>HIGH-RISK (ANNEX III)</span>
          </span>
        );
      case 'GPAI_SYSTEMIC':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>GPAI SYSTEMIC</span>
          </span>
        );
      case 'LIMITED_RISK':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>LIMITED RISK</span>
          </span>
        );
      case 'MINIMAL_RISK':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MINIMAL RISK</span>
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
            RL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                ReguLens
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium font-mono">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Multi-Framework Regulatory Compliance & AI Policy Radar
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Target System Dropdown */}
          <select
            value={currentAudit?.id || ''}
            onChange={(e) => onSelectAudit(e.target.value)}
            className="text-xs py-1.5 px-3 bg-muted/80 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.system_name}
              </option>
            ))}
          </select>

          {/* Risk Tier Badge */}
          {currentAudit && getRiskTierBadge(currentAudit.risk_tier)}

          {/* Overall Compliance Score */}
          {currentAudit && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${getScoreColor(
                currentAudit.overall_compliance_score
              )}`}
            >
              <span>Compliance:</span>
              <span>{currentAudit.overall_compliance_score}%</span>
            </div>
          )}

          {/* Local GPU Telemetry Tag */}
          <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-lg border border-border text-xs text-emerald-400 font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>RTX A5000</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
