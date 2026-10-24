import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  RefreshCw,
  Flame,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export function AuthPage() {
  const { login, register } = useAuth();
  const { theme } = useTasks();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Software Engineer');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please provide your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify and try again.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password should be at least 6 characters long.');
        return;
      }
    }

    try {
      setIsLoading(true);
      if (mode === 'login') {
        await login(email, password, rememberMe);
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role: role.trim()
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail, demoPass) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      await login(demoEmail, demoPass, true);
    } catch (err) {
      setErrorMessage(err.message || 'Demo sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Left Panel: 3D Casual & Business Visual Showcase */}
      <div className="auth-hero-panel">
        <div className="auth-hero-header">
          <div className="brand-badge">
            <div className="brand-icon-wrapper">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="brand-title">
                PalTech
              </div>
              <div className="brand-sub">Enterprise Tracker</div>
            </div>
          </div>

          <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
            Enterprise Edition
          </span>
        </div>

        <div className="auth-hero-content">
          <div className="auth-illustration-wrapper">
            <img 
              src="./assets/auth_illustration.jpg" 
              alt="PalTech Team Collaboration" 
              className="auth-illustration-img"
            />
          </div>

          <h2 className="auth-hero-title">
            Collaborate on Enhancements &amp; Eliminate Loopholes
          </h2>
          <p className="auth-hero-subtitle">
            Bridge product ideation and engineering execution with live discussions, subtask checklists, and continuous token session security.
          </p>

          <div className="auth-features-chips">
            <div className="auth-feature-chip">
              <RefreshCw size={13} color="var(--primary)" />
              <span>Token Rotation Active</span>
            </div>
            <div className="auth-feature-chip">
              <ShieldCheck size={13} color="var(--status-green)" />
              <span>Zero Re-Login Needed</span>
            </div>
            <div className="auth-feature-chip">
              <Flame size={13} color="var(--primary)" />
              <span>Firebase Cloud Sync</span>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <span>&copy; {new Date().getFullYear()} PalTech • Digital Engineering &amp; AI Solutions</span>
          <span>SSL 256-Bit Encrypted</span>
        </div>
      </div>

      {/* Right Panel: Login / Account Creation Form */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-header-block">
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {mode === 'login' 
                ? 'Sign in with your enterprise credentials to access your workspaces.' 
                : 'Join PalTech to track, ideate, and resolve project loopholes.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="auth-tab-switcher">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Sign In Bar */}
          <div className="auth-fast-demo-bar">
            <div>
              <span style={{ fontWeight: 700 }}>Quick Demo Access:</span>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Click to sign in with pre-configured session:</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="filter-pill-button"
                style={{ fontSize: 11, padding: '3px 8px', backgroundColor: '#FFFFFF', color: '#0A2540', fontWeight: 700 }}
                onClick={() => handleDemoSignIn('kamal.t@pal.tech', 'paltech2026')}
              >
                Kamal (Lead)
              </button>
              <button
                type="button"
                className="filter-pill-button"
                style={{ fontSize: 11, padding: '3px 8px', backgroundColor: '#FFFFFF', color: '#0A2540', fontWeight: 700 }}
                onClick={() => handleDemoSignIn('alex.chen@pal.tech', 'paltech2026')}
              >
                Alex (Arch)
              </button>
            </div>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="auth-error-banner">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="animate-tab-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div className="password-input-wrap">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Jordan Miller"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Role / Department</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Senior Software Engineer">Senior Software Engineer</option>
                    <option value="Staff Systems Architect">Staff Systems Architect</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Security Engineer">Security Engineer</option>
                    <option value="QA & Reliability Lead">QA &amp; Reliability Lead</option>
                  </select>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Corporate Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@paltech.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter password..."
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group animate-tab-fade">
                <label className="form-label">Confirm Password *</label>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Repeat password..."
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Remember Me / Token Rotation Checkbox */}
            <div className="auth-remember-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Keep me signed in (Token Rotation)</span>
              </label>

              {mode === 'login' && (
                <button
                  type="button"
                  style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => alert('Password reset link can be sent via Firebase Auth or email administrator.')}
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{mode === 'login' ? 'Authenticating & Rotating Tokens...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create PalTech Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer toggle */}
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--primary)', fontWeight: 700 }}
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                  }}
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--primary)', fontWeight: 700 }}
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
