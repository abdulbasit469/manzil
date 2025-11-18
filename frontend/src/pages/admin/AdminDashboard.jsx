import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { AuthContext } from '../../context/AuthContext'
import './Admin.css'

const AdminDashboard = () => {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats')
      setStats(res.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="admin-container"><p>Loading...</p></div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">U</div>
          <div className="stat-info">
            <h3>{stats?.users?.total || 0}</h3>
            <p>Total Users</p>
            <span className="stat-detail">
              {stats?.users?.students || 0} Students | {stats?.users?.admins || 0} Admins
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">I</div>
          <div className="stat-info">
            <h3>{stats?.universities || 0}</h3>
            <p>Universities</p>
            <span className="stat-detail">HEC Recognized</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">P</div>
          <div className="stat-info">
            <h3>{stats?.programs || 0}</h3>
            <p>Degree Programs</p>
            <span className="stat-detail">Active Programs</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">A</div>
          <div className="stat-info">
            <h3>{stats?.assessments || 0}</h3>
            <p>Assessments</p>
            <span className="stat-detail">Completed</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/admin/users" className="action-card">
            <h3>Manage Users</h3>
            <p>View, edit, and manage user accounts</p>
          </Link>

          <Link to="/admin/universities" className="action-card">
            <h3>Manage Universities</h3>
            <p>Add, edit, delete universities</p>
          </Link>

          <Link to="/admin/programs" className="action-card">
            <h3>Manage Programs</h3>
            <p>Add, edit degree programs</p>
          </Link>

          <Link to="/admin/assessments" className="action-card">
            <h3>View Analytics</h3>
            <p>Assessment results and trends</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-section">
        <h2>System Overview</h2>
        <div className="activity-card">
          <div className="activity-item">
            <span className="activity-icon">S</span>
            <div>
              <p><strong>Platform Status</strong></p>
              <span className="activity-time">System running smoothly</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">{stats?.users?.total || 0}</span>
            <div>
              <p><strong>Registered Users</strong></p>
              <span className="activity-time">Total platform users</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">{stats?.assessments || 0}</span>
            <div>
              <p><strong>Completed Assessments</strong></p>
              <span className="activity-time">Career tests taken</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

