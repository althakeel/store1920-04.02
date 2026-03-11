<?php
// Add this to your theme's functions.php or a custom plugin
add_action('wp_ajax_check_coupon', 'custom_check_coupon_ajax');
add_action('wp_ajax_nopriv_check_coupon', 'custom_check_coupon_ajax');

function custom_check_coupon_ajax() {
    if (!isset($_POST['coupon_code'])) {
        wp_send_json_error(['message' => 'No coupon code provided.']);
    }
    $coupon_code = sanitize_text_field($_POST['coupon_code']);
    $coupon = new WC_Coupon($coupon_code);
    if (!$coupon->get_id() || !$coupon->is_valid()) {
        wp_send_json_error(['message' => 'Invalid or expired coupon.']);
    }
    // Optionally, you can check for restrictions here (products, usage, etc.)
    wp_send_json_success([
        'discount_type' => $coupon->get_discount_type(),
        'amount' => $coupon->get_amount(),
        'code' => $coupon->get_code(),
        'description' => $coupon->get_description(),
    ]);
}
