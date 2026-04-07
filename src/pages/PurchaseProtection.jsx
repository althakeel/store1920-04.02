import React from 'react';
import '../assets/styles/PurchaseProtection.css';

const protectionAreas = [
  {
    title: 'Order not received',
    text: 'If an eligible order does not arrive within the expected timeframe, our team reviews tracking, shipment status, and next steps for refund or reshipment support.',
  },
  {
    title: 'Wrong or damaged item',
    text: 'If the delivered item is materially different from what was ordered or arrives damaged in transit, we review the case and help guide the return, replacement, or refund process.',
  },
  {
    title: 'Return and refund support',
    text: 'Where an item qualifies under Store1920 policies, we provide guidance on how to open a request, submit evidence, and follow the refund review process.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Submit the issue',
    text: 'Contact Store1920 support with your order number, the problem you experienced, and any useful supporting details such as delivery updates or item photos.',
  },
  {
    number: '02',
    title: 'Case review',
    text: 'Our team reviews the order history, shipment details, policy eligibility, and any evidence shared so we can determine the appropriate resolution path.',
  },
  {
    number: '03',
    title: 'Resolution',
    text: 'When approved, we proceed with the relevant solution, which may include a refund, replacement guidance, return instructions, or additional support steps.',
  },
];

const PurchaseProtection = () => {
  return (
    <div className="purchase-protection-wrapper">
      <section className="pp-banner-section">
        <div className="pp-container pp-banner-content">
          <div>
            <h2>Store1920 Purchase Protection</h2>
            <p>
              Store1920 is committed to a safer shopping experience with clear post-purchase support. This page explains the kinds of order issues our support team can review and how customers can request help when something goes wrong.
            </p>
          </div>
        </div>
      </section>

      <section className="pp-info-section">
        <div className="pp-container pp-info-content">
          <div className="pp-text-content">
            <h3>What Purchase Protection Covers</h3>
            <p>
              Purchase Protection is designed to support customers when an eligible order does not arrive as expected, arrives damaged, or requires a policy-based return or refund review. Final outcomes depend on the facts of the order, the applicable policy, and the information available during the case review.
            </p>
            <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
              {protectionAreas.map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: '1px solid #e6e6e6',
                    background: '#fff',
                  }}
                >
                  <h4 style={{ margin: '0 0 8px', fontSize: 18 }}>{item.title}</h4>
                  <p style={{ margin: 0, lineHeight: 1.7 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="pp-image-content">
            <div
              style={{
                width: '100%',
                minHeight: 260,
                borderRadius: 22,
                padding: '28px 24px',
                background: 'linear-gradient(135deg, #fff4eb 0%, #ffffff 100%)',
                border: '1px solid #f1dfd2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 14 }}>When to contact support</h3>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Your tracking updates stop for an unusual amount of time.</li>
                <li>Your parcel arrives with missing, damaged, or incorrect items.</li>
                <li>You need policy guidance on returns, refunds, or delivery concerns.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pp-refund-section">
        <div className="pp-container">
          <h3>How the review process works</h3>
          <div className="pp-steps-wrapper">
            {steps.map((step) => (
              <div className="pp-step-card" key={step.number}>
                <div className="pp-step-number">{step.number}</div>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 28,
              padding: '22px 20px',
              borderRadius: 18,
              background: '#ffffff',
              border: '1px solid #ececec',
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: 10 }}>Important note</h4>
            <p style={{ margin: 0, lineHeight: 1.8 }}>
              Purchase Protection does not override every policy condition automatically. Some requests may require evidence, item return, shipment verification, or additional review before a final decision is made. For full rules, customers should also review the return policy, shipping information, and support guidance available on the site.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PurchaseProtection;
