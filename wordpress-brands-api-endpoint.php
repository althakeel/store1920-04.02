<?php
/**
 * Store1920 Brands API Endpoint
 * Add this code to your WordPress theme's functions.php file
 * 
 * This endpoint works with WooCommerce brands stored as:
 * - Custom Taxonomy: product_brand (default)
 * - Plugin: Perfect Brands (pb_brand taxonomy)
 * - Custom Post Type: pa_brand
 */

// --- Store1920 Brands List API Endpoint ---
add_action('rest_api_init', function () {
    register_rest_route('store1920/v1', '/brands', [
        'methods' => 'GET',
        'callback' => 'store1920_get_all_brands',
        'permission_callback' => '__return_true',
    ]);
});

function store1920_get_all_brands($data) {
    // Determine which taxonomy to use
    // Try in order: pb_brand (Perfect Brands), product_brand, pa_brand
    $taxonomies = ['pb_brand', 'product_brand', 'pa_brand'];
    $taxonomy_to_use = null;

    foreach ($taxonomies as $tax) {
        if (taxonomy_exists($tax)) {
            $taxonomy_to_use = $tax;
            break;
        }
    }

    if (!$taxonomy_to_use) {
        return new WP_Error('no_brand_taxonomy', 'No brand taxonomy found in this WooCommerce setup', ['status' => 404]);
    }

    // Get all brands
    $brands = get_terms([
        'taxonomy' => $taxonomy_to_use,
        'hide_empty' => false,
        'number' => 100,
    ]);

    if (is_wp_error($brands)) {
        return new WP_Error('brand_fetch_error', 'Error fetching brands', ['status' => 500]);
    }

    if (empty($brands)) {
        return new WP_Error('no_brands', 'No brands found', ['status' => 404]);
    }

    // Format brand data
    $formatted_brands = [];
    foreach ($brands as $brand) {
        // Get brand image/thumbnail if available
        $brand_image = null;
        $image_id = get_term_meta($brand->term_id, 'thumbnail_id', true);
        if ($image_id) {
            $brand_image = wp_get_attachment_url($image_id);
        }

        $formatted_brands[] = [
            'id' => $brand->term_id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'description' => $brand->description,
            'logo' => $brand_image,
            'count' => $brand->count,
            'link' => get_term_link($brand),
        ];
    }

    // Sort by count (most products first) or name
    usort($formatted_brands, function($a, $b) {
        return $b['count'] - $a['count'];
    });

    $response = rest_ensure_response($formatted_brands);
    // Cache for 1 hour in browser, 10 minutes on CDN
    $response->header('Cache-Control', 'public, max-age=3600, s-maxage=600');
    $response->header('Vary', 'Accept-Encoding');
    
    error_log("Store1920 API: Fetched " . count($formatted_brands) . " brands from taxonomy: " . $taxonomy_to_use);
    
    return $response;
}

// --- Store1920 Single Brand API Endpoint ---
add_action('rest_api_init', function () {
    register_rest_route('store1920/v1', '/brand/(?P<slug>[a-zA-Z0-9-_]+)', [
        'methods' => 'GET',
        'callback' => 'store1920_get_brand_by_slug',
        'permission_callback' => '__return_true',
    ]);
});

function store1920_get_brand_by_slug($data) {
    $slug = sanitize_text_field($data['slug']);
    
    // Determine which taxonomy to use
    $taxonomies = ['pb_brand', 'product_brand', 'pa_brand'];
    $taxonomy_to_use = null;

    foreach ($taxonomies as $tax) {
        if (taxonomy_exists($tax)) {
            $taxonomy_to_use = $tax;
            break;
        }
    }

    if (!$taxonomy_to_use) {
        return new WP_Error('no_brand_taxonomy', 'No brand taxonomy found', ['status' => 404]);
    }

    // Get brand by slug
    $brand = get_term_by('slug', $slug, $taxonomy_to_use);

    if (!$brand) {
        error_log("Store1920 API: No brand found for slug: " . $slug);
        return new WP_Error('brand_not_found', 'No brand found for this slug', ['status' => 404]);
    }

    // Get brand image
    $brand_image = null;
    $image_id = get_term_meta($brand->term_id, 'thumbnail_id', true);
    if ($image_id) {
        $brand_image = wp_get_attachment_url($image_id);
    }

    // Get products for this brand
    $products = get_posts([
        'post_type' => 'product',
        'posts_per_page' => 100,
        'fields' => 'ids',
        'tax_query' => [
            [
                'taxonomy' => $taxonomy_to_use,
                'field' => 'slug',
                'terms' => $slug,
            ]
        ]
    ]);

    // Get full product data
    $product_data = [];
    foreach ($products as $product_id) {
        $product = wc_get_product($product_id);
        if ($product) {
            $image = wp_get_attachment_url($product->get_image_id());
            $product_data[] = [
                'id' => $product->get_id(),
                'name' => $product->get_name(),
                'slug' => $product->get_slug(),
                'price' => $product->get_price(),
                'sale_price' => $product->get_sale_price(),
                'regular_price' => $product->get_regular_price(),
                'images' => $image ? [['src' => $image]] : [],
                'rating' => $product->get_average_rating(),
                'review_count' => $product->get_review_count(),
            ];
        }
    }

    // Format brand data
    $brand_data = [
        'id' => $brand->term_id,
        'name' => $brand->name,
        'slug' => $brand->slug,
        'description' => $brand->description,
        'logo' => $brand_image,
        'banner' => $brand_image, // Use logo as banner
        'count' => $brand->count,
        'products' => $product_data,
        'link' => get_term_link($brand),
    ];

    $response = rest_ensure_response($brand_data);
    // Cache for 30 minutes in browser, 5 minutes on CDN
    $response->header('Cache-Control', 'public, max-age=1800, s-maxage=300');
    $response->header('Vary', 'Accept-Encoding');
    
    error_log("Store1920 API: Found brand for slug " . $slug . " with ID " . $brand->term_id . " and " . count($product_data) . " products");

    return $response;
}

// --- Debug Endpoint to Check Available Brand Taxonomies ---
add_action('rest_api_init', function () {
    register_rest_route('store1920/v1', '/brands/debug', [
        'methods' => 'GET',
        'callback' => 'store1920_debug_brands',
        'permission_callback' => '__return_true',
    ]);
});

function store1920_debug_brands() {
    $taxonomies = ['pb_brand', 'product_brand', 'pa_brand'];
    $debug_data = [
        'available_taxonomies' => [],
        'detected_brand_taxonomy' => null,
    ];

    foreach ($taxonomies as $tax) {
        if (taxonomy_exists($tax)) {
            $debug_data['available_taxonomies'][] = $tax;
            if (!$debug_data['detected_brand_taxonomy']) {
                $debug_data['detected_brand_taxonomy'] = $tax;
            }

            // Get brands from this taxonomy
            $brands = get_terms([
                'taxonomy' => $tax,
                'hide_empty' => false,
                'number' => 20,
            ]);

            if (!is_wp_error($brands) && !empty($brands)) {
                $debug_data['sample_brands'] = array_map(function($b) {
                    return [
                        'id' => $b->term_id,
                        'name' => $b->name,
                        'slug' => $b->slug,
                        'count' => $b->count,
                    ];
                }, array_slice($brands, 0, 5));
            }
        }
    }

    $response = rest_ensure_response($debug_data);
    $response->header('Cache-Control', 'public, max-age=300');
    return $response;
}
?>
