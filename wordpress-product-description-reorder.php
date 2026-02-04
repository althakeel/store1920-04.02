<?php
/**
 * WordPress Product Short Description Reordering
 * Display product short description below the title in WordPress admin product editor
 * Add this code to your WordPress theme's functions.php
 */

// Hook into the edit product page to reorder meta boxes
add_action('edit_form_after_title', 'display_short_description_after_title');

function display_short_description_after_title($post) {
    // Only show on product post type
    if ($post->post_type !== 'product') {
        return;
    }
    
    // Get the short description (product excerpt)
    $short_description = $post->post_excerpt;
    
    // Get WooCommerce product object
    $product = wc_get_product($post->ID);
    
    if (!$product) {
        return;
    }
    
    // Display the short description field below the title
    ?>
    <div class="woocommerce-product-short-description-wrapper" style="margin: 20px 0;">
        <label for="excerpt">
            <strong><?php esc_html_e('Product Short Description', 'woocommerce'); ?></strong>
        </label>
        <div style="margin-top: 8px;">
            <?php
            wp_editor(
                $short_description,
                'excerpt',
                array(
                    'textarea_rows' => 5,
                    'media_buttons' => false,
                    'teeny' => true,
                    'quicktags' => array('buttons' => 'strong,em,del,ul,ol,li,code'),
                    'editor_class' => 'product-short-description-editor',
                    'tinymce' => true,
                )
            );
            ?>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
            <?php esc_html_e('Brief product description that appears in category listings', 'woocommerce'); ?>
        </p>
    </div>
    <?php
}

// Optional: Hide the default excerpt meta box if you want it to appear only below title
add_action('add_meta_boxes', 'hide_product_excerpt_meta_box', 11);

function hide_product_excerpt_meta_box() {
    remove_meta_box('postexcerpt', 'product', 'normal');
}
?>
