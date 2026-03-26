import React, { useEffect, useState } from 'react';
import '../assets/styles/MainBanner.css';

const MainBanner = ({ banners = [], themeLink }) => {
  const [currentBanner, setCurrentBanner] = useState(null);
  const [previousBanner, setPreviousBanner] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!banners || banners.length === 0) {
      setCurrentBanner(null);
      setPreviousBanner(null);
      setIsTransitioning(false);
      return;
    }

    const nextBanner = banners[0];
    const resolvedUrl = isMobile ? nextBanner.mobileUrl || nextBanner.url : nextBanner.url;
    const bannerToShow = { ...nextBanner, resolvedUrl };

    if (
      currentBanner &&
      currentBanner.resolvedUrl === bannerToShow.resolvedUrl &&
      currentBanner.bgColor === bannerToShow.bgColor &&
      currentBanner.link === bannerToShow.link
    ) {
      return;
    }

    let isCancelled = false;
    const img = new Image();

    const commitBanner = () => {
      if (isCancelled) return;

      setPreviousBanner(currentBanner);
      setCurrentBanner(bannerToShow);
      setIsTransitioning(Boolean(currentBanner));
    };

    img.onload = commitBanner;
    img.onerror = commitBanner;
    img.src = resolvedUrl;

    if (img.complete) {
      commitBanner();
    }

    return () => {
      isCancelled = true;
    };
  }, [banners, isMobile, currentBanner]);

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setPreviousBanner(null);
      setIsTransitioning(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [isTransitioning]);

  const handleClick = () => {
    if (currentBanner?.link) {
      window.open(currentBanner.link, '_blank');
    } else if (themeLink) {
      window.open(themeLink, '_blank');
    }
  };

  if (!currentBanner) {
    return null;
  }

  return (
    <div
      className="banner-wrap"
      role="region"
      aria-label="Homepage Banner"
      style={{
        backgroundColor: currentBanner.bgColor || 'transparent',
        cursor: currentBanner.link || themeLink ? 'pointer' : 'default',
      }}
      onClick={handleClick}
    >
      <div className="banner-inner">
        {previousBanner && (
          <img
            src={previousBanner.resolvedUrl}
            alt="Previous Main Banner"
            className={`banner-image banner-image-previous ${isTransitioning ? 'is-leaving' : ''}`}
            loading="eager"
          />
        )}
        <img
          src={currentBanner.resolvedUrl}
          alt="Main Banner"
          className={`banner-image banner-image-current ${isTransitioning ? 'is-entering' : 'is-visible'}`}
          loading="eager"
        />
      </div>
    </div>
  );
};

export default MainBanner;
