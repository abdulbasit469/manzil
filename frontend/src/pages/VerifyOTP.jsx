import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import './Auth.css'

const VerifyOTP = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  if (!email) {
    navigate('/signup')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp })
      setSuccess(res.data.message)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    setResending(true)

    try {
      const res = await api.post('/api/auth/resend-otp', { email })
      setSuccess(res.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p className="subtitle">
          We've sent a 6-digit OTP to<br />
          <strong>{email}</strong>
        </p>
        <p className="subtitle" style={{fontSize: '12px', color: '#999'}}>
          Check your terminal/console for OTP (development mode)
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="000000"
              maxLength="6"
              style={{
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '10px',
                fontWeight: 'bold'
              }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        
        <p className="auth-footer">
          Didn't receive OTP? 
          <button 
            onClick={handleResend} 
            disabled={resending}
            style={{
              background: 'none',
              border: 'none',
              color: '#000',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginLeft: '5px'
            }}
          >
            {resending ? 'Sending...' : 'Resend'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default VerifyOTP






