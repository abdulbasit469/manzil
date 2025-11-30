import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/dashboard')
      setDashboard(res.data.dashboard)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name}!</h1>
      <p>Your Career Guidance Dashboard</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Profile Completion</h3>
          <p>Complete your profile to get personalized recommendations</p>
          <div className="progress-bar">
            <div className="progress" style={{width: `${dashboard?.profileCompletion}%`}}></div>
          </div>
          <p className="completion-text">{dashboard?.profileCompletion}% Complete</p>
          <Link to="/profile" className="btn">Complete Profile</Link>
        </div>

        <div className="dashboard-card">
          <h3>Career Assessment</h3>
          <p>{dashboard?.stats.assessmentTaken ? 'Assessment completed successfully' : 'Discover your ideal career path through our assessment'}</p>
          <Link to="/assessment" className="btn">
            {dashboard?.stats.assessmentTaken ? 'View Results' : 'Take Assessment'}
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Universities</h3>
          <p>Explore HEC-recognized universities and find the perfect match for your career goals</p>
          <Link to="/universities" className="btn">Browse Universities</Link>
        </div>

        <div className="dashboard-card">
          <h3>Merit Calculator</h3>
          <p>Calculate your admission merit percentage and check admission probability for universities</p>
          <Link to="/merit-calculator" className="btn">Calculate Merit</Link>
        </div>

        <div className="dashboard-card stats-card">
          <h3>Quick Stats</h3>
          <div className="stat-item">
            <span>Saved Universities</span>
            <strong>{dashboard?.stats.savedUniversities || 0}</strong>
          </div>
          <div className="stat-item">
            <span>Applications</span>
            <strong>{dashboard?.stats.applicationsInProgress || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

