// ProductDescription.jsx
import React, { useEffect, useRef, useState } from 'react';
import '../../assets/styles/ProductDescription.css';

function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function joinWithComma(items, key = 'id', display = 'name') {
  return items.map((item, i) => (
    <span key={item[key] || i} className={`${display.toLowerCase()}-name`}>
      {decodeHtml(item[display])}
      {i < items.length - 1 ? ', ' : ''}
    </span>
  ));
}


export default function ProductDescription({ product, selectedVariation }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const descriptionRef = useRef(null);

  const descriptionHtml = selectedVariation?.description || product?.description || '';
  const sku = selectedVariation?.sku || product?.sku || '';
  const categories = product?.categories || [];
  const tags = product?.tags || [];
  const attributes = selectedVariation?.attributes?.length
    ? selectedVariation.attributes
    : product?.attributes || [];

  const displayHtml = descriptionHtml;

  useEffect(() => {
    const node = descriptionRef.current;
    if (!node) return;

    const evaluate = () => {
      const shouldCollapse = node.scrollHeight > 400 || descriptionHtml.length > 500;
      setIsCollapsible(shouldCollapse);
    };

    evaluate();
    const timer = setTimeout(evaluate, 500);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => evaluate());
      resizeObserver.observe(node);
    } else {
      const onResize = () => evaluate();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [descriptionHtml, isExpanded]);

  if (!product) return null;

  return (
    <section className="product-description-section">
      <h2>Product Details</h2>

      {/* SKU */}
      {sku && (
        <dl className="product-sku">
          <dt>SKU:</dt>
          <dd>{sku}</dd>
        </dl>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <dl className="product-categories">
          <dt>Categories:</dt>
          <dd>{joinWithComma(categories)}</dd>
        </dl>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <dl className="product-tags">
          <dt>Tags:</dt>
          <dd>{joinWithComma(tags)}</dd>
        </dl>
      )}

      {/* Attributes */}
      {attributes.length > 0 && (
        <section className="product-attributes">
          <h3>Attributes:</h3>
          <ul>
            {attributes.map((attr, i) => {
              const options = Array.isArray(attr.options) ? attr.options : [attr.options];
              const displayName = attr.name || attr.attribute_name || 'Attribute';
              const displayOptions = attr.option ? [attr.option] : options;
              return (
                <li key={attr.id || i}>
                  <strong>{displayName}:</strong> {displayOptions.join(', ')}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 1️⃣ Description first */}
      <article
        ref={descriptionRef}
        className={`product-description-content ${isCollapsible && !isExpanded ? 'collapsed' : 'expanded'}`}
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />

      {isCollapsible && !isExpanded && (
        <button
          type="button"
          className="product-description-more"
          onClick={() => setIsExpanded(true)}
        >
          Show more
        </button>
      )}

    </section>
  );
}
