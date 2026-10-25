import React, { useState, useMemo } from 'react';
import { 
  Lightbulb, 
  MessageSquare, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  Search,
  X,
  CheckSquare,
  Square,
  ShieldAlert,
  Sparkles,
  Flame,
  User,
  RotateCcw,
  Eye,
  Filter
} from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
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

  const { users, currentUser } = useAuth();

  // Filters state (By default, unconverted ideas only: includeConverted is FALSE)
  const [includeConverted, setIncludeConverted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'loophole' | 'enhancement'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'critical'
  const [onlyMyProposals, setOnlyMyProposals] = useState(false);

  // Stats
  const totalConvertedInProject = useMemo(() => {
    return visibleTasks.filter(t => t.status !== 'ideation' && t.status !== 'discussion').length;
  }, [visibleTasks]);

  const totalActiveIdeation = useMemo(() => {
    return visibleTasks.filter(t => t.status === 'ideation' || t.status === 'discussion').length;
  }, [visibleTasks]);

  const hasActiveFilters = Boolean(
    searchQuery || 
    typeFilter !== 'all' || 
    priorityFilter !== 'all' || 
    onlyMyProposals || 
    includeConverted
  );

  const handleResetFilters = () => {
    setIncludeConverted(false);
    setSearchQuery('');
    setTypeFilter('all');
    setPriorityFilter('all');
    setOnlyMyProposals(false);
  };

  // Filter tasks based on all active criteria
  const filteredTasks = useMemo(() => {
    return visibleTasks.filter(task => {
      const isConverted = task.status !== 'ideation' && task.status !== 'discussion';

      // Default: exclude tasks already converted to tickets unless toggle is checked
      if (!includeConverted && isConverted) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && task.type !== typeFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // My proposals filter
      if (onlyMyProposals && task.createdBy !== currentUser?.id) {
        return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (task.title || '').toLowerCase().includes(q);
        const idMatch = (task.id || '').toLowerCase().includes(q);
        const probMatch = (task.problemStatement || '').toLowerCase().includes(q);
        const solMatch = (task.proposedSolution || '').toLowerCase().includes(q);
        if (!titleMatch && !idMatch && !probMatch && !solMatch) {
          return false;
        }
      }

      return true;
    });
  }, [visibleTasks, includeConverted, typeFilter, priorityFilter, onlyMyProposals, searchQuery, currentUser]);

  // Split filtered tasks into active ideas vs converted tickets
  const activeIdeationThreads = filteredTasks.filter(t => t.status === 'ideation' || t.status === 'discussion');
  const convertedTicketsThreads = filteredTasks.filter(t => t.status !== 'ideation' && t.status !== 'discussion');

  const renderPitchCard = (task) => {
    const project = projects.find(p => p.id === task.projectId);
    const creator = users.find(u => u.id === task.createdBy);
    const comments = task.comments || [];
    const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;
    const latestCommentUser = latestComment ? users.find(u => u.id === latestComment.userId) : null;
    const isConverted = task.status !== 'ideation' && task.status !== 'discussion';
    const stage = STAGES.find(s => s.id === task.status);

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
            {isConverted && (
              <span 
                className="badge" 
                style={{ 
                  backgroundColor: 'var(--well)', 
                  border: '1px solid var(--line)',
                  color: stage?.color || 'var(--primary)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span className="project-dot" style={{ backgroundColor: stage?.color || 'var(--primary)', width: 6, height: 6 }} />
                Ticket: {stage?.label}
              </span>
            )}
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

        {/* Footer: Author, Stage Action & Comments */}
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
                type="button"
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
                type="button"
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

            {isConverted && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} color="var(--mint)" />
                Converted to Sprint
              </span>
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
        borderRadius: 14,
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
            <span className="badge" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', fontSize: 10 }}>
              Engineering Discovery
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
            Propose, analyze, and review project loopholes and feature enhancements before sprint implementation.
          </p>
        </div>

        <button
          type="button"
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

      {/* Ideation Filters Toolbar */}
      <div className="ideation-toolbar">
        {/* Keyword Search */}
        <div className="search-box-container">
          <Search size={14} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search proposals, specs, or solutions..."
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
              <X size={13} />
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="ideation-filters-wrap">
          {/* Default UNCHECKED: Include Converted Tickets */}
          <button
            type="button"
            className={`quick-filter-pill ${includeConverted ? 'active' : ''}`}
            onClick={() => setIncludeConverted(!includeConverted)}
            title="Include proposals that have already been converted into active sprint tickets"
            aria-pressed={includeConverted}
          >
            {includeConverted ? (
              <CheckSquare size={13} color="var(--primary)" />
            ) : (
              <Square size={13} color="var(--muted)" />
            )}
            <span>Show Converted Tickets ({totalConvertedInProject})</span>
          </button>

          {/* Loopholes Only */}
          <button
            type="button"
            className={`quick-filter-pill ${typeFilter === 'loophole' ? 'active' : ''}`}
            onClick={() => setTypeFilter(prev => prev === 'loophole' ? 'all' : 'loophole')}
            title="Show only loophole proposals"
          >
            <ShieldAlert size={12} color="var(--type-loophole)" />
            <span>Loopholes</span>
          </button>

          {/* Enhancements Only */}
          <button
            type="button"
            className={`quick-filter-pill ${typeFilter === 'enhancement' ? 'active' : ''}`}
            onClick={() => setTypeFilter(prev => prev === 'enhancement' ? 'all' : 'enhancement')}
            title="Show only enhancement proposals"
          >
            <Sparkles size={12} color="var(--type-enhancement)" />
            <span>Enhancements</span>
          </button>

          {/* Critical Only */}
          <button
            type="button"
            className={`quick-filter-pill ${priorityFilter === 'critical' ? 'active' : ''}`}
            onClick={() => setPriorityFilter(prev => prev === 'critical' ? 'all' : 'critical')}
            title="Show only critical priority proposals"
          >
            <Flame size={12} color="var(--priority-critical)" />
            <span>Critical Only</span>
          </button>

          {/* Created by Me */}
          <button
            type="button"
            className={`quick-filter-pill ${onlyMyProposals ? 'active' : ''}`}
            onClick={() => setOnlyMyProposals(!onlyMyProposals)}
            title="Show proposals created by you"
          >
            <User size={12} />
            <span>My Proposals</span>
          </button>

          {/* Reset Filters CTA if any filter is active */}
          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filters to default"
            >
              <RotateCcw size={11} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Converted Tickets Hidden Notice (shown when unchecked and converted tickets exist) */}
      {!includeConverted && totalConvertedInProject > 0 && (
        <div className="ideation-notice-bar">
          <span>
            Showing <strong>{activeIdeationThreads.length}</strong> active discovery proposals. <strong>{totalConvertedInProject}</strong> {totalConvertedInProject === 1 ? 'item already converted into a sprint ticket is' : 'items already converted into sprint tickets are'} hidden by default.
          </span>
          <button 
            type="button" 
            className="ideation-show-converted-link"
            onClick={() => setIncludeConverted(true)}
          >
            <Eye size={12} /> Show Converted Tickets
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {filteredTasks.length === 0 ? (
        hasActiveFilters ? (
          <div className="tickets-empty-filter-state">
            <Filter size={32} color="var(--muted)" />
            <h4 style={{ color: 'var(--text-primary)', margin: '10px 0 4px 0' }}>
              No proposals match your current filter criteria
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, margin: 0 }}>
              Try resetting your filters or click "Show Converted Tickets".
            </p>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ marginTop: 12 }}
              onClick={handleResetFilters}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          </div>
        ) : (
          <div className="ideation-empty-box">
            <Lightbulb size={36} color="var(--primary)" />
            <h4 style={{ color: 'var(--text-primary)', margin: '4px 0', fontSize: 16, fontWeight: 700 }}>
              No active proposals currently in ideation or discussion
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 460, margin: '0 auto 6px auto' }}>
              Spot a technical vulnerability or have a high-impact feature enhancement in mind? Submit an RFC proposal to review with your team.
            </p>
            <button 
              type="button"
              className="btn-primary"
              style={{ marginTop: 8 }}
              onClick={() => {
                setCreateInitialStage('ideation');
                setIsCreateModalOpen(true);
              }}
            >
              <Plus size={14} /> Record First Loophole or Idea
            </button>
          </div>
        )
      ) : (
        <>
          {/* Active Ideation & Discussion Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Ideation &amp; Discussion Threads ({activeIdeationThreads.length})
              </h3>
            </div>

            {activeIdeationThreads.length === 0 ? (
              <div className="ideation-empty-box">
                <Lightbulb size={32} color="var(--primary)" />
                <h4 style={{ color: 'var(--text-primary)', margin: '4px 0', fontSize: 15, fontWeight: 700 }}>
                  No active proposals currently in ideation or discussion
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, maxWidth: 440, margin: '0 auto 6px auto' }}>
                  All current items have been converted to active sprint tickets. Have you spotted a new loophole or enhancement?
                </p>
                <button 
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setCreateInitialStage('ideation');
                    setIsCreateModalOpen(true);
                  }}
                >
                  <Plus size={14} /> Record New Proposal
                </button>
              </div>
            ) : (
              <div className="ideation-grid">
                {activeIdeationThreads.map(renderPitchCard)}
              </div>
            )}
          </div>

          {/* Converted and Execution Showcase (Rendered only when toggle is checked) */}
          {includeConverted && convertedTicketsThreads.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Already Converted to Sprint Tickets &amp; Execution ({convertedTicketsThreads.length})
                </h3>
              </div>
              <div className="ideation-grid">
                {convertedTicketsThreads.map(renderPitchCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
