import React from 'react';

export function Avatar({ user, size = 26, showTooltip = true }) {
  if (!user) {
    return (
      <div 
        className="assignee-avatar" 
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: '#64748B', 
          fontSize: Math.max(10, size * 0.4) 
        }}
        title="Unassigned"
      >
        ?
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="assignee-avatar"
      style={{
        width: size,
        height: size,
        backgroundColor: user.avatarColor || '#0077E6',
        fontSize: Math.max(10, size * 0.4)
      }}
      title={showTooltip ? `${user.name} (${user.role})` : undefined}
    >
      {initials}
    </div>
  );
}
