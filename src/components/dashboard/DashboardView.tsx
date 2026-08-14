import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  GitCompare,
  EyeOff,
  Search,
  CheckCircle2,
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Project, Requirement, ActiveTab } from '../../types';

interface DashboardViewProps {
  activeProject: Project;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectRequirementForAnalysis?: (req: Requirement) => void;
  onOpenNewRequirementModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeProject,
  onNavigateTab,
  onSelectRequirementForAnalysis,
  onOpenNewRequirementModal,
}) => {
  const [selectedReqCode, setSelectedReqCode] = useState('REQ-AUTH-01');
  const [activeReqText, setActiveReqText] = useState('Users should be able to login quickly.');
  const [isApplying, setIsApplying] = useState(false);
  const [rewriteApplied, setRewriteApplied] = useState(false);

  const sampleReqs = [
    {
      code: 'REQ-AUTH-01',
      title: 'User Authentication SLA',
      text: 'Users should be able to login quickly.',
      type: 'Functional',
      ambiguity: 'Ambiguity Detected',
      ambiguityDesc: "The term 'quickly' is not measurable and leads to testability failure.",
      missingDesc: 'Define exact response time thresholds for the login process (e.g. p95 < 2.0s).',
      suggested:
        'Users should be able to complete login within 2.0 seconds (p95) under standard network conditions with up to 1,000 concurrent sessions.',
    },
    {
      code: 'REQ-ORD-02',
      title: 'Cancellation vs Logistics Policy',
      text: 'Users can cancel orders anytime.',
      type: 'Functional',
      ambiguity: 'Conflict & Omission Detected',
      ambiguityDesc: "Unrestricted cancellation conflicts directly with post-dispatch warehouse shipping.",
      missingDesc: 'Specify cancellation state machine: allowed only during Pending or Processing status.',
      suggested:
        'Users shall be permitted to cancel orders self-service while in Pending or Processing status. Once marked as Dispatched, cancellation is disabled.',
    },
    {
      code: 'REQ-SEC-04',
      title: 'Cybersecurity Standard Specification',
      text: 'The system should be secure.',
      type: 'Security',
      ambiguity: 'Critical Ambiguity & Compliance Risk',
      ambiguityDesc: "'Secure' lacks concrete cryptographic cipher suites, OAuth protocols, and data protection.",
      missingDesc: 'Specify TLS 1.3 in transit, AES-256-GCM at rest, OAuth 2.0 PKCE, and RBAC least privilege.',
      suggested:
        'The system shall enforce TLS 1.3 in transit, AES-256-GCM at rest for all database volumes, OAuth 2.0 with PKCE, and RBAC with audit logging.',
    },
  ];

  const currentSample = sampleReqs.find((s) => s.code === selectedReqCode) || sampleReqs[0];

  const handleSelectSample = (sample: (typeof sampleReqs)[0]) => {
    setSelectedReqCode(sample.code);
    setActiveReqText(sample.text);
    setRewriteApplied(false);
  };

  const handleApplyRewrite = () => {
    setIsApplying(true);
    setTimeout(() => {
      setActiveReqText(currentSample.suggested);
      setIsApplying(false);
      setRewriteApplied(true);
    }, 400);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Top Welcome & Primary Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Good morning, Jordan.</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Let's improve your software requirements for <span className="font-semibold text-slate-700">{activeProject.name}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('reports')}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            Export SRS
          </button>
          <button
            id="dashboard-analyze-requirements-btn"
            onClick={() => onNavigateTab('analyzer')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Requirements</span>
          </button>
        </div>
      </div>

      {/* 4 Geometric Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* Total Requirements */}
        <div
          onClick={() => onNavigateTab('requirements')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center justify-between">
            <span>Total Requirements</span>
            <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeProject.requirementCount || 24}</div>
          <p className="text-[11px] text-slate-400 mt-1">Across 6 architecture modules</p>
        </div>

        {/* Issues Detected */}
        <div
          onClick={() => onNavigateTab('conflicts')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-red-200 transition-all cursor-pointer group"
        >
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center justify-between">
            <span>Issues Detected</span>
            <span className="w-2 h-2 rounded-full bg-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-500">14</div>
          <p className="text-[11px] text-red-500/80 mt-1">4 missing, 3 ambiguous, 2 conflicts</p>
        </div>

        {/* Avg. Quality Score */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center justify-between">
            <span>Avg. Quality Score</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{activeProject.qualityScore}%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">IEEE 830 / ISO 29148 Standard</p>
        </div>

        {/* Change Impact Score */}
        <div
          onClick={() => onNavigateTab('change-impact')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-200 transition-all cursor-pointer group"
        >
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center justify-between">
            <span>Change Impact Score</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-500">Low</div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for sprint execution</p>
        </div>
      </div>

      {/* Main 12-Column Balanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left 8-Column: Requirement Analyzer Interactive Panel */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col flex-1 shadow-xs">
            {/* Card Header with Geometric Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-slate-800 text-base">Requirement Analyzer</h2>
                <div className="flex gap-1.5">
                  {sampleReqs.map((sample) => (
                    <button
                      key={sample.code}
                      onClick={() => handleSelectSample(sample)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                        selectedReqCode === sample.code
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sample.code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {currentSample.type}
                </span>
                <span className="px-2 py-1 bg-indigo-50 rounded text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  AI Editor Active
                </span>
              </div>
            </div>

            {/* Requirement Inspection Box with Geometric Mono Style */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 relative font-mono text-sm min-h-[110px] flex flex-col justify-between">
              <div>
                <div className="text-slate-400 text-xs mb-1.5 flex items-center justify-between">
                  <span># {selectedReqCode}</span>
                  <span className="text-[10px] uppercase font-sans font-semibold text-slate-400">
                    {rewriteApplied ? 'Rewritten' : 'Original Text'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  "{activeReqText}"
                </p>
              </div>

              <div className="flex justify-end items-center gap-2 mt-3">
                {rewriteApplied && (
                  <button
                    onClick={() => {
                      setActiveReqText(currentSample.text);
                      setRewriteApplied(false);
                    }}
                    className="bg-white border border-slate-300 px-3 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigateTab('analyzer')}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Full AI Re-Analyze
                </button>
              </div>
            </div>

            {/* AI Insights & Suggested Improvement Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Insights */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Insight</h3>

                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-red-700">{currentSample.ambiguity}</div>
                    <p className="text-[11px] text-red-600 mt-0.5 leading-snug">{currentSample.ambiguityDesc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-amber-700">Omission & Boundary Gap</div>
                    <p className="text-[11px] text-amber-600 mt-0.5 leading-snug">{currentSample.missingDesc}</p>
                  </div>
                </div>
              </div>

              {/* Right Suggested Improvement */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suggested Improvement</h3>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-1">
                    <p className="text-xs text-indigo-900 italic mb-2 leading-relaxed">
                      "{currentSample.suggested}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleApplyRewrite}
                  disabled={isApplying || rewriteApplied}
                  className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                    rewriteApplied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isApplying ? (
                    'Applying...'
                  ) : rewriteApplied ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied to Requirement
                    </span>
                  ) : (
                    'Apply Rewriting'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4-Column: Critical Risks + AI Consultant Card */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Recent Critical Risks Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 text-sm">Recent Critical Risks</h2>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                5 Total
              </span>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigateTab('risks')}
                className="p-3 border border-slate-100 rounded-lg hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-700">Security Concern</span>
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">
                    Critical
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  User data encryption policy not defined for international transactions.
                </p>
              </div>

              <div
                onClick={() => onNavigateTab('conflicts')}
                className="p-3 border border-slate-100 rounded-lg hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-700">Dependency Conflict</span>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">
                    High
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Refund module overlaps with payment gateway version 4.2 API rules.
                </p>
              </div>

              <div
                onClick={() => onNavigateTab('missing')}
                className="p-3 border border-slate-100 rounded-lg hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-700">Testability Risk</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">
                    Med
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Undefined edge cases for multi-currency cart conversions.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('risks')}
              className="mt-3.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 uppercase tracking-wider py-1"
            >
              <span>View Risk Report</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* AI Consultant Ready Dark Geometric Card */}
          <div className="bg-[#0F172A] rounded-xl p-5 text-white flex-1 flex flex-col justify-center items-center text-center border border-slate-800 shadow-sm min-h-[170px]">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3 border border-indigo-500/40">
              <div className="w-5 h-5 border-2 border-indigo-400 rounded-xs animate-pulse rotate-45" />
            </div>
            <h3 className="font-bold text-sm mb-1 text-white">AI Consultant Ready</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4 px-2">
              "I've found 4 missing requirements in your Payment Module. Want to see them?"
            </p>
            <button
              onClick={() => onNavigateTab('questions')}
              className="bg-white text-[#0F172A] px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-slate-100 transition-all shadow-md"
            >
              Open Smart Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
