import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

// IMPORT external components
import StoryNarrative from './StoryNarrative';
import ConfirmModal from './ConfirmModal';
import OtpModal from './OtpModal'; 

/* =========================
   INTERNAL MODALS
========================= */
const AcceptModal = ({ isOpen, onClose, onSubmit, formData, setFormData, food }) => {
  if (!isOpen || !food) return null;
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modal-overlay">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="brutal-modal">
        <h2 className="modal-title">VERIFY_NGO_PROTOCOL</h2>
        <p className="modal-subtitle">Target: <b>{food.title}</b></p>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="brutal-form">
          <input name="fullName" placeholder="FULL_NAME" value={formData.fullName} onChange={handleChange} required className="brutal-input" />
          <input name="mobileNumber" placeholder="CONTACT_NUM" value={formData.mobileNumber} onChange={handleChange} required className="brutal-input" />
          <input name="address" placeholder="PICKUP_LOCATION" value={formData.address} onChange={handleChange} required className="brutal-input" />
          <input name="pickupTime" placeholder="ARRIVAL_WINDOW (e.g. 6 PM)" value={formData.pickupTime} onChange={handleChange} required className="brutal-input" />
          <textarea name="notes" placeholder="SPECIAL_INSTRUCTIONS" value={formData.notes} onChange={handleChange} className="brutal-input" />
          <div className="modal-actions">
            <button type="button" className="btn-white-brutal" onClick={onClose}>ABORT</button>
            <button type="submit" className="btn-black-brutal">SEND_ENCRYPTED_OTP</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const SuccessModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modal-overlay" style={{zIndex: 3000}}>
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="brutal-modal success-card">
        <motion.img 
          animate={{ y: [0, -15, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Mimi&backgroundColor=ffb6c1" 
          className="beautiful-robot-mini" 
          style={{ margin: '0 auto 15px', display: 'block', width: '100px', height: '100px' }}
        />
        <h2 className="modal-title">MISSION_COMPLETE</h2>
        <div className="speech-bubble-pink" style={{ marginBottom: '20px' }}>
          {message || `Resource ${title} has been successfully processed.`}
        </div>
        <button className="btn-black-brutal" onClick={onClose}>RETURN_TO_DASHBOARD</button>
      </motion.div>
    </motion.div>
  );
};

/* =========================
   DASHBOARD MAIN
========================= */
const Dashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  
  // Modal States
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [formData, setFormData] = useState({ 
    fullName: '', mobileNumber: '', address: '', pickupTime: '', notes: '' 
  });

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [activeOtpId, setActiveOtpId] = useState(null);
  const [activeOtpTitle, setActiveOtpTitle] = useState("");
  
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [currentMessage, setCurrentMessage] = useState("Click me!");

  const robotIntel = [
    "Roughly 1/3 of all food produced globally is wasted.",
    "Food waste accounts for 8% of global greenhouse gas emissions.",
    "Redirecting 25% of wasted food could end global hunger.",
    "Hunger is often a problem of logistics, not supply."
  ];

  const handleRobotClick = () => {
    const fact = robotIntel[Math.floor(Math.random() * robotIntel.length)];
    setCurrentMessage(fact); 
    setTimeout(() => setCurrentMessage("Click me!"), 7000);
  };

  const handleLogout = () => { 
    localStorage.removeItem('token'); 
    window.location.href = '/auth?logout=true'; 
  };

  const fetchFood = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://food-share-backend-file.onrender.com/api/food', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setFoodItems(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try { 
        const decoded = JSON.parse(atob(token.split('.')[1])); 
        setRole(decoded.role); 
      } catch (err) { 
        console.log("Token error"); 
      }
    }
    fetchFood();
  }, [fetchFood]);

  // NGO: Claim Item
  const handleClaim = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://food-share-backend-file.onrender.com/api/food/claim/${id}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSuccessMsg("CLAIM_SUCCESS: Resource locked and pending donor verification.");
      setIsSuccessOpen(true);
      fetchFood();
    } catch (err) { 
      console.error("CLAIM_DENIED"); 
    }
  };

  // Donor: Open Verify Modal
  const openAccept = (item) => {
    setSelectedFood(item);
    setFormData({ 
      fullName: '', 
      mobileNumber: '', 
      address: item.location || '', 
      pickupTime: '', 
      notes: '' 
    });
    setAcceptOpen(true);
  };

  // Donor: Submit NGO Details & Send OTP
  const handleAcceptSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://food-share-backend-file.onrender.com/api/food/confirm-donation/${selectedFood._id}`, formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAcceptOpen(false);
      setSuccessMsg("TRANS_CONFIRMED: OTP has been generated for the NGO.");
      setIsSuccessOpen(true);
      fetchFood();
    } catch (err) { 
      console.error("CONFIRMATION_FAILURE"); 
    }
  };

  // Donor: Open OTP Verify Modal
  const openOtpTrigger = (item) => {
    setActiveOtpId(item._id);
    setActiveOtpTitle(item.title);
    setOtpModalOpen(true);
  };

  const handleFinalVerify = async (otpValue) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://food-share-backend-file.onrender.com/api/food/verify-otp`, 
        { foodId: activeOtpId, otp: otpValue }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpModalOpen(false);
      setSuccessMsg(`Resource "${activeOtpTitle}" has been successfully transferred.`);
      setIsSuccessOpen(true);
      fetchFood();
    } catch (err) { 
      alert("Invalid OTP code. Please try again.");
    }
  };

  const openPurgeModal = (item) => {
    setItemToDelete(item);
    setIsPurgeModalOpen(true);
  };

  const handleConfirmPurge = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://food-share-backend-file.onrender.com/api/food/${itemToDelete._id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setIsPurgeModalOpen(false);
      fetchFood();
    } catch (err) { 
      console.error("PURGE_FAILED"); 
    }
  };

  // 1. Ensure foodItems is definitely an array before filtering
