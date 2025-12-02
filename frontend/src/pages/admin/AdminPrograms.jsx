import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { BookOpen } from 'lucide-react'
import api from '../../services/api'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

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
        degree: program.degree || 'BS',
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
        degree: 'BS',
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
    <div className="w-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
              <p className="text-sm md:text-base text-indigo-100">Program Management</p>
            </div>
            <h1 className="text-2xl md:text-4xl mb-2 font-bold">Manage Programs</h1>
            <p className="text-xs md:text-base text-indigo-100">
              Add, edit, and manage degree programs
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Search and Add */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select 
              value={universityFilter} 
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Universities</option>
              {universities.map(uni => (
                <option key={uni._id} value={uni._id}>{uni.name}</option>
              ))}
            </select>
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
            >
              + Add Program
            </Button>
          </div>
        </Card>

        {/* Programs Table */}
        <Card className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-600 text-sm md:text-base">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-sm md:text-base">No programs found</div>
        ) : (
          <>
          <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-slate-900">Program Name</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-slate-900">University</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-slate-900">Degree</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-slate-900">Duration</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-slate-900">Fee/Semester</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-slate-900">Category</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-slate-900">{program.name}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-700">{program.university?.name || 'N/A'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-700">{program.degree || program.degreeType || 'N/A'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-700">{program.duration}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-700">{program.feePerSemester ? `Rs. ${program.feePerSemester}` : 'N/A'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-700">{program.category || 'N/A'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(program)}
                        className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 text-xs px-2 py-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(program._id, program.name)}
                        className="border-red-300 text-red-600 hover:bg-red-50 text-xs px-2 py-1"
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
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">{editMode ? 'Edit Program' : 'Add New Program'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Program Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">University *</label>
                <select 
                  name="university" 
                  value={formData.university} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select University</option>
                  {universities.map(uni => (
                    <option key={uni._id} value={uni._id}>{uni.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Degree Type *</label>
                <select 
                  name="degree" 
                  value={formData.degree} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="BS">BS (Bachelor of Science)</option>
                  <option value="BA">BA (Bachelor of Arts)</option>
                  <option value="BBA">BBA (Bachelor of Business Administration)</option>
                  <option value="MS">MS (Master of Science)</option>
                  <option value="PhD">PhD</option>
                  <option value="BE">BE (Bachelor of Engineering)</option>
                  <option value="MBA">MBA (Master of Business Administration)</option>
                  <option value="M.Phil">M.Phil</option>
                  <option value="BA-LLB">BA-LLB</option>
                  <option value="Pharm-D">Pharm-D</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Duration *</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 4 years"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Category *</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Law">Law</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Fee per Semester (Rs.)</label>
                <input
                  type="number"
                  name="feePerSemester"
                  value={formData.feePerSemester}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Eligibility Criteria</label>
                <textarea
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g. FSc Pre-Engineering with 60% marks"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Career Scope</label>
                <textarea
                  name="careerScope"
                  value={formData.careerScope}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe career opportunities..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 mt-6">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg">
                  {editMode ? 'Update' : 'Add'} Program
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPrograms




