import React from 'react';
import { 
  Search, 
  FolderPlus, 
  Sun, 
  Moon, 
  LogOut,
  FolderKanban
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ onOpenFinder }) {
  const { 
    theme, 
    toggleTheme, 
    setIsProjectManagerOpen,
    projects
  } = useTasks();

  const { logout, currentUser } = useAuth();

  return (
    <nav className="dock" aria-label="Workspace Tools">
      {/* Search / Command Finder */}
      <button 
        className="dock__btn" 
        type="button" 
        onClick={onOpenFinder}
        aria-label="Quick Search (⌘K)"
        title="Search items & views (⌘K)"
      >
        <Search size={18} />
        <span className="dock__tip">Search <kbd>⌘K</kbd></span>
      </button>

      <span className="dock__sep" aria-hidden="true" />

      {/* Projects Manager & Settings Modal */}
      <button 
        className="dock__btn" 
        type="button" 
        onClick={() => setIsProjectManagerOpen(true)}
        aria-label="Manage Projects"
        title="Manage Projects & Data"
      >
        <FolderKanban size={18} />
        <span className="dock__tip">Projects &amp; Settings</span>
      </button>

      {/* Theme Toggle (Dark / Light) */}
      <button 
        className="dock__btn" 
        type="button" 
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        <span className="dock__tip">Theme</span>
      </button>

      <span className="dock__sep" aria-hidden="true" />

      {/* Quick Sign Out */}
      <button 
        className="dock__btn" 
        type="button" 
        onClick={logout}
        aria-label="Sign out"
        title={`Sign out (${currentUser.name})`}
      >
        <LogOut size={17} />
        <span className="dock__tip">Sign Out</span>
      </button>
    </nav>
  );
}
export default Sidebar;
