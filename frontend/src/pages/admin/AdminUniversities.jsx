import { useState, useEffect } from 'react'
import api from '../../services/api'
import './Admin.css'

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
        ranking: university.ranking || '',
        website: university.website || '',
        contact: university.contact || { email: '', phone: '', address: '' }
      })
    } else {
      setEditMode(false)
      setCurrentUniversity(null)
      setFormData({
        name: '',
        city: '',
        type: 'public',
        ranking: '',
        website: '',
        contact: { email: '', phone: '', address: '' }
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
    if (name.startsWith('contact.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
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
    <div className="admin-container">
      <div className="admin-header">
        <h1>University Management</h1>
        <p>Add, edit, and manage universities</p>
      </div>

      {/* Search and Add */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search universities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn-add" onClick={() => handleOpenModal()}>
          + Add University
        </button>
      </div>

      {/* Universities Table */}
      <div className="admin-table-container">
        {loading ? (
          <p>Loading universities...</p>
        ) : universities.length === 0 ? (
          <p>No universities found</p>
        ) : (
          <div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Type</th>
                <th>Ranking</th>
                <th>Website</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(uni => (
                <tr key={uni._id}>
                  <td><strong>{uni.name}</strong></td>
                  <td>{uni.city}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      background: (uni.type && uni.type.toLowerCase() === 'public') ? '#000' : '#666',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {uni.type ? uni.type.toUpperCase() : 'N/A'}
                    </span>
                  </td>
                  <td>{uni.hecRanking || uni.ranking || 'N/A'}</td>
                  <td>
                    {uni.website ? (
                      <a href={uni.website} target="_blank" rel="noopener noreferrer">
                        Visit
                      </a>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(uni)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(uni._id, uni.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages} ({total} total)
              </div>
              
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
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editMode ? 'Edit University' : 'Add New University'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>University Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="form-group">
                <label>HEC Ranking</label>
                <input
                  type="number"
                  name="ranking"
                  value={formData.ranking}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="contact.address"
                  value={formData.contact.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-add">
                  {editMode ? 'Update' : 'Add'} University
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUniversities




