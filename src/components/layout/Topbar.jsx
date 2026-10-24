import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  LogOut, 
  Layers, 
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Search,
  Check
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function Topbar({ onOpenFinder }) {
  const { 
    activeView, 
    setActiveView,
    visibleTasks,
    projects, 
    selectedProjectId,
    setSelectedProjectId,
    setIsCreateModalOpen,
    setCreateInitialStage,
    isFirebaseConnected,
    syncStatusMessage
  } = useTasks();

  const { currentUser, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  
  const profileRef = useRef(null);
  const projectRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (projectRef.current && !projectRef.current.contains(e.target)) {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedProj = projects.find(p => p.id === selectedProjectId);

  const loopholesCount = visibleTasks.filter(t => t.type === 'loophole' && t.status !== 'done').length;
  const ideationCount = visibleTasks.filter(t => t.status === 'ideation').length;

  const navTabs = [
    { id: 'kanban', label: 'Board', count: visibleTasks.length },
    { id: 'list', label: 'List' },
    { id: 'ideation', label: 'Ideation', count: ideationCount > 0 ? ideationCount : null },
    { id: 'table', label: 'Table' },
    { id: 'analytics', label: 'Metrics' }
  ];

  return (
    <header className="top">
      {/* Brand & Project Selector */}
      <div className="brand-wrap">
        <div className="brand" title="InnovateX Enhancements & Loopholes">
          <span className="brand__mark">
            <ShieldCheck size={18} />
          </span>
          <span className="brand__txt">
            <b>InnovateX</b>
            <small>Enhancements &amp; Loopholes</small>
          </span>
        </div>

        {/* Project Selector Chip */}
        <div className="project-selector-wrap" ref={projectRef}>
          <button 
            className="project-selector-btn"
            onClick={() => setIsProjectMenuOpen(prev => !prev)}
            title="Filter by Project"
          >
            <span 
              className="project-dot" 
              style={{ backgroundColor: selectedProj ? (selectedProj.color || 'var(--sky)') : 'var(--mint)' }} 
            />
            <span className="project-name-label">
              {selectedProj ? selectedProj.name : 'All Projects'}
            </span>
            <ChevronDown size={12} className={`chev-icon ${isProjectMenuOpen ? 'open' : ''}`} />
          </button>

          {isProjectMenuOpen && (
            <div className="project-dropdown-popover">
              <div className="project-dropdown-header">Filter by Project</div>
              <button
                className={`project-dropdown-item ${selectedProjectId === 'all' ? 'active' : ''}`}
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
                  className={`project-dropdown-item ${selectedProjectId === p.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setIsProjectMenuOpen(false);
                  }}
                >
                  <span className="project-dot" style={{ backgroundColor: p.color || 'var(--sky)' }} />
                  <span className="project-title-text">{p.name}</span>
                  {selectedProjectId === p.id && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Corbel Pill Tabs Navigation */}
      <nav className="tabs" aria-label="Primary View Navigation">
        <div className="tabs__track">
          {navTabs.map(tab => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                className={`tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveView(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count !== null && (
                  <span className="tab__count">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Right Tools: Live Sync, New Item, Single Profile Dropdown */}
      <div className="top__tools">
        {/* Minimal Corbel Live Sync Pulse */}
        <div className="live" title={syncStatusMessage}>
          <span className="live__dot" aria-hidden="true" />
          <span className="live__label">{isFirebaseConnected ? 'Cloud Synced' : 'Local Synced'}</span>
        </div>

        {/* Primary "+ New Item" Button */}
        <button
          className="btn btn--primary"
          onClick={() => {
            setCreateInitialStage('ideation');
            setIsCreateModalOpen(true);
          }}
          title="Create New Enhancement or Loophole"
        >
          <Plus size={15} />
          <span className="new-btn-label">New Item</span>
        </button>

        {/* Single User Profile Avatar (.me) with Dropdown */}
        <div className="me-wrap" ref={profileRef}>
          <button 
            className="me" 
            onClick={() => setIsProfileOpen(prev => !prev)}
            aria-label={`Profile: ${currentUser.name}`}
            title={`Signed in as ${currentUser.name} (${currentUser.role})`}
          >
            <Avatar user={currentUser} size={34} showTooltip={false} />
          </button>

          {isProfileOpen && (
            <div className="profile-popover" role="dialog" aria-label="Account details">
              <div className="profile-popover-header">
                <Avatar user={currentUser} size={40} showTooltip={false} />
                <div className="profile-meta">
                  <div className="profile-name">{currentUser.name}</div>
                  <div className="profile-role">{currentUser.role}</div>
                  <div className="profile-email">{currentUser.email || `${currentUser.username || 'user'}@innovatex.internal`}</div>
                </div>
              </div>

              <div className="profile-popover-status">
                <span className="pill pill--mint" style={{ height: 22, fontSize: 11 }}>
                  Enterprise Session Active
                </span>
              </div>

              <div className="profile-popover-footer">
                <button 
                  className="profile-logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  title="Sign out of workspace"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default Topbar;
