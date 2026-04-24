<?php
/**
 * WordPress CORS Configuration
 * 
 * Add this code to your WordPress theme's functions.php file
 * or create a custom plugin with this code.
 * 
 * This allows your React app (localhost:3000) to access the WooCommerce API
 */

// Add CORS headers to all REST API requests
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        
        // Allow requests from localhost during development
        $allowed_origins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://test.store1920.com',
            'https://store1920.com',
            'https://www.store1920.com'
        ];
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-WP-Nonce');
            header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages');
        }
        
        // Handle preflight OPTIONS requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
        
        return $value;
    });
}, 15);

// Additional CORS headers for WooCommerce API
add_filter('woocommerce_rest_check_permissions', function($permission, $context, $object_id, $post_type) {
    $origin = get_http_origin();
    $allowed_origins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://test.store1920.com',
        'https://store1920.com',
        'https://www.store1920.com'
    ];
    
    if (in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-WP-Nonce');
    }
    
    return $permission;
}, 10, 4);

// Handle OPTIONS requests for custom endpoints
add_action('init', function() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        $origin = get_http_origin();
        $allowed_origins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://test.store1920.com',
            'https://store1920.com',
            'https://www.store1920.com'
        ];
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-WP-Nonce');
            status_header(200);
            exit();
        }
    }
});
