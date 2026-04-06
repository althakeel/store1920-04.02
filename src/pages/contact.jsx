import React, { useState } from 'react';

const inquiryTypes = [
  'Customer support',
  'Partnerships and collaborations',
  'Wholesale and sourcing',
  'Logistics and delivery services',
  'Media and business enquiries',
];

const contactCards = [
  {
    title: 'Customer Support',
    details: 'For order updates, returns, payments, and general account help.',
    contact: 'support@store1920.com',
  },
  {
    title: 'Partnerships',
    details: 'For affiliate opportunities, brand collaborations, and strategic partnerships.',
    contact: 'partners@db.store1920.com',
  },
  {
    title: 'Sourcing and Logistics',
    details: 'For product sourcing, wholesale supply, and fulfilment enquiries.',
    contact: 'merchandise@db.store1920.com / shipping@db.store1920.com',
  },
];

const Contact = () => {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div
      style={{
        fontFamily: "'Montserrat', sans-serif",
        background: '#fff',
        color: '#222',
        padding: '40px 20px 72px',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            alignItems: 'start',
            marginBottom: 42,
          }}
        >
          <div>
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
              Contact Store1920
            </div>
            <h1 style={{ fontSize: 38, lineHeight: 1.1, margin: '0 0 16px', fontWeight: 800 }}>
              Support, business enquiries, and partnership requests in one place.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#4a4a4a', marginBottom: 18 }}>
              Use this page if you need help with an order, want to discuss a brand partnership, or would like to connect with our sourcing, media, or logistics teams. Every enquiry is routed to the most relevant team for review.
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#4a4a4a', lineHeight: 1.8, fontSize: 15 }}>
              {inquiryTypes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div
            style={{
              background: '#fffaf6',
              border: '1px solid #ffe4d1',
              borderRadius: 18,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: 22 }}>Business Details</h2>
            <p style={{ margin: '0 0 12px', color: '#555', lineHeight: 1.7 }}>
              Store1920 is operated by <strong>Althakeel General Trading LLC</strong> in Dubai, United Arab Emirates.
            </p>
            <p style={{ margin: '0 0 10px', color: '#555' }}>
              General support: <a href="mailto:support@store1920.com">support@store1920.com</a>
            </p>
            <p style={{ margin: '0 0 10px', color: '#555' }}>
              Privacy matters: <a href="mailto:privacy@store1920.com">privacy@store1920.com</a>
            </p>
            <p style={{ margin: 0, color: '#555' }}>
              Legal notices: <a href="mailto:legal@store1920.com">legal@store1920.com</a>
            </p>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
            marginBottom: 36,
          }}
        >
          {contactCards.map((card) => (
            <div
              key={card.title}
              style={{
                background: '#f7f7f7',
                borderRadius: 16,
                padding: 22,
                minHeight: 170,
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 20 }}>{card.title}</h3>
              <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 12 }}>{card.details}</p>
              <div style={{ color: '#ff6a00', fontWeight: 600 }}>{card.contact}</div>
            </div>
          ))}
        </section>

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            border: '1px solid #ececec',
            borderRadius: 18,
            padding: 24,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>Send an enquiry</h2>
          <p style={{ marginTop: 0, marginBottom: 22, color: '#555', lineHeight: 1.7 }}>
            Share enough detail about your request so the right team can follow up with you quickly.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #d4d4d4' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #d4d4d4' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Enquiry Type</label>
            <select
              required
              defaultValue=""
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #d4d4d4', background: '#fff' }}
            >
              <option value="" disabled>
                Select an enquiry type
              </option>
              {inquiryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Message</label>
            <textarea
              rows="6"
              placeholder="Tell us how we can help."
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #d4d4d4', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 18,
              width: '100%',
              padding: '14px 18px',
              background: '#ff6a00',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Send Enquiry
          </button>

          {success && (
            <div style={{ marginTop: 16, color: '#1f7a1f', fontWeight: 600 }}>
              Your enquiry has been recorded. A Store1920 team member will follow up using the contact details you provided.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Contact;
