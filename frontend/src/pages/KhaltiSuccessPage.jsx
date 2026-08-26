import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

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

export default function KhaltiSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { fetchCart } = useCart()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Khalti v2 redirects with `pidx` in the URL
    const pidx = searchParams.get('pidx')
    
    // Sometimes Khalti will also add a `status` query param. But we don't fully trust it; 
    // we must verify using the backend. 
    if (!pidx) {
      setStatus('error')
      setErrorMsg('No payment data received from Khalti.')
      return
    }

    verifyPayment(pidx)
  }, [])

  const verifyPayment = async (pidx) => {
    try {
      const res = await fetch('/api/payments/khalti/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ pidx }),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        setStatus('success')
        await fetchCart()
        // Auto-redirect to orders after 3 seconds
        setTimeout(() => navigate('/orders'), 3000)
      } else {
        setStatus('error')
        setErrorMsg(result.error || 'Payment verification failed.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Could not verify payment. Please contact support.')
    }
  }

  return (
    <main>
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        {status === 'verifying' && (
          <>
            <h2>Verifying your payment…</h2>
            <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Please wait while we confirm your Khalti payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✓</div>
            <h2>Payment Successful!</h2>
            <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Your order has been confirmed. Redirecting to orders…</p>
            <Link to="/orders" className="btn btn-primary" style={{ marginTop: 24 }}>View Orders</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✗</div>
            <h2>Payment Verification Failed</h2>
            <p style={{ color: 'var(--danger)', marginTop: 8 }}>{errorMsg}</p>
            <Link to="/orders" className="btn btn-primary" style={{ marginTop: 24 }}>View Orders</Link>
          </>
        )}
      </div>
    </main>
  )
}
