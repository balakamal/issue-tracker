import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  LayoutGrid, 
  Table as TableIcon, 
  User, 
  UserCheck, 
  ChevronDown, 
  Check, 
  Layers, 
  X, 
  Flame,
  FolderKanban
} from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export function TicketsToolbar() {
  const { 
    visibleTasks, 
    projects, 
    selectedProjectId, 
    setSelectedProjectId,
    filterPriority, 
    setFilterPriority, 
    filterStage, 
    setFilterStage, 
    quickFilters, 
    toggleQuickFilter, 
    resetFilters, 
    activeFiltersCount, 
    searchQuery, 
    setSearchQuery, 
    ticketsViewMode, 
    setTicketsViewMode, 
    setIsCreateModalOpen, 
    setCreateInitialStage,
    setIsProjectManagerOpen
  } = useTasks();

  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const projectMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target)) {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedProj = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="tickets-toolbar-single">
      {/* Left: Interactive Context Breadcrumb (Projects / [Dropdown] / Tickets) */}
      <div className="tickets-toolbar-left">
        <div className="tickets-breadcrumb" ref={projectMenuRef}>
          <span className="breadcrumb-root">Projects</span>
          <span className="breadcrumb-sep">/</span>

          {/* Interactive Project Switcher Dropdown inside Breadcrumb */}
          <div className="breadcrumb-project-wrap">
            <button
              type="button"
              className="breadcrumb-project-btn"
              onClick={() => setIsProjectMenuOpen(prev => !prev)}
              title="Click to switch active project"
            >
              <span 
                className="project-dot-mini" 
                style={{ backgroundColor: selectedProj ? (selectedProj.color || 'var(--sky)') : 'var(--mint)' }} 
              />
              <span className="breadcrumb-project-name">
                {selectedProj ? selectedProj.name : 'All Projects'}
              </span>
              <ChevronDown size={12} className={`breadcrumb-chev ${isProjectMenuOpen ? 'open' : ''}`} />
            </button>

            {/* Project Switcher Popover */}
            {isProjectMenuOpen && (
              <div className="breadcrumb-project-popover">
                <div className="breadcrumb-popover-title">Filter by Project</div>
                
                <button
                  type="button"
                  className={`breadcrumb-popover-item ${selectedProjectId === 'all' ? 'active' : ''}`}
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
                    className={`breadcrumb-popover-item ${selectedProjectId === p.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedProjectId(p.id);
                      setIsProjectMenuOpen(false);
                    }}
                  >
                    <span className="project-dot-mini" style={{ backgroundColor: p.color || 'var(--sky)' }} />
                    <span className="project-title-text">{p.name}</span>
                    {selectedProjectId === p.id && <Check size={14} className="check-icon" />}
                  </button>
                ))}

                <div className="breadcrumb-popover-sep" />
                <button
                  type="button"
                  className="breadcrumb-popover-action"
                  onClick={() => {
                    setIsProjectManagerOpen(true);
                    setIsProjectMenuOpen(false);
                  }}
                >
                  <FolderKanban size={13} style={{ marginRight: 6 }} />
                  <span>Manage Projects...</span>
                </button>
              </div>
            )}
          </div>

          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Tickets</span>
        </div>

        <span className="tickets-counter-badge">
          {visibleTasks.length} {visibleTasks.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Middle & Right: Compact View Switcher, Search, Quick Filters & Actions */}
      <div className="tickets-toolbar-right">
        {/* View Mode Toggle: Table vs Board */}
        <div className="view-mode-toggle" role="group" aria-label="View Mode">
          <button 
            type="button"
            className={`view-mode-btn ${ticketsViewMode === 'table' ? 'active' : ''}`}
            onClick={() => setTicketsViewMode('table')}
            title="Interactive Table View"
          >
            <TableIcon size={13} />
            <span className="view-mode-label">Table</span>
          </button>
          <button 
            type="button"
            className={`view-mode-btn ${ticketsViewMode === 'board' ? 'active' : ''}`}
            onClick={() => setTicketsViewMode('board')}
            title="Kanban Board View"
          >
            <LayoutGrid size={13} />
            <span className="view-mode-label">Board</span>
          </button>
        </div>

        {/* Compact Search Box */}
        <div className="search-box-container compact-search">
          <Search size={13} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Filter tasks or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="search-clear-btn" 
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="compact-chips-wrap">
          {/* Assigned to me */}
          <button
            type="button"
            className={`quick-filter-pill ${quickFilters.assignedToMe ? 'active' : ''}`}
            onClick={() => toggleQuickFilter('assignedToMe')}
            title="Show work items assigned to you"
          >
            <UserCheck size={12} />
            <span>Assigned to me</span>
          </button>

          {/* Created by me */}
          <button
            type="button"
            className={`quick-filter-pill ${quickFilters.createdByMe ? 'active' : ''}`}
            onClick={() => toggleQuickFilter('createdByMe')}
            title="Show work items reported by you"
          >
            <User size={12} />
            <span>Created by me</span>
          </button>

          {/* Loopholes */}
          <button
            type="button"
            className={`quick-filter-pill ${quickFilters.onlyLoopholes ? 'active' : ''}`}
            onClick={() => toggleQuickFilter('onlyLoopholes')}
            title="Filter bugs only"
          >
            <ShieldAlert size={12} color="var(--type-loophole)" />
            <span>Loopholes</span>
          </button>

          {/* Critical Only */}
          <button
            type="button"
            className={`quick-filter-pill ${quickFilters.criticalOnly ? 'active' : ''}`}
            onClick={() => toggleQuickFilter('criticalOnly')}
            title="Show critical priority items"
          >
            <Flame size={12} color="var(--priority-critical)" />
            <span>Critical</span>
          </button>
        </div>

        {/* Compact Filter Selects */}
        <div className="compact-selects-wrap">
          {/* Priority */}
          <select
            className="compact-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            title="Filter by Priority"
            aria-label="Filter by Priority"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Stage */}
          <select
            className="compact-select"
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            title="Filter by Stage"
            aria-label="Filter by Stage"
          >
            <option value="all">All Stages</option>
            {STAGES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button (If Active) */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            className="clear-filters-btn compact-clear"
            onClick={resetFilters}
            title="Reset active filters"
          >
            <X size={12} />
            <span>Clear ({activeFiltersCount})</span>
          </button>
        )}

        {/* Primary CTA: + New Item */}
        <button
          type="button"
          className="btn btn--primary compact-create-btn"
          onClick={() => {
            setCreateInitialStage('ideation');
            setIsCreateModalOpen(true);
          }}
          title="Create New Ticket / Work Item"
        >
          <Plus size={14} />
          <span>New Item</span>
        </button>
      </div>
    </div>
  );
}
export default TicketsToolbar;
