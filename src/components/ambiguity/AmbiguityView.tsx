import React, { useState } from 'react';
import {
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { Project, AmbiguityItem } from '../../types';
import { INITIAL_AMBIGUITIES } from '../../data/mockData';

interface AmbiguityViewProps {
  activeProject: Project;
}

export const AmbiguityView: React.FC<AmbiguityViewProps> = ({ activeProject }) => {
  const [ambiguities, setAmbiguities] = useState<AmbiguityItem[]>(INITIAL_AMBIGUITIES);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdoptRewrite = (id: string) => {
    setAmbiguities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Adopted' } : a))
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Ambiguity Detection & Rewriting
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {ambiguities.length} Vague Statements
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">
          Flags non-measurable qualitative terms ('quickly', 'secure', 'user friendly') and quantifies them into deterministic SLA metrics.
        </p>
      </div>

      {/* Ambiguity Cards */}
      <div className="space-y-4">
        {ambiguities.map((item) => {
          const isAdopted = item.status === 'Adopted';

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                isAdopted ? 'border-emerald-200 bg-emerald-50/15' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Row: Original Vague Statement + Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                      ORIGINAL STATEMENT
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.ambiguityLevel === 'HIGH' || item.ambiguityLevel === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Ambiguity: {item.ambiguityLevel}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-900 font-mono">
                    "{item.originalText}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAdopted ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Rewrite Adopted
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAdoptRewrite(item.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Adopt Quantitative Rewrite</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Diagnosis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
                {/* Problem */}
                <div className="p-3 rounded-lg bg-red-50/60 border border-red-100 space-y-1">
                  <span className="font-bold text-red-800 text-[11px] uppercase tracking-wider">
                    Semantic Ambiguity Cause:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{item.problem}</p>
                  <p className="text-[11px] text-red-700 font-medium mt-1">
                    <strong>Missing:</strong> {item.missingInfo}
                  </p>
                </div>

                {/* Quantitative Rewrite */}
                <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 space-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 text-[11px] uppercase tracking-wider">
                        IEEE 830 Deterministic Specification:
                      </span>
                      <button
                        onClick={() => handleCopy(item.id, item.suggestedRewrite)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-indigo-950 font-mono text-[11px] leading-relaxed mt-1">
                      "{item.suggestedRewrite}"
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 italic">
                    {item.whyBetter}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
