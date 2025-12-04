import { useState, useEffect } from 'react'
import api from '../services/api'
import '../pages/Assessment.css'
import { useNotification } from '../context/NotificationContext'

const InterestTest = ({ onComplete, onBack }) => {
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const { showError } = useNotification()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/api/assessment/interest/questions')
      setQuestions(res.data.questions)
      const initial = {}
      res.data.questions.forEach(q => initial[q.id] = 'Neutral')
      setResponses(initial)
    } catch (error) {
      console.error('Error fetching questions:', error)
      showError('Failed to load questions')
    }
  }

  const handleResponseChange = (questionId, answer) => {
    setResponses({ ...responses, [questionId]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formattedResponses = Object.keys(responses).map(qId => ({
        questionId: parseInt(qId),
        answer: responses[qId]
      }))

      const res = await api.post('/api/assessment/interest/submit', { 
        responses: formattedResponses 
      })
      
      // After submitting interest test, check if all tests are done and aggregate
      try {
        const statusRes = await api.get('/api/assessment/status')
        if (statusRes.data.status.allCompleted) {
          // All tests complete, trigger aggregation
          // The backend should auto-aggregate, but we can also call submit-complete
          // For now, just pass results and let parent handle aggregation
        }
      } catch (statusError) {
        console.error('Error checking status:', statusError)
      }
      
      if (onComplete) {
        onComplete(res.data.results)
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      showError('Failed to submit test')
    } finally {
      setLoading(false)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="assessment-container">
        <div className="assessment-card">
          <p>Loading questions...</p>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="assessment-container">
      <div className="assessment-card">
        <div className="test-header">
          <h2>Interest Test</h2>
          <p className="subtitle">Test 3 of 3 - Explore your career interests</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">Question {currentQuestion + 1} of {questions.length}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="question-block">
            <p className="question-number">Question {currentQuestion + 1}/{questions.length}</p>
            <p className="question-text">{question.question}</p>
            
            <div className="options">
              {['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'].map(option => (
                <label key={option} className="option-label">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={responses[question.id] === option}
                    onChange={() => handleResponseChange(question.id, option)}
                    required
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="navigation-buttons">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Complete All Tests & View Results'}
              </button>
            )}
          </div>
        </form>

        {onBack && (
          <button 
            className="btn btn-secondary btn-block"
            onClick={onBack}
            style={{ marginTop: '20px' }}
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}

export default InterestTest

