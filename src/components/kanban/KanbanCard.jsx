import React from 'react';
import { MessageSquare, Calendar, CheckSquare, ChevronRight } from 'lucide-react';
import { TypeBadge, PriorityBadge, PrivacyBadge, ProjectChip } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export function KanbanCard({ task }) {
  const { setSelectedTaskId, projects } = useTasks();
  const { users } = useAuth();

  const assignee = users.find(u => u.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);

  // Compute checklist progress
  const checklist = task.checklist || [];
  const completedCount = checklist.filter(c => c.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Format date and check overdue
  const isOverdue = task.targetDate && new Date(task.targetDate) < new Date() && task.status !== 'done';
  const formattedDate = task.targetDate 
    ? new Date(task.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.currentTarget.classList.add('is-dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('is-dragging');
  };

  return (
    <div
      className="task-card"
      onClick={() => setSelectedTaskId(task.id)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Header Badges */}
      <div className="task-card-header">
        <div className="card-badges-group">
          <TypeBadge type={task.type} />
          <PriorityBadge priority={task.priority} />
          <PrivacyBadge isPrivate={task.isPrivate} />
        </div>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 600 }}>
          {task.id}
        </span>
      </div>

      {/* Project & Title */}
      <div>
        <div style={{ marginBottom: 4 }}>
          <ProjectChip project={project} />
        </div>
        <h3 className="task-card-title">{task.title}</h3>
      </div>

      {/* Description Snippet */}
      {task.problemStatement && (
        <p className="task-card-desc">{task.problemStatement}</p>
      )}

      {/* Checklist Progress Meter */}
      {totalCount > 0 && (
        <div className="card-checklist-container">
          <div className="card-checklist-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckSquare size={12} color="var(--primary)" />
              Implementation Tasks
            </span>
            <span>{completedCount}/{totalCount} ({progressPercent}%)</span>
          </div>
          <div className="checklist-progress-bar-track">
            <div 
              className={`checklist-progress-bar-fill ${progressPercent === 100 ? 'complete' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <div className="task-card-footer">
        <div className="card-footer-meta">
          <div className={`meta-counter ${(task.comments || []).length > 0 ? 'active' : ''}`}>
            <MessageSquare size={12} />
            <span>{(task.comments || []).length}</span>
          </div>

          {formattedDate && (
            <div className={`meta-due-date ${isOverdue ? 'overdue' : ''}`} title={isOverdue ? 'Overdue!' : 'Target completion date'}>
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar user={assignee} size={24} />
        </div>
      </div>
    </div>
  );
}
