<?php
/**
 * Auto-Fetch Customer Location and Save to WooCommerce Orders
 * 
 * This code:
 * 1. Captures customer's geolocation when they open checkout
 * 2. Reverse geocodes to get address from Google Maps
 * 3. Saves location to order meta
 * 4. Displays location in order details with Google Maps embed
 * 
 * Add this code to your theme's functions.php file
 */

// ============================================
// 1. REST API endpoint to save customer location
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/save-customer-location', array(
        'methods' => 'POST',
        'callback' => 'save_customer_location_to_session',
        'permission_callback' => '__return_true',
    ));
});

function save_customer_location_to_session($request) {
    $params = $request->get_json_params();
    
    if (!isset($params['latitude']) || !isset($params['longitude'])) {
        return new WP_Error('missing_params', 'Missing location parameters', array('status' => 400));
    }
    
    // Start session if not started
    if (!session_id()) {
        session_start();
    }
    
    // Save location to session
    $_SESSION['customer_latitude'] = sanitize_text_field($params['latitude']);
    $_SESSION['customer_longitude'] = sanitize_text_field($params['longitude']);
    
    // Save formatted address if provided
    if (isset($params['formatted_address'])) {
        $_SESSION['customer_location_address'] = sanitize_text_field($params['formatted_address']);
    }
    
    // Save city, country if provided
    if (isset($params['city'])) {
        $_SESSION['customer_location_city'] = sanitize_text_field($params['city']);
    }
    if (isset($params['country'])) {
        $_SESSION['customer_location_country'] = sanitize_text_field($params['country']);
    }
    
    return array(
        'success' => true,
        'message' => 'Location saved successfully',
        'latitude' => $_SESSION['customer_latitude'],
        'longitude' => $_SESSION['customer_longitude'],
    );
}

// ============================================
// 2. Save location to order meta when order is created
// ============================================
add_action('woocommerce_checkout_order_created', 'save_location_to_order', 10, 1);
function save_location_to_order($order) {
    // Start session if not started
    if (!session_id()) {
        session_start();
    }
    
    // Get location from session
    if (isset($_SESSION['customer_latitude']) && isset($_SESSION['customer_longitude'])) {
        $order->update_meta_data('_customer_latitude', $_SESSION['customer_latitude']);
        $order->update_meta_data('_customer_longitude', $_SESSION['customer_longitude']);
        
        // Save formatted address if available
        if (isset($_SESSION['customer_location_address'])) {
            $order->update_meta_data('_customer_location_address', $_SESSION['customer_location_address']);
        }
        
        if (isset($_SESSION['customer_location_city'])) {
            $order->update_meta_data('_customer_location_city', $_SESSION['customer_location_city']);
        }
        
        if (isset($_SESSION['customer_location_country'])) {
            $order->update_meta_data('_customer_location_country', $_SESSION['customer_location_country']);
        }
        
        // Create Google Maps URL
        $maps_url = sprintf(
            'https://www.google.com/maps?q=%s,%s',
            $_SESSION['customer_latitude'],
            $_SESSION['customer_longitude']
        );
        $order->update_meta_data('_customer_location_maps_url', $maps_url);
        
        // Add timestamp
        $order->update_meta_data('_customer_location_timestamp', current_time('mysql'));
        
        $order->save();
        
        // Clear session data
        unset($_SESSION['customer_latitude']);
        unset($_SESSION['customer_longitude']);
        unset($_SESSION['customer_location_address']);
        unset($_SESSION['customer_location_city']);
        unset($_SESSION['customer_location_country']);
    }
}

