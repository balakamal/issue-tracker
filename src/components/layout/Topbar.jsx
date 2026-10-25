import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  LogOut, 
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from '../common/AppLogo';
import { Avatar } from '../common/Avatar';

export function Topbar({ onOpenFinder }) {
  const { 
    isFirebaseConnected,
    syncStatusMessage,
    openMobileSidebar,
    setIsCreateModalOpen,
    setCreateInitialStage,
    theme,
    toggleTheme
  } = useTasks();

  const { currentUser, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <>
      {/* Mobile Topbar */}
      <header className="mobile-header mobile-only" aria-label="Mobile Navigation">
        <div className="mobile-header-left">
          <button 
            type="button" 
            className="mobile-menu-btn" 
            onClick={openMobileSidebar}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="mobile-brand">
            <AppLogo size={24} />
            <span className="mobile-brand-title">Issue Tracker</span>
          </div>
        </div>

        <div className="mobile-header-right">
          <button 
            type="button" 
            className="mobile-icon-btn" 
            onClick={onOpenFinder}
            aria-label="Quick Search"
          >
            <Search size={18} />
          </button>

          <button 
            type="button" 
            className="mobile-create-btn" 
            onClick={() => {
              setCreateInitialStage('ideation');
              setIsCreateModalOpen(true);
            }}
            aria-label="Create item"
          >
            <Plus size={16} />
          </button>

          <Avatar user={currentUser} size={28} showTooltip={false} />
        </div>
      </header>

      {/* Desktop Topbar Header: Branding Truly at Top-Left, Profile Truly at Top-Right */}
      <header className="top desktop-only" aria-label="Global Header">
        {/* Top Left: Clean Branding */}
        <div className="brand-wrap">
          <div className="brand">
            <span className="brand__mark">
              <AppLogo size={22} />
            </span>
            <span className="brand__txt">
              <b>Issue Tracker</b>
              <small>Enterprise Workspace</small>
            </span>
          </div>
        </div>

        {/* Top Right: Cloud Sync & Single User Profile */}
        <div className="top__tools">
          {/* Cloud Sync Status */}
          <div 
            className="sync-chip" 
            title={syncStatusMessage} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--glass-2)',
              padding: '6px 12px',
              borderRadius: 'var(--r-pill)',
              boxShadow: 'inset 0 0 0 1px var(--rim)'
            }}
          >
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
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--muted)' }}>
              {isFirebaseConnected ? 'Cloud Sync' : 'Local Cache'}
            </span>
          </div>

          {/* Single User Profile Avatar (.me) with Popover */}
          <div className="me-wrap" ref={profileMenuRef}>
            <button 
              type="button" 
              className="me" 
              onClick={() => setIsProfileMenuOpen(prev => !prev)}
              aria-label="Your profile"
            >
              <Avatar user={currentUser} size={36} showTooltip={false} />
            </button>

            {/* Polished Profile Popover with Theming & Logout */}
            {isProfileMenuOpen && (
              <div className="profile-dropdown-popover">
                {/* User Identity */}
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
                      onClick={() => { if (theme !== 'light') toggleTheme(); }}
                    >
                      <Sun size={12} />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      className={`profile-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                    >
                      <Moon size={12} />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="profile-popover-sep" />

                {/* Log Out Button */}
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
export default Topbar;
