<?php
/**
 * Add Delivery Type and Delivery Time to WooCommerce Orders
 * 
 * Add this code to your theme's functions.php file or create a custom plugin
 */

// ============================================
// 1. Add custom fields to order meta when order is created
// ============================================
add_action('woocommerce_checkout_create_order', 'save_delivery_type_to_order', 10, 2);
function save_delivery_type_to_order($order, $data) {
    // Get delivery type from POST data
    if (isset($_POST['delivery_type'])) {
        $order->update_meta_data('_delivery_type', sanitize_text_field($_POST['delivery_type']));
    }
    
    // Get delivery time based on delivery type
    $delivery_time = '';
    if (isset($_POST['delivery_type'])) {
        switch ($_POST['delivery_type']) {
            case 'office':
                $delivery_time = '9 am to 6 pm';
                break;
            case 'home':
                $delivery_time = '9 am to 9 pm';
                break;
            case 'apartment':
                $delivery_time = '9 am to 9 pm';
                break;
            default:
                $delivery_time = '9 am to 9 pm';
        }
    }
    
    if ($delivery_time) {
        $order->update_meta_data('_delivery_time', $delivery_time);
    }
}

// ============================================
// 2. Display delivery type and time in admin order details
// ============================================
add_action('woocommerce_admin_order_data_after_shipping_address', 'display_delivery_info_in_admin_order', 10, 1);
function display_delivery_info_in_admin_order($order) {
    $delivery_type = $order->get_meta('_delivery_type');
    $delivery_time = $order->get_meta('_delivery_time');
    
    if ($delivery_type || $delivery_time) {
        echo '<div class="delivery-info" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #2271b1;">';
        echo '<h3 style="margin-top: 0; color: #2271b1;">Delivery Information</h3>';
        
        if ($delivery_type) {
            $type_label = ucfirst($delivery_type);
            echo '<p><strong>Delivery Type:</strong> <span style="color: #d63638; font-weight: 600;">' . esc_html($type_label) . '</span></p>';
        }
        
        if ($delivery_time) {
            echo '<p><strong>Delivery Time:</strong> <span style="color: #00a32a; font-weight: 600;">' . esc_html($delivery_time) . '</span></p>';
        }
        
        echo '</div>';
    }
}

// ============================================
// 3. Display delivery info in order emails
// ============================================
add_action('woocommerce_email_after_order_table', 'add_delivery_info_to_order_emails', 10, 4);
function add_delivery_info_to_order_emails($order, $sent_to_admin, $plain_text, $email) {
    $delivery_type = $order->get_meta('_delivery_type');
    $delivery_time = $order->get_meta('_delivery_time');
    
    if ($delivery_type || $delivery_time) {
        if ($plain_text) {
            // Plain text email
            echo "\n" . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" . "\n";
            echo "DELIVERY INFORMATION" . "\n";
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" . "\n";
            
            if ($delivery_type) {
                echo "Delivery Type: " . ucfirst($delivery_type) . "\n";
            }
            
            if ($delivery_time) {
                echo "Delivery Time: " . $delivery_time . "\n";
            }
            
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" . "\n\n";
        } else {
            // HTML email
            echo '<div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border: 2px solid #2271b1; border-radius: 8px;">';
            echo '<h2 style="color: #2271b1; margin-top: 0; font-size: 18px; border-bottom: 2px solid #2271b1; padding-bottom: 10px;">🚚 Delivery Information</h2>';
            
            if ($delivery_type) {
                $type_label = ucfirst($delivery_type);
                echo '<p style="margin: 10px 0;"><strong style="color: #333;">Delivery Type:</strong> <span style="color: #d63638; font-weight: 600; font-size: 16px;">' . esc_html($type_label) . '</span></p>';
            }
            
            if ($delivery_time) {
                echo '<p style="margin: 10px 0;"><strong style="color: #333;">Delivery Time:</strong> <span style="color: #00a32a; font-weight: 600; font-size: 16px;">' . esc_html($delivery_time) . '</span></p>';
            }
            
            echo '</div>';
        }
    }
}

// ============================================
// 4. Display delivery info in customer "My Account" order view
// ============================================
add_action('woocommerce_order_details_after_order_table', 'display_delivery_info_in_my_account', 10, 1);
function display_delivery_info_in_my_account($order) {
    $delivery_type = $order->get_meta('_delivery_type');
    $delivery_time = $order->get_meta('_delivery_time');
    
    if ($delivery_type || $delivery_time) {
        echo '<section class="woocommerce-delivery-info" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-left: 4px solid #2271b1; border-radius: 4px;">';
        echo '<h2 class="woocommerce-column__title" style="color: #2271b1; margin-top: 0;">Delivery Information</h2>';
        echo '<table class="woocommerce-table shop_table delivery_info" style="width: 100%; border: none;">';
        
        if ($delivery_type) {
            $type_label = ucfirst($delivery_type);
            echo '<tr>';
            echo '<th style="text-align: left; padding: 10px 0; border-bottom: 1px solid #ddd;">Delivery Type:</th>';
            echo '<td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #ddd; color: #d63638; font-weight: 600;">' . esc_html($type_label) . '</td>';
            echo '</tr>';
        }
        
        if ($delivery_time) {
            echo '<tr>';
            echo '<th style="text-align: left; padding: 10px 0;">Delivery Time:</th>';
            echo '<td style="text-align: right; padding: 10px 0; color: #00a32a; font-weight: 600;">' . esc_html($delivery_time) . '</td>';
            echo '</tr>';
        }
        
        echo '</table>';
        echo '</section>';
    }
}

