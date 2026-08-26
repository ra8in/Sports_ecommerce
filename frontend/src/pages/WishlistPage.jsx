import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

export default function WishlistPage() {
  const { user } = useAuth()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetch('/api/wishlist/')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
      })
      .catch(err => console.error("Failed to load wishlist", err))
      .finally(() => setLoading(false))
  }, [user, wishlistIds.length]) // re-fetch if length changes significantly, though optimistic update handles UI

  const currentProducts = products.filter(p => wishlistIds.includes(p.id))

  if (loading) return <div className="container section">Loading watchlist...</div>

  if (!user) {
    return (
      <div className="container section cart-empty">
        <svg className="icon"><use href="#i-heart"/></svg>
        <h3>Your Watchlist</h3>
        <p className="lede">Log in to save items you're interested in.</p>
        <Link to="/login" className="btn btn-primary">Log in</Link>
      </div>
    )
  }

  return (
    <main>
      <div className="page-head">
        <div className="container">
          <h1>My Watchlist</h1>
          <p className="lede">Gear you're keeping an eye on.</p>
        </div>
      </div>

      <section className="section section-tight">
        <div className="container">
          {currentProducts.length === 0 ? (
            <div className="cart-empty">
              <svg className="icon"><use href="#i-heart"/></svg>
              <h3>Nothing here yet</h3>
              <p className="lede">Start adding products to your watchlist by clicking the heart icon on any product.</p>
              <Link to="/shop" className="btn btn-primary">Explore products</Link>
            </div>
          ) : (
            <div className="product-grid">
              {currentProducts.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.slug}`} className="product-media">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <svg viewBox="0 0 100 100"><use href="#o-shoe"/></svg>
                    )}
                    <button 
                      className={`wish ${wishlistIds.includes(product.id) ? 'active' : ''}`} 
                      aria-label="Remove from watchlist"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(product.id)
                      }}
                    >
                      <svg className="icon"><use href="#i-heart"/></svg>
                    </button>
                    {product.is_featured && <span className="tag">Trending</span>}
                  </Link>
                  <div className="product-meta-top">
                    <span>{product.category_name}</span>
                  </div>
                  <Link to={`/product/${product.slug}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p className="product-sub">{product.description?.substring(0, 48)}...</p>
                  <div className="product-price-row">
                    <span className="price">Rs. {Math.floor(product.price).toLocaleString()}</span>
                    <button 
                      className="add-btn" 
                      aria-label="Add to cart"
                      onClick={(e) => {
                        e.preventDefault()
                        addToCart(product.id)
                      }}
                    >
                      <svg className="icon icon-sm"><use href="#i-plus"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
