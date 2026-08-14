import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Project } from '../../types';

interface SRSReportsViewProps {
  activeProject: Project;
}

export const SRSReportsView: React.FC<SRSReportsViewProps> = ({ activeProject }) => {
  const [copied, setCopied] = useState(false);

  const generateMarkdownSRS = () => {
    return `# Software Requirement Specification (SRS)
## Project: ${activeProject.name}
**Domain:** ${activeProject.domain}
**Standard:** IEEE 830 / ISO/IEC/IEEE 29148:2018 Compliant
**Generated At:** ${new Date().toLocaleDateString()}
**Overall Quality Score:** ${activeProject.qualityScore}%

---

### 1. Executive Summary & Scope
${activeProject.description}

### 2. Quality Metrics Baseline
- **Clarity Score:** ${activeProject.clarityScore}%
- **Completeness Score:** ${activeProject.completenessScore}%
- **Consistency Score:** ${activeProject.consistencyScore}%
- **Testability Score:** ${activeProject.testabilityScore}%
- **Security Score:** ${activeProject.securityScore}%
- **Performance Score:** ${activeProject.performanceScore}%

---

### 3. Functional & Technical Requirements Register
${activeProject.requirements
  .map(
    (r, idx) => `#### 3.${idx + 1} ${r.code}: ${r.title}
- **Module:** ${r.module}
- **Type:** ${r.type} | **Priority:** ${r.priority} | **Status:** ${r.status}
- **Original Statement:** "${r.text}"
${r.suggestedRewrite ? `- **IEEE 830 Specification:** "${r.suggestedRewrite}"` : ''}
- **Quality Score:** ${r.qualityScore}% | **Ambiguity:** ${r.ambiguityLevel}
`
  )
  .join('\n')}

---

### 4. Non-Functional & Security Constraints
- **Encryption in Transit:** TLS 1.3 mandatory with HSTS preloaded.
- **Encryption at Rest:** AES-256-GCM across all database tables and backups.
- **Authentication:** OAuth 2.0 with PKCE and signed JWT token lifetimes capped at 15 minutes.
- **Latency SLA:** Core API transactions must complete within 2.0s (p95).

---
*Audit completed by RequirementDetective AI Engineering Platform.*`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownSRS());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Software Requirement Specification (SRS)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              IEEE 830 Audit-Ready
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Auto-generated, audit-ready Software Requirement Specification document ready for stakeholder sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyMarkdown}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Document Canvas with Geometric Balance Document Styling */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm space-y-8 max-w-4xl mx-auto w-full font-sans text-slate-900">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Official Engineering Document
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">{activeProject.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Domain: {activeProject.domain} • Standard: IEEE 830-1998 / ISO 29148
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Quality Index:</span>
            <div className="text-2xl font-bold text-indigo-600 font-mono">{activeProject.qualityScore}%</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Audit Compliant</span>
          </div>
        </div>

        {/* Section 1: Executive Scope */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            1. Executive Scope & Objective
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            {activeProject.description}
          </p>
        </div>

        {/* Section 2: Quality Index Breakdown */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            2. Verified Quality Standards Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px]">Completeness</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{activeProject.completenessScore}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px]">Clarity / Precision</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{activeProject.clarityScore}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px]">Consistency</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{activeProject.consistencyScore}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px]">Testability SLA</span>
              <div className="font-bold text-indigo-600 text-sm mt-0.5">{activeProject.testabilityScore}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px]">Security Standard</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{activeProject.securityScore}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px]">Performance</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{activeProject.performanceScore}%</div>
            </div>
          </div>
        </div>

        {/* Section 3: Requirements Register */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            3. Formal Requirements Matrix ({activeProject.requirements.length})
          </h3>
          <div className="space-y-4">
            {activeProject.requirements.map((req) => (
              <div key={req.id} className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {req.code}
                    </span>
                    <span className="font-bold text-slate-900">{req.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {req.type} • Priority: {req.priority}
                  </span>
                </div>

                <div className="mt-2 text-slate-600 leading-relaxed font-mono text-[11px]">
                  <strong>Baseline:</strong> "{req.text}"
                </div>

                {req.suggestedRewrite && (
                  <div className="mt-2 p-2.5 rounded bg-white border border-indigo-200/80 text-indigo-950 font-mono text-[11px] leading-relaxed">
                    <strong className="text-indigo-700">IEEE 830 Form:</strong> "{req.suggestedRewrite}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer Signoff */}
        <div className="border-t border-slate-200 pt-6 mt-8 flex items-center justify-between text-[11px] text-slate-400">
          <span>RequirementDetective Engine v2.4</span>
          <span>Approved for Sprint Execution</span>
        </div>
      </div>
    </div>
  );
};