// ============================================
// 3. Display location in admin order details with Google Maps embed
// ============================================
add_action('woocommerce_admin_order_data_after_shipping_address', 'display_customer_location_in_admin_order', 10, 1);
function display_customer_location_in_admin_order($order) {
    $latitude = $order->get_meta('_customer_latitude');
    $longitude = $order->get_meta('_customer_longitude');
    $formatted_address = $order->get_meta('_customer_location_address');
    $city = $order->get_meta('_customer_location_city');
    $country = $order->get_meta('_customer_location_country');
    $maps_url = $order->get_meta('_customer_location_maps_url');
    $timestamp = $order->get_meta('_customer_location_timestamp');
    
    if ($latitude && $longitude) {
        echo '<div class="customer-location-info" style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">';
        echo '<h3 style="margin-top: 0; color: #856404; display: flex; align-items: center; gap: 8px;">';
        echo '<span style="font-size: 20px;">📍</span> Customer Auto-Detected Location</h3>';
        
        // Display formatted address if available
        if ($formatted_address) {
            echo '<p style="margin: 8px 0;"><strong>Address:</strong> ' . esc_html($formatted_address) . '</p>';
        }
        
        // Display coordinates
        echo '<p style="margin: 8px 0;">';
        echo '<strong>Coordinates:</strong> ';
        echo '<span style="background: #fff; padding: 4px 8px; border-radius: 3px; font-family: monospace;">';
        echo esc_html($latitude) . ', ' . esc_html($longitude);
        echo '</span>';
        echo '</p>';
        
        // Display city and country if available
        if ($city || $country) {
            echo '<p style="margin: 8px 0;"><strong>Location:</strong> ';
            if ($city) echo esc_html($city);
            if ($city && $country) echo ', ';
            if ($country) echo esc_html($country);
            echo '</p>';
        }
        
        // Display timestamp
        if ($timestamp) {
            echo '<p style="margin: 8px 0; font-size: 12px; color: #666;">';
            echo '<strong>Detected at:</strong> ' . esc_html($timestamp);
            echo '</p>';
        }
        
        // Google Maps link
        if ($maps_url) {
            echo '<p style="margin: 12px 0 8px 0;">';
            echo '<a href="' . esc_url($maps_url) . '" target="_blank" style="display: inline-block; background: #4285f4; color: #fff; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: 600;">';
            echo '🗺️ Open in Google Maps';
            echo '</a>';
            echo '</p>';
        }
        
        // Embedded Google Map
        echo '<div style="margin-top: 15px; border: 2px solid #ffc107; border-radius: 4px; overflow: hidden;">';
        echo '<iframe width="100%" height="300" frameborder="0" style="border:0; display: block;" ';
        echo 'src="https://www.google.com/maps?q=' . esc_attr($latitude) . ',' . esc_attr($longitude) . '&output=embed" ';
        echo 'allowfullscreen></iframe>';
        echo '</div>';
        
        echo '<p style="margin-top: 10px; font-size: 11px; color: #856404; font-style: italic;">';
        echo '⚠️ This location was automatically detected from the customer\'s browser when they opened the checkout page.';
        echo '</p>';
        
        echo '</div>';
    }
}

// ============================================
// 4. Display location in order emails (optional)
// ============================================
add_action('woocommerce_email_after_order_table', 'add_location_to_order_emails', 10, 4);
function add_location_to_order_emails($order, $sent_to_admin, $plain_text, $email) {
    // Only show to admin emails
    if (!$sent_to_admin) {
        return;
    }
    
    $latitude = $order->get_meta('_customer_latitude');
    $longitude = $order->get_meta('_customer_longitude');
    $formatted_address = $order->get_meta('_customer_location_address');
    $maps_url = $order->get_meta('_customer_location_maps_url');
    
    if ($latitude && $longitude) {
        if ($plain_text) {
            echo "\n" . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" . "\n";
            echo "📍 CUSTOMER AUTO-DETECTED LOCATION" . "\n";
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" . "\n";
            
            if ($formatted_address) {
                echo "Address: " . $formatted_address . "\n";
            }
            
            echo "Coordinates: " . $latitude . ", " . $longitude . "\n";
            
            if ($maps_url) {
                echo "Google Maps: " . $maps_url . "\n";
            }
            
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" . "\n\n";
        } else {
            echo '<div style="margin: 30px 0; padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px;">';
            echo '<h2 style="color: #856404; margin-top: 0; font-size: 18px; border-bottom: 2px solid #ffc107; padding-bottom: 10px;">📍 Customer Auto-Detected Location</h2>';
            
            if ($formatted_address) {
                echo '<p style="margin: 10px 0;"><strong>Address:</strong> ' . esc_html($formatted_address) . '</p>';
            }
            
            echo '<p style="margin: 10px 0;"><strong>Coordinates:</strong> ' . esc_html($latitude) . ', ' . esc_html($longitude) . '</p>';
            
            if ($maps_url) {
                echo '<p style="margin: 15px 0;">';
                echo '<a href="' . esc_url($maps_url) . '" style="display: inline-block; background: #4285f4; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600;">🗺️ View on Google Maps</a>';
                echo '</p>';
            }
            
            echo '</div>';
        }
    }
}

