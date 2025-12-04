import { useState, useEffect } from 'react'
import api from '../services/api'
import './Assessment.css'
import { useNotification } from '../context/NotificationContext'

const Assessment = () => {
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState({})
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { showError } = useNotification()

  useEffect(() => {
    fetchQuestions()
    checkExistingResults()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/api/assessment/questions')
      setQuestions(res.data.questions)
      // Initialize responses
      const initial = {}
      res.data.questions.forEach(q => initial[q.id] = 'Neutral')
      setResponses(initial)
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const checkExistingResults = async () => {
    try {
      const res = await api.get('/api/assessment/results')
      if (res.data.results) {
        setResults(res.data.results)
        setShowResults(true)
      }
    } catch (error) {
      // No previous results
    }
  }

  const handleResponseChange = (questionId, answer) => {
    setResponses({ ...responses, [questionId]: answer })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formattedResponses = Object.keys(responses).map(qId => ({
        questionId: parseInt(qId),
        answer: responses[qId]
      }))

      const res = await api.post('/api/assessment/submit', { responses: formattedResponses })
      setResults(res.data.results)
      setShowResults(true)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      showError('Failed to submit assessment')
    } finally {
      setLoading(false)
    }
  }

  if (showResults && results) {
    return (
      <div className="assessment-container">
        <div className="results-card">
          <h2>Your Career Assessment Results</h2>
          <p className="subtitle">Based on your responses, here are your recommended career paths:</p>

            <div className="careers-list">
              {results.topCareers.map((career, index) => (
                <div key={index} className="career-item">
                  <h3>{index + 1}. {career.career}</h3>
                  <p>{career.description}</p>
                  {career.relatedPrograms && career.relatedPrograms.length > 0 && (
                    <div className="related-programs">
                      <strong>Related Programs:</strong>
                      <ul>
                        {career.relatedPrograms.map((prog, i) => (
                          <li key={i}>{prog}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

          <button 
            className="btn btn-primary" 
            onClick={() => { setShowResults(false); setResults(null); fetchQuestions(); }}
          >
            Retake Assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="assessment-container">
      <div className="assessment-card">
        <h2>Career Aptitude Assessment</h2>
        <p className="subtitle">Answer these questions to discover your ideal career path</p>

          <form onSubmit={handleSubmit}>
            {questions.map((q, index) => (
              <div key={q.id} className="question-block">
                <p className="question-number">Question {index + 1}/{questions.length}</p>
                <p className="question-text">{q.question}</p>
                
                <div className="options">
                  {['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'].map(option => (
                    <label key={option} className="option-label">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={option}
                        checked={responses[q.id] === option}
                        onChange={() => handleResponseChange(q.id, option)}
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Analyzing...' : 'Submit Assessment'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Assessment

