import React, { useEffect, useMemo, useState } from 'react';
import { getShortDescriptionBySlug } from '../../api/woocommerce';
import '../../assets/styles/ProductShortDescription.css';

const hasMeaningfulHtml = (html) => {
  if (!html) return false;
  const text = String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|\s+/g, '')
    .trim();
  return text.length > 0;
};

const normalizeShortDescription = (html) => {
  if (!html) return '';
  const hasList = /<\/?(ul|ol|li)[^>]*>/i.test(html);
  if (hasList) return html;

  const parts = String(html)
    .split(/<br\s*\/?\s*>/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length <= 1) return html;

  return `<ul class="tick-list">${parts.map((p) => `<li>${p}</li>`).join('')}</ul>`;
};

export default function ProductShortDescription({ shortDescription, productSlug }) {
  // Debug log
  console.log('ProductShortDescription received:', shortDescription);

  const [resolvedDescription, setResolvedDescription] = useState(shortDescription || '');

  const hasDescription = useMemo(
    () => hasMeaningfulHtml(resolvedDescription),
    [resolvedDescription]
  );

  const displayHtml = useMemo(
    () => normalizeShortDescription(resolvedDescription),
    [resolvedDescription]
  );

  useEffect(() => {
    setResolvedDescription(shortDescription || '');
  }, [shortDescription]);

  useEffect(() => {
    if (hasMeaningfulHtml(shortDescription)) return;
    if (!productSlug) return;

    let active = true;
    const fetchShortDescription = async () => {
      try {
        const data = await getShortDescriptionBySlug(productSlug);
        if (!active) return;
        if (data) {
          setResolvedDescription(data);
        }
      } catch (error) {
        console.warn('Short description fetch failed:', error);
      }
    };

    fetchShortDescription();

    return () => {
      active = false;
    };
  }, [productSlug, shortDescription]);

  if (!hasDescription) {
    console.warn('No short description provided');
    return null;
  }

  return (
    <section className="product-short-description">
      <h4 className="short-desc-title">Short Description</h4>
      <div className="wp-editor-content" dangerouslySetInnerHTML={{ __html: displayHtml }} />
    </section>
  );
}
