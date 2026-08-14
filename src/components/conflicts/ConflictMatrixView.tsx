import React, { useState } from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Project, ConflictItem } from '../../types';
import { INITIAL_CONFLICTS } from '../../data/mockData';

interface ConflictMatrixViewProps {
  activeProject: Project;
}

export const ConflictMatrixView: React.FC<ConflictMatrixViewProps> = ({ activeProject }) => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>(INITIAL_CONFLICTS);

  const handleResolve = (id: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Resolved' } : c))
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Requirement Conflict Matrix
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            {conflicts.filter((c) => c.status === 'Open').length} Contradictions Detected
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">
          Pinpoint contradictory requirements across separate business modules before developers build conflicting software logic.
        </p>
      </div>

      {/* Conflicts List */}
      <div className="space-y-5">
        {conflicts.map((item) => {
          const isResolved = item.status === 'Resolved';

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                isResolved ? 'border-emerald-200 bg-emerald-50/15' : 'border-red-200 shadow-xs'
              }`}
            >
              {/* Conflict Type & Severity */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-bold">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">{item.conflictType}</span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">ID: {item.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                    Severity: {item.severity}
                  </span>
                  {isResolved ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolution Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolve(item.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1 text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      Apply Recommended Resolution
                    </button>
                  )}
                </div>
              </div>

              {/* Side-by-side Conflicting Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* REQ A */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Requirement Statement A</span>
                    <span className="font-mono text-indigo-600">REQ-ORD-02</span>
                  </div>
                  <p className="text-slate-800 font-mono leading-relaxed italic">
                    "{item.reqA}"
                  </p>
                </div>

                {/* REQ B */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Requirement Statement B</span>
                    <span className="font-mono text-indigo-600">REQ-LOG-03</span>
                  </div>
                  <p className="text-slate-800 font-mono leading-relaxed italic">
                    "{item.reqB}"
                  </p>
                </div>
              </div>

              {/* Contradiction Analysis */}
              <div className="p-3 rounded-lg bg-red-50/60 border border-red-100 text-xs mb-3">
                <span className="font-bold text-red-900 uppercase tracking-wider text-[10px] block mb-0.5">
                  Logical Contradiction Analysis:
                </span>
                <p className="text-slate-700 leading-relaxed">{item.explanation}</p>
              </div>

              {/* Recommended Resolution */}
              <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-bold text-indigo-950 uppercase tracking-wider text-[10px]">
                    Recommended Architecture Resolution:
                  </span>
                </div>
                <p className="text-indigo-950 font-medium leading-relaxed">
                  {item.suggestedResolution}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
