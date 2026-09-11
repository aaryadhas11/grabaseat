import React, { useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalState';
import './AuthAlert.css';

const AuthAlert = () => {
  const { showAuthAlert, setShowAuthAlert, authMessage, shakeAlert } = useGlobalContext();

  useEffect(() => {
    if (showAuthAlert) {
      const timer = setTimeout(() => {
        setShowAuthAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showAuthAlert, setShowAuthAlert]);

  if (!showAuthAlert) return null;

  return (
    <div className={`auth-alert-container ${shakeAlert ? 'shake-animation' : ''}`}>
      <p className="auth-alert-message">{authMessage}</p>
      <button 
        className="auth-alert-close" 
        onClick={() => setShowAuthAlert(false)}
        aria-label="Close Alert"
      >
        &times;
      </button>
    </div>
  );
};

export default AuthAlert;
