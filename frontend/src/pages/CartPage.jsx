import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

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

export default function CartPage() {
  const { cart, updateQty, removeItem } = useCart()
  const { user } = useAuth()

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const shipping = subtotal >= 5000 ? 0 : 200

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const total = subtotal + shipping - couponDiscount

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    setCouponError('')
    setCouponMessage('')

    try {
      const res = await fetch('/api/coupons/validate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      if (res.ok) {
        setCouponDiscount(data.discount_amount)
        setCouponApplied(data.code)
        setCouponMessage(data.message)
        setCouponError('')
      } else {
        setCouponError(data.error || 'Invalid coupon')
        setCouponDiscount(0)
        setCouponApplied('')
      }
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponDiscount(0)
    setCouponApplied('')
    setCouponMessage('')
    setCouponError('')
  }

  // Build checkout link with coupon params
  const checkoutLink = couponApplied
    ? `/checkout?coupon=${couponApplied}&discount=${couponDiscount}`
    : '/checkout'

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link><svg className="icon"><use href="#i-chevron-right" /></svg><span>Cart</span>
        </div>
      </div>
      <div className="container page-head"><h1>Your cart.</h1></div>
      <div className="container cart-layout" style={{ paddingTop: 32 }}>
        <div>
          {!user ? (
            <div className="cart-empty">
              <svg className="icon"><use href="#i-user" /></svg>
              <h3>Log in to see your cart</h3>
              <p style={{ color: 'var(--ink-soft)', marginBottom: '16px' }}>You must be logged in to view and manage your cart items.</p>
              <Link to="/login" className="btn btn-primary">Log in</Link>
            </div>
          ) : items.length === 0 ? (
            <div className="cart-empty">
              <svg className="icon"><use href="#i-bag" /></svg>
              <h3>Your cart is empty</h3>
              <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
            </div>
          ) : (
            <>
              <div className="cart-table-head"><span>Product</span><span>Price</span><span>Qty</span><span>Total</span><span></span></div>
              {items.map(item => (
                <div className="cart-line" key={item.id}>
                  <div className="cart-line-info">
                    <div className="cart-thumb">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <svg viewBox="0 0 100 100"><use href={`#${getIcon(item.product.category_name)}`} /></svg>
                      )}
                    </div>
                    <div><h4>{item.product.name}</h4><span className="cart-var">{item.product.category_name || ''}</span></div>
                  </div>
                  <span className="price">Rs. {Number(item.product.price).toLocaleString()}</span>
                  <div className="qty-stepper">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}><svg className="icon icon-sm"><use href="#i-minus" /></svg></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}><svg className="icon icon-sm"><use href="#i-plus" /></svg></button>
                  </div>
                  <span className="price">Rs. {Number(item.line_total).toLocaleString()}</span>
                  <button className="remove-line" onClick={() => removeItem(item.id)}><svg className="icon icon-sm"><use href="#i-trash" /></svg></button>
                </div>
              ))}
            </>
          )}
        </div>
        {items.length > 0 && (
          <div className="summary-card">
            <h3 style={{ marginBottom: 20 }}>Order summary</h3>

            {/* Coupon Section */}
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
              {!couponApplied ? (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>Coupon Code</label>
                  <div className="promo-row">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? '…' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: 6 }}>{couponError}</p>}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--moss-tint)', borderRadius: '4px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--moss-dark)' }}>🎟️ {couponApplied}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--moss)', marginLeft: 8 }}>−Rs. {couponDiscount.toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponMessage && !couponError && (
                <p style={{ color: 'var(--moss)', fontSize: '0.82rem', marginTop: 6 }}>{couponMessage}</p>
              )}
            </div>

            <div className="summary-row"><span>Subtotal</span><span className="price">Rs. {subtotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span className="price">{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
            {couponDiscount > 0 && (
              <div className="summary-row" style={{ color: 'var(--moss)' }}><span>Discount</span><span className="price">−Rs. {couponDiscount.toLocaleString()}</span></div>
            )}
            <div className="summary-row total"><span>Total</span><span className="price">Rs. {total.toLocaleString()}</span></div>
            <Link to={checkoutLink} className="btn btn-primary btn-block" style={{ marginTop: 24 }}>Proceed to checkout</Link>
            <Link to="/shop" className="btn btn-ghost btn-block" style={{ marginTop: 10, justifyContent: 'center' }}>Continue shopping</Link>
          </div>
        )}
      </div>
    </main>
  )
}
