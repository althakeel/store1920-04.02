
import { API_BASE, CONSUMER_KEY, CONSUMER_SECRET } from '../api/woocommerce';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { getFirstVariation, getProductsByCategorySlugAdvanced } from "../api/woocommerce";
import MiniCart from "../components/MiniCart";
import AddCartIcon from "../assets/images/addtocart.png";
import AddedToCartIcon from "../assets/images/added-cart.png";
import IconAED from "../assets/images/Dirham 2.png";
import PlaceHolderIcon from "../assets/images/common/Placeholder.png";
import ProductCardReviews from "../components/temp/productcardreviews";
import "../assets/styles/categorypageid.css";

const PRODUCTS_PER_PAGE = 22;
const TITLE_LIMIT = 22;

const truncate = (str) =>
  str.length <= TITLE_LIMIT ? str : `${str.slice(0, TITLE_LIMIT)}…`;


const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const enrichProductsForCategoryGrid = async (items = []) => {
  const enrichedItems = await Promise.all(
    (Array.isArray(items) ? items : []).map(async (product) => {
      const hasBasePrice = parseFloat(product?.price || product?.regular_price || 0) > 0;

      if (product?.type !== "variable" || hasBasePrice) {
        return product;
      }

      try {
        const variation = await getFirstVariation(product.id);
        if (!variation) return product;

        return {
          ...product,
          price: variation.price || product.price,
          regular_price: variation.regular_price || product.regular_price,
          sale_price: variation.sale_price || product.sale_price,
          images: product.images?.length
            ? product.images
            : variation.image?.src
              ? [{ src: variation.image.src }]
              : product.images,
        };
      } catch (error) {
        console.error(`Failed to enrich category product ${product?.id}:`, error);
        return product;
      }
    })
  );

  return enrichedItems.filter((product) => product?.id && product?.name);
};

