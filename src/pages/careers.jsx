import React, { useState } from 'react';

const teams = [
  'Customer support and operations',
  'E-commerce merchandising and catalog management',
  'Marketing, partnerships, and brand growth',
  'Logistics, fulfillment, and marketplace support',
];

const Careers = () => {
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
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            alignItems: 'start',
            marginBottom: 40,
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
              Careers
            </div>
            <h1 style={{ fontSize: 38, lineHeight: 1.1, margin: '0 0 16px', fontWeight: 800 }}>
              Build the next stage of Store1920 with us.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#4a4a4a', marginBottom: 18 }}>
              Store1920 is growing across customer experience, marketplace operations, logistics coordination, and digital commerce. We look for people who care about service quality, execution, and building a better shopping experience for customers across the UAE and beyond.
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#4a4a4a', lineHeight: 1.8, fontSize: 15 }}>
              {teams.map((team) => (
                <li key={team}>{team}</li>
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
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 22 }}>What We Value</h2>
            <p style={{ margin: '0 0 10px', color: '#555', lineHeight: 1.7 }}>
              We value ownership, reliability, customer empathy, and practical problem solving.
            </p>
            <p style={{ margin: '0 0 10px', color: '#555', lineHeight: 1.7 }}>
              If you enjoy fast-moving work, clear accountability, and helping an e-commerce business improve every day, we would love to hear from you.
            </p>
            <p style={{ margin: 0, color: '#555' }}>
              Careers contact: <a href="mailto:careers@store1920.com">careers@store1920.com</a>
            </p>
          </div>
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
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>Share your profile</h2>
          <p style={{ marginTop: 0, marginBottom: 22, color: '#555', lineHeight: 1.7 }}>
            Tell us about your experience, the kind of role you are interested in, and how you think you can contribute.
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
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Preferred Area</label>
            <select
              required
              defaultValue=""
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #d4d4d4', background: '#fff' }}
            >
              <option value="" disabled>
                Select an area
              </option>
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Message</label>
            <textarea
              rows="6"
              placeholder="Tell us about your background, achievements, and the role you want to explore."
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
            Send Career Enquiry
          </button>

          {success && (
            <div style={{ marginTop: 16, color: '#1f7a1f', fontWeight: 600 }}>
              Your message has been recorded. Our team will review your enquiry and reach out if there is a suitable opportunity.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Careers;