const filteredFood = Array.isArray(foodItems) 
  ? foodItems.filter(item => (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
  : [];

  return (
    <div className="pink-viewport">
      <AnimatePresence>
        {isStoryOpen && <StoryNarrative isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />}
      </AnimatePresence>

      <div className="mesh-container">
        <div className="moving-grid"></div>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="pink-glow" />
      </div>

      <nav className="pink-nav">
        <div className="nav-logo">FOOD_SHARE <span className="v-tag">v2.0</span></div>
        <div className="nav-btns">
          <button className="btn-white-brutal glitch-text" onClick={() => setIsStoryOpen(true)}>MISSION_INTEL</button>
          {role === 'donor' && (
            <button className="btn-black-brutal" onClick={() => window.location.href = '/add-food'}>+ NEW_RECORD</button>
          )}
          <button className="btn-white-brutal" onClick={handleLogout}>LOG_OUT</button>
        </div>
      </nav>

      <main className="main-content">
        <header className="hero-section">
          <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="big-title">
            {role === 'donor' ? "MANAGE\nARCHIVE" : "GLOBAL\nSUPPLIES"}
          </motion.h1>
          <div className="search-container">
            <input type="text" placeholder="SCANNING_FOR_RESOURCES..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="brutal-input" />
          </div>
        </header>

        {loading ? (
          <div className="loading-zone"><div className="spinner-brutal"></div><p>SYNCING_STREAMS...</p></div>
        ) : (
          <div className="card-grid">
            <AnimatePresence>
              {filteredFood.map((item, idx) => (
                <motion.div key={item._id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="brutal-card">
                  <div className="card-top-bar">
                    <span>ID: {item._id.slice(-6).toUpperCase()}</span>
                    <span className={`status-pill ${item.status}`}>{item.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="card-content">
                    <h3>{item.title}</h3>
                    <p>LOC: {item.location || "UNKNOWN"}</p>
                  </div>
                  <div className="card-actions">
                    {role === 'ngo' ? (
                      item.status === 'available' && (
                        <button className="btn-black-brutal" onClick={() => handleClaim(item._id)}>REQUEST_ACCESS</button>
                      )
                    ) : (
                      <div className="donor-actions-wrapper">
                        {item.status === 'pending' && <button className="btn-black-brutal" onClick={() => openAccept(item)}>VERIFY_NGO</button>}
                        {item.status === 'pending_confirmation' && (
                          <button className="btn-white-brutal" onClick={() => openOtpTrigger(item)}>ENTER_OTP</button>
                        )}
                        <button className="btn-danger-brutal" onClick={() => openPurgeModal(item)}>PURGE</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AcceptModal isOpen={acceptOpen} onClose={() => setAcceptOpen(false)} onSubmit={handleAcceptSubmit} formData={formData} setFormData={setFormData} food={selectedFood} />
      
      <ConfirmModal 
        isOpen={isPurgeModalOpen} 
        onClose={() => setIsPurgeModalOpen(false)} 
        onConfirm={handleConfirmPurge} 
        title="CONFIRM_PURGE" 
        message={`Delete record "${itemToDelete?.title}"?`} 
      />

      <OtpModal isOpen={otpModalOpen} onClose={() => setOtpModalOpen(false)} onVerify={handleFinalVerify} title={activeOtpTitle} />
      <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} title={activeOtpTitle} message={successMsg} />

      <motion.div whileHover={{ scale: 1.05 }} onClick={handleRobotClick} className="robot-fixed-container">
        <div className="speech-bubble-pink">
          <AnimatePresence mode="wait">
            <motion.div key={currentMessage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {currentMessage}
            </motion.div>
          </AnimatePresence>
        </div>
        <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Mimi&backgroundColor=ffb6c1" alt="Robot" className="beautiful-robot" />
      </motion.div>
    </div>
  );
};

export default Dashboard;