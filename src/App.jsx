import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { TicketsView } from './components/tickets/TicketsView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { UserManagementView } from './components/users/UserManagementView';
import { TaskDetailDrawer } from './components/task-detail/TaskDetailDrawer';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { ProjectManagerModal } from './components/modals/ProjectManagerModal';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { FinderModal } from './components/common/FinderModal';
import { MobileNavDrawer } from './components/layout/MobileNavDrawer';
import { AuthPage } from './components/auth/AuthPage';
import { useTasks } from './context/TaskContext';
import { useAuth } from './context/AuthContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export function App() {
  const { 
    activeView, 
    theme
  } = useTasks();
  const { isAuthenticated, isLoadingSession } = useAuth();
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  // Loading state while checking persistent rotating tokens
  if (isLoadingSession) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: 'var(--pill)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--on-pill)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
        }}>
          <ShieldCheck size={26} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
          <RefreshCw size={14} className="animate-spin" color="var(--primary)" />
          <span>Validating Enterprise Workspace Session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated: render the login / registration page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Authenticated: render full workspace with Corbel styling
  return (
    <div className="app-container" data-theme={theme}>
      {/* Corbel Ambient Glowing Mesh Background with Floating Orbs */}
      <div className="mesh" aria-hidden="true">
        <i className="mesh__a" />
        <i className="mesh__b" />
        <i className="mesh__c" />
      </div>

      {/* Full-Width Topbar Header: Branding Truly at Top-Left, Profile at Top-Right */}
      <Topbar onOpenFinder={() => setIsFinderOpen(true)} />

      {/* Main Workspace Body with Left Dock and Content Area */}
      <div className="workspace-body">
        {/* Floating Left Dock Navigation */}
        <Sidebar onOpenFinder={() => setIsFinderOpen(true)} />

        {/* Scrollable View Container */}
        <main className="main-content-scrollable">
          <div key={activeView} className="view-transition-wrapper">
            {(activeView === 'tickets' || activeView === 'kanban' || activeView === 'list' || activeView === 'table') && <TicketsView />}
            {activeView === 'analytics' && <AnalyticsDashboard />}
            {activeView === 'users' && <UserManagementView />}
          </div>
        </main>
      </div>

      {/* Corbel ⌘K Quick Finder Dialog */}
      <FinderModal 
        isOpen={isFinderOpen} 
        onClose={() => setIsFinderOpen(false)} 
      />

      {/* Modals & Slide-over Drawers */}
      <MobileNavDrawer onOpenFinder={() => setIsFinderOpen(true)} />
      <TaskDetailDrawer />
      <CreateTaskModal />
      <ProjectManagerModal />
      <UserManagementModal />
    </div>
  );
}
export default App;
