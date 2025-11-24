import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" />
  }

  if (user.role !== 'admin') {
    return (
      <div style={{
        padding: '50px',
        textAlign: 'center',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Only administrators can access the admin panel.</p>
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute










