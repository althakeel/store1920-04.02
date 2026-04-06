import React, { useEffect, useState, useCallback, Suspense, lazy, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { trackProductView } from '../utils/gtmTracking';

import ProductGallery from '../components/ProductGallery';
import ProductInfo from '../components/ProductInfo';
import SkeletonLoader from '../components/SkeletonLoader';
import SignInModal from '../components/sub/SignInModal';
import { getProductReviewsWoo } from '../data/wooReviews';
import {
  fetchAPI,
  getMediaByIds,
  getProductById,
  getProductBySlug,
  getVariationGalleries,
} from '../api/woocommerce';

const RelatedProducts = lazy(() => import('../components/RelatedProducts'));

const ReviewStars = ({ rating, onRate }) => (
  <div className="stars" role="radiogroup" aria-label="Rating">
    {[1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        role={onRate ? 'radio' : undefined}
        aria-checked={i === rating}
        tabIndex={onRate ? 0 : -1}
        className={i <= rating ? 'star filled' : 'star'}
        onClick={() => onRate && onRate(i)}
        onKeyDown={e => {
          if (!onRate) return;
          if (e.key === 'Enter' || e.key === ' ') onRate(i);
        }}
        style={{ cursor: onRate ? 'pointer' : 'default' }}
        aria-label={`${i} Star${i > 1 ? 's' : ''}`}
      >
        ★
      </span>
    ))}
  </div>
);

function getReviewSummary(reviews) {
  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    : 0;
  return { totalReviews, avgRating };
}

function getRatingBreakdown(reviews) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    const rating = Math.round(Number(review.rating) || 0);
    if (rating >= 1 && rating <= 5) counts[rating] += 1;
  });
  return counts;
}

function formatReviewDate(dateValue) {
  if (!dateValue) return '';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getAvatarColor(name = '') {
  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

const VARIATION_GALLERY_META_KEYS = [
  'woo_variation_gallery_images',
  'variation_gallery_images',
  'variation_image_gallery',
  'product_variation_gallery',
  'rtwpvg_images',
  'wavi_value',
  'wdmWooVariationGallery',
  '_wc_additional_variation_images',
  'woodmart_additional_variation_images_data',
];

function normalizeRestImage(image) {
  if (!image) return null;
  if (typeof image === 'string') {
    return image ? { src: image, alt: '' } : null;
  }

  const src = image.src || image.source_url || image.url || '';
  if (!src) return null;

  return {
    id: image.id,
    src,
    alt: image.alt || image.alt_text || image.name || image.title?.rendered || '',
    name: image.name || image.title?.rendered || '',
  };
}

function extractGalleryValue(value) {
  if (!value) return { images: [], ids: [] };

  if (Array.isArray(value)) {
    return value.reduce(
      (acc, item) => {
        const nested = extractGalleryValue(item);
        acc.images.push(...nested.images);
        acc.ids.push(...nested.ids);
        return acc;
      },
      { images: [], ids: [] }
    );
  }

  if (typeof value === 'object') {
    if (value.src || value.source_url || value.url) {
      return { images: [normalizeRestImage(value)].filter(Boolean), ids: [] };
    }

    if (value.id && Object.keys(value).length === 1) {
      return { images: [], ids: [value.id] };
    }

    return Object.values(value).reduce(
      (acc, item) => {
        const nested = extractGalleryValue(item);
        acc.images.push(...nested.images);
        acc.ids.push(...nested.ids);
        return acc;
      },
      { images: [], ids: [] }
    );
  }

  if (typeof value === 'number') {
    return { images: [], ids: [value] };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return { images: [], ids: [] };

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return extractGalleryValue(JSON.parse(trimmed));
      } catch {
        // Fall through to plain parsing below.
      }
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return { images: [normalizeRestImage(trimmed)].filter(Boolean), ids: [] };
    }

    const ids = trimmed
      .split(/[\s,|]+/)
      .map((item) => Number.parseInt(item, 10))
      .filter((id) => Number.isFinite(id) && id > 0);

    return { images: [], ids };
  }

  return { images: [], ids: [] };
}

