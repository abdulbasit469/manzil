import { useState, useEffect } from 'react'
import api from '../../services/api'
import './Admin.css'

const AdminAssessments = () => {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/api/admin/assessments')
      setAssessments(res.data.assessments)
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (assessment) => {
    setSelectedAssessment(assessment)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedAssessment(null)
  }

  // Calculate statistics
  const totalAssessments = assessments.length
  const averageScore = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
    : 0

  // Career recommendations count
  const careerCounts = {}
  assessments.forEach(assessment => {
    if (assessment.recommendedCareer) {
      careerCounts[assessment.recommendedCareer] = (careerCounts[assessment.recommendedCareer] || 0) + 1
    }
  })

  const topCareers = Object.entries(careerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Assessment Analytics</h1>
        <p>View all career assessments and recommendations</p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">T</div>
          <div className="stat-info">
            <h3>{totalAssessments}</h3>
            <p>Total Assessments</p>
            <span className="stat-detail">Completed by users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">%</div>
          <div className="stat-info">
            <h3>{averageScore}%</h3>
            <p>Average Score</p>
            <span className="stat-detail">Across all assessments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">C</div>
          <div className="stat-info">
            <h3>{Object.keys(careerCounts).length}</h3>
            <p>Career Paths</p>
            <span className="stat-detail">Recommended</span>
          </div>
        </div>
      </div>

      {/* Top Career Recommendations */}
      {topCareers.length > 0 && (
        <div className="admin-section">
          <h2>Top 5 Recommended Careers</h2>
          <div className="activity-card">
            {topCareers.map(([career, count], index) => (
              <div key={career} className="activity-item">
                <span className="activity-icon">{index + 1}</span>
                <div style={{ flex: 1 }}>
                  <p><strong>{career}</strong></p>
                  <span className="activity-time">{count} students recommended</span>
                </div>
                <div style={{
                  padding: '5px 15px',
                  background: '#000',
                  color: 'white',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessments Table */}
      <div className="admin-section">
        <h2>All Assessments</h2>
        <div className="admin-table-container">
          {loading ? (
            <p>Loading assessments...</p>
          ) : assessments.length === 0 ? (
            <p>No assessments found yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Recommended Career</th>
                  <th>Completed On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(assessment => (
                  <tr key={assessment._id}>
                    <td>{assessment.user?.name || 'Unknown'}</td>
                    <td>{assessment.user?.email || 'N/A'}</td>
                    <td>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '5px',
                        background: assessment.score >= 70 ? '#28a745' : assessment.score >= 50 ? '#ffc107' : '#dc3545',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {assessment.score}%
                      </span>
                    </td>
                    <td>{assessment.recommendedCareer || 'N/A'}</td>
                    <td>{new Date(assessment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleViewDetails(assessment)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assessment Details Modal */}
      {showModal && selectedAssessment && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Assessment Details</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Student:</strong> {selectedAssessment.user?.name}</p>
              <p><strong>Email:</strong> {selectedAssessment.user?.email}</p>
              <p><strong>Score:</strong> {selectedAssessment.score}%</p>
              <p><strong>Recommended Career:</strong> {selectedAssessment.recommendedCareer || 'N/A'}</p>
              <p><strong>Completed:</strong> {new Date(selectedAssessment.createdAt).toLocaleString()}</p>
            </div>

            <h3>Answers:</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {selectedAssessment.answers && selectedAssessment.answers.length > 0 ? (
                selectedAssessment.answers.map((answer, index) => (
                  <div key={index} style={{
                    padding: '10px',
                    marginBottom: '10px',
                    background: '#f5f5f5',
                    borderRadius: '5px'
                  }}>
                    <p><strong>Q{index + 1}:</strong> {answer.question}</p>
                    <p><strong>Answer:</strong> {answer.answer}</p>
                  </div>
                ))
              ) : (
                <p>No detailed answers available</p>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAssessments

