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
    openMobileSidebar,
    setIsCreateModalOpen,
    setCreateInitialStage
  } = useTasks();

  const { currentUser } = useAuth();

  return (
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

        <button
          type="button"
          className="mobile-avatar-btn"
          onClick={openMobileSidebar}
          aria-label="Open user profile and navigation"
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Avatar user={currentUser} size={28} showTooltip={false} />
        </button>
      </div>
    </header>
  );
}
export default Topbar;
