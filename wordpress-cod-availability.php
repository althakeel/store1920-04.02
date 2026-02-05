<?php
/**
 * COD Availability for Individual Products
 * 
 * Add this code to your theme's functions.php file
 * This allows enabling/disabling COD for specific products
 * 
 * @version 1.0.0
 * @package Store1920
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Check if WooCommerce is active before proceeding
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    return;
}

// Add COD availability meta box to product edit page
if (!function_exists('store1920_add_cod_availability_meta_box')) {
    function store1920_add_cod_availability_meta_box() {
        add_meta_box(
            'store1920_cod_availability',
            'Cash on Delivery (COD) Availability',
            'store1920_render_cod_availability_meta_box',
            'product',
            'side',
            'default'
        );
    }
    add_action('add_meta_boxes', 'store1920_add_cod_availability_meta_box', 10);
}

// Render the COD availability checkbox
if (!function_exists('store1920_render_cod_availability_meta_box')) {
    function store1920_render_cod_availability_meta_box($post) {
        // Add nonce for security
        wp_nonce_field('store1920_save_cod_availability', 'store1920_cod_availability_nonce');
        
        // Get current value
        $cod_available = get_post_meta($post->ID, '_cod_available', true);
        $is_checked = ($cod_available === 'yes') ? 'checked' : '';
        
        ?>
        <div style="padding: 10px 0;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input 
                    type="checkbox" 
                    name="cod_available" 
                    value="yes" 
                    <?php echo esc_attr($is_checked); ?>
                    style="width: 18px; height: 18px; cursor: pointer;"
                />
                <span style="font-weight: 500;">Enable Cash on Delivery</span>
            </label>
            <p style="margin: 8px 0 0 26px; color: #666; font-size: 13px;">
                Check this box to allow COD payment for this product
            </p>
        </div>
        <?php
    }
}

// Save the COD availability setting
if (!function_exists('store1920_save_cod_availability')) {
    function store1920_save_cod_availability($post_id) {
        // Check nonce
        if (!isset($_POST['store1920_cod_availability_nonce']) || 
            !wp_verify_nonce($_POST['store1920_cod_availability_nonce'], 'store1920_save_cod_availability')) {
            return;
        }

        // Check autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Check permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Check if it's a product
        if (get_post_type($post_id) !== 'product') {
            return;
        }

        // Save the value
        if (isset($_POST['cod_available']) && $_POST['cod_available'] === 'yes') {
            update_post_meta($post_id, '_cod_available', 'yes');
        } else {
            update_post_meta($post_id, '_cod_available', 'no');
        }
    }
    add_action('save_post', 'store1920_save_cod_availability', 10, 1);
}

// Expose COD availability in WooCommerce REST API
if (!function_exists('store1920_add_cod_availability_to_rest')) {
    function store1920_add_cod_availability_to_rest($response, $product, $request) {
        if (!is_object($product) || !method_exists($product, 'get_id')) {
            return $response;
        }
        
        $product_id = $product->get_id();
        $cod_available = get_post_meta($product_id, '_cod_available', true);
        
        // Add to response - ensure it's always a boolean
        $response->data['cod_available'] = ($cod_available === 'yes');
        
        return $response;
    }
    add_filter('woocommerce_rest_prepare_product_object', 'store1920_add_cod_availability_to_rest', 20, 3);
}

// Also add to variations
if (!function_exists('store1920_add_cod_availability_to_variation_rest')) {
    function store1920_add_cod_availability_to_variation_rest($response, $variation, $request) {
        if (!is_object($variation) || !method_exists($variation, 'get_parent_id')) {
            return $response;
        }
        
        // For variations, check the parent product's COD setting
        $parent_id = $variation->get_parent_id();
        $cod_available = get_post_meta($parent_id, '_cod_available', true);
        
        // Add to response - ensure it's always a boolean
        $response->data['cod_available'] = ($cod_available === 'yes');
        
        return $response;
    }
    add_filter('woocommerce_rest_prepare_product_variation_object', 'store1920_add_cod_availability_to_variation_rest', 20, 3);
}