// ============================================
// 5. Display location in customer "My Account" (optional - hidden by default)
// ============================================
// Uncomment below if you want customers to see their location
/*
add_action('woocommerce_order_details_after_order_table', 'display_location_in_my_account', 10, 1);
function display_location_in_my_account($order) {
    $latitude = $order->get_meta('_customer_latitude');
    $longitude = $order->get_meta('_customer_longitude');
    $formatted_address = $order->get_meta('_customer_location_address');
    
    if ($latitude && $longitude && $formatted_address) {
        echo '<section class="woocommerce-location-info" style="margin-top: 30px; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">';
        echo '<h2 class="woocommerce-column__title" style="color: #856404; margin-top: 0;">📍 Detected Location</h2>';
        echo '<p>' . esc_html($formatted_address) . '</p>';
        echo '</section>';
    }
}
*/

// ============================================
// 6. Add location to order notes (optional)
// ============================================
add_action('woocommerce_checkout_order_created', 'add_location_to_order_notes', 10, 1);
function add_location_to_order_notes($order) {
    if (!session_id()) {
        session_start();
    }
    
    if (isset($_SESSION['customer_latitude']) && isset($_SESSION['customer_longitude'])) {
        $note = sprintf(
            '📍 Customer location auto-detected: %s, %s',
            $_SESSION['customer_latitude'],
            $_SESSION['customer_longitude']
        );
        
        if (isset($_SESSION['customer_location_address'])) {
            $note .= ' (' . $_SESSION['customer_location_address'] . ')';
        }
        
        $order->add_order_note($note);
    }
}

// ============================================
// 7. Make location searchable in admin orders
// ============================================
add_filter('woocommerce_shop_order_search_fields', 'add_location_to_order_search');
function add_location_to_order_search($search_fields) {
    $search_fields[] = '_customer_location_address';
    $search_fields[] = '_customer_location_city';
    return $search_fields;
}

// ============================================
// 8. Add location column to admin orders list (OPTIONAL)
// ============================================
add_filter('manage_edit-shop_order_columns', 'add_location_column_to_orders', 20);
function add_location_column_to_orders($columns) {
    $new_columns = array();
    
    foreach ($columns as $column_name => $column_info) {
        $new_columns[$column_name] = $column_info;
        
        // Add after 'shipping_address' column
        if ('shipping_address' === $column_name) {
            $new_columns['customer_location'] = '📍 Location';
        }
    }
    
    return $new_columns;
}

add_action('manage_shop_order_posts_custom_column', 'display_location_column_content', 20, 2);
function display_location_column_content($column, $post_id) {
    if ('customer_location' === $column) {
        $order = wc_get_order($post_id);
        $latitude = $order->get_meta('_customer_latitude');
        $longitude = $order->get_meta('_customer_longitude');
        $city = $order->get_meta('_customer_location_city');
        
        if ($latitude && $longitude) {
            $maps_url = sprintf('https://www.google.com/maps?q=%s,%s', $latitude, $longitude);
            
            echo '<a href="' . esc_url($maps_url) . '" target="_blank" style="text-decoration: none; color: #2271b1;">';
            echo '<span style="font-size: 16px;">📍</span> ';
            if ($city) {
                echo '<span style="font-weight: 600;">' . esc_html($city) . '</span>';
            } else {
                echo '<span style="font-size: 11px; color: #666;">View Map</span>';
            }
            echo '</a>';
        } else {
            echo '<span style="color: #999;">—</span>';
        }
    }
}

// ============================================
// 9. Start session for location tracking
// ============================================
add_action('init', 'start_session_for_location_tracking');
function start_session_for_location_tracking() {
    if (!session_id()) {
        session_start();
    }
}

?>
