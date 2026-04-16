import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './OtpModal.css';

const OtpModal = ({ isOpen, onClose, onVerify, title }) => {
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(otp);
    setOtp(''); // Clear for next use
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modal-overlay">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="brutal-modal otp-card">
        <div className="robot-header">
          <img 
            src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Mimi&backgroundColor=ffb6c1" 
            alt="Robot Mimi" 
            className="beautiful-robot-mini" 
          />
          <div className="speech-bubble-pink">
            <span className="system-tag">DECRYPTION_REQUIRED</span>
            <p className="purge-message">Mimi needs the 6-digit code for <b>{title}</b> to finalize the handoff.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="brutal-form">
          <input 
            type="text" 
            placeholder="ENTER_6_DIGIT_CODE" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="brutal-input otp-input"
            maxLength="6"
            required
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="btn-white-brutal" onClick={onClose}>ABORT</button>
            <button type="submit" className="btn-black-brutal">VERIFY_HANDOFF</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default OtpModal;