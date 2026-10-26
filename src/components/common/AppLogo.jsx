import React, { useId } from 'react';

export function AppLogo({ size = 32, className = '' }) {
  const uniqueId = useId();
  const gradId = `issueTrackerGrad_${uniqueId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      
      {/* Outer Squircle Container */}
      <rect width="40" height="40" rx="12" fill={`url(#${gradId})`} />
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="11.25" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1.5" />
      
      {/* Circular Issue Progress Orbit */}
      <circle 
        cx="20" 
        cy="20" 
        r="10.5" 
        stroke="rgba(255, 255, 255, 0.35)" 
        strokeWidth="2.5" 
      />
      <path 
        d="M20 9.5C25.799 9.5 30.5 14.201 30.5 20C30.5 25.799 25.799 30.5 20 30.5" 
        stroke="#FFFFFF" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />

      {/* Verified / Solved Checkmark */}
      <path 
        d="M15 20.5L18.5 24L25.5 16.5" 
        stroke="#FFFFFF" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Emerald Milestone Dot */}
      <circle cx="28.5" cy="11.5" r="2.2" fill="#34D399" />
    </svg>
  );
}

export default AppLogo;
