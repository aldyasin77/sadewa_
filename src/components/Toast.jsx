import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 3-second auto-dismiss

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {isSuccess ? (
          <CheckCircle2 size={18} className="toast-icon-success" />
        ) : (
          <AlertCircle size={18} className="toast-icon-error" />
        )}
        <span className="toast-message">{message}</span>
      </div>
      <button onClick={onClose} className="toast-close-btn" aria-label="Close message">
        <X size={14} />
      </button>
    </div>
  );
}
