/**
 * GTM Tracking Helper - Global Tracking Implementation
 * Tracks all events, page views, and ecommerce actions
 */

// Initialize dataLayer if not already present
export const initializeDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
};

// Track Page View
export const trackPageView = (pageName, pageLocation = null) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'page_view',
    page_title: pageName,
    page_location: pageLocation || window.location.href,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
  console.log('📊 GTM Page View Tracked:', pageName);
};

// Track Product View
export const trackProductView = (product) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'view_item',
    ecommerce: {
      items: [{
        item_id: product.id || product.sku,
        item_name: product.name || product.title,
        price: parseFloat(product.price || 0),
        currency: 'AED',
        item_category: product.category || 'Uncategorized',
        item_variant: product.variant || '',
        quantity: 1,
      }],
    },
    timestamp: new Date().toISOString(),
  });
  console.log('📸 GTM Product View Tracked:', product.name);
};

// Track Add to Cart
export const trackAddToCart = (product, quantity = 1) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
      items: [{
        item_id: product.id || product.sku,
        item_name: product.name || product.title,
        price: parseFloat(product.price || 0),
        currency: 'AED',
        item_category: product.category || 'Uncategorized',
        quantity: parseInt(quantity),
      }],
    },
    timestamp: new Date().toISOString(),
  });
  console.log('🛒 GTM Add to Cart Tracked:', product.name, 'Qty:', quantity);
};

// Track Remove from Cart
export const trackRemoveFromCart = (product, quantity = 1) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'remove_from_cart',
    ecommerce: {
      items: [{
        item_id: product.id || product.sku,
        item_name: product.name || product.title,
        price: parseFloat(product.price || 0),
        currency: 'AED',
        quantity: parseInt(quantity),
      }],
    },
    timestamp: new Date().toISOString(),
  });
  console.log('❌ GTM Remove from Cart Tracked:', product.name);
};

// Track View Cart
export const trackViewCart = (items, cartTotal) => {
  initializeDataLayer();
  const formattedItems = items.map(item => ({
    item_id: item.id || item.sku,
    item_name: item.name || item.title,
    price: parseFloat(item.price || 0),
    currency: 'AED',
    quantity: parseInt(item.quantity || 1),
    item_category: item.category || 'Uncategorized',
  }));

  window.dataLayer.push({
    event: 'view_cart',
    ecommerce: {
      items: formattedItems,
      value: parseFloat(cartTotal || 0),
      currency: 'AED',
    },
    timestamp: new Date().toISOString(),
  });
  console.log('🛒 GTM View Cart Tracked - Items:', items.length, 'Total:', cartTotal);
};

// Track Begin Checkout
export const trackBeginCheckout = (items, total) => {
  initializeDataLayer();
  const formattedItems = items.map(item => ({
    item_id: item.id || item.sku,
    item_name: item.name || item.title,
    price: parseFloat(item.price || 0),
    currency: 'AED',
    quantity: parseInt(item.quantity || 1),
    item_category: item.category || 'Uncategorized',
  }));

  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      items: formattedItems,
      value: parseFloat(total || 0),
      currency: 'AED',
    },
    timestamp: new Date().toISOString(),
  });
  console.log('💳 GTM Begin Checkout Tracked');
};

// Track Purchase (Most Important)
export const trackPurchase = (order) => {
  initializeDataLayer();
  const formattedItems = (order.items || []).map(item => ({
    item_id: item.id || item.product_id || item.sku,
    item_name: item.name || item.product_name || item.title,
    price: parseFloat(item.price || item.product_price || 0),
    currency: 'AED',
    quantity: parseInt(item.quantity || 1),
    item_category: item.category || 'Uncategorized',
  }));

  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: order.id || order.order_id,
      affiliation: 'Store1920',
      value: parseFloat(order.total || order.total_price || 0),
      tax: parseFloat(order.tax || 0),
      shipping: parseFloat(order.shipping || 0),
      currency: 'AED',
      coupon: order.coupon_code || '',
      items: formattedItems,
    },
    timestamp: new Date().toISOString(),
  });
  console.log('✅ GTM Purchase Tracked - Order:', order.id, 'Total:', order.total);
};

// Track Search
export const trackSearch = (searchQuery, resultCount = 0) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'search',
    search_term: searchQuery,
    result_count: resultCount,
    timestamp: new Date().toISOString(),
  });
  console.log('🔍 GTM Search Tracked:', searchQuery);
};

// Track Login
export const trackLogin = (userId = null) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'login',
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
  console.log('👤 GTM Login Tracked');
};

