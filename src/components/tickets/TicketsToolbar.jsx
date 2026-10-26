import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  LayoutGrid, 
  Table as TableIcon, 
  UserCheck, 
  ChevronDown, 
  Check, 
  Layers, 
  X, 
  Flame,
  FolderKanban,
  Filter,
  HelpCircle
} from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

const PRIORITIES = [
  { id: 'critical', label: 'Critical', color: 'var(--priority-critical)', icon: Flame },
  { id: 'high', label: 'High', color: 'var(--priority-high)' },
  { id: 'medium', label: 'Medium', color: 'var(--priority-medium)' },
  { id: 'low', label: 'Low', color: 'var(--priority-low)' }
];

const TYPES = [
  { id: 'loophole', label: 'Loophole', icon: ShieldAlert, color: 'var(--type-loophole)' },
  { id: 'enhancement', label: 'Enhancement', icon: Sparkles, color: 'var(--sky)' }
];

export function TicketsToolbar() {
  const { 
    tasks,
    visibleTasks, 
    projects, 
    selectedProjectId, 
    setSelectedProjectId,
    selectedTypes,
    toggleTypeFilter,
    setSelectedTypes,
    selectedPriorities,
    togglePriorityFilter,
    setSelectedPriorities,
    selectedStages,
    toggleStageFilter,
    setSelectedStages,
    selectedAssignees,
    toggleAssigneeFilter,
    setSelectedAssignees,
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

  const { currentUser, users } = useAuth();

  // Active open popover: null | 'project' | 'type' | 'stage' | 'assignee' | 'priority'
  const [openDropdown, setOpenDropdown] = useState(null);
  const toolbarRef = useRef(null);

  // Sliding pill indicator for view mode toggle
  const toggleContainerRef = useRef(null);
  const tableBtnRef = useRef(null);
  const boardBtnRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ left: 3, width: 0, opacity: 0 });

  useEffect(() => {
    const updatePill = () => {
      const activeEl = ticketsViewMode === 'table' ? tableBtnRef.current : boardBtnRef.current;
      if (activeEl && toggleContainerRef.current) {
        const containerRect = toggleContainerRef.current.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        setPillStyle({
          left: elRect.left - containerRect.left,
          width: elRect.width,
          opacity: 1
        });
      }
    };
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [ticketsViewMode]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdown(prev => (prev === id ? null : id));
  };

  const selectedProj = projects.find(p => p.id === selectedProjectId);

  // Compute counts per option based on current project selection
  const scopedTasks = tasks.filter(t => selectedProjectId === 'all' || t.projectId === selectedProjectId);

  return (
    <div className="tickets-toolbar-single" ref={toolbarRef}>
      {/* Left: Interactive Context Breadcrumb (Projects / [Dropdown] / Tickets) */}
      <div className="tickets-toolbar-left">
        <div className="tickets-breadcrumb">
          <span className="breadcrumb-root">Projects</span>
          <span className="breadcrumb-sep">/</span>

          {/* Interactive Project Switcher Dropdown inside Breadcrumb */}
          <div className="breadcrumb-project-wrap">
            <button
              type="button"
              className="breadcrumb-project-btn"
              onClick={() => toggleDropdown('project')}
              title="Click to switch active project"
            >
              <span 
                className="project-dot-mini" 
                style={{ backgroundColor: selectedProj ? (selectedProj.color || 'var(--sky)') : 'var(--mint)' }} 
              />
              <span className="breadcrumb-project-name">
                {selectedProj ? selectedProj.name : 'All Projects'}
              </span>
              <ChevronDown size={12} className={`breadcrumb-chev ${openDropdown === 'project' ? 'open' : ''}`} />
            </button>

            {/* Project Switcher Popover */}
            {openDropdown === 'project' && (
              <div className="breadcrumb-project-popover">
                <div className="breadcrumb-popover-title">Filter by Project</div>
                
                <button
                  type="button"
                  className={`breadcrumb-popover-item ${selectedProjectId === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedProjectId('all');
                    setOpenDropdown(null);
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
                      setOpenDropdown(null);
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
                    setOpenDropdown(null);
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

      {/* Middle & Right: View Switcher, Search, Jira/ADO Multi-Select Filters, Quick Presets & CTA */}
      <div className="tickets-toolbar-right">
        {/* View Mode Toggle: Table vs Board with Corbel Sliding Pill */}
        <div className="view-mode-toggle" ref={toggleContainerRef} role="group" aria-label="View Mode">
          <div 
            className="view-mode-pill" 
            style={{ 
              left: `${pillStyle.left}px`, 
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity
            }} 
            aria-hidden="true" 
          />
          <button 
            ref={tableBtnRef}
            type="button"
            className={`view-mode-btn ${ticketsViewMode === 'table' ? 'active' : ''}`}
            onClick={() => setTicketsViewMode('table')}
            title="Interactive Table View"
          >
            <TableIcon size={13} />
            <span className="view-mode-label">Table</span>
          </button>
          <button 
            ref={boardBtnRef}
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

        {/* Jira & Azure DevOps Multi-Select Filter Popovers */}
        <div className="ado-filters-group">
          {/* 1. Type Filter Popover */}
          <div className="ado-filter-dropdown-wrap">
            <button
              type="button"
              className={`ado-filter-btn ${selectedTypes.length > 0 ? 'active' : ''}`}
              onClick={() => toggleDropdown('type')}
              title="Filter by Type"
            >
              <span>Type</span>
              {selectedTypes.length > 0 && (
                <span className="ado-filter-badge">{selectedTypes.length}</span>
              )}
              <ChevronDown size={11} className={`ado-filter-chev ${openDropdown === 'type' ? 'open' : ''}`} />
            </button>

            {openDropdown === 'type' && (
              <div className="ado-filter-popover">
                <div className="ado-filter-popover-header">
                  <span>Filter by Type</span>
                  {selectedTypes.length > 0 && (
                    <button 
                      type="button" 
                      className="ado-filter-clear-link"
                      onClick={() => setSelectedTypes([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="ado-filter-options-list">
                  {TYPES.map(t => {
                    const isChecked = selectedTypes.includes(t.id);
                    const count = scopedTasks.filter(item => item.type === t.id).length;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`ado-filter-option ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleTypeFilter(t.id)}
                      >
                        <span className={`ado-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <Check size={11} />}
                        </span>
                        <Icon size={13} color={t.color} />
                        <span className="ado-option-label">{t.label}</span>
                        <span className="ado-option-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Stage / State Filter Popover (ADO States / Jira Status) */}
          <div className="ado-filter-dropdown-wrap">
            <button
              type="button"
              className={`ado-filter-btn ${selectedStages.length > 0 ? 'active' : ''}`}
              onClick={() => toggleDropdown('stage')}
              title="Filter by Stage"
            >
              <span>Stage</span>
              {selectedStages.length > 0 && (
                <span className="ado-filter-badge">{selectedStages.length}</span>
              )}
              <ChevronDown size={11} className={`ado-filter-chev ${openDropdown === 'stage' ? 'open' : ''}`} />
            </button>

            {openDropdown === 'stage' && (
              <div className="ado-filter-popover">
                <div className="ado-filter-popover-header">
                  <span>Filter by Stage</span>
                  {selectedStages.length > 0 && (
                    <button 
                      type="button" 
                      className="ado-filter-clear-link"
                      onClick={() => setSelectedStages([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="ado-filter-options-list">
                  {STAGES.map(s => {
                    const isChecked = selectedStages.includes(s.id);
                    const count = scopedTasks.filter(item => item.status === s.id).length;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`ado-filter-option ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleStageFilter(s.id)}
                      >
                        <span className={`ado-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <Check size={11} />}
                        </span>
                        <span className="ado-stage-dot" style={{ backgroundColor: s.color || 'var(--mint)' }} />
                        <span className="ado-option-label">{s.label}</span>
                        <span className="ado-option-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Assignee Filter Popover (ADO / Jira People) */}
          <div className="ado-filter-dropdown-wrap">
            <button
              type="button"
              className={`ado-filter-btn ${selectedAssignees.length > 0 ? 'active' : ''}`}
              onClick={() => toggleDropdown('assignee')}
              title="Filter by Assignee"
            >
              <span>Assignee</span>
              {selectedAssignees.length > 0 && (
                <span className="ado-filter-badge">{selectedAssignees.length}</span>
              )}
              <ChevronDown size={11} className={`ado-filter-chev ${openDropdown === 'assignee' ? 'open' : ''}`} />
            </button>

            {openDropdown === 'assignee' && (
              <div className="ado-filter-popover" style={{ width: 230 }}>
                <div className="ado-filter-popover-header">
                  <span>Filter by Assignee</span>
                  {selectedAssignees.length > 0 && (
                    <button 
                      type="button" 
                      className="ado-filter-clear-link"
                      onClick={() => setSelectedAssignees([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="ado-filter-options-list">
                  {/* Current User Quick Option */}
                  {currentUser && (
                    <button
                      type="button"
                      className={`ado-filter-option ${selectedAssignees.includes('me') ? 'checked' : ''}`}
                      onClick={() => toggleAssigneeFilter('me')}
                    >
                      <span className={`ado-checkbox ${selectedAssignees.includes('me') ? 'checked' : ''}`}>
                        {selectedAssignees.includes('me') && <Check size={11} />}
                      </span>
                      <UserCheck size={13} color="var(--sky)" />
                      <span className="ado-option-label">Assigned to me</span>
                      <span className="ado-option-count">
                        {scopedTasks.filter(item => item.assigneeId === currentUser.id).length}
                      </span>
                    </button>
                  )}

                  {/* Unassigned Option */}
                  <button
                    type="button"
                    className={`ado-filter-option ${selectedAssignees.includes('unassigned') ? 'checked' : ''}`}
                    onClick={() => toggleAssigneeFilter('unassigned')}
                  >
                    <span className={`ado-checkbox ${selectedAssignees.includes('unassigned') ? 'checked' : ''}`}>
                      {selectedAssignees.includes('unassigned') && <Check size={11} />}
                    </span>
                    <HelpCircle size={13} color="var(--muted)" />
                    <span className="ado-option-label">Unassigned</span>
                    <span className="ado-option-count">
                      {scopedTasks.filter(item => !item.assigneeId).length}
                    </span>
                  </button>

                  <div className="ado-filter-sep" />

                  {/* All Workspace Users */}
                  {(users || []).map(u => {
                    const isChecked = selectedAssignees.includes(u.id);
                    const count = scopedTasks.filter(item => item.assigneeId === u.id).length;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        className={`ado-filter-option ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleAssigneeFilter(u.id)}
                      >
                        <span className={`ado-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <Check size={11} />}
                        </span>
                        <Avatar user={u} size={20} showTooltip={false} />
                        <span className="ado-option-label">{u.name}</span>
                        <span className="ado-option-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Priority Filter Popover */}
          <div className="ado-filter-dropdown-wrap">
            <button
              type="button"
              className={`ado-filter-btn ${selectedPriorities.length > 0 ? 'active' : ''}`}
              onClick={() => toggleDropdown('priority')}
              title="Filter by Priority"
            >
              <span>Priority</span>
              {selectedPriorities.length > 0 && (
                <span className="ado-filter-badge">{selectedPriorities.length}</span>
              )}
              <ChevronDown size={11} className={`ado-filter-chev ${openDropdown === 'priority' ? 'open' : ''}`} />
            </button>

            {openDropdown === 'priority' && (
              <div className="ado-filter-popover">
                <div className="ado-filter-popover-header">
                  <span>Filter by Priority</span>
                  {selectedPriorities.length > 0 && (
                    <button 
                      type="button" 
                      className="ado-filter-clear-link"
                      onClick={() => setSelectedPriorities([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="ado-filter-options-list">
                  {PRIORITIES.map(p => {
                    const isChecked = selectedPriorities.includes(p.id);
                    const count = scopedTasks.filter(item => item.priority === p.id).length;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`ado-filter-option ${isChecked ? 'checked' : ''}`}
                        onClick={() => togglePriorityFilter(p.id)}
                      >
                        <span className={`ado-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <Check size={11} />}
                        </span>
                        <span className="ado-priority-dot" style={{ backgroundColor: p.color }} />
                        <span className="ado-option-label">{p.label}</span>
                        <span className="ado-option-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button (If Any Active) */}
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
        </div>

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
