import { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUser = async () => {
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data.user)
    } catch (error) {
      console.error('Error loading user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    localStorage.setItem('token', res.data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password })
    // Don't auto-login after registration - user must login manually
    // Return data including OTP for development mode
    return res.data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  const refreshUser = async () => {
    if (token) {
      await loadUser()
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

