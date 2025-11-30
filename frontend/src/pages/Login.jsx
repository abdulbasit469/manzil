import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // Validate password
  const validatePassword = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd)
    const hasLowerCase = /[a-z]/.test(pwd)
    const hasDigit = /[0-9]/.test(pwd)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)

    if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
      return 'Password should contain at least one uppercase, lowercase, digit and special character'
    }
    return ''
  }

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (value.length > 0) {
      const error = validatePassword(value)
      setPasswordError(error)
    } else {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    // Don't block login based on password format - let backend handle authentication
    // Password validation is only for informational purposes on login page
    // Existing users may have passwords that don't meet new format requirements

    setLoading(true)

    try {
      const data = await login(email, password)
      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const errorData = err.response?.data
      if (errorData?.needsVerification) {
        // User needs to verify email first
        setError(errorData.message)
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: errorData.email } })
        }, 2000)
      } else {
        setError(errorData?.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to Manzil</h2>
        <p className="subtitle">Login to continue your educational journey</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              placeholder="Enter your password"
            />
            {passwordError && <div className="field-error">{passwordError}</div>}
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
          <Link 
            to="/admin-login"
            className="btn btn-secondary btn-block"
            style={{ 
              background: '#6c757d', 
              color: '#fff',
              border: 'none',
              marginTop: '10px',
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Login as Admin
          </Link>
        </div>
        
        <p className="auth-footer">
          <Link to="/forgot-password" style={{ display: 'block', marginBottom: '10px', color: '#000000' }}>
            Forgot your password?
          </Link>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

