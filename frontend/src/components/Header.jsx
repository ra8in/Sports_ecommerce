import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/api/products/categories/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(err => console.error("Failed to load categories header", err))
  }, [])
  
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      // Remove focus from input on submit
      if (searchInputRef.current) searchInputRef.current.blur()
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
        setShowLogoutConfirm(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
  }
  
  return (
    <>
      <div className="announce">
        Free shipping on orders over Rs. 5,000 &nbsp;·&nbsp; 100% authentic sports gear
      </div>
      <header className="site-header">
        <div className="container header-row">
          <Link to="/" className="wordmark"><span className="mark">Sport</span>Shop</Link>

          <nav className="main-nav" aria-label="Primary" style={{
            display: 'flex', 
            gap: '1.5rem', 
            overflowX: 'auto', 
            whiteSpace: 'nowrap', 
            WebkitOverflowScrolling: 'touch', 
            msOverflowStyle: 'none', 
            scrollbarWidth: 'none', 
            flexShrink: 1, 
            marginRight: '1rem',
            paddingBottom: '2px'
          }}>
            <style>{`.main-nav::-webkit-scrollbar { display: none; }`}</style>
            <Link to="/shop" className={location.pathname === '/shop' && !location.search ? 'active' : ''}>Shop</Link>
            {categories.map(cat => {
               const catLower = cat.name.toLowerCase();
               return (
                 <Link 
                    key={cat.id} 
                    to={`/shop?category=${encodeURIComponent(catLower)}`} 
                    className={decodeURIComponent(location.search).toLowerCase().includes(catLower) ? 'active' : ''}
                 >
                    {cat.name}
                 </Link>
               )
            })}
          </nav>

          <div className="header-actions">
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                 ref={searchInputRef}
                 type="text" 
                 placeholder="Search products..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 style={{ width: '180px', padding: '8px 14px', borderRadius: '20px', border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                 onFocus={(e) => e.target.style.borderColor = 'var(--ink)'}
                 onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
              />
            </form>
            
            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <svg className="icon"><use href="#i-bag"/></svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}</Link>
            
            <button className="icon-btn menu-toggle" aria-label="Menu" aria-expanded="false">
              <svg className="icon"><use href="#i-menu"/></svg>
            </button>

            {!user ? (
              <Link to="/login" className="icon-btn" aria-label="Account" title="Login">
                <svg className="icon"><use href="#i-user"/></svg>
              </Link>
            ) : (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button 
                  className="icon-btn profile-icon" 
                  aria-label="Account Menu" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div style={{
                    width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--ink)', color: 'var(--surface)', borderRadius: '50%', fontSize: '13px', fontWeight: 'bold'
                  }}>
                    {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {showDropdown && (
                  <div className="profile-dropdown" style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: '8px', padding: '8px', minWidth: '180px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100
                  }}>
                    {!showLogoutConfirm ? (
                      <>
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', marginBottom: '8px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>{user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}</div>
                          <div style={{ color: 'var(--ink-soft)', fontSize: '12px', wordBreak: 'break-all' }}>{user.email}</div>
                        </div>
                        <Link to="/settings" style={{ display: 'block', padding: '8px 12px', fontSize: '14px', color: 'var(--ink)', textDecoration: 'none', borderRadius: '4px' }} onClick={() => setShowDropdown(false)}>My Profile</Link>
                        <Link to="/orders" style={{ display: 'block', padding: '8px 12px', fontSize: '14px', color: 'var(--ink)', textDecoration: 'none', borderRadius: '4px' }} onClick={() => setShowDropdown(false)}>My Orders</Link>
                        <Link to="/wishlist" style={{ display: 'block', padding: '8px 12px', fontSize: '14px', color: 'var(--ink)', textDecoration: 'none', borderRadius: '4px' }} onClick={() => setShowDropdown(false)}>My Watchlist</Link>
                        <div style={{ height: '1px', background: 'var(--line)', margin: '8px 0' }} />
                        <button 
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: '14px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                          onClick={() => setShowLogoutConfirm(true)}
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <div style={{ padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--ink)' }}>Are you sure?</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            style={{ flex: 1, padding: '6px', fontSize: '13px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={() => setShowLogoutConfirm(false)}
                          >
                            Cancel
                          </button>
                          <button 
                            style={{ flex: 1, padding: '6px', fontSize: '13px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={handleLogout}
                          >
                            Log out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
