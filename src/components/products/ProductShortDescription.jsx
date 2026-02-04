import React from 'react';
import '../../assets/styles/ProductShortDescription.css'

export default function ProductShortDescription({ shortDescription }) {
  // Debug log
  console.log('ProductShortDescription received:', shortDescription);
  
  if (!shortDescription || shortDescription.trim() === '') {
    console.warn('No short description provided');
    return null;
  }

  return (
    <section className="product-short-description">
      {/* <h3>About this item</h3> */}
      <div dangerouslySetInnerHTML={{ __html: shortDescription }} />
    </section>
  );
}