// Track Sign Up
export const trackSignUp = (signUpMethod = 'email', userId = null) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'sign_up',
    method: signUpMethod,
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
  console.log('✍️ GTM Sign Up Tracked:', signUpMethod);
};

// Track Custom Event
export const trackCustomEvent = (eventName, eventData = {}) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: eventName,
    ...eventData,
    timestamp: new Date().toISOString(),
  });
  console.log('📌 GTM Custom Event Tracked:', eventName, eventData);
};

// Track Product Click
export const trackProductClick = (product, listName = 'Product List') => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'view_item_list',
    ecommerce: {
      items: [{
        item_id: product.id || product.sku,
        item_name: product.name || product.title,
        price: parseFloat(product.price || 0),
        currency: 'AED',
        item_category: product.category || 'Uncategorized',
        item_list_name: listName,
        item_list_id: listName.toLowerCase().replace(/\s/g, '_'),
      }],
    },
    timestamp: new Date().toISOString(),
  });
  console.log('🔗 GTM Product Click Tracked:', product.name);
};

// Track Category Browse
export const trackCategoryBrowse = (categoryName, itemCount = 0) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'view_item_list',
    item_list_name: categoryName,
    item_list_id: categoryName.toLowerCase().replace(/\s/g, '_'),
    item_count: itemCount,
    timestamp: new Date().toISOString(),
  });
  console.log('📂 GTM Category Browse Tracked:', categoryName);
};

// Track Wishlist Add
export const trackAddToWishlist = (product) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'add_to_wishlist',
    ecommerce: {
      items: [{
        item_id: product.id || product.sku,
        item_name: product.name || product.title,
        price: parseFloat(product.price || 0),
        currency: 'AED',
        item_category: product.category || 'Uncategorized',
      }],
    },
    timestamp: new Date().toISOString(),
  });
  console.log('❤️ GTM Add to Wishlist Tracked:', product.name);
};

// Track Promo View
export const trackPromoView = (promoName, promoId) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'view_promotion',
    promotions: [{
      promotion_id: promoId,
      promotion_name: promoName,
    }],
    timestamp: new Date().toISOString(),
  });
  console.log('🎉 GTM Promo View Tracked:', promoName);
};

// Track Promo Click
export const trackPromoClick = (promoName, promoId) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'select_promotion',
    promotions: [{
      promotion_id: promoId,
      promotion_name: promoName,
    }],
    timestamp: new Date().toISOString(),
  });
  console.log('🎯 GTM Promo Click Tracked:', promoName);
};

// Track Error
export const trackError = (errorType, errorMessage) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'exception',
    error_type: errorType,
    error_message: errorMessage,
    timestamp: new Date().toISOString(),
  });
  console.error('⚠️ GTM Error Tracked:', errorType, errorMessage);
};

// Set User Properties
export const setUserProperties = (userId, userEmail, userPhone = null) => {
  initializeDataLayer();
  window.dataLayer.push({
    user_id: userId,
    user_email: userEmail,
    user_phone: userPhone,
    timestamp: new Date().toISOString(),
  });
  console.log('👥 GTM User Properties Set');
};

// Track Refund
export const trackRefund = (orderId, refundValue, items = []) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'refund',
    ecommerce: {
      transaction_id: orderId,
      value: parseFloat(refundValue || 0),
      currency: 'AED',
      items: items.map(item => ({
        item_id: item.id || item.sku,
        item_name: item.name || item.title,
      })),
    },
    timestamp: new Date().toISOString(),
  });
  console.log('💸 GTM Refund Tracked - Order:', orderId);
};

// Track Page Scroll
export const trackPageScroll = (percentageScrolled) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'page_scroll',
    percentage_scrolled: percentageScrolled,
    timestamp: new Date().toISOString(),
  });
};

// Track Time on Page
export const trackTimeOnPage = (pageName, timeInSeconds) => {
  initializeDataLayer();
  window.dataLayer.push({
    event: 'time_on_page',
    page_title: pageName,
    time_seconds: timeInSeconds,
    timestamp: new Date().toISOString(),
  });
  console.log('⏱️ GTM Time on Page Tracked:', pageName, timeInSeconds + 's');
};

export default {
  initializeDataLayer,
  trackPageView,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackLogin,
  trackSignUp,
  trackCustomEvent,
  trackProductClick,
  trackCategoryBrowse,
  trackAddToWishlist,
  trackPromoView,
  trackPromoClick,
  trackError,
  setUserProperties,
  trackRefund,
  trackPageScroll,
  trackTimeOnPage,
};
