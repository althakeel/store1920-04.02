import React from 'react';
import Abouticon from '../assets/images/about.png';
import Fastdelivery from '../assets/images/delivery.png';
import Commitment from '../assets/images/commetment-black.png';
import Selectionicon from '../assets/images/selection-black.png';

const featureCards = [
  {
    image: Selectionicon,
    title: 'Curated Product Selection',
    description:
      'We build our catalog around practical, in-demand products across home, electronics, lifestyle, fitness, beauty, and everyday essentials.',
  },
  {
    image: Fastdelivery,
    title: 'Reliable Fulfillment',
    description:
      'Our operations team works with trusted logistics partners to support clear delivery communication, efficient dispatching, and dependable order handling.',
  },
  {
    image: Commitment,
    title: 'Customer-First Support',
    description:
      'We focus on responsive service, transparent policies, and continuous improvements that make shopping with Store1920 simpler and more trustworthy.',
  },
];

const infoPoints = [
  'Headquartered in Dubai and operated by Althakeel General Trading LLC.',
  'Focused on digital commerce, customer convenience, and marketplace quality standards.',
  'Committed to clear policies for returns, privacy, intellectual property, and responsible partnerships.',
];

const Store1920Info = () => {
  const container = {
    fontFamily: "'Montserrat', sans-serif",
    maxWidth: 1180,
    margin: '0 auto',
    padding: '48px 20px 72px',
    color: '#222',
  };

  const heroSection = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
    marginBottom: 56,
    flexWrap: 'wrap',
  };

  const leftSide = {
    flex: '1 1 540px',
    minWidth: 300,
  };

  const eyebrow = {
    display: 'inline-block',
    marginBottom: 16,
    padding: '8px 14px',
    borderRadius: 999,
    backgroundColor: '#fff2e8',
    color: '#ff6a00',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const heading = {
    fontSize: '2.4rem',
    fontWeight: 900,
    color: '#111',
    marginBottom: 20,
    lineHeight: 1.1,
  };

  const introText = {
    fontSize: 16,
    color: '#444',
    lineHeight: 1.8,
    marginBottom: 18,
  };

  const pointsList = {
    margin: '0',
    paddingLeft: 20,
    color: '#444',
    lineHeight: 1.8,
    fontSize: 15,
  };

  const rightSide = {
    flex: '0 1 360px',
    minWidth: 280,
    display: 'flex',
    justifyContent: 'center',
  };

  const imageStyle = {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    background: 'linear-gradient(180deg, #fff7f0 0%, #ffffff 100%)',
    padding: 18,
  };

  const sectionCard = {
    backgroundColor: '#fffaf6',
    border: '1px solid #ffe3cf',
    borderRadius: 20,
    padding: '28px 24px',
    marginBottom: 48,
  };

  const sectionTitle = {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 14,
    color: '#222',
  };

  const sectionText = {
    fontSize: 15,
    color: '#4a4a4a',
    lineHeight: 1.8,
    margin: 0,
  };

  const features = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 24,
  };

  const featureCard = {
    backgroundColor: '#f7f7f7',
    borderRadius: 18,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    minHeight: 240,
  };

  const featureIcon = {
    maxWidth: 50,
    marginBottom: 18,
  };

  const featureTitle = {
    fontSize: 20,
    fontWeight: 700,
    color: '#ff5e00',
    marginBottom: 12,
  };

  const featureDesc = {
    fontSize: 15,
    color: '#444',
    lineHeight: 1.7,
    margin: 0,
  };

  return (
    <div style={container}>
      <section style={heroSection}>
        <div style={leftSide}>
          <span style={eyebrow}>About Store1920</span>
          <h1 style={heading}>A marketplace built for everyday shopping with clearer standards and stronger trust.</h1>
          <p style={introText}>
            Store1920 is an online retail platform designed to connect customers with a broad range of products through a convenient, modern shopping experience. We focus on dependable service, transparent policies, and a catalog that continues to grow with customer demand.
          </p>
          <p style={introText}>
            Our goal is to make product discovery, checkout, delivery, and after-sales support feel straightforward from start to finish while maintaining clear operating standards for quality, privacy, and customer care.
          </p>
          <ul style={pointsList}>
            {infoPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <div style={rightSide}>
          <img src={Abouticon} alt="Store1920 marketplace overview" style={imageStyle} />
        </div>
      </section>

      <section style={sectionCard}>
        <h2 style={sectionTitle}>How We Operate</h2>
        <p style={sectionText}>
          We work to combine practical product assortment, fast-moving digital storefront updates, and customer support that helps buyers make informed decisions. Whether someone is shopping for home essentials, electronics, beauty products, fitness accessories, or lifestyle items, we aim to provide a buying experience that is consistent, informative, and easy to navigate.
        </p>
      </section>

      <section>
        <h2 style={{ ...sectionTitle, marginBottom: 24 }}>What Customers Can Expect</h2>
        <div style={features}>
          {featureCards.map((feature) => (
            <div key={feature.title} style={featureCard}>
              <img src={feature.image} alt={feature.title} style={featureIcon} />
              <h3 style={featureTitle}>{feature.title}</h3>
              <p style={featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Store1920Info;
