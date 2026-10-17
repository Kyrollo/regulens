import React, { useState } from 'react';
import {
  AISystemAudit,
  SystemAuditRequest,
} from '../types/regulens';
import { evaluateSystem } from '../lib/api';
import {
  Play,
  Scale,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Terminal,
  Zap,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface SystemAuditLabTabProps {
  onAuditCreated: (audit: AISystemAudit) => void;
}

const PRESET_SYSTEMS = [
  {
    name: 'OmniCredit Automated Underwriting Engine',
    domain: 'Consumer Credit & Lending Decisions',
    desc: 'Automated ML credit scoring model calculating default risk on consumer loans without pre-decision human authorization or demographic parity audits.',
    dataTypes: ['Financial Transaction Logs', 'Credit Bureau Records', 'Identity Documents'],
    oversight: 'Post-decision passive monitoring (No block)',
  },
  {
    name: 'MedTriage Clinical Radiology Triage Model',
    domain: 'Healthcare Diagnostics & Medical Imaging',
    desc: 'Prioritizes acute stroke CT scans for emergency department radiologists with mandatory radiologist signoff and audited training data provenance.',
    dataTypes: ['Patient Imaging Scans (DICOM)', 'Electronic Health Records'],
    oversight: 'Human-in-the-loop (Mandatory radiologist authorization)',
  },
  {
    name: 'SupportBot Customer Inquiry Classifier',
    domain: 'General E-Commerce Support',
    desc: 'Classifies incoming user helpdesk tickets into billing or return queues with visible disclosure that an automated assistant is responding.',
    dataTypes: ['Support Chat Logs', 'Order Numbers'],
    oversight: 'Agent escalates on user request',
  },
];

export const SystemAuditLabTab: React.FC<SystemAuditLabTabProps> = ({
  onAuditCreated,
}) => {
  const [systemName, setSystemName] = useState(PRESET_SYSTEMS[0].name);
  const [domain, setDomain] = useState(PRESET_SYSTEMS[0].domain);
  const [description, setDescription] = useState(PRESET_SYSTEMS[0].desc);
  const [humanOversight, setHumanOversight] = useState(PRESET_SYSTEMS[0].oversight);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AISystemAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (p: typeof PRESET_SYSTEMS[0]) => {
    setSystemName(p.name);
    setDomain(p.domain);
    setDescription(p.desc);
    setHumanOversight(p.oversight);
    setResult(null);
    setError(null);
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const aud = await evaluateSystem({
        system_name: systemName,
        deployment_domain: domain,
        description,
        human_oversight_level: humanOversight,
        model: 'qwen2.5:0.5b',
      });
      setResult(aud);
      onAuditCreated(aud);
    } catch (err: any) {
      setError(err.message || 'Audit evaluation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] overflow-hidden bg-background">
      {/* Left Column: Form Configuration (6 cols) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-border bg-card/20">
        <div className="p-4 border-b border-border flex items-center justify-between bg-card/40">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground">
              Interactive AI Governance Audit Lab
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">Local GPU Inference Pipeline</span>
        </div>

        <form onSubmit={handleRunAudit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Preset Targets */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Select Enterprise AI System Preset:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SYSTEMS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-colors text-left ${
                    systemName === p.name
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-muted/60 border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.name.split(' ')[0]} ({p.domain.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* System Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              AI System Name
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full text-xs font-mono py-2 px-3 bg-muted/80 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Deployment Domain */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Deployment Domain & Use Case
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full text-xs font-mono py-2 px-3 bg-muted/80 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Human Oversight Level */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Human Oversight Level
            </label>
            <input
              type="text"
              value={humanOversight}
              onChange={(e) => setHumanOversight(e.target.value)}
              className="w-full text-xs font-mono py-2 px-3 bg-muted/80 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              System Description & Data Governance Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 p-3 text-xs bg-muted/80 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !systemName.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Evaluating Compliance Controls on GPU...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Multi-Framework Regulatory Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Audit Result Output (6 cols) */}
      <div className="w-full lg:w-[480px] flex flex-col h-full overflow-hidden bg-card/60 backdrop-blur-md">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground">Audit Synthesis Result</h2>
          </div>
          {result && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                {result.latency_ms}ms
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              {/* Header result */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    {result.system_name}
                  </h3>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      result.overall_compliance_score >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    Compliance: {result.overall_compliance_score}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Risk Tier: <strong className="text-foreground">{result.risk_tier}</strong> • {result.deployment_domain}
                </p>
              </div>

              {/* Executive Verdict */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Executive Legal Counsel Verdict
                </h4>
                <MarkdownRenderer content={result.executive_verdict} defaultMaxHeight="max-h-[420px]" />
              </div>

              {/* Framework Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Framework Compliance Scores ({result.framework_scores.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {result.framework_scores.map((sc) => (
                    <div key={sc.framework} className="p-2.5 rounded-lg bg-muted/60 border border-border text-xs font-mono">
                      <div className="flex justify-between font-bold">
                        <span>{sc.framework.split('_')[0]}</span>
                        <span className={sc.compliance_percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}>
                          {sc.compliance_percentage}%
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{sc.gap_count} gaps identified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Scale className="w-10 h-10 text-emerald-500/40 mb-3" />
              <p className="text-xs">No active audit result.</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">
                Select a preset system or input your AI deployment specifications to run live compliance verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
