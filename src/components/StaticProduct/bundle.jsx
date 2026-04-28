import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import TamaraIcon from "../../assets/images/Footer icons/6.webp";

const Bundle = ({ product, bundles, selected, setSelected }) => {
  const [variants, setVariants] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showTamaraModal, setShowTamaraModal] = useState(false);
  const { addToCart } = useCart();
  const selectedBundlePrice = Number(bundles?.[selected]?.price || 0);
  const tamaraMinAmount = 99;
  const tamaraMaxAmount = 3000;
  const isTamaraEligible = selectedBundlePrice >= tamaraMinAmount && selectedBundlePrice <= tamaraMaxAmount;
  const getInstallmentAmounts = (amount) => {
    const normalizedAmount = Number(amount) || 0;
    const baseInstallment = Math.floor((normalizedAmount / 4) * 100) / 100;
    const installments = Array.from({ length: 4 }, () => baseInstallment);
    const assignedTotal = baseInstallment * 4;
    installments[3] = Number((normalizedAmount - assignedTotal + baseInstallment).toFixed(2));
    return installments;
  };
  const tamaraInstallments = getInstallmentAmounts(selectedBundlePrice);
  const tamaraInstallmentAmount = tamaraInstallments[0] || 0;
  const paymentScheduleLabels = ["Today", "In 1 month", "In 2 months", "In 3 months"];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!showTamaraModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowTamaraModal(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showTamaraModal]);

  // Native Tabby promo widget (includes Learn more popup from Tabby)
  useEffect(() => {
    let script = document.querySelector('script[src="https://checkout.tabby.ai/tabby-promo.js"]');

    const initTabbyPromo = () => {
      if (!window.TabbyPromo) return;

      const target = document.querySelector("#TabbyPromoBundle");
      if (target) target.innerHTML = "";

      new window.TabbyPromo({
        selector: "#TabbyPromoBundle",
        currency: "AED",
        price: String(selectedBundlePrice.toFixed(2)),
        lang: "en",
        source: "product",
        shouldInheritBg: false,
        publicKey: "your_pk",
        merchantCode: "your_merchant_code",
      });
    };

    if (window.TabbyPromo) {
      initTabbyPromo();
      return undefined;
    }

    if (!script) {
      script = document.createElement("script");
      script.src = "https://checkout.tabby.ai/tabby-promo.js";
      script.async = true;
      script.onload = initTabbyPromo;
      document.body.appendChild(script);
    } else {
      script.addEventListener("load", initTabbyPromo, { once: true });
    }

    return () => {
      const target = document.querySelector("#TabbyPromoBundle");
      if (target) target.innerHTML = "";
    };
  }, [selectedBundlePrice]);

  // Handle variant selection
  const handleVariantChange = (bundleIndex, productIndex, color) => {
    setVariants((prev) => ({
      ...prev,
      [`${bundleIndex}-${productIndex}`]: color,
    }));
  };

  // Format price
  const formatAED = (value) => `AED ${value.toFixed(2)}`;

  // Handle Buy Now click
  const handleBuyNow = () => {
    const bundle = bundles[selected];

    const bundleImage =
      bundle.image || bundle.images?.[0] || bundle.productImage || null;

    const selectedBundleId = bundle?.wooId || bundle?.id || product?.wooId || product?.id || 0;
    const rawBundleName = typeof bundle?.name === "string" ? bundle.name.trim() : "";
    const bundleNameLooksLikeSlug = rawBundleName && /^[a-z0-9-]+$/i.test(rawBundleName);
    const baseProductName = (
      product?.name ||
      bundle?.productName ||
      (bundleNameLooksLikeSlug ? "" : rawBundleName) ||
      bundle?.type ||
      "Product"
    ).trim();
    const bundleType = String(bundle?.type || "").trim();
    const selectedBundleName = baseProductName;
    const selectedBundleDisplayName = bundleType && !baseProductName.toLowerCase().includes(bundleType.toLowerCase())
      ? `${baseProductName} - ${bundleType}`
      : baseProductName;

    // Fallback for projector bundle 1 price
    let fixedPrice = bundle.price;
    if ((bundle.id === 526258 || bundle.name === "Mini Portable Smart Projector") && (!fixedPrice || fixedPrice === 0)) {
      fixedPrice = 159.0;
    }

    // Add price validation for Quran speaker and other products
    if ((!fixedPrice || fixedPrice === 0) && bundle.price) {
      fixedPrice = bundle.price;
    }

    const bundleToCart = {
      id: selectedBundleId,
      productId: selectedBundleId,
      wooId: selectedBundleId,
      isStaticProduct: true,
      parentProductId: product?.wooId || product?.id || null,
      name: selectedBundleName,
      displayName: selectedBundleDisplayName,
      bundleType,
      price: fixedPrice,
      originalPrice: bundle.originalPrice,
      quantity: 1,
      variation: variants,
      image: bundleImage,
    };

    addToCart(bundleToCart, false);

    const query = new URLSearchParams({
      type: bundleToCart.displayName || bundleToCart.name,
      price: bundleToCart.price,
      quantity: bundleToCart.quantity,
      image: bundleImage,
    });

    window.location.href = `/checkout?${query.toString()}`;
  };

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>

      {/* Bundles */}
      {bundles.map((bundle, index) => {
        const totalSavings = bundle.originalPrice - bundle.price;
        const isSelected = selected === index;

        return (
          <div
            key={index}
            style={{
              borderRadius: "12px",
              border: isSelected ? "2px solid #e17a7a" : "1px solid #ddd",
              background: isSelected ? "#fff8f8" : "#fff",
              padding: "16px",
              marginBottom: "16px",
              position: "relative",
              transition: "all 0.2s ease",
            }}
          >
            {/* MOST POPULAR */}
            {bundle.mostPopular && (
              <div
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-2px",
                  background: "#d45a5a",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "bold",
                  padding: "4px 10px",
                  borderRadius: "0 0 0 6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                MOST POPULAR
              </div>
            )}

            {/* Info + Price */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                marginBottom: "10px",
              }}
              onClick={() => setSelected(index)}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
                  {bundle.type}
                </p>
                {bundle.note && (
                  <p
                    style={{ fontSize: "13px", color: "#777", margin: "2px 0" }}
                  >
                    {bundle.note}
                  </p>
                )}
                <span
                  style={{
                    display: "inline-block",
                    background: "#f9e4e4",
                    color: "#b14b4b",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginTop: "4px",
                  }}
                >
                  You Save {formatAED(totalSavings)}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    color: "#b95410",
                    margin: 0,
                  }}
                >
                  {formatAED(bundle.price)}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#999",
                    textDecoration: "line-through",
                    margin: 0,
                  }}
                >
                  {formatAED(bundle.originalPrice)}
                </p>
              </div>

              <input
                type="radio"
                name="bundle"
                checked={isSelected}
                onChange={() => setSelected(index)}
                style={{ marginLeft: "12px", accentColor: "#d45a5a" }}
              />
            </div>

            {/* Color options */}
            {bundle.colors &&
              bundle.colors.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#777",
                      marginRight: "8px",
                      width: "20px",
                    }}
                  >
                    #{i + 1}
                  </span>

                  {row.map((c, j) => {
                    const key = `${index}-${i}`;
                    const isSelectedColor = variants[key] === c;
                    return (
                      <div
                        key={j}
                        onClick={() => handleVariantChange(index, i, c)}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: isSelectedColor
                            ? "2px solid #d45a5a"
                            : "1px solid #ccc",
                          marginRight: "6px",
                          background: c,
                          cursor: "pointer",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
          </div>
        );
      })}

      {/* Buy Now Button */}
      <div
        style={{
          textAlign: "center",
          marginTop: isMobile ? "0" : "20px",
          position: isMobile ? "fixed" : "static",
          bottom: isMobile ? "0" : "auto",
          left: isMobile ? "0" : "auto",
          width: isMobile ? "100%" : "auto",
          background: isMobile ? "#fff" : "transparent",
          boxShadow: isMobile ? "0 -2px 8px rgba(0,0,0,0.1)" : "none",
          padding: isMobile ? "10px" : "0",
          zIndex: 999,
        }}
      >
        <button
          onClick={handleBuyNow}
          style={{
            background: "#d45a5a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease",
          }}
        >
          Buy Now – AED {bundles[selected]?.price.toFixed(2)}
        </button>

        <div id="TabbyPromoBundle" style={{ marginTop: "12px" }}></div>

        {isTamaraEligible && (
          <button
            type="button"
            onClick={() => setShowTamaraModal(true)}
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              width: "100%",
              padding: "9px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: "7px",
              background: "#fff",
              color: "#111827",
              cursor: "pointer",
              boxSizing: "border-box",
              minHeight: isMobile ? "50px" : "58px",
            }}
            aria-label="Open Tamara installment details"
          >
            <span
              style={{
                fontSize: isMobile ? "11px" : "12px",
                lineHeight: 1.3,
                textAlign: "left",
                flex: 1,
              }}
            >
              As low as <strong>{formatAED(tamaraInstallmentAmount)}/month</strong> or 4 interest-free payments. <strong>Learn more</strong>
            </span>
            <img
              src={TamaraIcon}
              alt="Tamara"
              style={{
                width: isMobile ? "64px" : "74px",
                height: "auto",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          </button>
        )}

        {showTamaraModal && (
          <div
            onClick={() => setShowTamaraModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.58)",
              zIndex: 25000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "12px" : "20px",
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Tamara payment information"
              style={{
                width: "100%",
                maxWidth: "380px",
                maxHeight: "92vh",
                overflowY: "auto",
                borderRadius: "28px",
                background: "#f8fafc",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.32)",
                padding: "18px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <img
                  src={TamaraIcon}
                  alt="Tamara"
                  style={{ width: "92px", height: "34px", objectFit: "contain" }}
                />
                <button
                  type="button"
                  onClick={() => setShowTamaraModal(false)}
                  aria-label="Close Tamara information"
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#0f172a",
                    fontSize: "28px",
                    lineHeight: 1,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  borderRadius: "24px",
                  padding: "22px 18px",
                  background: "linear-gradient(135deg, #f6c68b 0%, #f8dec8 32%, #dbc8ff 100%)",
                  color: "#111827",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "34px", fontWeight: 800, lineHeight: 1, marginBottom: "10px" }}>
                  Pay your way
                </div>
                <div style={{ fontSize: "15px", lineHeight: 1.45, maxWidth: "240px" }}>
                  Split this purchase into 4 interest-free payments with Tamara.
                </div>
              </div>

              <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "18px", color: "#111827" }}>4 payments</strong>
                    <strong style={{ fontSize: "18px", color: "#111827" }}>{formatAED(tamaraInstallmentAmount)}/mo</strong>
                  </div>
                  <div style={{ color: "#059669", fontSize: "14px", fontWeight: 600 }}>No interest. No fees.</div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>Payment schedule</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {tamaraInstallments.map((installment, index) => (
                      <div
                        key={`${paymentScheduleLabels[index]}-${installment}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "14px",
                          color: "#334155",
                          borderBottom: index === tamaraInstallments.length - 1 ? "none" : "1px solid #e2e8f0",
                          paddingBottom: index === tamaraInstallments.length - 1 ? 0 : "10px",
                        }}
                      >
                        <span>{paymentScheduleLabels[index]}</span>
                        <strong style={{ color: "#111827" }}>{formatAED(installment)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>How it works</div>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {[
                      "Choose Tamara at checkout to split your order.",
                      "Complete your purchase with a quick approval flow.",
                      "Pay the remaining installments over the next 3 months.",
                    ].map((step, index) => (
                      <div key={step} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "999px",
                            background: "#ede9fe",
                            color: "#6d28d9",
                            fontWeight: 700,
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div style={{ fontSize: "14px", lineHeight: 1.45, color: "#334155" }}>{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTamaraModal(false)}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "18px",
                  background: "#1e293b",
                  color: "#ffffff",
                  padding: "16px 18px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bundle;
