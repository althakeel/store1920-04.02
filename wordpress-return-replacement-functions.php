<?php
/**
 * Return and Replacement Request Handler for WooCommerce
 * 
 * This code:
 * 1. Creates REST API endpoint to receive return/replacement requests
 * 2. Creates custom post type for requests in WordPress dashboard
 * 3. Saves uploaded images
 * 4. Displays requests in admin dashboard
 * 
 * Add this code to your theme's functions.php file
 */

// ============================================
// 1. Register Custom Post Type for Return/Replacement Requests
// ============================================
add_action('init', 'register_return_replacement_post_type');
function register_return_replacement_post_type() {
    register_post_type('return_request', array(
        'labels' => array(
            'name' => 'Return/Replacement Requests',
            'singular_name' => 'Return Request',
            'add_new' => 'Add New Request',
            'add_new_item' => 'Add New Return Request',
            'edit_item' => 'Edit Return Request',
            'view_item' => 'View Return Request',
            'search_items' => 'Search Requests',
        ),
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-update',
        'capability_type' => 'post',
        'supports' => array('title', 'editor', 'thumbnail'),
        'has_archive' => false,
        'rewrite' => false,
    ));
}

// ============================================
// 2. REST API Endpoint to Submit Return/Replacement Request
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/submit-return-request', array(
        'methods' => 'POST',
        'callback' => 'handle_return_replacement_request',
        'permission_callback' => '__return_true',
    ));
});

function handle_return_replacement_request($request) {
    $params = $request->get_params();
    $files = $request->get_file_params();
    
    // Validate required fields
    if (empty($params['awb_number']) || empty($params['return_type']) || empty($params['reason'])) {
        return new WP_Error('missing_params', 'Missing required parameters', array('status' => 400));
    }
    
    $awb_number = sanitize_text_field($params['awb_number']);
    $return_type = sanitize_text_field($params['return_type']); // 'return' or 'replacement'
    $reason = sanitize_text_field($params['reason']);
    $comment = isset($params['comment']) ? sanitize_textarea_field($params['comment']) : '';
    
    // Create post title
    $title = sprintf(
        '%s Request - %s',
        ucfirst($return_type),
        $awb_number
    );
    
    // Create post content
    $content = sprintf(
        "<strong>AWB Number:</strong> %s<br>\n<strong>Type:</strong> %s<br>\n<strong>Reason:</strong> %s<br>\n<strong>Comments:</strong> %s",
        $awb_number,
        ucfirst($return_type),
        ucfirst(str_replace('_', ' ', $reason)),
        $comment
    );
    
    // Create the post
    $post_id = wp_insert_post(array(
        'post_type' => 'return_request',
        'post_title' => $title,
        'post_content' => $content,
        'post_status' => 'publish',
    ));
    
    if (is_wp_error($post_id)) {
        return new WP_Error('create_failed', 'Failed to create request', array('status' => 500));
    }
    
    // Save meta data
    update_post_meta($post_id, '_awb_number', $awb_number);
    update_post_meta($post_id, '_return_type', $return_type);
    update_post_meta($post_id, '_reason', $reason);
    update_post_meta($post_id, '_comment', $comment);
    update_post_meta($post_id, '_request_date', current_time('mysql'));
    update_post_meta($post_id, '_status', 'pending'); // pending, approved, rejected
    
    // Handle image uploads
    $uploaded_images = array();
    if (!empty($files['images'])) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        foreach ($files['images'] as $file) {
            if (empty($file['tmp_name'])) continue;
            
            $upload = wp_handle_upload($file, array('test_form' => false));
            
            if (!isset($upload['error'])) {
                $uploaded_images[] = $upload['url'];
                
                // Attach to post as media
                $attachment = array(
                    'post_mime_type' => $upload['type'],
                    'post_title' => sanitize_file_name($file['name']),
                    'post_content' => '',
                    'post_status' => 'inherit'
                );
                $attach_id = wp_insert_attachment($attachment, $upload['file'], $post_id);
                $attach_data = wp_generate_attachment_metadata($attach_id, $upload['file']);
                wp_update_attachment_metadata($attach_id, $attach_data);
            }
        }
    }
    
    if (!empty($uploaded_images)) {
        update_post_meta($post_id, '_uploaded_images', $uploaded_images);
    }
    
    // Send email notification to admin
    $admin_email = get_option('admin_email');
    $subject = sprintf('New %s Request - %s', ucfirst($return_type), $awb_number);
    $message = sprintf(
        "New %s request received:\n\nAWB: %s\nReason: %s\nComments: %s\n\nView in dashboard: %s",
        ucfirst($return_type),
        $awb_number,
        ucfirst(str_replace('_', ' ', $reason)),
        $comment,
        admin_url('post.php?post=' . $post_id . '&action=edit')
    );
    
    wp_mail($admin_email, $subject, $message);
    
    return array(
        'success' => true,
        'message' => 'Request submitted successfully',
        'request_id' => $post_id,
    );
}

// ============================================
// 3. Add Custom Columns to Admin List
// ============================================
add_filter('manage_return_request_posts_columns', 'return_request_custom_columns');
function return_request_custom_columns($columns) {
    $new_columns = array(
        'cb' => $columns['cb'],
        'title' => 'Request',
        'awb_number' => 'AWB Number',
        'return_type' => 'Type',
        'reason' => 'Reason',
        'status' => 'Status',
        'date' => 'Date',
    );
    return $new_columns;
}

add_action('manage_return_request_posts_custom_column', 'return_request_custom_column_content', 10, 2);
function return_request_custom_column_content($column, $post_id) {
    switch ($column) {
        case 'awb_number':
            echo esc_html(get_post_meta($post_id, '_awb_number', true));
            break;
            
        case 'return_type':
            $type = get_post_meta($post_id, '_return_type', true);
            $color = $type === 'return' ? '#d32f2f' : '#ff6d00';
            echo '<span style="background: ' . $color . '; color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 11px;">' . strtoupper($type) . '</span>';
            break;
            
        case 'reason':
            $reason = get_post_meta($post_id, '_reason', true);
            echo esc_html(ucfirst(str_replace('_', ' ', $reason)));
            break;
            
        case 'status':
            $status = get_post_meta($post_id, '_status', true);
            $colors = array(
                'pending' => '#ff9800',
                'approved' => '#4caf50',
                'rejected' => '#f44336',
            );
            $color = isset($colors[$status]) ? $colors[$status] : '#999';
            echo '<span style="background: ' . $color . '; color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 11px;">' . strtoupper($status) . '</span>';
            break;
    }
}

// ============================================
// 4. Add Meta Box to Display Request Details
// ============================================
add_action('add_meta_boxes', 'add_return_request_meta_box');
function add_return_request_meta_box() {
    add_meta_box(
        'return_request_details',
        'Request Details',
        'display_return_request_meta_box',
        'return_request',
        'normal',
        'high'
    );
}

function display_return_request_meta_box($post) {
    $awb = get_post_meta($post->ID, '_awb_number', true);
    $type = get_post_meta($post->ID, '_return_type', true);
    $reason = get_post_meta($post->ID, '_reason', true);
    $comment = get_post_meta($post->ID, '_comment', true);
    $status = get_post_meta($post->ID, '_status', true);
    $request_date = get_post_meta($post->ID, '_request_date', true);
    $images = get_post_meta($post->ID, '_uploaded_images', true);
    
    ?>
    <div style="padding: 15px;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; font-weight: bold; width: 150px;">AWB Number:</td>
                <td style="padding: 10px;"><?php echo esc_html($awb); ?></td>
            </tr>
            <tr style="background: #f5f5f5;">
                <td style="padding: 10px; font-weight: bold;">Request Type:</td>
                <td style="padding: 10px;"><?php echo esc_html(ucfirst($type)); ?></td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Reason:</td>
                <td style="padding: 10px;"><?php echo esc_html(ucfirst(str_replace('_', ' ', $reason))); ?></td>
            </tr>
            <tr style="background: #f5f5f5;">
                <td style="padding: 10px; font-weight: bold;">Comments:</td>
                <td style="padding: 10px;"><?php echo esc_html($comment); ?></td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Request Date:</td>
                <td style="padding: 10px;"><?php echo esc_html($request_date); ?></td>
            </tr>
            <tr style="background: #f5f5f5;">
                <td style="padding: 10px; font-weight: bold;">Status:</td>
                <td style="padding: 10px;">
                    <select id="return_request_status" name="return_request_status" style="padding: 8px; border-radius: 4px;">
                        <option value="pending" <?php selected($status, 'pending'); ?>>Pending</option>
                        <option value="approved" <?php selected($status, 'approved'); ?>>Approved</option>
                        <option value="rejected" <?php selected($status, 'rejected'); ?>>Rejected</option>
                    </select>
                </td>
            </tr>
        </table>
        
        <?php if (!empty($images)): ?>
        <div style="margin-top: 20px;">
            <h3 style="margin-bottom: 10px;">Uploaded Images:</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <?php foreach ($images as $image_url): ?>
                    <a href="<?php echo esc_url($image_url); ?>" target="_blank">
                        <img src="<?php echo esc_url($image_url); ?>" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;" />
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>
    <?php
}

// Save status when post is updated
add_action('save_post_return_request', 'save_return_request_status');
function save_return_request_status($post_id) {
    if (isset($_POST['return_request_status'])) {
        update_post_meta($post_id, '_status', sanitize_text_field($_POST['return_request_status']));
    }
}

// ============================================
// 5. Make AWB searchable
// ============================================
add_filter('posts_search', 'return_request_search_awb', 10, 2);
function return_request_search_awb($search, $query) {
    global $wpdb;
    
    if (!is_admin() || !$query->is_main_query() || !$query->is_search() || $query->get('post_type') !== 'return_request') {
        return $search;
    }
    
    $search_term = $query->get('s');
    if (empty($search_term)) {
        return $search;
    }
    
    $search .= $wpdb->prepare(
        " OR EXISTS (SELECT * FROM {$wpdb->postmeta} WHERE post_id={$wpdb->posts}.ID AND meta_key='_awb_number' AND meta_value LIKE %s)",
        '%' . $wpdb->esc_like($search_term) . '%'
    );
    
    return $search;
}

?>
