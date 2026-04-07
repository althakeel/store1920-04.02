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
    $message = store1920_build_email_template(array(
        'preheader' => 'Reset your Store1920 password',
        'title' => 'Password Reset Request',
        'greeting' => 'Hello ' . esc_html($user->display_name ?: $user->user_login) . ',',
        'intro' => 'We received a request to reset your Store1920 password.',
        'body' => 'Use the button below to choose a new password. For your security, this reset link will expire in 1 hour.',
        'button_text' => 'Reset Password',
        'button_url' => $frontend_url,
        'footer_note' => 'If you did not request this, you can safely ignore this email.',
    ));

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

function store1920_build_email_template($args = array()) {
    $defaults = array(
        'preheader' => '',
        'title' => 'Store1920 Notification',
        'greeting' => 'Hello,',
        'intro' => '',
        'body' => '',
        'otp_code' => '',
        'button_text' => '',
        'button_url' => '',
        'footer_note' => '',
    );

    $args = wp_parse_args($args, $defaults);

    $logo_url = 'https://www.store1920.com/static/media/logo-after-eid.c6d6888264ae389df31b.png';
    $preheader = esc_html($args['preheader']);
    $title = esc_html($args['title']);
    $greeting = esc_html($args['greeting']);
    $intro = esc_html($args['intro']);
    $body = esc_html($args['body']);
    $otp_code = preg_replace('/[^0-9A-Za-z-]/', '', (string) $args['otp_code']);
    $button_text = esc_html($args['button_text']);
    $button_url = esc_url($args['button_url']);
    $footer_note = esc_html($args['footer_note']);

    $html = '';
    $html .= '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' . $title . '</title></head>';
    $html .= '<body style="margin:0;padding:0;background:#f6f3ee;font-family:Arial,sans-serif;color:#1f2937;">';
    $html .= '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' . $preheader . '</div>';
    $html .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3ee;padding:24px 12px;">';
    $html .= '<tr><td align="center">';
    $html .= '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #eadfce;">';
    $html .= '<tr><td style="background:linear-gradient(135deg,#fff8ef 0%,#f8ede2 100%);padding:28px 24px 20px;text-align:center;border-bottom:1px solid #f0e4d5;">';
    $html .= '<img src="' . esc_url($logo_url) . '" alt="Store1920" style="max-width:180px;width:100%;height:auto;margin-bottom:18px;" />';
    $html .= '<div style="display:inline-block;background:#fff3e6;color:#aa4d00;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:7px 12px;border-radius:999px;">Store1920 Account</div>';
    $html .= '<h1 style="margin:18px 0 0;font-size:28px;line-height:1.25;color:#111827;">' . $title . '</h1>';
    $html .= '</td></tr>';
    $html .= '<tr><td style="padding:32px 24px 16px;">';
    $html .= '<p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#374151;">' . $greeting . '</p>';
    if ($intro !== '') {
        $html .= '<p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#374151;">' . $intro . '</p>';
    }
    if ($body !== '') {
        $html .= '<p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#4b5563;">' . $body . '</p>';
    }
    if ($otp_code !== '') {
        $html .= '<div style="margin:0 0 24px;text-align:center;">';
        $html .= '<div style="font-size:13px;color:#6b7280;margin-bottom:10px;">Your verification code</div>';
        $html .= '<div style="display:inline-block;padding:16px 26px;border:1px dashed #d6b38a;border-radius:14px;background:#fffaf5;font-size:32px;font-weight:800;letter-spacing:0.22em;color:#aa4d00;">' . esc_html($otp_code) . '</div>';
        $html .= '</div>';
    }
    if ($button_text !== '' && $button_url !== '') {
        $html .= '<div style="margin:0 0 24px;text-align:center;">';
        $html .= '<a href="' . $button_url . '" style="display:inline-block;padding:14px 24px;background:#aa4d00;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">' . $button_text . '</a>';
        $html .= '</div>';
    }
    if ($footer_note !== '') {
        $html .= '<p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#6b7280;">' . $footer_note . '</p>';
    }
    $html .= '</td></tr>';
    $html .= '<tr><td style="padding:18px 24px 28px;background:#fcfaf7;border-top:1px solid #f0e4d5;">';
    $html .= '<p style="margin:0;font-size:12px;line-height:1.8;color:#9ca3af;text-align:center;">This email was sent by Store1920. If you need help, contact support through our website.</p>';
    $html .= '</td></tr>';
    $html .= '</table>';
    $html .= '</td></tr></table>';
    $html .= '</body></html>';

    return $html;
}

function store1920_send_otp_email($email, $otp, $full_name = '') {
    $site_name = wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);
    $display_name = !empty($full_name) ? $full_name : 'Customer';

    $subject = $site_name . ' Email Verification Code';
    $message = store1920_build_email_template(array(
        'preheader' => 'Your Store1920 verification code',
        'title' => 'Email Verification Code',
        'greeting' => 'Hello ' . $display_name . ',',
        'intro' => 'Use the verification code below to continue with your Store1920 account action.',
        'body' => 'This code will expire in 5 minutes. For your security, please do not share it with anyone.',
        'otp_code' => $otp,
        'footer_note' => 'If you did not request this code, you can safely ignore this email.',
    ));

    $headers = array('Content-Type: text/html; charset=UTF-8');

    $sent = wp_mail($email, $subject, $message, $headers);

    if (function_exists('store1920_otp_log')) {
        store1920_otp_log('SEND EMAIL RESULT', array(
            'email' => $email,
            'sent'  => $sent,
        ));
    }

    return $sent;
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
