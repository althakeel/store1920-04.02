<?php
/**
 * WordPress Custom API Endpoint for Order Tracking
 * Add this code to your theme's functions.php or create a custom plugin
 */

// Register custom REST API endpoint to get order by tracking number
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/get-order-by-tracking', array(
        'methods' => 'POST',
        'callback' => 'get_order_by_tracking_number',
        'permission_callback' => '__return_true'
    ));
});

function get_order_by_tracking_number($request) {
    $params = $request->get_json_params();
    $tracking_number = isset($params['tracking_number']) ? sanitize_text_field($params['tracking_number']) : '';

    if (empty($tracking_number)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Tracking number is required'
        ), 400);
    }

    // Search for order by tracking number in post meta
    $args = array(
        'post_type' => 'shop_order',
        'post_status' => 'any',
        'posts_per_page' => 1,
        'meta_query' => array(
            array(
                'key' => '_tracking_number', // Adjust meta key based on your setup
                'value' => $tracking_number,
                'compare' => '='
            )
        )
    );

    $orders = get_posts($args);

    if (empty($orders)) {
        // Try alternative meta keys
        $args['meta_query'][0]['key'] = 'tracking_number';
        $orders = get_posts($args);
    }

    if (empty($orders)) {
        // Try searching in order notes or custom fields
        $args = array(
            'post_type' => 'shop_order',
            'post_status' => 'any',
            'posts_per_page' => -1
        );
        
        $all_orders = get_posts($args);
        foreach ($all_orders as $order_post) {
            $order = wc_get_order($order_post->ID);
            // Check if tracking number exists in order meta
            $order_tracking = $order->get_meta('_tracking_number');
            if ($order_tracking === $tracking_number) {
                $orders = array($order_post);
                break;
            }
        }
    }

    if (empty($orders)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Order not found with this tracking number'
        ), 404);
    }

    $order_post = $orders[0];
    $order = wc_get_order($order_post->ID);

    // Prepare order data
    $line_items = array();
    foreach ($order->get_items() as $item_id => $item) {
        $product = $item->get_product();
        $image_id = $product ? $product->get_image_id() : 0;
        $image_url = $image_id ? wp_get_attachment_url($image_id) : '';

        $line_items[] = array(
            'id' => $item_id,
            'name' => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'price' => $item->get_total() / $item->get_quantity(),
            'total' => $item->get_total(),
            'image' => $image_url,
            'product_id' => $item->get_product_id()
        );
    }

    // Prepare shipping address
    $shipping = array(
        'first_name' => $order->get_shipping_first_name(),
        'last_name' => $order->get_shipping_last_name(),
        'company' => $order->get_shipping_company(),
        'address_1' => $order->get_shipping_address_1(),
        'address_2' => $order->get_shipping_address_2(),
        'city' => $order->get_shipping_city(),
        'state' => $order->get_shipping_state(),
        'postcode' => $order->get_shipping_postcode(),
        'country' => $order->get_shipping_country()
    );

    // Prepare billing address
    $billing = array(
        'first_name' => $order->get_billing_first_name(),
        'last_name' => $order->get_billing_last_name(),
        'company' => $order->get_billing_company(),
        'address_1' => $order->get_billing_address_1(),
        'address_2' => $order->get_billing_address_2(),
        'city' => $order->get_billing_city(),
        'state' => $order->get_billing_state(),
        'postcode' => $order->get_billing_postcode(),
        'country' => $order->get_billing_country(),
        'email' => $order->get_billing_email(),
        'phone' => $order->get_billing_phone()
    );

    $order_data = array(
        'order_id' => $order->get_id(),
        'order_number' => $order->get_order_number(),
        'status' => $order->get_status(),
        'currency' => $order->get_currency(),
        'total' => $order->get_total(),
        'subtotal' => $order->get_subtotal(),
        'total_tax' => $order->get_total_tax(),
        'shipping_total' => $order->get_shipping_total(),
        'discount_total' => $order->get_discount_total(),
        'payment_method' => $order->get_payment_method(),
        'payment_method_title' => $order->get_payment_method_title(),
        'date_created' => $order->get_date_created()->format('Y-m-d H:i:s'),
        'line_items' => $line_items,
        'shipping' => $shipping,
        'billing' => $billing,
        'tracking_number' => $tracking_number,
        'customer_note' => $order->get_customer_note()
    );

    return new WP_REST_Response(array(
        'success' => true,
        'data' => $order_data
    ), 200);
}
