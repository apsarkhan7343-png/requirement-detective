import React, { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  Zap,
  Lock,
  Database,
  CheckCircle2,
  Filter,
  BarChart3,
} from 'lucide-react';
import { Project, RiskItem, RiskCategory } from '../../types';
import { INITIAL_RISKS } from '../../data/mockData';

interface RiskManagementViewProps {
  activeProject: Project;
}

export const RiskManagementView: React.FC<RiskManagementViewProps> = ({ activeProject }) => {
  const [risks, setRisks] = useState<RiskItem[]>(INITIAL_RISKS);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredRisks = risks.filter((r) => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    return true;
  });

  const handleMitigate = (id: string) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Mitigated' } : r))
    );
  };

  const categories = ['ALL', 'Security', 'Performance', 'Scalability', 'Data Privacy', 'Business Logic', 'Compliance'];

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Early Risk Detection & Management
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            {risks.filter((r) => r.status === 'Identified').length} Unmitigated Risks
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">
          Proactively evaluate vulnerabilities across security boundaries, performance bottlenecks, concurrency races, and data compliance.
        </p>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRisks.map((item) => {
          const isMitigated = item.status === 'Mitigated';

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                isMitigated ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.severity === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : item.severity === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{item.category}</span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    Impact: {item.impactScore}/100
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{item.description}</p>
              </div>

              <div>
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs mb-3">
                  <span className="font-bold text-indigo-950 uppercase tracking-wider text-[10px] block mb-0.5">
                    Actionable Mitigation Strategy:
                  </span>
                  <p className="text-indigo-900 leading-snug">{item.mitigation}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-mono text-slate-400">Status: {item.status}</span>
                  {isMitigated ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mitigated
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMitigate(item.id)}
                      className="text-xs font-semibold px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors"
                    >
                      Mark Mitigated
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
