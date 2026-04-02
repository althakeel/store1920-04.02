<?php
/**
 * WordPress Custom Endpoints for Social Login
 *
 * Add this code to your theme's functions.php or create a custom plugin.
 * These endpoints receive user data from Firebase social sign-in and create/sync
 * WooCommerce customers for Google and Facebook.
 */

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/google-login', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            return handle_social_login($request, 'google');
        },
        'permission_callback' => '__return_true',
    ));

    register_rest_route('custom/v1', '/facebook-login', array(
        'methods' => 'POST',
        'callback' => function ($request) {
            return handle_social_login($request, 'facebook');
        },
        'permission_callback' => '__return_true',
    ));
});

function handle_social_login($request, $provider = 'google') {
    $params = $request->get_json_params();

    $email = sanitize_email($params['email'] ?? '');
    $name = sanitize_text_field($params['name'] ?? '');
    $firebase_uid = sanitize_text_field($params['firebase_uid'] ?? '');
    $photo_url = esc_url_raw($params['photo_url'] ?? '');
    $provider = sanitize_key($provider);

    if (empty($email)) {
        return new WP_Error('missing_email', 'Email is required', array('status' => 400));
    }

    $existing_user = get_user_by('email', $email);
    $is_new_user = false;

    if ($existing_user) {
        $user_id = $existing_user->ID;
    } else {
        $is_new_user = true;
        $username = sanitize_user(current(explode('@', $email)));
        $base_username = $username;
        $counter = 1;

        while (username_exists($username)) {
            $username = $base_username . $counter;
            $counter++;
        }

        $random_password = wp_generate_password(20, true, true);
        $user_id = wp_create_user($username, $random_password, $email);

        if (is_wp_error($user_id)) {
            return new WP_Error('user_creation_failed', $user_id->get_error_message(), array('status' => 500));
        }

        $wp_user = new WP_User($user_id);
        $wp_user->set_role('customer');
    }

    wp_update_user(array(
        'ID' => $user_id,
        'display_name' => $name ?: $email,
        'first_name' => $name,
    ));

    if (!empty($firebase_uid)) {
        update_user_meta($user_id, 'firebase_uid', $firebase_uid);
        update_user_meta($user_id, $provider . '_firebase_uid', $firebase_uid);
    }

    if (!empty($photo_url)) {
        update_user_meta($user_id, 'profile_picture', $photo_url);
    }

    $wp_user = get_user_by('id', $user_id);
    $token = '';

    if (function_exists('jwt_auth_generate_token')) {
        $token = jwt_auth_generate_token($wp_user);
    } else {
        wp_set_current_user($user_id);
        wp_set_auth_cookie($user_id, true);
        $token = 'wordpress_session';
    }

    $customer_id = get_user_meta($user_id, '_woocommerce_customer_id', true);

    return array(
        'success' => true,
        'id' => $user_id,
        'user_id' => $user_id,
        'customer_id' => $customer_id,
        'name' => $name ?: $email,
        'email' => $email,
        'provider' => $provider,
        'token' => $token,
        'message' => $is_new_user ? 'User created and logged in successfully' : 'User logged in successfully',
    );
}
