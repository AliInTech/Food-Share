import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLinkedin, FaGithub, FaEnvelope, FaHeart, FaLeaf, FaRocket, FaHandsHelping } from 'react-icons/fa'; 
import './Auth.css';

/* =========================
   NEW: LOGOUT MESSAGE COMPONENT
========================= */
const LogoutMessage = ({ message, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="logout-toast"
  >
    <div className="toast-content">
      <div className="toast-icon">✨</div>
      <p>{message}</p>
    </div>
    <button onClick={onClose} className="toast-close">×</button>
    <div className="toast-progress-bar">
      <motion.div 
        initial={{ width: "100%" }} 
        animate={{ width: "0%" }} 
        transition={{ duration: 6 }} 
        className="toast-progress-fill" 
      />
    </div>
  </motion.div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("INITIALIZING_HANDSHAKE...");

  const [currentMessage, setCurrentMessage] = useState("ENCRYPTION_ACTIVE");
  const [showPhoto, setShowPhoto] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // --- NEW LOGOUT STATES ---
  const [showLogoutMsg, setShowLogoutMsg] = useState(false);
  const [randomGoodbye, setRandomGoodbye] = useState("");

  // Correct path for your photo in the public folder
  const myPhoto = "/laraib.jpg";

  const goodbyeMessages = [
    "You’ve been logged out. Thanks for being part of something meaningful ❤️",
    "You’re logged out. Every small action counts — thanks for helping reduce food waste 🙌",
    "You’re logged out. Come back anytime — there’s always someone to help.",
    "Logged out successfully. Impact doesn’t stop here — see you soon 🚀",
    "You’re logged out. But the impact you made today still matters.",
    "Logged out. See you soon 👋"
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === 'true') {
      const msg = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
      setRandomGoodbye(msg);
      setShowLogoutMsg(true);
      
      window.history.replaceState({}, document.title, "/auth");

      const timer = setTimeout(() => setShowLogoutMsg(false), 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  const intelDatabase = [
    "Hey, I’m Laraib.",
    "I believe in learning by doing.",
    "I make mistakes, fix them, and keep moving forward. That’s how I build — both in code and in life.",
    "This platform is one of them — turning surplus food into something meaningful. Because a small idea can create a big impact.",
    "I built this platform so good food doesn’t go to waste. If you have extra, share it — someone out there needs it.",
  ];

  useEffect(() => {
    let score = 0;
    if (password.length > 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

  const handleRobotClick = () => {
    const nextMessage = intelDatabase[clickCount % intelDatabase.length];
    setCurrentMessage(nextMessage);
    setShowPhoto(true);
    setClickCount(prev => prev + 1);

    setTimeout(() => {
      setCurrentMessage("ENCRYPTION_ACTIVE");
      setShowPhoto(false);
    }, 8000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const handshakeMessages = [
      "ESTABLISHING_SECURE_TUNNEL...",
      "VERIFYING_IDENTITY_PROTOCOLS...",
      "DECRYPTING_USER_PROFILE...",
      "ACCESS_GRANTED_WELCOME_BACK"
    ];

    try {
      const baseURL = process.env.REACT_APP_API_URL || 'https://food-share-backend-whd6.onrender.com';
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const url = `${baseURL}${endpoint}`;

      const response = await axios.post(url, {
        email,
        password,
        role: isLogin ? undefined : role
      });

      for (let i = 0; i < handshakeMessages.length; i++) {
        setLoadingMessage(handshakeMessages[i]);
        await new Promise(resolve => setTimeout(resolve, 600)); 
      }

      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';

    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "CRITICAL_AUTH_FAILURE");
    }
  };

  const getStrengthColor = () => {
    if (strength === 0) return 'transparent';
    if (strength === 1) return '#ff4d4d'; 
    if (strength === 2) return '#ffcc00'; 
    if (strength <= 4) return '#00ff00'; 
    return 'transparent';
  };

  return (
    <div className="pink-viewport">
      <div className="mesh-container">
        <div className="moving-grid"></div>
        <div className="pink-glow"></div>
      </div>

      <AnimatePresence>
        {showLogoutMsg && (
          <LogoutMessage 
            message={randomGoodbye} 
            onClose={() => setShowLogoutMsg(false)} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="auth-terminal"
      >
        <div className="terminal-header">
          <div className="header-left">
            <div className="dots"><span></span><span></span><span></span></div>
            <span className="terminal-title">AUTH_PROTOCOL_v3.0.1</span>
          </div>
          
          <div className="social-icon-bar">
            <a href="https://www.linkedin.com/in/laraib-ali-34654b24a/" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaLinkedin />
            </a>
            <a href="https://github.com/laraib4u" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaGithub />
            </a>
            <a href="mailto:laraibali1411@gmail.com" className="social-link">
              <FaEnvelope />
            </a>
          </div>
        </div>

        <div className="auth-card-body">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="premium-loader-container"
              >
                <div className="system-status-ring">
                  <div className="inner-scan-line"></div>
                </div>
                <p className="loading-status-text">{loadingMessage}</p>
                <div className="boot-progress-bar">
                  <motion.div 
                    className="boot-fill"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="tab-switcher">
                  <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>LOGIN</button>
                  <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>SIGNUP</button>
                </div>

                <h2 className="brutal-title">{isLogin ? "IDENTITY_CHECK" : "CREATE_RECORD"}</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="input-group"
                      >
                        <label>JOIN_AS:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="brutal-select">
                          <option value="donor">DONOR_PROVIDER</option>
                          <option value="ngo">NGO_RECIPIENT</option>
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="input-group">
                    <label>EMAIL_ADDRESS</label>
                    <input
                      type="email"
                      placeholder="USER@DOMAIN.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>ACCESS_PASSWORD</label>
                    <input
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {!isLogin && password.length > 0 && (
                      <div className="strength-container">
                        <div 
                          className="strength-bar" 
                          style={{ 
                            width: `${(strength / 4) * 100}%`, 
                            backgroundColor: getStrengthColor() 
                          }}
                        ></div>
                        <span className="strength-label">SECURITY_LEVEL: {strength}/4</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div initial={{ x: 10 }} animate={{ x: 0 }} className="error-box">
                      {error}
                    </motion.div>
                  )}

                  <button type="submit" className="huge-submit-btn">
                    {isLogin ? "INITIALIZE_SESSION" : "REGISTER_SYSTEM"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="auth-robot-fixed" onClick={handleRobotClick} style={{ cursor: 'pointer' }}>
        <AnimatePresence>
          {currentMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }} 
              className="auth-speech-bubble"
            >
              {showPhoto && (
                <div className="glitch-photo-container">
                  <img src={myPhoto} alt="Laraib Ali" className="brutal-photo" />
                  <div className="glitch-overlay"></div>
                </div>
              )}
              <p>{currentMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lock&backgroundColor=ffb6c1" alt="Security" />
        <p className="status-text">CLICK_FOR_INTEL</p>
      </div>
    </div>
  );
};

export default Auth;