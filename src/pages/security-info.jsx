import React from 'react';
import CardSecurityInfo from '../components/sub/account/sections/CardSecurityInfo';

const SecurityInfoPage = () => {
  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '40px 16px',
        backgroundColor: '#fff',
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '12px', color: '#1f2937' }}>
        Card Security Information
      </h1>
      <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '24px' }}>
        Store1920 protects payment information with encrypted checkout flows and industry-standard payment security controls.
      </p>
      <CardSecurityInfo />
    </div>
  );
};

export default SecurityInfoPage;
