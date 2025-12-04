import { useState, useEffect, useContext } from 'react'
import { motion } from 'motion/react'
import { Calculator, Sparkles } from 'lucide-react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'

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
    matricTotalMarks: '',
    matricObtainedMarks: '',
    intermediateTotalMarks: '',
    intermediateObtainedMarks: '',
    entryTestType: '', // 'ECAT', 'NAT', 'NET', 'SAT'
    entryTestTotalMarks: '',
    entryTestObtainedMarks: ''
  })
  const [fieldErrors, setFieldErrors] = useState({})
  
  const entryTestTypes = {
    ECAT: 400,
    NAT: 100,
    NET: 200,
    SAT: 1600
  }

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
        matricTotalMarks: profile.matricTotalMarks || '',
        matricObtainedMarks: profile.matricObtainedMarks || '',
        intermediateTotalMarks: profile.intermediateTotalMarks || '',
        intermediateObtainedMarks: profile.intermediateObtainedMarks || ''
      }))
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleMarksChange = (e) => {
    const { name, value } = e.target
    
    // Update state first
    const updatedFormData = {
      ...formData,
      [name]: value
    }
    setFormData(updatedFormData)
    setError('')
    setResult(null)
    
    // Then validate immediately
    const errors = { ...fieldErrors }
    
    // Validate matric marks - check if obtained exceeds total
    if (name === 'matricObtainedMarks' || name === 'matricTotalMarks') {
      const total = updatedFormData.matricTotalMarks ? parseFloat(updatedFormData.matricTotalMarks) : 0
      const obtained = updatedFormData.matricObtainedMarks ? parseFloat(updatedFormData.matricObtainedMarks) : 0
      
      if (updatedFormData.matricTotalMarks && updatedFormData.matricObtainedMarks) {
        if (!isNaN(total) && !isNaN(obtained) && total > 0 && obtained > total) {
          errors.matricObtainedMarks = 'Obtained marks cannot exceed total marks'
        } else {
          delete errors.matricObtainedMarks
        }
      } else {
        delete errors.matricObtainedMarks
      }
    }
    
    // Validate intermediate marks - check if obtained exceeds total
    if (name === 'intermediateObtainedMarks' || name === 'intermediateTotalMarks') {
      const total = updatedFormData.intermediateTotalMarks ? parseFloat(updatedFormData.intermediateTotalMarks) : 0
      const obtained = updatedFormData.intermediateObtainedMarks ? parseFloat(updatedFormData.intermediateObtainedMarks) : 0
      
      if (updatedFormData.intermediateTotalMarks && updatedFormData.intermediateObtainedMarks) {
        if (!isNaN(total) && !isNaN(obtained) && total > 0 && obtained > total) {
          errors.intermediateObtainedMarks = 'Obtained marks cannot exceed total marks'
        } else {
          delete errors.intermediateObtainedMarks
        }
      } else {
        delete errors.intermediateObtainedMarks
      }
    }

    // Update errors
    setFieldErrors(errors)
  }

  const handleEntryTestCheckbox = (testType) => {
    if (formData.entryTestType === testType) {
      // Uncheck - clear entry test data
      setFormData(prev => ({
        ...prev,
        entryTestType: '',
        entryTestTotalMarks: '',
        entryTestObtainedMarks: ''
      }))
    } else {
      // Check - set entry test type and total marks
      setFormData(prev => ({
        ...prev,
        entryTestType: testType,
        entryTestTotalMarks: entryTestTypes[testType].toString(),
        entryTestObtainedMarks: ''
      }))
    }
    setError('')
    setResult(null)
    // Clear entry test errors
    const errors = { ...fieldErrors }
    delete errors.entryTestObtainedMarks
    setFieldErrors(errors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Create updated form data immediately
    const updatedFormData = {
      ...formData,
      [name]: value
    }
    
    setError('')
    setResult(null)

    // Validate entry test obtained marks if entry test is selected
    if (name === 'entryTestObtainedMarks' && formData.entryTestType) {
      const errors = { ...fieldErrors }
      const total = parseFloat(formData.entryTestTotalMarks)
      const obtained = parseFloat(value)
      
      if (value && !isNaN(total) && !isNaN(obtained) && obtained > total) {
        errors.entryTestObtainedMarks = 'Obtained marks cannot exceed total marks'
      } else {
        delete errors.entryTestObtainedMarks
      }
      setFieldErrors(errors)
    }
    
    // Update form data state
    setFormData(updatedFormData)
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

    if (!formData.matricTotalMarks || !formData.matricObtainedMarks) {
      setError('Please enter matric total and obtained marks')
      setCalculating(false)
      return
    }

    if (!formData.intermediateTotalMarks || !formData.intermediateObtainedMarks) {
      setError('Please enter intermediate total and obtained marks')
      setCalculating(false)
      return
    }

    // Check for field errors
    if (Object.keys(fieldErrors).length > 0) {
      setError('Please fix the errors before submitting')
      setCalculating(false)
      return
    }

    // Validate obtained marks don't exceed total marks
    const matricObtained = parseFloat(formData.matricObtainedMarks)
    const matricTotal = parseFloat(formData.matricTotalMarks)
    if (matricObtained > matricTotal) {
      setError('Matric obtained marks cannot exceed total marks')
      setCalculating(false)
      return
    }

    const intermediateObtained = parseFloat(formData.intermediateObtainedMarks)
    const intermediateTotal = parseFloat(formData.intermediateTotalMarks)
    if (intermediateObtained > intermediateTotal) {
      setError('Intermediate obtained marks cannot exceed total marks')
      setCalculating(false)
      return
    }

    // Validate entry test if selected
    let entryTestMarks = null
    if (formData.entryTestType && formData.entryTestObtainedMarks) {
      const entryTestObtained = parseFloat(formData.entryTestObtainedMarks)
      const entryTestTotal = parseFloat(formData.entryTestTotalMarks)
      if (entryTestObtained > entryTestTotal) {
        setError('Entry test obtained marks cannot exceed total marks')
        setCalculating(false)
        return
      }
      // Calculate percentage (out of 100) for entry test
      entryTestMarks = (entryTestObtained / entryTestTotal) * 100
    }

    try {
      // Calculate percentage marks (out of 1100) for backward compatibility with backend
      const matricPercentage = (matricObtained / matricTotal) * 1100
      const intermediatePercentage = (intermediateObtained / intermediateTotal) * 1100

      const payload = {
        universityId: formData.universityId,
        programId: formData.programId,
        matricMarks: matricPercentage,
        intermediateMarks: intermediatePercentage,
        entryTestMarks: entryTestMarks
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
              <Calculator className="w-5 h-5 md:w-6 md:h-6" />
              <p className="text-sm md:text-base text-indigo-100">Merit Calculator</p>
            </div>
            <h1 className="text-2xl md:text-4xl mb-2 font-bold">Calculate Your Merit</h1>
            <p className="text-xs md:text-base text-indigo-100">
              Calculate your admission merit percentage and check admission probability
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Card className="p-4 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

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
              <label>Matric Total Marks *</label>
              <input
                type="number"
                name="matricTotalMarks"
                value={formData.matricTotalMarks}
                onChange={handleMarksChange}
                onInput={handleMarksChange}
                min="1"
                required
                placeholder="Enter total marks"
              />
              {fieldErrors.matricTotalMarks && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.matricTotalMarks}</p>
              )}
            </div>

            <div className="form-group">
              <label>Matric Obtained Marks *</label>
              <input
                type="number"
                name="matricObtainedMarks"
                value={formData.matricObtainedMarks}
                onChange={handleMarksChange}
                onInput={handleMarksChange}
                min="0"
                required
                placeholder="Enter obtained marks"
              />
              {fieldErrors.matricObtainedMarks && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.matricObtainedMarks}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Intermediate Total Marks *</label>
              <input
                type="number"
                name="intermediateTotalMarks"
                value={formData.intermediateTotalMarks}
                onChange={handleMarksChange}
                onInput={handleMarksChange}
                min="1"
                required
                placeholder="Enter total marks"
              />
              {fieldErrors.intermediateTotalMarks && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.intermediateTotalMarks}</p>
              )}
            </div>

            <div className="form-group">
              <label>Intermediate Obtained Marks *</label>
              <input
                type="number"
                name="intermediateObtainedMarks"
                value={formData.intermediateObtainedMarks}
                onChange={handleMarksChange}
                onInput={handleMarksChange}
                min="0"
                required
                placeholder="Enter obtained marks"
              />
              {fieldErrors.intermediateObtainedMarks && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.intermediateObtainedMarks}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Entry Test</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4">
                {Object.keys(entryTestTypes).map(testType => (
                  <label key={testType} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.entryTestType === testType}
                      onChange={() => handleEntryTestCheckbox(testType)}
                      className="w-5 h-5 cursor-pointer accent-indigo-600"
                    />
                    <span className="text-slate-700 font-medium">{testType}</span>
                  </label>
                ))}
              </div>
              
              {formData.entryTestType && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Total Marks</label>
                      <input
                        type="number"
                        name="entryTestTotalMarks"
                        value={formData.entryTestTotalMarks}
                        onChange={handleChange}
                        disabled
                        className="bg-slate-100"
                      />
                    </div>
                    <div className="form-group">
                      <label>Obtained Marks *</label>
                      <input
                        type="number"
                        name="entryTestObtainedMarks"
                        value={formData.entryTestObtainedMarks}
                        onChange={handleChange}
                        min="0"
                        max={formData.entryTestTotalMarks}
                        placeholder="Enter obtained marks"
                        required
                      />
                      {fieldErrors.entryTestObtainedMarks && (
                        <p className="text-red-600 text-sm mt-1">{fieldErrors.entryTestObtainedMarks}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <small className="form-hint">
              {result?.criteria?.entryTestName && `Test: ${result.criteria.entryTestName}`}
            </small>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all" 
            disabled={calculating}
          >
            {calculating ? 'Calculating...' : 'Calculate Merit'}
          </Button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Merit Calculation Result</h3>

            <div className="space-y-6">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-5xl font-bold text-indigo-600 mb-2">{result.meritPercentage}%</div>
                <div className="text-lg text-slate-600">Your Merit Percentage</div>
              </div>

              {result.admissionProbability && (
                <div 
                  className="p-6 bg-white rounded-lg shadow-md border-2"
                  style={{ borderColor: getProbabilityColor(result.admissionProbability) }}
                >
                  <div className="text-sm text-slate-600 mb-2">Admission Probability</div>
                  <div 
                    className="text-3xl font-bold mb-2"
                    style={{ color: getProbabilityColor(result.admissionProbability) }}
                  >
                    {result.admissionProbability}
                  </div>
                  {result.probabilityMessage && (
                    <div className="text-sm text-slate-600">{result.probabilityMessage}</div>
                  )}
                </div>
              )}

              <div className="p-6 bg-white rounded-lg shadow-md">
                <h4 className="text-xl font-semibold text-slate-900 mb-4">Calculation Criteria</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">University:</span>
                    <strong className="text-slate-900">{result.criteria.university}</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Program:</span>
                    <strong className="text-slate-900">{result.criteria.program}</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Entry Test:</span>
                    <strong className="text-slate-900">{result.criteria.entryTestName || 'Not Required'}</strong>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-300">
                    <h5 className="font-semibold text-slate-900 mb-3">Merit Weights:</h5>
                    <ul className="space-y-2">
                      {result.criteria.weights.matric > 0 && (
                        <li className="flex justify-between">
                          <span className="text-slate-600">Matric:</span>
                          <strong className="text-slate-900">{result.criteria.weights.matric}%</strong>
                        </li>
                      )}
                      {result.criteria.weights.firstYear > 0 && (
                        <li className="flex justify-between">
                          <span className="text-slate-600">1st Year:</span>
                          <strong className="text-slate-900">{result.criteria.weights.firstYear}%</strong>
                        </li>
                      )}
                      {result.criteria.weights.secondYear > 0 && (
                        <li className="flex justify-between">
                          <span className="text-slate-600">2nd Year:</span>
                          <strong className="text-slate-900">{result.criteria.weights.secondYear}%</strong>
                        </li>
                      )}
                      {result.criteria.weights.intermediate > 0 && (
                        <li className="flex justify-between">
                          <span className="text-slate-600">Intermediate:</span>
                          <strong className="text-slate-900">{result.criteria.weights.intermediate}%</strong>
                        </li>
                      )}
                      {result.criteria.weights.entryTest > 0 && (
                        <li className="flex justify-between">
                          <span className="text-slate-600">Entry Test:</span>
                          <strong className="text-slate-900">{result.criteria.weights.entryTest}%</strong>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </Card>
      </div>
    </div>
  )
}

export default MeritCalculator

