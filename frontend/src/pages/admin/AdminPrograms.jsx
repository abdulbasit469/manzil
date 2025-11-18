import { useState, useEffect } from 'react'
import api from '../../services/api'
import './Admin.css'

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentProgram, setCurrentProgram] = useState(null)
  const [search, setSearch] = useState('')
  const [universityFilter, setUniversityFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    degreeType: 'BS',
    duration: '',
    feePerSemester: '',
    eligibility: '',
    careerScope: '',
    category: 'Engineering'
  })

  useEffect(() => {
    fetchUniversities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Reset to page 1 when search/filter changes
    setCurrentPage(1)
  }, [search, universityFilter])

  useEffect(() => {
    // Fetch when page, search, or filter changes
    const timeoutId = setTimeout(() => {
      fetchPrograms(currentPage)
    }, search ? 300 : 0) // Debounce only when searching
    
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, universityFilter])

  const fetchPrograms = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: itemsPerPage
      }
      if (search && search.trim()) params.search = search.trim()
      if (universityFilter && universityFilter.trim()) params.university = universityFilter.trim()

      const res = await api.get('/api/programs', { params })
      // Handle both response formats
      if (res.data.programs) {
        setPrograms(res.data.programs)
        setTotalPages(res.data.totalPages || 1)
        setTotal(res.data.total || 0)
        console.log(`✅ Loaded ${res.data.programs.length} programs (Page ${page})`)
      } else if (Array.isArray(res.data)) {
        setPrograms(res.data)
        setTotalPages(1)
        setTotal(res.data.length)
        console.log(`✅ Loaded ${res.data.length} programs`)
      } else {
        setPrograms([])
        setTotalPages(1)
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
      setPrograms([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/api/universities')
      setUniversities(res.data.universities)
    } catch (error) {
      console.error('Error fetching universities:', error)
    }
  }

  const handleOpenModal = (program = null) => {
    if (program) {
      setEditMode(true)
      setCurrentProgram(program)
      setFormData({
        name: program.name,
        university: program.university?._id || program.university || '',
        degreeType: program.degree || program.degreeType || 'BS',
        duration: program.duration || '',
        feePerSemester: program.feePerSemester || '',
        eligibility: program.eligibility || '',
        careerScope: program.careerScope || '',
        category: program.category || 'Engineering'
      })
    } else {
      setEditMode(false)
      setCurrentProgram(null)
      setFormData({
        name: '',
        university: '',
        degreeType: 'BS',
        duration: '',
        feePerSemester: '',
        eligibility: '',
        careerScope: '',
        category: 'Engineering'
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditMode(false)
    setCurrentProgram(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editMode) {
        await api.put(`/api/admin/programs/${currentProgram._id}`, formData)
        alert('Program updated successfully!')
      } else {
        await api.post('/api/admin/programs', formData)
        alert('Program added successfully!')
      }
      handleCloseModal()
      fetchPrograms(currentPage)
    } catch (error) {
      alert('Error: ' + error.response?.data?.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete program "${name}"?`)) return
    
    try {
      await api.delete(`/api/admin/programs/${id}`)
      alert('Program deleted successfully')
      fetchPrograms(currentPage)
    } catch (error) {
      alert('Failed to delete: ' + error.response?.data?.message)
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Program Management</h1>
        <p>Add, edit, and manage degree programs</p>
      </div>

      {/* Search and Add */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search programs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={universityFilter} onChange={(e) => setUniversityFilter(e.target.value)}>
          <option value="">All Universities</option>
          {universities.map(uni => (
            <option key={uni._id} value={uni._id}>{uni.name}</option>
          ))}
        </select>
        <button className="btn-add" onClick={() => handleOpenModal()}>
          + Add Program
        </button>
      </div>

      {/* Programs Table */}
      <div className="admin-table-container">
        {loading ? (
          <p>Loading programs...</p>
        ) : programs.length === 0 ? (
          <p>No programs found</p>
        ) : (
          <div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Program Name</th>
                <th>University</th>
                <th>Degree</th>
                <th>Duration</th>
                <th>Fee/Semester</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program._id}>
                  <td><strong>{program.name}</strong></td>
                  <td>{program.university?.name || 'N/A'}</td>
                  <td>{program.degree || program.degreeType || 'N/A'}</td>
                  <td>{program.duration}</td>
                  <td>{program.feePerSemester ? `Rs. ${program.feePerSemester}` : 'N/A'}</td>
                  <td>{program.category || 'N/A'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(program)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(program._id, program.name)}
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
            <h2>{editMode ? 'Edit Program' : 'Add New Program'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Program Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>

              <div className="form-group">
                <label>University *</label>
                <select name="university" value={formData.university} onChange={handleChange} required>
                  <option value="">Select University</option>
                  {universities.map(uni => (
                    <option key={uni._id} value={uni._id}>{uni.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Degree Type *</label>
                <select name="degreeType" value={formData.degreeType} onChange={handleChange} required>
                  <option value="BS">BS (Bachelor of Science)</option>
                  <option value="BA">BA (Bachelor of Arts)</option>
                  <option value="BBA">BBA (Bachelor of Business Administration)</option>
                  <option value="MS">MS (Master of Science)</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="form-group">
                <label>Duration *</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 4 years"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts & Humanities</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Social Sciences">Social Sciences</option>
                  <option value="Law">Law</option>
                  <option value="IT">Information Technology</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fee per Semester (Rs.)</label>
                <input
                  type="number"
                  name="feePerSemester"
                  value={formData.feePerSemester}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                />
              </div>

              <div className="form-group">
                <label>Eligibility Criteria</label>
                <textarea
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g. FSc Pre-Engineering with 60% marks"
                />
              </div>

              <div className="form-group">
                <label>Career Scope</label>
                <textarea
                  name="careerScope"
                  value={formData.careerScope}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe career opportunities..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-add">
                  {editMode ? 'Update' : 'Add'} Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPrograms




