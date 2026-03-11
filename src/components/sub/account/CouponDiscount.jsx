
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import SignInModal from '../SignInModal';
import axios from 'axios';

export default function CouponDiscount({ onApplyCoupon }) {
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleApplyCoupon = async () => {
    setLoading(true);
    setMessage('');
    setDiscountData(null);
    setIsValid(false);
    try {
      const formData = new FormData();
      formData.append('coupon_code', couponCode.trim());
      const response = await axios.post(
        'https://db.store1920.com/wp-admin/admin-ajax.php?action=check_coupon',
        formData
      );
      if (response.data.success) {
        const data = response.data.data;
        if (typeof data === 'string' && data.toLowerCase().includes('usage limit')) {
          onApplyCoupon && onApplyCoupon(null);
          setLoading(false);
          setMessage('You have already used this coupon the maximum allowed times.');
          setIsValid(false);
          setDiscountData(null);
          return;
        }
        setDiscountData(data);
        setMessage('Coupon applied!');
        setIsValid(true);
        onApplyCoupon && onApplyCoupon(data);
      } else {
        // Check for usage limit error or other backend error
        let errorMsg = response.data.data || 'Invalid coupon code.';
        if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('usage limit')) {
          errorMsg = 'You have already used this coupon the maximum allowed times.';
        }
        setMessage(errorMsg);
        setIsValid(false);
        setDiscountData(null);
        onApplyCoupon && onApplyCoupon(null);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error checking coupon. Please try again.');
      setIsValid(false);
      onApplyCoupon && onApplyCoupon(null);
    }
    setLoading(false);
  };

  return (
    <div className="coupon-card">
      <div className="coupon-header">Have a Coupon?</div>
      {!user ? (
        <div className="coupon-signin-wrapper">
          {/* <div className="coupon-message error">Please sign in to use a coupon.</div> */}
          <button className="coupon-signin-btn-better" onClick={() => setShowSignInModal(true)}>
            <span className="signin-icon-better">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="11" fill="#ff9800"/>
                <path d="M7.5 10V8.5C7.5 6.57 9.07 5 11 5C12.93 5 14.5 6.57 14.5 8.5V10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="6.5" y="10" width="9" height="6" rx="2" fill="#fff"/>
                <circle cx="11" cy="13" r="1" fill="#ff9800"/>
              </svg>
            </span>
            <span className="signin-text-better">Sign In to Use Coupon</span>
          </button>
          {showSignInModal && (
            <div className="coupon-signin-modal-overlay">
              <div className="coupon-signin-modal">
                <SignInModal isOpen={true} onClose={() => setShowSignInModal(false)} onLoginSuccess={() => setShowSignInModal(false)} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
                <style jsx>{`
                  .coupon-signin-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                  }
                  .coupon-signin-btn-better {
                    margin-top: 12px;
                    width: 100%;
                    padding: 16px 0;
                    border-radius: 32px;
                    border: none;
                    font-weight: 800;
                    font-size: 18px;
                    color: #222;
                    background: linear-gradient(90deg, #ffe0b2 0%, #ff9800 100%);
                    box-shadow: 0 2px 12px rgba(255, 152, 0, 0.10);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    letter-spacing: 0.7px;
                    transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
                  }
                  .coupon-signin-btn-better:hover:not(:disabled) {
                    background: linear-gradient(90deg, #ffd54f 0%, #ff9800 100%);
                    box-shadow: 0 6px 24px rgba(255, 152, 0, 0.18);
                    transform: translateY(-2px) scale(1.03);
                  }
                  .signin-icon-better {
                    display: flex;
                    align-items: center;
                    margin-right: 6px;
                  }
                  .signin-text-better {
                    font-size: 18px;
                    font-weight: 800;
                    letter-spacing: 0.7px;
                  }
                  .coupon-signin-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0,0,0,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                  }
                  .coupon-signin-modal {
                    background: #fff;
                    border-radius: 18px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                    padding: 32px 24px 24px 24px;
                    min-width: 320px;
                    max-width: 95vw;
                  }
                `}</style>
          <div className="coupon-row">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
              disabled={loading}
              className={`coupon-input ${isValid ? 'valid' : ''}`}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={loading}
              className="coupon-button"
            >
              {loading ? 'Checking...' : 'Apply'}
            </button>
          </div>
          {message && (
            <div className={`coupon-message ${isValid ? 'success' : 'error'}`}>{message}</div>
          )}
          {discountData && isValid && (
            <div className="coupon-discount">
              {discountData.discount_type === 'percent'
                ? `${discountData.amount}% OFF`
                : `AED ${discountData.amount} OFF`}
            </div>
          )}
        </>
      )}
      <style jsx>{`
        .coupon-card {
          background: none;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
          border: none;
          font-family: 'Montserrat', sans-serif;
          max-width: 100%;
        }

        .coupon-header {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #333;
        }

        .coupon-row {
          display: flex;
          gap: 8px;
          align-items: center;
          padding-right: 6px; /* ✅ spacing from right border */
        }

        .coupon-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #ddd;
          font-size: 14px;
          background: #fdfdfd;
          transition: all 0.3s;
        }

        .coupon-input:focus {
          outline: none;
          border-color: #ff5722;
          box-shadow: 0 0 8px rgba(255, 87, 34, 0.3);
        }

        .coupon-input.valid {
          border-color: #4caf50;
          box-shadow: 0 0 6px rgba(76, 175, 80, 0.3);
        }

        .coupon-button {
          padding: 12px 18px;
          border-radius: 14px;
          border: none;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(90deg, #ff9800, #ff5722);
          transition: all 0.3s;
          white-space: nowrap;
        }

        .coupon-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 87, 34, 0.4);
        }

        .coupon-button:disabled {
          background: #ffb74d66;
          cursor: not-allowed;
        }

        .coupon-message {
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        .coupon-message.success {
          color: #155724;
          background: #d4edda;
          border: 1px solid #c3e6cb;
        }

        .coupon-message.error {
          color: #721c24;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }

        .coupon-discount {
          margin-top: 12px;
          padding: 12px;
          border-radius: 16px;
          text-align: center;
          font-weight: 700;
          font-size: 15px;
          color: #006064;
          background: linear-gradient(90deg, #b2ebf2, #e0f7fa);
          border: 1px solid #00acc1;
        }

        @media (max-width: 480px) {
          .coupon-row {
            flex-direction: row;
          }

          .coupon-input {
            width: 100%;
          }

          .coupon-card {
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
}
