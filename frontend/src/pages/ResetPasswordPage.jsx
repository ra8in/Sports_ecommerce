import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ResetPasswordPage() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()

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
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (password !== confirmPassword) return setError("Passwords don't match")

    setLoading(true)
    try {
      const res = await fetch('/api/users/password-reset-confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ uid, token, new_password: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="container auth-page">
        {success ? (
          <>
            <h1>Password updated!</h1>
            <p className="lede">Your password has been changed. Redirecting you to sign in…</p>
            <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '24px' }}>Sign in now</Link>
          </>
        ) : (
          <>
            <h1>Set new password.</h1>
            <p className="lede">Enter your new password below. Make sure it's at least 8 characters.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div style={{ color: 'var(--danger)', marginBottom: '10px' }}>{error}</div>}
              <div className="form-field"><label>New password</label><input type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}/></div>
              <div className="form-field"><label>Confirm new password</label><input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8}/></div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Resetting…' : 'Reset password'}</button>
            </form>
            <p className="auth-link"><Link to="/login">Back to sign in</Link></p>
          </>
        )}
      </div>
    </main>
  )
}
