import { useState, useEffect } from 'react'
import api from '../services/api'
import '../pages/Assessment.css'

const AssessmentResults = ({ results, personality, aptitude, interest, onRetake }) => {
  const [aggregatedResults, setAggregatedResults] = useState(results)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!aggregatedResults) {
      loadResults()
    }
  }, [])

  const loadResults = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/assessment/results')
      setAggregatedResults(res.data.aggregated || res.data.results)
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="assessment-container">
        <div className="assessment-card">
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  if (!aggregatedResults) {
    return (
      <div className="assessment-container">
        <div className="assessment-card">
          <p>No results found. Please complete all tests.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="assessment-container">
      <div className="results-card">
        <h2>Your Career Assessment Results</h2>
        <p className="subtitle">Based on your Personality (30%), Aptitude (40%), and Interest (30%) tests</p>

        {aggregatedResults.ruleBasedEnhancements && aggregatedResults.ruleBasedEnhancements.length > 0 && (
          <div className="enhancements">
            <h3>Special Insights:</h3>
            <ul>
              {aggregatedResults.ruleBasedEnhancements.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="careers-list">
          <h3>Top Career Recommendations:</h3>
          {aggregatedResults.topCareers && aggregatedResults.topCareers.length > 0 ? (
            aggregatedResults.topCareers.map((career, index) => (
              <div key={index} className="career-item">
                <div className="career-header">
                  <h3>{index + 1}. {career.career}</h3>
                  <span className="career-score">Score: {career.score}</span>
                </div>
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
            ))
          ) : (
            <p>No career recommendations available.</p>
          )}
        </div>

        {/* Test Breakdown */}
        <div className="test-breakdown">
          <h3>Test Breakdown:</h3>
          <div className="breakdown-grid">
            {personality && (
              <div className="breakdown-item">
                <h4>Personality Test</h4>
                <p>Weight: 30%</p>
                {personality.normalizedScores && (
                  <div className="scores">
                    {Object.entries(personality.normalizedScores).slice(0, 3).map(([type, score]) => (
                      <p key={type}>{type}: {score}%</p>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {aptitude && (
              <div className="breakdown-item">
                <h4>Aptitude Test</h4>
                <p>Weight: 40%</p>
                <p>Total Score: {aptitude.totalCorrect}/{aptitude.totalQuestions}</p>
                {aptitude.normalizedSectionScores && (
                  <div className="scores">
                    {Object.entries(aptitude.normalizedSectionScores).map(([section, score]) => (
                      <p key={section}>{section}: {score}%</p>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {interest && (
              <div className="breakdown-item">
                <h4>Interest Test</h4>
                <p>Weight: 30%</p>
                {interest.normalizedScores && (
                  <div className="scores">
                    {Object.entries(interest.normalizedScores).slice(0, 3).map(([category, score]) => (
                      <p key={category}>{category}: {score}%</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="results-actions">
          <button 
            className="btn btn-primary"
            onClick={onRetake}
          >
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssessmentResults

