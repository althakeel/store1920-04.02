# Brands API Integration Guide

## Overview
This guide explains how to set up the WooCommerce Brands API endpoint to display real brands from your WordPress store in the brands carousel.

## What You Need to Know

Your WooCommerce store can store brands in different ways:
- **Perfect Brands Plugin** → Uses `pb_brand` taxonomy
- **Default WooCommerce** → Uses `product_brand` taxonomy
- **Custom Setup** → Uses `pa_brand` or other custom taxonomy

The PHP code automatically detects which one you have and uses it.

## Installation Steps

### Step 1: Copy PHP Code to functions.php

1. Go to **WordPress Admin Dashboard**
2. Navigate to **Appearance → Theme File Editor**
3. Find and click **functions.php** in the right sidebar
4. Scroll to the end of the file
5. Copy the entire contents of the file: **wordpress-brands-api-endpoint.php**
6. Paste it at the end of your functions.php file
7. Click **Update File**

### Step 2: Test the API Endpoints

Once you've added the code, test these URLs in your browser:

#### Check which brand taxonomy is detected:
```
https://db.store1920.com/wp-json/store1920/v1/brands/debug
```

This will show you:
- Available brand taxonomies
- Detected brand taxonomy
- Sample brands with their data

#### Get all brands:
```
https://db.store1920.com/wp-json/store1920/v1/brands
```

#### Get a single brand by slug:
```
https://db.store1920.com/wp-json/store1920/v1/brand/brand-slug-here
```

## How It Works

### API Endpoints Created

1. **GET /store1920/v1/brands** - Lists all brands
   - Returns: Array of brands with name, logo, description, product count
   - Cache: 1 hour in browser, 10 minutes on CDN

2. **GET /store1920/v1/brand/{slug}** - Get single brand with products
   - Returns: Brand data with all associated products
   - Cache: 30 minutes in browser, 5 minutes on CDN

3. **GET /store1920/v1/brands/debug** - Debug endpoint
   - Shows detected taxonomy and sample brands
   - Useful for troubleshooting

### React Code Updates

The BrandsCarousel component now:
1. Fetches brands from the WordPress API automatically
2. Shows loading skeletons while fetching
3. Falls back to placeholder images if brand logos are missing
4. Handles errors gracefully

## What Gets Returned for Each Brand

```json
{
  "id": 123,
  "name": "Brand Name",
  "slug": "brand-slug",
  "description": "Brand description",
  "logo": "https://example.com/brand-logo.jpg",
  "count": 15,
  "link": "https://store1920.com/product-category/brands/brand-slug/"
}
```

## Troubleshooting

### No brands showing in carousel?
1. Check the debug endpoint: `/wp-json/store1920/v1/brands/debug`
2. Make sure you have brands created in WordPress
3. Make sure the brand images are set up

### Wrong endpoint error?
- The code automatically tries these taxonomies in order:
  1. `pb_brand` (Perfect Brands)
  2. `product_brand` (Default)
  3. `pa_brand` (Custom)

### Need to clear cache?
The endpoints use cache headers. You can:
- Clear browser cache
- Wait for CDN cache to expire (10 minutes)
- Clear WordPress object cache if using a caching plugin

## Files Modified

1. **wordpress-brands-api-endpoint.php** - PHP code for functions.php
2. **src/api/woocommerce.js** - Added `getAllBrands()` function
3. **src/components/BrandsCarousel.jsx** - Now fetches from API
4. **src/components/sub/home/productcategory.jsx** - Removed dummy brands import

## Adding Brand Images/Logos in WordPress

For each brand (taxonomy term):

1. Go to **Products → Categories** (or your brand taxonomy location)
2. Click on the brand
3. Scroll down and find **Thumbnail** section
4. Upload or select the brand logo image
5. Save the brand

The API will automatically return the logo URL in the response.

## Performance Optimization

The endpoints are optimized for performance:
- ✅ Returns max 100 brands per request
- ✅ Uses REST API caching headers
- ✅ Brands are sorted by product count (most popular first)
- ✅ Only fetches necessary fields

## Next Steps

After setting up brands:
1. ✅ Add brand logos to all your brands in WordPress
2. ✅ Test the carousel by visiting your store
3. ✅ Click on a brand to see the BrandPage with products
4. ✅ Customize the BrandsCarousel styling if needed

---

**Need Help?** Check the API debug endpoint for troubleshooting information.
