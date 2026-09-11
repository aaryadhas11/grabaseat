import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalState';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import './PaymentModal.css';

const PaymentModal = () => {
  const {
    showPaymentModal,
    setShowPaymentModal,
    setIsPaid,
    pendingBooking,
  } = useGlobalContext();

  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  if (!showPaymentModal) return null;

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentFailed(false);

    try {
      const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://grabaseat-api.onrender.com').replace(/\/$/, '');

      // Strip any currency symbols, keep numeric value
      const rawPrice = pendingBooking?.totalPrice || '0';
      const cleanPrice = Number(String(rawPrice).replace(/[^0-9.]/g, ''));

      // Backend multiplies by 100 (paise), so send the rupee amount as-is
      const orderRes = await fetch(`${API_BASE_URL}/api/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cleanPrice })
      });

      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || 'Order creation failed');

      const options = {
        key: 'rzp_test_TUWgMlcoRUhOdO',
        // amount & currency come from the order object (already in paise from server)
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'GrabASeat',
        description: pendingBooking?.movieTitle || 'Movie Ticket',
        theme: { color: '#FFC300' },

        handler: async function (razorpayResponse) {
          // ── Save booking to DB ──
          try {
            const bookRes = await fetch(`${API_BASE_URL}/api/book`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...pendingBooking,
                paymentId: razorpayResponse.razorpay_payment_id
              })
            });

            // CRITICAL FIX: always kill the spinner regardless of outcome
            setIsProcessing(false);

            if (bookRes.ok) {
              setPaymentSuccess(true);
              setIsPaid(true);
            } else {
              // Payment went through but booking save failed — still show success
              // so user isn't double-charged; log for manual recovery
              console.error('Booking save failed after successful payment');
              setPaymentSuccess(true);
              setIsPaid(true);
            }
          } catch (saveErr) {
            console.error('Booking save error:', saveErr);
            setIsProcessing(false); // kill spinner even on network error
            setPaymentSuccess(true); // payment was taken — show success
            setIsPaid(true);
          }
        },

        modal: {
          ondismiss: () => {
            // User closed Razorpay modal without paying
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Payment initiation error:', err);
      setPaymentFailed(true);
      setIsProcessing(false); // CRITICAL: stop spinner on any thrown error
    }
  };

  const handleClose = () => {
    setShowPaymentModal(false);
  };

  return (
    <div className="payment-overlay" onClick={handleClose}>
      <div className="payment-modal glass" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        {!paymentSuccess && !isProcessing && (
          <button className="premium-close-btn" onClick={handleClose} aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
            <FiX size={18} />
          </button>
        )}
        <div className="payment-content">

          {/* Error banner */}
          {paymentFailed && (
            <div
              className="error-banner"
              style={{
                background: '#ff4d4d',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              Payment Failed. Please check your Razorpay keys or server console.
            </div>
          )}

          {/* Processing spinner */}
          {isProcessing && (
            <div className="payment-state-container">
              <div className="loading-spinner" />
              <h2>Processing...</h2>
            </div>
          )}

          {/* Success state */}
          {paymentSuccess && (
            <div className="payment-state-container success-state">
              <FiCheckCircle className="success-icon" />
              <h2>Payment Successful!</h2>
              <button
                className="download-ticket-btn"
                onClick={() => { setShowPaymentModal(false); navigate('/bookings'); }}
              >
                View My Bookings
              </button>
            </div>
          )}

          {/* Default checkout prompt */}
          {!isProcessing && !paymentSuccess && (
            <div className="payment-input-container">
              <h2 className="payment-title">Secure Checkout</h2>
              <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '10px' }}>
                {pendingBooking?.movieTitle} &mdash; {pendingBooking?.selectedSeats?.length || 0} seat(s)
              </p>
              <p style={{ color: '#FFC300', fontWeight: 'bold', textAlign: 'center', fontSize: '1.3rem', marginBottom: '20px' }}>
                ₹{pendingBooking?.totalPrice}
              </p>
              <button
                onClick={handleRazorpayPayment}
                className="payment-submit-btn"
                style={{ marginTop: '10px' }}
              >
                PROCEED TO PAY
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;