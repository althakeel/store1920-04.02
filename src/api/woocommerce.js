
import axios from "axios";
// ===== Simple In-Memory Cache for Categories and Products =====
const _categoryCache = {};
const _productCache = {};

// Version identifier to track which code is running
const API_VERSION = 'v2.1-static-category-mapping';
console.log(`🔧 WooCommerce API ${API_VERSION} loaded`);

// ===== STATIC CATEGORY SLUG TO ID MAPPING =====
// This ensures the correct category is ALWAYS matched regardless of API issues
const CATEGORY_SLUG_MAP = {
  // Accessories
  'accessories': 6525,
  'bags': 6600,
  'belts': 6601,
  'body-jewelry': 6611,
  'bracelets-bangles': 6608,
  'earrings': 6607,
  'hats-headwear': 6604,
  'jewelry-watches': 6605,
  'mens-watches': 6609,
  'necklaces': 6606,
  'scarves-gloves': 6603,
  'sunglasses-eyewear': 6602,
  'womens-watches': 6610,
  
  // Automotive & Motorcycle
  'automotive-motorcycle': 6531,
  'atv-off-road-accessories': 6662,
  'car-electronics-lights': 6656,
  'car-exterior-accessories': 6658,
  'car-interior-accessories': 6657,
  'car-repair-tools': 6659,
  'car-wash-maintenance': 6655,
  'motorcycle-gear-helmets': 6660,
  'motorcycle-parts-accessories': 6661,
  
  // Baby, Kids & Maternity
  'baby-kids-maternity': 6528,
  'activity-gear-baby-carriers': 6635,
  'baby-care-hygiene': 6634,
  'baby-clothing': 6629,
  'baby-shoes-kids-shoes': 6632,
  'bed-linens': 6637,
  'feeding-nursing': 6631,
  'kids-accessories': 6636,
  'kids-clothing': 6630,
  'nursery-baby-furniture': 6633,
  
  // Beauty & Personal Care
  'beauty-personal-care': 6526,
  'dental-care-supplies': 6617,
  'hair-extensions-wigs': 6614,
  'hair-tools-accessories': 6615,
  'makeup-cosmetics': 6612,
  'massage-relaxation': 6616,
  'skincare-haircare': 6613,
  'tattoo-body-art': 6618,
  
  // Electronics & Smart Devices
  'electronics-smart-devices': 498,
  'cameras-photography': 6541,
  'computer-components-desktops': 6543,
  'games-gaming-accessories': 6542,
  'home-audio-video': 6539,
  'laptops-tablets': 6544,
  'mobile-phones': 6535,
  'networking-communication': 6545,
  'phone-accessories': 6536,
  'phone-parts-repair': 6537,
  'portable-audio-video': 6540,
  'smart-electronics-smart-home': 6538,
  'wearable-tech': 6546,
  
  // Furniture & Home Living
  'furniture-home-living': 6521,
  'bedding-linens': 6570,
  'bedroom-furniture': 6565,
  'dining-room-furniture': 6567,
  'home-office-essentials': 6571,
  'kitchen-dining-furniture': 6572,
  'living-room-furniture': 6566,
  'office-furniture': 6568,
  'outdoor-furniture': 6569,
  'storage-organization': 6573,
  
  // Home Appliances
  'home-appliances': 6519,
  'air-quality-purifiers': 6551,
  'cleaning-appliances': 6548,
  'heating-cooling-appliances': 6550,
  'household-appliances': 6553,
  'kitchen-appliances': 6547,
  'laundry-appliances': 6549,
  'personal-care-appliances': 6552,
  
  // Home Improvement & Tools
  'home-improvement-tools': 6520,
  'bathroom-fixtures-accessories': 6558,
  'electrical-equipment-supplies': 6555,
  'gardening-tools-supplies': 6564,
  'hand-tools-power-tools': 6561,
  'hardware-tools-fasteners': 6556,
  'lighting-light-bulbs': 6559,
  'measurement-analysis-tools': 6562,
  'painting-supplies-wall-treatments': 6557,
  'plumbing-supplies': 6554,
  'smart-home-devices': 6560,
  'welding-industrial-equipment': 6563,
  
  // Lingerie & Loungewear
  'lingerie-loungewear': 6524,
  'bras-panties': 6594,
  'mens-underwear': 6598,
  'new-arrivals-lingerie-loungewear': 6599,
  'shapewear': 6595,
  'sleep-lounge': 6596,
  'socks-hosiery': 6597,
  
  // Men's Clothing
  'mens-clothing': 6522,
  'blazers-suits': 6578,
  'clothing-sets': 6581,
  'jackets-outerwear': 6576,
  'new-arrivals': 6582,
  'pants-jeans': 6575,
  'shorts': 6579,
  'sweaters-hoodies': 6577,
  't-shirts-shirts': 6574,
  'winter-wear-down-jackets': 6580,
  
  // Pet Supplies
  'pet-supplies': 6533,
  'birds': 6673,
  'cats': 6671,
  'dogs': 6670,
  'farm-animals': 6676,
  'fish-aquatic-pets': 6672,
  'reptiles-amphibians': 6675,
  'small-animals': 6674,
  
  // Security & Safety
  'security-safety': 6532,
  'access-control-systems': 6664,
  'alarm-sensors': 6668,
  'emergency-kits-self-defense': 6667,
  'home-safes-security-accessories': 6666,
  'intercom-systems': 6669,
  'video-surveillance-systems': 6663,
  'workplace-safety-supplies': 6665,
  
  // Shoes & Footwear
  'shoes-footwear': 6527,
  'business-shoes': 6627,
  'mens-boots': 6626,
  'mens-casual-shoes': 6624,
  'mens-sandals-slippers': 6625,
  'pumps-heels': 6621,
  'shoe-accessories': 6628,
  'womens-boots': 6619,
  'womens-casual-shoes': 6623,
  'womens-sandals-slippers': 6620,
  'womens-sandals-slippers-shoes-footwear': 6622,
  
  // Special Occasion & Costumes
  'special-occasion-costumes': 6534,
  'cosplay-costumes': 6677,
  'cultural-traditional-clothing': 6679,
  'dancewear-stage-outfits': 6678,
  'workwear-uniforms': 6680,
  
  // Sports, Outdoors & Hobbies
  'sports-outdoors-hobbies': 6530,
  'cardio-training-equipment': 6652,
  'cycling-biking': 6649,
  'fishing-kayaking': 6648,
  'hiking-camping': 6647,
  'hobby-collectibles': 6654,
  'musical-instruments': 6653,
  'racquet-sports': 6650,
  'strength-training-gym-equipment': 6651,
  
  // Toys, Games & Entertainment
  'toys-games-entertainment': 6529,
  'action-figures-collectibles': 6642,
  'building-construction-sets': 6641,
  'dolls-accessories': 6639,
  'electronic-toys': 6645,
  'kids-gifts': 6646,
  'learning-educational-toys': 6638,
  'pools-water-activities': 6644,
  'remote-control-toys': 6640,
  'sports-outdoor-toys': 6643,
  
  // Women's Clothing
  'womens-clothing': 6523,
  'bottoms-skirts-pants': 6586,
  'curve-plus-size-clothing': 6588,
  'dresses-gowns': 6584,
  'matching-sets': 6592,
  'new-arrivals-womens-clothing': 6593,
  'outerwear-jackets': 6587,
  'special-occasion-dresses': 6591,
  'swimwear': 6589,
  'tops-blouses': 6585,
  'wedding-dresses': 6590,
  
  // Other Categories
  'new': 29687,
  'rating': 29685,
  'recommended': 29688,
  'season-sale': 29654,
  'topseliing': 29686
};

