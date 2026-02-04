import React from 'react';
import '../../assets/styles/StockStatus.css';

export default function StockStatus({ product, selectedVariation }) {
  if (!product) return null;

  // Determine which stock data to use
  const variation = selectedVariation || {};
  const stockStatus = variation.stock_status || product.stock_status || 'instock';
  const manageStock = variation.manage_stock ?? product.manage_stock;
  const stockQuantity = manageStock
    ? Number(variation.stock_quantity ?? product.stock_quantity ?? 0)
    : null;
  const isInStock =
    typeof variation.is_in_stock === 'boolean'
      ? variation.is_in_stock
      : typeof product.is_in_stock === 'boolean'
      ? product.is_in_stock
      : stockStatus !== 'outofstock';

  // Determine display text and styling
  let statusText = '';
  let statusClass = '';
  let statusColor = '';

  if (!isInStock || stockStatus === 'outofstock') {
    statusText = '✕ Out of Stock';
    statusClass = 'out-of-stock';
    statusColor = '#d32f2f';
  } else if (stockStatus === 'onbackorder') {
    statusText = '⏱ On Backorder';
    statusClass = 'on-backorder';
    statusColor = '#f57c00';
  } else if (manageStock && stockQuantity > 0 && stockQuantity <= 5) {
    statusText = `⚠ Only ${stockQuantity} left`;
    statusClass = 'low-stock';
    statusColor = '#ff9800';
  } else if (!manageStock || (stockQuantity && stockQuantity > 0)) {
    statusText = '✓ In Stock';
    statusClass = 'in-stock';
    statusColor = '#4caf50';
  } else {
    statusText = '✕ Out of Stock';
    statusClass = 'out-of-stock';
    statusColor = '#d32f2f';
  }

  return (
    <div className={`stock-status ${statusClass}`} style={{ color: statusColor }}>
      <strong>{statusText}</strong>
      {manageStock && stockQuantity > 0 && stockQuantity <= 10 && (
        <p className="stock-quantity-warning" style={{ fontSize: '12px', marginTop: '4px' }}>
          Only {stockQuantity} item{stockQuantity !== 1 ? 's' : ''} available
        </p>
      )}
    </div>
  );
}
