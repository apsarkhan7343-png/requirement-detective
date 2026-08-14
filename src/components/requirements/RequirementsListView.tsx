import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
  Edit3,
} from 'lucide-react';
import { Project, Requirement, ActiveTab } from '../../types';

interface RequirementsListViewProps {
  activeProject: Project;
  onOpenNewRequirementModal: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectRequirementForAnalysis: (req: Requirement) => void;
}

export const RequirementsListView: React.FC<RequirementsListViewProps> = ({
  activeProject,
  onOpenNewRequirementModal,
  onNavigateTab,
  onSelectRequirementForAnalysis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filteredReqs = activeProject.requirements.filter((r) => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
    if (
      searchTerm &&
      !r.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.text.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Requirements Register
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredReqs.length} Requirements
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Full inventory of functional and non-functional specifications with automated quality verification scores.
          </p>
        </div>

        <button
          onClick={onOpenNewRequirementModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Requirement</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center flex-1 max-w-xs relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search code, title, text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Types</option>
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
              <option value="Security">Security</option>
              <option value="Performance">Performance</option>
              <option value="UI/UX">UI/UX</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requirements Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-200">
          {filteredReqs.map((req) => (
            <div
              key={req.id}
              className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {req.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">
                    [{req.module}]
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      req.priority === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : req.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {req.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-mono italic leading-relaxed">
                  "{req.text}"
                </p>

                {req.suggestedRewrite && (
                  <p className="text-[11px] text-indigo-900 bg-indigo-50/60 p-2 rounded border border-indigo-100 font-mono">
                    <strong className="text-indigo-700">IEEE 830 Rewrite:</strong> "{req.suggestedRewrite}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Quality</span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      req.qualityScore >= 80
                        ? 'text-emerald-600'
                        : req.qualityScore >= 50
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {req.qualityScore}%
                  </span>
                </div>

                <button
                  onClick={() => {
                    onSelectRequirementForAnalysis(req);
                    onNavigateTab('analyzer');
                  }}
                  className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
