import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Briefcase, Sparkles } from 'lucide-react'
import api from '../services/api'
import PersonalityTest from '../components/PersonalityTest'
import InterestTest from '../components/InterestTest'
import AssessmentResults from '../components/AssessmentResults'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNotification } from '../context/NotificationContext'
import { MBTIDetailsModal } from '../components/ui/MBTIDetailsModal'

const AssessmentFlow = () => {
  const [currentStep, setCurrentStep] = useState('status') // status, personality, interest, results
  const [status, setStatus] = useState(null)
  const [mbtiType, setMbtiType] = useState(null)
  const [mbtiDetails, setMbtiDetails] = useState(null)
  const [showMbtiModal, setShowMbtiModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState({
    personality: null,
    interest: null,
    aggregated: null
  })
  const navigate = useNavigate()
  const { showInfo, showError } = useNotification()

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const res = await api.get('/api/assessment/status')
      console.log('Status response:', res.data) // Debug log
      setStatus(res.data.status)
      const mbti = res.data.mbtiType || null
      console.log('Setting MBTI type:', mbti) // Debug log
      setMbtiType(mbti)
      
      // If all tests completed, show results
      if (res.data.status.allCompleted && res.data.hasAggregatedResults) {
        loadResults()
        setCurrentStep('results')
      } else {
        // Keep on status page - user must click Start button
        setCurrentStep('status')
      }
    } catch (error) {
      console.error('Error checking status:', error)
      // Keep on status page - user must click Start button
      setCurrentStep('status')
    }
  }

  const loadResults = async () => {
    try {
      const res = await api.get('/api/assessment/results')
      setTestResults({
        personality: res.data.personality,
        interest: res.data.interest,
        aggregated: res.data.aggregated
      })
    } catch (error) {
      console.error('Error loading results:', error)
    }
  }

  const handlePersonalityComplete = async (results, mbtiTypeFromResponse) => {
    setTestResults(prev => ({ ...prev, personality: results }))
    // Set MBTI type immediately if available from response
    if (mbtiTypeFromResponse) {
      setMbtiType(mbtiTypeFromResponse)
    }
    // Wait a moment for backend to save, then refresh status to get MBTI type
    await new Promise(resolve => setTimeout(resolve, 500))
    await checkStatus()
    // Stay on status page to show result
    setCurrentStep('status')
  }

  const handleInterestComplete = async (results) => {
    setTestResults(prev => ({ ...prev, interest: results }))
    
    // All tests done, wait a moment for backend to process, then load results
    setTimeout(async () => {
      await aggregateAndShowResults()
    }, 1000)
  }

  const aggregateAndShowResults = async () => {
    setLoading(true)
    try {
      // Check status first
      await checkStatus()
      
      // Wait a bit for backend to process aggregation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Load aggregated results
      await loadResults()
      setCurrentStep('results')
    } catch (error) {
      console.error('Error aggregating results:', error)
      // Error will be handled by notification system if needed
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setCurrentStep('personality')
    setTestResults({ personality: null, interest: null, aggregated: null })
    setMbtiType(null)
    checkStatus()
  }

  const handleAptitudeClick = () => {
    showInfo('This feature will be implemented in 8th semester', 5000)
  }

  const handleInterestClick = () => {
    showInfo('This feature will be implemented in 8th semester', 5000)
  }

  if (loading) {
    return (
      <div className="assessment-container">
        <div className="assessment-card">
          <h2>Processing Results...</h2>
          <p>Please wait while we analyze your responses.</p>
        </div>
      </div>
    )
  }

  if (currentStep === 'results') {
    return (
      <AssessmentResults 
        results={testResults.aggregated}
        personality={testResults.personality}
        aptitude={null}
        interest={testResults.interest}
        onRetake={handleRetake}
      />
    )
  }

  if (currentStep === 'personality') {
    return (
      <PersonalityTest 
        onComplete={handlePersonalityComplete}
        onBack={() => setCurrentStep('status')}
      />
    )
  }

  if (currentStep === 'interest') {
    return (
      <InterestTest 
        onComplete={handleInterestComplete}
        onBack={() => setCurrentStep('status')}
      />
    )
  }

  // Status view
  return (
    <>
      <MBTIDetailsModal
        isOpen={showMbtiModal}
        onClose={() => setShowMbtiModal(false)}
        mbtiType={mbtiType}
        details={mbtiDetails}
      />
      <div className="w-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-6 h-6" />
              <p className="text-indigo-100">Career Assessment</p>
            </div>
            <h1 className="text-4xl mb-2 font-bold">Discover Your Career Path</h1>
            <p className="text-indigo-100">
              Complete all 3 tests to get your personalized career recommendations
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-8">
        
        <div className="test-status">
          <div className={`status-item ${status?.personality ? 'completed' : ''}`}>
            <h3>1. Personality Test (MBTI)</h3>
            <p>{status?.personality ? 'Completed' : 'Not Started'}</p>
            {status?.personality && (
              <div style={{ 
                textAlign: 'center', 
                margin: '15px 0',
                padding: '10px 0'
              }}>
                {mbtiType ? (
                  <>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      Your MBTI Type
                    </p>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 'bold', 
                      color: '#533483',
                      letterSpacing: '3px',
                      marginBottom: '15px'
                    }}>
                      {mbtiType}
                    </div>
                  </>
                ) : (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#999', 
                    fontStyle: 'italic'
                  }}>
                    Loading MBTI type...
                  </p>
                )}
                {mbtiType && (
                  <Button 
                    style={{
                      background: loadingDetails ? '#9333ea80' : '#9333ea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loadingDetails ? 'not-allowed' : 'pointer',
                      opacity: loadingDetails ? 0.7 : 1
                    }}
                    disabled={loadingDetails}
                    onClick={async () => {
                      setLoadingDetails(true)
                      try {
                        const res = await api.get(`/api/assessment/personality/mbti/${mbtiType}/details`)
                        if (res.data.success && res.data.details) {
                          setMbtiDetails(res.data.details)
                          setShowMbtiModal(true)
                        } else {
                          showError(res.data.message || 'Failed to load MBTI details')
                        }
                      } catch (error) {
                        console.error('Error fetching MBTI details:', error)
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to load MBTI details. Please try again later.'
                        showError(errorMessage)
                      } finally {
                        setLoadingDetails(false)
                      }
                    }}
                  >
                    {loadingDetails ? 'Loading...' : 'Show Details'}
                  </Button>
                )}
              </div>
            )}
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
              onClick={() => setCurrentStep('personality')}
              style={{ marginTop: mbtiType ? '10px' : '0' }}
            >
              {status?.personality ? 'Retake' : 'Start'}
            </Button>
          </div>

          <div className={`status-item ${status?.aptitude ? 'completed' : ''}`}>
            <h3>2. Aptitude Test</h3>
            <p>{status?.aptitude ? 'Completed' : 'Not Started'}</p>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
              onClick={handleAptitudeClick}
              disabled={!status?.personality}
            >
              {status?.aptitude ? 'Retake' : 'Start'}
            </Button>
          </div>

          <div className={`status-item ${status?.interest ? 'completed' : ''}`}>
            <h3>3. Interest Test</h3>
            <p>{status?.interest ? 'Completed' : 'Not Started'}</p>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
              onClick={handleInterestClick}
              disabled={!status?.personality}
            >
              {status?.interest ? 'Retake' : 'Start'}
            </Button>
          </div>
        </div>

        {status?.allCompleted && (
          <div className="results-ready">
            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
              onClick={() => {
                loadResults()
                setCurrentStep('results')
              }}
            >
              View Results
            </Button>
          </div>
        )}
        </Card>
      </div>
    </div>
    </>
  )
}

export default AssessmentFlow

