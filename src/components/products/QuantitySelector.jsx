import React from 'react';
import '../../assets/styles/QuantitySelector.css';

export default function QuantitySelector({ quantity, setQuantity, maxQuantity, mode = 'stepper' }) {
  const validMax = Number.isInteger(maxQuantity) && maxQuantity > 0 ? maxQuantity : 99;

  const safeQuantity = Number.isInteger(quantity) && quantity > 0
    ? Math.min(quantity, validMax)
    : 1;

  const decrementQuantity = () => {
    if (safeQuantity <= 1) return;
    setQuantity(safeQuantity - 1);
  };

  const incrementQuantity = () => {
    if (safeQuantity >= validMax) return;
    setQuantity(safeQuantity + 1);
  };

  const quantityOptions = Array.from({ length: validMax }, (_, index) => index + 1);

  if (mode === 'compact') {
    return (
      <div className="quantity-selector-container quantity-selector-container--compact">
        <span className="quantity-label quantity-label--compact">Qty</span>

        <div className="quantity-compact-select-wrap">
          <select
            className="quantity-compact-select"
            value={safeQuantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            aria-label="Select quantity"
          >
            {quantityOptions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <span className="quantity-compact-caret">⌄</span>
        </div>

        {validMax <= 10 && (
          <p className="stock-info-text" aria-live="polite">
            Only {validMax} left in stock!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="quantity-selector-container">
      <span className="quantity-label">Qty</span>

      <div className="quantity-stepper" role="group" aria-label="Quantity selector">
        <button
          type="button"
          className="quantity-btn"
          onClick={decrementQuantity}
          disabled={safeQuantity <= 1}
          aria-label="Decrease quantity"
        >
          −
        </button>

        <span className="quantity-value" aria-live="polite" aria-atomic="true">
          {safeQuantity}
        </span>

        <button
          type="button"
          className="quantity-btn"
          onClick={incrementQuantity}
          disabled={safeQuantity >= validMax}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

     {validMax <= 10 && (
  <p className="stock-info-text" aria-live="polite">
    Only {validMax} left in stock!
  </p>
)}
    </div>
  );
}
