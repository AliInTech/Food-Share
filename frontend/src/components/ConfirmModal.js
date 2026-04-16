import React from 'react';
import { motion } from 'framer-motion';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, actionText }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="modal-overlay"
      style={{ zIndex: 5000 }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        className="brutal-modal robot-purge-card"
      >
        <div className="robot-header">
          <img 
            src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Mimi&backgroundColor=ffb6c1" 
            alt="Robot Mimi" 
            className="beautiful-robot-mini" 
          />
          <div className="speech-bubble-pink">
            <span className="system-tag">{title}</span>
            <p className="purge-message">{message}</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-white-brutal" onClick={onClose}>
            ABORT_MISSION
          </button>
          <button className="btn-danger-brutal" onClick={onConfirm}>
            {actionText || 'CONFIRM_PURGE'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmModal;