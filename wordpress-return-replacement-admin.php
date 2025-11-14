<?php
/**
 * Return & Replacement Request Management System
 * Add this code to your theme's functions.php file
 * 
 * Features:
 * - Creates custom database table for storing requests
 * - Adds admin menu page to view all requests
 * - Displays uploaded images
 * - Shows request details (type, reason, comments, date)
 * - Allows status updates (Pending, Approved, Rejected, Completed)
 */

// ============================================
// 1. CREATE DATABASE TABLE ON ACTIVATION
// ============================================
function create_return_replacement_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'return_replacement_requests';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        tracking_number varchar(100) NOT NULL,
        order_id varchar(100) NOT NULL,
        request_type varchar(50) NOT NULL,
        reason varchar(255) NOT NULL,
        comments text,
        images longtext,
        customer_name varchar(255),
        customer_email varchar(255),
        customer_phone varchar(50),
        status varchar(50) DEFAULT 'Pending',
        request_date datetime DEFAULT CURRENT_TIMESTAMP,
        updated_date datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY tracking_number (tracking_number),
        KEY order_id (order_id),
        KEY status (status)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    
    // Set auto-increment to start from 50000 for order-like IDs
    $wpdb->query("ALTER TABLE $table_name AUTO_INCREMENT = 50000");
}
add_action('after_setup_theme', 'create_return_replacement_table');


// ============================================
// 2. REST API ENDPOINT TO SUBMIT REQUESTS
// ============================================
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/submit-return-replacement', array(
        'methods' => 'POST',
        'callback' => 'handle_return_replacement_submission',
        'permission_callback' => '__return_true'
    ));
    
    // New endpoint to check return/replacement status
    register_rest_route('custom/v1', '/check-return-status/(?P<tracking>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'check_return_replacement_status',
        'permission_callback' => '__return_true'
    ));
});

function handle_return_replacement_submission($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'return_replacement_requests';
    
    $params = $request->get_json_params();
    
    // Validate required fields
    if (empty($params['trackingNumber']) || empty($params['type']) || empty($params['reason'])) {
        return new WP_Error('missing_fields', 'Required fields are missing', array('status' => 400));
    }
    
    // Process images (base64 encoded)
    $images_json = !empty($params['images']) ? json_encode($params['images']) : null;
    
    // Insert into database
    $result = $wpdb->insert(
        $table_name,
        array(
            'tracking_number' => sanitize_text_field($params['trackingNumber']),
            'order_id' => sanitize_text_field($params['orderId'] ?? ''),
            'request_type' => sanitize_text_field($params['type']),
            'reason' => sanitize_text_field($params['reason']),
            'comments' => sanitize_textarea_field($params['comments'] ?? ''),
            'images' => $images_json,
            'customer_name' => sanitize_text_field($params['customerName'] ?? ''),
            'customer_email' => sanitize_email($params['customerEmail'] ?? ''),
            'customer_phone' => sanitize_text_field($params['customerPhone'] ?? ''),
            'status' => 'Pending',
            'request_date' => current_time('mysql')
        ),
        array('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
    );
    
    if ($result === false) {
        return new WP_Error('db_error', 'Failed to save request', array('status' => 500));
    }
    
    return array(
        'success' => true,
        'message' => 'Request submitted successfully',
        'request_id' => $wpdb->insert_id
    );
}

// Check return/replacement status for a tracking number
function check_return_replacement_status($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'return_replacement_requests';
    
    $tracking = sanitize_text_field($request['tracking']);
    
    $requests = $wpdb->get_results($wpdb->prepare(
        "SELECT id, request_type, reason, status, request_date FROM $table_name WHERE tracking_number = %s ORDER BY request_date DESC",
        $tracking
    ));
    
    if (empty($requests)) {
        return array(
            'has_request' => false,
            'requests' => []
        );
    }
    
    return array(
        'has_request' => true,
        'requests' => $requests
    );
}


// ============================================
// 3. ADD ADMIN MENU PAGE
// ============================================
add_action('admin_menu', 'add_return_replacement_admin_menu');

function add_return_replacement_admin_menu() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'return_replacement_requests';
    
    // Count pending requests
    $pending_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'Pending'");
    
    // Create menu title with badge
    $menu_title = 'Return Requests';
    if ($pending_count > 0) {
        $menu_title = 'Return Requests <span class="awaiting-mod count-' . $pending_count . '"><span class="pending-count">' . $pending_count . '</span></span>';
    }
    
    add_menu_page(
        'Return & Replacement Requests',      // Page title
        $menu_title,                          // Menu title with badge
        'manage_options',                      // Capability
        'return-replacement-requests',         // Menu slug
        'display_return_replacement_admin_page', // Callback function
        'dashicons-update',                    // Icon
        30                                     // Position
    );
}


// ============================================
// 4. ADMIN PAGE DISPLAY
// ============================================
function display_return_replacement_admin_page() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'return_replacement_requests';
    
    // Handle status update
    if (isset($_POST['update_status']) && isset($_POST['request_id']) && isset($_POST['new_status'])) {
        check_admin_referer('update_request_status');
        $request_id = intval($_POST['request_id']);
        $new_status = sanitize_text_field($_POST['new_status']);
        
        $wpdb->update(
            $table_name,
            array('status' => $new_status),
            array('id' => $request_id),
            array('%s'),
            array('%d')
        );
        
        echo '<div class="notice notice-success"><p>Status updated successfully!</p></div>';
    }
    
    // Handle delete
    if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['request_id'])) {
        check_admin_referer('delete_request_' . $_GET['request_id']);
        $request_id = intval($_GET['request_id']);
        $wpdb->delete($table_name, array('id' => $request_id), array('%d'));
        echo '<div class="notice notice-success"><p>Request deleted successfully!</p></div>';
    }
    
    // Get filter
    $status_filter = isset($_GET['status_filter']) ? sanitize_text_field($_GET['status_filter']) : 'all';
    
    // Fetch requests
    if ($status_filter === 'all') {
        $requests = $wpdb->get_results("SELECT * FROM $table_name ORDER BY request_date DESC");
    } else {
        $requests = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE status = %s ORDER BY request_date DESC",
            $status_filter
        ));
    }
    
    // Count by status
    $pending_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'Pending'");
    $approved_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'Approved'");
    $rejected_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'Rejected'");
    $completed_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'Completed'");
    $total_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
    
    ?>
    <div class="wrap">
        <h1 class="wp-heading-inline">
            <span class="dashicons dashicons-update" style="font-size: 32px; width: 32px; height: 32px;"></span>
            Return & Replacement Requests
        </h1>
        
        <hr class="wp-header-end">
        
        <!-- Status Filter Tabs -->
        <ul class="subsubsub">
            <li><a href="?page=return-replacement-requests&status_filter=all" <?php echo $status_filter === 'all' ? 'class="current"' : ''; ?>>All <span class="count">(<?php echo $total_count; ?>)</span></a> |</li>
            <li><a href="?page=return-replacement-requests&status_filter=Pending" <?php echo $status_filter === 'Pending' ? 'class="current"' : ''; ?>>Pending <span class="count">(<?php echo $pending_count; ?>)</span></a> |</li>
            <li><a href="?page=return-replacement-requests&status_filter=Approved" <?php echo $status_filter === 'Approved' ? 'class="current"' : ''; ?>>Approved <span class="count">(<?php echo $approved_count; ?>)</span></a> |</li>
            <li><a href="?page=return-replacement-requests&status_filter=Rejected" <?php echo $status_filter === 'Rejected' ? 'class="current"' : ''; ?>>Rejected <span class="count">(<?php echo $rejected_count; ?>)</span></a> |</li>
            <li><a href="?page=return-replacement-requests&status_filter=Completed" <?php echo $status_filter === 'Completed' ? 'class="current"' : ''; ?>>Completed <span class="count">(<?php echo $completed_count; ?>)</span></a></li>
        </ul>
        
        <br style="clear: both;">
        
        <?php if (empty($requests)): ?>
            <div class="notice notice-info">
                <p>No requests found.</p>
            </div>
        <?php else: ?>
            <style>
                .request-card {
                    background: #fff;
                    border: 1px solid #ccd0d4;
                    border-radius: 4px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 1px rgba(0,0,0,0.04);
                }
                .request-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #f0f0f1;
                    padding-bottom: 15px;
                }
                .request-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0;
                }
                .request-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .badge-return { background: #fef3cd; color: #856404; }
                .badge-replacement { background: #d1ecf1; color: #0c5460; }
                .status-badge {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .status-pending { background: #fff3cd; color: #856404; }
                .status-approved { background: #d4edda; color: #155724; }
                .status-rejected { background: #f8d7da; color: #721c24; }
                .status-completed { background: #d1ecf1; color: #0c5460; }
                .request-body {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 20px;
                }
                .request-info {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .info-row {
                    display: flex;
                    gap: 10px;
                }
                .info-label {
                    font-weight: 600;
                    min-width: 130px;
                    color: #1d2327;
                }
                .info-value {
                    color: #50575e;
                }
                .images-section {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                }
                .images-section h4 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    color: #333;
                }
                .request-images {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
                .request-image {
                    width: 100%;
                    max-width: 200px;
                    height: auto;
                    border-radius: 8px;
                    border: 2px solid #ddd;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .request-image:hover {
                    border-color: #2271b1;
                    box-shadow: 0 4px 12px rgba(34,113,177,0.3);
                    transform: scale(1.05);
                }
                .no-images {
                    color: #999;
                    font-style: italic;
                    font-size: 13px;
                }
                /* Lightbox */
                .lightbox {
                    display: none;
                    position: fixed;
                    z-index: 999999;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.95);
                    justify-content: center;
                    align-items: center;
                }
                .lightbox.active {
                    display: flex;
                }
                .lightbox img {
                    max-width: 90%;
                    max-height: 90%;
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                }
                .lightbox-close {
                    position: absolute;
                    top: 30px;
                    right: 40px;
                    font-size: 50px;
                    color: #fff;
                    cursor: pointer;
                    background: rgba(0,0,0,0.7);
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                    transition: all 0.3s;
                }
                .lightbox-close:hover {
                    background: #e74c3c;
                    transform: rotate(90deg);
                }
                .request-actions {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #f0f0f1;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .no-images {
                    color: #999;
                    font-style: italic;
                    padding: 20px;
                    text-align: center;
                    background: #f9f9f9;
                    border-radius: 4px;
                }
            </style>
            
            <!-- Lightbox Modal -->
            <div id="imageLightbox" class="lightbox" onclick="this.classList.remove('active')">
                <span class="lightbox-close">&times;</span>
                <img id="lightboxImg" src="" alt="Full size image">
            </div>
            
            <script>
                function viewImage(src) {
                    document.getElementById('lightboxImg').src = src;
                    document.getElementById('imageLightbox').classList.add('active');
                }
            </script>
            
            <?php foreach ($requests as $request): ?>
                <?php
                $images = json_decode($request->images, true);
                $status_class = 'status-' . strtolower($request->status);
                $type_class = $request->request_type === 'Return' ? 'badge-return' : 'badge-replacement';
                ?>
                
                <div class="request-card">
                    <div class="request-header">
                        <div>
                            <h3 class="request-title">
                                Request #<?php echo $request->id; ?> - 
                                <span class="request-badge <?php echo $type_class; ?>">
                                    <?php echo esc_html($request->request_type); ?>
                                </span>
                            </h3>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">
                                Submitted on <?php echo date('M d, Y - h:i A', strtotime($request->request_date)); ?>
                            </p>
                        </div>
                        <span class="status-badge <?php echo $status_class; ?>">
                            <?php echo esc_html($request->status); ?>
                        </span>
                    </div>
                    
                    <div class="request-body">
                        <div class="request-info">
                            <div class="info-row">
                                <span class="info-label">Tracking Number:</span>
                                <span class="info-value"><strong><?php echo esc_html($request->tracking_number); ?></strong></span>
                            </div>
                            
                            <?php if ($request->order_id): ?>
                            <div class="info-row">
                                <span class="info-label">Order ID:</span>
                                <span class="info-value"><?php echo esc_html($request->order_id); ?></span>
                            </div>
                            <?php endif; ?>
                            
                            <div class="info-row">
                                <span class="info-label">Reason:</span>
                                <span class="info-value"><?php echo esc_html($request->reason); ?></span>
                            </div>
                            
                            <?php if ($request->comments): ?>
                            <div class="info-row">
                                <span class="info-label">Comments:</span>
                                <span class="info-value"><?php echo nl2br(esc_html($request->comments)); ?></span>
                            </div>
                            <?php endif; ?>
                            
                            <?php if ($request->customer_name): ?>
                            <div class="info-row">
                                <span class="info-label">Customer Name:</span>
                                <span class="info-value"><?php echo esc_html($request->customer_name); ?></span>
                            </div>
                            <?php endif; ?>
                            
                            <?php if ($request->customer_email): ?>
                            <div class="info-row">
                                <span class="info-label">Email:</span>
                                <span class="info-value"><a href="mailto:<?php echo esc_attr($request->customer_email); ?>"><?php echo esc_html($request->customer_email); ?></a></span>
                            </div>
                            <?php endif; ?>
                            
                            <?php if ($request->customer_phone): ?>
                            <div class="info-row">
                                <span class="info-label">Phone:</span>
                                <span class="info-value"><a href="tel:<?php echo esc_attr($request->customer_phone); ?>"><?php echo esc_html($request->customer_phone); ?></a></span>
                            </div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="images-section">
                            <h4>📸 Uploaded Images</h4>
                            <?php 
                            $images = json_decode($request->images, true);
                            if (!empty($images) && is_array($images) && count($images) > 0): 
                            ?>
                                <div class="request-images">
                                    <?php foreach ($images as $index => $imageData): ?>
                                        <img 
                                            src="<?php echo esc_attr($imageData); ?>" 
                                            alt="Image <?php echo $index + 1; ?>" 
                                            class="request-image"
                                            onclick="viewImage('<?php echo esc_js($imageData); ?>')"
                                            title="Click to view full size"
                                        />
                                    <?php endforeach; ?>
                                </div>
                            <?php else: ?>
                                <div class="no-images">No images uploaded</div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <div class="request-actions">
                        <form method="post" style="display: inline-flex; gap: 10px; align-items: center;">
                            <?php wp_nonce_field('update_request_status'); ?>
                            <input type="hidden" name="request_id" value="<?php echo $request->id; ?>">
                            <label for="status_<?php echo $request->id; ?>" style="font-weight: 600;">Change Status:</label>
                            <select name="new_status" id="status_<?php echo $request->id; ?>" class="regular-text" style="width: auto;">
                                <option value="Pending" <?php selected($request->status, 'Pending'); ?>>Pending</option>
                                <option value="Approved" <?php selected($request->status, 'Approved'); ?>>Approved</option>
                                <option value="Rejected" <?php selected($request->status, 'Rejected'); ?>>Rejected</option>
                                <option value="Completed" <?php selected($request->status, 'Completed'); ?>>Completed</option>
                            </select>
                            <button type="submit" name="update_status" class="button button-primary">Update</button>
                        </form>
                        
                        <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=return-replacement-requests&action=delete&request_id=' . $request->id), 'delete_request_' . $request->id); ?>" 
                           class="button button-link-delete" 
                           onclick="return confirm('Are you sure you want to delete this request?');">
                            Delete
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <?php
}


// ============================================
// 5. OPTIONAL: EMAIL NOTIFICATIONS
// ============================================
function send_return_replacement_notification($request_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'return_replacement_requests';
    
    $request = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $request_id
    ));
    
    if (!$request) return;
    
    $admin_email = get_option('admin_email');
    $subject = 'New ' . $request->request_type . ' Request - #' . $request->id;
    
    $message = "A new {$request->request_type} request has been submitted.\n\n";
    $message .= "Request ID: #{$request->id}\n";
    $message .= "Tracking Number: {$request->tracking_number}\n";
    $message .= "Reason: {$request->reason}\n";
    $message .= "Customer: {$request->customer_name} ({$request->customer_email})\n\n";
    $message .= "View details: " . admin_url('admin.php?page=return-replacement-requests') . "\n";
    
    wp_mail($admin_email, $subject, $message);
}

// Uncomment to enable email notifications on new submissions
// add_action('rest_api_init', function() {
//     add_action('rest_after_insert_return_replacement', 'send_return_replacement_notification', 10, 1);
// });
