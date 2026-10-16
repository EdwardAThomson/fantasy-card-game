import React, { useEffect, useRef } from 'react';
import { CloseIcon } from './GameIcons';
import './Modal.css';

// Shared dialog shell: navy glass panel in a gold hairline frame, matching the
// title screen, cards and tutorial panels. `size="sm"` is for short results.
function Modal({ isOpen, onClose, children, size = 'md', className = '', label }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus({ preventScroll: true });
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        className={`modal-content modal-${size} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
