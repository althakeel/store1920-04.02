import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/New.css';
import { useCart } from '../contexts/CartContext';
import MiniCart from '../components/MiniCart';

import AddCarticon from '../assets/images/addtocart.png';
import AddedToCartIcon from '../assets/images/added-cart.png';
import Adsicon from '../assets/images/summer-saving-coloured.png';
import IconAED from '../assets/images/Dirham 2.png';
import ProductCardReviews from '../components/temp/productcardreviews';
import NoImagePlaceholder from './NoImagePlaceholder';

import { getProductsByCategory, getFirstVariation, getCurrencySymbol, getPopularProducts } from '../api/woocommerce';
// Set this to your actual 'topselling' category ID from WooCommerce
const TOPSELLING_CATEGORY_ID = 29686;

const PRODUCTS_PER_PAGE = 24;
const TITLE_LIMIT = 35;
const INITIAL_LOAD = 12; // Load only 12 products initially for faster LCP
const FALLBACK_RANDOM_COUNT = 20;
const FALLBACK_FETCH_SIZE = 60;

// ===================== Utility functions =====================
const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};
const truncate = (str) => (str?.length <= TITLE_LIMIT ? str : `${str.slice(0, TITLE_LIMIT)}…`);

// ===================== Skeleton Loader =====================
const SkeletonCard = () => (
  <div className="pcus-prd-card pcus-skeleton">
    <div className="pcus-prd-image-skel" />
    <div className="pcus-prd-info-skel">
      <div className="pcus-prd-title-skel" />
      <div className="pcus-prd-review-skel" />
      <div className="pcus-prd-price-cart-skel" />
    </div>
  </div>
);

