<?php
/**
 * Store1920 - Expose Product Short Description in REST API
 * Add this code to your WordPress theme's functions.php
 */

// ===== ENSURE SHORT DESCRIPTION IS INCLUDED IN REST API =====
add_action('rest_api_init', function() {
    // Register the short_description field for products
    register_rest_field('product', 'short_description', array(
        'get_callback' => 'get_product_short_description',
        'schema' => array(
            'description' => 'Product short description',
            'type' => 'string',
            'context' => array('view', 'edit'),
        ),
    ));
});

/**
 * Get the product short description (excerpt)
 */
function get_product_short_description($post) {
    $post_id = $post['id'];
    $product = wc_get_product($post_id);
    
    if (!$product) {
        return '';
    }
    
    // Get the short description (product excerpt)
    $short_description = $product->get_short_description();
    
    // Return the short description with HTML formatting
    return wp_kses_post($short_description);
}

// ===== FILTER WOOCOMMERCE REST API TO INCLUDE SHORT DESCRIPTION =====
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    $data = $response->get_data();
    
    // Ensure short_description is included
    $data['short_description'] = wp_kses_post($product->get_short_description());
    
    $response->set_data($data);
    return $response;
}, 10, 3);

// ===== ENSURE PRODUCT EXCERPT IS SET CORRECTLY =====
add_action('woocommerce_product_object_updated', function($product) {
    // Sync the post excerpt with the short description
    if ($product->get_short_description()) {
        wp_update_post(array(
            'ID' => $product->get_id(),
            'post_excerpt' => wp_kses_post($product->get_short_description()),
        ));
    }
});

// ===== ADD CUSTOM ENDPOINT TO GET PRODUCT WITH SHORT DESCRIPTION =====
add_action('rest_api_init', function() {
    register_rest_route('store1920/v1', '/product/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'store1920_get_product_with_short_description',
        'permission_callback' => '__return_true',
        'args' => array(
            'id' => array(
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            ),
        ),
    ));
});

/**
 * Custom endpoint to get product with all details including short description
 */
function store1920_get_product_with_short_description($request) {
    $product_id = $request['id'];
    $product = wc_get_product($product_id);
    
    if (!$product) {
        return new WP_Error('product_not_found', 'Product not found', array('status' => 404));
    }
    
    // Build comprehensive product response
    $response = array(
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'slug' => $product->get_slug(),
        'permalink' => $product->get_permalink(),
        'short_description' => wp_kses_post($product->get_short_description()),
        'description' => wp_kses_post($product->get_description()),
        'price' => $product->get_price(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'stock_status' => $product->get_stock_status(),
        'stock_quantity' => $product->get_stock_quantity(),
        'manage_stock' => $product->get_manage_stock(),
        'sku' => $product->get_sku(),
        'images' => array_map(function($attachment_id) {
            return array(
                'id' => $attachment_id,
                'src' => wp_get_attachment_image_url($attachment_id, 'full'),
                'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
            );
        }, $product->get_gallery_image_ids()),
        'rating_count' => $product->get_review_count(),
        'average_rating' => (float)$product->get_average_rating(),
        'upsell_ids' => $product->get_upsell_ids(),
        'cross_sell_ids' => $product->get_cross_sell_ids(),
        'attributes' => array_map(function($attribute) {
            return array(
                'id' => $attribute->get_id(),
                'name' => $attribute->get_name(),
                'options' => $attribute->get_options(),
                'variation' => $attribute->get_variation(),
            );
        }, $product->get_attributes()),
        'variations' => $product->is_type('variable') ? $product->get_children() : array(),
        'total_sales' => $product->get_total_sales(),
    );
    
    return rest_ensure_response($response);
}

// ===== LOG SHORT DESCRIPTION UPDATES FOR DEBUGGING =====
add_action('woocommerce_product_object_updated', function($product) {
    $short_desc = $product->get_short_description();
    if ($short_desc) {
        error_log('✅ Product ' . $product->get_id() . ' short description: ' . substr($short_desc, 0, 100) . '...');
    } else {
        error_log('⚠️ Product ' . $product->get_id() . ' has NO short description');
    }
});
?>
