import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  ListTodo,
  Sparkles,
  HelpCircle,
  GitCompare,
  AlertTriangle,
  GitFork,
  Zap,
  FileSpreadsheet,
  Settings,
  Search,
  EyeOff,
  Home,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab, Project } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProject: Project;
  counts?: {
    missing?: number;
    ambiguous?: number;
    conflicts?: number;
    risks?: number;
    questions?: number;
  };
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenNewRequirementModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeProject,
  counts,
  mobileOpen,
  setMobileOpen,
  isMobileOpen,
  onCloseMobile,
}) => {
  const isSidebarOpen = mobileOpen ?? isMobileOpen ?? false;
  const handleClose = () => {
    if (setMobileOpen) setMobileOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const safeCounts = {
    missing: counts?.missing ?? 4,
    ambiguous: counts?.ambiguous ?? 5,
    conflicts: counts?.conflicts ?? 3,
    risks: counts?.risks ?? 6,
    questions: counts?.questions ?? 8,
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-full" />,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderGit2,
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-xs" />,
    },
    {
      id: 'requirements',
      label: 'Requirements',
      icon: ListTodo,
      geometricIcon: (
        <div className="w-3.5 h-3.5 flex flex-col gap-[2px] justify-center">
          <div className="h-[2px] w-full bg-current rounded-xs" />
          <div className="h-[2px] w-full bg-current rounded-xs" />
          <div className="h-[2px] w-full bg-current rounded-xs" />
        </div>
      ),
    },
    {
      id: 'analyzer',
      label: 'AI Analysis',
      icon: Sparkles,
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-full border-dashed animate-spin-slow" />,
      highlight: true,
    },
    {
      id: 'missing',
      label: 'Missing Req',
      icon: Search,
      badge: safeCounts.missing,
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-full" />,
    },
    {
      id: 'ambiguity',
      label: 'Ambiguities',
      icon: EyeOff,
      badge: safeCounts.ambiguous,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-xs" />,
    },
    {
      id: 'conflicts',
      label: 'Conflicts',
      icon: GitCompare,
      badge: safeCounts.conflicts,
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-none rotate-45" />,
    },
    {
      id: 'risks',
      label: 'Risks',
      icon: AlertTriangle,
      badge: safeCounts.risks,
      badgeColor: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      geometricIcon: <div className="w-3.5 h-3.5 border-b-2 border-r-2 border-current rounded-br-xs" />,
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: HelpCircle,
      badge: safeCounts.questions,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-full" />,
    },
    {
      id: 'dependencies',
      label: 'Dependencies',
      icon: GitFork,
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-xs rotate-12" />,
    },
    {
      id: 'change-impact',
      label: 'Change Impact',
      icon: Zap,
      geometricIcon: <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-current rotate-45" />,
      highlightAccent: true,
    },
    {
      id: 'reports',
      label: 'SRS Reports',
      icon: FileSpreadsheet,
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-xs" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      geometricIcon: <div className="w-3.5 h-3.5 border-2 border-current rounded-full" />,
    },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    handleClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={handleClose}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0F172A] border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Geometric Balanced Identity */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800 bg-[#0B1120]">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick('landing')}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              <div className="w-4 h-4 border-2 border-white rounded-xs rotate-45 transition-transform group-hover:rotate-90 duration-300" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight group-hover:text-indigo-300 transition-colors">
                Req<span className="text-indigo-400">Detective</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono">RE v2.4 • IEEE 830</p>
            </div>
          </div>
          <button
            id="close-mobile-sidebar-btn"
            className="p-1.5 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 lg:hidden"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Home / Public Switcher Banner */}
        <div className="px-3 pt-3">
          <button
            id="nav-landing-btn"
            onClick={() => handleNavClick('landing')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
              activeTab === 'landing'
                ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Home className="w-3.5 h-3.5" />
              <span>Public Landing</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Overview</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-1 pt-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Engineering Modules
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`transition-colors flex items-center justify-center ${
                      isActive
                        ? 'text-indigo-400'
                        : item.highlight
                        ? 'text-indigo-400 group-hover:text-indigo-300'
                        : item.highlightAccent
                        ? 'text-amber-400 group-hover:text-amber-300'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    {item.geometricIcon}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Geometric Balance Quality Target & Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B1120]/80">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-300 font-medium">Quality Target</span>
              </div>
              <span className="text-xs font-bold text-indigo-400 font-mono">{activeProject.qualityScore}%</span>
            </div>
            <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, activeProject.qualityScore)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-slate-400">
              <span className="truncate max-w-[120px]">{activeProject.name}</span>
              <span className="text-emerald-400 font-medium">AI Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