async function enrichVariationsWithGallery(variationList) {
  const variationsArray = Array.isArray(variationList) ? variationList : [];
  if (!variationsArray.length) return [];

  const pendingMediaIds = new Set();

  const normalizedVariations = variationsArray.map((variation) => {
    const directImages = [
      ...(variation?.gallery_images || []),
      ...(variation?.variation_gallery_images || []),
    ]
      .map(normalizeRestImage)
      .filter(Boolean);

    const metaEntries = Array.isArray(variation?.meta_data) ? variation.meta_data : [];
    const metaGallery = metaEntries.reduce(
      (acc, entry) => {
        if (!VARIATION_GALLERY_META_KEYS.includes(entry?.key)) return acc;
        const extracted = extractGalleryValue(entry?.value);
        acc.images.push(...extracted.images.filter(Boolean));
        extracted.ids.forEach((id) => pendingMediaIds.add(id));
        return acc;
      },
      { images: [] }
    );

    return {
      ...variation,
      gallery_images: [...directImages, ...metaGallery.images].filter(
        (img, idx, arr) => img?.src && arr.findIndex((item) => item.src === img.src) === idx
      ),
    };
  });

  if (!pendingMediaIds.size) {
    return normalizedVariations;
  }

  const mediaItems = await getMediaByIds(Array.from(pendingMediaIds));
  const mediaById = new Map(
    mediaItems
      .map((item) => [
        Number(item.id),
        normalizeRestImage({
          id: item.id,
          source_url: item.source_url,
          alt_text: item.alt_text,
          title: item.title,
        }),
      ])
      .filter(([, image]) => image?.src)
  );

  return normalizedVariations.map((variation) => {
    const metaEntries = Array.isArray(variation?.meta_data) ? variation.meta_data : [];
    const resolvedMetaImages = metaEntries.reduce((acc, entry) => {
      if (!VARIATION_GALLERY_META_KEYS.includes(entry?.key)) return acc;
      const extracted = extractGalleryValue(entry?.value);
      extracted.ids.forEach((id) => {
        const image = mediaById.get(Number(id));
        if (image?.src) acc.push(image);
      });
      return acc;
    }, []);

    const galleryImages = [...(variation.gallery_images || []), ...resolvedMetaImages].filter(
      (img, idx, arr) => img?.src && arr.findIndex((item) => item.src === img.src) === idx
    );

    return {
      ...variation,
      gallery_images: galleryImages,
      variation_gallery_images: galleryImages,
    };
  });
}

function mergeVariationGalleryData(variationsList, galleryPayload) {
  if (!Array.isArray(variationsList) || !variationsList.length) return [];
  if (!Array.isArray(galleryPayload) || !galleryPayload.length) return variationsList;

  const galleriesById = new Map(
    galleryPayload
      .filter((item) => item?.id)
      .map((item) => [
        Number(item.id),
        [
          normalizeRestImage(item.image),
          ...(Array.isArray(item.gallery_images) ? item.gallery_images : []).map(normalizeRestImage),
          ...(Array.isArray(item.variation_gallery_images) ? item.variation_gallery_images : []).map(normalizeRestImage),
        ].filter((img, idx, arr) => img?.src && arr.findIndex((entry) => entry.src === img.src) === idx),
      ])
  );

  return variationsList.map((variation) => {
    const mergedGallery = galleriesById.get(Number(variation.id));
    if (!mergedGallery?.length) return variation;

    return {
      ...variation,
      gallery_images: mergedGallery,
      variation_gallery_images: mergedGallery,
    };
  });
}

const QUALITY_MARQUEE_TEXT =
  "• Each item passes rigorous quality checks. • Safe packaging to prevent any damage. • Shipping available all over the UAE. • Hassle-free returns. • 100% secure payment and data protection. • Money-back guarantee if you’re not satisfied. • Fast and reliable delivery to your doorstep.";
