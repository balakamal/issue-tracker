import React, { useState } from 'react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { TypeBadge, PriorityBadge, PrivacyBadge, ProjectChip } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { ArrowUpDown, CheckSquare } from 'lucide-react';

export function TableView() {
  const { 
    visibleTasks, 
    projects, 
    setSelectedTaskId
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
      {/* Desktop Table View */}
      <div className="desktop-table-container">
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

      {/* Mobile Responsive Cards List */}
      <div className="mobile-tasks-container">
        {sortedTasks.map(task => {
          const project = projects.find(p => p.id === task.projectId);
          const stage = STAGES.find(s => s.id === task.status);
          const assignee = users.find(u => u.id === task.assigneeId);

          return (
            <div 
              key={task.id}
              className="mobile-task-card"
              onClick={() => setSelectedTaskId(task.id)}
            >
              <div className="mobile-task-card-top">
                <span className="mobile-task-id">{task.id}</span>
                <div className="mobile-task-badges">
                  <TypeBadge type={task.type} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              <div className="mobile-task-title">{task.title}</div>

              <div className="mobile-task-card-bottom">
                <div className="mobile-task-meta-left">
                  <span 
                    className="mobile-task-stage" 
                    style={{ 
                      color: stage?.color || 'var(--sky)', 
                      backgroundColor: `${stage?.color || 'var(--sky)'}20` 
                    }}
                  >
                    {stage?.label || task.status}
                  </span>

                  {project && (
                    <span className="mobile-task-project">
                      <span className="project-dot-mini" style={{ backgroundColor: project.color || 'var(--sky)' }} />
                      {project.name}
                    </span>
                  )}
                </div>

                <div className="mobile-task-assignee">
                  <Avatar user={assignee} size={20} showTooltip={false} />
                  <span>{assignee ? assignee.name.split(' ')[0] : 'Unassigned'}</span>
                </div>
              </div>
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: 13 }}>
            No tasks matched your current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
