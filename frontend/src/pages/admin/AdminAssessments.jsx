import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { BarChart3 } from 'lucide-react'
import api from '../../services/api'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

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
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
              <p className="text-sm md:text-base text-indigo-100">Assessment Analytics</p>
            </div>
            <h1 className="text-2xl md:text-4xl mb-2 font-bold">View Analytics</h1>
            <p className="text-xs md:text-base text-indigo-100">
              View all career assessments and recommendations
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-indigo-200 bg-indigo-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{totalAssessments}</h3>
                  <p className="text-sm text-slate-600">Total Assessments</p>
                  <p className="text-xs text-slate-500 mt-1">Completed by users</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-xl">%</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{averageScore}%</h3>
                  <p className="text-sm text-slate-600">Average Score</p>
                  <p className="text-xs text-slate-500 mt-1">Across all assessments</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-green-200 bg-green-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{Object.keys(careerCounts).length}</h3>
                  <p className="text-sm text-slate-600">Career Paths</p>
                  <p className="text-xs text-slate-500 mt-1">Recommended</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Top Career Recommendations */}
        {topCareers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Top 5 Recommended Careers</h2>
            <Card className="p-6">
              <div className="space-y-4">
                {topCareers.map(([career, count], index) => (
                  <div key={career} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{career}</p>
                      <p className="text-sm text-slate-600">{count} students recommended</p>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold shadow-md">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Assessments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">All Assessments</h2>
          <Card className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-600">Loading assessments...</div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No assessments found yet</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Recommended Career</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Completed On</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(assessment => (
                  <tr key={assessment._id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{assessment.user?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{assessment.user?.email || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        assessment.score >= 70 
                          ? 'bg-green-100 text-green-700' 
                          : assessment.score >= 50 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {assessment.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{assessment.recommendedCareer || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{new Date(assessment.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(assessment)}
                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          </Card>
        </motion.div>
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

