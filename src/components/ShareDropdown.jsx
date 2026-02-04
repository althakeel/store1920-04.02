import React, { useEffect, useRef, useState } from 'react';
import { FaShareAlt, FaFacebookF, FaTwitter, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';
import '../assets/styles/ShareDropdown.css';

export default function ShareDropdown({ url }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const shareUrl = encodeURIComponent(url || window.location.href);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`share-dropdown ${open ? 'open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="share-icon-btn"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-label="Share"
      >
        <FaShareAlt className="share-icon" />
      </button>
      <div className="share-list" role="menu">
        <a href={`https://facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer">
          <FaFacebookF />
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
          <FaTwitter />
        </a>
        <a href={`https://api.whatsapp.com/send?text=${shareUrl}`} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp />
        </a>
        <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
          <FaLinkedinIn />
        </a>
      </div>
    </div>
  );
}
