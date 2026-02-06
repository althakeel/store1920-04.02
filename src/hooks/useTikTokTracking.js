import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useTikTokTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Wait for TikTok SDK to be ready before tracking
    const trackPageView = () => {
      if (window.ttq) {
        window.ttq.track('PageView');
        console.log('✅ TikTok pageview tracked:', location.pathname);
      } else {
        // Retry if ttq not ready yet (max 3 retries with 300ms delay)
        const retryCount = window.__ttqRetryCount || 0;
        if (retryCount < 3) {
          window.__ttqRetryCount = retryCount + 1;
          setTimeout(trackPageView, 300);
        }
      }
    };

    trackPageView();
  }, [location]);
};

// Function to track custom events with retry logic
export const trackTikTokEvent = (eventName, data = {}) => {
  const attemptTrack = (retries = 0) => {
    if (window.ttq) {
      window.ttq.track(eventName, data);
      console.log('✅ TikTok event tracked:', eventName, data);
      return true;
    }
    
    if (retries < 5) {
      setTimeout(() => attemptTrack(retries + 1), 200);
      return false;
    }
    
    console.warn('⚠️ TikTok SDK not available after retries for event:', eventName);
    return false;
  };

  attemptTrack();
};

// Common e-commerce events
export const trackAddToCart = (productId, price, quantity = 1) => {
  trackTikTokEvent('AddToCart', {
    content_id: productId,
    content_name: productId,
    currency: 'AED',
    value: price,
    quantity: quantity,
  });
};

export const trackViewContent = (productId, productName, price) => {
  trackTikTokEvent('ViewContent', {
    content_id: productId,
    content_name: productName,
    currency: 'AED',
    value: price,
  });
};

export const trackCheckout = (cartValue, itemCount) => {
  trackTikTokEvent('InitiateCheckout', {
    currency: 'AED',
    value: cartValue,
    content_type: 'product',
    num_items: itemCount,
  });
};

export const trackPurchase = (orderId, cartValue, itemCount) => {
  trackTikTokEvent('Purchase', {
    currency: 'AED',
    value: cartValue,
    transaction_id: orderId,
    num_items: itemCount,
  });
};
