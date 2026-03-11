import React, { useState, useEffect } from 'react';
import '../assets/styles/ProductSellerbadge.css';

const BADGE_MAP = {
  below_price: { label: 'Below Comparable Price', style: { backgroundColor: '#ff9800', color: '#fff' } },
  almost_sold: { label: 'Almost Sold Out', style: { backgroundColor: '#e60023', color: '#fff' } },
  limited_time: { label: 'Limited Time Offer', style: { backgroundColor: '#0071e3', color: '#fff' } },
  lower_than_usual: { label: 'Price Lower Than Usual', style: { backgroundColor: '#009688', color: '#fff' } },
  best_recommended: { label: 'Best Recommended', style: { backgroundColor: '#4caf50', color: '#fff' } },
  best_seller: { label: 'Best Seller', style: { backgroundColor: '#16a34a', color: '#fff' } },
  recommended: { label: 'Recommended', style: { backgroundColor: '#166534', color: '#fff' } },
  limited_offer: { label: 'Limited Offer', style: { backgroundColor: '#1d4ed8', color: '#fff' } },
  new_arrival: { label: 'New Arrival', style: { backgroundColor: '#0284c7', color: '#fff' } },
};

const BADGES_TO_SHOW = ['below_price', 'almost_sold', 'limited_time', 'lower_than_usual', 'best_recommended'];

// Helper to randomly pick 1 or 2 badges
function getRandomBadges() {
  const count = Math.random() < 0.5 ? 1 : 2; // 50% chance for 1 or 2 badges
  const shuffled = [...BADGES_TO_SHOW].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function SellerBadges({ badges = [] }) {
  const [randomBadges, setRandomBadges] = useState(getRandomBadges());
  const sanitizedProvidedBadges = Array.isArray(badges)
    ? badges.filter((badgeKey) => !!BADGE_MAP[badgeKey])
    : [];
  const badgesToRender = sanitizedProvidedBadges.length > 0 ? sanitizedProvidedBadges : randomBadges;

  useEffect(() => {
    if (sanitizedProvidedBadges.length > 0) return undefined;

    const timer = setInterval(() => {
      setRandomBadges(getRandomBadges());
    }, 600000); // 10 minutes

    return () => clearInterval(timer);
  }, [sanitizedProvidedBadges.length]);

  if (!badgesToRender || badgesToRender.length === 0) return null;

  return (
    <div className="psb-wrap">
      {badgesToRender.map((key) => {
        const badge = BADGE_MAP[key];
        return (
          <span
            key={key}
            className={`psb-chip psb-${key}`}
            style={badge.style}
          >
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
