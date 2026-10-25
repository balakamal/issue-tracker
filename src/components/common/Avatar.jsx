import React, { useState } from 'react';

export function Avatar({ user, size = 26, showTooltip = true }) {
  const [imgError, setImgError] = useState(false);

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

  const rawName = user.name || user.displayName || user.email || 'User';
  const nameParts = rawName.trim().split(/\s+/).filter(Boolean);
  const initials = (
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : rawName.slice(0, 2)
  ).toUpperCase();

  const tooltipText = showTooltip ? rawName : undefined;

  if (user.photoURL && !imgError) {
    return (
      <img
        src={user.photoURL}
        alt={rawName}
        className="assignee-avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
        title={tooltipText}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="assignee-avatar"
      style={{
        width: size,
        height: size,
        backgroundColor: user.avatarColor || '#0077E6',
        color: '#FFFFFF',
        fontSize: Math.max(10, Math.round(size * 0.38)),
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        userSelect: 'none',
        flexShrink: 0
      }}
      title={tooltipText}
    >
      {initials}
    </div>
  );
}

export default Avatar;
