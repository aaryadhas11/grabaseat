import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import AuthAlert from './components/AuthAlert';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Showtimes from './pages/Showtimes';
import Splash from './pages/Splash';
import CityPicker from './pages/CityPicker';
import PaymentModal from './components/PaymentModal';
import TicketView from './pages/TicketView';
import Admin from './pages/Admin';
import Bookings from './pages/Bookings';
import AdminRoute from './components/AdminRoute';
import AuthNotification from './components/AuthNotification';
import ResetPassword from './pages/ResetPassword';
import { useGlobalContext } from './context/GlobalState';

function App() {
  const { hasSeenSplash, selectedCity, showAuthModal, showPaymentModal, toastMessage, setToastMessage } = useGlobalContext();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  if (!hasSeenSplash) return <Splash />;
  if (!selectedCity) return <CityPicker />;

  return (
    <Router>
      <Navbar />
      <AuthAlert />
      <AuthNotification />

      {toastMessage && (
        <div style={{
          position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#1a1a1a', color: '#FFC300', padding: '12px 24px',
          borderRadius: '30px', zIndex: 9999, fontWeight: '700',
          boxShadow: '0 5px 20px rgba(255, 195, 0, 0.2)',
          border: '1px solid rgba(255, 195, 0, 0.3)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage('')} 
            style={{ background: 'none', border: 'none', color: '#FFC300', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', padding: '0 4px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* This handles your Login UI professionally without needing a separate page */}
      {showAuthModal && <AuthModal />}
      {showPaymentModal && <PaymentModal />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/showtimes/:id" element={<Showtimes />} />
        <Route path="/book/:id" element={<Booking />} />
        <Route path="/ticket" element={<TicketView />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;