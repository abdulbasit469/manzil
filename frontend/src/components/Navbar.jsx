import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const { user } = useContext(AuthContext)
  
  // Start with sidebar open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024
  })

  const sidebarWidth = isSidebarOpen ? 280 : 80

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !isSidebarOpen) {
        setIsSidebarOpen(true)
      } else if (window.innerWidth < 1024 && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarOpen])

  // Update main content position based on sidebar state
  useEffect(() => {
    const mainContent = document.querySelector('.main-content')
    if (mainContent) {
      mainContent.style.left = `${sidebarWidth}px`
      mainContent.style.marginLeft = '0'
      // Reset scroll to top when sidebar changes
      mainContent.scrollTop = 0
    }
  }, [sidebarWidth])

  // Hide navbar on auth pages
  const hideNavbarPaths = ['/login', '/signup', '/admin-login', '/forgot-password', '/verify-otp']
  const isAuthPage = hideNavbarPaths.some(path => location.pathname.startsWith(path)) || location.pathname.startsWith('/reset-password')

  if (isAuthPage || !user) {
    return null
  }

      return (
        <>
          <TopNavbar 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            sidebarWidth={sidebarWidth}
            isSidebarOpen={isSidebarOpen}
          />
          <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        </>
      )
}

export default Navbar
