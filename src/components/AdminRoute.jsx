import React from 'react';
import { useGlobalContext } from '../context/GlobalState';

const AdminRoute = ({ children }) => {
  const { currentUser, isLoggedIn } = useGlobalContext();

  const emailLower = currentUser?.email?.toLowerCase();
  const isAdmin = isLoggedIn && (currentUser?.isAdmin || emailLower === "adminlogin11@gmail.com" || emailLower === "aaryanitindhas@gmail.com");

  if (isAdmin) {
    return children;
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#ff4d4d', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
      <h1 style={{ color: '#FFC300' }}>ACCESS DENIED</h1>
      <p style={{ color: '#fff', marginTop: '10px' }}>This page is restricted to GrabASeat administrators only.</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          background: '#FFC300',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Go Home
      </button>
    </div>
  );
};

export default AdminRoute;