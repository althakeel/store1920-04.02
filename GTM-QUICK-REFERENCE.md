# GTM Tracking Implementation - Quick Reference

## 🎯 Your Store1920 GTM Container
**Container ID:** GTM-WXMVTMP6  
**Status:** ✅ Fully Active  
**Tracking All:** Page Views, Products, Cart, Search, Purchases

---

## 📍 What Gets Tracked at Each Step

### Step 1️⃣ - User Lands on Website
```
📊 Page View Event
├─ Event: "page_view"
├─ Page: "Home"
└─ Timestamp: Sent to GTM
```

### Step 2️⃣ - User Browses Products
```
📸 Product View Event (per product)
├─ Event: "view_item"
├─ Product ID: 123
├─ Product Name: "Car Wash Gun"
├─ Price: 99.99 AED
└─ Category: "Tools"
```

### Step 3️⃣ - User Adds to Cart
```
🛒 Add to Cart Event
├─ Event: "add_to_cart"
├─ Product: "Car Wash Gun"
├─ Quantity: 1
└─ Action: "Button Click"
```

### Step 4️⃣ - User Views Cart
```
🛒 View Cart Event
├─ Event: "view_cart"
├─ Items Count: 3
├─ Total Value: 149.99 AED
└─ Items: [Object Array]
```

### Step 5️⃣ - User Searches
```
🔍 Search Event
├─ Event: "search"
├─ Query: "car wash"
└─ Results: 45 items found
```

### Step 6️⃣ - User Removes from Cart
```
❌ Remove from Cart Event
├─ Event: "remove_from_cart"
├─ Product: "Car Wash Gun"
└─ Quantity: 1
```

### Step 7️⃣ - User Starts Checkout
```
💳 Begin Checkout Event
├─ Event: "begin_checkout"
├─ Items: 2
├─ Total: 199.99 AED
└─ Payment: Selected
```

### Step 8️⃣ - User Completes Purchase ⭐ MOST IMPORTANT
```
✅ Purchase Event
├─ Event: "purchase"
├─ Order ID: 12345
├─ Total: 299.99 AED
├─ Tax: 0 AED
├─ Shipping: 0 AED
├─ Coupon: "SAVE10" (if applicable)
├─ Items:
│  ├─ Item 1: Car Wash Gun (AED 99.99 x 2)
│  ├─ Item 2: Paint Sprayer (AED 99.99 x1)
│  └─ Category: Tools
└─ Timestamp: Order completion time
```

---

## 📂 Implementation Files

| File | Purpose | Status |
|------|---------|--------|
| `public/index.html` | GTM Script & Pixels | ✅ Active |
| `src/utils/gtmTracking.js` | All tracking functions | ✅ Created |
| `src/App.js` | Page view tracking | ✅ Updated |
| `src/components/CartContext.jsx` | Cart events | ✅ Updated |
| `src/pages/ProductDetails.jsx` | Product views | ✅ Updated |
| `src/pages/OrderSuccess.jsx` | Purchase tracking | ✅ Updated |
| `src/pages/CartPage.jsx` | View cart tracking | ✅ Updated |
| `src/pages/search.jsx` | Search tracking | ✅ Updated |

---

## 🔧 Available Functions (Quick Call Reference)

### Import
```javascript
import {
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
  trackAddToWishlist,
  trackPromoView,
  trackPromoClick,
  trackCustomEvent,
  setUserProperties
} from '../utils/gtmTracking';
```

### Usage Examples

