import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../context/GlobalState';
import './Splash.css';

const Splash = () => {
  const { setHasSeenSplash } = useGlobalContext();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fading out at 3 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    // Completely unmount at 3.5 seconds
    const unmountTimer = setTimeout(() => {
      setHasSeenSplash(true);
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [setHasSeenSplash]);

  return (
    <div className={`splash-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <h1 className="splash-logo">
          <span className="logo-white">GrabA</span>
          <span className="logo-red">Seat</span>
        </h1>
        <p className="splash-tagline">
          Experience Cinema Like Never Before.
        </p>
      </div>
    </div>
  );
};

export default Splash;
