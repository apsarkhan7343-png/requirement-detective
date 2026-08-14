import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Project, ActiveTab } from '../../types';

interface ProjectsViewProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (p: Project) => void;
  onOpenNewProjectModal: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenNewProjectModal,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Workspace Projects
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {projects.length} Active Workspaces
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage software projects, track quality benchmarks, and audit cross-domain requirement sets.
          </p>
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((proj) => {
          const isActive = proj.id === activeProject.id;

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-mono">
                    {proj.domain}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      {proj.qualityScore}% Quality
                    </span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-1" />}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{proj.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                  {proj.description}
                </p>
              </div>

              <div>
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-200 text-center mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Reqs</span>
                    <span className="text-xs font-bold text-slate-800">{proj.requirementCount || 24}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Clarity</span>
                    <span className="text-xs font-bold text-slate-800">{proj.clarityScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Testability</span>
                    <span className="text-xs font-bold text-indigo-600">{proj.testabilityScore}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold">
                  <span className="text-slate-400 text-[11px]">
                    {isActive ? 'Current Active Workspace' : 'Click to Activate'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(proj);
                      onNavigateTab('dashboard');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
