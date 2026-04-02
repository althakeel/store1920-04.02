<?php
/**
 * Store1920 custom password reset endpoints.
 *
 * Add this to your theme's functions.php or a custom plugin on the WordPress site.
 * It sends reset emails that point back to the Store1920 frontend and accepts the
 * final password reset from the frontend reset page.
 */

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/request-password-reset', array(
        'methods' => 'POST',
        'callback' => 'store1920_request_password_reset',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('custom/v1', '/reset-password', array(
        'methods' => 'POST',
        'callback' => 'store1920_reset_password',
        'permission_callback' => '__return_true',
    ));
});

function store1920_find_user_by_identifier($identifier) {
    global $wpdb;

    $identifier = trim((string) $identifier);
    if ($identifier === '') {
        return false;
    }

    if (is_email($identifier)) {
        return get_user_by('email', $identifier);
    }

    $user = get_user_by('login', $identifier);
    if ($user) {
        return $user;
    }

    $normalized = preg_replace('/\D+/', '', $identifier);
    if ($normalized === '') {
        return false;
    }

    $meta_keys = array('billing_phone', 'phone', 'mobile_number');
    foreach ($meta_keys as $meta_key) {
        $user_id = $wpdb->get_var($wpdb->prepare(
            "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND REPLACE(REPLACE(REPLACE(REPLACE(meta_value, ' ', ''), '-', ''), '(', ''), ')', '') = %s LIMIT 1",
            $meta_key,
            $normalized
        ));

        if ($user_id) {
            return get_user_by('id', (int) $user_id);
        }
    }

    return false;
}

function store1920_request_password_reset($request) {
    $params = $request->get_json_params();
    $identifier = sanitize_text_field($params['identifier'] ?? '');

    if ($identifier === '') {
        return new WP_Error('missing_identifier', 'Email or mobile number is required.', array('status' => 400));
    }

    $user = store1920_find_user_by_identifier($identifier);
    if (!$user) {
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'A reset link has been sent to your email.',
        ));
    }

    $reset_key = get_password_reset_key($user);
    if (is_wp_error($reset_key)) {
        return new WP_Error('reset_key_failed', $reset_key->get_error_message(), array('status' => 500));
    }

    $frontend_url = 'https://store1920.com/reset-password?login=' . rawurlencode($user->user_login) . '&key=' . rawurlencode($reset_key);
    $subject = 'Reset your Store1920 password';

    $message = '<p>Hello ' . esc_html($user->display_name ?: $user->user_login) . ',</p>';
    $message .= '<p>We received a request to reset your Store1920 password.</p>';
    $message .= '<p><a href="' . esc_url($frontend_url) . '" style="display:inline-block;padding:12px 20px;background:#aa4d00;color:#ffffff;text-decoration:none;border-radius:6px;">Reset Password</a></p>';
    $message .= '<p>If you did not request this, you can ignore this email.</p>';
    $message .= '<p>This link will expire in 1 hour.</p>';

    add_filter('wp_mail_content_type', 'store1920_password_reset_mail_content_type');
    wp_mail($user->user_email, $subject, $message);
    remove_filter('wp_mail_content_type', 'store1920_password_reset_mail_content_type');

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'A reset link has been sent to your email.',
    ));
}

function store1920_password_reset_mail_content_type() {
    return 'text/html';
}

function store1920_reset_password($request) {
    $params = $request->get_json_params();
    $login = sanitize_text_field($params['login'] ?? '');
    $key = sanitize_text_field($params['key'] ?? '');
    $password = (string) ($params['password'] ?? '');

    if ($login === '' || $key === '' || $password === '') {
        return new WP_Error('missing_fields', 'Reset link and new password are required.', array('status' => 400));
    }

    if (strlen($password) < 8) {
        return new WP_Error('weak_password', 'Password must be at least 8 characters.', array('status' => 400));
    }

    $user = check_password_reset_key($key, $login);
    if (is_wp_error($user)) {
        return new WP_Error('invalid_reset_key', 'This reset link is invalid or has expired.', array('status' => 400));
    }

    reset_password($user, $password);

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'Password updated successfully.',
    ));
}
