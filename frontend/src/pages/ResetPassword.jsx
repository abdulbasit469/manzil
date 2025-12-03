import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './Auth.css'

const ResetPassword = () => {
  const { resetToken } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

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
    setPasswordError('')
    setSuccess('')

    // Validate password format
    if (password.length > 0) {
      const pwdError = validatePassword(password)
      if (pwdError) {
        setPasswordError(pwdError)
        return
      }
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
      const res = await api.put(`/api/auth/reset-password/${resetToken}`, {
        password,
        confirmPassword
      })
      setSuccess(res.data.message || 'Password reset successful')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="subtitle">Enter your new password</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              placeholder="Enter new password"
            />
            {passwordError && <div className="field-error">{passwordError}</div>}
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword




