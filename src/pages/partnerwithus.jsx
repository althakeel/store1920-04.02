import React from 'react';
import { Link } from 'react-router-dom';

const creatorRoles = [
  'Social Media Influencer',
  'Creator Ambassador',
  'Content Creator',
  'Blogger & Product Reviewer',
  'Talent Agency & Media Company',
];

const creatorBenefits = [
  {
    title: 'Product Sampling',
    text: 'Request products that match your audience, category, and content style so you can create authentic reviews, demos, and lifestyle posts.',
  },
  {
    title: 'Performance Rewards',
    text: 'Earn competitive commission rates, campaign bonuses, and seasonal incentives designed to reward strong content and qualified sales.',
  },
  {
    title: 'Creator Storefront',
    text: 'Build a curated product selection your followers can browse through one branded destination linked to your recommendations.',
  },
  {
    title: 'Business Support',
    text: 'Agencies, talent teams, and media groups can share company details to unlock structured onboarding and direct partnership support.',
  },
];

const affiliatePartners = [
  'Coupon, deal, and price-comparison websites',
  'Cashback and loyalty platforms',
  'Payment and financial-service platforms',
  'Shopping guide and product review publishers',
  'Growth platforms using curated Store1920 offers',
];

const partnerCards = [
  {
    heading: 'Affiliate & Influencer Program',
    text: 'Join to earn through product discovery, creator campaigns, referrals, and conversion-focused content partnerships.',
    contact: 'partners@db.store1920.com',
  },
  {
    heading: 'Merchandise & Vendor Partnerships',
    text: 'Showcase your products on Store1920 and connect with our sourcing team for vendor, wholesale, and assortment discussions.',
    contact: 'merchandise@db.store1920.com',
  },
  {
    heading: 'Logistics & Fulfilment Partnerships',
    text: 'Support faster customer delivery through warehousing, shipping, last-mile, or fulfilment collaboration opportunities.',
    contact: 'shipping@db.store1920.com',
  },
];

