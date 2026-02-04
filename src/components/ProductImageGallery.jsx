import React, { useState, useRef, useEffect } from 'react'
import '../assets/styles/ProductImageGallery.css'

const ProductImageGallery = ({
  images = [],
  mainImageUrl,
  setMainImageUrl,
}) => {
  const [mainImage, setMainImage] = useState(mainImageUrl || images[0])
  const [mainImageLoading, setMainImageLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const mainImageRef = useRef(null)
  const galleryRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(images.length > 4)

  const preloadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = reject
      img.src = src
    })

  const loadMainImage = (src) => {
    if (!src || src === mainImage) return
    setMainImageLoading(true)
    preloadImage(src)
      .then(() => {
        setMainImage(src)
        setMainImageLoading(false)
      })
      .catch(() => {
        setMainImageLoading(false)
      })
  }

  // Update main image when prop changes
  useEffect(() => {
    if (mainImageUrl) {
      loadMainImage(mainImageUrl)
    }
  }, [mainImageUrl])

  // Keep main image valid when images list changes
  useEffect(() => {
    if (!images || images.length === 0) {
      setMainImage(null)
      setMainImageLoading(false)
      setCanScrollRight(false)
      return
    }

    setCanScrollRight(images.length > 4)

    if (!mainImage || !images.includes(mainImage)) {
      const nextImage = mainImageUrl && images.includes(mainImageUrl) ? mainImageUrl : images[0]
      loadMainImage(nextImage)
    }
  }, [images, mainImage, mainImageUrl])

  const handleThumbnailClick = (image) => {
    loadMainImage(image)
    if (setMainImageUrl) {
      setMainImageUrl(image)
    }
    // Reset zoom
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const handleMainImageLoad = () => {
    setMainImageLoading(false)
  }

  const handleMainImageError = (e) => {
    console.error('Failed to load image:', e)
    const fallback = images.find(img => img && img !== mainImage)
    if (fallback) {
      setMainImage(fallback)
      setMainImageLoading(true)
      if (setMainImageUrl) setMainImageUrl(fallback)
    } else {
      setMainImageLoading(false)
    }
  }

  // Handle zoom on mouse wheel
  const handleWheel = (e) => {
    if (zoomLevel > 1) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(1, Math.min(3, zoomLevel * delta))
      setZoomLevel(newZoom)
    }
  }

  // Handle mouse move for pan
  const handleMouseMove = (e) => {
    if (zoomLevel > 1 && mainImageRef.current) {
      const rect = mainImageRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setZoomPosition({ x: x * 100, y: y * 100 })
    }
  }

  // Scroll thumbnails left
  const scrollThumbnailsLeft = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({ left: -60, behavior: 'smooth' })
      checkScroll()
    }
  }

  // Scroll thumbnails right
  const scrollThumbnailsRight = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({ left: 60, behavior: 'smooth' })
      checkScroll()
    }
  }

  // Check scroll position
  const checkScroll = () => {
    if (galleryRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = galleryRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = galleryRef.current
    if (ref) {
      ref.addEventListener('scroll', checkScroll)
      return () => ref.removeEventListener('scroll', checkScroll)
    }
  }, [images.length])

  return (
    <div className="product-image-gallery">
      {/* Main Image Container */}
      <div
        className={`main-image-container ${mainImageLoading ? 'is-loading' : ''}`}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        ref={mainImageRef}
      >
        {mainImageLoading && (
          <div className="image-loader">
            <div className="spinner"></div>
          </div>
        )}
        <img
          src={mainImage || ''}
          alt="Product Main Image"
          className="main-image"
          onLoad={handleMainImageLoad}
          onError={handleMainImageError}
          style={
            zoomLevel > 1
              ? {
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  cursor: 'grab',
                }
              : { transform: 'scale(1)' }
          }
        />
        {zoomLevel > 1 && (
          <div className="zoom-info">
            {Math.round(zoomLevel * 100)}%
          </div>
        )}
      </div>

      {/* Thumbnails Container */}
      <div className="thumbnails-container">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            className="scroll-button scroll-left"
            onClick={scrollThumbnailsLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        {/* Thumbnails List */}
        <div className="thumbnails-wrapper" ref={galleryRef}>
          {images.map((image, index) => (
            <button
              key={index}
              className={`thumbnail-item ${mainImage === image ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(image)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={image} alt={`Product thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            className="scroll-button scroll-right"
            onClick={scrollThumbnailsRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductImageGallery
