import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutGrid, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  Settings, 
  RotateCcw, 
  Cloud, 
  CloudOff,
  FolderKanban
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ onOpenFinder }) {
  const { 
    activeView, 
    setActiveView,
    visibleTasks,
    setIsProjectManagerOpen,
    resetData,
    isFirebaseConnected,
    syncStatusMessage
  } = useTasks();

  const { currentUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
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
      {/* 1. Tickets View */}
      <button 
        className={`dock__btn ${(activeView === 'tickets' || activeView === 'kanban' || activeView === 'list' || activeView === 'table') ? 'active' : ''}`}
        type="button" 
        onClick={() => setActiveView('tickets')}
        aria-label="Tickets"
      >
        <LayoutGrid size={18} />
        {visibleTasks.length > 0 && (
          <span className="dock__count">{visibleTasks.length}</span>
        )}
        <span className="dock__tip">Tickets Backlog</span>
      </button>

      {/* 2. Metrics View */}
      <button 
        className={`dock__btn ${activeView === 'analytics' ? 'active' : ''}`}
        type="button" 
        onClick={() => setActiveView('analytics')}
        aria-label="Metrics & Analytics"
      >
        <BarChart3 size={18} />
        <span className="dock__tip">Metrics & Analytics</span>
      </button>

      {/* 3. User Management View (Admin Only) */}
      {isAdmin && (
        <button 
          className={`dock__btn ${activeView === 'users' ? 'active' : ''}`}
          type="button" 
          onClick={() => setActiveView('users')}
          aria-label="User Management"
        >
          <ShieldCheck size={18} color="var(--sky)" />
          <span className="dock__tip">User Management <kbd>Admin</kbd></span>
        </button>
      )}

      <span className="dock__sep" aria-hidden="true" />

      {/* 4. Quick Search (⌘K) */}
      <button 
        className="dock__btn" 
        type="button" 
        onClick={onOpenFinder}
        aria-label="Search (⌘K)"
      >
        <Search size={18} />
        <span className="dock__tip">Search <kbd>⌘K</kbd></span>
      </button>

      {/* 5. Settings Submenu (⚙️) */}
      <div className="dock-popover-wrap" ref={settingsRef}>
        <button 
          className={`dock__btn ${isSettingsOpen ? 'active' : ''}`}
          type="button" 
          onClick={() => setIsSettingsOpen(prev => !prev)}
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

            <button
              type="button"
              className="dock-popover-item text-danger"
              onClick={handleResetConfirm}
            >
              <RotateCcw size={14} />
              <span>Reset Sample Data</span>
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
    </nav>
  );
}
export default Sidebar;