// ===================== Main Component =====================
const New = () => {
  // For deferred review loading (LCP optimization)
  const [showReviews, setShowReviews] = useState(new Set([0, 1, 2, 3])); // Show first 4 immediately
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const cartIconRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [variationPrices, setVariationPrices] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('AED');
  const [productsPage, setProductsPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [usingFallbackProducts, setUsingFallbackProducts] = useState(false);




  

  // ===================== Fetch currency =====================
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const symbol = await getCurrencySymbol();
        setCurrencySymbol(symbol || 'AED');
      } catch (error) {
        console.error('Failed to fetch currency symbol:', error);
        setCurrencySymbol('AED');
      }
    };
    fetchCurrency();
  }, []);


  // ===================== Fetch products OPTIMIZED =====================
  const loadFallbackProducts = useCallback(async () => {
    try {
      const data = await getPopularProducts(1, FALLBACK_FETCH_SIZE);
      const validData = Array.isArray(data) ? data : [];
      const randomProducts = shuffleArray(validData).slice(0, FALLBACK_RANDOM_COUNT);

      setProducts(randomProducts);
      setProductsPage(1);
      setHasMoreProducts(false);
      setUsingFallbackProducts(true);
      setInitialLoadDone(true);
    } catch (error) {
      console.error('Error fetching fallback products:', error);
      setProducts([]);
      setHasMoreProducts(false);
    }
  }, []);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoadingProducts(true);
    try {
      const perPage = page === 1 ? INITIAL_LOAD : PRODUCTS_PER_PAGE;
      const data = await getProductsByCategory(TOPSELLING_CATEGORY_ID, page, perPage);
      const validData = Array.isArray(data) ? data : [];

      if (page === 1 && validData.length === 0) {
        await loadFallbackProducts();
        return;
      }
      
      setProducts(prev => page === 1 ? validData : [...prev, ...validData]);
      setHasMoreProducts(validData.length >= perPage);
      setUsingFallbackProducts(false);
      
      if (page === 1) {
        setInitialLoadDone(true);
        // Load remaining products in background after initial render
        setTimeout(() => {
          if (validData.length >= INITIAL_LOAD) {
            fetchMoreInBackground();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      await loadFallbackProducts();
    } finally {
      setLoadingProducts(false);
    }
  }, [loadFallbackProducts]);

  // Background fetch for remaining first page products
  const fetchMoreInBackground = async () => {
    try {
      const data = await getProductsByCategory(TOPSELLING_CATEGORY_ID, 1, PRODUCTS_PER_PAGE);
      const validData = Array.isArray(data) ? data : [];
      if (validData.length > 0) {
        setProducts(validData);
      }
    } catch (error) {
      console.error('Error fetching more products:', error);
    }
  };



  useEffect(() => {
    fetchProducts(1);
    setProductsPage(1);
  }, [fetchProducts]);

  // Defer reviews progressively - optimized
  useEffect(() => {
    if (!initialLoadDone || products.length === 0) return;
    
    const filtered = products.filter(p => {
      const hasImage = Array.isArray(p.images) && p.images.length > 0 && p.images[0]?.src;
      const isVariable = p.type === 'variable';
      const variationPriceInfo = variationPrices[p.id] || {};
      const price = isVariable ? variationPriceInfo.price : p.price || p.regular_price || 0;
      return hasImage && parseFloat(price) > 0;
    });

    // Show reviews gradually - much faster
    const timeout = setTimeout(() => {
      const newSet = new Set(showReviews);
      for (let i = 4; i < Math.min(filtered.length, 24); i++) {
        newSet.add(i);
      }
      setShowReviews(newSet);
    }, 300);

    return () => clearTimeout(timeout);
  }, [initialLoadDone, products.length]);

  // Optimized variation price fetching - only fetch visible products
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    const visibleProducts = products.slice(0, PRODUCTS_PER_PAGE);
    const variableProducts = visibleProducts.filter(p => p.type === 'variable' && !variationPrices[p.id]);
    
    // Batch fetch variations - max 5 at a time to avoid overwhelming
    const batchSize = 5;
    for (let i = 0; i < variableProducts.length; i += batchSize) {
      const batch = variableProducts.slice(i, i + batchSize);
      setTimeout(() => {
        batch.forEach(p => fetchFirstVariationPrice(p.id));
      }, i * 100); // Stagger batches
    }
  }, [products.length]);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const hasImage = Array.isArray(p.images) && p.images.length > 0 && p.images[0]?.src;
      const isVariable = p.type === 'variable';
      const variationPriceInfo = variationPrices[p.id] || {};
      const price = isVariable ? variationPriceInfo.price : p.price || p.regular_price || 0;
      return hasImage && parseFloat(price) > 0;
    });
  }, [products, variationPrices]);

  // Optimized Load More
  const loadMoreProducts = useCallback(() => {
    if (!hasMoreProducts || loadingProducts || usingFallbackProducts) return;
    const nextPage = productsPage + 1;
    setProductsPage(nextPage);
    setLoadingProducts(true);
    
    getProductsByCategory(TOPSELLING_CATEGORY_ID, nextPage, PRODUCTS_PER_PAGE)
      .then((data) => {
        const validData = Array.isArray(data) ? data : [];
        setProducts(prev => [...prev, ...validData]);
        setHasMoreProducts(validData.length >= PRODUCTS_PER_PAGE);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setHasMoreProducts(false);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, [hasMoreProducts, loadingProducts, productsPage, usingFallbackProducts]);

  // ===================== Fetch first variation prices - OPTIMIZED =====================
  const fetchFirstVariationPrice = useCallback(async (productId) => {
    try {
      const variation = await getFirstVariation(productId);
      if (variation) {
        setVariationPrices((prev) => ({
          ...prev,
          [productId]: {
            price: variation.price,
            regular_price: variation.regular_price,
            sale_price: variation.sale_price,
          },
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch variation for product ${productId}:`, error);
    }
  }, []);

  // ===================== Handle product click =====================
  const onProductClick = useCallback((slug, id) => {
    try {
      let recent = JSON.parse(localStorage.getItem('recentProducts')) || [];
      recent = recent.filter((rid) => rid !== id);
      recent.unshift(id);
      localStorage.setItem('recentProducts', JSON.stringify(recent.slice(0, 5)));
    } catch (e) {
      console.error('Error updating recent products:', e);
    }
    window.open(`/product/${slug}`, '_blank', 'noopener,noreferrer');
  }, []);

  // ===================== Fly to cart animation - OPTIMIZED =====================
  const flyToCart = useCallback((e, imgSrc) => {
    if (!cartIconRef.current || !imgSrc) return;

    const cartRect = cartIconRef.current.getBoundingClientRect();
    const startRect = e.currentTarget.getBoundingClientRect();

    const clone = document.createElement('img');
    clone.src = imgSrc;
    Object.assign(clone.style, {
      position: 'fixed',
      zIndex: 9999,
      width: '60px',
      height: '60px',
      top: `${startRect.top}px`,
      left: `${startRect.left}px`,
      transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      borderRadius: '50%',
      pointerEvents: 'none',
    });
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.top = `${cartRect.top}px`;
        clone.style.left = `${cartRect.left}px`;
        clone.style.opacity = '0';
        clone.style.transform = 'scale(0.2)';
      });
    });

    setTimeout(() => clone.remove(), 750);
  }, []);
  
// ===================== Shuffle utility =====================
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ===================== Shuffle products every hour =====================
// ===================== Shuffle first page every hour =====================
useEffect(() => {
  const interval = setInterval(() => {
    setProducts(prev => {
      if (!prev || prev.length === 0) return prev;

      const firstPage = prev.slice(0, PRODUCTS_PER_PAGE); // only first page
      const rest = prev.slice(PRODUCTS_PER_PAGE);         // rest of products
      return [...shuffleArray(firstPage), ...rest];
    });
  }, 60 * 60 * 1000); // 1 hour

  return () => clearInterval(interval);
}, []);


  // ===================== Render =====================
  return (
    <div className="pcus-wrapper12" style={{ display: 'flex' }}>
      <div className="pcus-categories-products1" style={{ width: '100%', transition: 'width 0.3s ease' }}>
        {/* Title Section */}
        <div className="pcus-title-section">
          <h2 className="pcus-main-title">
            <img src={Adsicon} style={{ maxWidth: '18px' }} alt="Ads icon" /> TOP SELLING ITEMS{' '}
            <img src={Adsicon} style={{ maxWidth: '18px' }} alt="Ads icon" />
          </h2>
          <p className="pcus-sub-title">OUR BESTSELLERS</p>
        </div>


        {/* Product Grid */}
        {loadingProducts && (!products || products.length === 0) ? (
          <div className="pcus-prd-grid12">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (!products || products.length === 0) ? (
          <div className="pcus-no-products" style={{ minHeight: '300px', textAlign: 'center', paddingTop: '40px', fontSize: '18px', color: '#666' }}>
            No products found.
          </div>
        ) : (
          <div className="pcus-prd-grid12">
            {/* Render using memoized filtered products */}
            {filteredProducts.slice(0, productsPage * PRODUCTS_PER_PAGE).map((p, idx) => {
                  const isVariable = p.type === 'variable';
                  const variationPriceInfo = variationPrices[p.id] || {};
                  const displayRegularPrice = isVariable ? variationPriceInfo.regular_price : p.regular_price || p.price;
                  const displaySalePrice = isVariable ? variationPriceInfo.sale_price : p.sale_price || null;
                  const displayPrice = isVariable ? variationPriceInfo.price : p.price || p.regular_price || 0;
                  const onSale = displaySalePrice && displaySalePrice !== displayRegularPrice;
                  const staticBadge = <div className="static-top-badge" style={{position:'absolute',top:8,right:8,background:'#1976d2',color:'#fff',fontWeight:700,fontSize:'13px',borderRadius:'5px',padding:'2px 10px',zIndex:3,boxShadow:'0 1px 4px rgba(25,118,210,0.10)',letterSpacing:'0.5px',textTransform:'uppercase'}}>Top Seller</div>;
                  const showSavingsBadge = displaySalePrice && displaySalePrice < displayRegularPrice;
                  const savings = showSavingsBadge ? (parseFloat(displayRegularPrice) - parseFloat(displaySalePrice)).toFixed(2) : null;
                  const countdownDemo = '11:54:08';
                  
                  // Optimize image loading
                  const imgLoading = idx < 6 ? 'eager' : 'lazy';
                  const imgDecoding = idx < 6 ? 'auto' : 'async';
                  return (
                    <div
                      key={p.id}
                      className="pcus-prd-card"
                      onClick={(e) => { e.stopPropagation(); onProductClick(p.slug, p.id); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onProductClick(p.slug)}
                      style={{ position: 'relative', minHeight: '340px', boxShadow: '0 2px 12px rgba(56,142,60,0.04)' }}
                    >
                      {staticBadge}
                      <div className="pcus-image-wrapper1">
                        {p.images?.[0]?.src ? (
                          <img src={p.images[0].src} alt={decodeHTML(p.name)} className="pcus-prd-image1 primary-img" loading={imgLoading} decoding={imgDecoding} />
                        ) : (
                          <NoImagePlaceholder alt={decodeHTML(p.name)} className="pcus-prd-image1 primary-img" />
                        )}
                        {p.images?.[1] && <img src={p.images[1].src} alt={`${decodeHTML(p.name)} - second`} className="pcus-prd-image1 secondary-img" loading="lazy" decoding="async" />}
                        {p.stock_status === 'outofstock' && <div className="pcus-stock-overlay10 out-of-stock">Out of Stock</div>}
                        {typeof p.stock_quantity === 'number' && p.stock_quantity < 50 && <div className="pcus-stock-overlay10 low-stock">Only {p.stock_quantity} left in stock</div>}
                      </div>
                      <div className="pcus-prd-info1">
                        <h3 className="pcus-prd-title1">{truncate(decodeHTML(p.name))}</h3>
                        {showReviews.has(idx) ? <ProductCardReviews productId={p.id} /> : <div style={{height:24}} />}
                        <div style={{ height: "1px", width: "100%", backgroundColor: "lightgrey", margin: "0px 0 2px 0", borderRadius: "1px" }} />
                        <div className="pcus-prd-price-cart1" style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, color: '#ff6600', fontSize: '18px', letterSpacing: '0.2px' }}>
                              AED{onSale ? parseFloat(displaySalePrice || 0).toFixed(2) : parseFloat(displayPrice || 0).toFixed(2)}
                            </span>
                            {p.sold_count || p.soldCount || p.total_sales ? (
                              <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#888', fontWeight: 500 }}>
                                <span style={{ color: '#ff6600', fontSize: '16px', marginRight: 2 }}>🔥</span>
                                {(p.sold_count || p.soldCount || p.total_sales) >= 1000
                                  ? `${Math.round((p.sold_count || p.soldCount || p.total_sales) / 100) / 10}K+ sold`
                                  : `${p.sold_count || p.soldCount || p.total_sales} sold`}
                              </span>
                            ) : null}
                          </div>
                          {onSale && (
                            <div style={{ fontSize: '13px', color: '#888', textDecoration: 'line-through', marginBottom: 2 }}>
                              AED{parseFloat(displayRegularPrice || 0).toFixed(2)}
                            </div>
                          )}
                          <button
                            className={`pcus-prd-add-cart-btn10 ${cartItems.some(item => item.id === p.id) ? 'added-to-cart' : ''}`}
                            onClick={(e) => { e.stopPropagation(); flyToCart(e, p.images?.[0]?.src); addToCart(p, true); }}
                            aria-label={`Add ${decodeHTML(p.name)} to cart`}
                          >
                            <img src={cartItems.some(item => item.id === p.id) ? AddedToCartIcon : AddCarticon} alt="Add to cart" className="pcus-prd-add-cart-icon-img" />
                          </button>
                        </div>
                        {showSavingsBadge && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            margin: '10px auto 0 auto',
                            width: '98%',
                            background: '#ff8800',
                            borderRadius: '5px',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '15px',
                            padding: '4px 10px 4px 10px',
                            letterSpacing: '0.2px',
                            boxShadow: '0 1px 4px rgba(255,136,0,0.10)',
                            border: '1px solid #ff9800',
                            minHeight: '32px',
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                              <span style={{ fontSize: '18px', marginRight: 6, lineHeight: 1 }}>↓</span>
                              Saved AED{savings}
                            </span>
                            <span style={{
                              background: '#fff',
                              color: '#ff8800',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '14px',
                              padding: '2px 10px',
                              marginLeft: 10,
                              minWidth: 70,
                              textAlign: 'center',
                              letterSpacing: '0.5px',
                            }}>{countdownDemo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Show fewer skeletons */}
                {loadingProducts && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
              </div>
            )}

        {/* Load More */}
        {hasMoreProducts && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button className="pcus-load-more-btn" onClick={loadMoreProducts} disabled={loadingProducts}>
              {loadingProducts ? 'Loading…' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      <MiniCart ref={cartIconRef} />
    </div>
  );
};

export default memo(New);
