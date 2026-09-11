import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../context/GlobalState';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiFilm, FiClock, FiMapPin, FiCalendar, FiHeart, FiUser } from 'react-icons/fi';
import HeaderNav from '../components/HeaderNav';

const Bookings = () => {
  const { currentUser, isLoggedIn, likedList, moviesData, handleLike } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabQuery = searchParams.get('tab') || 'bookings';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabQuery); // 'bookings' or 'wishlist'

  useEffect(() => {
    setActiveTab(tabQuery);
  }, [tabQuery]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isLoggedIn || !currentUser?.email) {
      setLoading(false);
      return;
    }
    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://grabaseat-api.onrender.com').replace(/\/$/, '');
    fetch(`${API_BASE_URL}/api/bookings/user/${currentUser.email}`)
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div style={styles.centeredPage}>
        <FiFilm size={60} color="#FFC300" />
        <h2 style={styles.emptyTitle}>Sign in to see your bookings</h2>
        <button style={styles.cta} onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  // Filter dynamic wishlist movies from user's likedList
  const wishlistMovies = (moviesData || []).filter(m => likedList.includes(String(m._id || m.id)));

  return (
    <div style={styles.page}>
      {/* Universal BookMyShow Header Navigation */}
      <HeaderNav title="My Account" />

      {/* Profile Header Block */}
      <div style={styles.profileHeaderBlock}>
        <div style={styles.avatarCircle}>
          <FiUser size={30} color="#000" />
        </div>
        <div style={styles.profileDetailsCol}>
          <h2 style={styles.profileNameText}>{currentUser?.name || "Premium User"}</h2>
          <p style={styles.profileEmailText}>{currentUser?.email}</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={styles.tabsContainer}>
        <button 
          style={{ ...styles.tabBtn, ...(activeTab === 'bookings' ? styles.activeTabBtn : {}) }}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
          {activeTab === 'bookings' && <div style={styles.activeIndicator} />}
        </button>
        <button 
          style={{ ...styles.tabBtn, ...(activeTab === 'wishlist' ? styles.activeTabBtn : {}) }}
          onClick={() => setActiveTab('wishlist')}
        >
          My Wishlist ({wishlistMovies.length})
          {activeTab === 'wishlist' && <div style={styles.activeIndicator} />}
        </button>
      </div>

      {activeTab === 'bookings' ? (
        loading ? (
          <div style={styles.innerLoadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#888', marginTop: '20px' }}>Fetching your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={styles.innerLoadingContainer}>
            <FiFilm size={60} color="#FFC300" style={{ opacity: 0.6 }} />
            <h3 style={styles.emptyTitle}>No bookings found.</h3>
            <p style={styles.emptySubtitle}>Time to grab a seat for your next blockbuster!</p>
            <button style={styles.cta} onClick={() => navigate('/')}>Browse Movies</button>
          </div>
        ) : (
          <div style={styles.list}>
            {bookings.map((b) => (
              <div key={b._id} style={styles.ticket}>
                {/* Left gold bar */}
                <div style={styles.ticketBar}></div>

                {/* Content */}
                <div style={styles.ticketContent}>
                  <div style={styles.ticketLeft}>
                    <h3 style={styles.movieTitle}>{b.movieTitle}</h3>
                    <div style={styles.ticketMeta}>
                      <span style={styles.metaItem}><FiClock size={14} style={{ marginRight: 5 }} />{b.showTime}</span>
                      <span style={styles.metaItem}><FiMapPin size={14} style={{ marginRight: 5 }} />{b.theater || "GrabASeat Cinema"}</span>
                      <span style={styles.metaItem}>
                        <FiCalendar size={14} style={{ marginRight: 5 }} />
                        {b.bookingDate || new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={styles.seats}>
                      {(b.selectedSeats || []).map(s => (
                        <span key={s} style={styles.seatChip}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div style={styles.ticketRight}>
                    <p style={styles.totalLabel}>TOTAL PAID</p>
                    <p style={styles.totalAmount}>₹{b.totalPrice}</p>
                    <span style={styles.confirmedBadge}>✓ CONFIRMED</span>
                  </div>
                </div>

                {/* Dashed separator */}
                <div style={styles.dashed}></div>
                <div style={styles.ticketFooter}>
                  <span style={{ color: '#555', fontSize: '0.75rem' }}>Booking ID: {b._id}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Wishlist View */
        wishlistMovies.length === 0 ? (
          <div style={styles.innerLoadingContainer}>
            <FiHeart size={60} color="#ff4d4d" style={{ opacity: 0.6 }} />
            <h3 style={styles.emptyTitle}>Your wishlist is empty.</h3>
            <p style={styles.emptySubtitle}>Explore movies and events and save them here.</p>
            <button style={styles.cta} onClick={() => navigate('/')}>Explore Catalog</button>
          </div>
        ) : (
          <div style={styles.wishlistGrid}>
            {wishlistMovies.map((movie) => {
              const isUpcoming = movie.type === 'movie' && !movie.trending;
              return (
                <div key={movie._id || movie.id} style={styles.wishlistCard}>
                  <div style={styles.wishlistPosterContainer}>
                    <img src={movie.posterUrl} alt={movie.title} style={styles.wishlistPoster} />
                    <button 
                      onClick={() => handleLike(movie._id || movie.id)}
                      style={styles.removeWishlistBtn}
                      title="Remove from wishlist"
                    >
                      <FiHeart size={16} fill="#ff4d4d" color="#ff4d4d" />
                    </button>
                  </div>
                  <div style={styles.wishlistInfoBox}>
                    <h4 style={styles.wishlistMovieTitle}>{movie.title}</h4>
                    <p style={styles.wishlistMovieMeta}>{movie.genre} • ⭐ {movie.rating}</p>
                    {isUpcoming ? (
                      <button 
                        style={{ ...styles.wishlistBtn, background: '#333', color: '#FFC300', border: '1px solid #FFC300', cursor: 'default' }}
                      >
                        COMING SOON
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/showtimes/${movie._id || movie.id}`)}
                        style={styles.wishlistBtn}
                      >
                        BOOK TICKET
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

const styles = {
  page: {
    background: '#0b0c10',
    minHeight: '100vh',
    padding: '100px 40px 60px',
    maxWidth: '960px',
    margin: '0 auto',
    fontFamily: 'Outfit, sans-serif'
  },
  profileHeaderBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '25px',
    borderRadius: '16px',
    marginBottom: '35px'
  },
  avatarCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#FFC300',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileDetailsCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  profileNameText: {
    color: '#fff',
    fontSize: '1.4rem',
    fontWeight: '800',
    margin: '0 0 4px'
  },
  profileEmailText: {
    color: '#888',
    fontSize: '0.9rem',
    margin: '0'
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '30px',
    paddingBottom: '2px'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '10px 20px',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  activeTabBtn: {
    color: '#FFC300'
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-3px',
    left: '0',
    width: '100%',
    height: '3px',
    background: '#FFC300',
    borderRadius: '2px'
  },
  innerLoadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  list: { display: 'flex', flexDirection: 'column', gap: '20px' },
  ticket: {
    background: '#16171b',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    border: '1px solid #222',
  },
  ticketBar: {
    height: '4px',
    background: 'linear-gradient(90deg, #FFC300, #FF8C00)',
  },
  ticketContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '25px 30px',
    gap: '20px',
  },
  ticketLeft: { flex: 1 },
  ticketRight: { textAlign: 'right', minWidth: '120px' },
  movieTitle: {
    color: '#fff',
    fontSize: '1.4rem',
    fontWeight: '800',
    margin: '0 0 12px',
  },
  ticketMeta: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' },
  metaItem: { color: '#888', fontSize: '0.85rem', display: 'flex', alignItems: 'center' },
  seats: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  seatChip: {
    background: '#222',
    color: '#FFC300',
    border: '1px solid #FFC300',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  totalLabel: { color: '#555', fontSize: '0.7rem', letterSpacing: '2px', margin: '0 0 5px' },
  totalAmount: { color: '#FFC300', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 10px' },
  confirmedBadge: {
    background: 'rgba(76, 175, 80, 0.15)',
    color: '#4CAF50',
    border: '1px solid #4CAF50',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  dashed: {
    borderTop: '1px dashed #333',
    marginLeft: '30px',
    marginRight: '30px',
  },
  ticketFooter: {
    padding: '12px 30px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  centeredPage: {
    background: '#0b0c10',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px',
  },
  emptyTitle: { color: '#fff', fontSize: '1.8rem', fontWeight: '700', margin: '20px 0 10px' },
  emptySubtitle: { color: '#888', marginBottom: '30px' },
  cta: {
    background: '#FFC300',
    color: '#000',
    fontWeight: '800',
    border: 'none',
    borderRadius: '30px',
    padding: '14px 35px',
    cursor: 'pointer',
    fontSize: '1rem',
    letterSpacing: '1px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 195, 0, 0.2)',
    borderTopColor: '#FFC300',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  /* Wishlist Grid and card styles */
  wishlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '30px',
    marginTop: '10px'
  },
  wishlistCard: {
    background: '#16171b',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #222',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, border-color 0.3s ease'
  },
  wishlistPosterContainer: {
    position: 'relative',
    height: '180px',
    width: '100%',
    overflow: 'hidden'
  },
  wishlistPoster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'brightness(0.85)'
  },
  removeWishlistBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0,0,0,0.6)',
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
  },
  wishlistInfoBox: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  },
  wishlistMovieTitle: {
    color: '#fff',
    fontSize: '1.15rem',
    fontWeight: '800',
    margin: '0 0 6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  wishlistMovieMeta: {
    color: '#888',
    fontSize: '0.82rem',
    margin: '0 0 20px'
  },
  wishlistBtn: {
    background: '#FFC300',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontWeight: '800',
    fontSize: '0.85rem',
    cursor: 'pointer',
    width: '100%',
    textTransform: 'uppercase',
    marginTop: 'auto',
    letterSpacing: '0.5px'
  }
};

export default Bookings;
