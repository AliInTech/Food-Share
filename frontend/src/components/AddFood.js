import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './AddFood.css';

const AddFood = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Vegetables',
    expiryDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://food-share-backend-file.onrender.com', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch (err) {
      alert("UPLOAD_FAILED: Check neural link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-food-viewport">
      {/* Background Consistency */}
      <div className="mesh-container">
        <div className="moving-grid"></div>
        <div className="pink-glow"></div>
      </div>

      <nav className="pink-nav">
        <div className="nav-logo" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
          FOOD_SHARE <span className="v-tag">v2.0</span>
        </div>
        <button className="btn-white-brutal" onClick={() => navigate('/dashboard')}>CANCEL_ENTRY</button>
      </nav>

      <main className="form-container">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="form-card"
        >
          <div className="form-header">
            <span className="blink-text">● NEW_RECORD_INITIALIZATION</span>
            <h2>INPUT_DATA</h2>
          </div>

          <form onSubmit={handleSubmit} className="brutal-form">
            <div className="input-group">
              <label>RESOURCE_NAME</label>
              <input 
                type="text" name="title" required 
                placeholder="E.G. FRESH_BISCUITS" 
                onChange={handleChange} 
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>LOCATION_COORDINATES</label>
                <input 
                  type="text" name="location" required 
                  placeholder="ZONE_7_DOWNTOWN" 
                  onChange={handleChange} 
                />
              </div>
              <div className="input-group">
                <label>EXPIRY_TIMESTAMP</label>
                <input 
                  type="date" name="expiryDate" required 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="input-group">
              <label>RESOURCE_CATEGORY</label>
              <select name="category" onChange={handleChange}>
                <option value="Vegetables">VEGETABLES</option>
                <option value="Fruits">FRUITS</option>
                <option value="Grains">GRAINS</option>
                <option value="Cooked">PREPARED_MEALS</option>
              </select>
            </div>

            <div className="input-group">
              <label>TECHNICAL_DESCRIPTION</label>
              <textarea 
                name="description" 
                placeholder="ENTER_RESOURCE_SPECIFICATIONS..." 
                rows="4"
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="submit-btn-brutal" disabled={isSubmitting}>
              {isSubmitting ? "UPLOADING_TO_GRID..." : "INITIALIZE_DONATION"}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Small Robot Assistant for this page */}
      <div className="mini-bot">
        <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Felix&backgroundColor=ffb6c1" alt="bot" />
        <div className="bot-speech">"Double check the expiry!"</div>
      </div>
    </div>
  );
};

export default AddFood;