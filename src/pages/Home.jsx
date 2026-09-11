import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Movies from '../components/Movies';
import MoodMatcher from '../components/MoodMatcher';
import { useGlobalContext } from '../context/GlobalState';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { filterMoviesByMood } from '../utils/moodMatcher';

// ---------------------------------------------------------------------------
// HorizontalSection — scrollable row with heart icon on each card
// ---------------------------------------------------------------------------
const HorizontalSection = ({ title, data }) => {
  const navigate = useNavigate();
  const { isLoggedIn, triggerAuthFlow, likedList, handleLike, setToastMessage } = useGlobalContext();

  if (!data || data.length === 0) return null;

  return (
    <div style={{ padding: '0 40px 40px 40px' }}>
      <h2 style={{
        color: '#FFC300',
        marginBottom: '20px',
        fontWeight: '900',
        textTransform: 'uppercase'
      }}>
        {title}
      </h2>

      <div
        style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}
        className="horizontal-scroll"
      >
        {data.map(item => {
          const movieId = String(item._id || item.id);
          const isLiked = likedList.includes(movieId);
          const isUpcoming = item.type === 'movie' && !item.trending;

          return (
            <div
              key={movieId}
              style={{
                minWidth: '300px',
                background: '#1a1a1a',
                padding: '15px',
                borderRadius: '15px',
                border: '1px solid #222',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => {
                if (isUpcoming) {
                  setToastMessage("Interest registered! We'll notify you when tickets go live.");
                  return;
                }
                if (!isLoggedIn) { triggerAuthFlow(); }
                else { navigate(`/showtimes/${item._id || item.id}`); }
              }}
            >
              {/* Poster with overlaid heart button */}
              <div style={{ position: 'relative' }}>
                <img
                  src={item.image || item.posterUrl}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    filter: 'brightness(0.8)'
                  }}
                  alt={item.title}
                />

                {/* HEART ICON — stopPropagation prevents card navigation */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLoggedIn) { triggerAuthFlow(); return; }
                    handleLike(movieId);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.55)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <FiHeart
                    size={18}
                    fill={isLiked ? '#ff4d4d' : 'none'}
                    color={isLiked ? '#ff4d4d' : '#fff'}
                  />
                </button>
              </div>

              {/* Title + Genre */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '15px',
                alignItems: 'center'
              }}>
                <h3 style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  margin: 0,
                  fontSize: '1.1rem'
                }}>
                  {item.title}
                </h3>
                {item.genre && (
                  <span style={{
                    color: '#FFC300',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    border: '1px solid #FFC300',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    marginLeft: '8px'
                  }}>
                    {item.genre.split(' ')[0]}
                  </span>
                )}
              </div>

              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '8px' }}>
                ★ {item.rating}
              </p>

              {/* Book Tickets button — stopPropagation so heart doesn't bubble to this */}
              {isUpcoming ? (
                <button
                  style={{
                    marginTop: '15px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#333',
                    color: '#FFC300',
                    border: '1px solid #FFC300',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setToastMessage("Interest registered! We'll notify you when tickets go live.");
                  }}
                >
                  ★ INTERESTED
                </button>
              ) : (
                <button
                  style={{
                    marginTop: '15px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#FFC300',
                    color: '#000',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLoggedIn) { triggerAuthFlow(); }
                    else { navigate(`/showtimes/${item._id || item.id}`); }
                  }}
                >
                  Book Tickets
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Home — main page
// ---------------------------------------------------------------------------
const Home = () => {
  const { selectedCity, setSelectedCity, moviesData, selectedVibe, isLoggedIn, currentUser } = useGlobalContext();

  // Safe guard: always an array even while fetching
  const safeMovies = moviesData || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ── Category filtering: slice raw data first by type ──────────────────────
  // Vibe filter is then applied INDEPENDENTLY to each category so "Chill"
  // won't, for example, hide Live Shows that don't carry a vibe tag.

  const vibeFilter = (list) =>
    selectedVibe && selectedVibe !== 'All'
      ? filterMoviesByMood(list, selectedVibe)
      : list;

  // 1. Live Shows
  const liveBase = safeMovies.filter(m => m.type === 'live-show');
  const liveShowsData = vibeFilter(liveBase);

  // 2. Upcoming Blockbusters
  const blockbusterBase = safeMovies.filter(m => m.type === 'movie' && m.trending === false);
  const blockbustersData = vibeFilter(blockbusterBase);

  // 3. Standup Specials
  const standupBase = safeMovies.filter(m => m.type === 'standup');
  const standupData = vibeFilter(standupBase);

  // 4. Virtual Concerts
  const concertBase = safeMovies.filter(m => m.type === 'concert');
  const virtualConcertsData = vibeFilter(concertBase);

  // 5. Theater Plays
  const theatreBase = safeMovies.filter(m => m.type === 'theatre');
  const theaterPlaysData = vibeFilter(theatreBase);

  return (
    <div style={{ background: '#0b0c10', minHeight: '100vh' }}>

      {/* Location bar */}
      <div style={{
        padding: '12px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333'
      }}>
        <span style={{ color: '#fff', fontWeight: 'bold' }}>
          LOCATION: <span style={{ color: '#FFC300' }}>{selectedCity}</span>
        </span>
        <button
          onClick={() => { localStorage.removeItem('userCity'); setSelectedCity(null); }}
          style={{
            background: 'none',
            border: '1px solid #FFC300',
            color: '#FFC300',
            cursor: 'pointer',
            padding: '5px 10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.75rem'
          }}
        >
          CHANGE CITY
        </button>
      </div>

      {/* Hero + Mood Matcher + Now Showing grid */}
      <Hero />
      <MoodMatcher />
      <Movies title="Now Showing" id="movies" />

      {/* Horizontal scrollable sections */}
      <div id="liveshows" style={{ paddingTop: '40px' }}>
        <HorizontalSection title="Live Shows" data={liveShowsData} />
      </div>

      <HorizontalSection title="Upcoming Blockbusters" data={blockbustersData} />
      <HorizontalSection title="Standup Specials" data={standupData} />
      <HorizontalSection title="Virtual Concerts" data={virtualConcertsData} />
      <HorizontalSection title="Theater Plays" data={theaterPlaysData} />

      {/* My Wishlist — only render when a user is actively logged in */}
      {isLoggedIn && currentUser && (
        <Movies title="My Wishlist" id="mylist" filterKey="mylist" />
      )}
    </div>
  );
};

export default Home;