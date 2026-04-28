import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

import '../assets/styles/ProductInfo.css';

import SellerBadges from './ProductSellerbadge';
import OfferBox from './OfferBox';
import ShareDropdown from './ShareDropdown';
import PriceDisplay from './products/PriceDisplay';
import ProductSubtitle from './products/ProductSubtitle';
import ProductVariants from './products/ProductVariants';
import ClearanceSaleBox from './products/ClearanceSaleBox';
import QuantitySelector from './products/QuantitySelector';
import ButtonSection from './products/ButtonSection';
import ProductShortDescription from './products/ProductShortDescription';
import ItemDetailsTable from './products/ItemDetailsTable';
import ProductCardReviews from '../components/temp/productcardreviews';
import MobileStickyCart from '../components/MobileStickyCart';
import TamaraIcon from '../assets/images/Footer icons/6.webp';

export default function ProductInfo({ product, variations, selectedVariation, onVariationChange }) {
  const [quantity, setQuantity] = useState(1);
  const [hasItemDetails, setHasItemDetails] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showInstallmentPopup, setShowInstallmentPopup] = useState(false);
  const [showPreOrderPopup, setShowPreOrderPopup] = useState(false);
  const [showShippingPopup, setShowShippingPopup] = useState(false);
  const [showGuaranteePopup, setShowGuaranteePopup] = useState(false);
  const [showTamaraPopup, setShowTamaraPopup] = useState(false);

  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const isMobile = windowWidth <= 768;

  // Window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isOutOfStock = selectedVariation?.stock_status === 'outofstock';

  useEffect(() => {
    if (!showInstallmentPopup) return;

    const handleEsc = (event) => {
      if (event.key === 'Escape') setShowInstallmentPopup(false);
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showInstallmentPopup]);

  useEffect(() => {
    if (!showPreOrderPopup) return;

    const handleEsc = (event) => {
      if (event.key === 'Escape') setShowPreOrderPopup(false);
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showPreOrderPopup]);

  useEffect(() => {
    if (!showShippingPopup && !showGuaranteePopup) return;

    const handleEsc = (event) => {
      if (event.key !== 'Escape') return;
      setShowShippingPopup(false);
      setShowGuaranteePopup(false);
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showShippingPopup, showGuaranteePopup]);

  useEffect(() => {
    if (!showTamaraPopup) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEsc = (event) => {
      if (event.key === 'Escape') setShowTamaraPopup(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showTamaraPopup]);

  // Reset quantity when selected variation changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariation]);

  // Extract brand attribute
  const brandAttribute = product.attributes?.find(attr => {
    if (!attr.name) return false;
    const name = attr.name.toLowerCase();
    const slug = (attr.slug || '').toLowerCase();
    return name.includes('brand') || slug.includes('brand');
  });
  const brandOptions = brandAttribute?.options || [];
  const brand = brandOptions.length ? brandOptions[0] : null;
  const isRatingCategoryProduct = Array.isArray(product.categories)
    && product.categories.some((category) => {
      const name = (category?.name || '').toLowerCase().trim();
      const slug = (category?.slug || '').toLowerCase().trim();
      return name === 'rating' || slug === 'rating';
    });

  // Stock quantity calculation
  const rawQty = Number(selectedVariation?.stock_quantity);
  const productQty = Number(product?.stock_quantity);
  const manageStock = selectedVariation?.manage_stock;
  const maxQuantity =
    manageStock && Number.isInteger(rawQty) && rawQty > 0
      ? rawQty
      : Number.isInteger(productQty) && productQty > 0
      ? productQty
      : 99;

  const hasVariantOptions = useMemo(() => {
    if (!Array.isArray(variations) || variations.length === 0) return false;
    return variations.some((variation) =>
      Array.isArray(variation.attributes)
        && variation.attributes.some((attribute) => attribute?.name && attribute?.option)
    );
  }, [variations]);

  const installmentAmount = useMemo(() => {
    const variation = selectedVariation || product;
    const regular = Number.parseFloat(variation?.regular_price ?? product?.regular_price ?? 0);
    const sale = Number.parseFloat(variation?.sale_price ?? product?.sale_price ?? 0);
    const base = Number.parseFloat(variation?.price ?? product?.price ?? 0);
    const finalPrice = sale > 0 && regular > 0 && sale !== regular ? sale : base;

    if (!Number.isFinite(finalPrice) || finalPrice <= 0) return 0;
    return finalPrice / 4;
  }, [product, selectedVariation]);

  const selectedPrice = useMemo(() => {
    const variation = selectedVariation || product;
    const regular = Number.parseFloat(variation?.regular_price ?? product?.regular_price ?? 0);
    const sale = Number.parseFloat(variation?.sale_price ?? product?.sale_price ?? 0);
    const base = Number.parseFloat(variation?.price ?? product?.price ?? 0);
    const finalPrice = sale > 0 && regular > 0 && sale !== regular ? sale : base;

    if (!Number.isFinite(finalPrice) || finalPrice <= 0) return 0;
    return finalPrice;
  }, [product, selectedVariation]);

  const tamaraInstallments = useMemo(() => {
    const baseInstallment = Math.floor((selectedPrice / 4) * 100) / 100;
    const installments = Array.from({ length: 4 }, () => baseInstallment);
    const assignedTotal = baseInstallment * 4;
    installments[3] = Number((selectedPrice - assignedTotal + baseInstallment).toFixed(2));
    return installments;
  }, [selectedPrice]);

  const tamaraMinAmount = 99;
  const tamaraMaxAmount = 3000;
  const isTamaraEligible = selectedPrice >= tamaraMinAmount && selectedPrice <= tamaraMaxAmount;
  const paymentScheduleLabels = ['Today', 'In 1 month', 'In 2 months', 'In 3 months'];

  if (!product) return null;

  // Normalize clearance sale values
  const showClearance = product.show_clearance_sale === true || product.show_clearance_sale === 'yes';
  const clearanceEndTime = product.clearance_end_time
    ? product.clearance_end_time.replace(' ', 'T') // Convert "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SS"
    : null;

  const handleAddToCart = () => {
    const variation = selectedVariation || product;

    const itemToAdd = {
      id: variation.id,
      name: product.name,
      quantity,
      price: variation.price || product.price,
      image: variation.image?.src || product.images?.[0]?.src || '',
      variation: selectedVariation?.attributes || [],
    };

    addToCart(itemToAdd);
    setIsCartOpen(true);

    if (showClearance) navigate('/checkout');
  };

  const combinedBadges = [
    ...(product.custom_seller_badges || []),
    ...(product.best_seller_recommended_badges || []).map(b => {
      if (b === 'best_seller') return 'best_recommended';
      if (b === 'recommended') return 'best_recommended'; // optional, or create another key
      return b;
    })
  ];

  const deliveryRowStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '6px',
    marginBottom: '8px',
    position: 'relative',
    paddingRight: '34px',
    color: '#222222',
    fontFamily: 'miui, system-ui, -apple-system, BlinkMacSystemFont, ".SFNSText-Regular", Helvetica, Arial, sans-serif',
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
  };

  const deliveryIconStyle = {
    color: '#16a34a',
    fontSize: '13px',
    lineHeight: 1,
    marginTop: '4px',
    flexShrink: 0,
  };

  const deliveryLeadStyle = {
    color: '#15803d',
    fontWeight: 700,
  };

  const deliveryContentStyle = {
    display: 'block',
    flex: 1,
    width: '100%',
    minWidth: 0,
    textAlign: 'left',
  };

  const deliveryNameStyle = {
    display: 'block',
    minWidth: 0,
    textAlign: 'left',
    wordBreak: 'break-word',
    lineHeight: '24px',
    fontWeight: 400,
  };

  const deliveryShareWrapStyle = {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    top: '0px',
    right: '0px',
  };

  const preOrderInfo = (
    <>
      <button
        type="button"
        className="pi-preorder-note"
        onClick={() => setShowPreOrderPopup(true)}
        aria-label="Open pre-order delivery information"
      >
        <span className="pi-preorder-icon">!</span>
        <span>Pre-order. Delivery: 4-12 business days</span>
        <span className="pi-preorder-help">?</span>
      </button>

      {showPreOrderPopup && (
        <div
          className="pi-preorder-modal-overlay"
          onClick={() => setShowPreOrderPopup(false)}
          role="presentation"
        >
          <div
            className="pi-preorder-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Pre-order information"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="pi-preorder-close"
              onClick={() => setShowPreOrderPopup(false)}
              aria-label="Close pre-order information"
            >
              ×
            </button>

            <h3 className="pi-preorder-title">Pre-order</h3>
            <p className="pi-preorder-line">1. Pre-ordering items reduces excess waste caused by unsold inventory.</p>
            <p className="pi-preorder-line">2. If you place an order with pre-order items and other regular items, they will still be shipped together. No need to worry though! It&apos;s faster than you think!</p>

            <button
              type="button"
              className="pi-preorder-ok"
              onClick={() => setShowPreOrderPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );

  const shippingStats = [
    { label: '≤4 business days', percent: '21.4%', width: 42 },
    { label: '5 business days', percent: '35.7%', width: 64 },
    { label: '6 business days', percent: '16.8%', width: 34 },
    { label: '7 business days', percent: '11.5%', width: 22 },
    { label: '8 business days', percent: '6.9%', width: 14 },
    { label: '9 business days', percent: '3.3%', width: 8 },
    { label: '10 business days', percent: '2.4%', width: 6 },
    { label: '11 business days', percent: '0.6%', width: 4 },
    { label: '12 business days', percent: '0.4%', width: 4 },
    { label: '>12 business days', percent: '1.0%', width: 5 },
  ];

  return (
    <section className="pi-product-info">
      <OfferBox />
      <div className="pi-product-title-row"  style={{marginTop:"8px"}}>
        <div className="pi-badges-and-title">
          <div style={deliveryRowStyle} role="note" aria-label="Fastest delivery details">
            {/* <span style={deliveryIconStyle}></span> */}
            <span style={deliveryContentStyle}>
              <span style={deliveryNameStyle}>
                <span style={deliveryLeadStyle}>⚡ Fastest delivery: 2-5 BUSINESS DAYS </span>
                {product.name}
              </span>
              <span style={deliveryShareWrapStyle}>
                <ShareDropdown url={window.location.href} />
              </span>
            </span>
          </div>

          <ProductSubtitle
            subtitle={product.subtitle ?? product.product_subtitle ?? product.meta?.subtitle}
          />
          <div className="pi-badge-strip">
            <SellerBadges badges={combinedBadges} />
          </div>
          {/* <div className="pi-rating-strip">
            <ProductCardReviews
              productId={product.id}
              soldCount={product.total_sales || 0}
              overrideRating={isRatingCategoryProduct ? 5 : null}
            />
          </div> */}

          {product.sku && <p className="pi-product-sku">SKU: {product.sku}</p>}
          {brand && <p className="pi-product-brand">Brand: {brand}</p>}
        </div>
      </div>
    

      <PriceDisplay product={product} selectedVariation={selectedVariation} />
      {installmentAmount > 0 && (
        <>
          <button
            type="button"
            className="pi-installment-row"
            onClick={() => setShowInstallmentPopup(true)}
            aria-label="Open installment payment details"
          >
            <span className="pi-installment-text">4 interest-free installments of AED{installmentAmount.toFixed(2)} with</span>
            <span className="pi-installment-chip pi-installment-chip-tabby">tabby</span>
          </button>

          {showInstallmentPopup && (
            <div
              className="pi-installment-modal-overlay"
              onClick={() => setShowInstallmentPopup(false)}
              role="presentation"
            >
              <div
                className="pi-installment-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Installment information"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="pi-installment-modal-close"
                  onClick={() => setShowInstallmentPopup(false)}
                  aria-label="Close installment information"
                >
                  ×
                </button>

                <h3 className="pi-installment-modal-title">Shop now, pay later</h3>
                <p className="pi-installment-modal-subtitle">How it works:</p>
                <p className="pi-installment-modal-line">Select Tabby as your payment method at checkout to pay in interest free installments:</p>
                <p className="pi-installment-modal-line">pay in 4 interest free installments with <span className="pi-installment-chip pi-installment-chip-tabby">tabby</span></p>
                <p className="pi-installment-modal-line">pay in 4 interest free installments with <span className="pi-installment-chip pi-installment-chip-tamara">tamara</span></p>
                <p className="pi-installment-modal-note">Tabby services are available to any citizen and resident of Saudi Arabia, Kuwait or the UAE, over the age of 18.</p>
                <p className="pi-installment-modal-note">Tamara: By using the Tamara Services, you warrant and represent that you are over the age of eighteen (18) years. The process of registering the Tamara Account requires you to provide Tamara with certain personal information. Such information may include your full name, address, email, phone number, and age.</p>
              </div>
            </div>
          )}

          {showTamaraPopup && (
            <div
              className="pi-installment-modal-overlay"
              onClick={() => setShowTamaraPopup(false)}
              role="presentation"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Tamara payment information"
                onClick={(event) => event.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '380px',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  borderRadius: '28px',
                  background: '#f8fafc',
                  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.32)',
                  padding: '18px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <img
                    src={TamaraIcon}
                    alt="Tamara"
                    style={{ width: '92px', height: '34px', objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTamaraPopup(false)}
                    aria-label="Close Tamara information"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#0f172a',
                      fontSize: '28px',
                      lineHeight: 1,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    borderRadius: '24px',
                    padding: '22px 18px',
                    background: 'linear-gradient(135deg, #f6c68b 0%, #f8dec8 32%, #dbc8ff 100%)',
                    color: '#111827',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1, marginBottom: '10px' }}>
                    Pay your way
                  </div>
                  <div style={{ fontSize: '15px', lineHeight: 1.45, maxWidth: '240px' }}>
                    Split this purchase into 4 interest-free payments with Tamara.
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '16px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '18px', color: '#111827' }}>4 payments</strong>
                      <strong style={{ fontSize: '18px', color: '#111827' }}>AED {tamaraInstallments[0].toFixed(2)}/mo</strong>
                    </div>
                    <div style={{ color: '#059669', fontSize: '14px', fontWeight: 600 }}>No interest. No fees.</div>
                  </div>

                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '16px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Payment schedule</div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {tamaraInstallments.map((installment, index) => (
                        <div
                          key={`${paymentScheduleLabels[index]}-${installment}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '14px',
                            color: '#334155',
                            borderBottom: index === tamaraInstallments.length - 1 ? 'none' : '1px solid #e2e8f0',
                            paddingBottom: index === tamaraInstallments.length - 1 ? 0 : '10px',
                          }}
                        >
                          <span>{paymentScheduleLabels[index]}</span>
                          <strong style={{ color: '#111827' }}>AED {installment.toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '16px',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>How it works</div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {[
                        'Choose Tamara at checkout to split your order.',
                        'Complete your purchase with a quick approval flow.',
                        'Pay the remaining installments over the next 3 months.',
                      ].map((step, index) => (
                        <div key={step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '999px',
                              background: '#ede9fe',
                              color: '#6d28d9',
                              fontWeight: 700,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </div>
                          <div style={{ fontSize: '14px', lineHeight: 1.45, color: '#334155' }}>{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTamaraPopup(false)}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderRadius: '18px',
                    background: '#1e293b',
                    color: '#ffffff',
                    padding: '16px 18px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Continue shopping
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="pi-trust-list" aria-label="Shipping and order guarantee">
        <button type="button" className="pi-trust-row" onClick={() => setShowShippingPopup(true)}>
          <span className="pi-trust-icon">🚚</span>
          <span className="pi-trust-text">Free shipping for this item</span>
          <span className="pi-trust-arrow">›</span>
        </button>
        <div className="pi-trust-row pi-trust-row-static">
          <span className="pi-trust-icon">⚡</span>
          <span className="pi-trust-text">
            Fastest delivery in&nbsp; <span className="pi-trust-highlight">2-5 BUSINESS DAYS</span>
          </span>
        </div>
        <button type="button" className="pi-trust-row" onClick={() => setShowShippingPopup(true)}>
          <span className="pi-trust-icon">🛡️</span>
          <span className="pi-trust-text">Safe payments · Secure privacy</span>
          <span className="pi-trust-arrow">›</span>
        </button>
        <button type="button" className="pi-trust-row" onClick={() => setShowGuaranteePopup(true)}>
          <span className="pi-trust-icon">📦</span>
          <span className="pi-trust-text">Order guarantee</span>
          <span className="pi-trust-arrow">›</span>
        </button>

        <div className="pi-trust-tags-wrap">
          <div className="pi-trust-tags" role="list">
            <button type="button" role="listitem" className="pi-trust-tag" onClick={() => setShowGuaranteePopup(true)}>Free returns</button>
            <button type="button" role="listitem" className="pi-trust-tag" onClick={() => setShowGuaranteePopup(true)}>AED20.00 Credit for delay</button>
            <button type="button" role="listitem" className="pi-trust-tag" onClick={() => setShowGuaranteePopup(true)}>Return if item damaged</button>
            <button type="button" role="listitem" className="pi-trust-tag" onClick={() => setShowGuaranteePopup(true)}>30-day no update refund</button>
          </div>
          <button type="button" className="pi-trust-tags-next" onClick={() => setShowGuaranteePopup(true)} aria-label="Open order guarantee details">›</button>
        </div>
      </div>

      {showShippingPopup && (
        <div className="pi-trust-modal-overlay" onClick={() => setShowShippingPopup(false)} role="presentation">
          <div className="pi-trust-modal" role="dialog" aria-modal="true" aria-label="Shipping" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="pi-trust-close" onClick={() => setShowShippingPopup(false)} aria-label="Close shipping popup">×</button>
            <h3 className="pi-trust-title">Shipping</h3>

            <div className="pi-shipping-grid">
              <span className="pi-shipping-label">Delivery time</span>
              <span className="pi-shipping-value">4-12 business days</span>
              <span className="pi-shipping-label">Costs</span>
              <span className="pi-shipping-value">FREE</span>
            </div>

            <p className="pi-shipping-note">⚪ The above is only for items that are not shipped from local warehouses. If delivered after 27 Mar, you will get a AED20.00 credit within 48 hours.</p>

            <p className="pi-shipping-fast">Fastest delivery in 4 business days</p>

            <div className="pi-shipping-bars">
              {shippingStats.map((item) => (
                <div className="pi-shipping-bar-row" key={item.label}>
                  <span className="pi-shipping-bar-label">{item.label}</span>
                  <span className="pi-shipping-bar-track"><span className="pi-shipping-bar-fill" style={{ width: `${item.width}%` }} /></span>
                  <span className="pi-shipping-bar-percent">{item.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showGuaranteePopup && (
        <div className="pi-trust-modal-overlay" onClick={() => setShowGuaranteePopup(false)} role="presentation">
          <div className="pi-trust-modal pi-trust-modal-guarantee" role="dialog" aria-modal="true" aria-label="Order guarantee" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="pi-trust-close" onClick={() => setShowGuaranteePopup(false)} aria-label="Close order guarantee popup">×</button>
            <h3 className="pi-trust-title">Order guarantee</h3>

            <div className="pi-guarantee-item">
              <div className="pi-guarantee-number">1</div>
              <div>
                <p className="pi-guarantee-head">Free returns within 90 days of purchase</p>
                <p className="pi-guarantee-text">The first return of one or multiple returnable items for EVERY order is free!</p>
                <p className="pi-guarantee-text">This item can be returned within 90 days from the date of purchase.</p>
                <p className="pi-guarantee-text">If the returned item is used or damaged, or has missing parts/accessories, and this is not due to Temu or the seller, the refund will be reduced to compensate for the lost value of the item.</p>
                <p className="pi-guarantee-link">For more exceptions and details about the policy, please refer to our policy page</p>
              </div>
            </div>

            <div className="pi-guarantee-item">
              <div className="pi-guarantee-number">2</div>
              <div>
                <p className="pi-guarantee-head">AED20.00 Credit for delay</p>
                <p className="pi-guarantee-text">If your order isn&apos;t delivered on or before the latest delivery date provided to you, as a gesture of courtesy, we offer you a AED20.00 credit (Standard Shipping) within 48 hours of that date. The credit will be issued to your Temu credit balance and can be used on your next order.</p>
                <p className="pi-guarantee-text">Under specific circumstances, including but not limited to natural disasters and other unforeseeable circumstances, you may not be able to receive compensation for late delivery.</p>
                <p className="pi-guarantee-link">For more exceptions and details about the policy, please refer to our policy page</p>
              </div>
            </div>

            <div className="pi-guarantee-item">
              <div className="pi-guarantee-number">3</div>
              <div>
                <p className="pi-guarantee-head">Return if item damaged</p>
                <p className="pi-guarantee-text">If you receive your package and find that some items are lost or damaged in transit, rest assured that you can easily apply for a full refund for those items.</p>
              </div>
            </div>

            <div className="pi-guarantee-item">
              <div className="pi-guarantee-number">4</div>
              <div>
                <p className="pi-guarantee-head">30-day no update refund</p>
                <p className="pi-guarantee-text">If your package has no tracking updates for over 30 days and has not been delivered, you can request a free reshipment or refund because the package may have been lost in transit. If you receive the package after your request has been approved, you may be allowed to keep it for free in certain circumstances without needing to return it.</p>
                <p className="pi-guarantee-text">In certain circumstances, including but not limited to natural disasters and other force majeure circumstances, you may not be able to receive compensation or request a refund if there have not been updates.</p>
                <p className="pi-guarantee-link">For more exceptions and details about the policy, please refer to our policy page</p>
              </div>
            </div>

            <div className="pi-guarantee-item">
              <div className="pi-guarantee-number">5</div>
              <div>
                <p className="pi-guarantee-head">55-day no delivery refund</p>
                <p className="pi-guarantee-text">If your package isn&apos;t delivered within 55 days after shipment (5 days more for packages shipped via truck or packages weighing 80 kg or more), you can request a free reshipment or refund. If you receive the package after your request has been approved, you may be allowed to keep it for free in certain circumstances without needing to return it.</p>
                <p className="pi-guarantee-text">In certain circumstances, including but not limited to natural disasters and other force majeure circumstances, you may not be able to request a free reshipment or a refund if your order wasn&apos;t delivered.</p>
                <p className="pi-guarantee-link">For more exceptions and details about the policy, please refer to our policy page</p>
              </div>
            </div>

            <div className="pi-guarantee-item">
              <div className="pi-guarantee-number">6</div>
              <div>
                <p className="pi-guarantee-head">Cash on Delivery</p>
                <p className="pi-guarantee-text">Cash on Delivery is a payment option supported by sellers for customers in Saudi Arabia, Kuwait, the United Arab Emirates, Qatar, Oman, Bahrain, Jordan, the Republic of Poland, and Malaysia, where customers can pay in cash upon delivery of the parcel.</p>
              </div>
            </div>

            <div className="pi-guarantee-item">
              <div className="pi-guarantee-number">7</div>
              <div>
                <p className="pi-guarantee-head">Price adjustment within 30 days of payment</p>
                <p className="pi-guarantee-text">Items purchased from Temu are eligible for our price adjustment policy. Temu will provide the price difference in the currency that the order was paid in if the selling price of the item purchased was reduced within 30 days of payment in the same country or region. The shipment of your order will not be affected by applying for a price adjustment before you receive your item(s). You can request a price adjustment refund by selecting the relevant order in 'Your Orders' and clicking on the 'Price adjustment' button.</p>
                <p className="pi-guarantee-text">Items that are promotional or no longer available may not be eligible for our price adjustment policy. Fees, including but not limited to shipping fees, will be excluded for any price adjustment calculation. Temu reserves the right to the final interpretation of our price adjustment policy, the right to modify the terms of this policy at any time, and the right to deny any price adjustment at our sole discretion.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <ProductShortDescription
        productSlug={product.slug}
        shortDescription={
          product.short_description ?? product.shortdesc ?? product.shortDescription
        }
      /> */}

      {showClearance && clearanceEndTime ? (
        <ClearanceSaleBox endTime={clearanceEndTime} style={{padding: '50px', background:"red"}}>
          {hasVariantOptions ? (
            <div className="variant-quantity-panel">
              <div className="variant-quantity-panel-header" role="note" aria-label="Sale countdown">
                <span className="variant-sale-label">Big sale</span>
                {/* <span className="variant-sale-timer">Ends in 02:13:03:27</span> */}
                <span className="variant-sale-arrow">›</span>
              </div>
              <ProductVariants
                variations={variations}
                selectedVariation={selectedVariation}
                onVariationChange={onVariationChange}
              />
              {preOrderInfo}
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                maxQuantity={maxQuantity}
                mode="compact"
              />
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                maxQuantity={maxQuantity}
              />
            </div>
          )}
        </ClearanceSaleBox>
      ) : (
        <>
          {hasVariantOptions ? (
            <div className="variant-quantity-panel">
              <div className="variant-quantity-panel-header" role="note" aria-label="Sale countdown">
                <span className="variant-sale-label">Big sale</span>
                {/* <span className="variant-sale-timer">Ends in 02:13:03:27</span> */}
                <span className="variant-sale-arrow">›</span>
              </div>
              <ProductVariants
                variations={variations}
                selectedVariation={selectedVariation}
                onVariationChange={onVariationChange}
                maxQuantity={maxQuantity}
              />
              {preOrderInfo}
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                maxQuantity={maxQuantity}
                mode="compact"
              />
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                maxQuantity={maxQuantity}
              />
            </div>
          )}
        </>
      )}

<MobileStickyCart
  quantity={quantity}
  setQuantity={setQuantity}
  maxQuantity={maxQuantity}
  product={product}
  selectedVariation={selectedVariation}
  hasVariantOptions={hasVariantOptions}
  showClearance={showClearance}
  handleAddToCart={handleAddToCart}
/>

      {!isMobile && (
        <>
          <ButtonSection
            product={product}
            selectedVariation={selectedVariation}
            quantity={quantity}
            hasVariantOptions={hasVariantOptions}
            isClearance={showClearance}
            handleAddToCart={handleAddToCart}
          />
          <button
            type="button"
            onClick={() => {
              if (isTamaraEligible) setShowTamaraPopup(true);
            }}
            aria-label={
              isTamaraEligible
                ? 'Open Tamara installment details'
                : `Tamara is available for orders between AED ${tamaraMinAmount} and AED ${tamaraMaxAmount}`
            }
            disabled={!isTamaraEligible}
            style={{
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              width: '100%',
              padding: isMobile ? '9px 12px' : '10px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '7px',
              background: '#fff',
              color: '#111827',
              cursor: isTamaraEligible ? 'pointer' : 'not-allowed',
              boxSizing: 'border-box',
              minHeight: isMobile ? '50px' : '56px',
              opacity: isTamaraEligible ? 1 : 0.78,
            }}
          >
            <span
              style={{
                fontSize: isMobile ? '11px' : '12px',
                lineHeight: 1.3,
                textAlign: 'left',
                flex: 1,
              }}
            >
              {isTamaraEligible ? (
                <>
                  As low as <strong>AED {tamaraInstallments[0].toFixed(2)}/month</strong> or 4 interest-free payments. <strong>Learn more</strong>
                </>
              ) : (
                <>
                  Tamara is available for orders between <strong>AED {tamaraMinAmount}</strong> and <strong>AED {tamaraMaxAmount}</strong>.
                </>
              )}
            </span>
            <img
              src={TamaraIcon}
              alt="Tamara"
              style={{
                width: isMobile ? '64px' : '74px',
                height: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
                filter: isTamaraEligible ? 'none' : 'grayscale(0.2)',
              }}
            />
          </button>
        </>
      )}

      {hasItemDetails && (
        <ItemDetailsTable
          postId={product.id}
          postType="posts"
          onHasData={(exists) => setHasItemDetails(exists)}
        />
      )}

      {/* <OrderPerks /> */}
    </section>
  );
}
