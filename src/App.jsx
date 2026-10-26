import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { WorkspaceLoadingScreen } from './components/common/WorkspaceLoadingScreen';
import { useTasks } from './context/TaskContext';
import { useAuth } from './context/AuthContext';

export function App() {
  const { 
    theme
  } = useTasks();
  const { isAuthenticated, isLoadingSession } = useAuth();
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Preserve intended deep-link destination for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/') {
      sessionStorage.setItem('vantage_auth_redirect', location.pathname);
    }
  }, [isAuthenticated, location.pathname]);

  // Navigate to saved destination once authentication resolves
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = sessionStorage.getItem('vantage_auth_redirect');
      if (redirectPath) {
        sessionStorage.removeItem('vantage_auth_redirect');
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated]);

  // Bespoke theme-aware Vantage Quantum Orbit loading screen
  if (isLoadingSession) {
    return <WorkspaceLoadingScreen />;
  }

  // Not authenticated: render the login / registration page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Authenticated: render full workspace with Corbel styling and full URL routes
  return (
    <div className="app-container" data-theme={theme}>
      {/* Corbel Ambient Glowing Mesh Background with Floating Orbs */}
      <div className="mesh" aria-hidden="true">
        <i className="mesh__a" />
        <i className="mesh__b" />
        <i className="mesh__c" />
      </div>

      {/* Full-Width Topbar Header */}
      <Topbar onOpenFinder={() => setIsFinderOpen(true)} />

      {/* Main Workspace Body with Left Dock and Content Area */}
      <div className="workspace-body">
        {/* Floating Left Dock Navigation */}
        <Sidebar onOpenFinder={() => setIsFinderOpen(true)} />

        {/* Scrollable View Container with Semantic Routes */}
        <main className="main-content-scrollable">
          <div className="view-transition-wrapper">
            <Routes>
              <Route path="/" element={<Navigate to="/tickets" replace />} />
              <Route path="/tickets" element={<TicketsView />} />
              <Route path="/tickets/board" element={<TicketsView />} />
              <Route path="/tickets/table" element={<TicketsView />} />
              <Route path="/board" element={<Navigate to="/tickets/board" replace />} />
              <Route path="/table" element={<Navigate to="/tickets/table" replace />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/metrics" element={<Navigate to="/analytics" replace />} />
              <Route path="/users" element={<UserManagementView />} />
              <Route path="/team" element={<Navigate to="/users" replace />} />
              <Route path="/task/:taskId" element={<TicketsView />} />
              <Route path="/tasks/:taskId" element={<TicketsView />} />
              <Route path="/tickets/:taskId" element={<TicketsView />} />
              <Route path="/login" element={<Navigate to="/tickets" replace />} />
              <Route path="*" element={<Navigate to="/tickets" replace />} />
            </Routes>
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
