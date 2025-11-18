import { useState, useEffect } from 'react'
import api from '../services/api'
import './Profile.css'

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    intermediateType: '',
    intermediateMarks: '',
    matricMarks: '',
    interests: []
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profile')
      setProfile(res.data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await api.put('/api/profile', profile)
      setSuccess('Profile updated successfully!')
      setProfile(res.data.profile)
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-card">
          <h2>My Profile</h2>
          <p className="subtitle">Complete your profile to get personalized recommendations</p>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  placeholder="03001234567"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={profile.city || ''}
                  onChange={handleChange}
                  placeholder="e.g., Lahore, Karachi"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Intermediate Type</label>
                <select name="intermediateType" value={profile.intermediateType || ''} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="FSc Pre-Engineering">FSc Pre-Engineering</option>
                  <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                  <option value="ICS">ICS</option>
                  <option value="ICOM">ICOM</option>
                  <option value="FA">FA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Intermediate Marks (out of 1100)</label>
                <input
                  type="number"
                  name="intermediateMarks"
                  value={profile.intermediateMarks || ''}
                  onChange={handleChange}
                  min="0"
                  max="1100"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Matric Marks (out of 1100)</label>
              <input
                type="number"
                name="matricMarks"
                value={profile.matricMarks || ''}
                onChange={handleChange}
                min="0"
                max="1100"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile

