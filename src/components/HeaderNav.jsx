import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderNav = ({ title, onBack, onClose, showClose = true }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bms-nav-header">
      <button onClick={handleBackClick} className="bms-back-btn" aria-label="Go Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Back</span>
      </button>

      {title && <span className="bms-header-title">{title}</span>}

      {showClose && (
        <button onClick={handleCloseClick} className="bms-close-btn" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default HeaderNav;
