import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/orders')
    }
  }, [user, navigate])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/users/password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="container auth-page">
        {sent ? (
          <>
            <h1>Check your inbox.</h1>
            <p className="lede">We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to create a new password.</p>
            <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '24px' }}>Back to sign in</Link>
          </>
        ) : (
          <>
            <h1>Forgot password?</h1>
            <p className="lede">Enter your email and we'll send you a link to reset your password.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div style={{ color: 'var(--danger)', marginBottom: '10px' }}>{error}</div>}
              <div className="form-field"><label>Email address</label><input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required/></div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
            </form>
            <p className="auth-link">Remember your password? <Link to="/login">Sign in</Link></p>
          </>
        )}
      </div>
    </main>
  )
}
