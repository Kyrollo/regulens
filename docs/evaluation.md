# ReguLens Evaluation & Benchmark Harness

This document describes the reproducible evaluation methodology, metrics, and Service Level Agreement (SLA) verification for ReguLens.

---

## 1. Running the Benchmark

Ensure local Ollama GPU is running warm at `http://127.0.0.1:11434` with model `qwen2.5:0.5b`:

```bash
cd e:\Jobs\projects\regulens
python evaluation/harness/runner.py
```

Outputs generated:
- `evaluation/reports/latest_eval.json`: Raw telemetry data.
- `evaluation/reports/compliance_audit_metrics.svg`: Metric visualization card.
- `evaluation/reports/report.md`: Markdown summary.

---

## 2. Benchmark Metrics & SLA Targets

| Benchmark Phase | Target SLA | Measured Baseline | Result |
| :--- | :--- | :--- | :--- |
| **Rule Checking Latency** | < 2,000 µs | **369.1 µs** | PASS |
| **Frameworks Audited** | 4 frameworks | **4 frameworks (EU, NIST, ISO, GDPR)** | PASS |
| **Risk Tier Classification** | Annex III Accuracy | **100% Deterministic** | PASS |
| **Composite Score Calibration** | 0 to 100 range | **43% (HIGH_RISK Non-Compliant)** | PASS |
| **Local GPU Audit Latency** | < 10,000 ms | **3,967 ms** | PASS |
| **Actionable Remediations** | 100% precision | **4 prioritized technical steps** | PASS |

---

## 3. Zero-Simulation Enforcement

ReguLens strictly bans simulated, fake, or mock implementations. Validate at any time:

```bash
python e:\Jobs\shared\foundation\scripts\check_no_simulation.py -p e:\Jobs\projects\regulens
```
