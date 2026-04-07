import React from 'react';

const commitments = [
  'Respect internationally recognized human-rights principles in our business operations and partner relationships.',
  'Reject forced labour, child labour, human trafficking, abuse, harassment, and discriminatory treatment.',
  'Promote safe working environments and lawful wage, hour, and employment practices.',
  'Encourage suppliers and service providers to maintain grievance channels and respond to substantiated concerns.',
  'Review credible reports of harm and take proportionate action when partners do not meet expected standards.',
];

const HumanRightsPolicy = () => {
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
      <h1 style={{ marginBottom: 12, fontSize: 36, fontWeight: 800 }}>Store1920 Human Rights Policy</h1>
      <p style={{ marginTop: 0, marginBottom: 24, color: '#555', fontWeight: 600 }}>Last updated: April 6, 2026</p>
      <p style={{ color: '#4a4a4a' }}>
        Store1920, operated by Althakeel General Trading LLC, supports responsible business practices that respect the dignity, safety, and rights of workers, customers, and communities affected by our operations. This policy sets out the standards we expect within our own activities and from commercial partners connected to our marketplace.
      </p>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 24 }}>Our Commitments</h2>
      <ul style={{ paddingLeft: 22, color: '#4a4a4a' }}>
        {commitments.map((item) => (
          <li key={item} style={{ marginBottom: 10 }}>
            {item}
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 24 }}>Partner Expectations</h2>
      <p style={{ color: '#4a4a4a' }}>
        We expect partners to comply with applicable labour and employment laws, maintain safe workplaces, and address verified human-rights concerns promptly. When credible concerns are raised, Store1920 may request information, monitor remediation efforts, restrict listings, or end a relationship if standards are not met.
      </p>

      <h2 style={{ marginTop: 36, marginBottom: 12, fontSize: 24 }}>Questions and Reports</h2>
      <p style={{ color: '#4a4a4a' }}>
        Human-rights related questions or reports may be sent to <a href="mailto:legal@store1920.com">legal@store1920.com</a>. Where appropriate, we coordinate review with relevant internal teams and may request documentation or corrective-action plans.
      </p>
    </div>
  );
};

export default HumanRightsPolicy;
