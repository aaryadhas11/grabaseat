import React, { useEffect, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { useGlobalContext } from '../context/GlobalState';

/**
 * AuthNotification
 * ─────────────────
 * A professional centered overlay toast that replaces all browser popups.
 * Triggered by setting `authNotification` in GlobalContext with:
 *   { message: string, visible: true }
 *
 * It auto-dismisses after 2.5 s with a smooth fade-out.
 */
const AuthNotification = () => {
  const { authNotification, clearAuthNotification } = useGlobalContext();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!authNotification?.visible) return;

    // Start fade-out at 2 s, fully gone at 2.5 s
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const clearTimer = setTimeout(() => {
      setFading(false);
      clearAuthNotification();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(clearTimer);
    };
  }, [authNotification?.visible]);

  if (!authNotification?.visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,                        // full-screen backdrop
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none',           // never blocks clicks
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #111214, #1a1c20)',
          border: '1px solid rgba(255, 195, 0, 0.35)',
          borderRadius: '20px',
          padding: '48px 56px',
          textAlign: 'center',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,195,0,0.08)',
          transform: fading ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.5s ease',
        }}
      >
        {/* Gold check icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(255, 195, 0, 0.12)',
          border: '2px solid #FFC300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <FiCheckCircle size={36} color="#FFC300" strokeWidth={2} />
        </div>

        {/* Message */}
        <p style={{
          color: '#FFC300',
          fontSize: '1.25rem',
          fontWeight: '700',
          letterSpacing: '0.3px',
          lineHeight: '1.5',
          margin: 0,
        }}>
          {authNotification.message}
        </p>

        {/* Thin progress bar that depletes in 2.5 s */}
        <div style={{
          marginTop: '28px',
          height: '3px',
          background: 'rgba(255,195,0,0.15)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            background: '#FFC300',
            borderRadius: '99px',
            animation: 'shrink 2.5s linear forwards',
          }} />
        </div>
      </div>

      {/* Keyframe for the progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
};

export default AuthNotification;
