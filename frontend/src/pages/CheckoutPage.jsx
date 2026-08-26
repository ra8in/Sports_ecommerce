import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

import esewaLogo from '../assets/esewa.png'
import khaltiLogo from '../assets/khalti.png'
import codLogo from '../assets/cod.png'

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

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cart, fetchCart } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const shipping = subtotal >= 5000 ? 0 : 200

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const total = subtotal + shipping - couponDiscount

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Confirmation Modal State
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setFirstName(user.first_name || '')
    setLastName(user.last_name || '')
    setEmail(user.email || '')
    if (user.profile) {
      setPhone(user.profile.phone || '')
      setAddress(user.profile.address || '')
    }

    // Restore coupon from cart page via query params
    const couponParam = searchParams.get('coupon')
    const discountParam = searchParams.get('discount')
    if (couponParam && discountParam) {
      setCouponCode(couponParam)
      setCouponApplied(couponParam)
      setCouponDiscount(parseFloat(discountParam))
      setCouponMessage(`Coupon ${couponParam} applied! You save Rs. ${parseInt(discountParam)}`)
    }
  }, [user, navigate, searchParams])

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

  // ── Apply Coupon ──
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

  // ── COD Order ──
  const placeCodOrder = async () => {
    const res = await fetch('/api/orders/place/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify({
        shipping_address: address,
        phone: phone,
        payment_method: 'cod',
        coupon_code: couponApplied,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to place order')
    await fetchCart()
    setLoading(false)
    setShowSuccess(true) // Show success modal instead of native alert
  }

  // ── eSewa Payment ──
  const initiateEsewa = async () => {
    const res = await fetch('/api/payments/esewa/initiate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify({
        shipping_address: address,
        phone: phone,
        coupon_code: couponApplied,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to initiate eSewa payment')

    // Auto-submit a hidden form to redirect to eSewa
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = data.esewa_url

    Object.entries(data.form_data).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  // ── Khalti Payment (KPG v2) ──
  const initiateKhalti = async () => {
    const res = await fetch('/api/payments/khalti/initiate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify({
        shipping_address: address,
        phone: phone,
        coupon_code: couponApplied,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to initiate Khalti payment')

    // Redirect user to Khalti payment page
    window.location.href = data.payment_url
  }

  // ── Main Handler ──
  const handlePlaceOrder = (e) => {
    e.preventDefault()
    if (items.length === 0) return
    setShowConfirm(true) // Show custom popup instead of window.confirm
  }

  const executeOrder = async () => {
    setShowConfirm(false)
    setError('')
    setLoading(true)

    try {
      if (paymentMethod === 'cod') {
        await placeCodOrder()
      } else if (paymentMethod === 'esewa') {
        await initiateEsewa()
      } else if (paymentMethod === 'khalti') {
        await initiateKhalti()
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link><svg className="icon"><use href="#i-chevron-right" /></svg>
          <Link to="/cart">Cart</Link><svg className="icon"><use href="#i-chevron-right" /></svg>
          <span>Checkout</span>
        </div>
      </div>
      <div className="container page-head"><h1>Checkout.</h1></div>
      <div className="container checkout-layout" style={{ paddingTop: 24 }}>
        <form onSubmit={handlePlaceOrder}>
          <div className="steps">
            <span className="step active">Information</span><span className="sep">→</span>
            <span className="step">Payment</span><span className="sep">→</span>
            <span className="step">Confirmation</span>
          </div>

          {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', background: 'rgba(200,50,50,0.08)', padding: '12px', borderRadius: '4px' }}>{error}</div>}

          <div className="form-section">
            <h3>Contact (Billed To)</h3>
            <div className="form-row">
              <div className="form-field"><label>First name</label><input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
              <div className="form-field"><label>Last name</label><input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label>Email</label><input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="form-field"><label>Phone</label><input id="checkout-phone" type="tel" placeholder="98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
            </div>
          </div>
          <div className="form-section">
            <h3>Shipping Details</h3>
            <div className="form-field" style={{ marginBottom: 16 }}><label>Pickup Address</label><input id="checkout-address" type="text" placeholder="Street address or Location" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
          </div>
          <div className="form-section">
            <h3>Payment</h3>
            <div className="payment-tabs">
              <button type="button" className={`pay-tab${paymentMethod === 'cod' ? ' active' : ''}`} onClick={() => setPaymentMethod('cod')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <img src={codLogo} alt="COD" style={{ height: '20px' }} /> <span>Cash on Delivery</span>
              </button>
              <button type="button" className={`pay-tab${paymentMethod === 'esewa' ? ' active' : ''}`} onClick={() => setPaymentMethod('esewa')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={esewaLogo} alt="eSewa" style={{ height: '24px' }} /><span>E-sewa</span>
              </button>
              <button type="button" className={`pay-tab${paymentMethod === 'khalti' ? ' active' : ''}`} onClick={() => setPaymentMethod('khalti')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={khaltiLogo} alt="Khalti" style={{ height: '24px' }} /><span>Khalti</span>
              </button>
            </div>
            {paymentMethod === 'esewa' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: 8 }}>You will be redirected to eSewa to complete the payment.</p>
            )}
            {paymentMethod === 'khalti' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: 8 }}>A Khalti payment window will open to complete the payment.</p>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={items.length === 0 || loading}>
            {loading ? 'Processing…' : paymentMethod === 'cod' ? 'Place order' : `Pay with ${paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}`}
          </button>
        </form>
        <div className="summary-card">
          <h3 style={{ marginBottom: 20 }}>Your order</h3>
          {items.map((item) => (
            <div className="order-line" key={item.id}>
              <div className="cart-thumb">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <svg viewBox="0 0 100 100"><use href={`#${getIcon(item.product.category_name)}`} /></svg>
                )}
              </div>
              <div className="order-line-info"><h5>{item.product.name}</h5><span>{item.product.category_name || 'General'} · Qty: {item.quantity}</span></div>
              <span className="price">Rs. {Number(item.line_total).toLocaleString()}</span>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>Your cart is empty.</p>}

          {/* Coupon Section */}
          <div style={{ marginTop: 16 }}>
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
                    {applyingCoupon ? 'Applying…' : 'Apply'}
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

          {/* Order Summary */}
          <div className="summary-row" style={{ marginTop: 16 }}><span>Subtotal</span><span className="price">Rs. {subtotal.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span className="price">{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
          {couponDiscount > 0 && (
            <div className="summary-row" style={{ color: 'var(--moss)' }}><span>Discount</span><span className="price">−Rs. {couponDiscount.toLocaleString()}</span></div>
          )}
          <div className="summary-row total"><span>Total</span><span className="price">Rs. {total.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Confirm Order</h3>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Are you sure you want to place this order using <strong>{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={executeOrder}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '350px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.2rem' }}>Order Placed!</h3>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Your order has been placed successfully. You can track its status in your order history.
            </p>
            <button className="btn btn-primary btn-block" onClick={() => {
              setShowSuccess(false)
              navigate('/orders')
            }}>
              View My Orders
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