// --- Fetch category info and products by slug ---
const Category = () => {
  const { slug } = useParams();
  const { addToCart, cartItems } = useCart();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const cartIconRef = useRef(null);
  const navigate = useNavigate();

  const fetchCategoryAndProducts = useCallback(async (pageNum = 1) => {
    if (!slug) return;
    setLoading(true);
    try {
      console.log('🔍 Fetching category and products for slug:', slug, 'page:', pageNum);
      const result = await getProductsByCategorySlugAdvanced(slug, pageNum, PRODUCTS_PER_PAGE);
      console.log('📦 Result:', result);
      
      if (!result.category) {
        console.log('⚠️ No category found, using slug as fallback name');
        setCategory({ id: null, name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });
        setProducts([]);
        setHasMore(false);
        setInitialLoading(false);
        return;
      }
      
      console.log('✅ Category found:', result.category.name, 'ID:', result.category.id);
      console.log('📦 Products count:', result.products.length);
      
      const validProducts = await enrichProductsForCategoryGrid(result.products);
      
      console.log('✅ Products ready for display:', validProducts.length);
      
      setCategory(result.category);
      setProducts((prevProducts) => {
        if (pageNum === 1) {
          return validProducts;
        } else {
          const newUnique = validProducts.filter(
            (p) => !prevProducts.some((existing) => existing.id === p.id)
          );
          return [...prevProducts, ...newUnique];
        }
      });
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("❌ Error fetching category/products:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      if (pageNum === 1) setProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setInitialLoading(true);
    setProducts([]);
    setPage(1);
    fetchCategoryAndProducts(1);
  }, [slug, fetchCategoryAndProducts]);

  useEffect(() => {
    if (page === 1) return;
    fetchCategoryAndProducts(page);
  }, [page, fetchCategoryAndProducts]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    setPage((prev) => prev + 1);
  };

  const Price = ({ value }) => {
    const price = parseFloat(value || 0).toFixed(2);
    const [integer, decimal] = price.split(".");
    return (
      <span className="pc-price">
        <span className="pc-price-int">{integer}</span>
        <span className="pc-price-dec">.{decimal}</span>
      </span>
    );
  };

  const flyToCart = (e, imgSrc) => {
    if (!cartIconRef.current) return;
    const cartRect = cartIconRef.current.getBoundingClientRect();
    const startRect = e.currentTarget.getBoundingClientRect();

    const clone = document.createElement("img");
    clone.src = imgSrc || PlaceHolderIcon;
    clone.style.position = "fixed";
    clone.style.zIndex = 9999;
    clone.style.width = "60px";
    clone.style.height = "60px";
    clone.style.top = `${startRect.top}px`;
    clone.style.left = `${startRect.left}px`;
    clone.style.transition = "all 0.7s ease-in-out";
    clone.style.borderRadius = "50%";
    clone.style.pointerEvents = "none";

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${cartRect.top}px`;
      clone.style.left = `${cartRect.left}px`;
      clone.style.opacity = "0";
      clone.style.transform = "scale(0.2)";
    });

    setTimeout(() => clone.remove(), 800);
  };

  return (
    <div className="pc-wrapper" style={{ minHeight: "40vh" }}>
      <div className="pc-category-header">
        <h2 className="pc-category-title">
          {initialLoading ? (
            <div className="pc-title-skeleton shimmer" />
          ) : category ? (
            decodeHTML(category.name)
          ) : (
            "Category Not Found"
          )}
        </h2>
      </div>

      <div className="pc-products-container">
        {initialLoading ? (
          <div className="pc-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="pc-card-skeleton">
                <div className="skeleton-img shimmer" />
                <div className="skeleton-text shimmer" />
                <div className="skeleton-price shimmer" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="pc-grid">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="pc-card"
                  onClick={() => navigate(`/product/${p.slug}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={p.images?.[0]?.src || PlaceHolderIcon}
                    alt={decodeHTML(p.name)}
                    className="pc-card-image"
                    loading="lazy"
                  />
                  <h3 className="pc-card-title">{truncate(decodeHTML(p.name))}</h3>
                  <div style={{ padding: "0 5px" }}>
                    <ProductCardReviews
                      productId={p.id}
                      soldCount={p.total_sales || 0}
                    />
                  </div>
                  <div className="pc-card-divider" />
                  <div
                    className="pc-card-footer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={IconAED} alt="AED" className="pc-aed-icon" />
                    <Price value={p.price} />
                    <button
                      className={`pc-add-btn ${
                        cartItems.some((item) => item.id === p.id) ? "pc-added" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToCart(e, p.images?.[0]?.src);
                        addToCart(p, true);
                      }}
                    >
                      <img
                        src={
                          cartItems.some((item) => item.id === p.id)
                            ? AddedToCartIcon
                            : AddCartIcon
                        }
                        alt="Add to cart"
                        className="pc-add-icon"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="pc-load-more-wrapper">
                <button
                  className="pc-load-more-btn"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : (
          !initialLoading && (
            <div className="pc-no-products">
              <div className="pc-no-products-animation">
                <div className="pc-shopping-scene">
                  {/* Person with walking legs and arms */}
                  <div className="pc-person">
                    <div className="pc-head">
                      <div className="pc-face">
                        <span className="pc-eye pc-eye-left">•</span>
                        <span className="pc-eye pc-eye-right">•</span>
                        <span className="pc-sad-mouth">⌢</span>
                        <span className="pc-happy-mouth">⌣</span>
                      </div>
                    </div>
                    <div className="pc-body">
                      <div className="pc-arms">
                        <div className="pc-arm pc-arm-left"></div>
                        <div className="pc-arm pc-arm-right"></div>
                      </div>
                    </div>
                    <div className="pc-legs">
                      <div className="pc-leg pc-leg-left"></div>
                      <div className="pc-leg pc-leg-right"></div>
                    </div>
                  </div>
                  
                  {/* Lightbulb idea */}
                  <div className="pc-idea-bulb">💡</div>
                  
                  {/* Empty basket - appears first, then disappears */}
                  <div className="pc-empty-basket">
                    <div className="pc-basket-handles">
                      <span className="pc-handle-left"></span>
                      <span className="pc-handle-right"></span>
                    </div>
                    <div className="pc-basket-body">
                      <div className="pc-basket-fold"></div>
                    </div>
                  </div>
                  
                  {/* Full basket with products - appears later */}
                  <div className="pc-full-basket">
                    <div className="pc-basket-handles">
                      <span className="pc-handle-left"></span>
                      <span className="pc-handle-right"></span>
                    </div>
                    <div className="pc-basket-body">
                      <div className="pc-products-in-basket">
                        <div className="pc-product-item">📦</div>
                        <div className="pc-product-item">🎁</div>
                        <div className="pc-product-item">📱</div>
                        <div className="pc-product-item">💎</div>
                        <div className="pc-product-item">⭐</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tears when crying */}
                  <div className="pc-tear pc-tear-1">💧</div>
                  <div className="pc-tear pc-tear-2">💧</div>
                  
                  {/* Thinking bubble */}
                  <div className="pc-think-bubble">
                    <div className="pc-bubble-dots">
                      <span className="pc-dot"></span>
                      <span className="pc-dot"></span>
                    </div>
                    <div className="pc-bubble-main">💭</div>
                  </div>
                  
                  {/* Whoa reaction */}
                  <div className="pc-whoa-text">Whoa! 😮</div>
                  
                  {/* Button to navigate */}
                  <button 
                    className="pc-new-arrivals-btn"
                    onClick={() => navigate('/new')}
                  >
                    <span className="pc-btn-icon">✨</span>
                    Check New Arrivals
                    <span className="pc-btn-icon">✨</span>
                  </button>
                  
                  {/* Tooltip */}
                  <div className="pc-tooltip">
                    <div className="pc-tooltip-arrow"></div>
                    <span>Click to see new items!</span>
                  </div>
                </div>
              </div>
              <h3 className="pc-no-products-title">No Products Available</h3>
              <p className="pc-no-products-text">
                This category is currently empty. Check back soon for new arrivals!
              </p>
            </div>
          )
        )}
      </div>

      <div id="pc-cart-icon" ref={cartIconRef} />
      <MiniCart />
    </div>
  );
};

// Most Deals Section Component
const MostDealsSection = () => {
  const [dealsProducts, setDealsProducts] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const cartIconRef = useRef(null);

  useEffect(() => {
    fetchMostDeals();
  }, []);

  const fetchMostDeals = async () => {
    try {
      setDealsLoading(true);
      // Fetch products with high sales or featured products
      const response = await axios.get(`${API_BASE}/products`, {
        params: {
          per_page: 12,
          orderby: 'popularity', // or 'rating' or 'menu_order'
          order: 'desc',
          featured: true, // Get featured products
          consumer_key: CONSUMER_KEY,
          consumer_secret: CONSUMER_SECRET,
        },
      });
      
      console.log('🎯 Most Deals products:', response.data);
      setDealsProducts(response.data);
    } catch (error) {
      console.error('❌ Error fetching deals:', error);
      // Fallback: fetch any products
      try {
        const fallbackResponse = await axios.get(`${API_BASE}/products`, {
          params: {
            per_page: 12,
            orderby: 'date',
            order: 'desc',
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
          },
        });
        setDealsProducts(fallbackResponse.data);
      } catch (fallbackError) {
        console.error('❌ Fallback deals fetch failed:', fallbackError);
      }
    } finally {
      setDealsLoading(false);
    }
  };

  const truncate = (str) =>
    str.length <= TITLE_LIMIT ? str : `${str.slice(0, TITLE_LIMIT)}…`;

  const Price = ({ value }) => {
    const price = parseFloat(value || 0).toFixed(2);
    const [integer, decimal] = price.split(".");
    return (
      <span className="pc-price">
        <span className="pc-price-int">{integer}</span>
        <span className="pc-price-dec">.{decimal}</span>
      </span>
    );
  };

  const flyToCart = (e, imgSrc) => {
    if (!cartIconRef.current) return;
    const cartRect = cartIconRef.current.getBoundingClientRect();
    const startRect = e.currentTarget.getBoundingClientRect();

    const clone = document.createElement("img");
    clone.src = imgSrc || PlaceHolderIcon;
    clone.style.position = "fixed";
    clone.style.zIndex = 9999;
    clone.style.width = "60px";
    clone.style.height = "60px";
    clone.style.top = `${startRect.top}px`;
    clone.style.left = `${startRect.left}px`;
    clone.style.transition = "all 0.7s ease-in-out";
    clone.style.borderRadius = "50%";
    clone.style.pointerEvents = "none";

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${cartRect.top}px`;
      clone.style.left = `${cartRect.left}px`;
      clone.style.opacity = "0";
      clone.style.transform = "scale(0.2)";
    });

    setTimeout(() => clone.remove(), 800);
  };


  if (dealsProducts.length === 0) {
    return null;
  }

};

export default Category;
