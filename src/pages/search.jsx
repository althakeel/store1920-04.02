// src/pages/search.jsx  -- same card design as ProductCategory API cards
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { trackSearch } from "../utils/gtmTracking";
import PlaceHolderImage from "../assets/images/common/Placeholder.png";
import IconAED from "../assets/images/Dirham 2.png";
import AddCarticon from "../assets/images/addtocart.png";
import AddedToCartIcon from "../assets/images/added-cart.png";
import { searchProducts, getProductById } from "../api/woocommerce";
import { useCart } from "../contexts/CartContext";
import "../assets/styles/ProductCategory.css";

const useQuery = () => new URLSearchParams(useLocation().search);

const decodeHTML = (html) => {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const SkeletonCard = () => (
  <div className="pcus-prd-card pcus-skeleton">
    <div className="pcus-prd-image-skel" />
    <div className="pcus-prd-info-skel">
      <div className="pcus-prd-title-skel" />
      <div className="pcus-prd-price-cart-skel" />
    </div>
  </div>
);

const Price = ({ value, className }) => {
  if (!value) return null;
  const price = parseFloat(value || 0).toFixed(2);
  const [int, dec] = price.split(".");
  return (
    <span className={className}>
      <span style={{ fontSize: "18px", fontWeight: "bold" }}>{int}</span>
      <span style={{ fontSize: "12px" }}>.{dec}</span>
    </span>
  );
};

const Search = () => {
  const query = useQuery();
  const searchTerm = query.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCards, setHoveredCards] = useState({});
  const [secondImageLoaded, setSecondImageLoaded] = useState({});
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    if (!searchTerm) return;
    setLoading(true);
    const run = async () => {
      try {
        let data;
        if (!isNaN(searchTerm)) {
          const p = await getProductById(searchTerm);
          data = p ? [p] : [];
        } else {
          data = await searchProducts(searchTerm);
        }
        const arr = Array.isArray(data) ? data : [];
        setResults(arr);
        trackSearch(searchTerm, arr.length);
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [searchTerm]);

  const go = (slug) => { navigate(`/product/${slug}`); window.scrollTo(0, 0); };
  const handleSecondImageLoad = (id) => setSecondImageLoaded(prev => ({ ...prev, [id]: true }));
  const handleMouseEnter = (id) => setHoveredCards(prev => ({ ...prev, [id]: true }));
  const handleMouseLeave = (id) => setHoveredCards(prev => ({ ...prev, [id]: false }));

  const flyToCart = (e, imgSrc) => {
    if (!imgSrc) return;
    const clone = document.createElement("img");
    clone.src = imgSrc;
    clone.style.cssText = "position:fixed;z-index:9999;width:60px;height:60px;border-radius:50%;pointer-events:none;transition:all 0.7s ease-in-out;";
    const r = e.currentTarget.getBoundingClientRect();
    clone.style.top = r.top + "px";
    clone.style.left = r.left + "px";
    document.body.appendChild(clone);
    requestAnimationFrame(() => {
      clone.style.top = "60px"; clone.style.left = "90%";
      clone.style.opacity = "0"; clone.style.transform = "scale(0.2)";
    });
    setTimeout(() => clone.remove(), 800);
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 14px 40px", minHeight: "70vh" }}>
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#ff6804", margin: "0 0 4px" }}>
          Search results for: <span style={{ color: "#064789" }}>"{searchTerm}"</span>
          {!loading && results.length > 0 && (
            <span style={{ fontSize: "13px", fontWeight: 400, color: "#888", marginLeft: "10px" }}>
              {results.length} product{results.length !== 1 ? "s" : ""} found
            </span>
          )}
        </h2>
      </div>

      {!loading && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#555", margin: "0 0 6px" }}>No results for "{searchTerm}"</p>
          <p style={{ fontSize: "13px", margin: 0 }}>Try a different keyword or check the spelling.</p>
        </div>
      )}

      <div className="pcus-prd-grid001">
        {loading
          ? Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : results.map((p, index) => {
              const hovered = hoveredCards[p.id] || false;
              const hasSecondImage = p.images?.length > 1 && p.images[1]?.src?.trim();
              const imageToShow = (hovered && hasSecondImage && secondImageLoaded[p.id])
                ? p.images[1].src
                : (p.images?.[0]?.src || PlaceHolderImage);
              const roundedRating = Math.max(0, Math.min(5, Math.round(Number(p.average_rating || p.rating) || 0)));
              const reviewCount = Math.max(0, Number(p.rating_count || p.reviews) || 0);
              const idSeed = String(p.id || "0").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
              const displayReviewCount = reviewCount > 0 ? reviewCount : (idSeed % 180) + 20;
              const displayRating = roundedRating > 0 ? roundedRating : 4;
              const inCart = cartItems.some(item => item.id === p.id);
              const cartQty = cartItems.find(item => item.id === p.id)?.quantity || 1;
              return (
                <div
                  key={p.id}
                  className="pcus-prd-card pcus-api-card"
                  onClick={() => go(p.slug)}
                  style={{ cursor: "pointer", position: "relative" }}
                  onMouseEnter={() => handleMouseEnter(p.id)}
                  onMouseLeave={() => handleMouseLeave(p.id)}
                >
                  <div className="pcus-image-wrapper1" style={{ pointerEvents: "none" }}>
                    <img
                      src={imageToShow}
                      alt={decodeHTML(p.name || p.slug)}
                      className="pcus-prd-image1 primary-img"
                      loading={index < 6 ? "eager" : "lazy"}
                      decoding="auto"
                      onLoad={() => {
                        if (hasSecondImage && !secondImageLoaded[p.id]) {
                          const img = new window.Image();
                          img.src = p.images[1].src;
                          img.onload = () => handleSecondImageLoad(p.id);
                        }
                      }}
                      style={{ transition: "opacity 0.3s ease-in-out", display: "block", width: "100%" }}
                    />
                  </div>
                  <div className="pcus-prd-info12 pcus-api-info">
                    <h2 className="pcus-prd-title1 pcus-api-title">{decodeHTML(p.name || p.slug)}</h2>
                    <div className="pcus-prd-dummy-reviews pcus-api-reviews">
                      <div style={{ color: "#FFD700", marginRight: "8px" }}>{"★".repeat(displayRating)}{"☆".repeat(5 - displayRating)}</div>
                      <div style={{ fontSize: "12px", color: "#666", marginRight: "8px" }}>({displayReviewCount})</div>
                    </div>
                    <div className="pcus-api-divider" />
                    <div className="prc-row-abc123 pcus-api-price-row">
                      <div className="prc-left-abc123 pcus-api-price-left">
                        <img src={IconAED} alt="AED" className="pcus-api-aed-icon" style={{ width: "auto", height: "12px", marginRight: "0px", verticalAlign: "middle" }} />
                        <Price value={p.sale_price || p.price} className="prc-sale-abc123" />
                        <Price value={p.regular_price} className="prc-regular-abc123" />
                        {p.sale_price && p.regular_price && parseFloat(p.sale_price) < parseFloat(p.regular_price) && (
                          <span className="prc-off-abc123">
                            {Math.round(((parseFloat(p.regular_price) - parseFloat(p.sale_price)) / parseFloat(p.regular_price)) * 100)}% Off
                          </span>
                        )}
                      </div>
                      <button
                        className="prc-cart-btn-abc123 pcus-api-cart-btn"
                        title="Add to Cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          flyToCart(e, p.images?.[0]?.src);
                          if (addToCart) addToCart(p);
                        }}
                      >
                        <img src={inCart ? AddedToCartIcon : AddCarticon} alt="Add to Cart" style={{ width: "20px", height: "20px" }} />
                        {inCart && (
                          <span style={{
                            position: "absolute", top: "-6px", right: "-6px",
                            background: "#ff6207", color: "#fff", borderRadius: "50%",
                            fontSize: "11px", fontWeight: 700, minWidth: "18px", height: "18px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            zIndex: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
                          }}>
                            {cartQty}
                          </span>
                        )}
                      </button>
                    </div>
                    {p.brand && <div className="pcus-api-brand">Brand: {p.brand}</div>}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default Search;
