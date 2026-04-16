import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const StoryNarrative = ({ isOpen, onClose }) => {
  const [scene, setScene] = useState(0);

  // High-impact public Unsplash IDs for guaranteed loading
  const narrative = [
    {
      title: "SYSTEM_LEAK",
      stat: "1.3 BILLION TONS",
      desc: "Annual global food waste. While we manage archives, millions manage hunger. This is a critical logic failure in our species.",
      img: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?q=80&w=1000&auto=format&fit=crop",
      color: "#0a0a0a", 
      accent: "#ffb6c1", 
      text: "#fff"
    },
    {
      title: "VULNERABILITY_REPORT",
      stat: "828 MILLION",
      desc: "Humans go to bed hungry tonight. Every 'NEW_RECORD' you create is a bridge between excess and survival.",
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop",
      color: "#001f3f", 
      accent: "#ffb6c1",
      text: "#ffb6c1"
    },
    {
      title: "RECOVERY_PROTOCOL",
      stat: "MISSION_STRIKE",
      desc: "Connecting donors to NGOs. Protocol SFDP initialized. Let's close the gap and secure the future.",
      img: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=1000&auto=format&fit=crop",
      color: "#ff1493", 
      accent: "#fff",
      text: "#fff"
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: narrative[scene].color, color: narrative[scene].text,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', 
        alignItems: 'center', padding: '2rem', transition: 'background 0.8s ease',
        overflow: 'hidden', fontFamily: 'monospace'
      }}
    >
      {/* Immersive Background Image Layer */}
      <motion.div 
        key={`bg-${scene}`}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 1.5 }}
        style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${narrative[scene].img})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'grayscale(100%) blur(8px)', zIndex: 1
        }}
      />

      {/* CRT Scanline Effects Layer */}
      <div className="crt-overlay" style={{ zIndex: 5 }}></div>
      <div className="crt-flicker" style={{ zIndex: 5 }}></div>

      <div style={{ textAlign: 'center', maxWidth: '800px', zIndex: 20, position: 'relative' }}>
        
        {/* Cinematic Brutalist Image Frame */}
        <motion.div
           key={`img-${scene}`}
           initial={{ y: 40, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           style={{ 
             width: '100%', maxWidth: '480px', height: '280px', 
             margin: '0 auto 2.5rem auto',
             border: `4px solid ${narrative[scene].accent}`,
             position: 'relative', overflow: 'hidden',
             boxShadow: `15px 15px 0px ${narrative[scene].accent}`
           }}
        >
            <img 
              src={narrative[scene].img} 
              alt="Mission visual evidence" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
        </motion.div>

        <motion.p key={`t-${scene}`} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 0.7 }} style={{ fontWeight: 900 }}>
          [{narrative[scene].title}]
        </motion.p>
        
        <motion.h1 
          key={`s-${scene}`} 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="glitch-text"
          data-text={narrative[scene].stat}
          style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
            margin: '1rem 0', fontWeight: 900, textTransform: 'uppercase'
          }}
        >
          {narrative[scene].stat}
        </motion.h1>

        <motion.p key={`d-${scene}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.3 }}>
          {narrative[scene].desc}
        </motion.p>
        
        <div style={{ marginTop: '3.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          {scene < narrative.length - 1 ? (
            <button 
              onClick={() => setScene(scene + 1)}
              style={{ 
                padding: '1.2rem 2.5rem', background: 'transparent', 
                border: `3px solid ${narrative[scene].accent}`, color: narrative[scene].accent, 
                fontWeight: 900, cursor: 'pointer', fontSize: '1.1rem' 
              }}
            >
              NEXT_SEQUENCE →
            </button>
          ) : (
            <button 
              onClick={onClose}
              style={{ 
                padding: '1.2rem 2.5rem', background: narrative[scene].accent, 
                border: 'none', color: narrative[scene].color, 
                fontWeight: 900, cursor: 'pointer', fontSize: '1.1rem' 
              }}
            >
              INITIALIZE_DASHBOARD
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StoryNarrative;