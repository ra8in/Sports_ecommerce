import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

const CartContext = createContext()

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

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [toastState, setToastState] = useState(null)


  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null)
      setCartCount(0)
      return
    }
    try {
      const res = await fetch('/api/cart/')
      if (res.ok) {
        const data = await res.json()
        setCart(data)
        setCartCount(data.total_items || 0)
      }
    } catch (err) {
      console.error('Failed to fetch cart', err)
    }
  }, [user])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      setToastState({ type: 'login' })
      setTimeout(() => setToastState(null), 5000)
      return { requiresLogin: true }
    }

    try {
      const res = await fetch('/api/cart/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data)
        setCartCount(data.total_items || 0)
        
        setToastState({ type: 'added' })
        setTimeout(() => setToastState(null), 3000)

        return { success: true }
      }
      const err = await res.json()
      return { error: err.error || 'Failed to add to cart' }
    } catch (err) {
      return { error: 'Network error' }
    }
  }

  const updateQty = async (itemId, quantity) => {
    try {
      const res = await fetch(`/api/cart/update/${itemId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ quantity }),
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data)
        setCartCount(data.total_items || 0)
      }
    } catch (err) {
      console.error('Failed to update qty', err)
    }
  }

  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`/api/cart/remove/${itemId}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': getCsrfToken() },
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data)
        setCartCount(data.total_items || 0)
        
        setToastState({ type: 'removed' })
        setTimeout(() => setToastState(null), 3000)
      }
    } catch (err) {
      console.error('Failed to remove item', err)
    }
  }

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart/clear/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() },
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data)
        setCartCount(data.total_items || 0)
      }
    } catch (err) {
      console.error('Failed to clear cart', err)
    }
  }

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, updateQty, removeItem, clearCart, fetchCart }}>
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
            <svg className="icon" style={{color: 'var(--moss)'}}><use href="#i-bag"/></svg>
          )}

          <div>
            {toastState.type === 'login' && (
              <>
                <div style={{fontWeight: 600, fontSize: '14px', marginBottom: '2px'}}>Log in required</div>
                <div style={{fontSize: '13px', color: 'var(--ink-soft)'}}>Please <Link to="/login" onClick={() => setToastState(null)} style={{color: 'var(--ink)', fontWeight: 600, textDecoration: 'underline'}}>log in</Link> to add to cart.</div>
              </>
            )}
            {toastState.type === 'added' && (
              <div style={{fontWeight: 600, fontSize: '14px', color: 'var(--ink)'}}>Added to your cart!</div>
            )}
            {toastState.type === 'removed' && (
              <div style={{fontWeight: 600, fontSize: '14px', color: 'var(--ink)'}}>Removed from cart</div>
            )}
          </div>
          
          <button style={{background:'none',border:'none',cursor:'pointer',padding:'4px',marginLeft: '8px'}} onClick={() => setToastState(null)}>
             <svg className="icon icon-sm"><use href="#i-plus" style={{transform:'rotate(45deg)', transformOrigin:'center'}}/></svg>
          </button>
        </div>
      )}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
