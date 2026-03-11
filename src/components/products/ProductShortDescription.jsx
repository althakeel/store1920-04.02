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

const rewriteBackendLinks = (html) => {
  if (!html || typeof window === 'undefined') return html || '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const links = doc.querySelectorAll('a[href]');

    links.forEach((anchor) => {
      const rawHref = anchor.getAttribute('href') || '';
      if (!rawHref) return;

      try {
        const parsedUrl = new URL(rawHref, window.location.origin);
        const host = parsedUrl.hostname.toLowerCase();
        const isBackendHost = host === 'db.store1920.com' || host === 'www.db.store1920.com';

        if (isBackendHost) {
          anchor.setAttribute('href', `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`);
        }
      } catch (error) {
        // Ignore malformed URLs and keep original href
      }
    });

    return doc.body.firstElementChild?.innerHTML || html;
  } catch (error) {
    return html;
  }
};

const stripHtmlToText = (html) => {
  if (!html) return '';
  if (typeof window === 'undefined') {
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  } catch (error) {
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
};

const SHORT_DESC_LIMIT = 150;

export default function ProductShortDescription({ shortDescription, productSlug }) {
  const [resolvedDescription, setResolvedDescription] = useState(shortDescription || '');
  const [expanded, setExpanded] = useState(false);

  const hasDescription = useMemo(
    () => hasMeaningfulHtml(resolvedDescription),
    [resolvedDescription]
  );

  const displayHtml = useMemo(
    () => rewriteBackendLinks(normalizeShortDescription(resolvedDescription)),
    [resolvedDescription]
  );

  const plainText = useMemo(() => stripHtmlToText(displayHtml), [displayHtml]);
  const shouldTruncate = plainText.length > SHORT_DESC_LIMIT;
  const previewText = useMemo(() => {
    if (!shouldTruncate) return plainText;
    return `${plainText.slice(0, SHORT_DESC_LIMIT).trim()}...`;
  }, [plainText, shouldTruncate]);

  useEffect(() => {
    setResolvedDescription(shortDescription || '');
    setExpanded(false);
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
      <h4 className="short-desc-title">Overview</h4>
      {expanded || !shouldTruncate ? (
        <div className="wp-editor-content" dangerouslySetInnerHTML={{ __html: displayHtml }} />
      ) : (
        <div className="short-desc-preview-wrap">
          <p className="short-desc-preview">{previewText}</p>
          <button
            type="button"
            className="short-desc-toggle"
            onClick={() => setExpanded(true)}
          >
            Read full description
          </button>
        </div>
      )}
    </section>
  );
}
