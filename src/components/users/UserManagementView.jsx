import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Check, 
  AlertCircle, 
  Search, 
  ShieldAlert, 
  Sparkles,
  Lock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export function UserManagementView() {
  const { users, currentUser, updateUserRole, adminAddUser } = useAuth();
  const { tasks, setActiveView } = useTasks();

  const [searchMember, setSearchMember] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Member Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Role Security Check
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="user-management-restricted">
        <div className="restricted-card">
          <div className="restricted-icon-wrap">
            <ShieldAlert size={36} color="var(--type-loophole)" />
          </div>
          <h2 className="restricted-title">Administrator Privileges Required</h2>
          <p className="restricted-desc">
            User management, permission matrices, and role assignments are restricted exclusively to workspace Administrators.
          </p>
          <button 
            type="button" 
            className="btn btn--primary" 
            onClick={() => setActiveView('tickets')}
          >
            <span>Return to Tickets</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Summary Metrics
  const totalCount = users.length;
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const leadCount = users.filter(u => u.role === 'Lead').length;
  const employeeCount = users.filter(u => (u.role || 'Employee') === 'Employee').length;

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && (u.role || 'Employee') !== roleFilter) {
        return false;
      }
      if (searchMember.trim()) {
        const q = searchMember.toLowerCase();
        const matchesName = (u.name || '').toLowerCase().includes(q);
        const matchesEmail = (u.email || '').toLowerCase().includes(q);
        return matchesName || matchesEmail;
      }
      return true;
    });
  }, [users, roleFilter, searchMember]);

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
      setShowAddForm(false);
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
    <div className="user-management-container">
      {/* Page Header */}
      <div className="user-mgmt-header">
        <div>
          <div className="user-mgmt-breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <span>Administration</span>
            <span>/</span>
            <span className="current">User Management</span>
          </div>
          <h1 className="user-mgmt-title">Workspace Team & Role Administration</h1>
          <p className="user-mgmt-subtitle">
            Manage active members, configure enterprise role access (Admin, Lead, Employee), and review assignment velocity.
          </p>
        </div>

        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setShowAddForm(prev => !prev)}
        >
          <UserPlus size={15} />
          <span>{showAddForm ? 'Close Form' : 'Add New Member'}</span>
        </button>
      </div>

      {/* KPI Stats Tiles */}
      <div className="user-mgmt-stats-grid">
        <div className="user-stat-card">
          <div className="stat-card-label">Total Workspace Members</div>
          <div className="stat-card-value">{totalCount}</div>
          <div className="stat-card-meta">Active enterprise accounts</div>
        </div>

        <div className="user-stat-card">
          <div className="stat-card-label">Administrators</div>
          <div className="stat-card-value" style={{ color: 'var(--sky)' }}>{adminCount}</div>
          <div className="stat-card-meta">Full system & security control</div>
        </div>

        <div className="user-stat-card">
          <div className="stat-card-label">Project Leads</div>
          <div className="stat-card-value" style={{ color: '#a78bfa' }}>{leadCount}</div>
          <div className="stat-card-meta">Project oversight & scoping</div>
        </div>

        <div className="user-stat-card">
          <div className="stat-card-label">Employees / Contributors</div>
          <div className="stat-card-value" style={{ color: 'var(--mint)' }}>{employeeCount}</div>
          <div className="stat-card-meta">Task implementation</div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.text && (
        <div 
          className="user-mgmt-feedback"
          style={{
            backgroundColor: feedback.type === 'error' ? 'rgba(235, 87, 87, 0.12)' : 'rgba(111, 211, 176, 0.12)',
            borderColor: feedback.type === 'error' ? 'rgba(235, 87, 87, 0.3)' : 'rgba(111, 211, 176, 0.3)',
            color: feedback.type === 'error' ? 'var(--type-loophole)' : 'var(--mint)'
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={15} /> : <Check size={15} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Add New Member Drawer/Card */}
      {showAddForm && (
        <form onSubmit={handleCreateUser} className="user-mgmt-add-form">
          <div className="form-header">
            <UserPlus size={16} color="var(--sky)" />
            <span>Create New Team Member Account</span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Connor"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. sarah@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input
                type="text"
                className="form-input"
                placeholder="welcome123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="form-hint">Leave blank for default "welcome123"</span>
            </div>

            <div className="form-group">
              <label className="form-label">Workspace Role</label>
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Employee">Employee (Task Implementation)</option>
                <option value="Lead">Lead (Project Oversight)</option>
                <option value="Admin">Admin (Full Control)</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn--secondary" 
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn--primary" 
              disabled={isSubmitting}
            >
              <UserPlus size={14} />
              <span>{isSubmitting ? 'Creating...' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Toolbar */}
      <div className="user-mgmt-toolbar">
        <div className="search-box-container">
          <Search size={14} className="search-box-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
          />
        </div>

        <div className="filter-select-wrapper">
          <Filter size={13} className="filter-select-icon" />
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            title="Filter by Role"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="Admin">Admins ({adminCount})</option>
            <option value="Lead">Leads ({leadCount})</option>
            <option value="Employee">Employees ({employeeCount})</option>
          </select>
        </div>
      </div>

      {/* Members Roster Table */}
      <div className="user-mgmt-table-wrapper">
        <table className="user-mgmt-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Assigned Role</th>
              <th>Active Tickets</th>
              <th>Ideated Items</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const isMe = u.id === currentUser.id;
              const isPending = updatingUserId === u.id;
              const userRole = u.role || 'Employee';
              const assignedTasksCount = tasks.filter(t => t.assigneeId === u.id && t.status !== 'done').length;
              const createdTasksCount = tasks.filter(t => t.createdBy === u.id).length;

              return (
                <tr key={u.id} className="user-mgmt-row">
                  {/* Member Details */}
                  <td>
                    <div className="user-cell">
                      <Avatar user={u} size={36} showTooltip={false} />
                      <div className="user-info">
                        <div className="user-name-row">
                          <span className="user-name">{u.name || u.email?.split('@')[0] || 'User'}</span>
                          {isMe && <span className="pill pill--sky user-you-pill">You</span>}
                        </div>
                        <span className="user-email">{u.email || `${u.username || 'user'}@issuetracker.internal`}</span>
                      </div>
                    </div>
                  </td>

                  {/* Role Selector */}
                  <td>
                    <select
                      aria-label={`Role for ${u.name || u.email}`}
                      value={userRole}
                      disabled={isPending}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className={`role-select role-select--${userRole.toLowerCase()}`}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Lead">Lead</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </td>

                  {/* Active Tasks */}
                  <td>
                    <span className="task-count-chip">
                      {assignedTasksCount} open
                    </span>
                  </td>

                  {/* Ideated Items */}
                  <td>
                    <span className="task-count-chip">
                      {createdTasksCount} reported
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <div className="status-cell">
                      <span className="status-live-dot" />
                      <span>Active</span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-table-cell">
                  No workspace members found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enterprise Role Matrix Guide */}
      <div className="role-permissions-guide">
        <h4 className="guide-title">
          <Shield size={15} color="var(--sky)" />
          <span>Role Permissions Matrix</span>
        </h4>
        <div className="guide-grid">
          <div className="guide-col">
            <span className="guide-pill pill--sky">Admin</span>
            <p>Full workspace control. Manage team members, grant/revoke roles, view all projects and private tasks, connect Firebase cloud synchronization.</p>
          </div>
          <div className="guide-col">
            <span className="guide-pill pill--purple">Lead</span>
            <p>Project leadership. Create project classifications, manage team members inside projects, review ideation pitches, and organize sprints.</p>
          </div>
          <div className="guide-col">
            <span className="guide-pill pill--mint">Employee</span>
            <p>Execution & discovery. Create enhancements and loopholes, view accessible projects, manage assigned checklists, add comments and reactions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default UserManagementView;
