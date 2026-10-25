import React, { useState } from 'react';
import { ArrowRight, RefreshCw, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from '../common/AppLogo';

export function AuthPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. Please complete the Google authentication popup.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Another sign-in request is already in progress.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage('This domain is not authorized in Firebase Console > Authentication > Settings > Authorized domains.');
      } else if (err.code === 'auth/configuration-not-found' || (err.message && err.message.includes('CONFIGURATION_NOT_FOUND'))) {
        setErrorMessage('Google Sign-In is not enabled yet in your Firebase Console. Please open Firebase Console > Authentication > Sign-in method and enable Google.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check network connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      if (activeTab === 'signin') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        await registerWithEmail({ name, email, password });
      }
    } catch (err) {
      console.error('Email authentication failed:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Panel: Visual Artwork & Brand */}
      <div className="auth-visual-panel">
        <div className="auth-visual-brand">
          <AppLogo size={32} />
          <span className="brand-title">Issue Tracker</span>
        </div>

        <div className="auth-visual-body">
          <div className="auth-illustration-box">
            <img 
              src="./assets/auth_illustration.jpg" 
              alt="Issue Tracker Team Collaboration" 
              className="auth-illustration-img"
            />
          </div>

          <h2 className="auth-visual-headline">
            Track, debate &amp; resolve issues
          </h2>
          <p className="auth-visual-subtext">
            Streamlined engineering workflow from discovery to completion.
          </p>
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Right Panel: Centered Issue Tracker Dual Sign-In Gate */}
      <div className="auth-action-panel">
        <div className="auth-action-card">
          <div className="auth-action-header">
            <div className="auth-action-mark">
              <AppLogo size={46} />
            </div>
            <h1 className="auth-action-title">Issue Tracker</h1>
            <p className="auth-action-subtitle">
              {activeTab === 'signin' 
                ? 'Sign in to access your projects and tasks' 
                : 'Create an account to join the workspace'}
            </p>
          </div>

          {/* Mode Tabs: Sign In vs Sign Up */}
          <div className="auth-mode-tabs">
            <button
              type="button"
              className={`auth-mode-tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-mode-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage('');
              }}
            >
              Sign Up
            </button>
          </div>

          {errorMessage && (
            <div className="auth-error-banner">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="auth-form-body">
            {activeTab === 'signup' && (
              <div className="auth-input-group">
                <User size={15} className="auth-input-icon" />
                <input
                  type="text"
                  className="auth-text-input"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <Mail size={15} className="auth-input-icon" />
              <input
                type="email"
                className="auth-text-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="auth-input-group">
              <Lock size={15} className="auth-input-icon" />
              <input
                type="password"
                className="auth-text-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          {/* Google Sign-In Action */}
          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google</span>
            <ArrowRight size={14} className="auth-arrow-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
