# Auto-Fetch Customer Location Setup Guide

This feature automatically detects customer location when they open the checkout page and saves it to WooCommerce orders with Google Maps integration.

## 📋 What You Need

1. WordPress with WooCommerce installed
2. Google Maps API Key
3. React checkout page

## 🚀 Setup Instructions

### Step 1: Add PHP Code to WordPress

Copy the entire content of `wordpress-auto-location-functions.php` and paste it into your WordPress theme's `functions.php` file.

**File location:** `wp-content/themes/your-theme/functions.php`

### Step 2: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Geolocation API**
4. Create API Key in "Credentials" section
5. Copy your API key

### Step 3: Update React Component

Open `src/components/AutoFetchLocation.jsx` and replace:

```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
```

With your actual API key:

```javascript
const GOOGLE_MAPS_API_KEY = 'AIzaSyC...your-key-here';
```

### Step 4: Component is Already Added

The `AutoFetchLocation` component is already imported and added to your checkout page!

## ✅ What Happens Now

### When Customer Opens Checkout:
1. Browser requests location permission (popup)
2. If allowed, gets GPS coordinates
3. Reverse geocodes to get address from Google Maps
4. Saves to WordPress session automatically
5. Location shows in order details after order is placed

### In WooCommerce Order Details You'll See:
- 📍 Auto-detected customer location section
- Full address (from Google Maps)
- Coordinates (latitude, longitude)
- City and Country
- Embedded Google Map
- "Open in Google Maps" button
- Timestamp of when location was detected

### In Orders List (Admin):
- New column "📍 Location" with clickable map link

### In Order Emails (Admin):
- Location information included

### In Order Notes:
- Auto-note: "📍 Customer location auto-detected..."

## 🔒 Privacy Note

The location detection:
- ❌ Doesn't work if customer denies permission
- ✅ Only requests once per session
- ✅ Silent fallback if denied (no errors shown)
- ✅ Stored securely in WooCommerce order meta
- ⚠️ Shows warning in admin: "This location was automatically detected from the customer's browser"

## 🎨 Customization

### Hide Location from Customers

In `wordpress-auto-location-functions.php`, the customer view function is commented out by default. To show it to customers, uncomment lines 175-191.

### Remove Location Column from Orders List

Comment out or remove section #8 in `wordpress-auto-location-functions.php`

### Change Map Size

In section #3, change:
```php
height="300"  // Change this number
```

## 📊 Order Meta Keys Saved

- `_customer_latitude` - GPS latitude
- `_customer_longitude` - GPS longitude  
- `_customer_location_address` - Full formatted address
- `_customer_location_city` - City name
- `_customer_location_country` - Country name
- `_customer_location_maps_url` - Google Maps URL
- `_customer_location_timestamp` - When detected

## 🐛 Troubleshooting

### Location not showing in orders?
- Check browser console for errors
- Verify API key is correct
- Check if user denied location permission
- Ensure PHP functions are added to functions.php

### "Invalid API key" error?
- Make sure you enabled the required APIs
- Check if API key restrictions are blocking requests
- Verify API key is copied correctly

### Location not accurate?
- This uses browser geolocation (not IP lookup)
- Accuracy depends on device GPS/WiFi
- Desktop computers may be less accurate than mobile

## 🎉 Done!

Your checkout page now automatically captures customer location! This helps with:
- Delivery route planning
- Fraud detection
- Customer service
- Analytics

---

**Need help?** Check the browser console for debugging logs or WordPress debug.log file.
