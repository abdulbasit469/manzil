import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Users, Sparkles } from 'lucide-react'
import api from '../../services/api'
import { Card } from '../../components/ui/card'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [search])

  const fetchUsers = async () => {
    try {
      const params = {}
      if (search) params.search = search

      const res = await api.get('/api/admin/users', { params })
      setUsers(res.data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
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
    <div className="w-full bg-slate-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 shadow-lg relative z-0">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6" />
              <p className="text-indigo-100">User Management</p>
            </div>
            <h1 className="text-4xl mb-2 font-bold">Manage Users</h1>
            <p className="text-indigo-100">
              View, edit, and manage all registered users
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No users found</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Verified</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.isVerified 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isVerified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteUser(user._id, user.email)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        </Card>

        <div className="mt-6 text-slate-600">
          <p>Total Users: {users.length}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers

