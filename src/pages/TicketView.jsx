import React from 'react';
import { useGlobalContext } from '../context/GlobalState';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiDownload } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import HeaderNav from '../components/HeaderNav';
import './TicketView.css';

const TicketView = () => {
  const { pendingBooking, selectedCity, currentUser } = useGlobalContext();
  const navigate = useNavigate();

  if (!pendingBooking) return null;

  // Generate a unique value for QR code
  const qrValue = pendingBooking.movieId ? `BOOKING-${pendingBooking.movieId}-${Date.now()}` : 'GRABASEAT-TICKET';

  return (
    <div className="ticket-page">
      {/* Universal BookMyShow Header Navigation */}
      <HeaderNav title={`Ticket • ${pendingBooking.movieTitle}`} />

      <div className="email-status-banner">
        <FiCheckCircle /> A detailed ticket has been sent to <strong>{currentUser?.email}</strong>
      </div>

      <div className="ticket-container" id="printable-ticket">
        <div className="ticket-card">
          <div className="ticket-left">
            <div className="ticket-brand" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.4rem' }}>
              <span style={{ color: '#FFFFFF' }}>GrabA</span>
              <span style={{ color: '#E50914', textShadow: '0 0 12px rgba(229, 9, 20, 0.45)' }}>Seat</span>
            </div>
            <h1 className="ticket-movie-title">{pendingBooking.movieTitle}</h1>
            <div className="ticket-details-grid">
              <div className="detail-item"><label>CITY</label><span>{selectedCity}</span></div>
              <div className="detail-item"><label>TIME</label><span>{pendingBooking.showTime}</span></div>
              <div className="detail-item"><label>SEATS</label><span>{pendingBooking.selectedSeats.join(', ')}</span></div>
              <div className="detail-item"><label>TOTAL PAID</label><span>₹{pendingBooking.totalPrice}</span></div>
            </div>
          </div>
          <div className="ticket-right">
            <div className="qr-box" style={{ background: '#1a1a1a', padding: '10px', borderRadius: '8px', border: '1px solid #FFC300' }}>
              <QRCodeSVG value={qrValue} size={100} bgColor={"#1a1a1a"} fgColor={"#FFC300"} />
            </div>
            <p>SCAN AT ENTRY</p>
          </div>
        </div>
      </div>

      <div className="ticket-actions">
        <button className="action-btn download" onClick={() => window.print()}>
          <FiDownload /> Download PDF
        </button>
        <button className="action-btn home" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default TicketView;