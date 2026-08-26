import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const searchQuery = searchParams.get('q')

  const [selectedCategories, setSelectedCategories] = useState(
    categoryFilter ? [categoryFilter] : []
  )
  const [selectedPrices, setSelectedPrices] = useState([])
  const [sortOption, setSortOption] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [])

  // Sync header category links click to local filter state dynamically
  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategories([categoryFilter])
    } else {
      setSelectedCategories([])
    }
  }, [categoryFilter])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/products/')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
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

  const handleAdd = async (productId) => {
    await addToCart(productId)
  }

  // Pre-calculate category counts
  const categoryCounts = {}
  products.forEach(p => {
    if (p.category_name) {
      categoryCounts[p.category_name] = (categoryCounts[p.category_name] || 0) + 1
    }
  })

  // Define price brackets
  const priceRanges = [
    { id: 'under3k', label: 'Under Rs. 3,000', check: p => Number(p.price) < 3000 },
    { id: '3k-8k', label: 'Rs. 3,000 – 8,000', check: p => Number(p.price) >= 3000 && Number(p.price) <= 8000 },
    { id: '8k-15k', label: 'Rs. 8,000 – 15,000', check: p => Number(p.price) > 8000 && Number(p.price) <= 15000 },
    { id: 'above15k', label: 'Rs. 15,000 and up', check: p => Number(p.price) > 15000 },
  ]

  let filtered = [...products]

  if (selectedCategories.length > 0) {
    const selectedLower = selectedCategories.map(c => c.toLowerCase())
    filtered = filtered.filter(p => p.category_name && selectedLower.includes(p.category_name.toLowerCase()))
  }

  if (selectedPrices.length > 0) {
    filtered = filtered.filter(p => {
      return selectedPrices.some(rangeId => {
        const range = priceRanges.find(r => r.id === rangeId)
        return range && range.check(p)
      })
    })
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category_name?.toLowerCase().includes(q)
    )
  }

  if (sortOption === "price_asc") {
    filtered.sort((a, b) => Number(a.price) - Number(b.price))
  } else if (sortOption === "price_desc") {
    filtered.sort((a, b) => Number(b.price) - Number(a.price))
  } else {
    // Newest
    filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }

  // Pagination logic
  const PRODUCTS_PER_PAGE = 12;
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const currentProducts = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedPrices, sortOption, searchQuery]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.some(c => c.toLowerCase() === cat.toLowerCase()) 
        ? prev.filter(c => c.toLowerCase() !== cat.toLowerCase()) 
        : [...prev, cat]
    )
  }

  const togglePrice = (id) => {
    setSelectedPrices(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPrices([])
  }

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <svg className="icon"><use href="#i-chevron-right" /></svg>
          <span>Full Catalog</span>
        </div>
      </div>

      <div className="container shop-layout">
        <aside className="filter-sidebar">
          <div className="filter-group">
            <div className="filter-title">Sport</div>
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <label className="filter-option" key={cat} style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedCategories.some(c => c.toLowerCase() === cat.toLowerCase())} 
                  onChange={() => toggleCategory(cat)} 
                /> 
                {cat} 
                <span className="faint mono small" style={{ marginLeft: 'auto' }}>{count}</span>
              </label>
            ))}
          </div>
          <div className="filter-group">
            <div className="filter-title">Price</div>
            {priceRanges.map(range => (
              <label className="filter-option" key={range.id} style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedPrices.includes(range.id)} 
                  onChange={() => togglePrice(range.id)}
                /> 
                {range.label}
              </label>
            ))}
          </div>
          {(selectedCategories.length > 0 || selectedPrices.length > 0) && (
            <button className="btn btn-outline btn-block" onClick={clearFilters}>Clear filters</button>
          )}
        </aside>

        <div className="shop-main">
          <div className="toolbar">
            <span className="toolbar-left">Showing 1–{filtered.length} of {filtered.length}</span>
            <div className="toolbar-right">
              <div className="select-wrap">
                <select aria-label="Sort by" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="newest">Sort: Newest</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
                <svg className="icon"><use href="#i-chevron-down" /></svg>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }}>Loading products…</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }}>No products found.</p>
          ) : (
            <>
              <div className="product-grid">
                {currentProducts.map(p => (
                  <article className="product-card" key={p.id}>
                  <Link to={`/product/${p.slug}`} className="product-media">
                    {p.stock <= 0 && <span className="tag">Sold out</span>}
                    <button 
                      className={`wish ${wishlistIds.includes(p.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      aria-label="Toggle wishlist"
                    >
                      <svg className="icon icon-sm"><use href="#i-heart"/></svg>
                    </button>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <svg viewBox="0 0 100 100"><use href={`#${getIcon(p.category_name)}`} /></svg>
                    )}
                  </Link>
                  <div className="product-meta-top"><span>{p.category_name || 'General'}</span></div>
                  <Link to={`/product/${p.slug}`}><h3>{p.name}</h3></Link>
                  <p className="product-sub">{p.description?.slice(0, 60) || ''}</p>
                  <div className="product-price-row">
                    <div>
                      <span className="price" style={{ display: 'block' }}>Rs. {Number(p.price).toLocaleString()}</span>
                      {p.stock > 0 && p.stock <= 10 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--sienna)', fontWeight: 600 }}>Only {p.stock} left</span>
                      )}
                      {p.stock > 10 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--moss)', fontWeight: 600 }}>In stock: {p.stock}</span>
                      )}
                    </div>
                    <button className="add-btn" aria-label="Add to cart" onClick={() => handleAdd(p.id)} disabled={p.stock <= 0} style={{ opacity: p.stock <= 0 ? 0.5 : 1 }}>
                      <svg className="icon icon-sm"><use href="#i-plus" /></svg>
                    </button>
                  </div>
                </article>
              ))}
              </div>
              
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
                  <button 
                    className="btn btn-outline" 
                    disabled={currentPage === 1}
                    onClick={() => {
                        setCurrentPage(p => p - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '14px', color: 'var(--ink)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    className="btn btn-outline" 
                    disabled={currentPage === totalPages}
                    onClick={() => {
                         setCurrentPage(p => p + 1)
                         window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
