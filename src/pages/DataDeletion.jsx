import React from 'react';
import { Link } from 'react-router-dom';

const requestItems = [
  'Your full name',
  'The email address or phone number linked to your account',
  'Your order number, if the request is related to a recent purchase',
  'A short description of the data or account you want deleted',
];

const retentionItems = [
  'Completed transaction records required for accounting or tax compliance',
  'Information related to fraud prevention, chargebacks, and security reviews',
  'Records needed to resolve disputes or respond to legal obligations',
];

const processSteps = [
  {
    number: '01',
    title: 'Send your request',
    text: 'Email privacy@store1920.com with the subject line Data Deletion Request and include the account details listed below.',
  },
  {
    number: '02',
    title: 'Verify ownership',
    text: 'We may ask you to confirm identity before any deletion is processed so no one else can remove your account data.',
  },
  {
    number: '03',
    title: 'Review and complete',
    text: 'Once verified, we delete or anonymize eligible data and keep only records that must be retained for legal or security reasons.',
  },
];

const styles = {
  page: {
    maxWidth: 1180,
    margin: '0 auto',
    padding: '24px 20px 56px',
    fontFamily: 'Montserrat, sans-serif',
    color: '#181818',
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    padding: '36px 32px',
    background: 'linear-gradient(135deg, #fff4eb 0%, #fff 45%, #f8f8f8 100%)',
    border: '1px solid rgba(255, 122, 0, 0.12)',
    boxShadow: '0 20px 50px rgba(17, 24, 39, 0.08)',
    marginBottom: 26,
  },
  heroGlow: {
    position: 'absolute',
    right: -80,
    top: -80,
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,122,0,0.18) 0%, rgba(255,122,0,0) 68%)',
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 24,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: '1 1 560px',
    minWidth: 280,
  },
  heroRight: {
    flex: '0 1 280px',
    minWidth: 240,
    background: '#ffffff',
    borderRadius: 22,
    padding: '20px 18px',
    border: '1px solid #f1e1d6',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.05)',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 999,
    background: 'rgba(255, 122, 0, 0.1)',
    color: '#d35400',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  title: {
    margin: '0 0 12px',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    lineHeight: 1.05,
    fontWeight: 900,
    color: '#111827',
  },
  subtitle: {
    margin: '0 0 12px',
    fontSize: 16,
    lineHeight: 1.8,
    color: '#374151',
    maxWidth: 720,
  },
  meta: {
    margin: 0,
    fontSize: 13,
    color: '#6b7280',
    fontWeight: 600,
  },
  ctaWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 22,
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    padding: '0 20px',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #ff7a00, #ff4d00)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    boxShadow: '0 12px 24px rgba(255, 85, 0, 0.24)',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    padding: '0 20px',
    borderRadius: 999,
    background: '#fff',
    color: '#111827',
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    border: '1px solid #e5e7eb',
  },
  helperLabel: {
    margin: '0 0 8px',
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 700,
  },
  helperValue: {
    margin: '0 0 12px',
    fontSize: 16,
    lineHeight: 1.5,
    color: '#111827',
    fontWeight: 700,
  },
  helperText: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.7,
    color: '#4b5563',
  },
  sectionGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 22,
    marginBottom: 22,
  },
  card: {
    flex: '1 1 360px',
    minWidth: 280,
    background: '#fff',
    borderRadius: 24,
    padding: '26px 24px',
    border: '1px solid #ececec',
    boxShadow: '0 16px 38px rgba(17, 24, 39, 0.06)',
  },
  cardTitle: {
    margin: '0 0 12px',
    fontSize: 24,
    fontWeight: 800,
    color: '#111827',
  },
  cardText: {
    margin: '0 0 14px',
    fontSize: 14,
    lineHeight: 1.8,
    color: '#4b5563',
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    color: '#374151',
  },
  listItem: {
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 1.7,
  },
  stepsWrap: {
    background: '#121212',
    borderRadius: 28,
    padding: '28px 24px',
    marginBottom: 22,
    color: '#fff',
  },
  stepsHeader: {
    margin: '0 0 18px',
    fontSize: 28,
    fontWeight: 800,
  },
  stepsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
  },
  stepCard: {
    flex: '1 1 240px',
    minWidth: 220,
    borderRadius: 22,
    padding: '20px 18px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  stepNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'linear-gradient(90deg, #ff7a00, #ff4d00)',
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 14,
  },
  stepTitle: {
    margin: '0 0 10px',
    fontSize: 18,
    fontWeight: 700,
  },
  stepText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.75,
    color: 'rgba(255,255,255,0.82)',
  },
  supportCard: {
    borderRadius: 24,
    padding: '28px 24px',
    background: 'linear-gradient(135deg, #fff 0%, #fff7f0 100%)',
    border: '1px solid #f3dfd1',
  },
  supportTitle: {
    margin: '0 0 10px',
    fontSize: 26,
    fontWeight: 800,
    color: '#111827',
  },
  supportText: {
    margin: '0 0 18px',
    fontSize: 14,
    lineHeight: 1.8,
    color: '#4b5563',
    maxWidth: 780,
  },
};

