import { Link, useSearchParams } from 'react-router-dom'

export default function KhaltiFailurePage() {
  const [searchParams] = useSearchParams()
  const errorMsg = searchParams.get('message') || 'Your Khalti payment was cancelled or failed.'

  return (
    <main>
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✗</div>
        <h2>Payment Cancelled</h2>
        <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
          {errorMsg} No charges were made.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <Link to="/checkout" className="btn btn-primary">Try Again</Link>
          <Link to="/cart" className="btn btn-outline">Back to Cart</Link>
        </div>
      </div>
    </main>
  )
}
