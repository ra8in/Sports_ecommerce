import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { wishlistIds, toggleWishlist } = useWishlist()

  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [heroProducts, setHeroProducts] = useState([])
  const [heroSlide, setHeroSlide] = useState(0)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let timer = setInterval(() => {
      setHeroSlide(s => (s + 1) % 4) // Default fallback if no products
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/products/products/').then(res => res.json()),
      fetch('/api/products/categories/').then(res => res.json())
    ]).then(([prodData, catData]) => {
      const prods = Array.isArray(prodData) ? prodData : []
      setProducts(prods)
      // Fisher-Yates shuffle for true randomness
      const shuffled = [...prods]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      setFeaturedProducts(shuffled.slice(0, 4))
      // Hero uses a separate shuffle so it's different from featured
      const heroShuffled = [...prods]
      for (let i = heroShuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [heroShuffled[i], heroShuffled[j]] = [heroShuffled[j], heroShuffled[i]]
      }
      setHeroProducts(heroShuffled.slice(0, 4))
      setCategories(Array.isArray(catData) ? catData : [])
    }).catch(err => {
      console.error("Failed to load home page data", err)
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const handleAdd = async (productId) => {
    await addToCart(productId)
  }

  const getIcon = (cat) => {
    if (!cat) return 'o-football'
    const name = cat.toLowerCase()
    if (name.includes('football') || name.includes('soccer')) return 'o-football'
    if (name.includes('running') || name.includes('shoe')) return 'o-shoe'
    if (name.includes('cricket')) return 'o-cricket'
    if (name.includes('basket')) return 'o-basketball'
    if (name.includes('gym') || name.includes('fitness')) return 'o-dumbbell'
    return 'o-football'
  }

  // Pre-calculate counts for categories based on loaded products
  const categoryCounts = {}
  products.forEach(p => {
    if (p.category_name) {
      categoryCounts[p.category_name] = (categoryCounts[p.category_name] || 0) + 1
    }
  })

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">New Season Collection 2026</span>
            <h1>Gear built to perform.</h1>
            <p className="lede">SportShop brings you premium equipment, footwear and apparel from top brands. Every piece is tested, trusted and made for athletes who demand more.</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">Shop new arrivals <svg className="icon icon-sm"><use href="#i-arrow-right" /></svg></Link>
              <Link to="/shop" className="btn btn-outline">Browse catalog</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10%' }}>

            <div style={{
              position: 'absolute', top: 18, left: 18,
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em',
              color: 'var(--ink-soft)', border: '1px solid var(--line-strong)',
              padding: '4px 9px', borderRadius: 20, background: 'rgba(251,249,244,0.7)',
              zIndex: 10
            }}>
              Featured Product
            </div>

            {heroProducts.length > 0 && heroProducts[heroSlide % heroProducts.length]?.image_url ? (
              <img
                key={heroProducts[heroSlide % heroProducts.length].id}
                src={heroProducts[heroSlide % heroProducts.length].image_url}
                alt="Featured product"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply',
                  filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))',
                  transform: 'scale(1.1) rotate(-8deg)',
                  transition: 'opacity 0.4s ease-in-out'
                }}
              />
            ) : (
              <svg viewBox="0 0 100 100"><use href="#o-shoe" /></svg>
            )}

            {heroProducts.length > 1 && (
              <>
                <button
                  onClick={() => setHeroSlide(s => (s - 1 + heroProducts.length) % heroProducts.length)}
                  aria-label="Previous product"
                  style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(251,249,244,0.85)', border: '1px solid var(--line)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10, transition: 'background 0.2s ease'
                  }}
                >
                  <svg className="icon icon-sm"><use href="#i-chevron-left" /></svg>
                </button>
                <button
                  onClick={() => setHeroSlide(s => (s + 1) % heroProducts.length)}
                  aria-label="Next product"
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(251,249,244,0.85)', border: '1px solid var(--line)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10, transition: 'background 0.2s ease'
                  }}
                >
                  <svg className="icon icon-sm"><use href="#i-chevron-right" /></svg>
                </button>
              </>
            )}

            {heroProducts.length > 0 && (
              <div style={{ position: 'absolute', bottom: 18, display: 'flex', gap: '6px', zIndex: 10 }}>
                {heroProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => setHeroSlide(idx)}
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: idx === (heroSlide % heroProducts.length) ? 'var(--ink)' : 'var(--line-strong)',
                      transition: 'background 0.3s ease',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>


      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-head-copy">
                <span className="eyebrow">Shop by sport</span>
              </div>
              <Link to="/shop" className="btn btn-ghost">View full catalog <svg className="icon icon-sm"><use href="#i-arrow-right" /></svg></Link>
            </div>
            <div className="cat-grid" style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '24px',
              paddingBottom: '16px',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              margin: '0 -16px', // Negative margin to allow full bleed scroll on mobile if needed, or just normal padding
              padding: '0 16px'
            }}>
              <style>{`.cat-grid::-webkit-scrollbar { display: none; }`}</style>
              {categories.map(cat => (
                <Link className="cat-card" to={`/shop?category=${cat.name.toLowerCase()}`} key={cat.id} style={{ minWidth: '240px', flex: '0 0 auto' }}>
                  {cat.resolved_image_url ? (
                    <img src={cat.resolved_image_url} alt={cat.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }} />
                  ) : (
                    <svg className="icon" style={{ width: 26, height: 26, marginBottom: '12px' }}><use href={`#${getIcon(cat.name)}`} /></svg>
                  )}
                  <div>
                    <span className="cat-count">{categoryCounts[cat.name] || 0} products</span>
                    <h3>{cat.name}</h3>
                  </div>
                  <div className="cat-foot"><span className="small muted">View gear</span><svg className="icon icon-sm"><use href="#i-chevron-right" /></svg></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="eyebrow">This week's picks</span>
              <h2>New this week.</h2>
            </div>
            <div className="toolbar-right">
              <Link to="/shop" className="btn btn-ghost">See all new arrivals <svg className="icon icon-sm"><use href="#i-arrow-right" /></svg></Link>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }}>Loading products…</p>
          ) : (
            <div className="product-grid">
              {featuredProducts.map(p => (
                <article className="product-card" key={p.id}>
                  <Link to={`/product/${p.slug}`} className="product-media">
                    {p.stock <= 0 && <span className="tag">Sold out</span>}
                    {p.stock > 0 && (new Date() - new Date(p.created_at || Date.now())) < 7 * 24 * 60 * 60 * 1000 && <span className="tag">New</span>}
                    <button
                      className={`wish ${wishlistIds.includes(p.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      aria-label="Toggle wishlist"
                    >
                      <svg className="icon icon-sm"><use href="#i-heart" /></svg>
                    </button>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <svg viewBox="0 0 100 100"><use href={`#${getIcon(p.category_name)}`} /></svg>
                    )}
                  </Link>
                  <div className="product-meta-top"><span>SKU-{p.id.toString().padStart(3, '0')}</span><span>{p.category_name || 'General'}</span></div>
                  <Link to={`/product/${p.slug}`}><h3>{p.name}</h3></Link>
                  <p className="product-sub">{p.description?.slice(0, 60) || ''}</p>
                  <div className="product-price-row">
                    <span className="price">Rs. {Number(p.price).toLocaleString()}</span>
                    <button className="add-btn" aria-label="Add to cart" onClick={() => handleAdd(p.id)} disabled={p.stock <= 0} style={{ opacity: p.stock <= 0 ? 0.5 : 1 }}>
                      <svg className="icon icon-sm"><use href="#i-plus" /></svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="section-tight">
        <div className="container value-strip">
          <div className="value-item">
            <svg className="icon icon-lg"><use href="#i-truck" /></svg>
            <div><h4>Fast delivery</h4><p>Free shipping on orders above Rs. 5,000. Delivered within 3-5 business days.</p></div>
          </div>
          <div className="value-item">
            <svg className="icon icon-lg"><use href="#i-leaf" /></svg>
            <div><h4>100% authentic</h4><p>Every product is sourced directly from authorized distributors and brands.</p></div>
          </div>
          <div className="value-item">
            <svg className="icon icon-lg"><use href="#i-shield" /></svg>
            <div><h4>Easy returns</h4><p>Not the right fit? Return within 7 days for a full refund, no questions asked.</p></div>
          </div>
          <div className="value-item">
            <svg className="icon icon-lg"><use href="#i-lock" /></svg>
            <div><h4>Secure checkout</h4><p>Payments encrypted end to end. We accept eSewa, Khalti and COD.</p></div>
          </div>
        </div>
      </section>



      {/* NEWSLETTER */}
      <section className="section">
        <div className="container">
          <div className="newsletter">
            <div>
              <h2>Get first pick of new stock.</h2>
              <p>One email a week when new gear drops — no spam, ever. Unsubscribe any time.</p>
            </div>
            <form className="news-form" onSubmit={e => { e.preventDefault(); }}>
              <input type="email" required placeholder="Enter your email" aria-label="Email address" />
              <button className="btn btn-primary" type="submit">Sign up</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
