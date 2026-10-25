import React, { useState } from 'react';
import { Users, UserPlus, Shield, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export function UserManagementModal() {
  const { users, currentUser, updateUserRole, adminAddUser } = useAuth();
  const { isUserManagementOpen, setIsUserManagementOpen } = useTasks();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [updatingUserId, setUpdatingUserId] = useState(null);

  if (!isUserManagementOpen) return null;

  // Only Admin can see/use this modal
  if (currentUser?.role !== 'Admin') {
    return (
      <Modal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        title="Access Restricted"
        icon={Shield}
        maxWidth={480}
      >
        <div className="modal-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <AlertCircle size={36} color="var(--type-loophole)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Administrator Privileges Required</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            User management and role assignments can only be configured by workspace Administrators.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setIsUserManagementOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.id === currentUser.id && newRole !== 'Admin') {
      const confirmSelf = window.confirm(
        'Warning: Demoting your own account from Admin will revoke your access to this User Management console. Continue?'
      );
      if (!confirmSelf) return;
    }

    try {
      setUpdatingUserId(targetUser.id);
      setFeedback({ type: '', text: '' });
      await updateUserRole(targetUser.id, newRole);
      setFeedback({
        type: 'success',
        text: `Updated role for ${targetUser.name || targetUser.email} to ${newRole}.`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to update user role.'
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      setIsSubmitting(true);
      setFeedback({ type: '', text: '' });
      await adminAddUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || 'welcome123',
        role
      });

      setFeedback({
        type: 'success',
        text: `Successfully created user ${name.trim()} with role ${role}.`
      });
      setName('');
      setEmail('');
      setPassword('');
      setRole('Employee');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to create user.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isUserManagementOpen}
      onClose={() => {
        setFeedback({ type: '', text: '' });
        setIsUserManagementOpen(false);
      }}
      title="Workspace Team & Role Management"
      icon={Users}
      maxWidth={720}
    >
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Banner Feedback */}
        {feedback.text && (
          <div 
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: feedback.type === 'error' ? 'rgba(235, 87, 87, 0.12)' : 'rgba(111, 211, 176, 0.12)',
              border: `1px solid ${feedback.type === 'error' ? 'rgba(235, 87, 87, 0.3)' : 'rgba(111, 211, 176, 0.3)'}`,
              color: feedback.type === 'error' ? 'var(--type-loophole)' : 'var(--mint)'
            }}
          >
            {feedback.type === 'error' ? <AlertCircle size={15} /> : <Check size={15} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Existing Users Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Active Workspace Members ({users.length})
            </label>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Changes sync immediately to cloud and active sessions
            </span>
          </div>

          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 280,
              overflowY: 'auto',
              paddingRight: 4
            }}
          >
            {users.map(u => {
              const isMe = u.id === currentUser.id;
              const isPending = updatingUserId === u.id;
              const userRole = u.role || 'Employee';

              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <Avatar user={u} size={34} showTooltip={false} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name || u.email?.split('@')[0] || 'Unnamed User'}
                        </span>
                        {isMe && (
                          <span className="pill pill--sky" style={{ height: 18, fontSize: 10, padding: '0 6px' }}>
                            You
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.email || `${u.username || 'user'}@issuetracker.internal`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                      <select
                        aria-label={`Role for ${u.name || u.email}`}
                        value={userRole}
                        disabled={isPending}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        style={{
                          height: 30,
                          padding: '0 26px 0 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: userRole === 'Admin' 
                            ? 'rgba(121, 182, 227, 0.15)' 
                            : userRole === 'Lead' 
                              ? 'rgba(167, 139, 250, 0.15)' 
                              : 'var(--bg-input)',
                          color: userRole === 'Admin' 
                            ? 'var(--sky)' 
                            : userRole === 'Lead' 
                              ? '#a78bfa' 
                              : 'var(--text-secondary)',
                          border: `1px solid ${
                            userRole === 'Admin' 
                              ? 'rgba(121, 182, 227, 0.35)' 
                              : userRole === 'Lead'
                                ? 'rgba(167, 139, 250, 0.35)'
                                : 'var(--border-subtle)'
                          }`,
                          cursor: isPending ? 'wait' : 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Lead">Lead</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Member Section */}
        <form 
          onSubmit={handleCreateUser}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            <UserPlus size={15} color="var(--sky)" />
            <span>Add New Workspace Member</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Maya Lin"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. maya@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Default Password (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="welcome123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Leave empty for default "welcome123"
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role</label>
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Employee">Employee (Default Least Privilege)</option>
                <option value="Lead">Lead (Project Oversight)</option>
                <option value="Admin">Admin (Full Control)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ padding: '8px 16px', fontSize: 12.5 }}
              disabled={isSubmitting}
            >
              <UserPlus size={14} />
              <span>{isSubmitting ? 'Adding...' : 'Add Team Member'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="modal-footer">
        <button 
          className="btn-secondary" 
          onClick={() => {
            setFeedback({ type: '', text: '' });
            setIsUserManagementOpen(false);
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
export default UserManagementModal;
