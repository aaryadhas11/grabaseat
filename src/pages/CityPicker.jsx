import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalState';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import './CityPicker.css';

const FEATURED_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Pune',
  'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'
];

const ALL_CITIES = [
  'Agra', 'Ajmer', 'Amritsar', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 
  'Coimbatore', 'Dehradun', 'Faridabad', 'Ghaziabad', 'Guwahati', 'Gwalior',
  'Indore', 'Jaipur', 'Jodhpur', 'Kanpur', 'Kochi', 'Lucknow', 'Ludhiana',
  'Madurai', 'Meerut', 'Nagpur', 'Nashik', 'Patna', 'Raipur', 'Rajkot',
  'Ranchi', 'Surat', 'Thiruvananthapuram', 'Vadodara', 'Varanasi', 'Visakhapatnam'
];

const CityPicker = () => {
  const { setSelectedCity } = useGlobalContext();
  const [filterQuery, setFilterQuery] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleCitySelect = (city) => {
    localStorage.setItem('userCity', city);
    setIsExiting(true);
    // Add small delay to let fade-out geometry play smoothly
    setTimeout(() => {
      setSelectedCity(city);
    }, 400);
  };

  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const detectedCity = data.address.city || data.address.state_district || data.address.town || data.address.village;
          
          if (detectedCity) {
            handleCitySelect(detectedCity);
          } else {
            alert("Could not accurately determine your city.");
            setIsLocating(false);
          }
        } catch (error) {
          console.error(error);
          alert("Failed to fetch location data.");
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Location access denied or unavailable.");
        setIsLocating(false);
      }
    );
  };

  const checkMatch = (city) => city.toLowerCase().includes(filterQuery.toLowerCase());
  const filteredFeatured = FEATURED_CITIES.filter(checkMatch);
  const filteredAll = ALL_CITIES.filter(checkMatch);

  return (
    <div className={`city-picker-layout ${isExiting ? 'city-picker-exit' : ''}`}>
      <div className="city-picker-container glass">
        
        <div className="city-picker-header">
          <h2>Select Your City</h2>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
            <div className="city-searchbox" style={{ flex: 1, maxWidth: '400px' }}>
               <FiSearch size={20} color="#888" />
               <input 
                 type="text" 
                 placeholder="Search for your city..." 
                 value={filterQuery}
                 onChange={(e) => setFilterQuery(e.target.value)}
               />
            </div>
            <button 
              onClick={autoDetectLocation}
              disabled={isLocating}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
                background: 'rgba(255, 195, 0, 0.1)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)',
                borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s ease',
                opacity: isLocating ? 0.6 : 1
              }}
            >
              <FiMapPin /> {isLocating ? 'Detecting...' : 'Auto-Detect'}
            </button>
          </div>
        </div>

        <div className="city-scroll-area">
          {filteredFeatured.length > 0 && (
            <div className="city-section">
              <h3 className="city-section-title">Featured Cities</h3>
              <div className="featured-cities-grid">
                {filteredFeatured.map(city => (
                  <button key={city} className="featured-city-btn" onClick={() => handleCitySelect(city)}>
                    <FiMapPin className="city-pin" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredAll.length > 0 && (
            <div className="city-section">
              <h3 className="city-section-title">Other Cities</h3>
              <div className="all-cities-grid">
                {filteredAll.map(city => (
                  <button key={city} className="all-city-btn" onClick={() => handleCitySelect(city)}>
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredFeatured.length === 0 && filteredAll.length === 0 && (
            <div className="no-cities-found">
              <p>We couldn't find a matching city.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityPicker;
