import React from 'react';
import { 
  Lightbulb, 
  MessageSquare, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { TypeBadge, PriorityBadge, PrivacyBadge, ProjectChip } from '../common/Badge';
import { Avatar } from '../common/Avatar';

export function IdeationHub() {
  const { 
    visibleTasks, 
    projects, 
    setSelectedTaskId, 
    moveTaskStage,
    setIsCreateModalOpen,
    setCreateInitialStage
  } = useTasks();

  const { users } = useAuth();

  // Focus on ideation and discussion stage tasks first, but allow viewing all
  const ideationTasks = visibleTasks.filter(t => t.status === 'ideation' || t.status === 'discussion');
  const otherTasks = visibleTasks.filter(t => t.status !== 'ideation' && t.status !== 'discussion');

  const renderPitchCard = (task) => {
    const project = projects.find(p => p.id === task.projectId);
    const creator = users.find(u => u.id === task.createdBy);
    const comments = task.comments || [];
    const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;
    const latestCommentUser = latestComment ? users.find(u => u.id === latestComment.userId) : null;

    return (
      <div 
        key={task.id} 
        className="ideation-pitch-card"
        onClick={() => setSelectedTaskId(task.id)}
      >
        {/* Card Top: Badges and ID */}
        <div className="ideation-card-top">
          <div className="card-badges-group">
            <TypeBadge type={task.type} />
            <PriorityBadge priority={task.priority} />
            <PrivacyBadge isPrivate={task.isPrivate} />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 600 }}>
            {task.id}
          </span>
        </div>

        {/* Title and Project */}
        <div>
          <div style={{ marginBottom: 4 }}>
            <ProjectChip project={project} />
          </div>
          <h3 className="ideation-card-title">{task.title}</h3>
        </div>

        {/* Problem Statement Spec Box */}
        {task.problemStatement && (
          <div className="ideation-spec-box">
            <div className="spec-heading">
              {task.type === 'loophole' ? 'Loophole / Vulnerability:' : 'Problem / Motivation:'}
            </div>
            <div className="spec-content">
              {task.problemStatement}
            </div>
          </div>
        )}

        {/* Proposed Solution Spec Box */}
        {task.proposedSolution && (
          <div className="ideation-spec-box">
            <div className="spec-heading" style={{ color: 'var(--primary)' }}>
              Proposed Solution:
            </div>
            <div className="spec-content">
              {task.proposedSolution}
            </div>
          </div>
        )}

        {/* Recent Discussion Snippet if any */}
        {latestComment && (
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            padding: '8px 10px', 
            borderRadius: 8, 
            backgroundColor: 'var(--bg-input)', 
            border: '1px solid var(--border-subtle)',
            fontSize: 12
          }}>
            <Avatar user={latestCommentUser} size={20} showTooltip={false} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginRight: 5 }}>
                {latestCommentUser?.name.split(' ')[0]}:
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                "{latestComment.text}"
              </span>
            </div>
          </div>
        )}

        {/* Footer: Author, Impact Matrix & Action */}
        <div className="ideation-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar user={creator} size={24} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Ideated by {creator ? creator.name.split(' ')[0] : 'Team'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {task.status === 'ideation' && (
              <button
                className="filter-pill-button"
                style={{ fontSize: 11, padding: '4px 10px', backgroundColor: 'var(--status-discussion-bg)', color: 'var(--status-discussion)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  moveTaskStage(task.id, 'discussion');
                }}
                title="Move to team discussion"
              >
                Discuss <ArrowRight size={12} />
              </button>
            )}

            {task.status === 'discussion' && (
              <button
                className="filter-pill-button"
                style={{ fontSize: 11, padding: '4px 10px', backgroundColor: 'var(--status-planned-bg)', color: 'var(--status-planned)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  moveTaskStage(task.id, 'planned');
                }}
                title="Lock scope & plan implementation"
              >
                Plan Implementation <ArrowRight size={12} />
              </button>
            )}

            <div className="meta-counter active" style={{ marginLeft: 6 }}>
              <MessageSquare size={13} />
              <span>{comments.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ideation-hub-container">
      {/* Sleek Ideation Header */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
              Ideation &amp; Discovery Hub
            </h2>
            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: 10 }}>
              Engineering Hub
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
            Propose, analyze, and review project loopholes and feature enhancements before execution.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setCreateInitialStage('ideation');
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={15} />
          <span>New Proposal</span>
        </button>
      </div>

      {/* Active Ideation & Discussion Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Ideation &amp; Discussion Threads ({ideationTasks.length})
          </h3>
        </div>

        {ideationTasks.length === 0 ? (
          <div className="kanban-empty-column" style={{ padding: 48 }}>
            <Lightbulb size={36} color="var(--primary)" />
            <h4 style={{ color: 'var(--text-primary)' }}>No ideas currently in ideation or discussion</h4>
            <p>Every breakthrough enhancement starts as a simple thought. Have you spotted a loophole or gap?</p>
            <button 
              className="btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => {
                setCreateInitialStage('ideation');
                setIsCreateModalOpen(true);
              }}
            >
              <Plus size={14} /> Record First Loophole or Idea
            </button>
          </div>
        ) : (
          <div className="ideation-grid">
            {ideationTasks.map(renderPitchCard)}
          </div>
        )}
      </div>

      {/* Planned and Execution Showcase */}
      {otherTasks.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Already In Execution &amp; Completed ({otherTasks.length})
          </h3>
          <div className="ideation-grid">
            {otherTasks.map(renderPitchCard)}
          </div>
        </div>
      )}
    </div>
  );
}
