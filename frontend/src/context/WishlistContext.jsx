import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

function getCsrfToken() {
  const name = 'csrftoken='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1)
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
  }
  return ''
}

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState([])
  const [toastState, setToastState] = useState(null)

  const fetchWishlistIds = useCallback(async () => {
    if (!user) {
      setWishlistIds([])
      return
    }
    try {
      const res = await fetch('/api/wishlist/ids/')
      if (res.ok) {
        const data = await res.json()
        setWishlistIds(data.product_ids || [])
      }
    } catch (err) {
      console.error('Failed to fetch wishlist ids', err)
    }
  }, [user])

  useEffect(() => {
    fetchWishlistIds()
  }, [fetchWishlistIds])

  const toggleWishlist = async (productId) => {
    if (!user) {
      setToastState({ type: 'login' })
      setTimeout(() => setToastState(null), 5000)
      return { requiresLogin: true }
    }

    // Optimistic update
    const isWished = wishlistIds.includes(productId)
    if (isWished) {
      setWishlistIds(prev => prev.filter(id => id !== productId))
      setToastState({ type: 'removed' })
    } else {
      setWishlistIds(prev => [...prev, productId])
      setToastState({ type: 'added' })
    }
    setTimeout(() => setToastState(null), 3000)

    try {
      const res = await fetch('/api/wishlist/toggle/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ product_id: productId }),
      })
      
      if (!res.ok) {
        // Revert on failure
        fetchWishlistIds()
        return { error: 'Failed to toggle wishlist' }
      }
      
      return { success: true }
    } catch (err) {
      fetchWishlistIds()
      return { error: 'Network error' }
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, fetchWishlistIds }}>
      {children}
      {toastState && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', 
          background: 'var(--surface)', border: '1px solid var(--line)', 
          padding: '16px 20px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toastState.type === 'login' ? (
            <svg className="icon" style={{color: 'var(--ink)'}}><use href="#i-user"/></svg>
          ) : (
            <svg className="icon" style={{color: toastState.type === 'added' ? 'var(--danger)' : 'var(--ink-soft)', fill: toastState.type === 'added' ? 'currentColor' : 'none'}}><use href="#i-heart"/></svg>
          )}
          
          <div>
            {toastState.type === 'login' && (
              <>
                <div style={{fontWeight: 600, fontSize: '14px', marginBottom: '2px'}}>Log in required</div>
                <div style={{fontSize: '13px', color: 'var(--ink-soft)'}}>Please <Link to="/login" onClick={() => setToastState(null)} style={{color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline'}}>log in</Link> to use the wishlist.</div>
              </>
            )}
            {toastState.type === 'added' && (
              <div style={{fontWeight: 600, fontSize: '14px', color: 'var(--ink)'}}>Added to your watchlist!</div>
            )}
            {toastState.type === 'removed' && (
              <div style={{fontWeight: 600, fontSize: '14px', color: 'var(--ink)'}}>Removed from watchlist</div>
            )}
          </div>
          
          <button style={{background:'none',border:'none',cursor:'pointer',padding:'4px',marginLeft: '8px'}} onClick={() => setToastState(null)}>
             <svg className="icon icon-sm"><use href="#i-plus" style={{transform:'rotate(45deg)', transformOrigin:'center'}}/></svg>
          </button>
          
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
