import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  LayoutGrid, 
  Lightbulb, 
  Table, 
  BarChart3, 
  FolderKanban, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export function FinderModal({ isOpen, onClose }) {
  const { 
    visibleTasks, 
    projects, 
    setActiveView, 
    setSelectedProjectId, 
    setSelectedTaskId 
  } = useTasks();
  const { currentUser } = useAuth();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global shortcut: ⌘K or Ctrl+K to toggle, ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const viewOptions = [
    { type: 'view', id: 'tickets', title: 'Tickets (Board & Table)', icon: LayoutGrid, desc: 'Manage sprint workflow and backlog' },
    { type: 'view', id: 'ideation', title: 'Ideation Hub', icon: Lightbulb, desc: 'Brainstorm & capture loopholes' },
    { type: 'view', id: 'analytics', title: 'Metrics & Health', icon: BarChart3, desc: 'Resolution metrics & velocity' },
    ...(currentUser?.role === 'Admin' ? [
      { type: 'view', id: 'users', title: 'User Management', icon: ShieldCheck, desc: 'Manage workspace members & roles' }
    ] : [])
  ];

  const filteredViews = viewOptions.filter(v => 
    v.title.toLowerCase().includes(query.toLowerCase()) || 
    v.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = visibleTasks.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(query.toLowerCase())) ||
    t.type.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const allHits = [
    ...filteredViews.map(v => ({ kind: 'view', data: v })),
    ...filteredTasks.map(t => ({ kind: 'task', data: t }))
  ];

  const handleSelectHit = (hit) => {
    if (hit.kind === 'view') {
      setActiveView(hit.data.id);
    } else if (hit.kind === 'task') {
      setSelectedTaskId(hit.data.id);
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, allHits.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allHits.length) % Math.max(1, allHits.length));
    } else if (e.key === 'Enter' && allHits[selectedIndex]) {
      e.preventDefault();
      handleSelectHit(allHits[selectedIndex]);
    }
  };

  return (
    <div className="finder-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="finder-box" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="finder-field">
          <Search size={18} className="finder-search-icon" />
          <input 
            ref={inputRef}
            type="text"
            className="finder-input"
            placeholder="Search items, jump to views, or filter..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="finder-kbd-wrap">
            <kbd>ESC</kbd>
          </div>
        </div>

        <div className="finder-list">
          {filteredViews.length > 0 && (
            <div className="finder-group">
              <span className="finder-group-title">Navigation Views</span>
              {filteredViews.map((v, i) => {
                const Icon = v.icon;
                const hitIndex = i;
                const isSelected = selectedIndex === hitIndex;
                return (
                  <div 
                    key={v.id}
                    className={`finder-hit ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectHit({ kind: 'view', data: v })}
                    onMouseEnter={() => setSelectedIndex(hitIndex)}
                  >
                    <div className="finder-hit-icon">
                      <Icon size={16} />
                    </div>
                    <div className="finder-hit-text">
                      <div className="finder-hit-title">{v.title}</div>
                      <div className="finder-hit-sub">{v.desc}</div>
                    </div>
                    <ArrowRight size={14} className="finder-hit-arrow" />
                  </div>
                );
              })}
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="finder-group">
              <span className="finder-group-title">Enhancements &amp; Loopholes</span>
              {filteredTasks.map((t, i) => {
                const hitIndex = filteredViews.length + i;
                const isSelected = selectedIndex === hitIndex;
                const project = projects.find(p => p.id === t.projectId);
                return (
                  <div 
                    key={t.id}
                    className={`finder-hit ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectHit({ kind: 'task', data: t })}
                    onMouseEnter={() => setSelectedIndex(hitIndex)}
                  >
                    <div className="finder-hit-icon" style={{
                      backgroundColor: t.type === 'loophole' ? 'var(--coral-soft)' : 'var(--mint-soft)',
                      color: t.type === 'loophole' ? 'var(--coral)' : 'var(--mint)'
                    }}>
                      {t.type === 'loophole' ? <ShieldAlert size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className="finder-hit-text">
                      <div className="finder-hit-title">{t.title}</div>
                      <div className="finder-hit-sub">
                        {project?.name || 'General'} &bull; Stage: {t.status} &bull; Priority: {t.priority}
                      </div>
                    </div>
                    <span className={`pill pill--${t.type === 'loophole' ? 'coral' : 'mint'}`} style={{ height: 20, fontSize: 10 }}>
                      {t.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {allHits.length === 0 && (
            <div className="finder-empty">
              No matching items or views found for "<b>{query}</b>"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default FinderModal;