// ============================================
// 5. Make delivery type searchable in admin orders
// ============================================
add_filter('woocommerce_shop_order_search_fields', 'add_delivery_type_to_order_search');
function add_delivery_type_to_order_search($search_fields) {
    $search_fields[] = '_delivery_type';
    return $search_fields;
}

// ============================================
// 6. Add delivery type column to admin orders list (OPTIONAL)
// ============================================
add_filter('manage_edit-shop_order_columns', 'add_delivery_type_column_to_orders', 20);
function add_delivery_type_column_to_orders($columns) {
    $new_columns = array();
    
    foreach ($columns as $column_name => $column_info) {
        $new_columns[$column_name] = $column_info;
        
        // Add after 'order_status' column
        if ('order_status' === $column_name) {
            $new_columns['delivery_type'] = 'Delivery Type';
        }
    }
    
    return $new_columns;
}

add_action('manage_shop_order_posts_custom_column', 'display_delivery_type_column_content', 20, 2);
function display_delivery_type_column_content($column, $post_id) {
    if ('delivery_type' === $column) {
        $order = wc_get_order($post_id);
        $delivery_type = $order->get_meta('_delivery_type');
        
        if ($delivery_type) {
            $type_label = ucfirst($delivery_type);
            
            // Color coding
            $color = '#999';
            if ($delivery_type === 'office') {
                $color = '#2271b1'; // Blue
            } elseif ($delivery_type === 'home') {
                $color = '#00a32a'; // Green
            } elseif ($delivery_type === 'apartment') {
                $color = '#d63638'; // Red
            }
            
            echo '<mark class="order-delivery-type" style="background: ' . esc_attr($color) . '; color: #fff; padding: 4px 8px; border-radius: 3px; font-weight: 600; font-size: 11px;">' . esc_html($type_label) . '</mark>';
        } else {
            echo '—';
        }
    }
}

// ============================================
// 7. REST API endpoint to receive delivery data from React checkout
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/save-delivery-info', array(
        'methods' => 'POST',
        'callback' => 'save_delivery_info_to_order',
        'permission_callback' => '__return_true',
    ));
});

function save_delivery_info_to_order($request) {
    $params = $request->get_json_params();
    
    if (!isset($params['order_id']) || !isset($params['delivery_type'])) {
        return new WP_Error('missing_params', 'Missing required parameters', array('status' => 400));
    }
    
    $order_id = intval($params['order_id']);
    $order = wc_get_order($order_id);
    
    if (!$order) {
        return new WP_Error('invalid_order', 'Invalid order ID', array('status' => 404));
    }
    
    // Save delivery type
    $delivery_type = sanitize_text_field($params['delivery_type']);
    $order->update_meta_data('_delivery_type', $delivery_type);
    
    // Calculate and save delivery time
    $delivery_time = '';
    switch ($delivery_type) {
        case 'office':
            $delivery_time = '9 am to 6 pm';
            break;
        case 'home':
        case 'apartment':
            $delivery_time = '9 am to 9 pm';
            break;
    }
    
    if ($delivery_time) {
        $order->update_meta_data('_delivery_time', $delivery_time);
    }
    
    $order->save();
    
    return array(
        'success' => true,
        'message' => 'Delivery information saved successfully',
        'delivery_type' => $delivery_type,
        'delivery_time' => $delivery_time,
    );
}

// ============================================
// 8. Add delivery info to order notes (OPTIONAL)
// ============================================
add_action('woocommerce_checkout_order_created', 'add_delivery_info_to_order_notes', 10, 1);
function add_delivery_info_to_order_notes($order) {
    $delivery_type = $order->get_meta('_delivery_type');
    $delivery_time = $order->get_meta('_delivery_time');
    
    if ($delivery_type) {
        $note = sprintf(
            'Delivery Type: %s | Delivery Time: %s',
            ucfirst($delivery_type),
            $delivery_time ? $delivery_time : 'Not specified'
        );
        
        $order->add_order_note($note);
    }
}

// ============================================
// 9. Webhook support - Include delivery info in webhook payload
// ============================================
add_filter('woocommerce_webhook_payload', 'add_delivery_info_to_webhook', 10, 4);
function add_delivery_info_to_webhook($payload, $resource, $resource_id, $id) {
    if ($resource === 'order') {
        $order = wc_get_order($resource_id);
        
        if ($order) {
            $payload['delivery_type'] = $order->get_meta('_delivery_type');
            $payload['delivery_time'] = $order->get_meta('_delivery_time');
        }
    }
    
    return $payload;
}

?>
