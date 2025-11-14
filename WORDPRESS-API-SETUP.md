# WordPress API Setup for Order Tracking

## Overview
This document explains how to set up the WordPress REST API endpoint to fetch real order details for the tracking page.

## Installation Steps

### Option 1: Add to Theme Functions (Recommended)

1. Log in to your WordPress admin panel
2. Go to **Appearance > Theme File Editor**
3. Select **functions.php** from the right sidebar
4. Copy the entire code from `wordpress-order-tracking-endpoint.php`
5. Paste it at the end of your functions.php file
6. Click **Update File**

### Option 2: Create a Custom Plugin

1. Create a new folder in `wp-content/plugins/` named `order-tracking-api`
2. Create a file named `order-tracking-api.php` in that folder
3. Add this header at the top:

```php
<?php
/**
 * Plugin Name: Order Tracking API
 * Description: Custom REST API endpoint for order tracking
 * Version: 1.0
 * Author: Your Name
 */

// Add the code from wordpress-order-tracking-endpoint.php here
```

4. Go to **Plugins** in WordPress admin and activate the plugin

## API Endpoint Details

**Endpoint URL:** `https://db.store1920.com/wp-json/custom/v1/get-order-by-tracking`

**Method:** POST

**Request Body:**
```json
{
  "tracking_number": "525484"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "order_id": 12345,
    "order_number": "12345",
    "status": "completed",
    "currency": "AED",
    "total": "183.75",
    "subtotal": "150.00",
    "total_tax": "8.75",
    "shipping_total": "25.00",
    "discount_total": "0.00",
    "payment_method": "cod",
    "payment_method_title": "Cash on Delivery",
    "line_items": [
      {
        "id": 1,
        "name": "Product Name",
        "quantity": 1,
        "price": "150.00",
        "total": "150.00",
        "image": "https://example.com/image.jpg",
        "product_id": 123
      }
    ],
    "shipping": {
      "first_name": "John",
      "last_name": "Doe",
      "address_1": "123 Main St",
      "address_2": "Apt 4B",
      "city": "Dubai",
      "state": "Dubai",
      "postcode": "12345",
      "country": "United Arab Emirates"
    },
    "billing": {
      "email": "customer@example.com",
      "phone": "+971501234567"
    }
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Order not found with this tracking number"
}
```

## Important Configuration

### Setting Tracking Numbers in WooCommerce

The API searches for tracking numbers in order meta. You need to store tracking numbers when creating/updating orders.

**Method 1: Using Meta Key**
```php
update_post_meta($order_id, '_tracking_number', '525484');
```

**Method 2: Using WooCommerce Order Meta**
```php
$order = wc_get_order($order_id);
$order->update_meta_data('_tracking_number', '525484');
$order->save();
```

### Alternative Meta Keys

If you're using a different tracking plugin, update line 31 in the API code:
```php
'key' => '_tracking_number', // Change this to your meta key
```

Common tracking meta keys:
- `_tracking_number`
- `tracking_number`
- `_wc_shipment_tracking_items`
- Your custom meta key

## Testing the API

### Using Browser/Postman

1. Open Postman or any API testing tool
2. Create a POST request to: `https://db.store1920.com/wp-json/custom/v1/get-order-by-tracking`
3. Set Header: `Content-Type: application/json`
4. Set Body (raw JSON):
```json
{
  "tracking_number": "525484"
}
```
5. Click Send

### Using cURL
```bash
curl -X POST https://db.store1920.com/wp-json/custom/v1/get-order-by-tracking \
  -H "Content-Type: application/json" \
  -d '{"tracking_number":"525484"}'
```

## Troubleshooting

### Issue: "Order not found"
**Solution:** 
- Verify the tracking number exists in your orders
- Check the meta key name matches your setup
- Ensure the order status is not 'trash'

### Issue: API returns 404
**Solution:**
- Flush permalinks: Go to Settings > Permalinks > Click Save
- Verify the code is properly added to functions.php or plugin is activated

### Issue: Empty product images
**Solution:**
- Ensure products have featured images set
- Check image URLs are accessible

### Issue: Missing shipping/billing data
**Solution:**
- Verify the order has complete shipping/billing information
- Check WooCommerce order details in admin

## Security Considerations

The current endpoint is public (`permission_callback => '__return_true'`). For production:

### Add Authentication (Optional)
```php
'permission_callback' => function() {
    // Option 1: Require logged-in user
    return is_user_logged_in();
    
    // Option 2: Require specific capability
    return current_user_can('manage_options');
    
    // Option 3: API Key authentication
    $api_key = $_SERVER['HTTP_X_API_KEY'] ?? '';
    return $api_key === 'your-secret-key';
}
```

## Frontend Integration

The React app automatically calls this endpoint when you search for a tracking number. No additional configuration needed on the frontend.

## Support

For issues or questions, contact your developer or check the WordPress REST API documentation:
https://developer.wordpress.org/rest-api/
