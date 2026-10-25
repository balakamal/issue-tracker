import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { KanbanCard } from './KanbanCard';

export function KanbanBoard() {
  const { 
    visibleTasks, 
    moveTaskStage, 
    setIsCreateModalOpen, 
    setCreateInitialStage,
    activeMobileStage,
    setActiveMobileStage
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
