import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyOTP from './pages/VerifyOTP'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Universities from './pages/Universities'
import Profile from './pages/Profile'
import Assessment from './pages/Assessment'
import AssessmentFlow from './pages/AssessmentFlow'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUniversities from './pages/admin/AdminUniversities'
import AdminPrograms from './pages/admin/AdminPrograms'
import AdminAssessments from './pages/admin/AdminAssessments'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            
            {/* Home - Redirects based on role */}
            <Route path="/" element={<Home />} />
            
            {/* Student Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/universities" element={<ProtectedRoute><Universities /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><AssessmentFlow /></ProtectedRoute>} />
            <Route path="/assessment/old" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/universities" element={<AdminRoute><AdminUniversities /></AdminRoute>} />
            <Route path="/admin/programs" element={<AdminRoute><AdminPrograms /></AdminRoute>} />
            <Route path="/admin/assessments" element={<AdminRoute><AdminAssessments /></AdminRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

