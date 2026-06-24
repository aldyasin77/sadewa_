import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  title = 'Konfirmasi Aksi', 
  message = 'Apakah Anda yakin ingin melakukan aksi ini?', 
  confirmText = 'Ya, Lanjutkan', 
  cancelText = 'Batal', 
  onConfirm, 
  onCancel,
  isDanger = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDanger && <AlertTriangle size={20} style={{ color: 'var(--color-semantic-down)' }} />}
            <h2 style={{ fontSize: '16px' }}>{title}</h2>
          </div>
          <button className="modal-close" onClick={onCancel} aria-label="Tutup modal">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--color-body)', fontSize: '14px', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className="btn" 
            style={{ 
              backgroundColor: isDanger ? 'var(--color-semantic-down)' : 'var(--color-primary)',
              color: '#FFFFFF'
            }} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
