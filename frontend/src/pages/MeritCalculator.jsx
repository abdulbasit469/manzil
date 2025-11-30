import { useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import './MeritCalculator.css'

const MeritCalculator = () => {
  const { user } = useContext(AuthContext)
  const [universities, setUniversities] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    universityId: '',
    programId: '',
    matricMarks: '',
    firstYearMarks: '',
    secondYearMarks: '',
    intermediateMarks: '',
    entryTestMarks: ''
  })

  useEffect(() => {
    fetchUniversities()
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (formData.universityId) {
      fetchPrograms(formData.universityId)
    } else {
      setPrograms([])
      setFormData(prev => ({ ...prev, programId: '' }))
    }
  }, [formData.universityId])

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/api/universities')
      setUniversities(res.data.universities || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
    }
  }

  const fetchPrograms = async (universityId) => {
    try {
      setLoading(true)
      setPrograms([]) // Clear programs while loading
      setFormData(prev => ({ ...prev, programId: '' })) // Reset program selection
      
      const res = await api.get(`/api/universities/${universityId}/programs`)
      console.log('Programs API response:', res.data)
      
      // Handle different response formats
      let programsList = []
      if (res.data.programs && Array.isArray(res.data.programs)) {
        programsList = res.data.programs
      } else if (Array.isArray(res.data)) {
        programsList = res.data
      }
      
      console.log('Programs list:', programsList)
      setPrograms(programsList)
    } catch (error) {
      console.error('Error fetching programs:', error)
      console.error('Error response:', error.response?.data)
      setPrograms([])
      setError('Failed to load programs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/api/profile')
      const profile = res.data.profile
      
      // Pre-fill form with user profile data
      setFormData(prev => ({
        ...prev,
        matricMarks: profile.matricMarks || '',
        firstYearMarks: profile.firstYearMarks || '',
        secondYearMarks: profile.secondYearMarks || '',
        intermediateMarks: profile.intermediateMarks || ''
      }))
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setCalculating(true)

    // Validation
    if (!formData.universityId || !formData.programId) {
      setError('Please select university and program')
      setCalculating(false)
      return
    }

    if (!formData.matricMarks) {
      setError('Please enter matric marks')
      setCalculating(false)
      return
    }

    // Check if intermediate marks or separate year marks are provided
    if (!formData.intermediateMarks && (!formData.firstYearMarks || !formData.secondYearMarks)) {
      setError('Please enter either intermediate marks or both 1st and 2nd year marks')
      setCalculating(false)
      return
    }

    try {
      const payload = {
        universityId: formData.universityId,
        programId: formData.programId,
        matricMarks: parseFloat(formData.matricMarks),
        entryTestMarks: formData.entryTestMarks ? parseFloat(formData.entryTestMarks) : null
      }

      // Add intermediate marks or separate year marks
      if (formData.intermediateMarks) {
        payload.intermediateMarks = parseFloat(formData.intermediateMarks)
      } else {
        if (formData.firstYearMarks) {
          payload.firstYearMarks = parseFloat(formData.firstYearMarks)
        }
        if (formData.secondYearMarks) {
          payload.secondYearMarks = parseFloat(formData.secondYearMarks)
        }
      }

      const res = await api.post('/api/merit/calculate', payload)
      setResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate merit')
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(', '))
      }
    } finally {
      setCalculating(false)
    }
  }

  const getProbabilityColor = (probability) => {
    switch (probability) {
      case 'Very High':
        return '#22c55e'
      case 'High':
        return '#3b82f6'
      case 'Moderate':
        return '#f59e0b'
      case 'Low':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="merit-calculator-container">
      <div className="merit-calculator-card">
        <h2>Merit Calculator</h2>
        <p className="subtitle">Calculate your admission merit percentage and check admission probability</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Select University *</label>
              <select
                name="universityId"
                value={formData.universityId}
                onChange={handleChange}
                required
              >
                <option value="">Choose University...</option>
                {universities.map(uni => (
                  <option key={uni._id} value={uni._id}>
                    {uni.name} - {uni.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Program *</label>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                required
                disabled={!formData.universityId || loading}
              >
                <option value="">
                  {loading ? 'Loading programs...' : !formData.universityId ? 'Select university first' : programs.length === 0 ? 'No programs available' : 'Choose Program...'}
                </option>
                {programs.map(prog => (
                  <option key={prog._id} value={prog._id}>
                    {prog.name} ({prog.degree})
                  </option>
                ))}
              </select>
              {formData.universityId && programs.length === 0 && !loading && (
                <small className="form-hint" style={{ color: '#ef4444', display: 'block', marginTop: '4px' }}>
                  No programs found for this university. Please add programs in admin panel.
                </small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Matric Marks (out of 1100) *</label>
              <input
                type="number"
                name="matricMarks"
                value={formData.matricMarks}
                onChange={handleChange}
                min="0"
                max="1100"
                required
                placeholder="Enter matric marks"
              />
            </div>

            <div className="form-group">
              <label>Intermediate Marks (out of 1100)</label>
              <input
                type="number"
                name="intermediateMarks"
                value={formData.intermediateMarks}
                onChange={handleChange}
                min="0"
                max="1100"
                placeholder="Total intermediate marks"
              />
              <small className="form-hint">OR enter 1st and 2nd year separately below</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>1st Year Marks (out of 550)</label>
              <input
                type="number"
                name="firstYearMarks"
                value={formData.firstYearMarks}
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
                value={formData.secondYearMarks}
                onChange={handleChange}
                min="0"
                max="550"
                placeholder="Second year marks"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Entry Test Marks</label>
            <input
              type="number"
              name="entryTestMarks"
              value={formData.entryTestMarks}
              onChange={handleChange}
              min="0"
              placeholder="Enter test marks (if taken)"
            />
            <small className="form-hint">
              {result?.criteria?.entryTestName && `Test: ${result.criteria.entryTestName}`}
            </small>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={calculating}>
            {calculating ? 'Calculating...' : 'Calculate Merit'}
          </button>
        </form>

        {result && (
          <div className="merit-result">
            <div className="result-header">
              <h3>Merit Calculation Result</h3>
            </div>

            <div className="result-content">
              <div className="merit-percentage">
                <div className="percentage-value">{result.meritPercentage}%</div>
                <div className="percentage-label">Your Merit Percentage</div>
              </div>

              {result.admissionProbability && (
                <div 
                  className="admission-probability"
                  style={{ borderColor: getProbabilityColor(result.admissionProbability) }}
                >
                  <div className="probability-label">Admission Probability</div>
                  <div 
                    className="probability-value"
                    style={{ color: getProbabilityColor(result.admissionProbability) }}
                  >
                    {result.admissionProbability}
                  </div>
                  {result.probabilityMessage && (
                    <div className="probability-message">{result.probabilityMessage}</div>
                  )}
                </div>
              )}

              <div className="criteria-info">
                <h4>Calculation Criteria</h4>
                <div className="criteria-details">
                  <div className="criteria-item">
                    <span>University:</span>
                    <strong>{result.criteria.university}</strong>
                  </div>
                  <div className="criteria-item">
                    <span>Program:</span>
                    <strong>{result.criteria.program}</strong>
                  </div>
                  <div className="criteria-item">
                    <span>Entry Test:</span>
                    <strong>{result.criteria.entryTestName || 'Not Required'}</strong>
                  </div>
                  <div className="weights-info">
                    <h5>Merit Weights:</h5>
                    <ul>
                      {result.criteria.weights.matric > 0 && (
                        <li>Matric: {result.criteria.weights.matric}%</li>
                      )}
                      {result.criteria.weights.firstYear > 0 && (
                        <li>1st Year: {result.criteria.weights.firstYear}%</li>
                      )}
                      {result.criteria.weights.secondYear > 0 && (
                        <li>2nd Year: {result.criteria.weights.secondYear}%</li>
                      )}
                      {result.criteria.weights.intermediate > 0 && (
                        <li>Intermediate: {result.criteria.weights.intermediate}%</li>
                      )}
                      {result.criteria.weights.entryTest > 0 && (
                        <li>Entry Test: {result.criteria.weights.entryTest}%</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeritCalculator

