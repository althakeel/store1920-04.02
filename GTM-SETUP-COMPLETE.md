# GTM (Google Tag Manager) Complete Setup Guide

## Overview
Your Store1920 website is now fully integrated with **Google Tag Manager (GTM)** using Container ID: **GTM-WXMVTMP6**

All tracking is working on:
- ✅ Page views (every route)
- ✅ Product views
- ✅ Add to cart
- ✅ Remove from cart
- ✅ View cart
- ✅ Purchases (ecommerce tracking)
- ✅ Search
- ✅ Custom events

---

## What's Been Implemented

### 1. **GTM Utility File** 
📁 **Location:** `src/utils/gtmTracking.js`

This file contains all tracking functions:
- `trackPageView()` - Tracks page visits
- `trackProductView()` - Tracks product views
- `trackAddToCart()` - Tracks add to cart events
- `trackRemoveFromCart()` - Tracks cart removal
- `trackViewCart()` - Tracks cart page views
- `trackPurchase()` - **Most important!** Tracks completed orders
- `trackSearch()` - Tracks search queries
- `trackLogin()` - Tracks user login
- And 13+ more specialized tracking functions

### 2. **Global Page View Tracking**
📁 **Location:** `src/App.js`

Every page navigation is automatically tracked:
```javascript
useEffect(() => {
  const pageName = location.pathname === '/' ? 'Home' : location.pathname.split('/')[1] || 'Page';
  trackPageView(pageName, window.location.href);
}, [location.pathname]);
```

### 3. **Cart Events Tracking**
📁 **Location:** `src/components/CartContext.jsx`

Automatically tracks when:
- ✅ User adds product to cart → `trackAddToCart()`
- ✅ User removes product from cart → `trackRemoveFromCart()`

### 4. **Product View Tracking**
📁 **Location:** `src/pages/ProductDetails.jsx`

When user views a product, GTM captures:
- Product ID
- Product name
- Product price
- Product category

### 5. **Purchase Tracking** (MOST IMPORTANT)
📁 **Location:** `src/pages/OrderSuccess.jsx`

When order completes, GTM tracks:
- Order ID
- Total amount
- Tax
- Shipping cost
- Coupon code
- All items with: ID, name, price, quantity, category

### 6. **Search Tracking**
📁 **Location:** `src/pages/search.jsx`

When user searches, GTM captures:
- Search query
- Number of results

### 7. **Cart Page Tracking**
📁 **Location:** `src/pages/CartPage.jsx`

When user views cart page, GTM tracks:
- All items in cart
- Cart total value

---

## How to Monitor Tracking

### Option 1: Browser Console
Open your browser's Developer Tools (F12) and look for console messages:

```
📊 GTM Page View Tracked: product
🛒 GTM Add to Cart Tracked: Car Wash Gun Qty: 1
🛒 GTM View Cart Tracked - Items: 3 Total: 149.99
✅ GTM Purchase Tracked - Order: 12345 Total: 299.99
🔍 GTM Search Tracked: car wash
```

### Option 2: Google Tag Manager Preview Mode
1. Go to: https://tagmanager.google.com/
2. Select your container: GTM-WXMVTMP6
3. Click "Preview"
4. This shows real-time data being sent to GTM

### Option 3: Google Analytics
1. Go to: https://analytics.google.com/
2. Check **Conversions > All conversions** to see purchase events
3. Check **Engagement > Pages and screens** for page views
4. Check **Engagement > Events** for search events

---

## Available Tracking Functions

### Basic Page Tracking
```javascript
import { trackPageView, trackSearch, trackCustomEvent } from '../utils/gtmTracking';

// Track page view
trackPageView('Product List', window.location.href);

// Track search
trackSearch('car wash gun', 25);

// Track custom event
trackCustomEvent('special_offer_clicked', {
  offer_id: '123',
  offer_value: 50
});
```

### Product & Cart Tracking
```javascript
import { 
  trackProductView, 
  trackAddToCart, 
  trackRemoveFromCart,
  trackViewCart 
} from '../utils/gtmTracking';

// Track product view
trackProductView({
  id: 123,
  name: 'Car Wash Gun',
  price: 99.99,
  category: 'Tools'
});

// Track add to cart
trackAddToCart(product, 1);

// Track remove from cart
trackRemoveFromCart(product);

// Track view cart
trackViewCart(cartItems, cartTotal);
```

