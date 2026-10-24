import React, { useState } from 'react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { TypeBadge, PriorityBadge, PrivacyBadge, ProjectChip } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { 
  ArrowUpDown, 
  CheckSquare, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';

export function TableView() {
  const { 
    visibleTasks, 
    projects, 
    setSelectedTaskId,
    filterType,
    setFilterType,
    filterPriority,
    setFilterPriority,
    searchQuery,
    setSearchQuery
  } = useTasks();
  const { users } = useAuth();

  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = [...visibleTasks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'progress') {
      const aDone = (a.checklist || []).filter(c => c.completed).length;
      const aTotal = (a.checklist || []).length;
      const bDone = (b.checklist || []).filter(c => c.completed).length;
      const bTotal = (b.checklist || []).length;
      aVal = aTotal > 0 ? aDone / aTotal : 0;
      bVal = bTotal > 0 ? bDone / bTotal : 0;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="table-view-container">
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

      <div style={{ overflowX: 'auto' }}>
        <table className="dense-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  ID <ArrowUpDown size={12} />
                </span>
              </th>
              <th>Type</th>
              <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Title <ArrowUpDown size={12} />
                </span>
              </th>
              <th>Project</th>
              <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Priority <ArrowUpDown size={12} />
                </span>
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Stage <ArrowUpDown size={12} />
                </span>
              </th>
              <th onClick={() => handleSort('progress')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Checklist <ArrowUpDown size={12} />
                </span>
              </th>
              <th>Privacy</th>
              <th>Assignee</th>
              <th onClick={() => handleSort('targetDate')} style={{ cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Target Date <ArrowUpDown size={12} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const stage = STAGES.find(s => s.id === task.status);
              const assignee = users.find(u => u.id === task.assigneeId);
              const completedSubtasks = (task.checklist || []).filter(c => c.completed).length;
              const totalSubtasks = (task.checklist || []).length;

              return (
                <tr 
                  key={task.id} 
                  onClick={() => setSelectedTaskId(task.id)}
                  className="table-row-clickable"
                >
                  <td>
                    <span className="task-code" style={{ fontSize: 11.5 }}>
                      {task.id}
                    </span>
                  </td>
                  <td>
                    <TypeBadge type={task.type} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </div>
                  </td>
                  <td>
                    <ProjectChip project={project} />
                  </td>
                  <td>
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span 
                        className="project-dot" 
                        style={{ backgroundColor: stage?.color || '#0077E6' }} 
                      />
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{stage?.label}</span>
                    </div>
                  </td>
                  <td>
                    {totalSubtasks > 0 ? (
                      <span className="checklist-progress-pill">
                        <CheckSquare size={12} />
                        <span>{completedSubtasks}/{totalSubtasks}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td>
                    <PrivacyBadge isPrivate={task.isPrivate} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar user={assignee} size={22} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {assignee ? assignee.name.split(' ')[0] : 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {task.targetDate || '—'}
                  </td>
                </tr>
              );
            })}

            {sortedTasks.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  No tasks matched your current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
