import React, { useState } from 'react';
import { FolderKanban, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTasks } from '../../context/TaskContext';

const PRESET_COLORS = [
  '#79b6e3', '#6fd3b0', '#f2937c', '#e8bd62', '#24597a', '#a78bfa', '#60a5fa', '#a7b3bb'
];

export function ProjectManagerModal() {
  const { 
    isProjectManagerOpen, 
    setIsProjectManagerOpen, 
    projects, 
    addProject, 
    deleteProject, 
    tasks 
  } = useTasks();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#79b6e3');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      name: name.trim(),
      key: key.trim().toUpperCase() || name.trim().slice(0, 4).toUpperCase(),
      description: description.trim(),
      color
    });

    setName('');
    setKey('');
    setDescription('');
  };

  return (
    <Modal
      isOpen={isProjectManagerOpen}
      onClose={() => setIsProjectManagerOpen(false)}
      title="Project Classifications & Workspaces"
      icon={FolderKanban}
      maxWidth={640}
    >
      <div className="modal-body">
        {/* Existing Projects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="form-label">Active Project Classifications ({projects.length})</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
            {projects.map(proj => {
              const count = tasks.filter(t => t.projectId === proj.id).length;
              return (
                <div 
                  key={proj.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: proj.color }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {proj.name} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({proj.key})</span>
                      </div>
                      {proj.description && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {proj.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {count} items
                    </span>
                    {projects.length > 1 && (
                      <button
                        className="modal-close-btn"
                        style={{ width: 26, height: 26 }}
                        onClick={() => {
                          if (window.confirm(`Delete project "${proj.name}"?`)) {
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
              );
            })}
          </div>
        </div>

        {/* Create New Project Form */}
        <form onSubmit={handleSubmit} style={{ 
          marginTop: 10, 
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
