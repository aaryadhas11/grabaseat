import React from 'react';
import './MoodMatcher.css';
import { useGlobalContext } from '../context/GlobalState';

const vibes = [
  'All', 
  'Romantic', 
  'Emotional', 
  'Thrilled', 
  'Excited', 
  'Cheerful', 
  'Intense', 
  'Vibrant', 
  'Chill', 
  'Nostalgic', 
  'Comedy', 
  'Horror'
];

const MoodMatcher = () => {
  const { selectedVibe, setSelectedVibe } = useGlobalContext();

  return (
    <div className="mood-matcher-container">
      <div className="mood-matcher-glass">
        <span className="mood-label">VIBE MATCH:</span>
        <div className="mood-chips">
          {vibes.map((vibe) => (
            <button
              key={vibe}
              className={`mood-chip ${selectedVibe === vibe ? 'active' : ''}`}
              onClick={() => setSelectedVibe(vibe)}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodMatcher;
