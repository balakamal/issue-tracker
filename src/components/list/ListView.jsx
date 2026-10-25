import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List as ListIcon,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { TypeBadge, PriorityBadge, PrivacyBadge, ProjectChip } from '../common/Badge';
import { Avatar } from '../common/Avatar';

export function ListView() {
  const { 
    visibleTasks, 
    projects, 
    moveTaskStage,
    setSelectedTaskId, 
    setIsCreateModalOpen, 
    setCreateInitialStage,
    filterType,
    setFilterType,
    filterPriority,
    setFilterPriority,
    searchQuery,
    setSearchQuery,
    setActiveView
  } = useTasks();

  const { users } = useAuth();

  // Collapsed state for stages (all open by default)
  const [collapsedStages, setCollapsedStages] = useState({});
  const [stageMenuTaskId, setStageMenuTaskId] = useState(null);

  // Close stage popover on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setStageMenuTaskId(null);
    };
    if (stageMenuTaskId) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [stageMenuTaskId]);

  const toggleStageCollapse = (stageId) => {
    setCollapsedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const handleQuickAdd = (stageId) => {
    setCreateInitialStage(stageId);
    setIsCreateModalOpen(true);
  };

  const handleMoveStage = (e, taskId, newStage) => {
    e.stopPropagation();
    moveTaskStage(taskId, newStage);
    setStageMenuTaskId(null);
  };

  return (
    <div className="list-view-container">
      {/* Compact View Toolbar */}
      <div className="view-toolbar">
        <div className="view-toolbar-left">
          {/* Corbel Segmented Control for Loopholes / Enhancements */}
          <div className="segmented-control">
            <button
              className={`segmented-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
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
              className="view-mode-btn" 
              onClick={() => setActiveView('kanban')}
              title="Switch to Kanban Board"
            >
              <LayoutGrid size={15} />
              <span className="view-mode-label">Board</span>
            </button>
            <button 
              className="view-mode-btn active" 
              title="List View Active"
            >
              <ListIcon size={15} />
              <span className="view-mode-label">List</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="search-box-container">
            <Search size={14} className="search-box-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="toolbar-item-count">
            {visibleTasks.length} {visibleTasks.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Vertical Stage Sections */}
      <div className="list-stages-wrapper">
        {STAGES.map(stage => {
          const stageTasks = visibleTasks.filter(t => t.status === stage.id);
          const isCollapsed = collapsedStages[stage.id];

          return (
            <div key={stage.id} className="list-stage-section">
              {/* Stage Header */}
              <div 
                className="list-stage-header"
                onClick={() => toggleStageCollapse(stage.id)}
              >
                <div className="list-stage-header-left">
                  <span className="stage-color-dot" style={{ backgroundColor: stage.color }} />
                  <span className="stage-title-text">{stage.label}</span>
                  <span className="stage-count-pill">{stageTasks.length}</span>
                </div>

                <div className="list-stage-header-right" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="stage-add-icon-btn"
                    onClick={() => handleQuickAdd(stage.id)}
                    title={`Add new task to ${stage.label}`}
                  >
                    <Plus size={15} />
                  </button>
                  <button 
                    className="stage-collapse-icon-btn"
                    onClick={() => toggleStageCollapse(stage.id)}
                    title={isCollapsed ? "Expand Stage" : "Collapse Stage"}
                  >
                    {isCollapsed ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
                  </button>
                </div>
              </div>

              {/* Stage Tasks List */}
              {!isCollapsed && (
                <div className="list-stage-cards">
                  {stageTasks.length === 0 ? (
                    <div className="list-empty-state">
                      <span>No items in {stage.label}</span>
                      <button 
                        className="list-empty-add-btn"
                        onClick={() => handleQuickAdd(stage.id)}
                      >
                        <Plus size={13} />
                        <span>Add an item</span>
                      </button>
                    </div>
                  ) : (
                    stageTasks.map(task => {
                      const project = projects.find(p => p.id === task.projectId);
                      const assignee = users.find(u => u.id === task.assigneeId);
                      const checklist = task.checklist || [];
                      const completedCount = checklist.filter(c => c.completed).length;
                      const isMenuOpen = stageMenuTaskId === task.id;

                      return (
                        <div 
                          key={task.id}
                          className="list-item-card"
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div className="list-card-main">
                            <div className="list-card-badges">
                              <TypeBadge type={task.type} />
                              <PriorityBadge priority={task.priority} />
                              <ProjectChip project={project} />
                            </div>

                            <h4 className="list-card-title">{task.title}</h4>

                            {task.problemStatement && (
                              <p className="list-card-desc">{task.problemStatement}</p>
                            )}

                            {checklist.length > 0 && (
                              <div className="list-card-checklist-snippet">
                                <span className="checklist-metric-text">
                                  {completedCount}/{checklist.length} subtasks
                                </span>
                                <div className="checklist-progress-bar-track" style={{ height: 4, maxWidth: 120 }}>
                                  <div 
                                    className={`checklist-progress-bar-fill ${completedCount === checklist.length ? 'complete' : ''}`}
                                    style={{ width: `${(completedCount / checklist.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="list-card-aside" onClick={(e) => e.stopPropagation()}>
                            {/* Assignee Avatar */}
                            <div className="list-assignee-wrap" title={assignee ? assignee.name : "Unassigned"}>
                              <Avatar user={assignee} size={28} showTooltip={false} />
                            </div>

                            {/* Move Stage Selector (No Dragging Needed on Mobile!) */}
                            <div className="stage-move-container">
                              <button 
                                className="stage-move-trigger-btn"
                                onClick={() => setStageMenuTaskId(prev => prev === task.id ? null : task.id)}
                                title="Change Stage"
                              >
                                <span>Move</span>
                                <ChevronDown size={12} />
                              </button>

                              {isMenuOpen && (
                                <div className="stage-move-popover">
                                  <div className="stage-move-popover-title">Move to stage:</div>
                                  {STAGES.map(s => (
                                    <button
                                      key={s.id}
                                      className={`stage-move-opt ${task.status === s.id ? 'active' : ''}`}
                                      onClick={(e) => handleMoveStage(e, task.id, s.id)}
                                    >
                                      <span className="stage-color-dot" style={{ backgroundColor: s.color }} />
                                      <span>{s.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default ListView;
