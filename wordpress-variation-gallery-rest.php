<?php
/**
 * Expose variation gallery images in WooCommerce REST API responses.
 *
 * Add this file's contents to your theme's functions.php or a small custom plugin.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!function_exists('store1920_normalize_variation_gallery_ids')) {
    function store1920_normalize_variation_gallery_ids($raw_value) {
        if (empty($raw_value)) {
            return array();
        }

        if (is_array($raw_value)) {
            $ids = $raw_value;
        } else {
            $decoded = json_decode($raw_value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $ids = $decoded;
            } else {
                $ids = preg_split('/[\s,|]+/', (string) $raw_value);
            }
        }

        $ids = array_map('absint', (array) $ids);
        $ids = array_values(array_filter($ids));

        return $ids;
    }
}

if (!function_exists('store1920_get_variation_gallery_ids')) {
    function store1920_get_variation_gallery_ids($variation_id) {
        $candidate_meta_keys = array(
            'woo_variation_gallery_images',
            'variation_gallery_images',
            'variation_image_gallery',
            'product_variation_gallery',
            'rtwpvg_images',
            'wavi_value',
            'wdmWooVariationGallery',
            '_wc_additional_variation_images',
            'woodmart_additional_variation_images_data',
        );

        foreach ($candidate_meta_keys as $meta_key) {
            $raw_value = get_post_meta($variation_id, $meta_key, true);
            $ids = store1920_normalize_variation_gallery_ids($raw_value);
            if (!empty($ids)) {
                return $ids;
            }
        }

        return array();
    }
}

if (!function_exists('store1920_map_attachment_to_rest_image')) {
    function store1920_map_attachment_to_rest_image($attachment_id) {
        $src = wp_get_attachment_image_url($attachment_id, 'full');
        if (!$src) {
            return null;
        }

        return array(
            'id' => $attachment_id,
            'src' => $src,
            'name' => get_the_title($attachment_id),
            'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
        );
    }
}

if (!function_exists('store1920_add_variation_gallery_to_rest')) {
    function store1920_add_variation_gallery_to_rest($response, $variation, $request) {
        if (!is_object($variation) || !method_exists($variation, 'get_id')) {
            return $response;
        }

        $variation_id = $variation->get_id();
        $gallery_ids = store1920_get_variation_gallery_ids($variation_id);
        $gallery_images = array_values(array_filter(array_map('store1920_map_attachment_to_rest_image', $gallery_ids)));

        $response->data['gallery_images'] = $gallery_images;
        $response->data['variation_gallery_images'] = $gallery_images;

        return $response;
    }

    add_filter('woocommerce_rest_prepare_product_variation_object', 'store1920_add_variation_gallery_to_rest', 25, 3);
}

if (!function_exists('store1920_build_variation_gallery_payload')) {
    function store1920_build_variation_gallery_payload($variation_id) {
        $variation = wc_get_product($variation_id);
        if (!$variation || !is_a($variation, 'WC_Product_Variation')) {
            return null;
        }

        $main_image = null;
        $image_id = $variation->get_image_id();
        if ($image_id) {
            $main_image = store1920_map_attachment_to_rest_image($image_id);
        }

        $gallery_ids = store1920_get_variation_gallery_ids($variation_id);
        $gallery_images = array_values(array_filter(array_map('store1920_map_attachment_to_rest_image', $gallery_ids)));

        if ($main_image) {
            array_unshift($gallery_images, $main_image);
            $gallery_images = array_values(array_filter($gallery_images, function($image, $index) use ($gallery_images) {
                if (!$image || empty($image['src'])) {
                    return false;
                }

                foreach ($gallery_images as $previous_index => $previous_image) {
                    if ($previous_index >= $index) {
                        break;
                    }
                    if (!empty($previous_image['src']) && $previous_image['src'] === $image['src']) {
                        return false;
                    }
                }

                return true;
            }, ARRAY_FILTER_USE_BOTH));
        }

        return array(
            'id' => $variation->get_id(),
            'image' => $main_image,
            'gallery_images' => $gallery_images,
            'variation_gallery_images' => $gallery_images,
            'attributes' => $variation->get_attributes(),
            'sku' => $variation->get_sku(),
        );
    }
}

if (!function_exists('store1920_register_variation_gallery_endpoint')) {
    function store1920_register_variation_gallery_endpoint() {
        register_rest_route('store1920/v1', '/products/(?P<id>\d+)/variation-galleries', array(
            'methods' => 'GET',
            'callback' => 'store1920_get_variation_galleries',
            'permission_callback' => '__return_true',
        ));
    }

    add_action('rest_api_init', 'store1920_register_variation_gallery_endpoint');
}

if (!function_exists('store1920_get_variation_galleries')) {
    function store1920_get_variation_galleries($request) {
        $product_id = absint($request['id']);
        $product = wc_get_product($product_id);

        if (!$product || !$product->is_type('variable')) {
            return rest_ensure_response(array());
        }

        $variation_ids = $product->get_children();
        $payload = array_values(array_filter(array_map('store1920_build_variation_gallery_payload', $variation_ids)));

        return rest_ensure_response($payload);
    }
}
