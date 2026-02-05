import React from 'react';
import '../../assets/styles/ProductSubtitle.css';

export default function ProductSubtitle({ subtitle }) {
  if (!subtitle || subtitle.trim() === '') return null;

  return (
    <div className="product-subtitle-wrapper">
      <span className="subtitle-accent"></span>
      <p className="product-subtitle">
        {subtitle}
      </p>
    </div>
  );
}
