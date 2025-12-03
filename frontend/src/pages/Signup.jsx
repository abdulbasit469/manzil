import { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import './Auth.css'

const Signup = () => {
  useEffect(() => {
    document.body.classList.add('auth-page')
    document.documentElement.classList.add('auth-page')
    return () => {
      document.body.classList.remove('auth-page')
      document.documentElement.classList.remove('auth-page')
    }
  }, [])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useContext(AuthContext)
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

  // Handle name change - prevent numbers
  const handleNameChange = (e) => {
    const value = e.target.value
    // Remove any numbers from the input
    const nameWithoutNumbers = value.replace(/[0-9]/g, '')
    setName(nameWithoutNumbers)
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
    setPasswordError('')

    // Validate name (no numbers)
    if (/\d/.test(name)) {
      setError('Name cannot contain numbers')
      return
    }

    // Validate password
    const pwdError = validatePassword(password)
    if (pwdError) {
      setPasswordError(pwdError)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await register(name, email, password)
      // Redirect to OTP verification page
      // If in development mode, pass OTP to VerifyOTP page
      navigate('/verify-otp', { 
        state: { 
          email,
          otp: res?.otp || null
        } 
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join Manzil</h2>
        <p className="subtitle">Start your career guidance journey today</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          
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
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Enter password (uppercase, lowercase, digit, special)"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && <div className="field-error">{passwordError}</div>}
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
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
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup

