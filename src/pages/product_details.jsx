import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductImageGallery from '../components/ProductImageGallery'
import '../assets/styles/ProductDetails.css'
import { getProductBySlug } from '../api/woocommerce'

const ProductDetails = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mainImage, setMainImage] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Fetch product from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        console.log('Fetching product with slug:', slug)
        const data = await getProductBySlug(slug)
        console.log('Product data:', data)
        setProduct(data)
        // Set main image after product is fetched
        const images = data?.images?.map(img => img.src) || []
        if (images.length > 0) {
          setMainImage(images[0])
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  // Show loading state
  if (loading) {
    return (
      <div className="product-details-container">
        <div className="loading-message">Loading product...</div>
      </div>
    )
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="error-message">{error || 'Product not found'}</div>
      </div>
    )
  }

  // Extract images from product data
  const productImages = product.images?.map(img => img.src) || []
  
  // Get price
  const price = parseFloat(product.price || 0)
  const regularPrice = parseFloat(product.regular_price || product.price || 0)
  const inStock = product.stock_status === 'instock'
  const discountPercent = regularPrice > price ? Math.round((1 - price / regularPrice) * 100) : 0

  const handleAddToCart = () => {
    console.log(`Added ${quantity} items to cart`)
    // Add to cart logic here
  }

  const handleBuyNow = () => {
    console.log(`Buying ${quantity} items now`)
    // Buy now logic here
  }

  return (
    <div className="product-details-container">
      {/* Image Gallery Section */}
      <div className="product-gallery-section">
        <ProductImageGallery
          images={productImages}
          mainImageUrl={mainImage}
          setMainImageUrl={setMainImage}
        />
      </div>

      {/* Product Info Section */}
      <div className="product-info-section">
        <h1 className="product-title">{product.name}</h1>

        {/* Short Description */}
        {product.short_description && (
          <div className="product-short-description" dangerouslySetInnerHTML={{ __html: product.short_description }} />
        )}

        {/* Rating */}
        <div className="product-rating">
          <span className="stars">★★★★☆</span>
          <span className="rating-text">
            {product.average_rating || 'No'} rating ({product.review_count || 0} reviews)
          </span>
        </div>

        {/* Price Section */}
        <div className="price-section">
          <span className="current-price">AED {price.toFixed(2)}</span>
          {regularPrice > price && (
            <>
              <span className="original-price">AED {regularPrice.toFixed(2)}</span>
              <span className="discount">{discountPercent}% OFF</span>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className={`stock-status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
          {inStock ? '✓ In Stock' : '✗ Out of Stock'}
        </div>

        {/* Quantity Selector */}
        <div className="quantity-section">
          <label>Quantity:</label>
          <div className="quantity-control">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
            <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
        </div>

        {/* Buy Now Button */}
        <button className="btn-buy-now-main" onClick={handleBuyNow} disabled={!inStock}>
          BUY NOW – AED {price.toFixed(2)}
        </button>

        {/* Attributes/Specifications */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="specifications-section">
            <h3>Specifications</h3>
            <table className="specs-table">
              <tbody>
                {product.attributes.map((attr, index) => (
                  <tr key={index}>
                    <td className="spec-label">{attr.name}</td>
                    <td className="spec-value">{attr.options?.join(', ') || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails