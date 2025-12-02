import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyOTP from './pages/VerifyOTP'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Universities from './pages/Universities'
import Profile from './pages/Profile'
import Assessment from './pages/Assessment'
import AssessmentFlow from './pages/AssessmentFlow'
import MeritCalculator from './pages/MeritCalculator'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUniversities from './pages/admin/AdminUniversities'
import AdminPrograms from './pages/admin/AdminPrograms'
import AdminAssessments from './pages/admin/AdminAssessments'
import AdminMeritCriteria from './pages/admin/AdminMeritCriteria'
import './App.css'

function ScrollToTop() {
  const location = useLocation()
  
  useEffect(() => {
    // Reset scroll to ensure content starts below navbar
    const resetScroll = () => {
      const mainContent = document.querySelector('.main-content')
      if (mainContent) {
        mainContent.scrollTop = 0
      }
    }
    resetScroll()
    // Reset multiple times to ensure it works
    setTimeout(resetScroll, 10)
    setTimeout(resetScroll, 50)
  }, [location.pathname])
  
  return null
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Home - Redirects based on role */}
            <Route path="/" element={<Home />} />
            
            {/* Student Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/universities" element={<ProtectedRoute><Universities /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><AssessmentFlow /></ProtectedRoute>} />
            <Route path="/assessment/old" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            <Route path="/merit-calculator" element={<ProtectedRoute><MeritCalculator /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/universities" element={<AdminRoute><AdminUniversities /></AdminRoute>} />
            <Route path="/admin/programs" element={<AdminRoute><AdminPrograms /></AdminRoute>} />
            <Route path="/admin/assessments" element={<AdminRoute><AdminAssessments /></AdminRoute>} />
            <Route path="/admin/merit-criteria" element={<AdminRoute><AdminMeritCriteria /></AdminRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