const QUALITY_MARQUEE_LOOP_TEXT = QUALITY_MARQUEE_TEXT.replace(/•/g, ' • ');
const LOCAL_HISTORY_KEY = 'store1920_browsing_history';
const TRUST_BAR_THEMES = [
  {
    background: 'linear-gradient(90deg, #111827 0%, #1f2937 45%, #111827 100%)',
    border: '#0b1220',
    shadow: '0 4px 12px rgba(17, 24, 39, 0.35)',
  },
  {
    background: 'linear-gradient(90deg, #052e2b 0%, #0f4f49 45%, #052e2b 100%)',
    border: '#042320',
    shadow: '0 4px 12px rgba(5, 46, 43, 0.34)',
  },
  {
    background: 'linear-gradient(90deg, #0f1f4a 0%, #1e3a8a 45%, #0f1f4a 100%)',
    border: '#0b1738',
    shadow: '0 4px 12px rgba(15, 31, 74, 0.35)',
  },
  {
    background: 'linear-gradient(90deg, #2a1148 0%, #4c1d95 45%, #2a1148 100%)',
    border: '#1f0d36',
    shadow: '0 4px 12px rgba(42, 17, 72, 0.34)',
  },
];

export default function ProductDetails() {
  const { slug, id } = useParams();
  const { user, login } = useAuth();

  const [selectedVariation, setSelectedVariation] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [variations, setVariations] = useState([]);
  const [extraImages, setExtraImages] = useState([]);
  const [toast, setToast] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hasPurchasedCurrentProduct, setHasPurchasedCurrentProduct] = useState(null);
  const [isCheckingReviewEligibility, setIsCheckingReviewEligibility] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: '',
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [headerStickyOffset, setHeaderStickyOffset] = useState(126);
  const [openInfoSection, setOpenInfoSection] = useState('description');
  const [trustBarThemeIndex, setTrustBarThemeIndex] = useState(
    () => new Date().getHours() % TRUST_BAR_THEMES.length
  );

  const leftColumnRef = useRef(null);
  const isLoggedIn = !!user;
  const trustBarTheme = TRUST_BAR_THEMES[trustBarThemeIndex];

  // Restore user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) login(JSON.parse(storedUser));
  }, [user, login]);

  // Window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateHeaderOffset = () => {
      const stickyHeader = document.querySelector('[data-sticky-header="true"]');
      if (!stickyHeader) return;
      const height = Math.round(stickyHeader.getBoundingClientRect().height);
      setHeaderStickyOffset(Math.max(96, height + 8));
    };

    updateHeaderOffset();
    window.addEventListener('resize', updateHeaderOffset);
    return () => window.removeEventListener('resize', updateHeaderOffset);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrustBarThemeIndex((prevIndex) => (prevIndex + 1) % TRUST_BAR_THEMES.length);
    }, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const isMobile = windowWidth <= 768;
  const desktopStickyTop = headerStickyOffset;
  const uiFontFamily = 'miui, system-ui, -apple-system, BlinkMacSystemFont, ".SFNSText-Regular", Helvetica, Arial, sans-serif';

  const persistBrowsingHistory = useCallback((productData) => {
    if (!productData?.id) return;

    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
      const existingHistory = Array.isArray(stored) ? stored : [];
      const entry = {
        id: productData.id,
        title: productData.name,
        image: productData.images?.[0]?.src || '',
        product_link: productData.permalink || window.location.href,
        date: new Date().toISOString(),
        email: user?.email || '',
      };

      const filteredHistory = existingHistory.filter((item) => {
        if (user?.email) {
          return !(String(item.id) === String(productData.id) && item.email === user.email);
        }

        return String(item.id) !== String(productData.id);
      });

      localStorage.setItem(
        LOCAL_HISTORY_KEY,
        JSON.stringify([entry, ...filteredHistory].slice(0, 30))
      );
    } catch (error) {
      console.error('Failed to persist browsing history:', error);
    }
  }, [user?.email]);

  // Fetch minimal/full product
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id || slug],
    queryFn: async () => (id ? await getProductById(id) : await getProductBySlug(slug)),
    staleTime: 1000 * 60 * 5,
  });

  // Debug: Log product data and mainImageUrl changes
  useEffect(() => {
    if (product) {
      console.log('📦 Product loaded:', product);
      console.log('📝 Short Description:', product.short_description);
      
      // Track product view with GTM
      trackProductView({
        id: product.id,
        sku: product.sku,
        name: product.name,
        title: product.name,
        price: product.price,
        category: product.categories?.[0]?.name || 'Uncategorized',
      });
      persistBrowsingHistory(product);
    }
  }, [product, persistBrowsingHistory]);

  useEffect(() => {
    console.log('📸 mainImageUrl changed to:', mainImageUrl);
  }, [mainImageUrl]);

  useEffect(() => {
    setOpenInfoSection('description');
  }, [product?.id]);

  // Fetch variations
  useEffect(() => {
    if (!product?.variations?.length) return setVariations([]);
    async function fetchVariations() {
      try {
        const data = await fetchAPI(`/products/${product.id}/variations?per_page=100`);
        const enrichedVariations = await enrichVariationsWithGallery(data || []);
        const galleryPayload = await getVariationGalleries(product.id);
        const mergedVariations = mergeVariationGalleryData(enrichedVariations, galleryPayload);
        setVariations(mergedVariations);
      } catch {
        setVariations([]);
      }
    }
    fetchVariations();
  }, [product]);

  useEffect(() => {
    if (!variations.length) {
      setSelectedVariation(null);
    }
  }, [variations.length]);

  // Set main image - only on initial product load
  useEffect(() => {
    if (!product?.images?.length) return;
    const firstValidImage = product.images.find(img => img?.src) || null;
    if (firstValidImage && !mainImageUrl) {
      console.log('Setting initial main image:', firstValidImage.src);
      setMainImageUrl(firstValidImage.src);
    }
  }, [product]);

  useEffect(() => {
    if (!selectedVariation) return;
    if (selectedVariation.image?.src) {
      console.log('Variant image set:', selectedVariation.image.src);
      setMainImageUrl(selectedVariation.image.src);
    } else if (product?.images?.[0]?.src) {
      console.log('Fallback to product image:', product.images[0].src);
      setMainImageUrl(product.images[0].src);
    }
  }, [selectedVariation, product]);

  // Gather variation images
  useEffect(() => {
    if (variations.length > 0) {
      const imgs = variations
        .map(v => v.image)
        .filter(img => img?.src)
        .filter((img, i, arr) => arr.findIndex(x => x.src === img.src) === i);
      setExtraImages(imgs);
    }
  }, [variations]);

  const combinedImages = useMemo(() => {
    if (!product) return [];
    return [...(product.images || []), ...extraImages].filter(
      (img, idx, arr) => arr.findIndex(i => i.src === img.src) === idx
    );
  }, [product, extraImages]);

  const selectedVariationImages = useMemo(() => {
    if (!selectedVariation) return [];

    const variationGallery = [
      selectedVariation.image,
      ...(selectedVariation.gallery_images || []),
      ...(selectedVariation.variation_gallery_images || []),
    ]
      .filter((img) => img?.src)
      .filter((img, idx, arr) => arr.findIndex((item) => item.src === img.src) === idx);

    return variationGallery;
  }, [selectedVariation]);

  const galleryImages = useMemo(() => {
    if (selectedVariationImages.length > 1) return selectedVariationImages;
    return combinedImages.length > 0 ? combinedImages : (product?.images || []);
  }, [combinedImages, product, selectedVariationImages]);

  useEffect(() => {
    if (!selectedVariation) return;
    if (selectedVariationImages.length <= 1) return;

    const currentImageStillExists = selectedVariationImages.some(
      (img) => img?.src && img.src === mainImageUrl
    );

    if (!currentImageStillExists && selectedVariationImages[0]?.src) {
      setMainImageUrl(selectedVariationImages[0].src);
    }
  }, [mainImageUrl, selectedVariation, selectedVariationImages]);

  // Fetch reviews
  useEffect(() => {
    if (!product) return;
    async function fetchReviews() {
      try {
        const reviewsFromWoo = await getProductReviewsWoo(product.id);
        setReviews(reviewsFromWoo);
      } catch {
        setReviews([]);
      }
    }
    fetchReviews();
  }, [product]);

  useEffect(() => {
    setHasPurchasedCurrentProduct(null);
  }, [product?.id, user?.id]);

  const hasUserPurchasedCurrentProduct = useCallback(async () => {
    if (!user?.id || !product?.id) return false;

    const perPage = 100;
    const allowedStatuses = [
      'pending',
      'processing',
      'cod',
      'confirmed',
      'on-hold',
      'shipped',
      'completed',
      'paid',
      'ready-to-pickup',
      'pickup-requested',
    ].join(',');

    for (let page = 1; page <= 3; page += 1) {
      const orders = await fetchAPI(
        `/orders?customer=${encodeURIComponent(user.id)}&status=${encodeURIComponent(allowedStatuses)}&per_page=${perPage}&page=${page}`
      );

      if (!Array.isArray(orders) || orders.length === 0) {
        break;
      }

      const found = orders.some((order) =>
        Array.isArray(order?.line_items) &&
        order.line_items.some((item) => Number(item?.product_id) === Number(product.id))
      );

      if (found) {
        return true;
      }

      if (orders.length < perPage) {
        break;
      }
    }

    return false;
  }, [product?.id, user?.id]);

  const reviewSummary = getReviewSummary(reviews);
  const reviewBreakdown = getRatingBreakdown(reviews);
  const maxBreakdownValue = Math.max(1, ...Object.values(reviewBreakdown));

  const toggleInfoSection = useCallback((sectionName) => {
    setOpenInfoSection(prev => (prev === sectionName ? null : sectionName));
  }, []);

  const renderCompactInfoSections = () => (
    <div
      style={{
        marginTop: 12,
        borderTop: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: uiFontFamily,
      }}
    >
      <button
        type="button"
        onClick={() => toggleInfoSection('description')}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          border: 0,
          borderBottom: '1px solid #e5e7eb',
          padding: isMobile ? '12px 12px' : '14px 14px',
          fontSize: isMobile ? '1.05rem' : '1.2rem',
          fontWeight: 700,
          color: '#111827',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={openInfoSection === 'description'}
      >
        <span>Description</span>
        <span style={{ fontSize: '18px', lineHeight: 1 }}>{openInfoSection === 'description' ? '⌄' : '›'}</span>
      </button>
      {openInfoSection === 'description' && (
        <div
          style={{
            padding: isMobile ? '12px 12px' : '14px 14px',
            borderBottom: '1px solid #e5e7eb',
            background: '#fff',
          }}
        >
          <div
            className="product-description-content pi-description-content"
            style={{
              fontSize: isMobile ? '14px' : '15px',
              lineHeight: '1.8',
              color: '#374151',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              fontFamily: uiFontFamily,
            }}
            dangerouslySetInnerHTML={{ __html: product.description || '' }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => toggleInfoSection('shipping')}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          border: 0,
          borderBottom: '1px solid #e5e7eb',
          padding: isMobile ? '12px 12px' : '14px 14px',
          fontSize: isMobile ? '1.05rem' : '1.2rem',
          fontWeight: 700,
          color: '#111827',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={openInfoSection === 'shipping'}
      >
        <span>Processing & Shipping</span>
        <span style={{ fontSize: '18px', lineHeight: 1 }}>{openInfoSection === 'shipping' ? '⌄' : '›'}</span>
      </button>
      {openInfoSection === 'shipping' && (
        <div
          style={{
            padding: isMobile ? '12px 12px' : '14px 14px',
            borderBottom: '1px solid #e5e7eb',
            background: '#fff',
            fontSize: isMobile ? '13px' : '14px',
            lineHeight: '1.7',
            color: '#374151',
            fontFamily: uiFontFamily,
          }}
        >
          Orders are usually processed within 1-2 business days and delivery timelines vary by location.
        </div>
      )}
    </div>
  );

  const renderReviewSection = ({ embedded = false } = {}) => (
    <div
      style={{
        maxWidth: embedded ? '100%' : 1400,
        margin: embedded ? '16px 0 0' : '14px auto 0',
        padding: embedded ? '0' : '0 20px',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: uiFontFamily,
      }}
    >
      <section
        style={{
          background: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: isMobile ? '14px 12px' : '16px 16px',
          boxShadow: '0 4px 14px rgba(17, 24, 39, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#111827' }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>{reviewSummary.totalReviews}</span>
            <span style={{ fontSize: 18, fontWeight: 500 }}>{reviewSummary.totalReviews === 1 ? 'review' : 'reviews'}</span>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{reviewSummary.avgRating.toFixed(1)}</span>
            <ReviewStars rating={Math.round(reviewSummary.avgRating)} />
          </div>
          <div style={{ color: '#16a34a', fontSize: isMobile ? 12 : 13, fontWeight: 600 }}>
            ✓ All reviews are from verified purchases
          </div>
        </div>

        {reviews.length === 0 ? (
          <div
            style={{
              fontSize: 15,
              color: '#6b7280',
              background: '#f9fafb',
              border: 'none',
              borderRadius: 10,
              padding: '14px 12px',
              textAlign: 'center',
            }}
          >
            No reviews yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.slice(0, 5).map((review) => {
              const reviewerName = review.reviewer || 'Anonymous';
              const reviewerInitial = reviewerName.charAt(0).toUpperCase();
              const reviewDate = formatReviewDate(review.date);

              return (
                <article
                  key={review.id}
                  style={{
                    paddingBottom: 10,
                    borderBottom: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: getAvatarColor(reviewerName),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {reviewerInitial}
                    </div>
                    <strong style={{ fontSize: 14, color: '#111827' }}>{reviewerName}</strong>
                    {reviewDate && <span style={{ fontSize: 12, color: '#9ca3af' }}>on {reviewDate}</span>}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <ReviewStars rating={Math.round(Number(review.rating) || 0)} />
                  </div>
                  <div
                    style={{ fontSize: isMobile ? 14 : 15, color: '#1f2937', lineHeight: 1.55 }}
                    dangerouslySetInnerHTML={{ __html: review.comment || '' }}
                  />
                </article>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddReview}
          style={{
            marginTop: 14,
            width: '100%',
            border: 'none',
            borderRadius: 999,
            background: '#fff',
            color: '#111827',
            fontWeight: 600,
            fontSize: 15,
            padding: '11px 14px',
            cursor: 'pointer',
          }}
        >
          {isCheckingReviewEligibility
            ? 'Checking your order...'
            : !isLoggedIn
              ? 'Sign in to write a review'
              : 'Write a review'}
        </button>
      </section>
    </div>
  );

  // Handlers
  const handleVariationChange = useCallback(v => setSelectedVariation(v), []);
  const openModal = useCallback(type => setActiveModal(type), []);
  const closeModal = useCallback(() => setActiveModal(null), []);
  const showToast = message => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };
  const handleAddToWishlist = () =>
    !isLoggedIn ? setShowLoginModal(true) : showToast('✅ Product added to wishlist!');
  const handleReportProduct = () => showToast('⚠️ Product reported!');
  const handleAddReview = async () => {
    if (!isLoggedIn) {
      showToast('⚠️ Please sign in to write a review.');
      setShowLoginModal(true);
      return;
    }

    if (isCheckingReviewEligibility) {
      return;
    }

    let isEligible = hasPurchasedCurrentProduct;

    if (isEligible === null) {
      setIsCheckingReviewEligibility(true);
      isEligible = await hasUserPurchasedCurrentProduct();
      setHasPurchasedCurrentProduct(isEligible);
      setIsCheckingReviewEligibility(false);
    }

    if (!isEligible) {
      showToast('⚠️ Only customers who ordered this product can write a review.');
      return;
    }

    setReviewDraft((prev) => ({
      ...prev,
      name: prev.name || user?.name || '',
      email: prev.email || user?.email || '',
    }));

    setActiveModal('review');
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();

    const trimmedName = reviewDraft.name.trim();
    const trimmedEmail = reviewDraft.email.trim();
    const trimmedComment = reviewDraft.comment.trim();

    if (!isLoggedIn) {
      showToast('⚠️ Please sign in to submit a review.');
      setActiveModal(null);
      setShowLoginModal(true);
      return;
    }

    if (hasPurchasedCurrentProduct === false) {
      showToast('⚠️ Only customers who ordered this product can submit a review.');
      setActiveModal(null);
      return;
    }

    if (!trimmedName || !trimmedEmail || !trimmedComment || !reviewDraft.rating) {
      showToast('⚠️ Please fill all review fields.');
      return;
    }

    const newReview = {
      id: Date.now(),
      reviewer: trimmedName,
      reviewer_email: trimmedEmail,
      rating: Number(reviewDraft.rating),
      comment: trimmedComment,
      date: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);
    setReviewDraft({ name: '', email: '', rating: 5, comment: '' });
    setActiveModal(null);
    showToast('✅ Review submitted successfully!');
  };

  const closeLoginModal = () => setShowLoginModal(false);

  if (isLoading) return <SkeletonLoader />;
  if (error) return <div>Error loading product.</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="pd-font-scope">
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4CAF50',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 5,
            zIndex: 9999,
            fontWeight: 'bold',
          }}
        >
          {toast}
        </div>
      )}

      <div
        style={{
          display: isMobile ? 'block' : 'flex',
          maxWidth: 1400,
          margin: '0 auto',
          padding: isMobile ? '12px' : '16px 20px',
          gap: isMobile ? 0 : 24,
          alignItems: isMobile ? 'stretch' : 'flex-start',
          fontFamily: uiFontFamily,
        }}
      >
        {/* Left Column */}
        <div
          ref={leftColumnRef}
          style={{
            flex: isMobile ? 'auto' : '1 1 0',
            width: isMobile ? '100%' : '50%',
            minWidth: 0,
            height: 'auto',
            boxSizing: 'border-box',
            position: 'static',
            top: 'auto',
            alignSelf: isMobile ? 'auto' : 'stretch',
            paddingRight: 0,
          }}
          className=""
        >
          <div
            style={{
              position: 'static',
              top: 'auto',
              alignSelf: 'flex-start',
            }}
          >
            <ProductGallery
              images={galleryImages}
              mainImageUrl={mainImageUrl || product.images?.[0]?.src}
              setMainImageUrl={setMainImageUrl}
              activeModal={activeModal}
              openModal={openModal}
              closeModal={closeModal}
            />
          </div>

          {!isMobile && (
            <div style={{ marginTop: 16 }}>
              {renderReviewSection({ embedded: true })}
              {renderCompactInfoSections()}
            </div>
          )}

          {isMobile && (
            <div style={{ marginTop: 20, marginBottom: 72, position: 'relative', zIndex: 2 }}>
              <ProductInfo
                product={product}
                variations={variations}
                selectedVariation={selectedVariation}
                onVariationChange={handleVariationChange}
                loadingVariations={variations.length === 0 && !!product.variations?.length}
              />
              <div style={{ marginTop: 14 }}>
                {renderReviewSection({ embedded: true })}
                {renderCompactInfoSections()}
              </div>
            </div>
          )}

          {/* <div style={{ marginTop: 20 }}>
            <div className="review-summary" aria-live="polite">
              <strong>
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </strong>{' '}
              &nbsp;|&nbsp;
              <span>
                {reviewSummary.avgRating.toFixed(1)}{' '}
                <ReviewStars rating={Math.round(reviewSummary.avgRating)} />
              </span>
            </div>
          </div> */}

          
        </div>

        {/* Right Column */}
        {!isMobile && (
          <div
            style={{
              flex: '1 1 0',
              width: '50%',
              minWidth: 0,
              position: 'sticky',
              top: desktopStickyTop,
              alignSelf: 'flex-start',
            }}
          >
            <ProductInfo
              product={product}
              variations={variations}
              selectedVariation={selectedVariation}
              onVariationChange={handleVariationChange}
              loadingVariations={variations.length === 0 && !!product.variations?.length}
            />
          </div>
        )}
      </div>

      <style>
        {`
          .pd-font-scope,
          .pd-font-scope * {
            font-family: miui, system-ui, -apple-system, BlinkMacSystemFont, ".SFNSText-Regular", Helvetica, Arial, sans-serif !important;
          }

          @keyframes pd-trust-loop {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

      <div
        style={{
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
          marginTop: 18,
          marginBottom: 12,
          background: trustBarTheme.background,
          color: '#ffffff',
          borderTop: `1px solid ${trustBarTheme.border}`,
          borderBottom: `1px solid ${trustBarTheme.border}`,
          fontWeight: 700,
          fontSize: isMobile ? 14 : 17,
          lineHeight: 1.45,
          letterSpacing: 0.2,
          boxShadow: trustBarTheme.shadow,
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 1440, margin: '0 auto', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              width: 'max-content',
              minWidth: '200%',
              whiteSpace: 'nowrap',
              animation: 'pd-trust-loop 26s linear infinite',
              padding: '18px 0',
            }}
          >
            <span style={{ whiteSpace: 'nowrap', display: 'inline-block', paddingRight: 48 }}>
              {QUALITY_MARQUEE_LOOP_TEXT}
            </span>
            <span style={{ whiteSpace: 'nowrap', display: 'inline-block', paddingRight: 48 }} aria-hidden="true">
              {QUALITY_MARQUEE_LOOP_TEXT}
            </span>
          </div>
        </div>
      </div>
      

      {/* Related Products */}
      <div style={{ maxWidth: 1400, margin: '40px auto', padding: '0 10px' }}>
        <Suspense fallback={
          <div style={{ padding: '20px 0' }}>
            <h2 style={{ marginBottom: '15px', color: '#333' }}>Similar Products</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', marginTop: '-10px' }}>
              Loading products from the same categories...
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              maxWidth: '1400px'
            }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '12px',
                  minHeight: '320px',
                  animation: 'shimmer 1.5s infinite',
                  border: '1px solid #eee'
                }}>
                  <style>
                    {`
                      @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                      }
                    `}
                  </style>
                </div>
              ))}
            </div>
          </div>
        }>
          <RelatedProducts
            productId={product.id}
          />
        </Suspense>
      </div>

      <SignInModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        onLogin={() => setShowLoginModal(false)}
      />

      {activeModal === 'review' && (
        <div
          role="presentation"
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <form
            onSubmit={handleReviewSubmit}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#fff',
              borderRadius: 14,
              padding: isMobile ? '16px 14px' : '18px 18px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
              fontFamily: uiFontFamily,
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 24, color: '#111827' }}>Write a review</h3>

            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Name</label>
            <input
              type="text"
              value={reviewDraft.name}
              onChange={(event) => setReviewDraft((prev) => ({ ...prev, name: event.target.value }))}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}
              placeholder="Your name"
            />

            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={reviewDraft.email}
              onChange={(event) => setReviewDraft((prev) => ({ ...prev, email: event.target.value }))}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}
              placeholder="you@example.com"
            />

            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Rating</label>
            <div style={{ marginBottom: 10 }}>
              <ReviewStars rating={reviewDraft.rating} onRate={(rating) => setReviewDraft((prev) => ({ ...prev, rating }))} />
            </div>

            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Review</label>
            <textarea
              value={reviewDraft.comment}
              onChange={(event) => setReviewDraft((prev) => ({ ...prev, comment: event.target.value }))}
              style={{ width: '100%', minHeight: 110, border: '1px solid #d1d5db', borderRadius: 10, padding: '10px 12px', resize: 'vertical' }}
              placeholder="Share your experience with this product"
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 999, padding: '9px 14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', borderRadius: 999, padding: '9px 16px', cursor: 'pointer', fontWeight: 700 }}
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
