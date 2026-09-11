import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalState';
import { FiX, FiAlertTriangle, FiMail, FiLock, FiUser, FiCheckCircle } from 'react-icons/fi';
import './AuthModal.css';

const AuthModal = () => {
  const { setShowAuthModal, handleLogin, handleRegister, setShowAuthAlert, setToastMessage } = useGlobalContext();
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Validation States
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Submission States
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (setShowAuthAlert) setShowAuthAlert(false);
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowAuthModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowAuthAlert, setShowAuthModal]);

  // Handle inline validation
  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        error = 'Email is required';
      } else if (!emailRegex.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    } else if (name === 'name') {
      if (view === 'register' && !value) {
        error = 'Full name is required';
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') validateField('email', email);
    if (field === 'password') validateField('password', password);
    if (field === 'name') validateField('name', name);
  };

  const handleInputChange = (field, val, setter) => {
    setter(val);
    if (touched[field]) {
      validateField(field, val);
    }
  };

  const handleTabChange = (newView) => {
    setView(newView);
    setErrors({});
    setTouched({});
    setApiError('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Validate all fields before submit
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let tempErrors = {};
    
    if (view === 'register' && !name) tempErrors.name = 'Full name is required';
    if (!email) tempErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) tempErrors.email = 'Please enter a valid email address';
    
    if (view !== 'forgot') {
      if (!password) tempErrors.password = 'Password is required';
      else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      // Mark all as touched
      setTouched({ name: true, email: true, password: true });
      return;
    }

    setIsLoading(true);

    if (view === 'login') {
      const res = handleLogin ? await handleLogin(email, password) : null;
      setIsLoading(false);
      if (res && res.success) {
        setSuccessMsg('Welcome back! Redirecting...');
        setTimeout(() => setShowAuthModal(false), 1500);
      } else if (res) {
        setApiError(res.message || 'Incorrect credentials or server error.');
      }
    } else if (view === 'register') {
      const res = handleRegister ? await handleRegister(name, email, password) : null;
      setIsLoading(false);
      if (res && res.success) {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => setShowAuthModal(false), 1500);
      } else if (res) {
        setApiError(res.message || 'Registration failed. Try again.');
      }
    } else {
      // Forgot password flow
      try {
        let response;
        try {
          response = await fetch('http://localhost:5000/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
        } catch (_) {
          response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
        }
        const data = await response.json();
        setIsLoading(false);
        if (response.ok) {
          setSuccessMsg(data.message || `Reset link sent to your email!`);
          setTimeout(() => {
            setSuccessMsg('');
            setView('login');
          }, 3500);
        } else {
          setApiError(data.message || 'Error sending password reset email.');
        }
      } catch (err) {
        setIsLoading(false);
        setApiError('Unable to connect to server. Please ensure backend server is running.');
      }
    }
  };

  return (
    <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="auth-card-premium animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn-round" onClick={() => setShowAuthModal(false)} aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <FiX size={18} />
        </button>

        <div className="auth-header-brand">
          <div className="auth-logo-symbol">🎬</div>
          <h3 className="auth-logo-text">
            <span style={{ color: '#FFFFFF' }}>GrabA</span><span style={{ color: '#E50914', textShadow: '0 0 12px rgba(229, 9, 20, 0.45)' }}>Seat</span>
          </h3>
        </div>

        {/* Tab Switcher */}
        {!successMsg && view !== 'forgot' && (
          <div className="auth-tabs-container">
            <button 
              className={`auth-tab-btn ${view === 'login' ? 'active' : ''}`}
              onClick={() => handleTabChange('login')}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab-btn ${view === 'register' ? 'active' : ''}`}
              onClick={() => handleTabChange('register')}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="auth-body">
          {view === 'forgot' && (
            <>
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-sub">Enter your email address and we'll send you a recovery link.</p>
            </>
          )}

          {/* Success Overlay View */}
          {successMsg && (
            <div className="auth-success-screen">
              <FiCheckCircle className="success-icon-anim" />
              <h3>{successMsg}</h3>
            </div>
          )}

          {/* Sleek Alert Banner for Backend API Errors */}
          {apiError && !successMsg && (
            <div className="auth-api-error-banner animate-shake">
              <FiAlertTriangle className="error-banner-icon" />
              <span>{apiError}</span>
            </div>
          )}

          {!successMsg && (
            <form className="auth-form-main" onSubmit={handleSubmit} noValidate>
              {view === 'register' && (
                <div className="input-field-container">
                  <label className="input-label-premium">FULL NAME</label>
                  <div className={`input-with-icon ${errors.name && touched.name ? 'input-error-state' : ''}`}>
                    <FiUser className="input-inner-icon" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => handleInputChange('name', e.target.value, setName)}
                      onBlur={() => handleBlur('name')}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {errors.name && touched.name && (
                    <span className="input-error-message">{errors.name}</span>
                  )}
                </div>
              )}

              <div className="input-field-container">
                <label className="input-label-premium">EMAIL ADDRESS</label>
                <div className={`input-with-icon ${errors.email && touched.email ? 'input-error-state' : ''}`}>
                  <FiMail className="input-inner-icon" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                    onBlur={() => handleBlur('email')}
                    disabled={isLoading}
                    required
                  />
                </div>
                {errors.email && touched.email && (
                  <span className="input-error-message">{errors.email}</span>
                )}
              </div>

              {view !== 'forgot' && (
                <div className="input-field-container">
                  <div className="input-label-row">
                    <label className="input-label-premium">PASSWORD</label>
                    {view === 'login' && (
                      <span className="forgot-password-inline-link" onClick={() => handleTabChange('forgot')}>
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className={`input-with-icon ${errors.password && touched.password ? 'input-error-state' : ''}`}>
                    <FiLock className="input-inner-icon" />
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                      onBlur={() => handleBlur('password')}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {errors.password && touched.password && (
                    <span className="input-error-message">{errors.password}</span>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className={`auth-submit-btn-premium ${isLoading ? 'btn-loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="auth-btn-spinner"></span>
                ) : (
                  view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : 'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {!successMsg && view === 'forgot' && (
            <div className="auth-extra-links">
              <p className="link-switch">
                <span onClick={() => handleTabChange('login')} className="toggle-action-back">
                  Back to Sign In
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;