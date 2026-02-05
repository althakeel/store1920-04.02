# COD Availability Feature - Installation Guide

## Overview
This feature allows you to enable/disable Cash on Delivery (COD) for individual products through the WordPress admin panel.

## Installation Steps

### 1. Add WordPress Function
Copy the entire contents of `wordpress-cod-availability.php` and paste it into your theme's `functions.php` file.

**Location:** WordPress Admin → Appearance → Theme File Editor → functions.php

### 2. How to Use

#### Enable COD for a Product:
1. Go to **WordPress Admin → Products**
2. Edit any product
3. Look for the **"Cash on Delivery (COD) Availability"** meta box in the right sidebar
4. Check the box **"Enable Cash on Delivery"**
5. Click **Update** to save

#### Disable COD for a Product:
1. Edit the product
2. Uncheck the **"Enable Cash on Delivery"** box
3. Click **Update**

### 3. How It Works

**Frontend Logic:**
- COD option appears in checkout **ONLY IF ALL** cart items support COD
- A product supports COD if:
  - ✅ It's in the static products list (existing products), **OR**
  - ✅ It has "Enable Cash on Delivery" checked in WordPress admin (new feature)

**Cart Behavior:**
- If cart has **only COD-enabled products** → COD option shows
- If cart has **mixed products** (some COD, some non-COD) → COD option hidden
- Each product shows a badge: **"✓ COD Available"** or **"✗ COD Not Available"**

### 4. Important Notes

✅ **Existing products are NOT affected** - they continue working as before
✅ **No changes to static products** - the static products list still works
✅ **New products default to NO COD** - you must manually enable it
✅ **Works with variations** - variations inherit parent product's COD setting

## Technical Details

### Files Modified:
1. `wordpress-cod-availability.php` (NEW) - WordPress backend code
2. `src/api/woocommerce.js` - Added `cod_available` to API fields
3. `src/components/checkoutleft/PaymentMethods.jsx` - Updated COD logic
4. `src/components/checkoutleft/ItemList.jsx` - Updated badge display

### API Field Added:
- **Field Name:** `cod_available`
- **Type:** Boolean (`true` or `false`)
- **Exposed In:** WooCommerce REST API product response

### Database:
- **Meta Key:** `_cod_available`
- **Values:** `yes` or `no`
- **Storage:** WordPress post meta table

## Testing

1. Create/edit a product
2. Enable COD checkbox
3. Save product
4. Add product to cart
5. Go to checkout
6. Verify COD payment option appears
7. Verify product shows "✓ COD Available" badge

## Rollback

To disable this feature, simply remove the code from `functions.php`. Existing products will revert to the original static products list logic.
