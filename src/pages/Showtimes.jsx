import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalState';
import { FiMapPin, FiCalendar } from 'react-icons/fi';
import HeaderNav from '../components/HeaderNav';
import { calculateSeatAvailability } from '../utils/seatUtils';
import './Showtimes.css';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_SHOWTIMES = [
  "09:30 AM",
  "12:15 PM",
  "03:30 PM",
  "06:00 PM",
  "08:45 PM",
  "11:15 PM"
];

const isShowtimePast = (fullDateString, timeString) => {
  if (!fullDateString || !timeString) return false;
  
  const now = new Date();
  const todayDateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  
  const isToday = fullDateString === 'Today' || fullDateString === todayDateStr;
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
  
  return showtimeMinutes <= currentMinutes;
};

const Showtimes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { moviesData } = useGlobalContext();

  const movie = moviesData.find(m => String(m._id || m.id) === String(id));
  const [bookedCounts, setBookedCounts] = useState({});

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        dayName: i === 0 ? 'Today' : days[d.getDay()],
        dayNum: d.getDate(),
        month: months[d.getMonth()],
        fullDate: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      });
    }
    return dates;
  };

  const datesList = getDates();
  const [selectedDate, setSelectedDate] = useState(datesList[0].fullDate);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!movie) return;
    const movieId = movie._id || movie.id;
    fetch(`http://localhost:5000/api/bookings/${movieId}?bookingDate=${encodeURIComponent(selectedDate)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(b => {
            const key = `${b.theater}_${b.showTime}`;
            map[key] = (map[key] || 0) + (b.selectedSeats ? b.selectedSeats.length : 0);
          });
          setBookedCounts(map);
        }
      })
      .catch(console.error);
  }, [movie, selectedDate]);

  if (!movie) {
    return (
      <div className="showtimes-loading-container">
        <div className="spinner"></div>
        <p>Loading showtimes...</p>
      </div>
    );
  }

  const theaters = movie.theaters && movie.theaters.length > 0
    ? movie.theaters
    : ["PVR Cinemas", "INOX Cineplex", "Cinepolis"];

  const showTimes = (movie.showTime && movie.showTime.length > 0)
    ? movie.showTime
    : DEFAULT_SHOWTIMES;

  const getSlotStatus = (theater, time) => {
    const isPast = isShowtimePast(selectedDate, time);
    if (isPast) {
      return { 
        statusText: 'PAST', 
        statusClass: 'badge-past', 
        isAlmostFull: false, 
        isSoldOut: false, 
        isPast: true 
      };
    }

    const key = `${theater}_${time}`;
    const dbCount = bookedCounts[key] || 0;
    const avail = calculateSeatAvailability(dbCount);

    return {
      statusText: avail.label,
      statusClass: avail.className,
      isAlmostFull: avail.status === 'ALMOST_FULL' || avail.status === 'FILLING_FAST',
      isSoldOut: avail.status === 'SOLD_OUT',
      isPast: false
    };
  };

  const handleTimeClick = (theater, time, isAlmostFull, isPast) => {
    if (isPast) return;
    navigate(`/book/${movie._id || movie.id}?theater=${encodeURIComponent(theater)}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(time)}&almostFull=${isAlmostFull}`);
  };

  return (
    <div className="showtimes-outer-wrapper">
      <HeaderNav title={`${movie.title} • Showtimes`} />

      <div className="showtimes-title-meta">
        <h1 className="movie-title-heading">{movie.title}</h1>
        <p className="movie-subtitle-meta">{movie.genre} • ⭐ {movie.rating} • {movie.certification || "UA"}</p>
      </div>

      {/* Dynamic Date Selector */}
      <div className="dates-selector-bar glass">
        <div className="dates-container-inner">
          {datesList.map((d, index) => (
            <button
              key={index}
              type="button"
              className={`date-tab-card ${selectedDate === d.fullDate ? 'active' : ''}`}
              onClick={() => setSelectedDate(d.fullDate)}
            >
              <span className="date-tab-day">{d.dayName}</span>
              <span className="date-tab-num">{d.dayNum}</span>
              <span className="date-tab-month">{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theaters & Slots */}
      <div className="showtimes-cinemas-list-container">
        <div className="selection-legend-row">
          <span className="legend-item"><FiCalendar size={14} /> {selectedDate}</span>
          <span className="legend-item"><FiMapPin size={14} /> English, 2D</span>
        </div>

        <div className="cinemas-vertical-list">
          {theaters.map((theater, tIndex) => (
            <div key={tIndex} className="cinema-card-panel glass">
              <div className="cinema-info-col">
                <h3 className="cinema-name-header">🏛️ {theater}</h3>
                <p className="cinema-location-sub"><FiMapPin size={12} /> Digital Sound, Recliner Tiers Available</p>
              </div>

              <div className="cinema-slots-grid">
                {showTimes.map((time, sIndex) => {
                  const { statusText, statusClass, isAlmostFull, isPast } = getSlotStatus(theater, time);
                  return (
                    <button
                      key={sIndex}
                      type="button"
                      disabled={isPast}
                      className={`time-slot-pill ${statusClass} ${isPast ? 'slot-past-disabled' : ''}`}
                      onClick={() => handleTimeClick(theater, time, isAlmostFull, isPast)}
                    >
                      <span className="slot-time-text">{time}</span>
                      <span className={`slot-availability ${statusClass}`}>
                        {statusText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Showtimes;
