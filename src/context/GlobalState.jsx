import React, { createContext, useState, useContext, useEffect } from 'react';
import { moviesData as localMoviesData } from '../moviesData';

export const GlobalContext = createContext();

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://grabaseat-api.onrender.com').replace(/\/$/, '');

export const GlobalProvider = ({ children }) => {
  const [likedList, setLikedList] = useState([]);
  const [dislikedList, setDislikedList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [selectedVibe, setSelectedVibe] = useState('All');
  const [moviesData, setMoviesData] = useState([]);
  
  // Custom Alert States
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [shakeAlert, setShakeAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ── Professional Auth Notification (centered overlay toast) ──────────────
  const [authNotification, setAuthNotification] = useState({ visible: false, message: '' });

  const showAuthNotification = (message) => {
    setAuthNotification({ visible: true, message });
  };

  const clearAuthNotification = () => {
    setAuthNotification({ visible: false, message: '' });
  };

  // Flow States
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('userCity') || null);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      fetchUserWishlist(user.email);
    }

    // Fetch dynamic movies database (falls back to local data if server is offline)
    fetch(`${API_BASE_URL}/api/movies`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setMoviesData(data);
        else setMoviesData(localMoviesData);
      })
      .catch(err => {
        console.error("Failed to load DB movies, using local data:", err);
        setMoviesData(localMoviesData);
      });
  }, []);

  const fetchUserWishlist = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist/${email}`);
      if (res.ok) {
        const data = await res.json();
        if (data.likedList) setLikedList(data.likedList.map(id => String(id)));
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    }
  };

  // Authentication Functions
  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isLogin: true })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        fetchUserWishlist(data.user.email);
        // Show professional Sign-In notification
        showAuthNotification(`Welcome back, ${data.user.name}! You have successfully signed in.`);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Server error' };
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setLikedList([]); // New user has no wishlist
        // Show professional Sign-In notification for new accounts too
        showAuthNotification(`Welcome, ${data.user.name}! Your account has been created.`);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Server error' };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setLikedList([]);        // clear hearts immediately
    setDislikedList([]);     // clear dislikes immediately
    localStorage.clear();    // wipe everything including userCity-safe keys
    sessionStorage.clear();  // wipe session storage
    if (selectedCity) {
      localStorage.setItem('userCity', selectedCity); // preserve city if set
    }
    showAuthNotification('Signed Out. See you soon at GrabASeat!');
  };

  const triggerAuthFlow = () => {
    setAuthMessage("AUTHENTICATION REQUIRED: Please sign in to complete your booking.");
    setShowAuthAlert(true);
    setTimeout(() => {
      setShowAuthModal(true);
    }, 3000);
  };

  const handleLike = async (id) => {
    // If user is not logged in, we shouldn't allow server side action
    if (!isLoggedIn || !currentUser) {
      triggerAuthFlow();
      return;
    }

    // Optimistic UI update immediately
    const isCurrentlyLiked = likedList.includes(String(id));
    if (isCurrentlyLiked) {
      setLikedList(prev => prev.filter(item => String(item) !== String(id)));
    } else {
      setLikedList(prev => [...prev, String(id)]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, movieId: String(id) })
      });
      const data = await response.json();
      
      // Sync with server response
      if (response.ok && data.likedList) {
        setLikedList(data.likedList.map(item => String(item)));
      } else if (!response.ok) {
        // Revert on failure
        if (isCurrentlyLiked) {
          setLikedList(prev => [...prev, String(id)]);
        } else {
          setLikedList(prev => prev.filter(item => String(item) !== String(id)));
        }
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err);
      // Revert on network error
      if (isCurrentlyLiked) {
        setLikedList(prev => [...prev, String(id)]);
      } else {
        setLikedList(prev => prev.filter(item => String(item) !== String(id)));
      }
    }
  };

  const handleDislike = (id) => {
    // We strictly mimic like toggling logic on UI since wishlist strictly handles liked components via API.
    if (likedList.includes(id)) {
      handleLike(id); // Untoggles the like API remotely
    }
    
    // Manage visually locally
    if (dislikedList.includes(id)) {
      setDislikedList(prev => prev.filter(item => item !== id));
    } else {
      setDislikedList(prev => [...prev, id]);
    }
  };

  return (
    <GlobalContext.Provider value={{ 
      likedList, 
      dislikedList, 
      handleLike, 
      handleDislike,
      searchQuery,
      setSearchQuery,
      isLoggedIn,
      setIsLoggedIn,
      showAuthModal,
      setShowAuthModal,
      currentUser,
      setCurrentUser,
      showAuthAlert,
      setShowAuthAlert,
      authMessage,
      setAuthMessage,
      shakeAlert,
      setShakeAlert,
      selectedCity,
      setSelectedCity,
      hasSeenSplash,
      setHasSeenSplash,
      isPaid,
      setIsPaid,
      showPaymentModal,
      setShowPaymentModal,
      pendingBooking,
      setPendingBooking,
      handleLogin,
      handleRegister,
      handleLogout,
      triggerAuthFlow,
      toastMessage,
      setToastMessage,
      authNotification,
      showAuthNotification,
      clearAuthNotification,
      selectedVibe,
      setSelectedVibe,
      moviesData
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
