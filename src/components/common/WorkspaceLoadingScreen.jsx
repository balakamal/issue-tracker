import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';

const LOADING_PHASES = [
  'Validating enterprise session tokens...',
  'Establishing encrypted workspace link...',
  'Synchronizing sprint backlog and boards...'
];

export function WorkspaceLoadingScreen() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [theme, setTheme] = useState(() => storageService.getTheme());

  useEffect(() => {
    // Keep theme attribute in sync
    const currentTheme = storageService.getTheme();
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPhaseIndex((prev) => (prev + 1) % LOADING_PHASES.length);
        setIsFading(false);
      }, 250);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="quantum-loader-screen" data-theme={theme} role="alert" aria-busy="true" aria-label="Loading workspace">
      {/* Corbel Ambient Mesh with Floating Glow Orbs */}
      <div className="quantum-loader-mesh" aria-hidden="true">
        <i className="mesh__a" />
        <i className="mesh__b" />
        <i className="mesh__c" />
      </div>

      {/* Central Glassmorphic Card */}
      <div className="quantum-loader-card">
        {/* Dual Concentric Quantum Orbit Stage */}
        <div className="quantum-orbit-stage" aria-hidden="true">
          {/* Dual SVG Orbit Rings */}
          <svg className="quantum-orbit-svg" viewBox="0 0 120 120" fill="none">
            {/* Outer segmented ring */}
            <circle
              className="quantum-ring-outer"
              cx="60"
              cy="60"
              r="52"
              stroke="url(#orbitGradientOuter)"
              strokeWidth="2"
              strokeDasharray="8 6 16 8"
              strokeLinecap="round"
            />
            {/* Inner counter-rotating ring */}
            <circle
              className="quantum-ring-inner"
              cx="60"
              cy="60"
              r="42"
              stroke="url(#orbitGradientInner)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="orbitGradientOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="orbitGradientInner" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Orbiting Satellites */}
          <div className="quantum-satellite-a" />
          <div className="quantum-satellite-b" />

          {/* Center Brand Squircle Emblem */}
          <div className="quantum-center-emblem">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          </div>
        </div>

        {/* Brand Title & Live Status Phase */}
        <div className="quantum-loader-header">
          <div className="quantum-brand-title">
            <span>Issue Tracker</span>
          </div>
          <div className={`quantum-status-ticker ${isFading ? 'fade-out' : 'fade-in'}`}>
            {LOADING_PHASES[phaseIndex]}
          </div>
        </div>

        {/* Indeterminate Laser Progress Bar */}
        <div className="quantum-progress-track" aria-hidden="true">
          <div className="quantum-laser-bar" />
        </div>

        {/* Security Verification Pill */}
        <div className="quantum-security-pill">
          <span className="quantum-beacon-dot" aria-hidden="true" />
          <span>Enterprise Security &bull; TLS 1.3</span>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceLoadingScreen;
