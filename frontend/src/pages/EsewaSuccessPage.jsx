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

export default function EsewaSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { fetchCart } = useCart()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      setStatus('error')
      setErrorMsg('No payment data received from eSewa.')
      return
    }

    verifyPayment(data)
  }, [])

  const verifyPayment = async (data) => {
    try {
      const res = await fetch('/api/payments/esewa/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ data }),
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
            <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Please wait while we confirm your eSewa payment.</p>
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
