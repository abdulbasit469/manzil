import { useContext, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { 
  LayoutDashboard, 
  GraduationCap, 
  Briefcase, 
  Calculator,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
  BarChart3,
  FileText
} from 'lucide-react'
import { Button } from './ui/button'
import { AuthContext } from '../context/AuthContext'

export function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const studentMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: GraduationCap, label: 'Universities', path: '/universities' },
    { icon: Briefcase, label: 'Career Assessment', path: '/assessment' },
    { icon: FileText, label: 'Mock Test', path: '/mock-test' },
    { icon: Calculator, label: 'Merit Calculator', path: '/merit-calculator' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: GraduationCap, label: 'Universities', path: '/admin/universities' },
    { icon: BookOpen, label: 'Programs', path: '/admin/programs' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/assessments' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems

  // Hide sidebar on auth pages
  const hideNavbarPaths = ['/login', '/signup', '/admin-login', '/forgot-password', '/verify-otp']
  const isAuthPage = hideNavbarPaths.some(path => location.pathname.startsWith(path)) || location.pathname.startsWith('/reset-password')
  
  if (isAuthPage || !user) {
    return null
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}
      <motion.div
        initial={false}
        animate={{ 
          width: isOpen ? 280 : (isMobile ? 0 : 80),
          x: isMobile ? (isOpen ? 0 : -280) : 0
        }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col relative shadow-2xl h-screen z-50 flex-shrink-0 fixed left-0 top-0 overflow-y-auto"
      >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          {isOpen && <span className="text-xl font-semibold">Manzil</span>}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const active = isActive(item.path)
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <motion.span
                  animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </motion.div>
    </>
  )
}

