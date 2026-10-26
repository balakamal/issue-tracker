import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutGrid, 
  BarChart3, 
  Users, 
  Search, 
  Settings, 
  RotateCcw, 
  Cloud, 
  CloudOff,
  FolderKanban,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from '../common/AppLogo';
import { Avatar } from '../common/Avatar';

export function Sidebar({ onOpenFinder }) {
  const { 
    activeView, 
    setActiveView,
    visibleTasks,
    setIsProjectManagerOpen,
    resetData,
    isFirebaseConnected,
    syncStatusMessage,
    theme,
    toggleTheme
  } = useTasks();

  const { currentUser, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isAdmin = currentUser?.role === 'Admin';

  const handleResetConfirm = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset workspace sample data to defaults? This action cannot be undone.'
    );
    if (confirmed) {
      resetData();
      setIsSettingsOpen(false);
    }
  };

  return (
    <nav className="dock desktop-only" aria-label="Workspace navigation">
      {/* 1. App Logo / Branding at Top of Sidenav */}
      <button 
        type="button" 
        className="dock__btn dock__brand"
        onClick={() => setActiveView('tickets')}
        aria-label="Issue Tracker"
      >
        <AppLogo size={26} />
        <span className="dock__tip">Issue Tracker <kbd>Enterprise</kbd></span>
      </button>

      <span className="dock__sep" aria-hidden="true" />

      {/* 2. Tickets View */}
      <button 
        className={`dock__btn ${(activeView === 'tickets' || activeView === 'kanban' || activeView === 'list' || activeView === 'table') ? 'active' : ''}`}
        type="button" 
        onClick={() => setActiveView('tickets')}
        aria-label="Tickets"
      >
        <LayoutGrid size={18} />
        <span className="dock__tip">Tickets Backlog</span>
      </button>

      {/* 3. Metrics View */}
      <button 
        className={`dock__btn ${activeView === 'analytics' ? 'active' : ''}`}
        type="button" 
        onClick={() => setActiveView('analytics')}
        aria-label="Metrics & Analytics"
      >
        <BarChart3 size={18} />
        <span className="dock__tip">Metrics & Analytics</span>
      </button>

      {/* 4. User Management View (Admin Only) */}
      {isAdmin && (
        <button 
          className={`dock__btn ${activeView === 'users' ? 'active' : ''}`}
          type="button" 
          onClick={() => setActiveView('users')}
          aria-label="User Management"
        >
          <Users size={18} color="var(--sky)" />
          <span className="dock__tip">User Management <kbd>Admin</kbd></span>
        </button>
      )}

      <span className="dock__sep" aria-hidden="true" />

      {/* 5. Quick Search (⌘K) */}
      <button 
        className="dock__btn" 
        type="button" 
        onClick={onOpenFinder}
        aria-label="Search (⌘K)"
      >
        <Search size={18} />
        <span className="dock__tip">Search <kbd>⌘K</kbd></span>
      </button>

      {/* 6. Settings Submenu (⚙️) */}
      <div className="dock-popover-wrap" ref={settingsRef}>
        <button 
          className={`dock__btn ${isSettingsOpen ? 'active' : ''}`}
          type="button" 
          onClick={() => {
            setIsSettingsOpen(prev => !prev);
            setIsProfileOpen(false);
          }}
          aria-label="Settings"
        >
          <Settings size={18} />
          <span className="dock__tip">Workspace Settings</span>
        </button>

        {isSettingsOpen && (
          <div className="dock-popover">
            <div className="dock-popover-title">Workspace Settings</div>
            
            <button
              type="button"
              className="dock-popover-item"
              onClick={() => {
                setIsProjectManagerOpen(true);
                setIsSettingsOpen(false);
              }}
            >
              <FolderKanban size={14} />
              <span>Manage Projects</span>
            </button>

            <div className="dock-popover-sep" />
            
            <div className="dock-sync-status">
              {isFirebaseConnected ? (
                <span className="dock-sync-pill connected">
                  <Cloud size={12} />
                  <span>Realtime Sync</span>
                </span>
              ) : (
                <span className="dock-sync-pill local">
                  <CloudOff size={12} />
                  <span>Local Mode</span>
                </span>
              )}
              <span className="dock-sync-detail">{syncStatusMessage}</span>
            </div>
          </div>
        )}
      </div>

      <span className="dock__sep" aria-hidden="true" />

      {/* 7. Profile Avatar at Bottom of Sidenav */}
      <div className="dock-popover-wrap" ref={profileRef}>
        <button
          type="button"
          className={`dock__btn dock__profile-btn ${isProfileOpen ? 'active' : ''}`}
          onClick={() => {
            setIsProfileOpen(prev => !prev);
            setIsSettingsOpen(false);
          }}
          aria-label="Your Profile"
        >
          <Avatar user={currentUser} size={30} showTooltip={false} />
          <span className="dock__tip">
            {currentUser?.name || 'Profile'} <kbd>{currentUser?.role || 'Member'}</kbd>
          </span>
        </button>

        {/* Profile Popover opening to the right of the dock */}
        {isProfileOpen && (
          <div className="dock-profile-popover">
            {/* Header: User Info */}
            <div className="profile-popover-header">
              <Avatar user={currentUser} size={40} showTooltip={false} />
              <div className="profile-popover-info">
                <b>{currentUser?.name || 'Workspace User'}</b>
                <small>{currentUser?.email}</small>
                <span className="profile-role-badge">
                  {currentUser?.role || 'Member'}
                </span>
              </div>
            </div>

            <div className="profile-popover-sep" />

            {/* Appearance / Theme Switcher */}
            <div className="profile-theme-section">
              <div className="profile-theme-label">
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                <span>Theme</span>
              </div>
              <div className="profile-theme-toggle">
                <button
                  type="button"
                  className={`profile-theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={(e) => { if (theme !== 'light') toggleTheme(e); }}
                >
                  <Sun size={12} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`profile-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={(e) => { if (theme !== 'dark') toggleTheme(e); }}
                >
                  <Moon size={12} />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            <div className="profile-popover-sep" />

            {/* Cloud Sync Status */}
            <div className="profile-sync-row">
              <span 
                className="live__dot" 
                style={{ 
                  background: isFirebaseConnected ? 'var(--mint)' : 'var(--lemon)',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  display: 'inline-block'
                }} 
              />
              <span className="profile-sync-txt">
                {isFirebaseConnected ? 'Cloud Sync Active' : 'Local Storage Mode'}
              </span>
            </div>

            <div className="profile-popover-sep" />

            {/* Log Out */}
            <button
              type="button"
              className="profile-logout-btn"
              onClick={() => {
                logout();
                setIsProfileOpen(false);
              }}
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
export default Sidebar;
