import React from 'react';
import '../assets/styles/SafetyCenter.css';
import Image8 from '../assets/images/Footer icons/2.webp';
import Image9 from '../assets/images/Footer icons/3.webp';
import Image10 from '../assets/images/Footer icons/6.webp';
import Image11 from '../assets/images/Footer icons/11.webp';
import Image12 from '../assets/images/Footer icons/12.webp';
import Image13 from '../assets/images/Footer icons/13.webp';
import Image14 from '../assets/images/Footer icons/16.webp';
import Image15 from '../assets/images/Footer icons/17.webp';
import Image16 from '../assets/images/Footer icons/18.webp';
import Image17 from '../assets/images/Footer icons/19.webp';
import Image18 from '../assets/images/Footer icons/20.webp';
import SafetyIcon from '../assets/images/safetycenter/support-center-1.webp';

const safetySections = [
  {
    title: 'Protect your information',
    items: [
      {
        icon: '🔒',
        title: 'Protect your data',
        description:
          'Only sign in through the official Store1920 website and avoid sharing OTPs, passwords, or account recovery codes with anyone.',
      },
      {
        icon: '👤',
        title: 'Protect your account',
        description:
          'Use a strong password, update your contact details regularly, and review account activity if something looks unusual.',
      },
      {
        icon: '💳',
        title: 'Protect your payment',
        description:
          'Complete payments only inside the secure checkout flow and ignore any request to pay extra fees through SMS, WhatsApp, or email.',
      },
    ],
  },
  {
    title: 'Stay safe from scammers',
    items: [
      {
        icon: '🕵️',
        title: 'Recognize scams',
        description:
          'Scam messages often create urgency, mention failed deliveries or refunds, and ask you to click unknown links or send money quickly.',
      },
      {
        icon: '📧',
        title: 'Recognize scam emails',
        description:
          'Check the sender address carefully and avoid downloading attachments or opening links from messages that look suspicious or unrelated to an active order.',
      },
      {
        icon: '💬',
        title: 'Recognize scam messages',
        description:
          'Store1920 will not ask you to verify card details, pay customs fees through random links, or share account credentials in chat messages.',
      },
    ],
  },
  {
    title: 'Report something suspicious',
    items: [
      {
        icon: '📞',
        title: 'Report suspicious calls, emails, or texts',
        description:
          'If someone claims to represent Store1920 and asks for payment, card details, or login codes, stop the conversation and report it to support.',
      },
      {
        icon: '🌐',
        title: 'Report fake website or app',
        description:
          'Only use the official Store1920 domain. If you find a page impersonating the brand, collect the URL and report it for investigation.',
      },
      {
        icon: '🎁',
        title: 'Report promotions, fraud, or job scams',
        description:
          'Be cautious of giveaway, affiliate, or recruitment offers that promise easy money or request upfront payments while using the Store1920 name.',
      },
    ],
  },
];

const SafetyCenter = () => {
  return (
    <div className="safety-center-container">
      <div className="safety-header">
        <div className="header-inner">
          <div className="header-text">
            <h1>Safety Center</h1>
            <p className="subtitle">
              Store1920 is committed to a secure and trustworthy shopping experience. Use this page to understand common fraud risks, safer shopping habits, and the best way to report suspicious activity.
            </p>
          </div>

          <div className="header-image">
            <img src={SafetyIcon} alt="Store1920 safety guidance" />
          </div>
        </div>
      </div>

      <div className="safety-content">
        <section className="safety-intro">
          <h2>How Store1920 helps protect customers</h2>
          <p>
            We work with secure payment providers, account protections, and customer support processes designed to reduce fraud and help customers shop with confidence. Staying safe also depends on recognizing scam behaviour early and only interacting with verified Store1920 pages and channels.
          </p>
        </section>

        {safetySections.map((section) => (
          <section className="safety-section" key={section.title}>
            <h2>{section.title}</h2>
            <div className="safety-grid">
              {section.items.map((item) => (
                <article className="safety-card" key={item.title}>
                  <div className="safety-card-icon" aria-hidden="true">
                    {item.icon}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="safety-section">
          <h2>Need help right away?</h2>
          <div className="safety-action-strip">
            <p>
              If you think you have received a fraudulent message related to an order, payment, delivery, or account login, stop interacting with it and contact the Store1920 support team through the official support center.
            </p>
            <a href="/support" className="safety-action-link">
              Visit Support Center
            </a>
          </div>
        </section>

        <section className="safety-section">
          <h2>Safety Partners</h2>
          <p>
            Store1920 supports secure payment methods and works with recognized payment and checkout providers as part of the customer checkout experience.
          </p>
          <div className="partner-logos">
            <img src={Image8} alt="Visa" />
            <img src={Image9} alt="MasterCard" />
            <img src={Image10} alt="American Express" />
            <img src={Image11} alt="PayPal" />
            <img src={Image12} alt="Cash on Delivery" />
            <img src={Image13} alt="Apple Pay" />
            <img src={Image14} alt="Digital payment partner 1" />
            <img src={Image15} alt="Digital payment partner 2" />
            <img src={Image16} alt="Digital payment partner 3" />
            <img src={Image17} alt="Digital payment partner 4" />
            <img src={Image18} alt="Digital payment partner 5" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SafetyCenter;
