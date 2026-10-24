import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, icon: Icon, children, maxWidth = 600 }) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isRendered && !isClosing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered, isClosing, onClose]);

  if (!isRendered) return null;

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'modal-overlay-closing' : ''}`} 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`modal-container ${isClosing ? 'modal-container-closing' : ''}`} 
        style={{ maxWidth }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            {Icon && <Icon size={20} color="var(--primary)" />}
            {title}
          </div>
          <button 
            type="button"
            className="modal-close-btn" 
            onClick={onClose} 
            title="Close modal" 
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
