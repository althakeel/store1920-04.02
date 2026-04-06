import React from 'react';

const principles = [
  'Comply with all applicable laws, regulations, and product-safety requirements in the markets they serve.',
  'Provide accurate product information, pricing, stock status, and fulfilment expectations.',
  'Respect customer privacy and only use personal information for legitimate order and service needs.',
  'Avoid counterfeit goods, misleading claims, deceptive listings, and intellectual-property infringement.',
  'Maintain responsible labour practices, fair treatment, and safe working conditions within their operations.',
  'Cooperate with Store1920 investigations, quality reviews, and corrective-action requests when issues arise.',
];

const CodeOfConduct = () => {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '48px 20px 72px',
        fontFamily: "'Montserrat', sans-serif",
        color: '#222',
        lineHeight: 1.8,
      }}
    >
      <h1 style={{ marginBottom: 12, fontSize: 36, fontWeight: 800 }}>Store1920 Partner Code of Conduct</h1>
      <p style={{ marginTop: 0, marginBottom: 24, color: '#555', fontWeight: 600 }}>Last updated: April 6, 2026</p>
      <p style={{ color: '#4a4a4a' }}>
        Store1920 expects suppliers, service providers, logistics partners, affiliates, and other commercial partners to operate responsibly and consistently with the standards outlined on this page. These expectations support customer trust, product quality, legal compliance, and ethical business conduct across our marketplace activities.
      </p>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 24 }}>Core Expectations</h2>
      <ul style={{ paddingLeft: 22, color: '#4a4a4a' }}>
        {principles.map((principle) => (
          <li key={principle} style={{ marginBottom: 10 }}>
            {principle}
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 24 }}>Operational Standards</h2>
      <p style={{ color: '#4a4a4a' }}>
        Partners are expected to maintain records that support traceability, product authenticity, and compliance reviews. Store1920 may request supporting documentation, investigate reported issues, suspend non-compliant listings, or pause collaboration where serious concerns arise regarding safety, legality, fraud, or customer harm.
      </p>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 24 }}>Reporting Concerns</h2>
      <p style={{ color: '#4a4a4a' }}>
        Questions about this Code of Conduct or suspected non-compliance may be sent to <a href="mailto:legal@store1920.com">legal@store1920.com</a>. We review credible reports and may request corrective action, supporting information, or additional assurances before partnership activity continues.
      </p>
    </div>
  );
};

export default CodeOfConduct;
