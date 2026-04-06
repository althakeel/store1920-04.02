import React from 'react';
import '../../../../assets/styles/myaccount/PaymentMethodsSection.css';
import Image1 from '../../../../assets/images/Footer icons/1.webp';
import Image2 from '../../../../assets/images/Footer icons/4.webp';
import Image3 from '../../../../assets/images/Footer icons/7.webp';
import Image4 from '../../../../assets/images/Footer icons/8.webp';
import Image5 from '../../../../assets/images/Footer icons/9.webp';
import Image6 from '../../../../assets/images/Footer icons/10.webp';
import Image7 from '../../../../assets/images/Footer icons/21.webp';

const CardSecurityInfo = () => {
  return (
    <div className="card-security-info">
      <h3><span className="check-icon">✔</span> Store1920 protects your card information</h3>
      <ul>
        <li><span className="check-icon">✔</span> Store1920 follows the Payment Card Industry Data Security Standard (PCI DSS)</li>
        <li><span className="check-icon">✔</span> Card information is secure and uncompromised</li>
        <li><span className="check-icon">✔</span> All data is encrypted</li>
        <li><span className="check-icon">✔</span> Store1920 never sells your card information</li>
      </ul>

      <div className="security-logos">
        <img src={Image1} alt="SSL" />
        <img src={Image2} alt="ID Check" />
        <img src={Image3} alt="SafeKey" />
        <img src={Image4} alt="PCI" />
        <img src={Image5} alt="APWG" />
        <img src={Image6} alt="PCI" />
        <img src={Image7} alt="APWG" />
      </div>
    </div>
  );
};

export default CardSecurityInfo;
