import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import './Auth.css'

const VerifyOTP = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [devOTP, setDevOTP] = useState(location.state?.otp || '')

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
      
      // If in development mode, show OTP
      if (res.data.developmentMode && res.data.otp) {
        setDevOTP(res.data.otp)
        setSuccess(
          <div>
            <p style={{ marginBottom: '10px' }}>⚠️ Email service not configured (Development Mode)</p>
            <p style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>Your OTP: <span style={{ color: '#000', letterSpacing: '3px' }}>{res.data.otp}</span></p>
            <p style={{ fontSize: '12px', color: '#666' }}>Check server console for more details</p>
          </div>
        )
      } else {
        setSuccess(res.data.message)
      }
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
        
        {devOTP && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#856404' }}>
              ⚠️ Development Mode - Email service not configured
            </p>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', letterSpacing: '5px', color: '#000' }}>
              Your OTP: {devOTP}
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
              Check server console for more details
            </p>
          </div>
        )}
        
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










