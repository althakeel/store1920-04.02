import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ProductCarousel.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://db.store1920.com/wp-json';

/**
 * Fetch multiple products by IDs
 */
const fetchProductsBatch = async (productIds) => {
  if (!productIds || productIds.length === 0) return [];

  const response = await axios.post(`${API_BASE}/custom/v1/bulk-products`, {
    ids: productIds,
  });

  return response.data;
};

const ProductCarousel = ({ title, productIds, collectionName }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['carousel-products', productIds],
    queryFn: () => fetchProductsBatch(productIds),
    enabled: !!productIds && productIds.length > 0,
  });

  // Check scroll position
  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 300;
      const newPosition =
        scrollPosition + (direction === 'left' ? -scrollAmount : scrollAmount);

      containerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      });

      setScrollPosition(newPosition);
      setTimeout(checkScroll, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="carousel-container loading">
        <h2>{title}</h2>
        <div className="carousel-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="product-card-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="carousel-container">
      <div className="carousel-header">
        <h2>{title}</h2>
        {collectionName && (
          <Link to={`/collection/${collectionName}`} className="view-all-link">
            View All →
          </Link>
        )}
      </div>

      <div className="carousel-wrapper">
        {canScrollLeft && (
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        <div className="carousel-track" ref={containerRef}>
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="carousel-product-card"
            >
              {/* Product Image */}
              <div className="carousel-product-image">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0].src}
                    alt={product.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="image-placeholder" />
                )}

                {product.sale_price && product.regular_price && (
                  <div className="discount-badge">
                    {Math.round(
                      ((product.regular_price - product.sale_price) /
                        product.regular_price) *
                        100
                    )}
                    % OFF
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="carousel-product-info">
                <h3 className="carousel-product-name">{product.name}</h3>

                {/* Price */}
                <div className="carousel-product-price">
                  <span className="current-price">
                    AED {parseFloat(product.price || product.sale_price || 0).toFixed(2)}
                  </span>
                  {product.regular_price && product.sale_price && (
                    <span className="original-price">
                      AED {parseFloat(product.regular_price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className={`stock-status ${product.stock_status}`}>
                  {product.stock_status === 'instock' ? '✓ In Stock' : 'Out of Stock'}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {canScrollRight && (
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;
