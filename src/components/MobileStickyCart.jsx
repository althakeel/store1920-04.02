import React, { useState, useEffect } from 'react';
import ButtonSection from './products/ButtonSection';

export default function MobileStickyCart({
  quantity,
  setQuantity,
  maxQuantity,
  product,
  selectedVariation,
  showClearance,
  handleAddToCart
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  // Refined footer style
  const footerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
    padding: '0px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 99999, // increased z-index for safety
    boxShadow: '0 -3px 12px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease-in-out',
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    width: '100%',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const buttonWrapperStyle = {
    flexGrow: 1,
    width: '100%',
  };

  return (
    <div style={footerStyle}>
      <div style={contentStyle}>
        <div style={buttonWrapperStyle}>
          <ButtonSection
            product={product}
            selectedVariation={selectedVariation}
            quantity={quantity}
            isClearance={showClearance}
            handleAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
}
