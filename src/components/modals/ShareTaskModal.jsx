import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, FileCode, FileText, Globe } from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

export function ShareTaskModal({ task, isOpen, onClose }) {
  const [copiedType, setCopiedType] = useState(null); // 'url' | 'markdown' | 'summary'
  const [previewPlatform, setPreviewPlatform] = useState('slack'); // 'slack' | 'twitter'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const taskUrl = `${origin}/task/${task.id}`;
  const ogImageUrl = `${origin}/api/og/${task.id}`;

  const typeLabel = task.type === 'loophole' ? 'Loophole' : 'Enhancement';
  const priorityLabel = (task.priority || 'medium').toUpperCase();
  const stageLabel = (task.status || 'ideation').replace('_', ' ').toUpperCase();
  const summarySnippet = task.problemStatement 
    ? task.problemStatement.slice(0, 160) + (task.problemStatement.length > 160 ? '...' : '')
    : 'Collaborative work item and sprint backlog specifications on Issue Tracker.';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(taskUrl);
      setCopiedType('url');
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.error('Failed to copy URL', e);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = `[${task.id}: ${task.title}](${taskUrl})`;
      await navigator.clipboard.writeText(md);
      setCopiedType('markdown');
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.error('Failed to copy Markdown', e);
    }
  };

  const handleCopySummary = async () => {
    try {
      const summary = `**[${task.id}] ${task.title}**\n• Type: ${typeLabel}\n• Priority: ${priorityLabel}\n• Stage: ${stageLabel}\n• Link: ${taskUrl}`;
      await navigator.clipboard.writeText(summary);
      setCopiedType('summary');
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.error('Failed to copy Summary', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `[${task.id}] ${task.title}`,
          text: `${typeLabel} (${priorityLabel}) - ${task.title}`,
          url: taskUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share error', err);
        }
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div 
        className="modal-container share-modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Share2 size={18} />
            </div>
            <div>
              <h2 id="share-modal-title" className="modal-title" style={{ fontSize: 16 }}>
                Share Work Item
              </h2>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                {task.id} &bull; {task.title}
              </span>
            </div>
          </div>

          <button 
            type="button"
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Close share dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="share-modal-body">
          {/* Direct Link Input Box */}
          <div className="share-url-box">
            <Globe size={16} color="var(--primary)" />
            <input 
              type="text" 
              readOnly 
              value={taskUrl} 
              className="share-url-input" 
              onClick={(e) => e.target.select()}
            />
            <button 
              type="button" 
              className="share-copy-btn" 
              onClick={handleCopyUrl}
            >
              {copiedType === 'url' ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Copy Action Buttons */}
          <div className="share-quick-actions">
            <button 
              type="button" 
              className="share-action-btn"
              onClick={handleCopyMarkdown}
            >
              {copiedType === 'markdown' ? <Check size={13} color="var(--mint)" /> : <FileCode size={13} />}
              <span>{copiedType === 'markdown' ? 'Copied Markdown!' : 'Copy Markdown'}</span>
            </button>

            <button 
              type="button" 
              className="share-action-btn"
              onClick={handleCopySummary}
            >
              {copiedType === 'summary' ? <Check size={13} color="var(--mint)" /> : <FileText size={13} />}
              <span>{copiedType === 'summary' ? 'Copied Summary!' : 'Copy Summary'}</span>
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button 
                type="button" 
                className="share-action-btn"
                onClick={handleNativeShare}
              >
                <Share2 size={13} />
                <span>Share via App...</span>
              </button>
            )}
          </div>

          {/* Live Social Card Preview */}
          <div className="share-preview-section">
            <div className="share-preview-header">
              <span className="share-preview-title">Social Unfurl Preview (OG Tags)</span>
              <div className="share-platform-tabs">
                <button 
                  type="button"
                  className={`share-platform-btn ${previewPlatform === 'slack' ? 'active' : ''}`}
                  onClick={() => setPreviewPlatform('slack')}
                >
                  Slack &bull; Teams &bull; Discord
                </button>
                <button 
                  type="button"
                  className={`share-platform-btn ${previewPlatform === 'twitter' ? 'active' : ''}`}
                  onClick={() => setPreviewPlatform('twitter')}
                >
                  Twitter / X
                </button>
              </div>
            </div>

            {previewPlatform === 'slack' ? (
              /* Slack / Discord Style Rich Unfurl Card */
              <div className="social-card-slack">
                <div className="social-card-slack-content">
                  <div className="social-card-brand-row">
                    <AppLogo size={16} />
                    <span>Issue Tracker</span>
                  </div>
                  <div className="social-card-title">
                    [{task.id}] {task.title}
                  </div>
                  <div className="social-card-desc">
                    {typeLabel} &bull; {priorityLabel} Priority &bull; Stage: {stageLabel}. {summarySnippet}
                  </div>
                  <div className="social-card-banner-preview">
                    <img src={ogImageUrl} alt={`Preview banner for ${task.id}`} loading="lazy" />
                  </div>
                </div>
              </div>
            ) : (
              /* Twitter / X Large Summary Card */
              <div className="social-card-twitter">
                <div className="social-card-twitter-banner">
                  <img src={ogImageUrl} alt={`Preview banner for ${task.id}`} loading="lazy" />
                </div>
                <div className="social-card-twitter-meta">
                  <span className="social-card-twitter-domain">
                    {origin ? new URL(origin).host : 'app.issuetracker.internal'}
                  </span>
                  <div className="social-card-twitter-title">
                    [{task.id}] {task.title} &bull; Issue Tracker
                  </div>
                  <div className="social-card-twitter-desc">
                    {summarySnippet}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareTaskModal;
