import React from 'react';
import { ShieldAlert, Sparkles, Lock, Globe, AlertCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export function TypeBadge({ type }) {
  const isLoophole = type === 'loophole';
  return (
    <span className={`badge ${isLoophole ? 'badge-type-loophole' : 'badge-type-enhancement'}`}>
      {isLoophole ? <ShieldAlert size={12} /> : <Sparkles size={12} />}
      {isLoophole ? 'Loophole' : 'Enhancement'}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const icons = {
    critical: <AlertCircle size={11} />,
    high: <AlertTriangle size={11} />,
    medium: <Info size={11} />,
    low: <Clock size={11} />
  };

  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  return (
    <span className={`badge badge-priority-${priority}`}>
      {icons[priority]}
      {labels[priority] || priority}
    </span>
  );
}

export function PrivacyBadge({ isPrivate }) {
  if (isPrivate) {
    return (
      <span className="badge badge-privacy-private" title="Private to you (classified)">
        <Lock size={11} />
        Private
      </span>
    );
  }

  return (
    <span className="badge badge-privacy-project" title="Visible to project team">
      <Globe size={11} />
      Team
    </span>
  );
}

export function ProjectChip({ project }) {
  if (!project) return null;
  return (
    <span className="project-tag-chip">
      <span 
        style={{ 
          width: 7, 
          height: 7, 
          borderRadius: '50%', 
          backgroundColor: project.color || '#0077E6' 
        }} 
      />
      {project.name}
    </span>
  );
}
