import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutGrid, 
  Lightbulb, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  Search, 
  FolderKanban, 
  Sun, 
  Moon, 
  RotateCcw, 
  Cloud, 
  CloudOff,
  LogOut, 
  ChevronDown, 
  Check, 
  ChevronsLeft, 
  ChevronsRight,
  Layers,
  Sparkles,
  X,
  Menu
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { AppLogo } from '../common/AppLogo';

export function Sidebar({ onOpenFinder }) {
  const { 
    activeView, 
    setActiveView,
    visibleTasks,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileSidebarOpen,
    closeMobileSidebar,
    theme,
    toggleTheme,
    setIsProjectManagerOpen,
    resetData,
    isFirebaseConnected,
    syncStatusMessage
  } = useTasks();

  const { currentUser, logout } = useAuth();

  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const projectMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target)) {
        setIsProjectMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target)) {
        setIsSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedProj = projects.find(p => p.id === selectedProjectId);
  const ideationCount = visibleTasks.filter(t => t.status === 'ideation').length;
  const isAdmin = currentUser?.role === 'Admin';

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    if (isMobileSidebarOpen) closeMobileSidebar();
  };

  const handleResetConfirm = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset workspace sample data to defaults? This action cannot be undone.'
    );
    if (confirmed) {
      resetData();
      setIsSettingsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="sidebar-backdrop mobile-only" 
          onClick={closeMobileSidebar}
          aria-hidden="true" 
        />
      )}

      {/* Main Sidenav Container */}
      <aside 
        className={`jira-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
        aria-label="Workspace Navigation"
      >
        {/* Top Header: Brand & Workspace */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => handleNavClick('tickets')}>
            <AppLogo size={28} />
            {!isSidebarCollapsed && (
              <div className="brand-text-wrap">
                <span className="brand-name">Issue Tracker</span>
                <span className="brand-badge">Enterprise</span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button 
            type="button" 
            className="sidebar-mobile-close-btn mobile-only"
            onClick={closeMobileSidebar}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Project Selector Dropdown */}
        <div className="sidebar-project-selector" ref={projectMenuRef}>
          <button
            type="button"
            className="sidebar-project-btn"
            onClick={() => setIsProjectMenuOpen(prev => !prev)}
            title={selectedProj ? `Active Project: ${selectedProj.name}` : 'All Projects'}
          >
            <span 
              className="sidebar-project-dot" 
              style={{ backgroundColor: selectedProj ? (selectedProj.color || 'var(--sky)') : 'var(--mint)' }} 
            />
            {!isSidebarCollapsed && (
              <>
                <span className="sidebar-project-label">
                  {selectedProj ? selectedProj.name : 'All Projects'}
                </span>
                <ChevronDown size={12} className={`project-chev ${isProjectMenuOpen ? 'open' : ''}`} />
              </>
            )}
          </button>

          {/* Project Dropdown Popover */}
          {isProjectMenuOpen && (
            <div className="sidebar-project-popover">
              <div className="project-popover-title">Filter by Project</div>
              <button
                type="button"
                className={`project-popover-item ${selectedProjectId === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedProjectId('all');
                  setIsProjectMenuOpen(false);
                }}
              >
                <Layers size={14} />
                <span>All Projects</span>
                {selectedProjectId === 'all' && <Check size={14} className="check-icon" />}
              </button>
              {projects.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`project-popover-item ${selectedProjectId === p.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setIsProjectMenuOpen(false);
                  }}
                >
                  <span className="sidebar-project-dot" style={{ backgroundColor: p.color || 'var(--sky)' }} />
                  <span className="project-title-text">{p.name}</span>
                  {selectedProjectId === p.id && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">{!isSidebarCollapsed && 'Planning'}</div>

          {/* Tickets (Board & Table) */}
          <button
            type="button"
            className={`nav-item ${(activeView === 'tickets' || activeView === 'kanban' || activeView === 'list' || activeView === 'table') ? 'active' : ''}`}
            onClick={() => handleNavClick('tickets')}
            title="Tickets (Kanban Board & Table)"
          >
            <LayoutGrid size={18} className="nav-icon" />
            {!isSidebarCollapsed && (
              <>
                <span className="nav-label">Tickets</span>
                <span className="nav-count">{visibleTasks.length}</span>
              </>
            )}
          </button>

          {/* Ideation */}
          <button
            type="button"
            className={`nav-item ${activeView === 'ideation' ? 'active' : ''}`}
            onClick={() => handleNavClick('ideation')}
            title="Ideation & Discovery Hub"
          >
            <Lightbulb size={18} className="nav-icon" />
            {!isSidebarCollapsed && (
              <>
                <span className="nav-label">Ideation</span>
                {ideationCount > 0 && <span className="nav-count">{ideationCount}</span>}
              </>
            )}
          </button>

          {/* Metrics */}
          <button
            type="button"
            className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavClick('analytics')}
            title="Metrics & Health Dashboard"
          >
            <BarChart3 size={18} className="nav-icon" />
            {!isSidebarCollapsed && <span className="nav-label">Metrics</span>}
          </button>

          {/* User Management - ONLY FOR ADMINS */}
          {isAdmin && (
            <>
              <div className="nav-group-label" style={{ marginTop: 12 }}>
                {!isSidebarCollapsed && 'Administration'}
              </div>
              <button
                type="button"
                className={`nav-item ${activeView === 'users' ? 'active' : ''}`}
                onClick={() => handleNavClick('users')}
                title="User Management & Role Permissions (Admin Only)"
              >
                <ShieldCheck size={18} className="nav-icon" color="var(--sky)" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="nav-label">User Management</span>
                    <span className="nav-admin-badge">Admin</span>
                  </>
                )}
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer Utilities */}
        <div className="sidebar-footer">
          {/* Quick Search */}
          <button
            type="button"
            className="sidebar-util-btn"
            onClick={onOpenFinder}
            title="Quick Search (⌘K)"
          >
            <Search size={16} />
            {!isSidebarCollapsed && (
              <>
                <span>Quick Search</span>
                <kbd className="sidebar-kbd">⌘K</kbd>
              </>
            )}
          </button>

          {/* Settings Submenu (⚙️) */}
          <div className="settings-submenu-wrap" ref={settingsMenuRef}>
            <button
              type="button"
              className={`sidebar-util-btn ${isSettingsMenuOpen ? 'active' : ''}`}
              onClick={() => setIsSettingsMenuOpen(prev => !prev)}
              title="Workspace Settings"
            >
              <Settings size={16} />
              {!isSidebarCollapsed && (
                <>
                  <span>Settings</span>
                  <ChevronDown size={12} className={`settings-chev ${isSettingsMenuOpen ? 'open' : ''}`} />
                </>
              )}
            </button>

            {/* Settings Popover Submenu */}
            {isSettingsMenuOpen && (
              <div className="settings-popover-menu">
                <div className="settings-popover-header">Workspace Settings</div>

                {/* Manage Projects */}
                <button
                  type="button"
                  className="settings-popover-item"
                  onClick={() => {
                    setIsSettingsMenuOpen(false);
                    setIsProjectManagerOpen(true);
                  }}
                  title="Configure project classifications & team scopes"
                >
                  <FolderKanban size={15} color="var(--sky)" />
                  <div className="settings-item-text">
                    <span className="settings-item-title">Manage Projects</span>
                    <span className="settings-item-desc">Classifications & members</span>
                  </div>
                </button>

                {/* Toggle Theme (Light / Dark) */}
                <button
                  type="button"
                  className="settings-popover-item"
                  onClick={() => {
                    toggleTheme();
                    setIsSettingsMenuOpen(false);
                  }}
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={15} color="var(--lemon)" /> : <Moon size={15} color="#a78bfa" />}
                  <div className="settings-item-text">
                    <span className="settings-item-title">Theme</span>
                    <span className="settings-item-desc">
                      Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                </button>

                {/* Reset Workspace Sample Data */}
                <button
                  type="button"
                  className="settings-popover-item"
                  onClick={handleResetConfirm}
                  title="Reset tasks and projects to defaults"
                >
                  <RotateCcw size={15} color="var(--type-loophole)" />
                  <div className="settings-item-text">
                    <span className="settings-item-title">Reset Workspace Data</span>
                    <span className="settings-item-desc">Restore initial demo state</span>
                  </div>
                </button>

                {/* Live Sync Status */}
                <div className="settings-sync-status" title={syncStatusMessage}>
                  {isFirebaseConnected ? (
                    <Cloud size={13} color="var(--mint)" />
                  ) : (
                    <CloudOff size={13} color="var(--muted)" />
                  )}
                  <span>{isFirebaseConnected ? 'Cloud Firestore Synced' : 'Local Storage Mode'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Current User Profile Card */}
          <div className="sidebar-profile-card">
            <Avatar user={currentUser} size={30} showTooltip={false} />
            {!isSidebarCollapsed && (
              <div className="profile-text-wrap">
                <span className="profile-user-name">{currentUser.name}</span>
                <span className={`pill ${currentUser.role === 'Admin' ? 'pill--sky' : currentUser.role === 'Lead' ? 'pill--purple' : 'pill--mint'} profile-role-pill`}>
                  {currentUser.role || 'Employee'}
                </span>
              </div>
            )}
            <button
              type="button"
              className="sidebar-logout-icon-btn"
              onClick={logout}
              title={`Sign out (${currentUser.name})`}
            >
              <LogOut size={15} />
            </button>
          </div>

          {/* Desktop Collapse / Expand Rail Toggle */}
          <button
            type="button"
            className="sidebar-collapse-toggle desktop-only"
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar to rail'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;