const PartnerWithStore1920 = () => {
  const styles = {
    page: {
      fontFamily: "'Montserrat', sans-serif",
      background:
        'linear-gradient(180deg, #fff8f1 0%, #ffffff 180px, #ffffff 100%)',
      color: '#222',
      padding: '36px 20px 72px',
    },
    shell: {
      maxWidth: '1180px',
      margin: '0 auto',
    },
    hero: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '28px',
      alignItems: 'stretch',
      marginBottom: '32px',
    },
    heroCopy: {
      background: '#fff',
      borderRadius: '24px',
      padding: '34px 30px',
      boxShadow: '0 18px 50px rgba(255, 106, 0, 0.08)',
      border: '1px solid #ffe6d5',
    },
    badge: {
      display: 'inline-block',
      padding: '8px 14px',
      borderRadius: '999px',
      background: '#fff2e8',
      color: '#ff6a00',
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '16px',
    },
    title: {
      fontSize: '40px',
      lineHeight: 1.08,
      fontWeight: 800,
      margin: '0 0 14px',
      color: '#1d1d1f',
    },
    lead: {
      fontSize: '16px',
      lineHeight: 1.8,
      color: '#4a4a4a',
      margin: '0 0 16px',
    },
    ctaRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '20px',
    },
    primaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '13px 18px',
      borderRadius: '12px',
      background: '#ff6a00',
      color: '#fff',
      fontWeight: 700,
      textDecoration: 'none',
    },
    secondaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '13px 18px',
      borderRadius: '12px',
      background: '#fff',
      color: '#ff6a00',
      fontWeight: 700,
      textDecoration: 'none',
      border: '1px solid #ffd2b5',
    },
    heroAside: {
      background:
        'linear-gradient(145deg, #ff6a00 0%, #ff8a1f 48%, #ffb25c 100%)',
      borderRadius: '24px',
      padding: '30px',
      color: '#fff',
      boxShadow: '0 20px 50px rgba(255, 106, 0, 0.22)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '18px',
    },
    asideTitle: {
      fontSize: '28px',
      lineHeight: 1.15,
      fontWeight: 800,
      margin: 0,
    },
    asideText: {
      margin: 0,
      fontSize: '15px',
      lineHeight: 1.7,
      color: 'rgba(255,255,255,0.92)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
    },
    statCard: {
      background: 'rgba(255,255,255,0.16)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '16px',
      padding: '16px',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 800,
      marginBottom: '6px',
    },
    statLabel: {
      fontSize: '13px',
      lineHeight: 1.5,
      color: 'rgba(255,255,255,0.9)',
    },
    section: {
      background: '#fff',
      borderRadius: '24px',
      padding: '30px',
      marginBottom: '24px',
      border: '1px solid #f2f2f2',
      boxShadow: '0 12px 34px rgba(0,0,0,0.04)',
    },
    sectionTitle: {
      fontSize: '30px',
      lineHeight: 1.15,
      fontWeight: 800,
      margin: '0 0 12px',
      color: '#1d1d1f',
    },
    sectionText: {
      fontSize: '16px',
      lineHeight: 1.8,
      color: '#4d4d4d',
      margin: '0 0 18px',
      maxWidth: '960px',
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '18px',
    },
    chip: {
      background: '#fff5ed',
      color: '#9a4a00',
      border: '1px solid #ffd7bb',
      borderRadius: '999px',
      padding: '10px 14px',
      fontSize: '14px',
      fontWeight: 600,
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '18px',
      marginTop: '22px',
    },
    infoCard: {
      background: '#fcfcfc',
      border: '1px solid #efefef',
      borderRadius: '18px',
      padding: '22px',
    },
    cardTitle: {
      fontSize: '19px',
      fontWeight: 700,
      margin: '0 0 10px',
      color: '#212121',
    },
    cardText: {
      fontSize: '15px',
      lineHeight: 1.7,
      color: '#555',
      margin: 0,
    },
    list: {
      margin: '18px 0 0',
      paddingLeft: '20px',
      color: '#555',
      lineHeight: 1.9,
      fontSize: '15px',
    },
    partnerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '18px',
      marginTop: '18px',
    },
    partnerCard: {
      background: '#fffaf6',
      border: '1px solid #ffe1cf',
      borderRadius: '18px',
      padding: '22px',
    },
    contactLink: {
      display: 'inline-block',
      marginTop: '10px',
      color: '#ff6a00',
      fontWeight: 700,
      textDecoration: 'none',
    },
    policyText: {
      marginTop: '20px',
      fontSize: '15px',
      lineHeight: 1.8,
      color: '#555',
    },
    inlineLink: {
      color: '#ff6a00',
      fontWeight: 700,
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.heroCopy}>
            <div style={styles.badge}>Affiliate & Influencer Program</div>
            <h1 style={styles.title}>Affiliate & Influencer Program: Join to Earn</h1>
            <p style={styles.lead}>
              Grow with Store1920 through creator campaigns, affiliate partnerships, brand collaborations, and business support tailored for audiences that drive discovery and sales.
            </p>
            <p style={styles.lead}>
              Whether you create short-form content, run a review platform, manage a talent roster, or operate an affiliate business, we welcome partnerships built on trust, performance, and long-term value.
            </p>

            <div style={styles.ctaRow}>
              <Link to="/contact" style={styles.primaryButton}>
                Join to Earn
              </Link>
              <Link to="/contact" style={styles.secondaryButton}>
                Contact Partnerships
              </Link>
            </div>
          </div>

          <aside style={styles.heroAside}>
            <div>
              <h2 style={styles.asideTitle}>Boost Your Earnings with Store1920</h2>
              <p style={styles.asideText}>
                Our program is designed for content-led growth, measurable conversions, and flexible collaboration across social, editorial, community, and business channels.
              </p>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>20%+</div>
                <div style={styles.statLabel}>Commission opportunities across selected campaigns</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>Creator</div>
                <div style={styles.statLabel}>Product seeding, campaign briefs, and curated storefront support</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>Data Security</div>
                <div style={styles.statLabel}>Clear onboarding, review standards, and privacy-aware partnership handling</div>
              </div>
            </div>
          </aside>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Store1920 Influencer Program</h2>
          <p style={styles.sectionText}>
            Get access to products, campaign opportunities, and creator-focused earning models built for authentic recommendations. We want creators who can turn product discovery into useful content that audiences trust.
          </p>
          <p style={styles.sectionText}>
            Create product demos, styling features, unboxings, tutorials, gifting guides, comparison content, and social-first storytelling across the platforms that best match your audience.
          </p>

          <div style={styles.chips}>
            {creatorRoles.map((role) => (
              <div key={role} style={styles.chip}>
                {role}
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Why Creators Choose Store1920 to Earn</h2>
          <p style={styles.sectionText}>
            We support creators with practical tools, product access, performance incentives, and partnership communication that helps campaigns move faster.
          </p>

          <div style={styles.cardGrid}>
            {creatorBenefits.map((item) => (
              <div key={item.title} style={styles.infoCard}>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardText}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Store1920 Affiliate Program</h2>
          <p style={styles.sectionText}>
            We welcome publishers, platforms, communities, and growth partners that can introduce Store1920 offers to relevant audiences. If your business reaches shoppers through high-intent traffic, value-added discovery, or trusted recommendation flows, we would love to hear from you.
          </p>

          <ul style={styles.list}>
            {affiliatePartners.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Partnership Channels</h2>
          <p style={styles.sectionText}>
            In addition to affiliate and creator partnerships, Store1920 also works with vendors, logistics teams, and strategic business collaborators across product and fulfilment operations.
          </p>

          <div style={styles.partnerGrid}>
            {partnerCards.map((card) => (
              <div key={card.heading} style={styles.partnerCard}>
                <h3 style={styles.cardTitle}>{card.heading}</h3>
                <p style={styles.cardText}>{card.text}</p>
                <a href={`mailto:${card.contact}`} style={styles.contactLink}>
                  {card.contact}
                </a>
              </div>
            ))}
          </div>

          <p style={styles.policyText}>
            Before applying, please review our{' '}
            <Link to="/code-of-conduct" style={styles.inlineLink}>
              Code of Conduct
            </Link>{' '}
            and{' '}
            <Link to="/human-rights-policy" style={styles.inlineLink}>
              Human Rights Policy
            </Link>{' '}
            to understand the standards we expect across creator, business, vendor, and service partnerships.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PartnerWithStore1920;
