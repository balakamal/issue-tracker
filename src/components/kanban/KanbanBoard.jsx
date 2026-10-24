import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { KanbanCard } from './KanbanCard';

export function KanbanBoard() {
  const { 
    visibleTasks, 
    moveTaskStage, 
    setIsCreateModalOpen, 
    setCreateInitialStage,
    activeMobileStage,
    setActiveMobileStage,
    filterType,
    setFilterType,
    filterPriority,
    setFilterPriority,
    searchQuery,
    setSearchQuery,
    setActiveView
  } = useTasks();

  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (dragOverCol !== stageId) {
      setDragOverCol(stageId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTaskStage(taskId, stageId);
    }
  };

  const handleQuickAdd = (stageId) => {
    setCreateInitialStage(stageId);
    setIsCreateModalOpen(true);
  };

  const handleStageTabClick = (stageId) => {
    setActiveMobileStage(stageId);
    const colEl = document.getElementById(`kanban-col-${stageId}`);
    if (colEl) {
      colEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  return (
    <div className="kanban-view-container">
      {/* Contextual Corbel-style View Toolbar */}
      <div className="view-toolbar">
        <div className="view-toolbar-left">
          {/* Corbel Segmented Control */}
          <div className="segmented-control">
            <button
              className={`segmented-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Items
            </button>
            <button
              className={`segmented-btn ${filterType === 'loophole' ? 'active' : ''}`}
              onClick={() => setFilterType('loophole')}
            >
              <ShieldAlert size={13} color="var(--type-loophole)" />
              <span>Loopholes</span>
            </button>
            <button
              className={`segmented-btn ${filterType === 'enhancement' ? 'active' : ''}`}
              onClick={() => setFilterType('enhancement')}
            >
              <Sparkles size={13} color="var(--type-enhancement)" />
              <span>Enhancements</span>
            </button>
          </div>

          {/* Priority Filter */}
          <div className="filter-select-wrapper">
            <SlidersHorizontal size={13} className="filter-select-icon" />
            <select
              className="filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              title="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="view-toolbar-right">
          {/* View Mode Switcher (Board vs List) */}
          <div className="view-mode-toggle">
            <button 
              className="view-mode-btn active" 
              title="Kanban Board Active"
            >
              <LayoutGrid size={15} />
              <span className="view-mode-label">Board</span>
            </button>
            <button 
              className="view-mode-btn" 
              onClick={() => setActiveView('list')}
              title="Switch to List View"
            >
              <ListIcon size={15} />
              <span className="view-mode-label">List</span>
            </button>
          </div>

          <div className="search-box-container">
            <Search size={14} className="search-box-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search items, specs, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="toolbar-item-count">
            {visibleTasks.length} {visibleTasks.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (Swipable Pill Bar) */}
      <div className="kanban-mobile-tabs mobile-only">
        {STAGES.map(stage => {
          const count = visibleTasks.filter(t => t.status === stage.id).length;
          const isActive = activeMobileStage === stage.id;
          return (
            <button
              key={stage.id}
              className={`mobile-stage-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleStageTabClick(stage.id)}
            >
              <span className="stage-tab-indicator" style={{ backgroundColor: stage.color }} />
              <span className="stage-tab-label">{stage.label}</span>
              <span className="stage-tab-badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="kanban-columns-grid">
        {STAGES.map(stage => {
          const stageTasks = visibleTasks.filter(t => t.status === stage.id);
          const isOver = dragOverCol === stage.id;

          return (
            <div
              key={stage.id}
              id={`kanban-col-${stage.id}`}
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="column-title-wrap">
                  <span 
                    className="column-color-indicator" 
                    style={{ backgroundColor: stage.color }} 
                  />
                  <span className="column-title-text">{stage.label}</span>
                  <span className="column-count-badge">{stageTasks.length}</span>
                </div>
                
                <button
                  className="column-add-btn"
                  onClick={() => handleQuickAdd(stage.id)}
                  title={`Add item to ${stage.label}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Column Cards */}
              <div className="kanban-cards-list">
                {stageTasks.map(task => (
                  <KanbanCard key={task.id} task={task} />
                ))}

                {stageTasks.length === 0 && (
                  <div className="kanban-empty-column">
                    <button 
                      className="column-empty-add-btn"
                      onClick={() => handleQuickAdd(stage.id)}
                      title={`Add task to ${stage.label}`}
                    >
                      <Plus size={13} />
                      <span>Add task</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
