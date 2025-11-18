import { useState, useEffect } from 'react'
import api from '../../services/api'
import './Admin.css'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  const fetchUsers = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter

      const res = await api.get('/api/admin/users', { params })
      setUsers(res.data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return

    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole })
      alert('Role updated successfully')
      fetchUsers()
    } catch (error) {
      alert('Failed to update role: ' + error.response?.data?.message)
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Delete user ${userEmail}? This cannot be undone!`)) return

    try {
      await api.delete(`/api/admin/users/${userId}`)
      alert('User deleted successfully')
      fetchUsers()
    } catch (error) {
      alert('Failed to delete user: ' + error.response?.data?.message)
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      background: user.role === 'admin' ? '#000' : '#666',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: user.isVerified ? '#d4edda' : '#f8d7da',
                      color: user.isVerified ? '#155724' : '#721c24',
                      border: user.isVerified ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                    }}>
                      {user.isVerified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleRoleChange(
                          user._id,
                          user.role === 'student' ? 'admin' : 'student'
                        )}
                      >
                        {user.role === 'student' ? 'Make Admin' : 'Make Student'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user._id, user.email)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{marginTop: '20px', color: '#666'}}>
        <p>Total Users: {users.length}</p>
      </div>
    </div>
  )
}

export default AdminUsers

