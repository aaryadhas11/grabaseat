import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalState';
import { calculateSeatAvailability, TOTAL_SEATS_COUNT } from '../utils/seatUtils';
import './Booking.css';

const DEFAULT_SHOWTIMES = [
  "09:30 AM",
  "12:15 PM",
  "03:30 PM",
  "06:00 PM",
  "08:45 PM",
  "11:15 PM"
];

const isShowtimePast = (fullDateString, timeString) => {
  if (!timeString) return false;
  
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const todayDateStr = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
  
  const isToday = !fullDateString || fullDateString === 'Today' || fullDateString === todayDateStr;
  if (!isToday) return false;
  
  const match = timeString.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return false;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  const showtimeMinutes = hours * 60 + minutes;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  return showtimeMinutes < currentMinutes;
};

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const theater = searchParams.get('theater') || 'GrabASeat Cinema';
  const date = searchParams.get('date') || 'Today';
  const showTimeQuery = searchParams.get('time') || '';

  const { moviesData, currentUser, isLoggedIn, setShowAuthModal, setShowPaymentModal, setPendingBooking } = useGlobalContext();

  const movie = moviesData.find(m => String(m._id || m.id) === String(id));

  const movieShowtimes = (movie && movie.showTime && movie.showTime.length > 0)
    ? movie.showTime
    : (movie && movie.showtimes && movie.showtimes.length > 0)
    ? movie.showtimes
    : DEFAULT_SHOWTIMES;

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [dbBookedSeats, setDbBookedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(
    showTimeQuery && movieShowtimes.includes(showTimeQuery)
      ? showTimeQuery
      : movieShowtimes[0]
  );
  const [msg, setMsg] = useState("");

  const bestsellerSeats = ['C4', 'C5', 'C6', 'C7', 'D4', 'D5', 'D6', 'D7'];

  useEffect(() => {
    if (showTimeQuery && movieShowtimes.includes(showTimeQuery)) {
      setSelectedTime(showTimeQuery);
    }
  }, [showTimeQuery, movieShowtimes]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const movieId = movie ? (movie._id || movie.id) : id;
    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://grabaseat-api.onrender.com').replace(/\/$/, '');
    
    fetch(`${API_BASE_URL}/api/bookings/${movieId}?theater=${encodeURIComponent(theater)}&bookingDate=${encodeURIComponent(date)}&showTime=${encodeURIComponent(selectedTime)}`)
      .then(res => res.json())
      .then(data => {
        let allSeats = [];
        if (Array.isArray(data)) {
          allSeats = data.flatMap(b => b.selectedSeats || []);
        }
        setDbBookedSeats(allSeats);
      })
      .catch(console.error);
  }, [id, movie, theater, date, selectedTime, location.search]);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const avail = calculateSeatAvailability(dbBookedSeats);
  const isHousefull = avail.status === 'SOLD_OUT';

  const getSeatPriceAndTier = (seatId, movieType) => {
    const row = seatId.charAt(0);
    const isMovie = movieType === 'movie' || movieType === 'tv-show';
    
    if (isMovie) {
      if (row === 'E' || row === 'F') return { price: 450, tier: 'RECLINER' };
      if (row === 'C' || row === 'D') return { price: 250, tier: 'PRIME / EXECUTIVE' };
      return { price: 150, tier: 'CLASSIC' };
    } else {
      if (row === 'A' || row === 'B') return { price: 999, tier: 'STAGE FRONT: VIP / LOUNGE' };
      if (row === 'C' || row === 'D') return { price: 499, tier: 'MIDDLE SECTION: GOLD PHASE' };
      return { price: 299, tier: 'REAR / STANDING: SILVER / GENERAL ACCESS' };
    }
  };

  const getSelectedSeatsTotal = () => {
    return selectedSeats.reduce((acc, seatId) => {
      const { price } = getSeatPriceAndTier(seatId, movie ? movie.type : '');
      return acc + price;
    }, 0);
  };

  const handleProceed = () => {
    if (isHousefull) {
      setMsg("THIS SHOW IS HOUSEFULL. PLEASE SELECT ANOTHER TIME SLOT OR THEATER.");
      return;
    }

    if (!isLoggedIn) {
      setMsg("FIRST SIGN IN THEN ONLY YOU CAN BOOK TICKETS");
      setTimeout(() => {
        setShowAuthModal(true);
      }, 1500);
      return;
    }

    if (selectedSeats.length === 0) {
      setMsg("PLEASE SELECT YOUR SEATS TO PROCEED");
      return;
    }

    setPendingBooking({
      email: currentUser.email,
      movieId: movie._id || movie.id,
      movieTitle: movie.title,
      showTime: selectedTime,
      selectedSeats: selectedSeats,
      totalPrice: getSelectedSeatsTotal(),
      theater: theater,
      bookingDate: date
    });

    setShowPaymentModal(true);
  };

  const handleSeatClick = (seatId) => {
    if (dbBookedSeats.includes(seatId) || isHousefull) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  if (!movie) return <div className="loading">Movie Not Found...</div>;

  return (
    <div className="booking-outer-container">
      {msg && (
        <div className="booking-status-banner">
          <span className="banner-text">{msg}</span>
          <div className="banner-actions">
            {!isLoggedIn && (
              <button className="banner-signin-link" onClick={() => setShowAuthModal(true)}>
                SIGN IN
              </button>
            )}
            <button className="close-banner" onClick={() => setMsg("")}>✕</button>
          </div>
        </div>
      )}

      <div className="booking-main-card">
        <header className="movie-info-header">
          <div style={{ marginBottom: '14px' }}>
            <button onClick={() => navigate(-1)} className="bms-back-btn">
              ← Back
            </button>
          </div>

          <h1 className="movie-title-display">{movie.title}</h1>
          <div className="movie-tags">
            <span className="tag-pill">{movie.genre}</span>
            <span className="tag-pill">{"⭐ " + movie.rating}</span>
            <span className="tag-pill highlight">{"🏛️ " + theater}</span>
            <span className="tag-pill highlight">{"📅 " + date}</span>
            
            <span className={'tag-pill ' + avail.className}>
              {avail.label}
            </span>
          </div>
        </header>

        <section className="booking-time-selector">
          <p className="label-caps">SELECT SHOWTIME</p>
          <div className="time-chips-container">
            {movieShowtimes.map((t) => {
              const isPast = isShowtimePast(date, t);
              return (
                <button
                  key={t}
                  disabled={isPast}
                  className={'time-chip ' + (selectedTime === t ? 'active' : '') + (isPast ? ' past-disabled' : '')}
                  onClick={() => {
                    if (isPast) return;
                    setSelectedTime(t);
                    setSelectedSeats([]);
                  }}
                >
                  {t} {isPast && <span className="past-text">(Past)</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="cinema-hall">
          <div className="screen-area">
            <div className="screen-curve"></div>
            <p className="screen-caption">All eyes this way</p>
          </div>

          {/* Correct Row Order: Classic (A, B) -> Prime (C, D) -> Recliner (E, F) */}
          <div className="seats-container">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((row) => {
              const sampleSeatId = row + '1';
              const { price, tier } = getSeatPriceAndTier(sampleSeatId, movie.type);
              const showHeader = row === 'A' || row === 'C' || row === 'E';

              return (
                <React.Fragment key={row}>
                  {showHeader && (
                    <div className="seat-tier-header">
                      <span className="tier-name">{tier}</span>
                      <span className="tier-price">₹{price}</span>
                    </div>
                  )}

                  <div className="seat-row">
                    <div className="row-label">{row}</div>
                    <div className="row-seats">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                        const seatId = row + num;
                        const isBooked = dbBookedSeats.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);
                        const isBest = bestsellerSeats.includes(seatId);

                        let seatClass = 'seat';
                        if (isBooked) {
                          seatClass += ' booked';
                        } else if (isSelected) {
                          seatClass += ' selected';
                        } else if (isBest) {
                          seatClass += ' bestseller';
                        }

                        return (
                          <button
                            key={seatId}
                            type="button"
                            disabled={isBooked}
                            className={seatClass}
                            onClick={() => handleSeatClick(seatId)}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Centered Solid Horizontal Legend */}
          <div className="seat-legend-bar">
            <div className="legend-chip">
              <span className="legend-indicator legend-occupied"></span>
              <span className="legend-label">Occupied</span>
            </div>
            <div className="legend-chip">
              <span className="legend-indicator legend-available"></span>
              <span className="legend-label">Available</span>
            </div>
            <div className="legend-chip">
              <span className="legend-indicator legend-selected"></span>
              <span className="legend-label">Selected</span>
            </div>
            <div className="legend-chip">
              <span className="legend-indicator legend-bestseller"></span>
              <span className="legend-label">Bestseller</span>
            </div>
          </div>
        </section>

        <footer className="booking-summary-footer">
          <div className="summary-text">
            <p>Selected: <span className="highlight-text">
              {selectedSeats.length > 0 ? selectedSeats.sort().map(s => {
                const { price, tier } = getSeatPriceAndTier(s, movie.type);
                return s + ' (' + tier + ' - ₹' + price + ')';
              }).join(', ') : 'None'}
            </span></p>
            <h3>Total Amount: <span className="highlight-text">{'₹' + getSelectedSeatsTotal()}</span></h3>
          </div>
          <button 
            className="proceed-payment-btn" 
            onClick={handleProceed}
            disabled={isHousefull}
          >
            {isHousefull ? 'HOUSEFULL' : 'PROCEED TO PAY'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Booking;