import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Check, Search, UserCheck, ChevronDown, UserX } from 'lucide-react';
import { Avatar } from './Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export function AssigneePicker({
  currentAssigneeId,
  projectId,
  onAssign,
  compact = false,
  disabled = false,
  align = 'left',
  direction = 'down'
}) {
  const { users, currentUser } = useAuth();
  const { projects } = useTasks();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    // Focus search input on open
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const currentAssignee = useMemo(() => {
    if (!currentAssigneeId) return null;
    return users.find(u => u.id === currentAssigneeId) || null;
  }, [users, currentAssigneeId]);

  // Project-based members filtering
  const assignableUsers = useMemo(() => {
    if (currentProject && Array.isArray(currentProject.memberIds) && currentProject.memberIds.length > 0) {
      const memberSet = new Set(currentProject.memberIds);
      if (currentProject.createdBy) memberSet.add(currentProject.createdBy);
      
      const filtered = users.filter(u => memberSet.has(u.id));
      // If none matched (e.g. legacy IDs), fallback to all users
      return filtered.length > 0 ? filtered : users;
    }
    return users;
  }, [currentProject, users]);

  // Filtered by search query
  const displayedUsers = useMemo(() => {
    if (!searchQuery.trim()) return assignableUsers;
    const q = searchQuery.toLowerCase().trim();
    return assignableUsers.filter(u => 
      (u.name || '').toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [assignableUsers, searchQuery]);

  const handleSelect = (userId, e) => {
    if (e) e.stopPropagation();
    onAssign(userId || null);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen(prev => !prev);
    setSearchQuery('');
  };

  return (
    <div 
      className={`assignee-picker-wrapper ${compact ? 'compact' : ''} ${isOpen ? 'is-open' : ''}`} 
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className={`assignee-picker-btn ${compact ? 'compact' : ''} ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        disabled={disabled}
        title={currentAssignee ? `Assigned to: ${currentAssignee.name} (${currentAssignee.role || 'Member'}). Click to reassign.` : 'Unassigned. Click to assign.'}
      >
        <Avatar user={currentAssignee} size={compact ? 22 : 26} showTooltip={false} />
        
        {!compact && (
          <div className="assignee-picker-btn-text">
            <span className="assignee-picker-name">
              {currentAssignee ? currentAssignee.name : 'Unassigned'}
            </span>
            {currentAssignee?.role && (
              <span className="assignee-picker-role">{currentAssignee.role}</span>
            )}
          </div>
        )}

        <ChevronDown size={compact ? 11 : 13} className={`assignee-picker-chev ${isOpen ? 'open' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className={`assignee-picker-popover align-${align} direction-${direction}`}>
          <div className="assignee-picker-header">
            <span>Assign to</span>
            {currentProject && (
              <span className="assignee-picker-project-badge" title={`Project: ${currentProject.name}`}>
                {currentProject.key || currentProject.name}
              </span>
            )}
          </div>

          {/* Quick Search if more than 3 users */}
          {assignableUsers.length > 3 && (
            <div className="assignee-picker-search-wrap">
              <Search size={12} className="assignee-picker-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="assignee-picker-search-input"
                placeholder="Search member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="assignee-picker-list">
            {/* Quick 'Assign to me' shortcut if logged in and not already assigned */}
            {currentUser && currentAssigneeId !== currentUser.id && (
              <button
                type="button"
                className="assignee-picker-item quick-me"
                onClick={(e) => handleSelect(currentUser.id, e)}
              >
                <div className="assignee-picker-item-avatar">
                  <UserCheck size={14} color="var(--sky)" />
                </div>
                <div className="assignee-picker-item-info">
                  <span className="assignee-picker-item-name">Assign to me</span>
                  <span className="assignee-picker-item-email">{currentUser.name}</span>
                </div>
              </button>
            )}

            {/* Unassign Option */}
            <button
              type="button"
              className={`assignee-picker-item ${!currentAssigneeId ? 'selected' : ''}`}
              onClick={(e) => handleSelect(null, e)}
            >
              <div className="assignee-picker-item-avatar unassigned">
                <UserX size={13} />
              </div>
              <div className="assignee-picker-item-info">
                <span className="assignee-picker-item-name">Unassigned</span>
                <span className="assignee-picker-item-email">Remove current assignee</span>
              </div>
              {!currentAssigneeId && <Check size={14} className="assignee-picker-check" />}
            </button>

            <div className="assignee-picker-divider" />

            {/* Project Members List */}
            {displayedUsers.map(u => {
              const isSelected = currentAssigneeId === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  className={`assignee-picker-item ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => handleSelect(u.id, e)}
                >
                  <div className="assignee-picker-item-avatar">
                    <Avatar user={u} size={22} showTooltip={false} />
                  </div>
                  <div className="assignee-picker-item-info">
                    <span className="assignee-picker-item-name">{u.name}</span>
                    <span className="assignee-picker-item-email">
                      {u.role || 'Member'}{u.email ? ` • ${u.email}` : ''}
                    </span>
                  </div>
                  {isSelected && <Check size={14} className="assignee-picker-check" />}
                </button>
              );
            })}

            {displayedUsers.length === 0 && (
              <div className="assignee-picker-empty">
                No matching project members found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