// Clear cache function (useful for debugging)
export const clearCategoryCache = () => {
  Object.keys(_categoryCache).forEach(key => delete _categoryCache[key]);
  Object.keys(_productCache).forEach(key => delete _productCache[key]);
  console.log('✅ Cache cleared');
};

export const API_BASE = "https://db.store1920.com/wp-json/wc/v3";
export const CONSUMER_KEY = "ck_8dfeb134379e51fa95e3a22769f67bd6b4f0e507";
export const CONSUMER_SECRET = "cs_2e5da71434cc874771a8ab0ef2dae2ffef3591c0";
const SHORT_DESC_API_BASE = "https://db.store1920.com/wp-json/store1920/v1/product";

const authParams = `consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

const hasMeaningfulHtml = (html) => {
  if (!html) return false;
  const text = String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|\s+/g, '')
    .trim();
  return text.length > 0;
};

const enrichWithShortDescription = async (product) => {
  if (!product?.id) return product;
  if (hasMeaningfulHtml(product.short_description)) return product;

  try {
    const response = await axios.get(`${SHORT_DESC_API_BASE}/${product.id}`);
    const data = response?.data;
    if (data?.short_description) {
      return { ...product, short_description: data.short_description };
    }
  } catch (error) {
    console.warn('⚠️ Short description fetch failed:', error?.message || error);
  }

  return product;
};

// ===================== Generic Fetch =====================
export async function fetchAPI(endpoint) {
  try {
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${API_BASE}${endpoint}${separator}${authParams}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("fetchAPI error:", error);
    return null;
  }
}

// ===================== Categories =====================
export const getCategoryById = (id) => fetchAPI(`/products/categories/${id}`);
export const getCategoryBySlug = async (slug) => {
  console.log('🔍 getCategoryBySlug called with slug:', slug);
  const url = `/products/categories?slug=${slug}&hide_empty=false`;
  console.log('🌐 API URL:', `${API_BASE}${url}`);
  const result = await fetchAPI(url);
  console.log('📦 getCategoryBySlug raw result:', result);
  console.log('📦 Result is array?:', Array.isArray(result), 'Length:', result?.length);
  if (result && Array.isArray(result) && result.length > 0) {
    console.log('✅ Found category:', result[0].name, 'ID:', result[0].id, 'Slug:', result[0].slug);
  }
  return result;
};
export const getChildCategories = (parentId) => fetchAPI(`/products/categories?parent=${parentId}`);
export const getCategories = async () => {
  console.log('🔍 Fetching all categories...');
  const result = await fetchAPI(`/products/categories?per_page=100&hide_empty=false`);
  console.log('📦 All categories count:', result?.length);
  if (result && result.length > 0) {
    console.log('📋 First 10 category slugs:', result.slice(0, 10).map(c => `"${c.slug}" (${c.name})`).join(', '));
  }
  return result;
};


// ===================== Enhanced Category Fetching by Slug =====================
export const getCategoryBySlugAdvanced = async (slug) => {
  try {
    console.log('=== Starting category fetch for slug:', slug, '===');
    
    // PRIORITY 1: Check static mapping FIRST (100% reliable)
    if (CATEGORY_SLUG_MAP[slug]) {
      const categoryId = CATEGORY_SLUG_MAP[slug];
      console.log('✅ STATIC MAPPING FOUND! Slug:', slug, '-> ID:', categoryId);
      
      // Fetch the full category object by ID
      try {
        const category = await getCategoryById(categoryId);
        if (category) {
          console.log('✅ Category loaded:', category.name, 'ID:', category.id);
          return category;
        }
      } catch (error) {
        console.error('Error fetching category by ID:', categoryId, error.message);
      }
    } else {
      console.log('⚠️ No static mapping for slug:', slug);
    }
    
    // PRIORITY 2: Fetch ALL categories and search locally
    console.log('Step 2: Fetching all categories for local search...');
    try {
      const allCategories = await getCategories();
      console.log('Total categories fetched:', allCategories?.length);
      
      if (allCategories && Array.isArray(allCategories) && allCategories.length > 0) {
        console.log('Sample slugs:', allCategories.slice(0, 5).map(c => c.slug).join(', '));
        
        // Try exact slug match
        let matchedCategory = allCategories.find(c => c.slug === slug);
        
        if (matchedCategory) {
          console.log('SUCCESS - Exact match found!');
          console.log('Category:', matchedCategory.name);
          console.log('ID:', matchedCategory.id);
          console.log('Slug:', matchedCategory.slug);
          return matchedCategory;
        }
        
        console.log('No exact match for "' + slug + '", trying partial match...');
        
        // Try partial slug match
        matchedCategory = allCategories.find(c => 
          c.slug.includes(slug) || slug.includes(c.slug)
        );
        
        if (matchedCategory) {
          console.log('SUCCESS - Partial match found:', matchedCategory.name, 'ID:', matchedCategory.id);
          return matchedCategory;
        }
        
        console.log('No partial match, trying name match...');
        
        // Try name match
        const searchName = slug.replace(/-/g, ' ').toLowerCase();
        matchedCategory = allCategories.find(c => 
          c.name.toLowerCase().includes(searchName) ||
          searchName.includes(c.name.toLowerCase())
        );
        
        if (matchedCategory) {
          console.log('SUCCESS - Name match found:', matchedCategory.name, 'ID:', matchedCategory.id);
          return matchedCategory;
        }
        
        console.log('ERROR: No category found for slug:', slug);
        console.log('Available slugs include:', allCategories.slice(0, 20).map(c => c.slug).join(', '));
      }
    } catch (searchError) {
      console.error('Error in local category search:', searchError.message);
    }
    
    console.log('=== No category found ===');
    return null;
    
  } catch (error) {
    console.error('FATAL ERROR in getCategoryBySlugAdvanced:', error);
    return null;
  }
};

// ===================== Products =====================
export const getProductsByCategory = (categoryId, page = 1, perPage = 42) =>
  // Remove _fields to allow custom fields like enable_saving_badge
  fetchAPI(`/products?category=${categoryId}&per_page=${perPage}&page=${page}&orderby=date&order=desc`);

// ===================== Enhanced Products by Category Slug =====================
export const getProductsByCategorySlugAdvanced = async (slug, page = 1, perPage = 8) => {
  try {
    console.log('🎯 getProductsByCategorySlugAdvanced called - slug:', slug, 'page:', page);
    
    // Check cache for category (only use cache after initial fetch)
    let category = null;
    
    // Always fetch fresh on page 1 to ensure we have the right category
    if (page === 1) {
      console.log('🔄 Page 1 - fetching fresh category data');
      category = await getCategoryBySlugAdvanced(slug);
      if (category && category.id) {
        _categoryCache[slug] = category;
        console.log('✅ Cached category:', category.name, 'ID:', category.id);
      }
    } else {
      // Use cache for subsequent pages
      category = _categoryCache[slug];
      if (!category) {
        console.log('⚠️ No cached category, fetching fresh');
        category = await getCategoryBySlugAdvanced(slug);
        if (category && category.id) _categoryCache[slug] = category;
      }
    }
    
    if (!category || !category.id) {
      console.log('❌ No category found for slug:', slug);
      return { products: [], category: null, hasMore: false };
    }

    console.log('✅ Using category:', category.name, 'ID:', category.id);

    // Cache key for products
    const cacheKey = `${category.id}_${page}_${perPage}`;
    if (_productCache[cacheKey]) {
      console.log('📦 Using cached products for key:', cacheKey);
      return { products: _productCache[cacheKey], category, hasMore: _productCache[cacheKey].length >= perPage };
    }

    // Fetch products for this category
    console.log('🔍 Fetching products for category ID:', category.id);
    const products = await getProductsByCategory(category.id, page, perPage);
    console.log('📦 Fetched products count:', products?.length);
    
    if (products) _productCache[cacheKey] = products;
    const hasMore = products && products.length >= perPage;
    return {
      products: products || [],
      category: category,
      hasMore: hasMore
    }; 
  } catch (error) {
    console.error('❌ Error in getProductsByCategorySlugAdvanced:', error);
    return { products: [], category: null, hasMore: false };
  }
};

export const getProductsByCategories = async (categoryIds = [], page = 1, perPage = 12, order = "desc") => {
  if (!Array.isArray(categoryIds) || !categoryIds.length) return [];
  try {
    const products = await fetchAPI(`/products?category=${categoryIds.join(",")}&per_page=${perPage}&page=${page}&orderby=date&order=${order}`);
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('❌ Error fetching products by categories:', error);
    return [];
  }
};

export const getProductBySlug = async (slug) => {
  const data = await fetchAPI(`/products?slug=${slug}&_fields=id,name,slug,images,price,regular_price,sale_price,stock_status,stock_quantity,manage_stock,is_in_stock,average_rating,review_count,short_description,description,attributes,upsell_ids,cross_sell_ids,variations,sku,total_sales,subtitle`);
  const product = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return enrichWithShortDescription(product);
};

export const getShortDescriptionBySlug = async (slug) => {
  if (!slug) return '';
  const data = await fetchAPI(`/products?slug=${slug}&_fields=short_description`);
  if (Array.isArray(data) && data.length > 0 && data[0]?.short_description) {
    return data[0].short_description || '';
  }

  try {
    const wpV2 = await axios.get(
      `https://db.store1920.com/wp-json/wp/v2/product?slug=${encodeURIComponent(slug)}&_fields=excerpt`
    );
    const wpData = wpV2?.data;
    if (Array.isArray(wpData) && wpData.length > 0) {
      return wpData[0]?.excerpt?.rendered || '';
    }
  } catch (error) {
    console.warn('⚠️ WP v2 excerpt fetch failed:', error?.message || error);
  }

  return '';
};

