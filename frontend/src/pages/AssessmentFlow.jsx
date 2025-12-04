import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Briefcase, Sparkles } from 'lucide-react'
import api from '../services/api'
import PersonalityTest from '../components/PersonalityTest'
import AptitudeTest from '../components/AptitudeTest'
import InterestTest from '../components/InterestTest'
import AssessmentResults from '../components/AssessmentResults'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'

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
      // Error will be handled by notification system if needed
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
            <h3>1. Personality Test (RIASEC)</h3>
            <p>{status?.personality ? 'Completed' : 'Not Started'}</p>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
              onClick={() => setCurrentStep('personality')}
            >
              {status?.personality ? 'Retake' : 'Start'}
            </Button>
          </div>

          <div className={`status-item ${status?.aptitude ? 'completed' : ''}`}>
            <h3>2. Aptitude Test</h3>
            <p>{status?.aptitude ? 'Completed' : 'Not Started'}</p>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
              onClick={() => setCurrentStep('aptitude')}
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
              onClick={() => setCurrentStep('interest')}
              disabled={!status?.aptitude}
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
  )
}

export default AssessmentFlow

