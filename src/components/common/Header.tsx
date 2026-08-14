import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  SlidersHorizontal,
  User,
  LogOut,
  LogIn,
  UserPlus,
  FileText,
  Shield,
} from 'lucide-react';
import { Project, ActiveTab } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (project: Project) => void;
  onOpenNewRequirementModal: () => void;
  onOpenNewProjectModal: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onToggleMobileSidebar: () => void;
  userEmail?: string;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenNewRequirementModal,
  onOpenNewProjectModal,
  setActiveTab,
  onToggleMobileSidebar,
  userEmail,
  onOpenAuthModal,
}) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const displayName = currentUser?.name || 'Jordan Davis';
  const displayEmail = currentUser?.email || userEmail || 'jordan.lead@enterprise.io';
  const displayRole = currentUser?.role || 'Lead Software Architect';
  const displayAvatar =
    currentUser?.avatar ||
    displayName
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    'JD';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left side: Mobile menu toggle + Breadcrumbs & Project Switcher */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleMobileSidebar}
          className="p-1.5 text-slate-500 rounded-lg hover:text-slate-800 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb & Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('projects')}
            className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors hidden sm:inline"
          >
            Projects
          </button>
          <span className="text-slate-300 hidden sm:inline">/</span>

          <div className="relative">
            <button
              id="header-project-selector-btn"
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 text-left transition-all group"
            >
              <span className="text-slate-900 text-sm font-semibold truncate max-w-[170px] sm:max-w-[260px]">
                {activeProject.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            {projectDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setProjectDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Workspace Project
                  </div>
                  <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          onSelectProject(proj);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                          activeProject.id === proj.id
                            ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="truncate">
                          <p className="font-semibold truncate">{proj.name}</p>
                          <p className="text-[10px] text-slate-500 font-normal">{proj.domain}</p>
                        </div>
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-semibold">
                            {proj.qualityScore}%
                          </span>
                          {activeProject.id === proj.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="pt-1.5 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setProjectDropdownOpen(false);
                        onOpenNewProjectModal();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-dashed border-indigo-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Project</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search requirements, risks, conflicts..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveTab('requirements');
              }
            }}
          />
        </div>
      </div>

      {/* Right side: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('reports')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors hidden sm:flex items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Documentation</span>
        </button>

        {/* Analyze button */}
        <button
          id="header-analyze-req-btn"
          onClick={() => setActiveTab('analyzer')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Analyzer</span>
        </button>

        {/* New Requirement Button */}
        <button
          id="header-new-req-btn"
          onClick={onOpenNewRequirementModal}
          className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Requirement</span>
          <span className="xs:hidden">Add</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="header-notifications-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-30">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Requirements Alert Feed</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold border border-red-100">
                    3 New
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActiveTab('conflicts');
                    }}
                    className="p-2.5 rounded-lg bg-red-50/50 hover:bg-red-50 cursor-pointer border border-red-100 transition-colors"
                  >
                    <p className="font-bold text-red-700">Contradiction Detected</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">REQ-ORD-02 conflicts with REQ-LOG-03 on cancellation restrictions.</p>
                  </div>
                  <div
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActiveTab('missing');
                    }}
                    className="p-2.5 rounded-lg bg-amber-50/50 hover:bg-amber-50 cursor-pointer border border-amber-100 transition-colors"
                  >
                    <p className="font-bold text-amber-700">Missing Requirement</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Payment Module lacks 3D Secure fallback and refund rollback specs.</p>
                  </div>
                  <div
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActiveTab('ambiguity');
                    }}
                    className="p-2.5 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer border border-indigo-100 transition-colors"
                  >
                    <p className="font-bold text-indigo-700">Ambiguity Flag</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">"Users should be able to login quickly" fails testability SLA.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar with Geometric Indigo style */}
        <div className="relative">
          <button
            id="header-user-menu-btn"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-indigo-300 shadow-xs transition-all"
            title={`${displayName} (${displayRole})`}
          >
            {displayAvatar}
          </button>

          {userDropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setUserDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 animate-fadeIn">
                <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-lg mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {displayAvatar}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold">
                    <Shield className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[170px]">{displayRole}</span>
                  </div>
                </div>

                <div className="py-1 text-xs space-y-0.5">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-left font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Switch Role / Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Login</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('signup');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>New Account Signup</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                      setActiveTab('landing');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
