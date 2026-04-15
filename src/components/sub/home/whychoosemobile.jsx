import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../assets/styles/WhyChoose.css';
import ReminderIcon from '../../../assets/images/insurance.png';

const WhyChoose = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <div className="whychoose-wrapper">
        <div className="whychoose-container">
          <div className="whychoose-bar" onClick={openModal}>
            <div className="whychoose-left">
              <img src="https://db.store1920.com/wp-content/uploads/2025/07/padlock.png" alt="Check" className="whychoose-icon" />
              <span className="whychoose-title">Why choose Store1920</span>
            </div>
            <div className="whychoose-right">
              <Link to="/privacy-policy">
                <img src="https://db.store1920.com/wp-content/uploads/2025/07/security-1.png" alt="Secure" className="whychoose-link-icon" />
                <span>Secure privacy</span>
              </Link>
              <span className="divider">|</span>
              <Link to="/purchaseprotection">
                <img src="https://db.store1920.com/wp-content/uploads/2025/07/credit-card.png" alt="Payment" className="whychoose-link-icon" />
                <span>Safe payments</span>
              </Link>
              <span className="divider">|</span>
              <Link to="/shippinginfo">
                <img src="https://db.store1920.com/wp-content/uploads/2025/07/van.png" alt="Delivery" className="whychoose-link-icon" />
                <span>Delivery guarantee&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </Link>
            </div>
          </div>

          <div className="whychoose-reminder">
            <img src="https://db.store1920.com/wp-content/uploads/2025/07/notification.png" alt="Alert" className="reminder-icon" />
            <p className="reminder-text">
              <strong>Why choose us:</strong> Enjoy secure checkout, dependable delivery, quality products, and responsive support every time you shop.
            </p>
            <button className="reminder-view" onClick={openModal}>View more</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="whychoose-modal-overlay">
          <div className="whychoose-modal">
            <button className="modal-close" onClick={closeModal}>x</button>
            <img
              src={ReminderIcon}
              alt="Why Choose Store1920"
              className="modal-image"
            />
            <h3>Why choose Store1920</h3>
            <p>
              We focus on making online shopping simple, safe, and reliable for every customer.
            </p>
            <ul className="whychoose-modal-list">
              <li><strong>Secure shopping:</strong> Protected checkout and privacy-first handling of your information.</li>
              <li><strong>Trusted delivery:</strong> Fast shipping updates and dependable order fulfillment.</li>
              <li><strong>Quality value:</strong> Carefully selected products at competitive prices.</li>
              <li><strong>Helpful support:</strong> A responsive team ready to assist before and after your order.</li>
            </ul>
            <p className="report-text">
              Shop confidently with a store built around convenience, trust, and customer care.
            </p>
            <button className="modal-ok" onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhyChoose;
