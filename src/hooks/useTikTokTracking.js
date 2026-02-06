import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useTikTokTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on every route change
    if (window.ttq) {
      window.ttq.track('PageView');
      console.log('TikTok pageview tracked:', location.pathname);
    }
  }, [location]);
};

// Function to track custom events
export const trackTikTokEvent = (eventName, data = {}) => {
  if (window.ttq) {
    window.ttq.track(eventName, data);
    console.log('TikTok event tracked:', eventName, data);
  }
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
