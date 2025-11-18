import { useState, useEffect } from 'react'
import api from '../services/api'
import '../pages/Assessment.css'

const AptitudeTest = ({ onComplete, onBack }) => {
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/api/assessment/aptitude/questions')
      setQuestions(res.data.questions)
      const initial = {}
      res.data.questions.forEach(q => initial[q.id] = '')
      setResponses(initial)
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Failed to load questions')
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
      const formattedResponses = Object.keys(responses)
        .filter(qId => responses[qId] !== '')
        .map(qId => ({
          questionId: parseInt(qId),
          answer: responses[qId]
        }))

      const res = await api.post('/api/assessment/aptitude/submit', { 
        responses: formattedResponses 
      })
      
      if (onComplete) {
        onComplete(res.data.results)
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Failed to submit test')
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
          <h2>Aptitude Test</h2>
          <p className="subtitle">Test 2 of 3 - Assess your skills and abilities</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">Question {currentQuestion + 1} of {questions.length}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="question-block">
            <p className="question-number">Question {currentQuestion + 1}/{questions.length}</p>
            <p className="question-text">{question.question}</p>
            <p className="question-category">Category: {question.category}</p>
            
            <div className="options">
              {question.options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.split(')')[0].trim()}
                    checked={responses[question.id] === option.split(')')[0].trim()}
                    onChange={() => handleResponseChange(question.id, option.split(')')[0].trim())}
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
                {loading ? 'Submitting...' : 'Complete Test'}
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

export default AptitudeTest

