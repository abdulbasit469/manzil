import { useState, useEffect, useContext } from 'react'
import { motion } from 'motion/react'
import { 
  Sparkles,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/card'

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
    // Refresh dashboard every 30 seconds to update stats
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  // Reset scroll position when component mounts
  useEffect(() => {
    const resetScroll = () => {
      const mainContent = document.querySelector('.main-content')
      if (mainContent) {
        mainContent.scrollTop = 0
        if (mainContent.scrollTop !== 0) {
          mainContent.scrollTop = 0
        }
      }
    }
    resetScroll()
    setTimeout(resetScroll, 10)
    setTimeout(resetScroll, 50)
    setTimeout(resetScroll, 100)
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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const dashboardData = dashboard || {
    profileCompletion: 0,
    stats: {
      savedUniversities: 0,
      applicationsInProgress: 0,
      assessmentTaken: false
    },
    graphs: {
      weeklyActivity: [
        { day: 'Mon', value: 0 },
        { day: 'Tue', value: 0 },
        { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 0 },
        { day: 'Sun', value: 0 }
      ],
      assessmentScores: [
        { category: 'Personality', score: 0 },
        { category: 'Aptitude', score: 0 },
        { category: 'Interest', score: 0 }
      ]
    }
  }

  // Real-time data from API
  const activityData = dashboardData?.graphs?.weeklyActivity || [
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 }
  ]

  const assessmentScores = dashboardData?.graphs?.assessmentScores || [
    { category: 'Personality', score: 0 },
    { category: 'Aptitude', score: 0 },
    { category: 'Interest', score: 0 }
  ]

  const maxValue = Math.max(...activityData.map(d => d.value))
  const maxScore = 100

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
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
              <p className="text-sm md:text-base text-indigo-100">Welcome back,</p>
            </div>
            <h1 className="text-2xl md:text-4xl mb-2 font-bold truncate">{user?.name}!</h1>
            <p className="text-xs md:text-base text-indigo-100">
              Your journey to success starts here. Let's make today count!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="p-6 border-2 border-indigo-200 bg-indigo-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Profile Completion</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardData?.profileCompletion || 0}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboardData?.profileCompletion || 0}%` }}
              />
            </div>
          </Card>

          <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Saved Universities</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardData?.stats?.savedUniversities || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-purple-200 bg-purple-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Applications</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardData?.stats?.applicationsInProgress || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activity Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Weekly Activity
            </h2>
            <div className="flex items-end justify-between gap-2 h-64">
              {activityData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.value / maxValue) * 100}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t-lg hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer relative group"
                      style={{ minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.value}
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{item.day}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Assessment Scores Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Assessment Scores
            </h2>
            <div className="space-y-4">
              {assessmentScores.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{item.category}</span>
                    <span className="text-sm font-bold text-slate-900">{item.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                      className={`h-3 rounded-full ${
                        index === 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' :
                        index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                        'bg-gradient-to-r from-purple-500 to-pink-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
      <div className="h-8"></div>
    </div>
  )
}

export default Dashboard
