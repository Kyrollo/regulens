import { AISystemAudit, SystemAuditRequest } from '../types/regulens';

const API_BASE = '/api/v1';

export async function fetchAudits(): Promise<AISystemAudit[]> {
  const res = await fetch(`${API_BASE}/audits`);
  if (!res.ok) throw new Error(`Failed to fetch AI system audits: ${res.statusText}`);
  return res.json();
}

export async function fetchAudit(id: string): Promise<AISystemAudit> {
  const res = await fetch(`${API_BASE}/audits/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch audit ${id}: ${res.statusText}`);
  return res.json();
}

export async function evaluateSystem(
  req: SystemAuditRequest
): Promise<AISystemAudit> {
  const res = await fetch(`${API_BASE}/audits/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.detail?.detail || err.detail || `Evaluation failed (${res.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return res.json();
}
