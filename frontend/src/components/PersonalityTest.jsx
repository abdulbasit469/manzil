import { useState, useEffect } from 'react'
import api from '../services/api'
import '../pages/Assessment.css'
import { useNotification } from '../context/NotificationContext'

const PersonalityTest = ({ onComplete, onBack }) => {
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const { showError, showSuccess } = useNotification()

  const QUESTIONS_PER_PAGE = 6

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/api/assessment/personality/questions')
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
    const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
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

      const res = await api.post('/api/assessment/personality/submit', { 
        responses: formattedResponses 
      })
      
      showSuccess('MBTI test completed successfully!')
      
      // Navigate back to status page after completion
      if (onComplete) {
        onComplete(res.data.results, res.data.mbtiType)
      }
      
      // Small delay to show success message, then navigate
      setTimeout(() => {
        if (onBack) {
          onBack()
        }
      }, 1500)
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


  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  const startIndex = currentPage * QUESTIONS_PER_PAGE
  const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, questions.length)
  const currentQuestions = questions.slice(startIndex, endIndex)
  const progress = ((currentPage + 1) / totalPages) * 100

  const options = ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']
  const optionValues = [1, 0.75, 0.5, 0.25, 0]

  return (
    <div className="assessment-container">
      <div className="assessment-card">
        <div className="test-header">
          <h2 style={{
            color: '#667eea',
            marginBottom: '15px',
            textAlign: 'center',
            fontSize: '32px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>PERSONALITY TEST (MBTI)</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">Page {currentPage + 1} of {totalPages}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {currentQuestions.map((question, idx) => (
            <div key={question.id} className="question-block" style={{ marginBottom: '25px' }}>
              <p className="question-number">Question {startIndex + idx + 1}/{questions.length}</p>
              <p className="question-text">{question.question}</p>
              
              {/* 5 Circle Visualization - 16Personalities Style */}
              <div className="mbti-options-container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                padding: '15px 0',
                gap: '10px'
              }}>
                {options.map((option, optIdx) => {
                  const isSelected = responses[question.id] === option
                  
                  // Determine circle size and color based on position
                  // Strongly Agree (0) and Strongly Disagree (4) = large
                  // Agree (1) and Disagree (3) = medium
                  // Neutral (2) = small
                  let circleSize, borderColor, fillColor
                  
                  if (optIdx === 0) {
                    // Strongly Agree - Large, Green
                    circleSize = isSelected ? '50px' : '45px'
                    borderColor = '#22c55e' // Green
                    fillColor = isSelected ? '#22c55e' : 'transparent'
                  } else if (optIdx === 1) {
                    // Agree - Medium, Green
                    circleSize = isSelected ? '45px' : '40px'
                    borderColor = '#22c55e' // Green
                    fillColor = isSelected ? '#22c55e' : 'transparent'
                  } else if (optIdx === 2) {
                    // Neutral - Small, Grey
                    circleSize = isSelected ? '35px' : '30px'
                    borderColor = '#9ca3af' // Grey
                    fillColor = isSelected ? '#9ca3af' : 'transparent'
                  } else if (optIdx === 3) {
                    // Disagree - Medium, Purple (App Theme)
                    circleSize = isSelected ? '45px' : '40px'
                    borderColor = '#533483' // App theme purple
                    fillColor = isSelected ? '#533483' : 'transparent'
                  } else {
                    // Strongly Disagree - Large, Purple (App Theme)
                    circleSize = isSelected ? '50px' : '45px'
                    borderColor = '#533483' // App theme purple
                    fillColor = isSelected ? '#533483' : 'transparent'
                  }
                  
                  return (
                    <div
                      key={option}
                      onClick={() => handleResponseChange(question.id, option)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      <div
                        style={{
                          width: circleSize,
                          height: circleSize,
                          borderRadius: '50%',
                          border: `3px solid ${borderColor}`,
                          background: fillColor,
                          transition: 'all 0.3s ease',
                          marginBottom: '8px'
                        }}
                      />
                      <span style={{
                        fontSize: '11px',
                        color: isSelected ? borderColor : '#666',
                        fontWeight: isSelected ? '600' : '400',
                        textAlign: 'center',
                        maxWidth: '60px'
                      }}>
                        {option.split(' ')[0]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="navigation-buttons">
            <button 
              type="button"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              style={{
                flex: 1,
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: currentPage === 0 
                  ? '#f5f5f5' 
                  : 'white',
                color: currentPage === 0 ? '#999' : '#667eea',
                border: `2px solid ${currentPage === 0 ? '#e0e0e0' : '#667eea'}`,
                opacity: currentPage === 0 ? 0.6 : 1,
                fontFamily: 'sans-serif'
              }}
              onMouseEnter={(e) => {
                if (currentPage > 0) {
                  e.target.style.background = '#667eea'
                  e.target.style.color = 'white'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage > 0) {
                  e.target.style.background = 'white'
                  e.target.style.color = '#667eea'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }
              }}
            >
              PREVIOUS STEP
            </button>
            
            {currentPage < totalPages - 1 ? (
            <button 
              type="button"
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)',
                color: 'white',
                border: 'none',
                fontFamily: 'sans-serif',
                boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #7e22ce 0%, #4f46e5 100%)'
                e.target.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.4)'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)'
                e.target.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.3)'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              NEXT STEP
            </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  background: loading 
                    ? 'rgba(147, 51, 234, 0.5)' 
                    : 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)',
                  color: 'white',
                  border: 'none',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'sans-serif',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(147, 51, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #7e22ce 0%, #4f46e5 100%)'
                    e.target.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.4)'
                    e.target.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)'
                    e.target.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.3)'
                    e.target.style.transform = 'translateY(0)'
                  }
                }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default PersonalityTest
