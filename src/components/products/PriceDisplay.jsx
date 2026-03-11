import React from 'react';
import '../../assets/styles/PriceDisplay.css';

function safeParsePrice(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function pickFirstPrice(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return 0;
}

function pickFirstPositivePrice(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    const numeric = safeParsePrice(value);
    if (numeric > 0) return value;
  }
  return 0;
}

// Helper to split integer and decimal
function formatPrice(price) {
  const [intPart, decPart] = price.toFixed(2).split('.');
  return { intPart, decPart };
}

export default function PriceDisplay({ product, selectedVariation }) {
  const defaultVariation = product.variations?.[0] || {};

  const price = pickFirstPositivePrice(selectedVariation?.price, defaultVariation.price, product.price, 0);
  const regularPrice = pickFirstPositivePrice(
    selectedVariation?.regular_price,
    defaultVariation.regular_price,
    product.regular_price,
    0
  );
  const salePrice = pickFirstPositivePrice(
    selectedVariation?.sale_price,
    defaultVariation.sale_price,
    product.sale_price,
    0
  );

  const priceNum = safeParsePrice(price);
  const regularPriceNum = safeParsePrice(regularPrice);
  const salePriceNum = safeParsePrice(salePrice);

  const effectiveSalePriceNum = salePriceNum > 0 ? salePriceNum : priceNum;
  const onSale = regularPriceNum > 0 && effectiveSalePriceNum > 0 && effectiveSalePriceNum < regularPriceNum;
  const discountPercent = onSale
    ? Math.round(((regularPriceNum - effectiveSalePriceNum) / regularPriceNum) * 100)
    : 0;

  const displayPrice = onSale ? effectiveSalePriceNum : priceNum;
  const { intPart, decPart } = formatPrice(displayPrice);

  const displayRegularPrice = regularPriceNum > 0 ? formatPrice(regularPriceNum) : null;

  return (
    <div className="pd-price-container">
      {onSale && displayRegularPrice && (
        <>
          <span className="pd-regular-price" aria-label="Original price">
            <span className="price-wrapper">
              <span className="pd-regular-int">{displayRegularPrice.intPart}</span>
              <span className="pd-regular-dec">.{displayRegularPrice.decPart}</span>
            </span>
          </span>
          <span className="pd-sale-price" aria-label="Discounted price">
            <span className="price-wrapper">
              <span className="pd-sale-currency">AED</span>
              <span className="pd-sale-int">{intPart}</span>
              <span className="pd-sale-dec">.{decPart}</span>
            </span>
          </span>
          {discountPercent > 0 && <span className="pd-discount-badge">{discountPercent}% OFF</span>}
        </>
      )}

      {!onSale && (
        <span className="pd-sale-price" aria-label="Price">
          <span className="price-wrapper">
            <span className="pd-sale-currency">AED</span>
            <span className="pd-sale-int">{intPart}</span>
            <span className="pd-sale-dec">.{decPart}</span>
          </span>
        </span>
      )}
    </div>
  );
}
