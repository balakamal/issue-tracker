import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lightbulb, 
  CheckSquare, 
  MessageSquare, 
  Sliders, 
  Trash2, 
  Plus, 
  Calendar, 
  Lock, 
  Globe, 
  Send,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { TypeBadge, PriorityBadge, PrivacyBadge, ProjectChip } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { AssigneePicker } from '../common/AssigneePicker';

export function TaskDetailDrawer() {
  const { 
    selectedTask, 
    setSelectedTaskId, 
    updateTask, 
    deleteTask, 
    moveTaskStage,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addComment,
    toggleReaction,
    projects
  } = useTasks();

  const { users, currentUser } = useAuth();

  const [displayedTask, setDisplayedTask] = useState(selectedTask);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('ideation'); // 'ideation' | 'checklist' | 'discussion' | 'metadata'
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Editable fields
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editProblem, setEditProblem] = useState('');
  const [editSolution, setEditSolution] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');

  useEffect(() => {
    if (selectedTask) {
      setDisplayedTask(selectedTask);
      setIsClosing(false);
      setEditTitle(selectedTask.title);
      setEditProblem(selectedTask.problemStatement || '');
      setEditSolution(selectedTask.proposedSolution || '');
      setEditTargetDate(selectedTask.targetDate || '');
      setIsEditingSpecs(false);
    } else if (displayedTask) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setDisplayedTask(null);
        setIsClosing(false);
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [selectedTask, displayedTask]);

  const handleClose = () => {
    setSelectedTaskId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && displayedTask && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedTask, isClosing]);

  const currentTask = selectedTask || displayedTask;
  if (!currentTask) return null;

  const project = projects.find(p => p.id === currentTask.projectId);
  const assignee = users.find(u => u.id === currentTask.assigneeId);
  const creator = users.find(u => u.id === currentTask.createdBy);

  const isAdmin = currentUser?.role === 'Admin';
  const isLead = currentUser?.role === 'Lead';
  const isCreator = Boolean(currentUser && currentTask && currentTask.createdBy === currentUser.id);
  const canEditTask = isAdmin || isLead || isCreator;
  const canDeleteTask = currentTask.isPrivate ? isCreator : (isAdmin || isLead || isCreator);

  const checklist = currentTask.checklist || [];
  const completedCount = checklist.filter(c => c.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSaveSpecs = () => {
    updateTask(currentTask.id, {
      title: editTitle.trim() || currentTask.title,
      problemStatement: editProblem.trim(),
      proposedSolution: editSolution.trim(),
      targetDate: editTargetDate
    });
    setIsEditingSpecs(false);
  };

  const handleAddSubtaskSubmit = (e) => {
    e.preventDefault();
    if (newSubtaskText.trim()) {
      addSubtask(currentTask.id, newSubtaskText);
      setNewSubtaskText('');
    }
  };

  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      addComment(currentTask.id, newCommentText);
      setNewCommentText('');
    }
  };

  const handleTogglePrivacy = () => {
    updateTask(currentTask.id, {
      isPrivate: !currentTask.isPrivate
    });
  };

  return (
    <div 
      className={`drawer-overlay ${isClosing ? 'drawer-overlay-closing' : ''}`} 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`drawer-container ${isClosing ? 'drawer-container-closing' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-muted)' }}>
              {currentTask.id}
            </span>
            <TypeBadge type={currentTask.type} />
            <PriorityBadge priority={currentTask.priority} />
            
            {/* Stage Selector Dropdown */}
            <select
              className="filter-select"
              style={{ height: 28, fontSize: 12, padding: '0 8px' }}
              value={currentTask.status}
              onChange={(e) => moveTaskStage(currentTask.id, e.target.value)}
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>
                  Stage: {s.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Privacy toggle button */}
            <button
              className={`filter-pill-button ${currentTask.isPrivate ? 'active' : ''}`}
              style={{ height: 28, fontSize: 11.5 }}
              onClick={handleTogglePrivacy}
              title={currentTask.isPrivate ? "Classified as Private. Click to share with project team." : "Shared with project team. Click to make private."}
            >
              {currentTask.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
              <span>{currentTask.isPrivate ? 'Private' : 'Project-Shared'}</span>
            </button>

            <button className="modal-close-btn" onClick={handleClose} title="Close drawer" aria-label="Close drawer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="drawer-tabs-nav">
          <button 
            className={`drawer-tab-btn ${activeTab === 'ideation' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideation')}
          >
            <Lightbulb size={15} />
            <span>Ideation &amp; Specs</span>
          </button>

          <button 
            className={`drawer-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={15} />
            <span>Implementation Tasks ({completedCount}/{totalCount})</span>
          </button>

          <button 
            className={`drawer-tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            <MessageSquare size={15} />
            <span>Team Discussion ({(currentTask.comments || []).length})</span>
          </button>

          <button 
            className={`drawer-tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
            onClick={() => setActiveTab('metadata')}
          >
            <Sliders size={15} />
            <span>Classification &amp; Meta</span>
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="drawer-body">
          <div key={activeTab} className="drawer-tab-content-anim">
          {/* TAB 1: IDEATION & SPECS */}
          {activeTab === 'ideation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {isEditingSpecs ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Task Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {currentTask.type === 'loophole' ? 'Loophole / Problem Statement' : 'Opportunity & Motivation'}
                    </label>
                    <textarea 
                      className="form-textarea" 
                      rows={4}
                      value={editProblem}
                      onChange={(e) => setEditProblem(e.target.value)}
                      placeholder="Detail the technical vulnerability, race condition, or UX loophole..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Proposed Solution Concept</label>
                    <textarea 
                      className="form-textarea" 
                      rows={4}
                      value={editSolution}
                      onChange={(e) => setEditSolution(e.target.value)}
                      placeholder="Describe the proposed technical architecture, fix, or workflow..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Completion Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={editTargetDate}
                      onChange={(e) => setEditTargetDate(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button className="btn-secondary" onClick={() => setIsEditingSpecs(false)}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSaveSpecs}>
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <ProjectChip project={project} />
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>
                        {currentTask.title}
                      </h2>
                    </div>
                    {canEditTask && (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => setIsEditingSpecs(true)}
                      >
                        Edit Details
                      </button>
                    )}
                  </div>

                  {/* Problem Statement Box */}
                  <div className="ideation-spec-box">
                    <div className="spec-heading" style={{ color: currentTask.type === 'loophole' ? 'var(--type-loophole)' : 'var(--primary)' }}>
                      {currentTask.type === 'loophole' ? 'Loophole / Gap Specification:' : 'Enhancement Scope & Motivation:'}
                    </div>
                    <div className="spec-content">
                      {currentTask.problemStatement || 'No problem statement recorded yet. Click Edit Details to add technical context.'}
                    </div>
                  </div>

                  {/* Proposed Solution Box */}
                  <div className="ideation-spec-box">
                    <div className="spec-heading" style={{ color: 'var(--primary)' }}>
                      Proposed Solution &amp; Architecture:
                    </div>
                    <div className="spec-content">
                      {currentTask.proposedSolution || 'No solution concept specified yet. Brainstorm with your team in the Discussion tab.'}
                    </div>
                  </div>

                  {/* Assignment, Creator, and Target Date info */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px', 
                    borderRadius: 10, 
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                          Assignee
                        </span>
                        <AssigneePicker
                          currentAssigneeId={currentTask.assigneeId}
                          projectId={currentTask.projectId}
                          onAssign={(newUserId) => updateTask(currentTask.id, { assigneeId: newUserId })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar user={creator} size={26} />
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ideated by</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {creator?.name || 'Team'}
                          </div>
                        </div>
                      </div>

                      {currentTask.targetDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <Calendar size={14} />
                          <span>Target: {new Date(currentTask.targetDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPLEMENTATION CHECKLIST */}
          {activeTab === 'checklist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Progress Summary Card */}
              <div style={{ 
                padding: '16px 20px', 
                borderRadius: 12, 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Implementation Completion
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: progressPercent === 100 ? 'var(--status-done)' : 'var(--primary)' }}>
                    {completedCount} of {totalCount} completed ({progressPercent}%)
                  </span>
                </div>
                <div className="checklist-progress-bar-track" style={{ height: 8 }}>
                  <div 
                    className={`checklist-progress-bar-fill ${progressPercent === 100 ? 'complete' : ''}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items List */}
              <div className="checklist-wrapper">
                {checklist.map(item => (
                  <div key={item.id} className="checklist-item-row">
                    <input 
                      type="checkbox" 
                      className="checklist-checkbox"
                      checked={item.completed}
                      onChange={() => toggleSubtask(currentTask.id, item.id)}
                    />
                    <span className={`checklist-text ${item.completed ? 'completed' : ''}`}>
                      {item.text}
                    </span>
                    <button 
                      className="card-quick-menu-btn" 
                      onClick={() => deleteSubtask(currentTask.id, item.id)}
                      title="Delete subtask"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {checklist.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
                    <p>No implementation tasks added yet. Break down this loophole or enhancement into actionable checklist steps below.</p>
                  </div>
                )}
              </div>

              {/* Add New Subtask Form */}
              <form onSubmit={handleAddSubtaskSubmit} className="checklist-add-row">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Add actionable implementation step or test case..."
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ flexShrink: 0, padding: '9px 14px' }}>
                  <Plus size={16} /> Add Task
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: TEAM DISCUSSION */}
          {activeTab === 'discussion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Discussion Feed */}
              <div className="discussion-feed">
                {(currentTask.comments || []).map(comm => {
                  const commentAuthor = users.find(u => u.id === comm.userId);
                  const reactions = comm.reactions || {};
                  return (
                    <div key={comm.id} className="comment-card">
                      <Avatar user={commentAuthor} size={32} showTooltip={false} />
                      <div className="comment-content-area">
                        <div className="comment-meta">
                          <span className="comment-author-name">{commentAuthor?.name || 'Team Member'}</span>
                          <span className="comment-time">
                            • {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="comment-text">
                          {comm.text}
                        </div>

                        {/* Emoji Reactions */}
                        <div className="comment-actions">
                          {['👍', '🔥', '💡', '⚠️', '🚀'].map(emoji => {
                            const count = reactions[emoji] || 0;
                            return (
                              <button
                                key={emoji}
                                className={`reaction-btn ${count > 0 ? 'reacted' : ''}`}
                                onClick={() => toggleReaction(currentTask.id, comm.id, emoji)}
                              >
                                <span>{emoji}</span>
                                {count > 0 && <span>{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(currentTask.comments || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
                    <MessageSquare size={30} style={{ opacity: 0.4, margin: '0 auto 8px auto' }} />
                    <p>No discussion comments yet. Start the conversation with your team!</p>
                  </div>
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddCommentSubmit} className="comment-input-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Avatar user={currentUser} size={22} showTooltip={false} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Commenting as {currentUser.name}
                  </span>
                </div>
                <textarea
                  className="comment-textarea"
                  placeholder="Share feedback, architectural concerns, or suggestions..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={2}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '7px 14px', fontSize: 12.5 }}>
                    <Send size={13} /> Post Comment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: METADATA & CLASSIFICATION */}
          {activeTab === 'metadata' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Project Classification */}
              <div className="form-group">
                <label className="form-label">Project Classification</label>
                <select
                  className="form-select"
                  value={currentTask.projectId}
                  onChange={(e) => updateTask(currentTask.id, { projectId: e.target.value })}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <AssigneePicker
                  currentAssigneeId={currentTask.assigneeId}
                  projectId={currentTask.projectId}
                  onAssign={(newUserId) => updateTask(currentTask.id, { assigneeId: newUserId })}
                />
              </div>

              {/* Priority */}
              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-select"
                  value={currentTask.priority}
                  onChange={(e) => updateTask(currentTask.id, { priority: e.target.value })}
                >
                  <option value="critical">Critical (P0) — Blocks release / high risk</option>
                  <option value="high">High (P1) — Major loophole or enhancement</option>
                  <option value="medium">Medium (P2) — Normal sprint priority</option>
                  <option value="low">Low (P3) — Nice to have / backlog</option>
                </select>
              </div>

              {/* Privacy Setting */}
              <div style={{ 
                padding: '14px 16px', 
                borderRadius: 10, 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Task Privacy Setting
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {currentTask.isPrivate 
                      ? "Classified: Only you (the creator) can see this item."
                      : "Project-Shared: Anyone collaborating on this project can view and discuss."}
                  </div>
                </div>

                {canEditTask && (
                  <button 
                    className={`filter-pill-button ${currentTask.isPrivate ? 'active' : ''}`}
                    onClick={handleTogglePrivacy}
                  >
                    {currentTask.isPrivate ? <Lock size={13} /> : <Globe size={13} />}
                    <span>{currentTask.isPrivate ? 'Make Public' : 'Make Private'}</span>
                  </button>
                )}
              </div>

              {/* Delete Task - Role Based Permissions */}
              {canDeleteTask ? (
                <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    className="btn-danger"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${currentTask.id} (${currentTask.title})?`)) {
                        deleteTask(currentTask.id);
                        handleClose();
                      }
                    }}
                  >
                    <Trash2 size={15} /> Delete Task Permanently
                  </button>
                </div>
              ) : (
                <div style={{ 
                  marginTop: 24, 
                  paddingTop: 14, 
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: 12,
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Lock size={13} />
                  <span>
                    {currentTask.isPrivate 
                      ? "Private task: only the task author can delete this item." 
                      : "Public task: only the task author, Lead, or Admin can delete this item."}
                  </span>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
