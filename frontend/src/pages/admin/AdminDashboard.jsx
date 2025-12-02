import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { LayoutDashboard, Sparkles } from 'lucide-react'
import api from '../../services/api'
import { AuthContext } from '../../context/AuthContext'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

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
    return (
      <div className="w-full bg-slate-50 flex items-center justify-center min-h-screen">
        <p className="text-slate-600 text-lg">Loading...</p>
      </div>
    )
  }

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
              <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
              <p className="text-sm md:text-base text-indigo-100">Admin Dashboard</p>
            </div>
            <h1 className="text-2xl md:text-4xl mb-2 font-bold truncate">Welcome back, {user?.name}!</h1>
            <p className="text-xs md:text-base text-indigo-100">
              Manage your platform and view system statistics
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-2 border-indigo-200 bg-indigo-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats?.users?.total || 0}</h3>
                  <p className="text-sm text-slate-600">Total Users</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.users?.students || 0} Students | {stats?.users?.admins || 0} Admins
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-xl">I</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats?.universities || 0}</h3>
                  <p className="text-sm text-slate-600">Universities</p>
                  <p className="text-xs text-slate-500 mt-1">HEC Recognized</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-purple-200 bg-purple-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats?.programs || 0}</h3>
                  <p className="text-sm text-slate-600">Degree Programs</p>
                  <p className="text-xs text-slate-500 mt-1">Active Programs</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-green-200 bg-green-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats?.assessments || 0}</h3>
                  <p className="text-sm text-slate-600">Assessments</p>
                  <p className="text-xs text-slate-500 mt-1">Completed</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admin/users">
              <Card className="p-6 border-2 border-indigo-200 bg-indigo-50/50 hover:shadow-xl transition-all h-full">
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Manage Users</h3>
                <p className="text-sm text-slate-600">View, edit, and manage user accounts</p>
              </Card>
            </Link>

            <Link to="/admin/universities">
              <Card className="p-6 border-2 border-blue-200 bg-blue-50/50 hover:shadow-xl transition-all h-full">
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Manage Universities</h3>
                <p className="text-sm text-slate-600">Add, edit, delete universities</p>
              </Card>
            </Link>

            <Link to="/admin/programs">
              <Card className="p-6 border-2 border-purple-200 bg-purple-50/50 hover:shadow-xl transition-all h-full">
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Manage Programs</h3>
                <p className="text-sm text-slate-600">Add, edit degree programs</p>
              </Card>
            </Link>

            <Link to="/admin/assessments">
              <Card className="p-6 border-2 border-green-200 bg-green-50/50 hover:shadow-xl transition-all h-full">
                <h3 className="text-xl font-semibold mb-2 text-slate-900">View Analytics</h3>
                <p className="text-sm text-slate-600">Assessment results and trends</p>
              </Card>
            </Link>

            <Link to="/admin/merit-criteria">
              <Card className="p-6 border-2 border-orange-200 bg-orange-50/50 hover:shadow-xl transition-all h-full">
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Merit Criteria</h3>
                <p className="text-sm text-slate-600">Manage merit calculation criteria</p>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* System Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">System Overview</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">S</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Platform Status</p>
                  <p className="text-sm text-slate-600">System running smoothly</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">{stats?.users?.total || 0}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Registered Users</p>
                  <p className="text-sm text-slate-600">Total platform users</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">{stats?.assessments || 0}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Completed Assessments</p>
                  <p className="text-sm text-slate-600">Career tests taken</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard

