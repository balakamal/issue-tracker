import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Lock, 
  Globe, 
  ChevronsUp, 
  ChevronUp, 
  Equal, 
  ChevronDown 
} from 'lucide-react';

export function PriorityIcon({ priority, size = 13 }) {
  switch (priority) {
    case 'critical':
      return <ChevronsUp size={size} color="var(--priority-critical)" title="Critical Priority" />;
    case 'high':
      return <ChevronUp size={size} color="var(--priority-high)" title="High Priority" />;
    case 'medium':
      return <Equal size={size} color="var(--priority-medium)" title="Medium Priority" />;
    case 'low':
      return <ChevronDown size={size} color="var(--priority-low)" title="Low Priority" />;
    default:
      return <Equal size={size} color="var(--muted)" />;
  }
}

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
  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  return (
    <span className={`badge badge-priority-${priority}`}>
      <PriorityIcon priority={priority} size={12} />
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
