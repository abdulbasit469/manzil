import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import './Auth.css'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)
      // Check if user is admin
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        setError('This account is not an admin account. Please use regular login.')
      }
    } catch (err) {
      const errorData = err.response?.data
      if (errorData?.needsVerification) {
        setError('Please verify your email first. Check your inbox for OTP.')
      } else {
        setError(errorData?.message || 'Admin login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Admin Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter admin email"
            />
          </div>
          
          <div className="form-group">
            <label>Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin Dashboard'}
          </button>
        </form>
        
        <p className="auth-footer">
          <Link to="/login" style={{ display: 'block', marginBottom: '10px', color: '#000000' }}>
            Back to Regular Login
          </Link>
          <Link to="/forgot-password" style={{ display: 'block', marginBottom: '10px', color: '#000000' }}>
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AdminLogin

