import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

function getCsrfToken() {
  const name = 'csrftoken='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const res = await originalFetch(...args)
      if (res.status === 401 || res.status === 403) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '')
        if (url.includes('/api/') && !url.includes('/login') && !url.includes('/register') && !url.includes('/logout')) {
          setUser(null)
        }
      }
      return res
    }

    checkAuth()

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/users/profile/')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error(err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const res = await fetch('/api/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      },
      body: JSON.stringify({ username, password })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }
    
    const userData = await res.json()
    setUser(userData)
    return userData
  }

  const register = async (username, email, password, firstName, lastName) => {
    const res = await fetch('/api/users/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      },
      body: JSON.stringify({ 
        username, 
        email, 
        password,
        first_name: firstName,
        last_name: lastName
      })
    })

    if (!res.ok) {
      const data = await res.json()
      // Make errors readable
      const errorMsg = Object.values(data).flat().join(', ') || 'Registration failed'
      throw new Error(errorMsg)
    }

    // Auto login after registration
    await login(username, password)
  }

  const logout = async () => {
    try {
      await fetch('/api/users/logout/', { 
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() }
      })
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
