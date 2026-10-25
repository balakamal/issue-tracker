import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { TicketsToolbar } from './TicketsToolbar';
import { KanbanBoard } from '../kanban/KanbanBoard';
import { TableView } from '../table/TableView';
import { FilterX, Plus, Sparkles } from 'lucide-react';

export function TicketsView() {
  const { 
    ticketsViewMode, 
    visibleTasks, 
    activeFiltersCount, 
    resetFilters,
    setIsCreateModalOpen,
    setCreateInitialStage
  } = useTasks();

  return (
    <div className="tickets-view-wrapper">
      {/* Central Jira / Azure DevOps Toolbar with breadcrumbs, view switch, and rich filters */}
      <TicketsToolbar />

      {/* Main View Area (Board or Table) */}
      <div className="tickets-content-area">
        {visibleTasks.length === 0 ? (
          <div className="tickets-empty-filter-state">
            <div className="empty-filter-icon-bubble">
              {activeFiltersCount > 0 ? (
                <FilterX size={32} color="var(--sky)" />
              ) : (
                <Sparkles size={32} color="var(--mint)" />
              )}
            </div>

            <h3 className="empty-filter-title">
              {activeFiltersCount > 0 ? 'No matching work items found' : 'No tickets in this workspace yet'}
            </h3>

            <p className="empty-filter-desc">
              {activeFiltersCount > 0
                ? 'Try adjusting or clearing your active filters to see more results.'
                : 'Create your first loophole or enhancement ticket to get your sprint started.'}
            </p>

            <div className="empty-filter-actions">
              {activeFiltersCount > 0 ? (
                <button 
                  type="button" 
                  className="btn btn--secondary" 
                  onClick={resetFilters}
                >
                  Clear All Filters
                </button>
              ) : null}

              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setCreateInitialStage('ideation');
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>Create New Ticket</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {ticketsViewMode === 'board' && <KanbanBoard />}
            {ticketsViewMode === 'table' && <TableView />}
          </>
        )}
      </div>
    </div>
  );
}
export default TicketsView;
