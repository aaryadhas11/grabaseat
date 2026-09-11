import React, { useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalState';
import { FiX } from 'react-icons/fi';
import './LogoutModal.css';

const LogoutModal = ({ onClose }) => {
  const { handleLogout } = useGlobalContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const confirmLogout = () => {
    handleLogout();
    onClose();
  };

  return (
    <div className="logout-overlay" onClick={onClose}>
      <div className="logout-card" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="premium-close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <FiX size={18} />
        </button>
        <h2 className="logout-title">Signing Out?</h2>
        <p className="logout-desc">Are you sure you want to log out of your GrabASeat account?</p>
        <div className="logout-actions">
          <button className="logout-btn-cancel" onClick={onClose}>No, stay</button>
          <button className="logout-btn-confirm" onClick={confirmLogout}>Yes, Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
