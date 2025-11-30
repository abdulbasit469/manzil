import { useState, useEffect } from 'react'
import api from '../services/api'
import './Profile.css'

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    fatherName: '',
    gender: '',
    dateOfBirth: '',
    currentStatus: '',
    intermediateType: '',
    firstYearMarks: '',
    secondYearMarks: '',
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
                <label>Father Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={profile.fatherName || ''}
                  onChange={handleChange}
                  placeholder="Enter father's name"
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={profile.gender || ''} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Current Status</label>
                <select name="currentStatus" value={profile.currentStatus || ''} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="FSc Pre-Engineering">FSc Pre-Engineering</option>
                  <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                  <option value="ICS">ICS</option>
                  <option value="ICOM">ICOM</option>
                  <option value="FA">FA</option>
                  <option value="A-Levels">A-Levels</option>
                  <option value="Other">Other</option>
                </select>
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
                  placeholder="Total intermediate marks"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>1st Year Marks (out of 550)</label>
                <input
                  type="number"
                  name="firstYearMarks"
                  value={profile.firstYearMarks || ''}
                  onChange={handleChange}
                  min="0"
                  max="550"
                  placeholder="First year marks"
                />
              </div>

              <div className="form-group">
                <label>2nd Year Marks (out of 550)</label>
                <input
                  type="number"
                  name="secondYearMarks"
                  value={profile.secondYearMarks || ''}
                  onChange={handleChange}
                  min="0"
                  max="550"
                  placeholder="Second year marks (if result announced)"
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
                placeholder="Matriculation marks"
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

