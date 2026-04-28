import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { throttle } from "lodash";
import { getAllBrands } from "../api/woocommerce";
import "../assets/styles/BrandsCarousel.css";

const BrandsCarousel = ({ brands: propBrands }) => {
  const navigate = useNavigate();
  const brandsRef = useRef(null);
  const [brands, setBrands] = useState(propBrands || []);
  const [loading, setLoading] = useState(!propBrands || propBrands.length === 0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch brands from API if not provided
  useEffect(() => {
    const loadBrands = async () => {
      if (propBrands && propBrands.length > 0) {
        setBrands(propBrands);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedBrands = await getAllBrands();
        if (fetchedBrands && fetchedBrands.length > 0) {
          setBrands(fetchedBrands);
          console.log("✅ Loaded", fetchedBrands.length, "brands from API");
        } else {
          console.warn("⚠️ No brands returned from API");
          setBrands([]);
        }
      } catch (error) {
        console.error("❌ Error fetching brands:", error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, [propBrands]);

  const updateArrowVisibility = useCallback(() => {
    const el = brandsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollWidth - el.scrollLeft > el.clientWidth + 10);
  }, []);

  useEffect(() => {
    const el = brandsRef.current;
    if (!el) return;
    const throttled = throttle(updateArrowVisibility, 100);
    el.addEventListener("scroll", throttled);
    updateArrowVisibility();
    return () => el.removeEventListener("scroll", throttled);
  }, [updateArrowVisibility]);

  const handleBrandClick = (brand) => {
    navigate(`/brand/${brand.slug}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="brands-carousel-wrapper">
      <h2 className="brands-carousel-title">Featured Brands</h2>
      
      {loading ? (
        <div className="brands-carousel-container">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="brand-card brand-skeleton">
              <div className="brand-logo-wrapper" style={{ background: "#eee" }} />
              <div className="brand-name" style={{ background: "#eee", height: "12px", borderRadius: "4px" }} />
            </div>
          ))}
        </div>
      ) : brands && brands.length > 0 ? (
        <div className="brands-carousel-container">
          {canScrollLeft && (
            <button 
              className="brands-scroll-btn brands-scroll-left"
              onClick={() => brandsRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
              title="Scroll left"
            >
              ‹
            </button>
          )}
          
          <div className="brands-carousel-scroll" ref={brandsRef}>
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="brand-card"
                onClick={() => handleBrandClick(brand)}
                title={brand.name}
              >
                <div className="brand-logo-wrapper">
                  <img
                    src={brand.logo || "https://via.placeholder.com/150x100?text=" + encodeURIComponent(brand.name)}
                    alt={brand.name}
                    className="brand-logo"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150x100?text=" + encodeURIComponent(brand.name);
                    }}
                  />
                </div>
                <p className="brand-name">{brand.name}</p>
              </div>
            ))}
          </div>

          {canScrollRight && (
            <button 
              className="brands-scroll-btn brands-scroll-right"
              onClick={() => brandsRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
              title="Scroll right"
            >
              ›
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: "20px", textAlign: "center", color: "#999", fontSize: "14px" }}>
          No brands available
        </div>
      )}
    </div>
  );
};

export default BrandsCarousel;
