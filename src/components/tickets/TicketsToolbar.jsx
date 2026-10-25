import React from 'react';
import { 
  Plus, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  User,
  UserCheck,
  FolderKanban,
  X,
  ChevronDown,
  Flame,
  Check
} from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function TicketsToolbar() {
  const { 
    visibleTasks, 
    projects,
    selectedProjectId,
    filterType,
    setFilterType,
    filterPriority,
    setFilterPriority,
    filterAssignee,
    setFilterAssignee,
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
    setCreateInitialStage
  } = useTasks();

  const { users, currentUser } = useAuth();

  const selectedProj = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="tickets-toolbar-container">
      {/* Top Row: Context Breadcrumb, Search, View Mode Switcher, and + New Item */}
      <div className="tickets-toolbar-top">
        <div className="tickets-toolbar-context">
          <div className="tickets-breadcrumb">
            <span className="breadcrumb-root">Projects</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-project">
              <span 
                className="project-dot-mini" 
                style={{ backgroundColor: selectedProj ? (selectedProj.color || 'var(--sky)') : 'var(--mint)' }} 
              />
              {selectedProj ? selectedProj.name : 'All Projects'}
            </span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Tickets</span>
          </div>

          <span className="tickets-counter-badge">
            {visibleTasks.length} {visibleTasks.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="tickets-toolbar-actions">
          {/* Instant Search Bar */}
          <div className="search-box-container">
            <Search size={14} className="search-box-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Filter by keyword, spec, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
                title="Clear search query"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* View Mode Switcher: Table vs Board */}
          <div className="view-mode-toggle" role="group" aria-label="View Mode">
            <button 
              type="button"
              className={`view-mode-btn ${ticketsViewMode === 'table' ? 'active' : ''}`}
              onClick={() => setTicketsViewMode('table')}
              title="Interactive Table View"
            >
              <TableIcon size={14} />
              <span className="view-mode-label">Table</span>
            </button>
            <button 
              type="button"
              className={`view-mode-btn ${ticketsViewMode === 'board' ? 'active' : ''}`}
              onClick={() => setTicketsViewMode('board')}
              title="Kanban Board View"
            >
              <LayoutGrid size={14} />
              <span className="view-mode-label">Board</span>
            </button>
          </div>

          {/* Primary + New Item CTA */}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setCreateInitialStage('ideation');
              setIsCreateModalOpen(true);
            }}
            title="Create New Ticket / Work Item"
          >
            <Plus size={15} />
            <span className="new-btn-label">New Item</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Jira / Azure DevOps Quick Filter Pills & Dropdown Selectors */}
      <div className="tickets-toolbar-bottom">
        <div className="tickets-filters-wrap">
          {/* Quick Filters Group (Jira style pills) */}
          <div className="quick-filters-group">
            <span className="quick-filters-label">Quick Filters:</span>

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

            {/* Only Loopholes (Bugs) */}
            <button
              type="button"
              className={`quick-filter-pill ${quickFilters.onlyLoopholes ? 'active' : ''}`}
              onClick={() => toggleQuickFilter('onlyLoopholes')}
              title="Filter exclusively for Loopholes (Bugs)"
            >
              <ShieldAlert size={12} color="var(--type-loophole)" />
              <span>Loopholes</span>
            </button>

            {/* Only Enhancements (Features) */}
            <button
              type="button"
              className={`quick-filter-pill ${quickFilters.onlyEnhancements ? 'active' : ''}`}
              onClick={() => toggleQuickFilter('onlyEnhancements')}
              title="Filter exclusively for Enhancements (Features)"
            >
              <Sparkles size={12} color="var(--type-enhancement)" />
              <span>Enhancements</span>
            </button>

            {/* Critical Only */}
            <button
              type="button"
              className={`quick-filter-pill ${quickFilters.criticalOnly ? 'active' : ''}`}
              onClick={() => toggleQuickFilter('criticalOnly')}
              title="Show critical priority issues only"
            >
              <Flame size={12} color="var(--priority-critical)" />
              <span>Critical Only</span>
            </button>
          </div>

          {/* Dropdown Filters Group */}
          <div className="dropdown-filters-group">
            {/* Assignee Filter */}
            <div className="filter-select-wrapper">
              <User size={13} className="filter-select-icon" />
              <select
                className="filter-select"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                title="Filter by Assignee"
                aria-label="Filter by Assignee"
              >
                <option value="all">All Assignees</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
                <optgroup label="Workspace Members">
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="filter-select-wrapper">
              <SlidersHorizontal size={13} className="filter-select-icon" />
              <select
                className="filter-select"
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
            </div>

            {/* Stage Filter */}
            <div className="filter-select-wrapper">
              <FolderKanban size={13} className="filter-select-icon" />
              <select
                className="filter-select"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                title="Filter by Stage"
                aria-label="Filter by Stage"
              >
                <option value="all">All Stages</option>
                {STAGES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear All Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={resetFilters}
                title="Reset all active filters"
              >
                <X size={13} />
                <span>Clear Filters ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default TicketsToolbar;
