import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/orders')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/orders')
    } catch (err) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="container auth-page">
        <h1>Welcome back.</h1>
        <p className="lede">Sign in to your SportShop account to track orders and save favourites.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--danger)', marginBottom: '10px' }}>{error}</div>}
          <div className="form-field"><label>Username or Email</label><input type="text" placeholder="Enter your email or username" value={email} onChange={(e) => setEmail(e.target.value)} required/></div>
          <div className="form-field"><label>Password</label><input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/></div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="auth-link"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="auth-link">Don't have an account? <Link to="/signup">Create one</Link></p>
      </div>
    </main>
  )
}
