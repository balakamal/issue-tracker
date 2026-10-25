import React, { useState } from 'react';
import { FolderKanban, Plus, Trash2, Users, Check, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

const PRESET_COLORS = [
  '#79b6e3', '#6fd3b0', '#f2937c', '#e8bd62', '#24597a', '#a78bfa', '#60a5fa', '#a7b3bb'
];

export function ProjectManagerModal() {
  const { 
    isProjectManagerOpen, 
    setIsProjectManagerOpen, 
    projects, 
    allProjects,
    addProject, 
    deleteProject, 
    updateProjectMembers,
    tasks 
  } = useTasks();

  const { currentUser, users } = useAuth();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#79b6e3');
  const [selectedMemberIds, setSelectedMemberIds] = useState(() => currentUser ? [currentUser.id] : []);
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  const isAdmin = currentUser?.role === 'Admin';
  const isLead = currentUser?.role === 'Lead';
  const canManageProjects = isAdmin || isLead;

  // Admins see all projects; others see accessible projects
  const displayProjects = isAdmin ? (allProjects || projects) : projects;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Ensure creator is always in memberIds
    const finalMembers = Array.from(new Set([...selectedMemberIds, currentUser?.id].filter(Boolean)));

    addProject({
      name: name.trim(),
      key: key.trim().toUpperCase() || name.trim().slice(0, 4).toUpperCase(),
      description: description.trim(),
      color,
      memberIds: finalMembers
    });

    setName('');
    setKey('');
    setDescription('');
    setSelectedMemberIds(currentUser ? [currentUser.id] : []);
  };

  const handleToggleMember = (projectId, currentMemberIds, userId) => {
    const list = Array.isArray(currentMemberIds) ? [...currentMemberIds] : [];
    const index = list.indexOf(userId);
    let updated;
    if (index >= 0) {
      updated = list.filter(id => id !== userId);
    } else {
      updated = [...list, userId];
    }
    updateProjectMembers(projectId, updated);
  };

  const toggleNewProjectMember = (userId) => {
    setSelectedMemberIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Modal
      isOpen={isProjectManagerOpen}
      onClose={() => setIsProjectManagerOpen(false)}
      title="Project Classifications & Workspaces"
      icon={FolderKanban}
      maxWidth={680}
    >
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Existing Projects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Active Project Workspaces ({displayProjects.length})
            </label>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Projects and their public tasks are only visible to assigned members & Admins
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
            {displayProjects.map(proj => {
              const count = tasks.filter(t => t.projectId === proj.id).length;
              const isExpanded = expandedProjectId === proj.id;
              const memberIds = Array.isArray(proj.memberIds) ? proj.memberIds : [];
              const canEditThisProject = isAdmin || isLead || proj.createdBy === currentUser?.id;

              return (
                <div 
                  key={proj.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 10,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: proj.color, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({proj.key})</span>
                        </div>
                        {proj.description && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {proj.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 600,
                          backgroundColor: isExpanded ? 'rgba(121, 182, 227, 0.15)' : 'var(--bg-input)',
                          color: isExpanded ? 'var(--sky)' : 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer'
                        }}
                        title="View and manage project team members"
                      >
                        <Users size={12} />
                        <span>{memberIds.length} {memberIds.length === 1 ? 'member' : 'members'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {count} items
                      </span>

                      {canEditThisProject && displayProjects.length > 1 && (
                        <button
                          className="modal-close-btn"
                          style={{ width: 26, height: 26 }}
                          onClick={() => {
                            if (window.confirm(`Delete project "${proj.name}"? This action cannot be undone.`)) {
                              deleteProject(proj.id);
                            }
                          }}
                          title="Delete project"
                        >
                          <Trash2 size={13} color="var(--type-loophole)" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Project Team Members Drawer */}
                  {isExpanded && (
                    <div 
                      style={{
                        padding: '12px 14px',
                        borderTop: '1px solid var(--border-subtle)',
                        backgroundColor: 'rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}
                    >
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Assigned Team Members:</span>
                        {!canEditThisProject && (
                          <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>(View only - Admin/Lead privilege required to edit)</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {users.map(u => {
                          const isMember = memberIds.includes(u.id);
                          return (
                            <button
                              type="button"
                              key={u.id}
                              disabled={!canEditThisProject}
                              onClick={() => canEditThisProject && handleToggleMember(proj.id, memberIds, u.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 10px',
                                borderRadius: 16,
                                fontSize: 11.5,
                                fontWeight: 500,
                                backgroundColor: isMember ? 'rgba(111, 211, 176, 0.15)' : 'var(--bg-card)',
                                border: `1px solid ${isMember ? 'rgba(111, 211, 176, 0.4)' : 'var(--border-subtle)'}`,
                                color: isMember ? 'var(--mint)' : 'var(--text-secondary)',
                                cursor: canEditThisProject ? 'pointer' : 'default',
                                opacity: !canEditThisProject && !isMember ? 0.4 : 1
                              }}
                            >
                              <Avatar user={u} size={18} showTooltip={false} />
                              <span>{u.name || u.email?.split('@')[0]}</span>
                              {isMember && <Check size={11} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create New Project Form */}
        <form onSubmit={handleSubmit} style={{ 
          marginTop: 6, 
          padding: 16, 
          borderRadius: 12, 
          backgroundColor: 'var(--bg-input)', 
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Add New Project Classification
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Cloud Security Mesh"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Key Prefix</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., MESH"
                maxLength={6}
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="Primary scope or architecture focus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Assign Initial Team Members */}
          <div className="form-group">
            <label className="form-label">Assign Team Members to Project</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {users.map(u => {
                const isSelected = selectedMemberIds.includes(u.id);
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggleNewProjectMember(u.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 16,
                      fontSize: 11.5,
                      fontWeight: 500,
                      backgroundColor: isSelected ? 'rgba(121, 182, 227, 0.18)' : 'var(--bg-card)',
                      border: `1px solid ${isSelected ? 'rgba(121, 182, 227, 0.5)' : 'var(--border-subtle)'}`,
                      color: isSelected ? 'var(--sky)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <Avatar user={u} size={18} showTooltip={false} />
                    <span>{u.name || u.email?.split('@')[0]}</span>
                    {isSelected && <Check size={11} />}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Selected users will be able to see and participate in this project.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Color Accent</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRESET_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '2px solid #FFF' : 'none',
                    boxShadow: color === c ? '0 0 8px ' + c : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: 12.5 }}>
              <Plus size={14} /> Add Project
            </button>
          </div>
        </form>
      </div>

      <div className="modal-footer">
        <button className="btn-secondary" onClick={() => setIsProjectManagerOpen(false)}>
          Done
        </button>
      </div>
    </Modal>
  );
}
export default ProjectManagerModal;
