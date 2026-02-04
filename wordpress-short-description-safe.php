<?php
// Safe Short Description API Fix
// Add only this to functions.php

add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
    if (!is_a($response, 'WP_REST_Response')) {
        return $response;
    }
    
    $data = $response->get_data();
    
    if (is_array($data) && $product) {
        $data['short_description'] = $product->get_short_description();
        $response->set_data($data);
    }
    
    return $response;
}, 10, 3);
?>
