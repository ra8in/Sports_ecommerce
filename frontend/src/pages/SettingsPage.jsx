import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // 'view' | 'edit_profile' | 'change_password'
  const [mode, setMode] = useState('view')
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setFirstName(user.first_name || '')
    setLastName(user.last_name || '')
    setUsername(user.username || '')
    setEmail(user.email || '')
    if (user.profile) {
      setPhone(user.profile.phone || '')
      setAddress(user.profile.address || '')
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    const payload = {
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      phone,
      address
    }
    
    try {
      const res = await fetch('/api/users/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      
      setSuccess('Profile updated successfully!')
      window.setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setError(err.message || 'Error communicating with server')
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!oldPassword) return setError("You must provide your current password.")
    if (password !== confirmPassword) return setError("New passwords don't match.")
    if (password.length < 8) return setError("Password must be at least 8 characters.")

    setLoading(true)
    
    const payload = {
      old_password: oldPassword,
      password: password
    }

    try {
      const res = await fetch('/api/users/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')
      
      setSuccess('Password changed successfully!')
      setOldPassword('')
      setPassword('')
      setConfirmPassword('')
      
      window.setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setError(err.message || 'Error communicating with server')
      setLoading(false)
    }
  }

  const goBack = () => {
    setError('')
    setSuccess('')
    setMode('view')
  }

  return (
    <main>
      <div className="container auth-page" style={{ maxWidth: '500px' }}>
        
        {/* VIEW MODE */}
        {mode === 'view' && (
          <>
            <h1 style={{ marginBottom: '24px' }}>My Profile.</h1>
            {success && <div style={{ color: 'var(--moss)', marginBottom: '16px', background: 'var(--moss-tint)', padding: '12px', borderRadius: '4px' }}>{success}</div>}
            
            <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', marginBottom: '24px' }}>
              
              <div style={{ marginBottom: '20px' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Name</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{user?.first_name} {user?.last_name}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Username</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>@{user?.username}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Email Address</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{user?.email}</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Phone Number</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{user?.profile?.phone || 'Not set'}</div>
              </div>

              <div style={{ marginBottom: '0' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Pickup Location</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{user?.profile?.address || 'Not set'}</div>
              </div>
              
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-primary btn-block" onClick={() => setMode('edit_profile')}>
                Edit Profile Details
              </button>
              <button className="btn btn-block" style={{ border: '1px solid var(--line-strong)' }} onClick={() => setMode('change_password')}>
                Change Password
              </button>
            </div>
          </>
        )}

        {/* EDIT PROFILE MODE */}
        {mode === 'edit_profile' && (
          <>
            <h1>Edit Details.</h1>
            <p className="lede">Update your personal information below.</p>
            
            <form className="auth-form" onSubmit={handleProfileSubmit}>
              {error && <div style={{ color: 'var(--danger)', marginBottom: '10px' }}>{error}</div>}
              
              <div className="form-row">
                <div className="form-field">
                  <label>First name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                </div>
                <div className="form-field">
                  <label>Last name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
                </div>
              </div>
              
              <div className="form-field">
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required/>
              </div>
              
              <div className="form-field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
              </div>

              <div className="form-field">
                <label>Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 98XXXXXXXX" />
              </div>

              <div className="form-field">
                <label>Pickup Location</label>
                <textarea rows="3" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address for order pickups" style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--line-strong)', background: 'transparent' }}></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-block" style={{ border: '1px solid var(--line-strong)', flex: 1 }} onClick={goBack}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Saving…' : 'Save Details'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* CHANGE PASSWORD MODE */}
        {mode === 'change_password' && (
          <>
            <h1>Change Password.</h1>
            <p className="lede">Choose a strong new password for your account.</p>
            
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              {error && <div style={{ color: 'var(--danger)', marginBottom: '10px' }}>{error}</div>}
              
              <div className="form-field">
                <label>Current Password</label>
                <input type="password" placeholder="••••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
              </div>

              <div className="form-field">
                <label>New Password</label>
                <input type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
              
              <div className="form-field">
                <label>Confirm New Password</label>
                <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8}/>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-block" style={{ border: '1px solid var(--line-strong)', flex: 1 }} onClick={goBack}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </main>
  )
}
