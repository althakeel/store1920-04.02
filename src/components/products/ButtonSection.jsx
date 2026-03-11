import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/ButtonSection.css';
import { useCart } from '../../contexts/CartContext';

export default function ButtonSection({ product, selectedVariation, quantity, isClearance, hasVariantOptions = false }) {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const variation = selectedVariation || product;

  const addCurrentItemToCart = () => {
    const itemId = variation.id;
    const itemPrice = variation.price || product.price;

    const itemToAdd = {
      id: itemId,
      name: product.name,
      quantity: quantity,
      price: itemPrice,
      image: variation.image?.src || product.images?.[0]?.src || '',
      variation: selectedVariation?.attributes || [],
    };

    addToCart(itemToAdd);
    setIsCartOpen(true);
  };

  const handleAddToCart = () => {
    addCurrentItemToCart();

    if (isClearance) {
      navigate('/checkout');
    }
  };

  const handleGoToCart = () => {
    addCurrentItemToCart();
    navigate('/cart');
  };
  const handleGoToCheckout = () => {
    addCurrentItemToCart();
    navigate('/checkout');
  };

  const parsePrice = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const regularPrice = parsePrice(variation?.regular_price ?? product?.regular_price);
  const fallbackPrice = parsePrice(variation?.price ?? product?.price);
  const salePrice = parsePrice(variation?.sale_price ?? product?.sale_price) || fallbackPrice;
  const hasDiscount = regularPrice > 0 && salePrice > 0 && salePrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.max(1, Math.round(((regularPrice - salePrice) / regularPrice) * 100))
    : 0;

  const requiresVariantSelection = Boolean(hasVariantOptions);
  const hasSelectedVariant = Boolean(selectedVariation?.id);
  const shouldShowSelectOption = requiresVariantSelection && !hasSelectedVariant;
  const shouldShowSaleAddToCart = requiresVariantSelection && hasSelectedVariant && !isClearance;
  const saleButtonLabel = hasDiscount
    ? `-${discountPercent}% off now! Add to cart!`
    : 'Add to cart';

  const handleSelectOption = () => {
    const optionsPanel = document.querySelector('.variant-quantity-panel');
    if (optionsPanel) {
      optionsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // -------------------------------
  // ⭐ TABBY WIDGET LOADER
  // -------------------------------
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.tabby.ai/tabby-promo.js';
    script.onload = () => {
      if (window.TabbyPromo) {
        new window.TabbyPromo({
          selector: '#TabbyPromo',
          currency: 'AED',
          price: String(variation?.price || product?.price || "0.00"),
          lang: 'en',
          source: 'product',
          shouldInheritBg: false,
          publicKey: 'your_pk',
          merchantCode: 'your_merchant_code'
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Only remove script, not the widget
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [variation]);

  return (
    <>
      {shouldShowSelectOption ? (
        <div className="button-section">
          <button className="select-option-btn" onClick={handleSelectOption} type="button">
            Select an option
          </button>
        </div>
      ) : shouldShowSaleAddToCart ? (
        <div className="button-section button-section--single">
          <button className="sale-add-to-cart-btn" onClick={addCurrentItemToCart} type="button">
            <span className="sale-add-to-cart-main">{saleButtonLabel}</span>
            <span className="sale-add-to-cart-sub">Delivery in 2-5 business days</span>
          </button>
        </div>
      ) : isClearance ? (
        <div className="button-section">
          <button className="buy-now-btn" onClick={handleAddToCart}>
            Buy Now
          </button>
        </div>
      ) : (
        <div className="button-section">
          <button className="go-to-cart-btn" onClick={handleGoToCart}>
            Add to Cart
          </button>
          <button className="go-to-checkout-btn" onClick={handleGoToCheckout}>
            Buy Now
          </button>
        </div>
      )}

      {/* ⭐⭐⭐ TABBY PROMO WIDGET BELOW BUTTONS ⭐⭐⭐ */}
      <div id="TabbyPromo" style={{ marginTop: '15px', marginBottom: '10px' }}></div>
    </>
  );
}
 