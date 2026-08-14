import React, { useState } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Project, MissingRequirementItem, Requirement } from '../../types';
import { INITIAL_MISSING_REQUIREMENTS } from '../../data/mockData';

interface MissingRequirementsViewProps {
  activeProject: Project;
  onAddRequirementAsReal?: (item: MissingRequirementItem) => void;
}

export const MissingRequirementsView: React.FC<MissingRequirementsViewProps> = ({
  activeProject,
  onAddRequirementAsReal,
}) => {
  const [items, setItems] = useState<MissingRequirementItem[]>(INITIAL_MISSING_REQUIREMENTS);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const filteredItems = items.filter((item) => {
    if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
    if (moduleFilter !== 'ALL' && item.module !== moduleFilter) return false;
    return true;
  });

  const handleAdopt = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: 'Accepted' } : it))
    );
    const found = items.find((it) => it.id === id);
    if (found && onAddRequirementAsReal) {
      onAddRequirementAsReal(found);
    }
  };

  const handleDismiss = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: 'Ignored' } : it))
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Missing Requirements Detection
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {filteredItems.filter((i) => i.status === 'Pending').length} Omissions Found
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Identify omitted edge cases, payment failure fallbacks, session token revocations, and system degradation boundaries.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter by Severity:</span>
          {['ALL', 'Critical', 'High', 'Medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                severityFilter === sev
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Module:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="ALL">All Modules</option>
            <option value="Payment Module">Payment Module</option>
            <option value="Authentication">Authentication</option>
            <option value="Inventory">Inventory</option>
            <option value="Fulfillment">Fulfillment</option>
          </select>
        </div>
      </div>

      {/* Missing Requirements List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => {
          const isPending = item.status === 'Pending';
          const isAccepted = item.status === 'Accepted';

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                isAccepted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.severity === 'Critical'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.title}</span>
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
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Module: {item.module}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAccepted ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Added to Requirements
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDismiss(item.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAdopt(item.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adopt as Requirement</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Rationale & Suggested Requirement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 space-y-1">
                  <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider">
                    Architectural Gap Rationale:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{item.rationale}</p>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <span className="font-bold text-indigo-950 text-[11px] uppercase tracking-wider">
                    Recommended Formal Requirement:
                  </span>
                  <p className="text-indigo-900 font-mono text-[11px] leading-relaxed">
                    "{item.suggestedRequirement}"
                  </p>
                </div>
              </div>

              {/* Stakeholder Question */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-slate-700 font-medium">
                    <strong>Question to ask stakeholder:</strong> "{item.suggestedQuestion}"
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
