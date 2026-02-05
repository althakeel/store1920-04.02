<?php
// Store1920 Product Subtitle Field (Admin + REST)
// Safe: prefixed functions, no constants, no conflicts.

if (!function_exists('store1920_register_product_subtitle_meta_box')) {
    add_action('add_meta_boxes', 'store1920_register_product_subtitle_meta_box');
    function store1920_register_product_subtitle_meta_box() {
        add_meta_box(
            'store1920_product_subtitle',
            __('Product Subtitle', 'store1920'),
            'store1920_render_product_subtitle_meta_box',
            'product',
            'normal',
            'high'
        );
    }
}

if (!function_exists('store1920_render_product_subtitle_meta_box')) {
    function store1920_render_product_subtitle_meta_box($post) {
        $subtitle = get_post_meta($post->ID, '_store1920_product_subtitle', true);
        wp_nonce_field('store1920_save_product_subtitle', 'store1920_product_subtitle_nonce');
        ?>
        <p>
            <label for="store1920_product_subtitle" style="font-weight:600; display:block; margin-bottom:6px;">
                <?php esc_html_e('Subtitle (shows below product title)', 'store1920'); ?>
            </label>
            <input
                type="text"
                id="store1920_product_subtitle"
                name="store1920_product_subtitle"
                value="<?php echo esc_attr($subtitle); ?>"
                class="widefat"
                placeholder="<?php esc_attr_e('Enter product subtitle', 'store1920'); ?>"
            />
        </p>
        <?php
    }
}

if (!function_exists('store1920_save_product_subtitle')) {
    add_action('save_post_product', 'store1920_save_product_subtitle');
    function store1920_save_product_subtitle($post_id) {
        if (!isset($_POST['store1920_product_subtitle_nonce'])) return;
        if (!wp_verify_nonce($_POST['store1920_product_subtitle_nonce'], 'store1920_save_product_subtitle')) return;
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        $subtitle = isset($_POST['store1920_product_subtitle'])
            ? sanitize_text_field(wp_unslash($_POST['store1920_product_subtitle']))
            : '';

        if ($subtitle !== '') {
            update_post_meta($post_id, '_store1920_product_subtitle', $subtitle);
        } else {
            delete_post_meta($post_id, '_store1920_product_subtitle');
        }
    }
}

if (!function_exists('store1920_add_subtitle_to_rest')) {
    add_filter('woocommerce_rest_prepare_product_object', 'store1920_add_subtitle_to_rest', 10, 3);
    function store1920_add_subtitle_to_rest($response, $product, $request) {
        if (!is_a($response, 'WP_REST_Response') || !$product) return $response;

        $data = $response->get_data();
        $subtitle = get_post_meta($product->get_id(), '_store1920_product_subtitle', true);
        $data['subtitle'] = $subtitle ? $subtitle : '';

        $response->set_data($data);
        return $response;
    }
}
?>
