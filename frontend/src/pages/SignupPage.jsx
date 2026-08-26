import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/orders')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      return setError("Passwords don't match")
    }
    
    setLoading(true)
    try {
      await register(username, email, password, firstName, lastName)
      navigate('/orders')
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="container auth-page">
        <h1>Create account.</h1>
        <p className="lede">Join SportShop to get first access to new drops and exclusive offers.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--danger)', marginBottom: '10px' }}>{error}</div>}
          <div className="form-row">
            <div className="form-field"><label>First name</label><input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/></div>
            <div className="form-field"><label>Last name</label><input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required/></div>
          </div>
          <div className="form-field"><label>Username</label><input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} required/></div>
          <div className="form-field"><label>Email</label><input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required/></div>
          <div className="form-field"><label>Password</label><input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/></div>
          <div className="form-field"><label>Confirm password</label><input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/></div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </main>
  )
}
