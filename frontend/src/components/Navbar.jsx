import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="navbar-logo">
          <h2>Manzil مَنزِل</h2>
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/admin/users" className="nav-link">Users</Link>
                  <Link to="/admin/universities" className="nav-link">Universities</Link>
                  <Link to="/admin/programs" className="nav-link">Programs</Link>
                  <Link to="/admin/assessments" className="nav-link">Analytics</Link>
                  <span className="nav-user">{user.name} (Admin)</span>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/universities" className="nav-link">Universities</Link>
                  <Link to="/assessment" className="nav-link">Career Assessment</Link>
                  <Link to="/profile" className="nav-link">Profile</Link>
                  <span className="nav-user">Welcome, {user.name}</span>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