export const getProductById = async (id) => {
  const product = await fetchAPI(`/products/${id}?_fields=id,name,slug,images,price,regular_price,sale_price,stock_status,stock_quantity,manage_stock,is_in_stock,average_rating,review_count,short_description,description,attributes,upsell_ids,cross_sell_ids,variations,sku,total_sales,subtitle`);
  return enrichWithShortDescription(product);
};
export const searchProducts = (term) => fetchAPI(`/products?search=${encodeURIComponent(term)}`);
export const getProductsByIds = (ids = []) => {
  if (!Array.isArray(ids) || !ids.length) return [];
  return fetchAPI(`/products?include=${ids.join(",")}`);
};

// ===================== Tags =====================
export const getTagIdsBySlugs = async (slugs = []) => {
  if (!slugs.length) return [];
  const allTags = await fetchAPI("/products/tags?per_page=100");
  if (!allTags || !Array.isArray(allTags)) return [];
  return slugs
    .map((slug) => allTags.find((t) => t.slug.toLowerCase() === slug.toLowerCase())?.id)
    .filter(Boolean);
};

export const getProductsByTagSlugs = async (slugs = [], page = 1, perPage = 42, orderBy = "date", order = "desc") => {
  const tagIds = await getTagIdsBySlugs(slugs);
  if (!tagIds.length) return [];
  const url = `/products?tag=${tagIds.join(",")}&per_page=${perPage}&page=${page}&orderby=${orderBy}&order=${order}&_fields=id,name,slug,images,price,total_sales,enable_saving_badge
`;
  return fetchAPI(url);
};

