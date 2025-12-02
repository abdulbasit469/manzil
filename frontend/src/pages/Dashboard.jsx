import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { 
  Briefcase,
  GraduationCap,
  Calculator,
  FileText,
  ArrowRight,
  BookOpen,
  Sparkles,
  User,
  Bookmark,
  CheckCircle2,
  Users,
  MessageCircle
} from 'lucide-react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  // Reset scroll position when component mounts - ensure content starts below navbar
  useEffect(() => {
    const resetScroll = () => {
      const mainContent = document.querySelector('.main-content')
      if (mainContent) {
        mainContent.scrollTop = 0
        // Ensure scroll is at the very top
        if (mainContent.scrollTop !== 0) {
          mainContent.scrollTop = 0
        }
      }
    }
    // Reset immediately
    resetScroll()
    // Reset multiple times to ensure it works
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

  // Show content even if dashboard data is null
  const dashboardData = dashboard || {
    profileCompletion: 0,
    stats: {
      savedUniversities: 0,
      applicationsInProgress: 0,
      assessmentTaken: false
    }
  }

  const actionCards = [
    {
      icon: Briefcase,
      title: 'Career Assessment',
      description: 'Discover your ideal career path through our assessment',
      buttonText: dashboardData?.stats?.assessmentTaken ? 'View Results' : 'Take Assessment',
      path: '/assessment',
      gradient: 'from-indigo-500 to-purple-600',
      accentColor: 'border-indigo-200 bg-indigo-50/50',
    },
    {
      icon: FileText,
      title: 'Mock Test',
      description: 'Practice with realistic tests to prepare for your exams',
      buttonText: 'Start Mock Test',
      path: '/assessment',
      gradient: 'from-purple-500 to-pink-600',
      accentColor: 'border-purple-200 bg-purple-50/50',
    },
    {
      icon: GraduationCap,
      title: 'Universities',
      description: 'Explore HEC-recognized universities and find the perfect match',
      buttonText: 'Browse Universities',
      path: '/universities',
      gradient: 'from-blue-500 to-cyan-600',
      accentColor: 'border-blue-200 bg-blue-50/50',
    },
    {
      icon: Calculator,
      title: 'Merit Calculator',
      description: 'Calculate your admission merit percentage and check probabilities',
      buttonText: 'Calculate Merit',
      path: '/merit-calculator',
      gradient: 'from-orange-500 to-red-600',
      accentColor: 'border-orange-200 bg-orange-50/50',
    },
  ]

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
        {/* Profile Completion Card */}
        {dashboardData?.profileCompletion < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-4 md:p-6 border-2 border-blue-200 bg-blue-50/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold mb-1">Complete Your Profile</h3>
                  <p className="text-xs md:text-sm text-slate-600">Get personalized recommendations</p>
                </div>
                <span className="text-xl md:text-2xl font-bold text-blue-600">{dashboardData?.profileCompletion || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dashboardData?.profileCompletion || 0}%` }}
                />
              </div>
              <Link to="/profile">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-lg">
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        )}

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-4 md:mb-6 flex items-center gap-2 text-lg md:text-xl font-semibold">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
            Your Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {actionCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className={`p-4 md:p-6 border-2 ${card.accentColor} hover:shadow-xl transition-all duration-300 group h-full flex flex-col`}>
                  <div className="flex items-start gap-3 md:gap-4 mb-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <card.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-2 text-sm md:text-base font-semibold">{card.title}</h3>
                      <p className="text-xs md:text-sm text-slate-600">{card.description}</p>
                    </div>
                  </div>

                  <Link to={card.path} className="mt-auto">
                    <Button
                      className={`w-full bg-gradient-to-r ${card.gradient} text-white hover:shadow-lg transition-all duration-300 group-hover:translate-x-1`}
                    >
                      {card.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="mb-6 text-xl font-semibold">Recent Activity</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {[
                {
                  action: 'Saved university',
                  detail: 'NUST - National University of Sciences & Technology',
                  time: '2 hours ago',
                  icon: Bookmark,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50',
                },
                {
                  action: 'Completed career assessment',
                  detail: 'Engineering & Technology pathway',
                  time: '1 day ago',
                  icon: CheckCircle2,
                  color: 'text-green-600',
                  bgColor: 'bg-green-50',
                },
                {
                  action: 'Updated profile',
                  detail: 'Added academic achievements',
                  time: '3 days ago',
                  icon: User,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1 font-medium">{activity.action}</p>
                    <p className="text-sm text-slate-600 truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="mb-6 text-xl font-semibold">Quick Stats</h2>
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Saved Universities</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardData?.stats?.savedUniversities || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Applications</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardData?.stats?.applicationsInProgress || 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Community Forum */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
            <Users className="w-5 h-5 text-indigo-600" />
            Community Forum
          </h2>
          <Card className="p-6 border-2 border-green-200 bg-green-50/30">
            <div className="space-y-4">
              {[
                {
                  user: 'Ahmed Khan',
                  topic: 'Tips for NUST NET preparation',
                  replies: 24,
                  time: '1 hour ago',
                },
                {
                  user: 'Sara Ali',
                  topic: 'Best engineering universities in Lahore',
                  replies: 18,
                  time: '3 hours ago',
                },
                {
                  user: 'Hassan Raza',
                  topic: 'Scholarship opportunities for FSc students',
                  replies: 31,
                  time: '5 hours ago',
                },
              ].map((discussion, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                    {discussion.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="mb-1 font-medium">{discussion.topic}</p>
                    <p className="text-sm text-slate-600">
                      by {discussion.user} • {discussion.replies} replies
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-slate-500 whitespace-nowrap">{discussion.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all">
              View All Discussions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </motion.div>
      </div>
      <div className="h-8"></div>
    </div>
  )
}

export default Dashboard
