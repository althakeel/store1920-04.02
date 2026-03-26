import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/MainBanner.css';

const MainBanner = ({ banners = [], bannerKey, themeLink }) => {
  const [currentBanner, setCurrentBanner] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [fade, setFade] = useState(false);
  const navigate = useNavigate();

  // Update mobile flag on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
  setFade(false);

  const timer = setTimeout(() => {
    setCurrentBanner(banners[0]);
    setFade(true);
  }, 100);

  return () => clearTimeout(timer);

}, [banners]);

  // Use the first banner from the static banners array
  useEffect(() => {
    if (!banners || banners.length === 0) {
      setCurrentBanner(null);
      return;
    }
  setCurrentBanner(banners[0]);
  }, [banners]);

  const handleImageLoad = () => {};

//  const handleClick = () => {
//     // navigate('/season-sale'); git 
//   };
// const handleClick = () => {
//   console.log("banners:", banners);
//   if (currentBanner?.link) {
//     if (currentBanner.link.startsWith("http")) {
//       window.open(currentBanner.link, "_blank"); // external link
//     } else {
//       navigate(currentBanner.link); // internal route
//     }
//   }
// };
const handleClick = () => {
  if (currentBanner?.link) {
    window.open(currentBanner.link, "_blank");
  } else if (themeLink) {
    window.open(themeLink, "_blank");
  }
};
  if (!currentBanner) {
    return null;
  }

  const bannerUrl = isMobile ? currentBanner.mobileUrl || currentBanner.url : currentBanner.url;

  return (
    <div
      className="banner-wrap"
      role="region"
      aria-label="Homepage Banner"
      style={{
        backgroundColor: currentBanner.bgColor || 'transparent', // 👈 single background color
       cursor: currentBanner.link ? 'pointer' : 'default',
      }}
     onClick={handleClick}
    >
      <div className="banner-inner">
        <img 
          src={bannerUrl} 
          alt="Main Banner"
          className={fade ? "fade-in" : "fade-out"}
          loading="eager"
          onLoad={handleImageLoad}
        />
      </div>
    </div>
  );
};

export default MainBanner;
