// A simple placeholder image for products with no image
import React from 'react';

const placeholderUrl = require('../assets/images/noitem.png');

export default function NoImagePlaceholder({ alt = 'No image available', ...props }) {
  return (
    <img
      src={placeholderUrl}
      alt={alt}
      style={{ width: '100%', height: 'auto', objectFit: 'contain', background: '#f5f5f5' }}
      {...props}
    />
  );
}
