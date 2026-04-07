import React, { useEffect, useState } from 'react';

const details = {
  'Safe payments': {
    description:
      'Your checkout information is processed through secure payment flows designed to protect card and billing data.',
    badge: 'Secure Checkout',
  },
  'Free returns': {
    description:
      'Eligible items can be returned according to the return policy, with clear guidance available from support when needed.',
    badge: 'Return Support',
  },
  '24/7 support': {
    description:
      'Our support resources are available to help with orders, account questions, delivery issues, and policy guidance.',
    badge: 'Always Here',
  },
  'Secure checkout': {
    description:
      'We encourage customers to complete payment only through the official Store1920 checkout page and verified payment providers.',
    badge: 'Verified Only',
  },
  'Buyer protection': {
    description:
      'If something goes wrong with an eligible order, support and policy pages explain the next steps for resolution.',
    badge: 'Order Help',
  },
};

const WhyChooseBanner = () => {
  const rightTexts = Object.keys(details);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % rightTexts.length);
        setFade(true);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, [rightTexts.length]);

  const handleClick = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          backgroundColor: '#138000',
          borderRadius: '8px',
          margin: '10px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '14px',
          maxWidth: '100%',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
          <span
            style={{
              backgroundColor: 'white',
              color: '#138000',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px',
            }}
          >
            ✓
          </span>
          Why choose Store1920
        </div>

        <div
          style={{
            minWidth: '130px',
            textAlign: 'right',
            fontWeight: 400,
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.4s ease-in-out',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {rightTexts[index]}
            <span style={{ fontSize: '12px', marginLeft: '4px' }}>›</span>
          </span>
        </div>
      </div>

      {showPopup && (
        <div
          onClick={closePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            }}
          >
            <h3>{rightTexts[index]}</h3>
            <div
              style={{
                width: '100%',
                borderRadius: '8px',
                marginBottom: '10px',
                padding: '28px 16px',
                background: 'linear-gradient(135deg, #e9f7eb 0%, #f7fff8 100%)',
                color: '#138000',
                fontWeight: '700',
              }}
            >
              {details[rightTexts[index]].badge}
            </div>
            <p>{details[rightTexts[index]].description}</p>
            <button
              onClick={closePopup}
              style={{
                backgroundColor: '#138000',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                marginTop: '10px',
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhyChooseBanner;
