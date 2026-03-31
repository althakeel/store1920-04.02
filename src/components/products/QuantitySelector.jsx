import React, { useEffect, useState } from 'react';
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

  const [inputValue, setInputValue] = useState(String(safeQuantity));

  useEffect(() => {
    setInputValue(String(safeQuantity));
  }, [safeQuantity]);

  const commitQuantity = (rawValue) => {
    const parsedValue = Number.parseInt(String(rawValue).trim(), 10);

    if (!Number.isFinite(parsedValue)) {
      setInputValue(String(safeQuantity));
      return;
    }

    const normalizedValue = Math.min(Math.max(parsedValue, 1), validMax);
    setQuantity(normalizedValue);
    setInputValue(String(normalizedValue));
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value.replace(/[^\d]/g, '');
    setInputValue(nextValue);
  };

  const handleInputBlur = () => {
    commitQuantity(inputValue);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
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

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="quantity-value quantity-value-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          aria-label="Quantity value"
          aria-live="polite"
          aria-atomic="true"
        />

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