```javascript
// Track page view
trackPageView('Product Page', 'https://store1920.com/product/123');

// Track product
trackProductView({
  id: 123,
  name: 'Car Wash Gun',
  price: 99.99,
  category: 'Tools'
});

// Track cart
trackAddToCart(productObject, 1);
trackRemoveFromCart(productObject);
trackViewCart(cartItems, 199.99);

// Track search
trackSearch('car wash', 45);

// Track user
trackLogin(userId);
trackSignUp('google', userId);
setUserProperties(userId, 'user@email.com', '+971501234567');

// Track wishlist
trackAddToWishlist(productObject);

// Track promos
trackPromoView('Summer Sale', 'promo_summer_2026');
trackPromoClick('Summer Sale', 'promo_summer_2026');

// Track purchase (most important!)
trackPurchase({
  id: '12345',
  total: 299.99,
  tax: 0,
  shipping: 0,
  coupon_code: 'SAVE10',
  items: [
    {
      id: 123,
      product_name: 'Car Wash Gun',
      product_price: 99.99,
      quantity: 2,
      category: 'Tools'
    }
  ]
});

// Custom event
trackCustomEvent('special_offer_viewed', {
  offer_id: 'promo_123',
  offer_value: 50
});
```

---

## 📊 Console Output Example

When you open your browser's Developer Tools Console (F12), you'll see:

```
📊 GTM Page View Tracked: home
📸 GTM Product View Tracked: Car Wash Gun
🛒 GTM Add to Cart Tracked: Car Wash Gun Qty: 1
🛒 GTM View Cart Tracked - Items: 1 Total: 99.99
🛒 GTM Add to Cart Tracked: Paint Sprayer Qty: 1
🛒 GTM View Cart Tracked - Items: 2 Total: 199.99
💳 GTM Begin Checkout Tracked
✅ GTM Purchase Tracked - Order: 12345 Total: 299.99
```

---

## ✅ Verification Checklist

### In Google Tag Manager
- [ ] Open https://tagmanager.google.com
- [ ] Select GTM-WXMVTMP6 container
- [ ] Click "Preview"
- [ ] Visit your website
- [ ] You should see events in the Preview panel

### In Google Analytics 4
- [ ] Go to https://analytics.google.com
- [ ] Select your GA4 property
- [ ] Go to Reports > Engagement > Events
- [ ] Should see: page_view, view_item, add_to_cart, purchase

### In Browser Console
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Browse your site
- [ ] Should see GTM tracking messages with emojis

---

## 🚀 Next Steps

1. **Create GTM Tags** (in GTM interface):
   - Google Analytics 4 configuration tag
   - Google Ads conversion tags for purchases

2. **Set Up Conversions** in Google Ads:
   - Import "purchase" event as conversion
   - Set conversion value to transaction total

3. **Enable E-commerce in GA4**:
   - Analytics > Admin > Data Streams
   - Enable Enhanced E-commerce

4. **Create Audiences** in GTM:
   - Purchasers (for retargeting)
   - Cart abandoners (for email campaigns)
   - Searchers (for specific keywords)

5. **Build Reports** in GA4:
   - Ecommerce purchases by product
   - Conversion tracking
   - User journey analysis

---

## 🐛 Troubleshooting

### No events showing in GTM Preview?
1. ✅ Make sure Preview Mode is active
2. ✅ Clear browser cache (Ctrl+Shift+Del)
3. ✅ Refresh the website
4. ✅ Check console for errors (F12)

### Events showing in console but not GTM?
1. ✅ Wait 24-48 hours for data collection
2. ✅ Verify GTM container ID in HTML
3. ✅ Check if JavaScript is enabled
4. ✅ Verify dataLayer variable exists

### Purchase tracking not working?
1. ✅ Check OrderSuccess.jsx loads correctly
2. ✅ Verify order object has all fields
3. ✅ Check console for purchase event message
4. ✅ Confirm items array is populated

---

## 📞 Support Resources

- **GTM Documentation:** https://support.google.com/tagmanager
- **GA4 Ecommerce Setup:** https://support.google.com/analytics/answer/11228529
- **Debugging:** Open Preview Mode in GTM container
- **Testing:** Use test purchase with order ID "TEST-12345"

---

## 🎉 You're All Set!

Your Store1920 is now sending comprehensive tracking data to Google Tag Manager. All user interactions are being monitored and can be used for:

✅ Analytics & Insights  
✅ Google Ads Optimization  
✅ Email Marketing  
✅ Audience Segmentation  
✅ Conversion Tracking  
✅ Holistic Reporting
