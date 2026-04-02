import React, { useMemo, useState } from 'react';
import '../../../../assets/styles/myaccount/PaymentMethodsSection.css';
import CardSecurityInfo from './CardSecurityInfo';
import AddCardModal from './AddCardModal';
import Card from '../../../../assets/images/Purse (1).png';
import FooterVisa from '../../../../assets/images/Footer icons/11.webp';
import FooterMastercard from '../../../../assets/images/Footer icons/12.webp';
import FooterAmex from '../../../../assets/images/Footer icons/13.webp';
import FooterPaypal from '../../../../assets/images/Footer icons/14.png';
import FooterApplePay from '../../../../assets/images/Footer icons/15.png';
import FooterGooglePay from '../../../../assets/images/Footer icons/16.webp';
import FooterCash from '../../../../assets/images/Footer icons/17.webp';

const LOCAL_CARDS_KEY = 'store1920_saved_cards';

const getBrandLogo = (brand) => {
  switch (brand) {
    case 'Visa':
      return FooterVisa;
    case 'Mastercard':
      return FooterMastercard;
    case 'American Express':
      return FooterAmex;
    case 'PayPal':
      return FooterPaypal;
    case 'Apple Pay':
      return FooterApplePay;
    case 'Google Pay':
      return FooterGooglePay;
    default:
      return Card;
  }
};

const getInitialCards = () => {
  try {
    const stored = localStorage.getItem(LOCAL_CARDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read saved cards from localStorage', error);
    return [];
  }
};

const PaymentMethodsSection = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [savedCards, setSavedCards] = useState(getInitialCards);

  const acceptedCardIcons = useMemo(
    () => [
      { src: FooterVisa, alt: 'Visa' },
      { src: FooterMastercard, alt: 'Mastercard' },
      { src: FooterAmex, alt: 'American Express' },
      { src: FooterPaypal, alt: 'PayPal' },
      { src: FooterApplePay, alt: 'Apple Pay' },
      { src: FooterGooglePay, alt: 'Google Pay' },
      { src: FooterCash, alt: 'Cash on Delivery' },
    ],
    []
  );

  const persistCards = (cards) => {
    setSavedCards(cards);
    localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
  };

  const handleSaveCard = (cardData) => {
    persistCards([cardData, ...savedCards]);
  };

  const handleRemoveCard = (cardId) => {
    persistCards(savedCards.filter((card) => card.id !== cardId));
  };

  return (
    <div className="payment-wrapper">
      <h2 className="payment-heading">
        Your payment methods <span className="lock-icon">🔒</span>
        <span className="encrypted-text">All data is encrypted</span>
      </h2>

      <div className="payment-card-box">
        <div className="payment-graphic">
          <img src={Card} alt="Card Icon" className="card-icon" />
        </div>
        <div className="payment-description">
          <p className="payment-text">Save cards for a faster checkout</p>
          <div className="badges">
            <span className="badge green">✔ Secure payment</span>
            <span className="badge green">✔ Convenient payment</span>
          </div>
        </div>

        <button className="add-card-button" onClick={() => setModalOpen(true)}>
          + Add a credit or debit card
        </button>

        <div className="card-icons">
          {acceptedCardIcons.map((icon) => (
            <img key={icon.alt} src={icon.src} alt={icon.alt} />
          ))}
        </div>
      </div>

      {savedCards.length > 0 && (
        <div className="saved-cards-section">
          <h3 className="saved-cards-title">Saved cards</h3>
          <div className="saved-cards-grid">
            {savedCards.map((card) => (
              <article key={card.id} className="saved-card">
                <div className="saved-card-top">
                  <img
                    src={getBrandLogo(card.brand)}
                    alt={card.brand}
                    className="saved-card-brand"
                  />
                  <button
                    type="button"
                    className="saved-card-remove"
                    onClick={() => handleRemoveCard(card.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="saved-card-number">
                  •••• •••• •••• {card.last4}
                </div>
                <div className="saved-card-meta">
                  <span>{card.cardholderName}</span>
                  <span>Exp {card.expiry}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCard}
      />
      <CardSecurityInfo />
    </div>
  );
};

export default PaymentMethodsSection;
