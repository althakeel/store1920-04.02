import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { getBrandBySlug } from "../api/woocommerce";
import AddCartIcon from "../assets/images/addtocart.png";
import AddedToCartIcon from "../assets/images/added-cart.png";
import IconAED from "../assets/images/Dirham 2.png";
import PlaceHolderIcon from "../assets/images/common/Placeholder.png";
import MainBanner from "../components/MainBanner";
import ProductCardReviews from "../components/temp/productcardreviews";
import MiniCart from "../components/MiniCart";
import "../assets/styles/categorypageid.css";

const INITIAL_PRODUCTS_COUNT = 20;
const LOAD_MORE_COUNT = 10;
const TITLE_LIMIT = 22;

const truncate = (str = "") =>
  str.length <= TITLE_LIMIT ? str : `${str.slice(0, TITLE_LIMIT)}...`;

const decodeHTML = (html = "") => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const BrandPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { addToCart, cartItems } = useCart();
  const cartIconRef = useRef(null);

  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PRODUCTS_COUNT);

  useEffect(() => {
    let isMounted = true;

    const loadBrand = async () => {
      setLoading(true);
      setVisibleCount(INITIAL_PRODUCTS_COUNT);

      try {
        const data = await getBrandBySlug(slug);
        if (!isMounted) return;

        setBrandData(data?.success ? data : null);

        if (data?.success && data?.name) {
          document.title = `${data.name} | Store1920`;
        } else {
          document.title = "Brand | Store1920";
        }
      } catch (error) {
        console.error("Error loading brand page:", error);
        if (isMounted) {
          setBrandData(null);
          document.title = "Brand | Store1920";
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBrand();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const products = useMemo(() => {
    if (!Array.isArray(brandData?.products)) return [];
    return brandData.products.filter((product) => product?.id && product?.name);
  }, [brandData]);

  const brandBanners = useMemo(() => {
    const heroImage = brandData?.banner || currentTheme?.bannerKey;
    if (!heroImage) return [];

    return [
      {
        id: `brand-banner-${slug || "default"}`,
        url: heroImage,
        mobileUrl: heroImage,
        bgColor: currentTheme?.bannerBg || "#ffffff",
        link: null,
      },
    ];
  }, [brandData?.banner, currentTheme?.bannerBg, currentTheme?.bannerKey, slug]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );
  const hasMore = visibleCount < products.length;

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

  return (
    <div className="pc-wrapper" style={{ minHeight: "40vh" }}>
      {brandBanners.length ? (
        <div style={{ width: "100%", marginBottom: "22px", borderRadius: "16px", overflow: "hidden" }}>
          <MainBanner
            banners={brandBanners}
            themeLink={currentTheme?.link}
            onBannerClick={() => {}}
          />
        </div>
      ) : null}

      <div
        className="pc-category-header"
        style={{
          alignItems: "flex-start",
          gap: "18px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {brandData?.logo ? (
            <img
              src={brandData.logo}
              alt={brandData?.name || "Brand logo"}
              style={{
                width: "72px",
                height: "72px",
                objectFit: "contain",
                borderRadius: "14px",
                background: "#fff",
                border: "1px solid #ececec",
                padding: "8px",
              }}
            />
          ) : null}

          <div>
            <h2 className="pc-category-title" style={{ margin: 0 }}>
              {loading
                ? "Loading brand..."
                : brandData?.name
                  ? decodeHTML(brandData.name)
                  : "Brand Not Found"}
            </h2>

            {!loading && brandData?.count ? (
              <p style={{ margin: "8px 0 0", color: "#666", fontSize: "14px" }}>
                {brandData.count} products
              </p>
            ) : null}
          </div>
        </div>

      </div>

      <div className="pc-products-container">
        {loading ? (
          <div className="pc-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="pc-card-skeleton">
                <div className="skeleton-img shimmer" />
                <div className="skeleton-text shimmer" />
                <div className="skeleton-price shimmer" />
              </div>
            ))}
          </div>
        ) : visibleProducts.length > 0 ? (
          <>
            <div className="pc-grid">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="pc-card"
                  onClick={() => navigate(`/product/${product.slug}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={product.images?.[0]?.src || PlaceHolderIcon}
                    alt={decodeHTML(product.name)}
                    className="pc-card-image"
                    loading="lazy"
                  />
                  <h3 className="pc-card-title">{truncate(decodeHTML(product.name))}</h3>
                  <div style={{ padding: "0 5px" }}>
                    <ProductCardReviews
                      productId={product.id}
                      soldCount={product.total_sales || 0}
                    />
                  </div>
                  <div className="pc-card-divider" />
                  <div
                    className="pc-card-footer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={IconAED} alt="AED" className="pc-aed-icon" />
                    <Price value={product.price} />
                    <button
                      className={`pc-add-btn ${
                        cartItems.some((item) => item.id === product.id) ? "pc-added" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToCart(e, product.images?.[0]?.src);
                        addToCart(product, true);
                      }}
                    >
                      <img
                        src={
                          cartItems.some((item) => item.id === product.id)
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

            {hasMore ? (
              <div className="pc-load-more-wrapper">
                <button
                  className="pc-load-more-btn"
                  onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
                >
                  Load More
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="pc-no-products">
            <h3 className="pc-no-products-title">
              {brandData ? "No Products Available" : "Brand Not Found"}
            </h3>
            <p className="pc-no-products-text">
              {brandData
                ? "This brand does not have products to show right now."
                : "We couldn't find this brand page."}
            </p>
          </div>
        )}
      </div>

      <div id="pc-cart-icon" ref={cartIconRef} />
      <MiniCart />
    </div>
  );
};

export default BrandPage;
