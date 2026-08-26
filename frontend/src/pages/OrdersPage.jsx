import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelOrderId, setCancelOrderId] = useState(null)
  const [dateFilter, setDateFilter] = useState('all')
  const [customDate, setCustomDate] = useState('')

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }

  const getCsrfToken = () => {
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

  const handleCancelOrder = (orderId) => {
    setCancelOrderId(orderId)
  }

  const executeCancelOrder = async () => {
    if (!cancelOrderId) return
    const orderId = cancelOrderId
    setCancelOrderId(null)

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        }
      })
      if (res.ok) {
        setAlertConfig({ show: true, message: 'Order cancelled successfully.', type: 'success' })
        fetchOrders()
      } else {
        const data = await res.json()
        setAlertConfig({ show: true, message: data.error || 'Failed to cancel order.', type: 'error' })
      }
    } catch (err) {
      setAlertConfig({ show: true, message: 'Something went wrong.', type: 'error' })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'var(--moss)'
      case 'cancelled': return 'var(--danger)'
      case 'shipped': return '#3b82f6'
      case 'confirmed': return 'var(--sienna)'
      default: return 'var(--sienna)'
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link><svg className="icon"><use href="#i-chevron-right" /></svg><span>Order History</span>
        </div>
      </div>
      <div className="container page-head">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1>Your orders.</h1>
            <p className="lede">Track recent orders and view your purchase history.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {dateFilter === 'custom' && (
              <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={{ padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', fontSize: '0.85rem' }} />
            )}
            <div className="select-wrap" style={{ minWidth: '180px' }}>
              <select aria-label="Filter by Date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ width: '100%' }}>
                <option value="all">All Time</option>
                <option value="custom">Exact Date</option>
                <option value="30days">Last 30 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="this_year">This Year</option>
              </select>
              <svg className="icon"><use href="#i-chevron-down" /></svg>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const filteredOrders = orders.filter(order => {
          if (dateFilter === 'all') return true;
          const orderDate = new Date(order.created_at);
          const now = new Date();
          if (dateFilter === 'custom' && customDate) {
            // Compare local date strings YYYY-MM-DD
            const cd = new Date(customDate);
            return orderDate.getFullYear() === cd.getFullYear() && orderDate.getMonth() === cd.getMonth() && orderDate.getDate() === cd.getDate();
          }
          if (dateFilter === '30days') {
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            return orderDate >= thirtyDaysAgo;
          }
          if (dateFilter === '6months') {
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            return orderDate >= sixMonthsAgo;
          }
          if (dateFilter === 'this_year') {
            return orderDate.getFullYear() === now.getFullYear();
          }
          return true;
        })

        return (
          <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }}>Loading orders…</p>
            ) : filteredOrders.length === 0 ? (
              <div className="cart-empty">
                <svg className="icon"><use href="#i-bag" /></svg>
                <h3>No orders found</h3>
                {orders.length > 0 ? (
                  <button className="btn btn-primary" onClick={() => setDateFilter('all')}>Clear Filters</button>
                ) : (
                  <Link to="/shop" className="btn btn-primary">Start shopping</Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
                {filteredOrders.map(order => (
                  <div key={order.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 24, background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Order #{order.id}</h3>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Placed on {formatDate(order.created_at)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>Rs. {Number(order.total_price).toLocaleString()}</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(order.status) }}></span>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>
                    </div>

                    {/* Order items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, background: 'var(--cream)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.product.image_url ? (
                              <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <svg viewBox="0 0 100 100" style={{ width: 24, height: 24 }}><use href="#o-football" /></svg>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.product.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Qty: {item.quantity} × Rs. {Number(item.price).toLocaleString()}</div>
                          </div>
                          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Rs. {Number(item.line_total).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                      <span style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>{order.total_items} item{order.total_items > 1 ? 's' : ''} · {order.shipping_address}</span>
                      <div style={{ display: 'flex', gap: 12 }}>
                        {order.status === 'pending' && (
                          <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleCancelOrder(order.id)}>Cancel order</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}
      {/* Confirmation Modal */}
      {cancelOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Cancel Order</h3>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Are you sure you want to cancel order #{cancelOrderId}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setCancelOrderId(null)}>Keep Order</button>
              <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={executeCancelOrder}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertConfig.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '350px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: alertConfig.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              color: alertConfig.type === 'success' ? '#4caf50' : '#f44336'
            }}>
              {alertConfig.type === 'success' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              )}
            </div>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.2rem' }}>
              {alertConfig.type === 'success' ? 'Success' : 'Error'}
            </h3>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '24px', fontSize: '0.95rem' }}>
              {alertConfig.message}
            </p>
            <button className="btn btn-primary btn-block" onClick={() => setAlertConfig({ ...alertConfig, show: false })}>
              Okay
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