### Wishlist & Promotions
```javascript
import { 
  trackAddToWishlist,
  trackPromoView,
  trackPromoClick 
} from '../utils/gtmTracking';

// Track wishlist
trackAddToWishlist(product);

// Track promo views
trackPromoView('Summer Sale', 'promo_summer_2026');
trackPromoClick('Summer Sale', 'promo_summer_2026');
```

### User Actions
```javascript
import { 
  trackLogin,
  trackSignUp,
  setUserProperties 
} from '../utils/gtmTracking';

// Track login
trackLogin(userId);

// Track sign up
trackSignUp('google', userId);

// Set user properties
setUserProperties(userId, 'user@example.com', '50123456789');
```

---

## Event Data Structure

### Page View Event
```json
{
  "event": "page_view",
  "page_title": "Product Details",
  "page_location": "https://store1920.com/product/car-wash-gun",
  "page_path": "/product/car-wash-gun",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

### Product View Event
```json
{
  "event": "view_item",
  "ecommerce": {
    "items": [{
      "item_id": "123",
      "item_name": "Car Wash Gun",
      "price": 99.99,
      "currency": "AED",
      "item_category": "Tools"
    }]
  }
}
```

### Purchase Event
```json
{
  "event": "purchase",
  "ecommerce": {
    "transaction_id": "12345",
    "affiliation": "Store1920",
    "value": 299.99,
    "tax": 0,
    "shipping": 0,
    "currency": "AED",
    "coupon": "SAVE10",
    "items": [
      {
        "item_id": "123",
        "item_name": "Car Wash Gun",
        "price": 99.99,
        "quantity": 2,
        "item_category": "Tools"
      }
    ]
  }
}
```

---

## GTM Container Setup Checklist

### ✅ Already Configured in Your index.html:
- GTM container code in `<head>`
- GTM noscript in `<body>`
- Facebook Pixel (GTM can control this)
- TikTok Pixel
- Google Analytics 4

### 📋 Next Steps in Google Tag Manager:

1. **Create Tags** (in GTM interface):
   - Google Analytics 4 tag for all page views
   - Google Ads conversion tags for purchases
   - Facebook Pixel for retargeting

2. **Create Triggers** (GTM will listen for):
   - All Pages
   - Purchase events
   - Search events
   - Add to Cart events

3. **Set Up Conversions** in Google Ads:
   - Track purchases as conversions
   - Track "Add to Cart" as high-intent events

4. **Enable E-commerce Tracking** in GA4:
   - Go to GA4 property settings
   - Enable E-commerce analytics
   - Configure conversion tracking for purchases

---

## Console Logs for Debugging

All tracking functions log to browser console with emoji indicators:
- 📊 Page views
- 📸 Product views
- 🛒 Cart actions
- 💳 Checkout events
- ✅ Purchases
- 🔍 Searches
- ❤️ Wishlist adds
- 🎉 Promotions
- ⚠️ Errors

Turn off logs in production by removing console.log calls from `gtmTracking.js`

---

## Integration Points

### Fully Integrated:
- ✅ App.js - Page view tracking
- ✅ CartContext.jsx - Cart events
- ✅ ProductDetails.jsx - Product views
- ✅ OrderSuccess.jsx - Purchase tracking
- ✅ CartPage.jsx - Cart page views
- ✅ Search.jsx - Search tracking

---

## Performance Notes

- All tracking is asynchronous (non-blocking)
- Uses dataLayer (Google's standard approach)
- No external dependencies required
- Minimal payload size
- Works with existing Facebook & TikTok pixels

---

## Troubleshooting

### If tracking isn't showing in GTM:
1. Open Preview Mode in GTM
2. Check browser console for tracking messages
3. Verify GTM container ID is correct in index.html
4. Check that JavaScript is enabled
5. Verify dataLayer is being pushed correctly

### If purchase tracking not working:
1. Verify order data structure in OrderSuccess.jsx
2. Check that order object has: id, total, tax, shipping, items[]
3. Confirm each item has: id, name, price, quantity, category

### To test purchase tracking:
1. Open Preview Mode in GTM
2. Complete a test purchase
3. Look for "purchase" event in the GTM preview panel
4. Verify all data fields are populated

---

## Support

GTM Utility File Reference: `src/utils/gtmTracking.js`

For more info: https://www.googletagmanager.com/