// ===================== Specific Tag-based Products =====================
export const getNewArrivalsProducts = (page = 1, perPage = 24) => getProductsByTagSlugs(["new-arrivals"], page, perPage);
export const getRatedProducts = (page = 1, perPage = 24) => getProductsByTagSlugs(["rated"], page, perPage, "rating");
export const getFestSaleProducts = (page = 1, perPage = 24) => getProductsByTagSlugs(["fest-sale"], page, perPage);
// Use Woo's supported alias 'popularity' (maps to total_sales)
export const getTopSellingItemsProducts = (page = 1, perPage = 24) =>
  getProductsByTagSlugs(["top-selling"], page, perPage, "popularity");

// Fallback: get popular products irrespective of tag
export const getPopularProducts = (page = 1, perPage = 24) =>
  fetchAPI(`/products?per_page=${perPage}&page=${page}&orderby=popularity&order=desc&_fields=id,name,slug,images,price,total_sales,enable_saving_badge`);

// ===================== Variations =====================
export const getFirstVariation = async (productId) => {
  try {
    const data = await fetchAPI(`/products/${productId}/variations?per_page=1`);
    return data?.[0] || null;
  } catch (err) {
    console.error("getFirstVariation error:", err);
    return null;
  }
};

// ===================== Currency =====================
export const getCurrencySymbol = async () => {
  try {
    const res = await fetch(`${API_BASE}/settings?${authParams}`);
    const data = await res.json();
    return data?.currency_symbol || "AED";
  } catch {
    return "AED";
  }
};

