import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, actionText }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Not Now
          </button>

          <button className="confirm-btn" onClick={onConfirm}>
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;