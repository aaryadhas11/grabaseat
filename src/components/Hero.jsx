import React from 'react';
import logo from '../assets/logo.png';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-links">
          <a href="#">HOME</a>
          <a href="#mylist">MY LIST</a>
          <a href="#liveshows">LIVE SHOWS</a>
        </div>
        <h1 className="hero-title">Experience Cinema Like Never Before</h1>
        <p className="hero-subtitle">Book tickets for the latest blockbusters at GrabASeat.</p>
        <button className="book-now-btn">Book Now</button>

        <div className="live-shows-cards-container" id="liveshows">
          <div className="live-card">
            <span className="live-badge">● LIVE</span>
            <div className="live-card-bg acoustic"></div>
            <p>Acoustic Nights</p>
          </div>
          <div className="live-card">
            <span className="live-badge">● LIVE</span>
            <div className="live-card-bg laughs"></div>
            <p>Midnight Laughs</p>
          </div>
          <div className="live-card">
            <span className="live-badge">● LIVE</span>
            <div className="live-card-bg grand"></div>
            <p>The Grand Stage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
