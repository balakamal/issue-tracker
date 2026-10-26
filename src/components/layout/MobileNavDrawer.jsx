import React, { useState, useEffect } from 'react';
import { 
  X, 
  LayoutGrid, 
  BarChart3, 
  Users, 
  FolderKanban, 
  Search, 
  Sun, 
  Moon, 
  RotateCcw, 
  LogOut 
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from '../common/AppLogo';
import { Avatar } from '../common/Avatar';

export function MobileNavDrawer({ onOpenFinder }) {
  const {
    isMobileSidebarOpen,
    closeMobileSidebar,
    activeView,
    setActiveView,
    setIsProjectManagerOpen,
    theme,
    toggleTheme,
    resetData
  } = useTasks();

  const { currentUser, logout } = useAuth();
  const [isRendered, setIsRendered] = useState(isMobileSidebarOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isMobileSidebarOpen, isRendered]);

  if (!isRendered) return null;

  const isAdmin = currentUser?.role === 'Admin';

  const handleClose = () => {
    if (isClosing) return;
    closeMobileSidebar();
  };

  const handleNav = (viewId) => {
    setActiveView(viewId);
    handleClose();
  };

  const handleOpenProjects = () => {
    setIsProjectManagerOpen(true);
    handleClose();
  };

  const handleSearch = () => {
    if (onOpenFinder) onOpenFinder();
    handleClose();
  };

  const handleResetConfirm = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset workspace sample data to defaults? This action cannot be undone.'
    );
    if (confirmed) {
      resetData();
      handleClose();
    }
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <div 
      className={`mobile-drawer-overlay mobile-only ${isClosing ? 'mobile-drawer-closing' : ''}`} 
      onClick={handleClose} 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className={`mobile-drawer-container ${isClosing ? 'mobile-drawer-closing' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <AppLogo size={24} />
            <span className="mobile-drawer-brand-title">
              Issue Tracker
            </span>
          </div>

          <button 
            type="button" 
            className="mobile-drawer-close-btn" 
            onClick={handleClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="mobile-drawer-user-card">
          <Avatar user={currentUser} size={40} showTooltip={false} />
          <div className="mobile-drawer-user-info">
            <span className="mobile-drawer-user-name">{currentUser?.name || 'User'}</span>
            <span className="mobile-drawer-user-email">{currentUser?.email || ''}</span>
            <span className="mobile-drawer-user-role">{currentUser?.role || 'Member'}</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="mobile-drawer-section">
          <span className="mobile-drawer-section-title">Views</span>

          <button
            type="button"
            className={`mobile-drawer-item ${activeView === 'tickets' ? 'active' : ''}`}
            onClick={() => handleNav('tickets')}
          >
            <LayoutGrid size={17} />
            <span>Tickets Backlog</span>
          </button>

          <button
            type="button"
            className={`mobile-drawer-item ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNav('analytics')}
          >
            <BarChart3 size={17} />
            <span>Metrics & Analytics</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className={`mobile-drawer-item ${activeView === 'users' ? 'active' : ''}`}
              onClick={() => handleNav('users')}
            >
              <Users size={17} />
              <span>User Management</span>
            </button>
          )}
        </div>

        <div className="mobile-drawer-section">
          <span className="mobile-drawer-section-title">Workspace</span>

          <button
            type="button"
            className="mobile-drawer-item"
            onClick={handleOpenProjects}
          >
            <FolderKanban size={17} />
            <span>Manage Projects</span>
          </button>

          <button
            type="button"
            className="mobile-drawer-item"
            onClick={handleSearch}
          >
            <Search size={17} />
            <span>Quick Finder (⌘K)</span>
          </button>
        </div>

        {/* Drawer Footer with Theme & Logout */}
        <div className="mobile-drawer-footer">
          <button 
            type="button" 
            className="mobile-theme-toggle"
            onClick={(e) => toggleTheme(e)}
          >
            <span>Theme Mode</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className="mobile-drawer-item"
              onClick={handleResetConfirm}
              style={{ color: 'var(--type-loophole)' }}
            >
              <RotateCcw size={16} />
              <span>Reset Sample Data</span>
            </button>
          )}

          <button
            type="button"
            className="mobile-drawer-item"
            onClick={handleLogout}
            style={{ color: 'var(--type-loophole)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export default MobileNavDrawer;
