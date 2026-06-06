import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

import StoryNarrative from './StoryNarrative';
import ConfirmModal from './ConfirmModal';
import OtpModal from './OtpModal';

/* =========================
INTERNAL MODALS
========================= */

const AcceptModal = ({ isOpen, onClose, onSubmit, formData, setFormData, food }) => {
  if (!isOpen || !food) return null;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modal-overlay">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="brutal-modal">
        VERIFY_NGO_PROTOCOL
        Target: {food.title}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="brutal-form"
        >
          <button type="button" onClick={onClose}>ABORT</button>
          <button type="submit">SEND_ENCRYPTED_OTP</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const SuccessModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="modal-overlay" style={{ zIndex: 3000 }}>
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="brutal-modal success-card">

        <motion.img
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Mimi&backgroundColor=ffb6c1"
          className="beautiful-robot-mini"
          style={{ margin: '0 auto 15px', display: 'block', width: '100px', height: '100px' }}
        />

        MISSION_COMPLETE

        <div className="speech-bubble-pink" style={{ marginBottom: '20px' }}>
          {message || `Resource ${title} has been successfully processed.`}
        </div>

        <button onClick={onClose}>RETURN_TO_DASHBOARD</button>
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

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    address: '',
    pickupTime: '',
    notes: ''
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

  /* =========================
  FETCH FOOD (FIXED)
  ========================= */
  const fetchFood = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(
        'https://food-share-backend-file.onrender.com',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // ✅ SAFE FIX
      const data = res.data?.data ?? res.data ?? [];
      setFoodItems(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Fetch Error:", err);
      setFoodItems([]);
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

  /* =========================
  FILTER (FIXED)
  ========================= */
  const filteredFood = (Array.isArray(foodItems) ? foodItems : []).filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {isStoryOpen && (
        <StoryNarrative isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
      )}

      <main className="main-content">

        <header className="hero-section">
          <h1>{role === 'donor' ? "MANAGE ARCHIVE" : "GLOBAL SUPPLIES"}</h1>

          <input
            type="text"
            placeholder="SEARCH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </header>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="card-grid">
            <AnimatePresence>
              {filteredFood.map((item) => (
                <motion.div key={item._id} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.location}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </main>
    </>
  );
};

export default Dashboard;