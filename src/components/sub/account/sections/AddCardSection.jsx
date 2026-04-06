import React, { useState } from 'react';
import '../../../../assets/styles/myaccount/AddCardSection.css';
import FooterVisa from '../../../../assets/images/Footer icons/11.webp';
import FooterMastercard from '../../../../assets/images/Footer icons/12.webp';
import FooterAmex from '../../../../assets/images/Footer icons/13.webp';
import FooterPaypal from '../../../../assets/images/Footer icons/14.png';
import FooterApplePay from '../../../../assets/images/Footer icons/15.png';
import FooterGooglePay from '../../../../assets/images/Footer icons/16.webp';
import CardSecurityInfo from './CardSecurityInfo';

const detectCardBrand = (number) => {
  if (/^4/.test(number)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'American Express';
  if (/^6(?:011|5)/.test(number)) return 'Discover';
  return 'Card';
};

const AddCardSection = ({ onSave, onClose }) => {
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Allow only digits for card number
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setCardNumber(value);
  };

  // Allow only digits and slash for expiry MM/YY, max length 5
  const handleExpiryChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  // Allow only digits for CVV, max length 4
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCvv(value);
  };

  // Optional: format expiry input to add slash automatically
  // You can add this if you want me to

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cardNumber.length < 12) {
      alert('Please enter a valid card number.');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      alert('Please enter expiry as MM/YY.');
      return;
    }

    if (cvv.length < 3) {
      alert('Please enter a valid CVV.');
      return;
    }

    const brand = detectCardBrand(cardNumber);
    const savedCard = {
      id: `${Date.now()}`,
      brand,
      cardholderName: cardholderName.trim() || 'Cardholder',
      last4: cardNumber.slice(-4),
      expiry,
    };

    onSave?.(savedCard);

    setCardholderName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    onClose?.();
  };

  return (
    <div className="add-card-container">
      <h2 className="card-title">Add a new card</h2>
      <div className="accepted-cards accepted-cards--top">
        <img src={FooterVisa} alt="Visa" />
        <img src={FooterMastercard} alt="Mastercard" />
        <img src={FooterAmex} alt="American Express" />
        <img src={FooterPaypal} alt="PayPal" />
        <img src={FooterApplePay} alt="Apple Pay" />
        <img src={FooterGooglePay} alt="Google Pay" />
      </div>

      <form className="card-form" onSubmit={handleSubmit} noValidate>
        <label className="form-label">Name on Card</label>
        <input
          className="form-input"
          type="text"
          placeholder="Cardholder name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          autoComplete="cc-name"
        />

        <label className="form-label">Card Number</label>
        <input
          className="form-input"
          type="text"
          placeholder="Card number"
          value={cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19}
          inputMode="numeric"
          autoComplete="cc-number"
        />

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Expiration Date</label>
            <input
              className="form-input"
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={handleExpiryChange}
              maxLength={5}
              inputMode="numeric"
              autoComplete="cc-exp"
            />
          </div>
          <div className="form-group">
            <label className="form-label">CVV</label>
            <input
              className="form-input"
              type="text"
              placeholder="3-4 digits"
              value={cvv}
              onChange={handleCvvChange}
              maxLength={4}
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>
        </div>

        <button type="submit" className="submit-card">Add your card</button>
      </form>
      <CardSecurityInfo />
    </div>
  );
};

export default AddCardSection;
