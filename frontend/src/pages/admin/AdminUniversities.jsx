import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { GraduationCap } from 'lucide-react'
import api from '../../services/api'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

const AdminUniversities = () => {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentUniversity, setCurrentUniversity] = useState(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    type: 'public',
    ranking: '',
    website: '',
    contact: { email: '', phone: '', address: '' }
  })

  useEffect(() => {
    // Reset to page 1 when search changes
    setCurrentPage(1)
  }, [search])

  useEffect(() => {
    // Fetch when page or search changes
    const timeoutId = setTimeout(() => {
      fetchUniversities(currentPage)
    }, search ? 300 : 0) // Debounce only when searching
    
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search])

  const fetchUniversities = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: itemsPerPage
      }
      if (search && search.trim()) params.search = search.trim()
      
      const res = await api.get('/api/universities', { params })
      // Handle both response formats
      if (res.data.universities) {
        setUniversities(res.data.universities)
        setTotalPages(res.data.totalPages || 1)
        setTotal(res.data.total || 0)
      } else if (Array.isArray(res.data)) {
        setUniversities(res.data)
        setTotalPages(1)
        setTotal(res.data.length)
      } else {
        setUniversities([])
        setTotalPages(1)
        setTotal(0)
      }
      console.log(`✅ Loaded ${res.data.universities?.length || res.data.length || 0} universities (Page ${page})`)
    } catch (error) {
      console.error('Error fetching universities:', error)
      setUniversities([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (university = null) => {
    if (university) {
      setEditMode(true)
      setCurrentUniversity(university)
      setFormData({
        name: university.name,
        city: university.city,
        type: university.type,
        hecRanking: university.hecRanking || '',
        website: university.website || '',
        email: university.email || '',
        phone: university.phone || '',
        address: university.address || ''
      })
    } else {
      setEditMode(false)
      setCurrentUniversity(null)
      setFormData({
        name: '',
        city: '',
        type: 'Public',
        hecRanking: '',
        website: '',
        email: '',
        phone: '',
        address: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditMode(false)
    setCurrentUniversity(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editMode) {
        await api.put(`/api/admin/universities/${currentUniversity._id}`, formData)
        alert('University updated successfully!')
      } else {
        await api.post('/api/admin/universities', formData)
        alert('University added successfully!')
      }
      handleCloseModal()
      fetchUniversities(currentPage)
    } catch (error) {
      alert('Error: ' + error.response?.data?.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This will also delete all associated programs!`)) return
    
    try {
      await api.delete(`/api/admin/universities/${id}`)
      alert('University deleted successfully')
      fetchUniversities()
    } catch (error) {
      alert('Failed to delete: ' + error.response?.data?.message)
    }
  }

  return (
    <div className="w-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-6 h-6" />
              <p className="text-indigo-100">University Management</p>
            </div>
            <h1 className="text-4xl mb-2 font-bold">Manage Universities</h1>
            <p className="text-indigo-100">
              Add, edit, and manage universities
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Search and Add */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="text"
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
            >
              + Add University
            </Button>
          </div>
        </Card>

        {/* Universities Table */}
        <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading universities...</div>
        ) : universities.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No universities found</div>
        ) : (
          <>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">City</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ranking</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Website</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(uni => (
                <tr key={uni._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{uni.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{uni.city}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (uni.type && uni.type.toLowerCase() === 'public') 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    }`}>
                      {uni.type ? uni.type.toUpperCase() : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{uni.hecRanking || uni.ranking || 'N/A'}</td>
                  <td className="px-4 py-3">
                    {uni.website ? (
                      <a href={uni.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        Visit
                      </a>
                    ) : <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(uni)}
                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(uni._id, uni.name)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages} ({total} total)
              </span>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-indigo-600 text-white" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
          </>
        )}
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 md:p-6 border-b border-slate-200">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">{editMode ? 'Edit University' : 'Add New University'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">University Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Type *</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">HEC Ranking</label>
                <input
                  type="number"
                  name="hecRanking"
                  value={formData.hecRanking}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 mt-6">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg">
                  {editMode ? 'Update' : 'Add'} University
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUniversities




