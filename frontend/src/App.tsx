import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { FrameworkMatrixTab } from './components/FrameworkMatrixTab';
import { AuditFindingsTab } from './components/AuditFindingsTab';
import { SystemAuditLabTab } from './components/SystemAuditLabTab';
import { fetchAudits } from './lib/api';
import { AISystemAudit } from './types/regulens';
import { FileUploadZone } from './components/FileUploadZone';
import {
  Scale,
  ShieldAlert,
  Play,
  Loader2,
  AlertTriangle,
  FolderUp,
} from 'lucide-react';

export default function App() {
  const [audits, setAudits] = useState<AISystemAudit[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string>('aud-omni-101');
  const [activeTab, setActiveTab] = useState<'matrix' | 'findings' | 'lab' | 'uploads'>('matrix');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAudits();
      setAudits(data);
      if (data.length > 0 && !data.some((a) => a.id === selectedAuditId)) {
        setSelectedAuditId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load regulatory audits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const currentAudit =
    audits.find((a) => a.id === selectedAuditId) || audits[0] || null;

  const handleAuditCreated = (newAudit: AISystemAudit) => {
    setAudits((prev) => [newAudit, ...prev]);
    setSelectedAuditId(newAudit.id);
    setActiveTab('matrix');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header
        currentAudit={currentAudit}
        audits={audits}
        onSelectAudit={(id) => setSelectedAuditId(id)}
      />

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card/40 px-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'matrix'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Regulatory Framework Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('findings')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'findings'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Findings & Remediation</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'lab'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>System Audit Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('uploads')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'uploads'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderUp className="w-4 h-4" />
            <span>Compliance Policy Upload</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs text-muted-foreground font-mono">
              Loading multi-framework regulatory audits and compliance rules...
            </p>
          </div>
        ) : error ? (
          <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 max-w-md">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
              <h3 className="text-sm font-semibold">Compliance Load Failure</h3>
              <p className="text-xs mt-1 font-mono text-rose-300">{error}</p>
              <button
                onClick={loadAudits}
                className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'matrix' && currentAudit && <FrameworkMatrixTab audit={currentAudit} />}
            {activeTab === 'findings' && currentAudit && <AuditFindingsTab audit={currentAudit} />}
            {activeTab === 'lab' && <SystemAuditLabTab onAuditCreated={handleAuditCreated} />}
            {activeTab === 'uploads' && (
              <div className="p-6 max-w-5xl mx-auto space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Compliance Policy & Audit Checklist Upload</h3>
                  <p className="text-xs text-muted-foreground">
                    Upload governance policies (.pdf, .docx, .txt) to automatically map clauses against EU AI Act, NIST AI RMF, ISO 42001, and GDPR controls.
                  </p>
                </div>
                <FileUploadZone
                  apiBaseUrl="/api/v1"
                  allowedExtensions={['.pdf', '.docx', '.txt', '.csv', '.json', '.md']}
                  acceptedFormatsText="PDF Policies, Word (.docx), TXT, CSV, JSON"
                  onFileProcessed={() => {
                    loadAudits();
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
