import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalState';
import { FiX, FiPlus, FiEdit, FiTrash, FiFilm, FiChevronLeft } from 'react-icons/fi';

const Admin = () => {
  const { moviesData, isLoggedIn, currentUser, setToastMessage } = useGlobalContext();
  const navigate = useNavigate();
  
  // Movie List State
  const [moviesList, setMoviesList] = useState([]);
  
  // Modal & Form States
  const [showModal, setShowModal] = useState(false); // Add/Edit Modal
  const [editMode, setEditMode] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  
  const initialFormState = {
    title: '',
    genre: '',
    rating: '8.5/10',
    price: '₹250',
    posterUrl: '',
    certification: 'UA',
    type: 'movie',
    trending: true, // true = Now Showing, false = Upcoming
    vibe: 'Cinematic',
    showTimeInput: '10:30 AM, 02:15 PM, 06:00 PM',
    theatersInput: 'PVR Cinemas, INOX Cineplex, Cinepolis',
    classicPrice: 150,
    primePrice: 250,
    reclinerPrice: 450,
    blockedSeatsInput: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [msg, setMsg] = useState('');

  // Sync state with global movies data
  useEffect(() => {
    if (moviesData) {
      setMoviesList(moviesData);
    }
  }, [moviesData]);

  // Escape key close listener for Admin Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setEditMode(false);
    setSelectedMovieId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (movie) => {
    setFormData({
      title: movie.title || '',
      genre: movie.genre || '',
      rating: movie.rating || '8.5/10',
      price: movie.price || '₹250',
      posterUrl: movie.posterUrl || '',
      certification: movie.certification || 'UA',
      type: movie.type || 'movie',
      trending: movie.trending !== undefined ? movie.trending : true,
      vibe: movie.vibe || 'Cinematic',
      showTimeInput: Array.isArray(movie.showTime) ? movie.showTime.join(', ') : '10:30 AM, 02:15 PM, 06:00 PM',
      theatersInput: Array.isArray(movie.theaters) ? movie.theaters.join(', ') : 'PVR Cinemas, INOX Cineplex, Cinepolis',
      classicPrice: movie.pricing?.classic || 150,
      primePrice: movie.pricing?.prime || 250,
      reclinerPrice: movie.pricing?.recliner || 450,
      blockedSeatsInput: Array.isArray(movie.blockedSeats) ? movie.blockedSeats.join(', ') : ''
    });
    setEditMode(true);
    setSelectedMovieId(movie._id || movie.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    // Format comma-separated lists into arrays
    const showTimeArray = formData.showTimeInput.split(',').map(s => s.trim()).filter(Boolean);
    const theatersArray = formData.theatersInput.split(',').map(t => t.trim()).filter(Boolean);
    const blockedSeatsArray = formData.blockedSeatsInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    const payload = {
      title: formData.title,
      genre: formData.genre,
      rating: formData.rating,
      price: formData.price,
      posterUrl: formData.posterUrl,
      certification: formData.certification,
      type: formData.type,
      trending: formData.trending,
      vibe: formData.vibe,
      showTime: showTimeArray,
      theaters: theatersArray,
      pricing: {
        classic: Number(formData.classicPrice) || 150,
        prime: Number(formData.primePrice) || 250,
        recliner: Number(formData.reclinerPrice) || 450
      },
      blockedSeats: blockedSeatsArray
    };

    try {
      const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://grabaseat-api.onrender.com').replace(/\/$/, '');
      let res;
      if (editMode) {
        // PUT edit
        res = await fetch(`${API_BASE_URL}/api/movies/${selectedMovieId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // POST create
        res = await fetch(`${API_BASE_URL}/api/movies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setToastMessage(editMode ? 'Show details & hall pricing updated successfully!' : 'New show dynamically added to catalog!');
        handleCloseModal();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const errorData = await res.json();
        setMsg(errorData.error || 'Server validation failed');
      }
    } catch (err) {
      setMsg('Server error connecting to DB');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this movie/show from the database completely?")) {
      try {
        const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://grabaseat-api.onrender.com').replace(/\/$/, '');
        const res = await fetch(`${API_BASE_URL}/api/movies/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setToastMessage('Show removed from catalog.');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setToastMessage('Failed to remove show.');
        }
      } catch (err) {
        setToastMessage('Server error deleting show.');
      }
    }
  };

  // Re-confirm admin credentials
  const emailLower = currentUser?.email?.toLowerCase();
  const isAdmin = isLoggedIn && (currentUser?.isAdmin || emailLower === "adminlogin11@gmail.com" || emailLower === "aaryanitindhas@gmail.com");

  if (!isAdmin) {
    return (
      <div style={{ backgroundColor: '#0b0c10', color: '#ff4d4d', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
        <h1 style={{ color: '#FFC300', fontSize: '2.5rem', fontWeight: 900 }}>ACCESS DENIED</h1>
        <p style={{ color: '#fff', marginTop: '10px' }}>This page is restricted to GrabASeat administrators only.</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ marginTop: '20px', padding: '12px 24px', background: '#FFC300', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={localStyles.pageWrapper}>
      {/* Sleek Top Navigation Back Button */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '700',
            fontSize: '0.9rem'
          }}
        >
          <FiChevronLeft size={18} /> Back
        </button>
      </div>

      {/* Header Panel */}
      <div style={localStyles.headerPanel}>
        <div>
          <h1 style={localStyles.mainTitle}>Admin Management Dashboard</h1>
          <p style={localStyles.subtitleText}>Manage hall pricing tiers, seat blocks, theater schedules, and listings</p>
        </div>
        <button onClick={handleOpenAdd} style={localStyles.addButton}>
          <FiPlus size={16} style={{ marginRight: 8 }} /> ADD NEW SHOW
        </button>
      </div>

      {/* Shows Listing Grid */}
      <div style={localStyles.catalogGrid}>
        {moviesList.map(movie => (
          <div key={movie._id || movie.id} style={localStyles.showCard}>
            <img src={movie.posterUrl} alt={movie.title} style={localStyles.posterImage} />
            <div style={localStyles.showCardContent}>
              <h3 style={localStyles.movieTitleText}>{movie.title}</h3>
              <p style={localStyles.metaText}>{movie.genre} • ⭐ {movie.rating}</p>
              
              <div style={localStyles.badgesRow}>
                <span style={movie.trending ? localStyles.nowShowingBadge : localStyles.upcomingBadge}>
                  {movie.trending ? "Now Showing" : "Upcoming"}
                </span>
                <span style={localStyles.typeBadge}>
                  {movie.type.toUpperCase()}
                </span>
              </div>

              <div style={localStyles.showtimeDetailsBlock}>
                <p><strong>Showtimes:</strong> {Array.isArray(movie.showTime) ? movie.showTime.join(', ') : 'None'}</p>
                <p><strong>Theaters:</strong> {Array.isArray(movie.theaters) ? movie.theaters.join(', ') : 'None'}</p>
                <p><strong>Tier Prices:</strong> Classic ₹{movie.pricing?.classic || 150} | Prime ₹{movie.pricing?.prime || 250} | Recliner ₹{movie.pricing?.recliner || 450}</p>
                {movie.blockedSeats && movie.blockedSeats.length > 0 && (
                  <p><strong>Blocked Seats:</strong> {movie.blockedSeats.join(', ')}</p>
                )}
              </div>

              <div style={localStyles.actionsRow}>
                <button onClick={() => handleOpenEdit(movie)} style={localStyles.editButton}>
                  <FiEdit size={12} style={{ marginRight: 6 }} /> EDIT
                </button>
                <button onClick={() => handleDelete(movie._id || movie.id)} style={localStyles.deleteButton}>
                  <FiTrash size={12} style={{ marginRight: 6 }} /> REMOVE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Add/Edit Modal */}
      {showModal && (
        <div style={localStyles.modalOverlay} onClick={handleCloseModal}>
          <div style={localStyles.modalContentCard} onClick={e => e.stopPropagation()}>
            <button style={localStyles.modalCloseBtn} onClick={handleCloseModal} aria-label="Close">
              <FiX size={18} />
            </button>

            <h2 style={localStyles.modalTitleText}>
              {editMode ? "Edit Show Listing & Hall Controls" : "Add New Movie/Show"}
            </h2>
            <p style={localStyles.modalSubtitleText}>Configure scheduling details, pricing tiers, and display states.</p>

            {msg && (
              <div style={localStyles.modalErrorBanner}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={localStyles.adminForm}>
              <div style={localStyles.formTwoCol}>
                <div style={localStyles.inputBlock}>
                  <label style={localStyles.formLabel}>TITLE</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} required placeholder="Kalki 2898 AD" style={localStyles.adminInput} />
                </div>
                <div style={localStyles.inputBlock}>
                  <label style={localStyles.formLabel}>GENRE</label>
                  <input name="genre" value={formData.genre} onChange={handleInputChange} required placeholder="Sci-Fi / Action" style={localStyles.adminInput} />
                </div>
              </div>

              <div style={localStyles.formTwoCol}>
                <div style={localStyles.inputBlock}>
                  <label style={localStyles.formLabel}>BASE DISPLAY PRICE</label>
                  <input name="price" value={formData.price} onChange={handleInputChange} required placeholder="₹250" style={localStyles.adminInput} />
                </div>
                <div style={localStyles.inputBlock}>
                  <label style={localStyles.formLabel}>POSTER URL</label>
                  <input name="posterUrl" value={formData.posterUrl} onChange={handleInputChange} required placeholder="https://..." style={localStyles.adminInput} />
                </div>
              </div>

              {/* Dynamic Tier Pricing Section */}
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid rgba(255,195,0,0.15)' }}>
                <label style={{ ...localStyles.formLabel, color: '#FFC300', marginBottom: '8px', display: 'block' }}>DYNAMIC SEAT TIER PRICING (₹)</label>
                <div style={localStyles.formTwoCol}>
                  <div style={localStyles.inputBlock}>
                    <label style={localStyles.formLabel}>CLASSIC (A-B)</label>
                    <input name="classicPrice" type="number" value={formData.classicPrice} onChange={handleInputChange} required style={localStyles.adminInput} />
                  </div>
                  <div style={localStyles.inputBlock}>
                    <label style={localStyles.formLabel}>PRIME (C-D)</label>
                    <input name="primePrice" type="number" value={formData.primePrice} onChange={handleInputChange} required style={localStyles.adminInput} />
                  </div>
                  <div style={localStyles.inputBlock}>
                    <label style={localStyles.formLabel}>RECLINER (E-F)</label>
                    <input name="reclinerPrice" type="number" value={formData.reclinerPrice} onChange={handleInputChange} required style={localStyles.adminInput} />
                  </div>
                </div>
              </div>

              {/* Seat Blocking Section */}
              <div style={localStyles.inputBlock}>
                <label style={{ ...localStyles.formLabel, color: '#ff4d4d' }}>ADMIN BLOCKED SEATS (COMMA SEPARATED)</label>
                <input name="blockedSeatsInput" value={formData.blockedSeatsInput} onChange={handleInputChange} placeholder="e.g. A1, F10, C5" style={localStyles.adminInput} />
              </div>

              <div style={localStyles.formTwoCol}>
                <div style={localStyles.inputBlock}>
                  <label style={localStyles.formLabel}>RATING</label>
                  <input name="rating" value={formData.rating} onChange={handleInputChange} required placeholder="8.5/10" style={localStyles.adminInput} />
                </div>
                <div style={localStyles.inputBlock}>
                  <label style={localStyles.formLabel}>CERTIFICATION</label>
                  <input name="certification" value={formData.certification} onChange={handleInputChange} required placeholder="UA" style={localStyles.adminInput} />
                </div>
              </div>

              <div style={localStyles.formTwoCol}>
                <div style={localStyles.inputBlock}>
                  <label style={localStyles.formLabel}>TYPE</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} style={localStyles.adminSelect}>
                    <option value="movie">Movie</option>
                    <option value="standup">Standup Comedy</option>
                    <option value="live-show">Live Show</option>
                    <option value="tv-show">TV Show</option>
                  </select>
                </div>
                <div style={localStyles.inputBlock}>
                  <label style={localStyles.formLabel}>VIBE</label>
                  <input name="vibe" value={formData.vibe} onChange={handleInputChange} placeholder="Vibrant / Intense / Chill" style={localStyles.adminInput} />
                </div>
              </div>

              <div style={localStyles.inputBlock}>
                <label style={localStyles.formLabel}>SHOWTIMES (COMMA SEPARATED)</label>
                <input name="showTimeInput" value={formData.showTimeInput} onChange={handleInputChange} required placeholder="10:30 AM, 02:15 PM, 06:00 PM" style={localStyles.adminInput} />
              </div>

              <div style={localStyles.inputBlock}>
                <label style={localStyles.formLabel}>THEATERS / VENUES (COMMA SEPARATED)</label>
                <input name="theatersInput" value={formData.theatersInput} onChange={handleInputChange} required placeholder="PVR Cinemas, INOX Cineplex, Cinepolis" style={localStyles.adminInput} />
              </div>

              <div style={localStyles.checkboxRow}>
                <input type="checkbox" id="trending" name="trending" checked={formData.trending} onChange={handleInputChange} style={localStyles.adminCheckbox} />
                <label htmlFor="trending" style={localStyles.checkboxLabel}>
                  <strong>Now Showing / Active Booking:</strong> Check this to display in standard active showtimes. Uncheck to treat as Coming Soon (Disables seat selection and switches booking buttons to Interested).
                </label>
              </div>

              <button type="submit" style={localStyles.submitBtn}>
                {editMode ? "SAVE UPDATES" : "DYNAMICALLY ADD SHOW"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const localStyles = {
  pageWrapper: {
    background: '#0b0c10',
    minHeight: '100vh',
    padding: '100px 40px 60px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Outfit, sans-serif'
  },
  headerPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '20px'
  },
  mainTitle: {
    color: '#FFC300',
    fontSize: '2.2rem',
    fontWeight: '900',
    margin: '0 0 6px',
    letterSpacing: '0.5px'
  },
  subtitleText: {
    color: '#888',
    fontSize: '0.95rem',
    margin: 0
  },
  addButton: {
    background: '#FFC300',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(255, 195, 0, 0.25)',
    transition: 'transform 0.2s'
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px'
  },
  showCard: {
    background: '#16171b',
    border: '1px solid #222',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    gap: '15px',
    padding: '15px'
  },
  posterImage: {
    width: '100px',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  showCardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  movieTitleText: {
    color: '#fff',
    fontSize: '1.15rem',
    fontWeight: '800',
    margin: '0 0 4px'
  },
  metaText: {
    color: '#888',
    fontSize: '0.8rem',
    margin: '0 0 10px'
  },
  badgesRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px'
  },
  nowShowingBadge: {
    background: 'rgba(76, 175, 80, 0.15)',
    color: '#4CAF50',
    border: '1px solid #4CAF50',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '0.68rem',
    fontWeight: '800'
  },
  upcomingBadge: {
    background: 'rgba(255, 140, 0, 0.15)',
    color: '#FF8C00',
    border: '1px solid #FF8C00',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '0.68rem',
    fontWeight: '800'
  },
  typeBadge: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ccc',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '0.68rem',
    fontWeight: '800'
  },
  showtimeDetailsBlock: {
    fontSize: '0.78rem',
    color: '#bbb',
    background: 'rgba(0,0,0,0.2)',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  actionsRow: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto'
  },
  editButton: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '8px',
    padding: '8px 0',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButton: {
    flex: 1,
    background: 'rgba(255, 77, 77, 0.1)',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    color: '#ff4d4d',
    borderRadius: '8px',
    padding: '8px 0',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  /* Modal Stylings */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(8, 8, 12, 0.8)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11000
  },
  modalContentCard: {
    background: 'rgba(22, 23, 27, 0.98)',
    border: '1px solid rgba(255, 195, 0, 0.2)',
    width: '90%',
    maxWidth: '560px',
    padding: '35px',
    borderRadius: '24px',
    position: 'relative',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#c5c6c7',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modalTitleText: {
    color: '#FFC300',
    fontSize: '1.5rem',
    fontWeight: '900',
    margin: '0 0 6px'
  },
  modalSubtitleText: {
    color: '#888',
    fontSize: '0.85rem',
    margin: '0 0 25px'
  },
  modalErrorBanner: {
    background: 'rgba(255, 77, 77, 0.1)',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#ff4d4d',
    fontSize: '0.82rem',
    fontWeight: '700'
  },
  adminForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formTwoCol: {
    display: 'flex',
    gap: '15px'
  },
  inputBlock: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formLabel: {
    color: '#888',
    fontSize: '0.7rem',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  adminInput: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none'
  },
  adminSelect: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none'
  },
  checkboxRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    marginTop: '5px'
  },
  adminCheckbox: {
    marginTop: '4px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    color: '#bbb',
    fontSize: '0.8rem',
    lineHeight: '1.4'
  },
  submitBtn: {
    background: '#FFC300',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontWeight: '800',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'opacity 0.2s'
  }
};

export default Admin;