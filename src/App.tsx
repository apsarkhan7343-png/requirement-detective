import React, { useState } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { AIAnalyzerView } from './components/analyzer/AIAnalyzerView';
import { RequirementsListView } from './components/requirements/RequirementsListView';
import { MissingRequirementsView } from './components/missing/MissingRequirementsView';
import { AmbiguityView } from './components/ambiguity/AmbiguityView';
import { ConflictMatrixView } from './components/conflicts/ConflictMatrixView';
import { RiskManagementView } from './components/risks/RiskManagementView';
import { SmartQuestionsView } from './components/questions/SmartQuestionsView';
import { DependencyGraphView } from './components/dependencies/DependencyGraphView';
import { ChangeImpactView } from './components/impact/ChangeImpactView';
import { SRSReportsView } from './components/reports/SRSReportsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { SettingsView } from './components/settings/SettingsView';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { NewRequirementModal } from './components/modals/NewRequirementModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { AuthModal } from './components/modals/AuthModal';
import { INITIAL_PROJECTS } from './data/mockData';
import { Project, Requirement, ActiveTab, MissingRequirementItem } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function MainAppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [userRole, setUserRole] = useState(currentUser?.role || 'Lead Software Architect');
  const [userEmail, setUserEmail] = useState(currentUser?.email || 'jordan.lead@enterprise.io');

  // Modals state
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
  const [isNewProjModalOpen, setIsNewProjModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleSelectProject = (project: Project) => {
    setActiveProjectId(project.id);
  };

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projectData.name || 'Untitled Workspace',
      tagline: projectData.tagline || 'Software requirement engineering project workspace',
      domain: projectData.domain || 'Enterprise SaaS',
      description: projectData.description || 'Software requirements specification suite.',
      qualityScore: projectData.qualityScore || 78,
      clarityScore: projectData.clarityScore || 75,
      completenessScore: projectData.completenessScore || 80,
      consistencyScore: projectData.consistencyScore || 70,
      testabilityScore: projectData.testabilityScore || 82,
      securityScore: projectData.securityScore || 85,
      performanceScore: projectData.performanceScore || 76,
      requirementCount: 6,
      status: 'In Review',
      requirements: [
        {
          id: `req-init-1`,
          projectId: `proj-${Date.now()}`,
          code: 'REQ-CORE-01',
          title: 'System Access & Authentication',
          type: 'Functional',
          priority: 'Critical',
          module: 'Core Security',
          text: 'Users must authenticate via multi-factor credentials before accessing protected workspace resources.',
          qualityScore: 92,
          ambiguityLevel: 'LOW',
          status: 'Approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      lastAnalyzed: 'Just now',
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
  };

  const handleAddRequirement = (reqData: Partial<Requirement>) => {
    const newReq: Requirement = {
      id: `req-${Date.now()}`,
      projectId: activeProjectId,
      code: reqData.code || `REQ-${Math.floor(100 + Math.random() * 900)}`,
      title: reqData.title || 'Untitled Requirement',
      type: reqData.type || 'Functional',
      priority: reqData.priority || 'High',
      module: reqData.module || 'Core Architecture',
      text: reqData.text || '',
      suggestedRewrite: reqData.suggestedRewrite,
      qualityScore: reqData.qualityScore || 85,
      ambiguityLevel: reqData.ambiguityLevel || 'LOW',
      status: reqData.status === 'Approved' ? 'Approved' : 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === activeProjectId) {
          return {
            ...proj,
            requirements: [newReq, ...proj.requirements],
            requirementCount: (proj.requirementCount || proj.requirements.length) + 1,
          };
        }
        return proj;
      })
    );
  };

  const handleAddMissingAsReal = (missingItem: MissingRequirementItem) => {
    handleAddRequirement({
      title: missingItem.title,
      code: `REQ-${missingItem.module.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      type: 'Functional',
      priority: missingItem.severity === 'Critical' ? 'Critical' : 'High',
      module: missingItem.module,
      text: missingItem.suggestedRequirement,
      suggestedRewrite: missingItem.suggestedRequirement,
      qualityScore: 90,
      ambiguityLevel: 'LOW',
      status: 'Approved',
    });
  };

  // Standalone dedicated pages
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => setActiveTab('dashboard')}
        onNavigateToLogin={() => setActiveTab('login')}
        onNavigateToSignup={() => setActiveTab('signup')}
      />
    );
  }

  if (activeTab === 'login') {
    return (
      <LoginPage
        onNavigateToSignup={() => setActiveTab('signup')}
        onNavigateToLanding={() => setActiveTab('landing')}
        onLoginSuccess={() => setActiveTab('dashboard')}
      />
    );
  }

  if (activeTab === 'signup') {
    return (
      <SignupPage
        onNavigateToLogin={() => setActiveTab('login')}
        onNavigateToLanding={() => setActiveTab('landing')}
        onSignupSuccess={() => setActiveTab('dashboard')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Left Navigation Sidebar with Geometric Balance styling */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProject={activeProject}
        onOpenNewRequirementModal={() => setIsNewReqModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Right Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header with breadcrumb, project switcher, and quick actions */}
        <Header
          projects={projects}
          activeProject={activeProject}
          onSelectProject={handleSelectProject}
          onOpenNewRequirementModal={() => setIsNewReqModalOpen(true)}
          onOpenNewProjectModal={() => setIsNewProjModalOpen(true)}
          setActiveTab={setActiveTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          userEmail={currentUser?.email || userEmail}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
          {activeTab === 'dashboard' && (
            <DashboardView
              activeProject={activeProject}
              onNavigateTab={setActiveTab}
              onOpenNewRequirementModal={() => setIsNewReqModalOpen(true)}
            />
          )}

          {activeTab === 'analyzer' && (
            <AIAnalyzerView
              activeProject={activeProject}
              onAddRequirement={handleAddRequirement}
            />
          )}

          {activeTab === 'requirements' && (
            <RequirementsListView
              activeProject={activeProject}
              onOpenNewRequirementModal={() => setIsNewReqModalOpen(true)}
              onNavigateTab={setActiveTab}
              onSelectRequirementForAnalysis={() => setActiveTab('analyzer')}
            />
          )}

          {activeTab === 'missing' && (
            <MissingRequirementsView
              activeProject={activeProject}
              onAddRequirementAsReal={handleAddMissingAsReal}
            />
          )}

          {activeTab === 'ambiguity' && (
            <AmbiguityView activeProject={activeProject} />
          )}

          {activeTab === 'conflicts' && (
            <ConflictMatrixView activeProject={activeProject} />
          )}

          {activeTab === 'risks' && (
            <RiskManagementView activeProject={activeProject} />
          )}

          {activeTab === 'questions' && (
            <SmartQuestionsView activeProject={activeProject} />
          )}

          {activeTab === 'dependencies' && (
            <DependencyGraphView activeProject={activeProject} />
          )}

          {activeTab === 'change-impact' && (
            <ChangeImpactView activeProject={activeProject} />
          )}

          {activeTab === 'reports' && (
            <SRSReportsView activeProject={activeProject} />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              activeProject={activeProject}
              onSelectProject={handleSelectProject}
              onOpenNewProjectModal={() => setIsNewProjModalOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView activeProject={activeProject} />
          )}
        </main>
      </div>

      {/* Modals */}
      <NewRequirementModal
        isOpen={isNewReqModalOpen}
        onClose={() => setIsNewReqModalOpen(false)}
        onAddRequirement={handleAddRequirement}
      />

      <NewProjectModal
        isOpen={isNewProjModalOpen}
        onClose={() => setIsNewProjModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectRole={(role, email) => {
          setUserRole(role);
          setUserEmail(email);
        }}
        onNavigateToLogin={() => setActiveTab('login')}
        onNavigateToSignup={() => setActiveTab('signup')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
