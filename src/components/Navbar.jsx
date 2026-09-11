import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalState';
import { FiX } from 'react-icons/fi';
import './navbar.css';

import logoImg from '../assets/logo.png';

const Navbar = () => {
  // ADDED: setShowAuthModal from context to trigger the login popup
  const { isLoggedIn, currentUser, setIsLoggedIn, setCurrentUser, setShowAuthModal, handleLogout } = useGlobalContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navAuthRef = useRef(null);

  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
  const userName = currentUser?.name || "User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navAuthRef.current && !navAuthRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const confirmLogout = () => {
    // Delegate entirely to the global handler:
    // – clears currentUser, isLoggedIn, likedList
    // – runs localStorage.clear() + re-saves city
    // – fires the centered AuthNotification overlay toast
    handleLogout();

    // UI cleanup
    setShowLogoutModal(false);
    setIsOpen(false);

    // Navigate home
    navigate('/');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowLogoutModal(false);
    };
    if (showLogoutModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal]);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo-container">
          <div className="logo-circle">
            <img src={logoImg} alt="G" />
          </div>
          <div className="brand-name">
            <span className="text-white">GrabA</span>
            <span className="text-red">Seat</span>
          </div>
        </Link>

        <div className="nav-auth" ref={navAuthRef}>
          {isLoggedIn ? (
            <div className="profile-wrapper">
              <div
                className="profile-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              >
                <div className="user-initial-badge">{initial}</div>
                <span className="dropdown-arrow">▼</span>
              </div>

              {isOpen && (
                <div className="dropdown-menu">
                  <div className="user-greeting">
                    Hi, <span className="text-yellow">{userName}</span>
                  </div>
                  <hr className="drop-divider" />
                  <Link to="/bookings" className="drop-link" onClick={() => setIsOpen(false)}>My Bookings</Link>
                  <Link to="/bookings?tab=wishlist" className="drop-link" onClick={() => setIsOpen(false)}>My Wishlist</Link>

                  {(currentUser?.isAdmin || currentUser?.email?.toLowerCase() === "adminlogin11@gmail.com" || currentUser?.email?.toLowerCase() === "aaryanitindhas@gmail.com") && (
                    <Link to="/admin" className="drop-link admin-link" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                  )}

                  <hr className="drop-divider" />
                  <button onClick={() => { setShowLogoutModal(true); setIsOpen(false); }} className="logout-btn">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            /* FIX: Changed from <Link> to a button that opens your AuthModal */
            <button className="signin-btn" onClick={() => setShowAuthModal(true)}>
              SIGN IN
            </button>
          )}
        </div>
      </nav>

      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="custom-modal" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button className="premium-close-btn" onClick={() => setShowLogoutModal(false)} aria-label="Close">
              <FiX size={18} />
            </button>
            <h3>Sign Out</h3>
            <p>Are you sure you want to log out of GrabASeat?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmLogout}>Yes, Sign Out</button>
              <button className="cancel-btn" onClick={() => setShowLogoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;