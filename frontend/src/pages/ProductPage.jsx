import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const [qty, setQty] = useState(1)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [slug])

  useEffect(() => {
    setActiveImg(0)
  }, [product])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/products/${slug}/`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
      }
    } catch (err) {
      console.error('Failed to fetch product', err)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (cat) => {
    if (!cat) return 'o-football'
    const name = cat.toLowerCase()
    if (name.includes('football')) return 'o-football'
    if (name.includes('running') || name.includes('shoe')) return 'o-shoe'
    if (name.includes('cricket')) return 'o-cricket'
    if (name.includes('basket')) return 'o-basketball'
    if (name.includes('gym') || name.includes('fitness')) return 'o-dumbbell'
    return 'o-football'
  }

  const handleAdd = async () => {
    setAdding(true)
    const result = await addToCart(product.id, qty)
    setAdding(false)
    if (result.requiresLogin) {
      navigate('/login')
      return
    }
    if (result.success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  if (loading) {
    return <main><div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ink-soft)' }}>Loading product…</div></main>
  }

  if (!product) {
    return <main><div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h2>Product not found</h2><Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Back to shop</Link></div></main>
  }

  const icon = getIcon(product.category_name)

  // Build array of all images: main image first, then gallery images
  const allImages = []
  if (product.images && product.images.length > 0) {
    product.images.sort((a,b) => a.order - b.order).forEach(gi => {
      if (gi.url) {
        allImages.push({ src: gi.url, alt: product.name })
      }
    })
  } else if (product.image_url) {
    allImages.push({ src: product.image_url, alt: product.name })
  }

  const hasImages = allImages.length > 0
  const currentImage = hasImages ? allImages[activeImg] || allImages[0] : null

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <svg className="icon"><use href="#i-chevron-right"/></svg>
          <Link to="/shop">Shop</Link>
          <svg className="icon"><use href="#i-chevron-right"/></svg>
          <span>{product.name}</span>
        </div>
      </div>
      <div className="container product-detail">
        <div>
          <div className="gallery-main" style={{ position: 'relative' }}>
            {currentImage ? (
              <img src={currentImage.src} alt={currentImage.alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <svg viewBox="0 0 100 100"><use href={`#${icon}`}/></svg>
            )}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg(prev => (prev - 1 + allImages.length) % allImages.length)}
                  style={{
                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%',
                    width: 36, height: 36, cursor: 'pointer', fontSize: '1.2rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
                  }}
                  aria-label="Previous image"
                >‹</button>
                <button
                  onClick={() => setActiveImg(prev => (prev + 1) % allImages.length)}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%',
                    width: 36, height: 36, cursor: 'pointer', fontSize: '1.2rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
                  }}
                  aria-label="Next image"
                >›</button>
                <div style={{
                  position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 12,
                  padding: '2px 10px', fontSize: '0.75rem'
                }}>
                  {activeImg + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
          {allImages.length > 0 && (
            <div className="gallery-thumbs">
              {allImages.map((img, i) => (
                <div
                  className={`thumb${i === activeImg ? ' active' : ''}`}
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
          {!hasImages && (
            <div className="gallery-thumbs">
              <div className="thumb active">
                <svg viewBox="0 0 100 100"><use href={`#${icon}`}/></svg>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="pd-sku">{product.category_name || 'General'}</div>
          <div className="pd-title-row">
            <h1 style={{fontSize:'clamp(1.6rem,2.5vw,2.2rem)'}}>{product.name}</h1>
            <button 
              className="icon-btn-outline" 
              aria-label="Save"
              onClick={() => toggleWishlist(product.id)}
              style={wishlistIds.includes(product.id) ? { background: 'var(--ink)', color: 'var(--white)' } : {}}
            >
              <svg className="icon"><use href="#i-heart"/></svg>
            </button>
          </div>
          <div className="pd-price">Rs. {Number(product.price).toLocaleString()}</div>
          {product.stock > 0 && product.stock <= 10 && (
            <div style={{fontSize: '0.9rem', color: 'var(--sienna)', fontWeight: 600, marginTop: 8}}>Hurry! Only {product.stock} units left in stock</div>
          )}
          {product.stock > 10 && (
            <div style={{fontSize: '0.9rem', color: 'var(--moss)', fontWeight: 600, marginTop: 8}}>In stock: {product.stock} units</div>
          )}

          <p className="pd-desc">{product.description}</p>

          <div style={{display:'flex',alignItems:'center',gap:16,marginTop:16}}>
            <span className="small" style={{fontWeight:600}}>Quantity</span>
            <div className="qty-stepper">
              <button onClick={() => setQty(Math.max(1,qty-1))}><svg className="icon icon-sm"><use href="#i-minus"/></svg></button>
              <span>{Math.min(qty, product.stock)}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty+1))} disabled={qty >= product.stock}><svg className="icon icon-sm"><use href="#i-plus"/></svg></button>
            </div>
            {qty >= product.stock && product.stock > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--sienna)' }}>Max available reached</span>
            )}
          </div>

          <div className="pd-actions">
            <button className="btn btn-primary" onClick={handleAdd} disabled={adding || product.stock <= 0}>
              {adding ? 'Adding…' : added ? '✓ Added to cart' : product.stock <= 0 ? 'Out of stock' : 'Add to cart'} <svg className="icon icon-sm"><use href="#i-bag"/></svg>
            </button>
          </div>

          <div className="pd-perks">
            <div className="pd-perk"><svg className="icon"><use href="#i-truck"/></svg> Free shipping over Rs. 5,000</div>
            <div className="pd-perk"><svg className="icon"><use href="#i-shield"/></svg> 7-day easy returns</div>
            <div className="pd-perk"><svg className="icon"><use href="#i-check"/></svg> 100% authentic product</div>
          </div>
        </div>
      </div>
    </main>
  )
}
