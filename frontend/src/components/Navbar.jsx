import { useContext, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  // Start with sidebar open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024
  })

  // Update body class for CSS styling
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }
    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [isSidebarOpen])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !isSidebarOpen) {
        // On desktop, open sidebar if it was closed
        setIsSidebarOpen(true)
      } else if (window.innerWidth < 1024 && isSidebarOpen) {
        // On mobile, close sidebar if it was open
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarOpen])

  // Hide navbar on auth pages
  const hideNavbarPaths = ['/login', '/signup', '/admin-login', '/forgot-password', '/verify-otp']
  const isAuthPage = hideNavbarPaths.some(path => location.pathname.startsWith(path)) || location.pathname.startsWith('/reset-password')

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  // Don't render navbar on auth pages
  if (isAuthPage) {
    return null
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      {/* Top Bar with Hamburger */}
      <nav className="topbar">
        <div className="topbar-container">
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <span className={`hamburger ${isSidebarOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="topbar-logo" onClick={closeSidebar}>
            <h2>Manzil</h2>
          </Link>
          {user && (
            <div className="topbar-user">
              <span className="user-name">{user.role === 'admin' ? `${user.name} (Admin)` : `Welcome, ${user.name}`}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Manzil</h2>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Close sidebar">
            ×
          </button>
        </div>

        <nav className="sidebar-menu">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Users</span>
                  </Link>
                  <Link 
                    to="/admin/universities" 
                    className={`sidebar-link ${isActive('/admin/universities') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Universities</span>
                  </Link>
                  <Link 
                    to="/admin/programs" 
                    className={`sidebar-link ${isActive('/admin/programs') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Programs</span>
                  </Link>
                  <Link 
                    to="/admin/assessments" 
                    className={`sidebar-link ${isActive('/admin/assessments') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Analytics</span>
                  </Link>
                  <Link 
                    to="/admin/merit-criteria" 
                    className={`sidebar-link ${isActive('/admin/merit-criteria') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Merit Criteria</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/universities" 
                    className={`sidebar-link ${isActive('/universities') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Universities</span>
                  </Link>
                  <Link 
                    to="/assessment" 
                    className={`sidebar-link ${isActive('/assessment') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Career Assessment</span>
                  </Link>
                  <Link 
                    to="/merit-calculator" 
                    className={`sidebar-link ${isActive('/merit-calculator') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Merit Calculator</span>
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <span>Profile</span>
                  </Link>
                </>
              )}
              <div className="sidebar-divider"></div>
              <button onClick={handleLogout} className="sidebar-link sidebar-logout">
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="sidebar-link" onClick={closeSidebar}>
                <span>Login</span>
              </Link>
              <Link to="/signup" className="sidebar-link" onClick={closeSidebar}>
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}

export default Navbar

