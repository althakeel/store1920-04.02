import React, { useEffect, useMemo, useState } from 'react';
import { getProductReviewsWoo } from '../../data/wooReviews';

export default function ProductCardReviews({
  productId,
  soldCount = 0,
  hideLoading = false,
  overrideRating = null,
}) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayRating = useMemo(() => {
    const parsedOverride = Number(overrideRating);
    if (Number.isFinite(parsedOverride) && parsedOverride > 0) {
      return parsedOverride;
    }
    return averageRating;
  }, [averageRating, overrideRating]);

  const reviewCount = reviews.length;
  const hasVisibleRating = reviewCount > 0 && displayRating > 0;
  const hasSoldCount = Number(soldCount) > 0;

  useEffect(() => {
    async function fetchReviews() {
      console.log("🔎 ProductCardReviews mounted with productId:", productId);

      if (!productId) {
        console.warn("⚠️ No productId provided, skipping fetch");
        setLoading(false);
        return;
      }

      const id = parseInt(productId, 10);
      console.log("➡️ Parsed product ID:", id);

      if (isNaN(id)) {
        console.error("❌ Invalid productId:", productId);
        setLoading(false);
        return;
      }

      try {
        console.log("📡 Calling getProductReviewsWoo with ID:", id);
        const data = await getProductReviewsWoo(id);
        console.log("✅ Data received from Woo:", data);

        setReviews(data || []);

        if (data && data.length > 0) {
          const avg = data.reduce((sum, r) => sum + Number(r.rating), 0) / data.length;
          console.log("⭐ Calculated average rating:", avg);
          setAverageRating(avg);
        } else {
          console.log("ℹ️ No reviews found for this product");
          setAverageRating(0);
        }
      } catch (err) {
        console.error("🔥 Error fetching reviews:", err);
        setReviews([]);
        setAverageRating(0);
      } finally {
        console.log("✅ Finished fetching, setting loading to false");
        setLoading(false);
      }
    }

    fetchReviews();
  }, [productId]);

  // Star logic
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} className="pi-star-filled">★</span>);
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<span key={i} className="pi-star-filled">☆</span>); // half-star fallback
      } else {
        stars.push(<span key={i} className="pi-star-empty">★</span>);
      }
    }
    return stars;
  };

  if (loading && hideLoading) return null;
  if (loading) {
    return hasSoldCount ? (
      <div className="pi-rating-meta" aria-live="polite">
        <span className="pi-sold-count">{soldCount} sold</span>
      </div>
    ) : null;
  }

  if (!hasVisibleRating && !hasSoldCount) return null;

  return (
    <div className="pi-rating-meta" aria-live="polite">
      {hasVisibleRating && (
        <>
          <strong className="pi-rating-score">{displayRating.toFixed(1)}</strong>
          <div className="pi-stars">{renderStars(displayRating)}</div>
          <span className="pi-rating-count">({reviewCount})</span>
        </>
      )}
      {hasSoldCount && <span className="pi-sold-count">{soldCount} sold</span>}
    </div>
  );
}
