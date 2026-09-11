import React from 'react';
import { useGlobalContext } from '../context/GlobalState';
import { FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { filterMoviesByMood } from '../utils/moodMatcher';
import './Movies.css'; // Using your existing CSS file

const Movies = ({ title, id, filterType, filterKey }) => {
  const { moviesData, likedList, handleLike, isLoggedIn, triggerAuthFlow, selectedVibe, setToastMessage } = useGlobalContext();
  const navigate = useNavigate();

  let displayMovies = moviesData;
  if (filterType) displayMovies = displayMovies.filter(m => m.type === filterType);
  if (filterKey === 'mylist') displayMovies = displayMovies.filter(m => likedList.includes(String(m._id || m.id)));
  
  if (id === 'movies') {
    if (selectedVibe && selectedVibe !== 'All') {
      displayMovies = displayMovies.filter(m => m.type === 'movie');
    } else {
      displayMovies = displayMovies.filter(m => m.type === 'movie' && m.trending === true);
    }
  }

  if (selectedVibe && selectedVibe !== 'All') {
    displayMovies = filterMoviesByMood(displayMovies, selectedVibe);
  }

  const onHeartClick = (e, movieId) => {
    e.stopPropagation();
    handleLike(String(movieId));
  };

  return (
    <div className="movies-section" id={id}>
      <h2 className="section-title">{title}</h2>
      <div className="movies-grid">
        {displayMovies.map((movie) => {
          const isUpcoming = movie.type === 'movie' && !movie.trending;
          return (
            <div key={movie._id} className="movie-card">
              <div className="poster-container" onClick={() => {
                if (isUpcoming) {
                  setToastMessage("Interest registered! We'll notify you when tickets go live.");
                  return;
                }
                if (!isLoggedIn) { triggerAuthFlow(); }
                else { navigate(`/showtimes/${movie._id || movie.id}`); }
              }}>
                <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
                <button
                  className="like-btn-overlay"
                  onClick={(e) => onHeartClick(e, movie._id)}
                >
                  <FiHeart fill={likedList.includes(String(movie._id)) ? "#ff4d4d" : "none"}
                    color={likedList.includes(String(movie._id)) ? "#ff4d4d" : "#fff"} />
                </button>
              </div>

              <div className="movie-info-box">
                <h3 className="movie-title-text">{movie.title}</h3>
                <p className="movie-meta-text">{movie.genre} • ⭐{movie.rating}</p>

                {isUpcoming ? (
                  <button
                    className="book-ticket-btn"
                    style={{ background: '#333', color: '#FFC300', border: '1px solid #FFC300' }}
                    onClick={() => setToastMessage("Interest registered! We'll notify you when tickets go live.")}
                  >
                    ★ INTERESTED
                  </button>
                ) : (
                  <button
                    className="book-ticket-btn"
                    onClick={() => {
                      if (!isLoggedIn) { triggerAuthFlow(); }
                      else { navigate(`/showtimes/${movie._id || movie.id}`); }
                    }}
                  >
                    BOOK TICKET
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(Movies);