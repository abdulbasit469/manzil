import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import PersonalityTest from '../components/PersonalityTest'
import AptitudeTest from '../components/AptitudeTest'
import InterestTest from '../components/InterestTest'
import AssessmentResults from '../components/AssessmentResults'
import './Assessment.css'

const AssessmentFlow = () => {
  const [currentStep, setCurrentStep] = useState('status') // status, personality, aptitude, interest, results
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState({
    personality: null,
    aptitude: null,
    interest: null,
    aggregated: null
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const res = await api.get('/api/assessment/status')
      setStatus(res.data.status)
      
      // If all tests completed, show results
      if (res.data.status.allCompleted && res.data.hasAggregatedResults) {
        loadResults()
        setCurrentStep('results')
      } else {
        // Determine which test to show next
        if (!res.data.status.personality) {
          setCurrentStep('personality')
        } else if (!res.data.status.aptitude) {
          setCurrentStep('aptitude')
        } else if (!res.data.status.interest) {
          setCurrentStep('interest')
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
      // Start with personality test if no status found
      setCurrentStep('personality')
    }
  }

  const loadResults = async () => {
    try {
      const res = await api.get('/api/assessment/results')
      setTestResults({
        personality: res.data.personality,
        aptitude: res.data.aptitude,
        interest: res.data.interest,
        aggregated: res.data.aggregated
      })
    } catch (error) {
      console.error('Error loading results:', error)
    }
  }

  const handlePersonalityComplete = async (results) => {
    setTestResults(prev => ({ ...prev, personality: results }))
    
    // Move to next test
    if (status && !status.aptitude) {
      setCurrentStep('aptitude')
    } else if (status && !status.interest) {
      setCurrentStep('interest')
    } else {
      // All tests done, aggregate and show results
      await aggregateAndShowResults()
    }
  }

  const handleAptitudeComplete = async (results) => {
    setTestResults(prev => ({ ...prev, aptitude: results }))
    
    // Move to next test
    if (status && !status.interest) {
      setCurrentStep('interest')
    } else {
      // All tests done, aggregate and show results
      await aggregateAndShowResults()
    }
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
      alert('Error loading results. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setCurrentStep('personality')
    setTestResults({ personality: null, aptitude: null, interest: null, aggregated: null })
    checkStatus()
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
        aptitude={testResults.aptitude}
        interest={testResults.interest}
        onRetake={handleRetake}
      />
    )
  }

  if (currentStep === 'personality') {
    return (
      <PersonalityTest 
        onComplete={handlePersonalityComplete}
        onBack={() => navigate('/dashboard')}
      />
    )
  }

  if (currentStep === 'aptitude') {
    return (
      <AptitudeTest 
        onComplete={handleAptitudeComplete}
        onBack={() => setCurrentStep('personality')}
      />
    )
  }

  if (currentStep === 'interest') {
    return (
      <InterestTest 
        onComplete={handleInterestComplete}
        onBack={() => setCurrentStep('aptitude')}
      />
    )
  }

  // Status view
  return (
    <div className="assessment-container">
      <div className="assessment-card">
        <h2>Career Assessment</h2>
        <p className="subtitle">Complete all 3 tests to get your personalized career recommendations</p>
        
        <div className="test-status">
          <div className={`status-item ${status?.personality ? 'completed' : ''}`}>
            <h3>1. Personality Test (RIASEC)</h3>
            <p>{status?.personality ? 'Completed' : 'Not Started'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentStep('personality')}
            >
              {status?.personality ? 'Retake' : 'Start'}
            </button>
          </div>

          <div className={`status-item ${status?.aptitude ? 'completed' : ''}`}>
            <h3>2. Aptitude Test</h3>
            <p>{status?.aptitude ? 'Completed' : 'Not Started'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentStep('aptitude')}
              disabled={!status?.personality}
            >
              {status?.aptitude ? 'Retake' : 'Start'}
            </button>
          </div>

          <div className={`status-item ${status?.interest ? 'completed' : ''}`}>
            <h3>3. Interest Test</h3>
            <p>{status?.interest ? 'Completed' : 'Not Started'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentStep('interest')}
              disabled={!status?.aptitude}
            >
              {status?.interest ? 'Retake' : 'Start'}
            </button>
          </div>
        </div>

        {status?.allCompleted && (
          <div className="results-ready">
            <button 
              className="btn btn-primary btn-block"
              onClick={() => {
                loadResults()
                setCurrentStep('results')
              }}
            >
              View Results
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssessmentFlow

