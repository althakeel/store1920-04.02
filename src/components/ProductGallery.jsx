// ProductGallery.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../assets/styles/ProductGallery.css';
import PlaceHolderImage from '../assets/images/common/Placeholder.png';

export default function ProductGallery({
  images,
  mainImageUrl,
  setMainImageUrl,
  activeModal,
  openModal,
  closeModal,
}) {
  console.log('ProductGallery rendered with images:', images, 'mainImageUrl:', mainImageUrl);
  
  const [mainIndex, setMainIndex] = useState(0);
  const [mainLoading, setMainLoading] = useState(true);
  const modalThumbListRef = useRef(null);
  const [thumbsLoaded, setThumbsLoaded] = useState(false);
  const galleryRef = useRef(null);
  const thumbnailListRef = useRef(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(true);
  const isThumbDragging = useRef(false);
  const thumbDragStartX = useRef(0);
  const thumbScrollStart = useRef(0);
  const [hasMainError, setHasMainError] = useState(false);
  const lastMainSrcRef = useRef(null);
  const mainImageRef = useRef(null);

  // Zoom and pan state for modal
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomTranslate, setZoomTranslate] = useState({ x: 0, y: 0 });
  const zoomedImageRef = useRef(null);
  const containerRef = useRef(null);
  const lastDragPosition = useRef(null);
  const [visibleImages, setVisibleImages] = useState(images?.length ? [images[0]] : []);

  // Sync mainIndex when mainImageUrl changes from parent
  useEffect(() => {
    if (!images || images.length === 0) return;
    if (!mainImageUrl) return;
    
    console.log('Syncing mainImageUrl to mainIndex:', mainImageUrl);
    const nextIndex = images.findIndex(img => img?.src === mainImageUrl);
    console.log('Found index:', nextIndex, 'for url:', mainImageUrl);
    
    if (nextIndex >= 0 && nextIndex !== mainIndex) {
      console.log('Setting mainIndex to:', nextIndex);
      setMainIndex(nextIndex);
      setMainLoading(true);
      setHasMainError(false);
    }
  }, [mainImageUrl, images, mainIndex]);

  // Initialize main image when images change
  useEffect(() => {
    if (!mainLoading && images.length > 1) {
      // Delay adding other images slightly after main loads
      const timer = setTimeout(() => {
        setVisibleImages(images);
      }, 200); // small delay to avoid blocking
      return () => clearTimeout(timer);
    }
  }, [mainLoading, images]);

  // Reset loading and zoom state when mainIndex changes
  useEffect(() => {
    setMainLoading(true);
    setZoomScale(1);
    setZoomTranslate({ x: 0, y: 0 });
    setHasMainError(false);
    if (modalThumbListRef.current) scrollModalThumbnails(mainIndex);
  }, [mainIndex]);

  // Delay thumbnails appearance for smoother effect
  useEffect(() => {
    if (!mainLoading) {
      const timer = setTimeout(() => setThumbsLoaded(true), 300);
      return () => clearTimeout(timer);
    }
  }, [mainLoading]);

  // Handle scroll locking on gallery - scroll through images first, then allow page scroll
  useEffect(() => {
    const handleGalleryScroll = (e) => {
      if (!galleryRef.current || images.length <= 1) return;

      const isLastImage = mainIndex === images.length - 1;
      const isFirstImage = mainIndex === 0;

      // If scrolling down and not at last image, prevent page scroll
      if (e.deltaY > 0 && !isLastImage && isScrollLocked) {
        e.preventDefault();
        handleNext();
      }
      // If scrolling up and not at first image, prevent page scroll
      else if (e.deltaY < 0 && !isFirstImage && isScrollLocked) {
        e.preventDefault();
        handlePrev();
      }
      // If at last image and scrolling down, unlock scroll
      else if (e.deltaY > 0 && isLastImage) {
        setIsScrollLocked(false);
      }
      // If at first image and scrolling up, unlock scroll
      else if (e.deltaY < 0 && isFirstImage) {
        setIsScrollLocked(false);
      }
    };

    const gallery = galleryRef.current;
    if (gallery) {
      gallery.addEventListener('wheel', handleGalleryScroll, { passive: false });
    }

    return () => {
      if (gallery) {
        gallery.removeEventListener('wheel', handleGalleryScroll);
      }
    };
  }, [mainIndex, images.length, isScrollLocked]);

  // Reset scroll lock when user manually changes image
  useEffect(() => {
    setIsScrollLocked(true);
  }, [mainIndex]);

  // Scroll modal thumbnails
  const scrollModalThumbnails = index => {
    if (!modalThumbListRef.current) return;
    const thumbWidth = 108; // approx
    const scrollPos = Math.max(0, index * thumbWidth - thumbWidth * 2);
    modalThumbListRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
  };

  const handleThumbnailWheel = (e) => {
    if (!thumbnailListRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      thumbnailListRef.current.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  };

  const handleThumbMouseDown = (e) => {
    if (!thumbnailListRef.current) return;
    isThumbDragging.current = true;
    thumbDragStartX.current = e.pageX;
    thumbScrollStart.current = thumbnailListRef.current.scrollLeft;
    thumbnailListRef.current.style.cursor = 'grabbing';
  };

  const handleThumbMouseMove = (e) => {
    if (!isThumbDragging.current || !thumbnailListRef.current) return;
    e.preventDefault();
    const dx = e.pageX - thumbDragStartX.current;
    thumbnailListRef.current.scrollLeft = thumbScrollStart.current - dx;
  };

  const handleThumbMouseUp = () => {
    if (!thumbnailListRef.current) return;
    isThumbDragging.current = false;
    thumbnailListRef.current.style.cursor = 'grab';
  };

  // Navigation handlers
  const handlePrev = () => {
    const newIndex = mainIndex === 0 ? images.length - 1 : mainIndex - 1;
    setMainIndex(newIndex);
    setMainImageUrl(images[newIndex].src);
  };
  const handleNext = () => {
    const newIndex = mainIndex === images.length - 1 ? 0 : mainIndex + 1;
    setMainIndex(newIndex);
    setMainImageUrl(images[newIndex].src);
  };

  const handleModalPrev = e => {
    e.stopPropagation();
    handlePrev();
    scrollModalThumbnails(mainIndex === 0 ? images.length - 1 : mainIndex - 1);
  };
  const handleModalNext = e => {
    e.stopPropagation();
    handleNext();
    scrollModalThumbnails(mainIndex === images.length - 1 ? 0 : mainIndex + 1);
  };

  const scrollModalThumbsLeft = e => {
    e.stopPropagation();
    modalThumbListRef.current?.scrollBy({ left: -100, behavior: 'smooth' });
  };
  const scrollModalThumbsRight = e => {
    e.stopPropagation();
    modalThumbListRef.current?.scrollBy({ left: 100, behavior: 'smooth' });
  };

  const scrollThumbsLeft = e => {
    e.stopPropagation();
    thumbnailListRef.current?.scrollBy({ left: -120, behavior: 'smooth' });
  };
  const scrollThumbsRight = e => {
    e.stopPropagation();
    thumbnailListRef.current?.scrollBy({ left: 120, behavior: 'smooth' });
  };

  // Zoom/pan logic
  const onWheel = e => {
    e.preventDefault();
    if (e.deltaY === 0) return;
    let newScale = zoomScale - e.deltaY * 0.001;
    newScale = Math.min(Math.max(newScale, 1), 4);
    setZoomScale(newScale);
    if (newScale === 1) setZoomTranslate({ x: 0, y: 0 });
  };

  const onDragStart = e => {
    e.preventDefault();
    lastDragPosition.current = {
      x: e.clientX || e.touches?.[0]?.clientX,
      y: e.clientY || e.touches?.[0]?.clientY,
    };
    containerRef.current.style.cursor = 'grabbing';
  };
  const onDragMove = e => {
    if (!lastDragPosition.current) return;
    const x = e.clientX || e.touches?.[0]?.clientX;
    const y = e.clientY || e.touches?.[0]?.clientY;
    if (x === undefined || y === undefined) return;
    const dx = x - lastDragPosition.current.x;
    const dy = y - lastDragPosition.current.y;
    lastDragPosition.current = { x, y };

    const maxTranslateX = (zoomScale - 1) * containerRef.current.clientWidth / 2;
    const maxTranslateY = (zoomScale - 1) * containerRef.current.clientHeight / 2;

    setZoomTranslate(prev => ({
      x: Math.min(Math.max(prev.x + dx, -maxTranslateX), maxTranslateX),
      y: Math.min(Math.max(prev.y + dy, -maxTranslateY), maxTranslateY),
    }));
  };
  const onDragEnd = e => {
    e.preventDefault();
    lastDragPosition.current = null;
    if (containerRef.current) containerRef.current.style.cursor = zoomScale > 1 ? 'grab' : 'default';
  };

  // Prevent background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = activeModal === 'zoom' ? 'hidden' : '';
  }, [activeModal]);

  const mainSrc = hasMainError
    ? PlaceHolderImage
    : (mainImageUrl || images[mainIndex]?.src || PlaceHolderImage);

  useEffect(() => {
    console.log('mainSrc changed:', mainSrc);
    console.log('mainImageUrl:', mainImageUrl);
    console.log('images[mainIndex]:', images[mainIndex]);
    console.log('mainIndex:', mainIndex);
    console.log('hasMainError:', hasMainError);
    if (!mainSrc) return;
    lastMainSrcRef.current = mainSrc;
  }, [mainSrc, mainImageUrl, mainIndex, hasMainError, images]);

  if (!images || images.length === 0) {
    return (
      <div className="product-gallery no-images">
        <img src={PlaceHolderImage} alt="Placeholder" draggable={false} />
      </div>
    );
  }

  const isZoomModalOpen = activeModal === 'zoom';

  return (
    <>
      <div className="product-gallery-wrapper" ref={galleryRef}>
        {/* Thumbnail strip */}
        {thumbsLoaded && (
          <div className="thumbnail-strip">
            <button
              className="thumb-scroll thumb-scroll-left"
              onClick={scrollThumbsLeft}
              aria-label="Scroll thumbnails left"
              type="button"
            >
              ‹
            </button>
            <div
              className="thumbnail-list"
              role="list"
              ref={thumbnailListRef}
              onWheel={handleThumbnailWheel}
              onMouseDown={handleThumbMouseDown}
              onMouseMove={handleThumbMouseMove}
              onMouseUp={handleThumbMouseUp}
              onMouseLeave={handleThumbMouseUp}
            >
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  className={`thumbnail-btn ${idx === mainIndex ? 'active' : ''}`}
                  onClick={() => {
                    console.log('Thumbnail clicked:', img.src, 'index:', idx);
                    setMainImageUrl(img.src);
                    setMainIndex(idx);
                    setMainLoading(true);
                    setHasMainError(false);
                  }}
                  type="button"
                  aria-label={`Thumbnail ${idx + 1}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `Thumbnail ${idx + 1}`}
                    className="thumbnail-image"
                    loading="lazy"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
            <button
              className="thumb-scroll thumb-scroll-right"
              onClick={scrollThumbsRight}
              aria-label="Scroll thumbnails right"
              type="button"
            >
              ›
            </button>
          </div>
        )}

        {/* Main image wrapper with inline skeleton */}
        <div
          className="main-image-wrapper"
          style={{
            position: 'relative',
            backgroundColor: '#fff',
          }}
        >
          <img
            ref={mainImageRef}
            src={mainSrc}
            alt={images[mainIndex]?.alt || 'Product Image'}
            draggable={false}
            onLoad={() => {
              console.log('Image loaded:', mainSrc);
              setMainLoading(false);
            }}
            onError={() => {
              console.log('Image error:', mainSrc);
              setHasMainError(true);
              setMainLoading(false);
            }}
            onClick={() => openModal('zoom')}
            className="main-image"
            style={{
              transition: 'opacity 0.3s ease',
              opacity: 1,
            }}
          />

          <button
            className="arrow-btn arrow-left"
            onClick={handlePrev}
            aria-label="Previous Image"
            type="button"
          >
            ‹
          </button>
          <button
            className="arrow-btn arrow-right"
            onClick={handleNext}
            aria-label="Next Image"
            type="button"
          >
            ›
          </button>
        </div>
      </div>

      {/* Zoom modal */}
      {isZoomModalOpen && (
        <ModalWrapper onClose={closeModal} titleId="zoomModalTitle" label="Zoomed Image Modal">
          <div
            className="zoomed-image-container"
            ref={containerRef}
            onWheel={onWheel}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
          >
            <img
              src={images[mainIndex]?.src || PlaceHolderImage}
              alt={images[mainIndex]?.alt || 'Zoomed Product Image'}
              draggable={false}
              ref={zoomedImageRef}
              className="zoomed-image"
              style={{
                transform: `translate(calc(-50% + ${zoomTranslate.x}px), calc(-50% + ${zoomTranslate.y}px)) scale(${zoomScale})`,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transformOrigin: 'center center',
              }}
            />
          </div>

          {/* Modal arrows */}
          <button className="modal-arrow-btn modal-arrow-left" onClick={handleModalPrev} aria-label="Previous Image" type="button">‹</button>
          <button className="modal-arrow-btn modal-arrow-right" onClick={handleModalNext} aria-label="Next Image" type="button">›</button>

          {/* Modal thumbnail strip */}
          <div className="modal-thumbnail-container" onClick={e => e.stopPropagation()}>
            <button className="modal-thumb-scroll arrow-left" onClick={scrollModalThumbsLeft} aria-label="Scroll thumbnails left" type="button">‹</button>
            <div className="thumbnail-list" role="list">
  {visibleImages.map((img, idx) => (
    <button
      key={img.id || idx}
      className={`thumbnail-btn ${idx === mainIndex ? 'active' : ''}`}
      onClick={() => {
        setMainImageUrl(img.src);
        setMainIndex(idx);
      }}
      type="button"
      aria-label={`Thumbnail ${idx + 1}`}
    >
      <img
        src={img.src}
        alt={img.alt || `Thumbnail ${idx + 1}`}
        className="thumbnail-image"
        loading="lazy"
        draggable={false}
      />
    </button>
  ))}
</div>

            <button className="modal-thumb-scroll arrow-right" onClick={scrollModalThumbsRight} aria-label="Scroll thumbnails right" type="button">›</button>
          </div>
        </ModalWrapper>
      )}
    </>
  );
}

function ModalWrapper({ onClose, titleId, label, children }) {
  useEffect(() => {
    const onKeyDown = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="zoom-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-label={label}
    >
      <div className="zoom-modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
