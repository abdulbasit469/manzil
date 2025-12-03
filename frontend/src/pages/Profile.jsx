import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { User, Sparkles } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const { refreshUser } = useContext(AuthContext)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    fatherName: '',
    gender: '',
    dateOfBirth: '',
    profilePicture: '',
    intermediateType: '',
    firstYearMarks: '',
    secondYearMarks: '',
    intermediateMarks: '',
    matricMarks: '',
    matricMajors: '',
    secondYearResultAvailable: false,
    interests: []
  })
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState('')
  const [savingPicture, setSavingPicture] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profile')
      const profileData = res.data.profile
      setProfile(profileData)
      if (profileData.profilePicture) {
        setProfilePicturePreview(profileData.profilePicture)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // Compress image function
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Image compression failed'))
              }
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      try {
        // Compress image before preview
        const compressedFile = await compressImage(file)
        setProfilePictureFile(compressedFile)
        
        // Create preview from compressed image
        const reader = new FileReader()
        reader.onloadend = () => {
          setProfilePicturePreview(reader.result)
        }
        reader.readAsDataURL(compressedFile)
        setError('') // Clear any previous errors
      } catch (err) {
        setError('Failed to process image. Please try again.')
        console.error('Image compression error:', err)
      }
    }
  }

  const handleSaveProfilePicture = async () => {
    if (!profilePictureFile) {
      setError('Please select an image first')
      return
    }

    setError('')
    setSuccess('')
    setSavingPicture(true)

    try {
      // Convert file to base64
      const profilePictureData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(profilePictureFile)
      })

      const res = await api.put('/api/profile', {
        ...profile,
        profilePicture: profilePictureData
      })

      setProfile({ ...profile, profilePicture: profilePictureData })
      setProfilePictureFile(null)
      setSuccess('Profile picture updated successfully!')
      
      // Refresh user data in context to update navbar
      await refreshUser()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile picture')
    } finally {
      setSavingPicture(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // If profile picture is selected, convert to base64
      let profilePictureData = profile.profilePicture
      if (profilePictureFile) {
        const reader = new FileReader()
        reader.onloadend = () => {
          profilePictureData = reader.result
        }
        // Wait for file to be read
        await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            profilePictureData = reader.result
            resolve()
          }
          reader.readAsDataURL(profilePictureFile)
        })
      }

      // Don't include profile picture in main form submit - it has its own save button
      const updateData = {
        ...profile
        // profilePicture is handled separately
      }

      const res = await api.put('/api/profile', updateData)
      setSuccess('Profile updated successfully!')
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const validateField = (name, value) => {
    const errors = { ...fieldErrors }
    
    // Phone number validation (11 digits)
    if (name === 'phone' && value) {
      const phoneRegex = /^[0-9]{11}$/
      if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
        errors.phone = 'Phone number must be exactly 11 digits'
      } else {
        delete errors.phone
      }
    } else if (name === 'phone' && !value) {
      delete errors.phone
    }

    // Marks validation
    const marksFields = {
      matricMarks: { max: 1100, label: 'Matric Marks' },
      intermediateMarks: { max: 1100, label: 'Intermediate Marks' },
      firstYearMarks: { max: 550, label: '1st Year Marks' },
      secondYearMarks: { max: 550, label: '2nd Year Marks' }
    }

    if (marksFields[name] && value) {
      const numValue = parseFloat(value)
      if (isNaN(numValue) || numValue < 0 || numValue > marksFields[name].max) {
        errors[name] = `${marksFields[name].label} must be between 0 and ${marksFields[name].max}`
      } else {
        delete errors[name]
      }
    } else if (marksFields[name] && !value) {
      delete errors[name]
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Update profile first
    setProfile({ 
      ...profile, 
      [name]: type === 'checkbox' ? checked : value 
    })
    
    // Validate after update
    if (type !== 'checkbox' && value) {
      validateField(name, value)
    } else if (type !== 'checkbox' && !value) {
      // Clear error if field is empty
      const errors = { ...fieldErrors }
      delete errors[name]
      setFieldErrors(errors)
    }
  }

  return (
    <div className="w-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <User className="w-5 h-5 md:w-6 md:h-6" />
              <p className="text-sm md:text-base text-indigo-100">My Profile</p>
            </div>
            <h1 className="text-2xl md:text-4xl mb-2 font-bold">Complete Your Profile</h1>
            <p className="text-xs md:text-base text-indigo-100">
              Get personalized recommendations based on your profile
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Card className="p-4 md:p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-600" />
                Personal Information
              </h3>
              
              {/* Profile Picture */}
              <div className="form-group profile-picture-group">
                <div className="profile-picture-wrapper">
                  <div className="profile-picture-right-section">
                    <label>Profile Picture</label>
                    <div className="profile-picture-container">
                      <div className="profile-picture-actions">
                        <div className="profile-picture-preview">
                          {profilePicturePreview ? (
                            <img src={profilePicturePreview} alt="Profile" />
                          ) : (
                            <div className="profile-picture-placeholder">
                              <span>No Image</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          id="profilePicture"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="profile-picture-input"
                        />
                        <label htmlFor="profilePicture" className="profile-picture-label">
                          Choose Image
                        </label>
                        {profilePictureFile && (
                          <button
                            type="button"
                            onClick={handleSaveProfilePicture}
                            disabled={savingPicture}
                            className="profile-picture-save-btn"
                          >
                            {savingPicture ? 'Saving...' : 'Save Picture'}
                          </button>
                        )}
                        <p className="profile-picture-hint">Max size: 5MB (JPG, PNG, GIF)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="profile-picture-left-section">
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

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={profile.phone || ''}
                        onChange={handleChange}
                        placeholder="03001234567"
                        maxLength="11"
                        pattern="[0-9]{11}"
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
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
                  <label>Gender</label>
                  <select name="gender" value={profile.gender || ''} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                Education
              </h3>

              {/* Matric Section */}
              <div className="education-subsection">
                <h4 className="subsection-title">Matriculation</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Majors in Matric</label>
                    <select name="matricMajors" value={profile.matricMajors || ''} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option value="Science">Science</option>
                      <option value="Arts">Arts</option>
                      <option value="Commerce">Commerce</option>
                      <option value="General">General</option>
                    </select>
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
                    {fieldErrors.matricMarks && (
                      <p className="text-red-600 text-sm mt-1">{fieldErrors.matricMarks}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Intermediate Section */}
              <div className="education-subsection">
                <h4 className="subsection-title">Intermediate</h4>
                
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
                    {fieldErrors.intermediateMarks && (
                      <p className="text-red-600 text-sm mt-1">{fieldErrors.intermediateMarks}</p>
                    )}
                  </div>
                </div>

                <div className="form-group checkbox-inline">
                  <label className="flex items-center gap-2 cursor-pointer" style={{ marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      name="secondYearResultAvailable"
                      checked={profile.secondYearResultAvailable || false}
                      onChange={handleChange}
                      className="w-5 h-5 cursor-pointer accent-indigo-600"
                    />
                    <span className="text-slate-700 font-medium">2nd year result available?</span>
                  </label>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all" 
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Profile
