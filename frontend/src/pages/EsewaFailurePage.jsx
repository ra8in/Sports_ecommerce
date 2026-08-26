import { Link } from 'react-router-dom'

export default function EsewaFailurePage() {
  return (
    <main>
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✗</div>
        <h2>Payment Cancelled</h2>
        <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
          Your eSewa payment was cancelled or failed. No charges were made.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <Link to="/checkout" className="btn btn-primary">Try Again</Link>
          <Link to="/cart" className="btn btn-outline">Back to Cart</Link>
        </div>
      </div>
    </main>
  )
}
