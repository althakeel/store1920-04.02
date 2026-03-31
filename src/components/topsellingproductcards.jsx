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

import { getFirstVariation, getCurrencySymbol, getPopularProducts, getTopSellingItemsProducts } from '../api/woocommerce';

const INITIAL_LOAD_COUNT = 10;
const LOAD_MORE_COUNT = 10;
const TITLE_LIMIT = 35;

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
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [usingFallbackProducts, setUsingFallbackProducts] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [nextPage, setNextPage] = useState(1);

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
  const fetchProducts = useCallback(async ({ page, append, useFallback = false }) => {
    setLoadingProducts(true);
    try {
      const fetcher = useFallback ? getPopularProducts : getTopSellingItemsProducts;
      const batchSize = append ? LOAD_MORE_COUNT : INITIAL_LOAD_COUNT;
      const data = await fetcher(page, batchSize);
      const validData = Array.isArray(data) ? data : [];

      if (!useFallback && page === 1 && validData.length === 0) {
        setUsingFallbackProducts(true);
        await fetchProducts({ page: 1, append: false, useFallback: true });
        return;
      }

      setProducts((prev) => {
        if (!append) return validData;

        const existingIds = new Set(prev.map((product) => product.id));
        const nextItems = validData.filter((product) => !existingIds.has(product.id));
        return [...prev, ...nextItems];
      });
      setHasMoreProducts(validData.length === batchSize);
      setNextPage(page + 1);
      setInitialLoadDone(true);
    } catch (error) {
      console.error('Error fetching products:', error);

      if (!useFallback) {
        setUsingFallbackProducts(true);
        await fetchProducts({ page: 1, append: false, useFallback: true });
        return;
      }

      setProducts([]);
      setHasMoreProducts(false);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts({ page: 1, append: false });
  }, [fetchProducts]);

  // Defer reviews progressively - optimized
  useEffect(() => {
    if (!initialLoadDone || products.length === 0) return;
    
    // Show reviews gradually - much faster
    const timeout = setTimeout(() => {
      const newSet = new Set([0, 1, 2, 3]);
      for (let i = 4; i < Math.min(products.length, 24); i++) {
        newSet.add(i);
      }
      setShowReviews(newSet);
    }, 300);

    return () => clearTimeout(timeout);
  }, [initialLoadDone, products.length]);

  const displayedProducts = useMemo(() => products, [products]);

  // Optimized Load More
  const loadMoreProducts = useCallback(() => {
    if (!hasMoreProducts || loadingProducts) return;
    fetchProducts({ page: nextPage, append: true, useFallback: usingFallbackProducts });
  }, [fetchProducts, hasMoreProducts, loadingProducts, nextPage, usingFallbackProducts]);

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

  // Optimized variation price fetching - only fetch currently visible products
  useEffect(() => {
    if (!displayedProducts || displayedProducts.length === 0) return;
    
    const variableProducts = displayedProducts.filter(p => p.type === 'variable' && !variationPrices[p.id]);
    
    // Batch fetch variations - max 5 at a time to avoid overwhelming
    const batchSize = 5;
    for (let i = 0; i < variableProducts.length; i += batchSize) {
      const batch = variableProducts.slice(i, i + batchSize);
      setTimeout(() => {
        batch.forEach(p => fetchFirstVariationPrice(p.id));
      }, i * 100); // Stagger batches
    }
  }, [displayedProducts, variationPrices, fetchFirstVariationPrice]);

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
            {displayedProducts.map((p, idx) => {
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
