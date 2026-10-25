import React from 'react';
import { Menu, Plus, Search } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from '../common/AppLogo';
import { Avatar } from '../common/Avatar';

export function Topbar({ onOpenFinder }) {
  const { 
    openMobileSidebar, 
    setIsCreateModalOpen, 
    setCreateInitialStage,
    isFirebaseConnected
  } = useTasks();
  const { currentUser } = useAuth();

  return (
    <header className="mobile-header mobile-only" aria-label="Mobile Navigation">
      <div className="mobile-header-left">
        <button 
          type="button" 
          className="mobile-menu-btn" 
          onClick={openMobileSidebar}
          aria-label="Open navigation sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="mobile-brand">
          <AppLogo size={24} />
          <span className="mobile-brand-title">Issue Tracker</span>
        </div>
      </div>

      <div className="mobile-header-right">
        {/* Quick Search */}
        <button 
          type="button" 
          className="mobile-icon-btn" 
          onClick={onOpenFinder}
          aria-label="Quick Search"
        >
          <Search size={18} />
        </button>

        {/* Quick + New Item */}
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

        {/* Avatar */}
        <Avatar user={currentUser} size={28} showTooltip={false} />
      </div>
    </header>
  );
}
export default Topbar;
