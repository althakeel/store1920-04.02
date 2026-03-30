import React from "react";
import "../assets/styles/Footer.css";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa6";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

// Footer icons
import Image1 from "../assets/images/Footer icons/1.webp";
import Image2 from "../assets/images/Footer icons/4.webp";
import Image3 from "../assets/images/Footer icons/7.webp";
import Image4 from "../assets/images/Footer icons/8.webp";
import Image5 from "../assets/images/Footer icons/9.webp";
import Image6 from "../assets/images/Footer icons/10.webp";
import Image7 from "../assets/images/Footer icons/21.webp";
import Image8 from "../assets/images/Footer icons/2.webp";
import Image9 from "../assets/images/Footer icons/3.webp";
import Image10 from "../assets/images/Footer icons/6.webp";
import Image11 from "../assets/images/Footer icons/11.webp";
import Image12 from "../assets/images/Footer icons/12.webp";
import Image13 from "../assets/images/Footer icons/13.webp";
import Image14 from "../assets/images/Footer icons/16.webp";
import Image15 from "../assets/images/Footer icons/17.webp";
import Image16 from "../assets/images/Footer icons/18.webp";
import Image17 from "../assets/images/Footer icons/19.webp";
import Image18 from "../assets/images/Footer icons/20.webp";

const categoryData = [
  {
    id: 1,
    title: "Company info",
    items: [
      { id: 1101, name: "About Store1920", path: "/about" },
      { id: 1102, name: "Contact us", path: "/contact" },
    ],
  },
  {
    id: 2,
    title: "Menu",
    items: [
      { id: 201, name: "Top Selling Items", path: "/topselling" },
      { id: 202, name: "New", path: "/new" },
      { id: 203, name: "5 Star Rated", path: "/rated" },
    ],
  },
  {
    id: 3,
    title: "Customer service",
    items: [
      { id: 501, name: "Return and refund policy", path: "/return-policy" },
      { id: 502, name: "Shipping info", path: "/shippinginfo" },
    ],
  },
  {
    id: 4,
    title: "Help",
    items: [
      { id: 601, name: "Support center", path: "/support" },
      { id: 602, name: "Safety center", path: "/safetycenter" },
      { id: 603, name: "Privacy policy", path: "/privacy-policy" },
      { id: 604, name: "Terms of use", path: "/terms-0f-use" },
      { id: 605, name: "Store1920 purchase protection", path: "/purchaseprotection" },
      { id: 606, name: "Track Order", path: "/track-order" },
    ],
  },
];

const Footer = () => {
  const { isCartOpen } = useCart();

  return (
    <footer
      className="main-footer"
      style={{
        width: window.innerWidth >= 768 && isCartOpen ? "calc(100% - 250px)" : "100%",
        transition: "width 0.3s ease",
      }}
    >
      <div className="footer-container">
        <div
          className="footer-top"
          style={{ display: "flex", width: "100%", gap: "0", justifyContent: "space-between" }}
        >
          {categoryData.map((category) => (
            <div className="footer-section" key={category.id} style={{ flex: 1 }}>
              <h4>{category.title}</h4>
              <ul>
                {category.items.map((item) => (
                  <li key={item.id}>
                    <Link to={item.path}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-section" style={{ flex: 1 }}>
            <h4>Connect with Store1920</h4>
            <div className="social-icons">
              <a href="https://www.instagram.com/store1920.ae" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://www.facebook.com/thestore1920" target="_blank" rel="noopener noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://www.tiktok.com/@thestore1920" target="_blank" rel="noopener noreferrer">
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-middle">
          <div className="security">
            <h5>Security Certifications</h5>
            <div className="certs">
              {[Image1, Image2, Image3, Image4, Image5, Image6, Image7].map((img, index) => (
                <img key={index} src={img} alt={`Cert ${index + 1}`} />
              ))}
            </div>
          </div>

          <div className="payments">
            <h5>We Accept</h5>
            <div className="methods">
              {[Image8, Image9, Image10, Image11, Image12, Image13, Image14, Image15, Image16, Image17, Image18].map(
                (img, index) => (
                  <img key={index} src={img} alt={`Payment ${index + 1}`} />
                )
              )}
            </div>
          </div>
        </div>

        <div
          className="footer-bottom"
          style={{
            width: window.innerWidth >= 768 && isCartOpen ? "calc(100% - 250px)" : "100%",
            transition: "width 0.3s ease",
            paddingBottom: "10px",
          }}
        >
          <p>&copy; {new Date().getFullYear()} Al Thakeel General Trading LLC. All rights reserved.</p>
          <ul className="legal-links">
            <li>
              <Link to="/terms-0f-use">Terms of Use</Link>
            </li>
            <li>
              <Link to="/return-policy">Return Policy</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/cookies-settings">Cookie Settings</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
