import React from 'react';

const shippingRows = [
  ['Within Dubai', '1-2 business days', 'Free on orders above AED 150, otherwise AED 15'],
  ['Within UAE outside Dubai', '2-4 business days', 'AED 25 flat rate'],
  ['Fast delivery within UAE', 'Same day or next day where available', 'AED 50'],
  ['GCC shipping', '3-6 business days', 'AED 70 flat rate'],
  ['Other international destinations', '5-10 business days', 'Calculated at checkout'],
];

const shippingNotes = [
  'Delivery times are estimates and may vary during peak sales periods, public holidays, customs reviews, or weather-related disruptions.',
  'Tracking details are provided after dispatch so customers can follow the progress of an order.',
  'Availability of fast delivery may depend on item type, warehouse location, destination, and order cut-off times.',
];

const ShippingInfo = () => {
  return (
    <div
      style={{
        maxWidth: 1140,
        margin: '0 auto',
        padding: '40px 20px 72px',
        fontFamily: "'Montserrat', sans-serif",
        color: '#222',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #fff4eb 0%, #ffffff 50%, #f8f8f8 100%)',
          border: '1px solid #f2dfd0',
          borderRadius: 24,
          padding: '30px 28px',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            marginBottom: 16,
            padding: '8px 14px',
            borderRadius: 999,
            background: '#fff2e8',
            color: '#ff6a00',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Shipping Information
        </div>
        <h1 style={{ margin: '0 0 14px', fontSize: 38, lineHeight: 1.1, fontWeight: 800 }}>
          Delivery timelines and shipping support for Store1920 orders.
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: '#4a4a4a', maxWidth: 860 }}>
          This page explains the standard delivery windows, shipping charges, and key expectations customers should know before and after placing an order. Final timelines may vary depending on the destination, item availability, and shipping method selected at checkout.
        </p>
      </div>

      <div
        style={{
          overflow: 'hidden',
          borderRadius: 18,
          border: '1px solid #e8e8e8',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          marginBottom: 28,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#fff',
          }}
        >
          <thead style={{ backgroundColor: '#faf4ef' }}>
            <tr>
              <th style={headerCell}>Shipping area</th>
              <th style={headerCell}>Estimated delivery time</th>
              <th style={headerCell}>Shipping cost</th>
            </tr>
          </thead>
          <tbody>
            {shippingRows.map((row, index) => (
              <tr key={row[0]} style={{ background: index % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                <td style={bodyCell}>{row[0]}</td>
                <td style={bodyCell}>{row[1]}</td>
                <td style={bodyCell}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <section style={cardStyle}>
          <h2 style={cardTitle}>Before your order ships</h2>
          <p style={cardText}>
            Orders are reviewed, confirmed, packed, and prepared for dispatch before a tracking update becomes available. Processing time may differ by item type, warehouse source, and chosen shipping method.
          </p>
        </section>

        <section style={cardStyle}>
          <h2 style={cardTitle}>After dispatch</h2>
          <p style={cardText}>
            Once shipped, you can use the order tracking tools and shipping updates provided by Store1920 to monitor progress. If there is an unusual delay, customers should contact support with the order number for assistance.
          </p>
        </section>

        <section style={cardStyle}>
          <h2 style={cardTitle}>Important delivery notes</h2>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, color: '#4b5563', fontSize: 14 }}>
            {shippingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

const headerCell = {
  padding: '14px 16px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: 15,
  borderBottom: '1px solid #e8e8e8',
};

const bodyCell = {
  padding: '14px 16px',
  fontSize: 14,
  lineHeight: 1.7,
  color: '#444',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'top',
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #ececec',
  borderRadius: 18,
  padding: '22px 20px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
};

const cardTitle = {
  marginTop: 0,
  marginBottom: 10,
  fontSize: 22,
  fontWeight: 800,
};

const cardText = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.8,
  color: '#4b5563',
};

export default ShippingInfo;
