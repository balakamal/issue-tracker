import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Lock, 
  Globe, 
  Plus, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTasks, STAGES } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export function CreateTaskModal() {
  const { 
    isCreateModalOpen, 
    setIsCreateModalOpen, 
    createInitialStage, 
    addTask, 
    projects,
    selectedProjectId 
  } = useTasks();

  const { users, currentUser } = useAuth();

  const [type, setType] = useState('loophole'); // 'loophole' | 'enhancement'
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(() => {
    return selectedProjectId !== 'all' ? selectedProjectId : (projects[0]?.id || '');
  });
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState(createInitialStage || 'ideation');
  const [isPrivate, setIsPrivate] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newChecklistText.trim()) {
      setChecklistItems(prev => [
        ...prev,
        { id: `c-${Date.now()}`, text: newChecklistText.trim(), completed: false }
      ]);
      setNewChecklistText('');
    }
  };

  const handleRemoveSubtask = (id) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      type,
      priority,
      status: createInitialStage || status,
      projectId: projectId || projects[0]?.id,
      isPrivate,
      assigneeId: assigneeId || null,
      targetDate,
      problemStatement: problemStatement.trim(),
      proposedSolution: proposedSolution.trim(),
      checklist: checklistItems
    });

    // Reset and close
    setTitle('');
    setProblemStatement('');
    setProposedSolution('');
    setIsCreateModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      title="Record New Item or Loophole"
      icon={type === 'loophole' ? ShieldAlert : Sparkles}
      maxWidth={680}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Classification Type Selector */}
          <div className="form-group">
            <label className="form-label">Classification Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                className={`filter-pill-button ${type === 'loophole' ? 'active' : ''}`}
                style={{
                  height: 44,
                  justifyContent: 'center',
                  gap: 8,
                  borderColor: type === 'loophole' ? 'var(--type-loophole)' : undefined,
                  backgroundColor: type === 'loophole' ? 'var(--type-loophole-bg)' : undefined,
                  color: type === 'loophole' ? 'var(--type-loophole)' : undefined,
                }}
                onClick={() => setType('loophole')}
              >
                <ShieldAlert size={17} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800 }}>Project Loophole</div>
                  <div style={{ fontSize: 10.5, opacity: 0.8 }}>Vulnerability, bug, or risk</div>
                </div>
              </button>

              <button
                type="button"
                className={`filter-pill-button ${type === 'enhancement' ? 'active' : ''}`}
                style={{
                  height: 44,
                  justifyContent: 'center',
                  gap: 8,
                  borderColor: type === 'enhancement' ? 'var(--type-enhancement)' : undefined,
                  backgroundColor: type === 'enhancement' ? 'var(--type-enhancement-bg)' : undefined,
                  color: type === 'enhancement' ? 'var(--type-enhancement)' : undefined,
                }}
                onClick={() => setType('enhancement')}
              >
                <Sparkles size={17} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800 }}>Enhancement</div>
                  <div style={{ fontSize: 10.5, opacity: 0.8 }}>Feature, UX, or speed upgrade</div>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title / Summary *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder={type === 'loophole' ? 'e.g., Unindexed SQL query causing connection pool exhaustion' : 'e.g., Instant search autocomplete with client cache'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Project & Priority Rows */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Project Classification</label>
              <select
                className="form-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="critical">Critical (P0) — Block release</option>
                <option value="high">High (P1) — Major importance</option>
                <option value="medium">Medium (P2) — Standard backlog</option>
                <option value="low">Low (P3) — Minor enhancement</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select
                className="form-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Completion Date</label>
              <input
                type="date"
                className="form-input"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

          {/* Problem Statement / Trigger */}
          <div className="form-group">
            <label className="form-label">
              {type === 'loophole' ? 'Loophole / Problem Statement' : 'Opportunity & Motivation'}
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="What specifically is broken, vulnerable, or suboptimal?"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
            />
          </div>

          {/* Proposed Solution / Architecture Concept */}
          <div className="form-group">
            <label className="form-label">Proposed Solution Concept</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="How should this be addressed or implemented?"
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
            />
          </div>

          {/* Privacy Switch */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 10,
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {isPrivate ? 'Private (Classified)' : 'Project-Shared'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isPrivate ? 'Visible only to you' : 'Visible to all project collaborators'}
              </div>
            </div>
            <button
              type="button"
              className={`filter-pill-button ${isPrivate ? 'active' : ''}`}
              onClick={() => setIsPrivate(!isPrivate)}
            >
              {isPrivate ? <Lock size={13} /> : <Globe size={13} />}
              <span>{isPrivate ? 'Private' : 'Shared'}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Record Item
          </button>
        </div>
      </form>
    </Modal>
  );
}