// ===================== Reviews =====================
// export const getProductReviews = (productId, perPage = 20) =>
//   fetchAPI(`/products/${productId}/reviews?per_page=${perPage}`);

// export const addProductReview = async (productId, { review, reviewer, reviewer_email, rating = 5 }) => {
//   try {
//     const res = await fetch(`${API_BASE}/products/${productId}/reviews?${authParams}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ review, reviewer, reviewer_email, rating }),
//     });
//     if (!res.ok) throw new Error(`Failed to submit review: ${res.status}`);
//     return await res.json();
//   } catch {
//     return null;
//   }
// };

// ===================== Other APIs =====================
export const getFastProducts = async (limit = 4) => {
  try {
    const res = await fetch(`https://db.store1920.com/wp-json/custom/v1/fast-products`);
    if (!res.ok) throw new Error("Fast products API error");
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, limit) : [];
  } catch (err) {
    console.error("getFastProducts error:", err);
    return [];
  }
};

export const getPromo = async () => {
  try {
    const res = await fetch(`${API_BASE}/custom/v1/promo`);
    if (!res.ok) throw new Error("Promo API error");
    return await res.json();
  } catch {
    return null;
  }
};

// ===================== Orders =====================
export const getOrderById = async (orderId) => {
  if (!orderId) return null;
  
  try {
    // Fetch the order data
    const order = await fetchAPI(`/orders/${orderId}`);
    if (!order) return null;

    // Enhance line items with product images
    const enhancedLineItems = await Promise.all(
      order.line_items.map(async (item) => {
        try {
          // Fetch product details to get images
          const product = await fetchAPI(`/products/${item.product_id}`);
          return {
            ...item,
            image: product?.images?.[0] || null
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product_id}:`, error);
          return item;
        }
      })
    );

    return {
      ...order,
      line_items: enhancedLineItems
    };
  } catch (error) {
    console.error("getOrderById error:", error);
    return null;
  }
};

export const getOrdersByEmail = (email, perPage = 20) =>
  email ? fetchAPI(`/orders?customer=${email}&per_page=${perPage}&orderby=date&order=desc`) : [];

// ===================== Top Sold Products =====================
export const getTopSoldProducts = async (hours = 24, limit = 5) => {
  // Some WooCommerce installs do not support orderby=total_sales or date_modified_min.
  // We try a compatibility chain: popularity -> rating -> recent.
  const attempts = [
    `${API_BASE}/products?per_page=${limit}&orderby=popularity&order=desc&status=publish&${authParams}`,
    `${API_BASE}/products?per_page=${limit}&orderby=rating&order=desc&status=publish&${authParams}`,
    `${API_BASE}/products?per_page=${limit}&orderby=date&order=desc&status=publish&${authParams}`,
  ];

  for (const url of attempts) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        // Read response text to aid debugging, but keep going to next attempt
        const txt = await res.text().catch(() => '');
        console.warn(`getTopSoldProducts attempt failed: ${url} -> ${res.status} ${txt}`);
        continue;
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    } catch (err) {
      console.warn(`getTopSoldProducts network error for ${url}:`, err?.message || err);
      continue;
    }
  }

  // Final fallback: return empty list
  return [];
};
// ===================== New: Products by Category Slug =====================
export const getProductsByCategorySlug = async (slug, page = 1, perPage = 42, order = "desc") => {
  try {
    // 1️⃣ Get category by slug
    const categories = await getCategoryBySlug(slug);
    if (!categories?.length) return [];

    const parentCategory = categories[0];

    // 2️⃣ Get child categories
    const children = await getChildCategories(parentCategory.id);
    const categoryIds = [parentCategory.id, ...(children?.map(c => c.id) || [])];

    if (!categoryIds.length) return [];

    // 3️⃣ Get products for all category IDs
    const products = await getProductsByCategories(categoryIds, page, perPage, order);
    return products || [];
  } catch (err) {
    console.error("getProductsByCategorySlug error:", err);
    return [];
  }
};

export const getLightProductsByCategories = (categoryIds = [], page = 1, perPage = 42, order = "desc") => {
  if (!Array.isArray(categoryIds) || !categoryIds.length) return [];
  return fetchAPI(
    `/products?category=${categoryIds.join(",")}&per_page=${perPage}&page=${page}&orderby=date&order=${order}&_fields=id,name,slug,price,images`
  );
};
export const getLightProductsByCategorySlug = async (slug, page = 1, perPage = 42, order = "desc") => {
  try {
    // 1️⃣ Get category by slug
    const categories = await getCategoryBySlug(slug);
    if (!categories?.length) return [];

    const parentCategory = categories[0];

    // 2️⃣ Get child categories
    const children = await getChildCategories(parentCategory.id);
    const categoryIds = [parentCategory.id, ...(children?.map(c => c.id) || [])];

    if (!categoryIds.length) return [];

    // 3️⃣ Fetch only lightweight product data
    const products = await getLightProductsByCategories(categoryIds, page, perPage, order);

    // 4️⃣ Limit images to first 2
    return (products || []).map((p) => ({
      ...p,
      images: p.images ? p.images.slice(0, 2) : [],
    }));
  } catch (err) {
    console.error("getLightProductsByCategorySlug error:", err);
    return [];
  }
};