const DataDeletion = () => {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <div style={styles.badge}>Privacy and Account Support</div>
            <h1 style={styles.title}>Data Deletion Request</h1>
            <p style={styles.subtitle}>
              If you want Store1920 to delete your personal data or close your account, submit a request through our privacy team. We review each request carefully to protect your account, verify ownership, and meet applicable legal obligations.
            </p>
            <p style={styles.meta}>Last updated: April 2, 2026</p>

            <div style={styles.ctaWrap}>
              <a href="mailto:privacy@store1920.com?subject=Data%20Deletion%20Request" style={styles.primaryButton}>
                Email privacy team
              </a>
              <Link to="/privacy-policy" style={styles.secondaryButton}>
                Review privacy policy
              </Link>
            </div>
          </div>

          <aside style={styles.heroRight}>
            <p style={styles.helperLabel}>Primary contact</p>
            <p style={styles.helperValue}>privacy@store1920.com</p>
            <p style={styles.helperLabel}>Suggested subject</p>
            <p style={styles.helperValue}>Data Deletion Request</p>
            <p style={styles.helperText}>
              Including the correct subject line and account details helps us identify your request faster and reduce back-and-forth.
            </p>
          </aside>
        </div>
      </section>

      <section style={styles.stepsWrap}>
        <h2 style={styles.stepsHeader}>How the process works</h2>
        <div style={styles.stepsRow}>
          {processSteps.map((step) => (
            <div key={step.number} style={styles.stepCard}>
              <div style={styles.stepNumber}>{step.number}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.sectionGrid}>
        <article style={styles.card}>
          <h2 style={styles.cardTitle}>What to include</h2>
          <p style={styles.cardText}>
            Send your request by email and include the details below so we can match the request to the correct Store1920 account.
          </p>
          <ul style={styles.list}>
            {requestItems.map((item) => (
              <li key={item} style={styles.listItem}>{item}</li>
            ))}
          </ul>
        </article>

        <article style={styles.card}>
          <h2 style={styles.cardTitle}>Verification and eligibility</h2>
          <p style={styles.cardText}>
            Before deleting data, we may ask you to verify your identity. This prevents unauthorized deletion requests and protects your account information from being removed by someone else.
          </p>
          <p style={{ ...styles.cardText, marginBottom: 0 }}>
            Once approved, we delete or anonymize personal data that is no longer required for business, legal, fraud prevention, tax, accounting, or security purposes.
          </p>
        </article>
      </section>

      <section style={styles.sectionGrid}>
        <article style={styles.card}>
          <h2 style={styles.cardTitle}>What we may retain</h2>
          <p style={styles.cardText}>
            Some information may need to remain on file for a limited period when retention is required by law or necessary for legitimate business and security purposes.
          </p>
          <ul style={styles.list}>
            {retentionItems.map((item) => (
              <li key={item} style={styles.listItem}>{item}</li>
            ))}
          </ul>
        </article>

        <article style={styles.card}>
          <h2 style={styles.cardTitle}>Processing time</h2>
          <p style={styles.cardText}>
            We aim to respond to verified requests within a reasonable timeframe. If the request is complex or we need additional information, processing may take longer, but we will keep you informed during the review.
          </p>
          <p style={{ ...styles.cardText, marginBottom: 0 }}>
            If you need clarification about how your information is used before submitting a request, review the privacy policy or contact our privacy team directly.
          </p>
        </article>
      </section>

      <section style={styles.supportCard}>
        <h2 style={styles.supportTitle}>Need help?</h2>
        <p style={styles.supportText}>
          If you have questions about how Store1920 collects, uses, retains, or deletes personal information, contact privacy@store1920.com. We can help with account deletion requests, privacy-related inquiries, and status updates for an existing request.
        </p>
        <div style={styles.ctaWrap}>
          <a href="mailto:privacy@store1920.com?subject=Data%20Deletion%20Request" style={styles.primaryButton}>
            Contact privacy support
          </a>
          <Link to="/privacy-policy" style={styles.secondaryButton}>
            Open privacy policy
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DataDeletion;