import { useState, useEffect } from 'react'
import api from '../services/api'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { GraduationCap, Search, MapPin, Building2, Bookmark, BookmarkCheck, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { useConfirmation } from '../hooks/useConfirmation'

const Universities = () => {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [savedUniversities, setSavedUniversities] = useState(new Set())
  const [showProgramsModal, setShowProgramsModal] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [programs, setPrograms] = useState([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(12) // 12 universities per page
  const { showSuccess, showError } = useNotification()
  const { confirm, ConfirmationComponent } = useConfirmation()

  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when filters change
  }, [search, city, type])

  useEffect(() => {
    fetchUniversities()
    fetchSavedUniversities()
  }, [search, city, type, currentPage])

  const fetchSavedUniversities = async () => {
    try {
      const res = await api.get('/api/saved-universities')
      const savedIds = new Set(res.data.savedUniversities.map(su => su.university._id || su.university))
      setSavedUniversities(savedIds)
    } catch (error) {
      console.error('Error fetching saved universities:', error)
    }
  }

  const handleSaveUniversity = async (universityId) => {
    try {
      await api.post('/api/saved-universities', { universityId })
      setSavedUniversities(prev => new Set([...prev, universityId]))
      showSuccess('University saved successfully!')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save university')
    }
  }

  const handleUnsaveUniversity = async (universityId) => {
    try {
      await api.delete(`/api/saved-universities/${universityId}`)
      setSavedUniversities(prev => {
        const newSet = new Set(prev)
        newSet.delete(universityId)
        return newSet
      })
      showSuccess('University removed from saved list')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to remove university')
    }
  }

  const handleViewPrograms = async (university) => {
    setSelectedUniversity(university)
    setShowProgramsModal(true)
    setLoadingPrograms(true)
    try {
      const res = await api.get(`/api/programs`, { 
        params: { university: university._id } 
      })
      setPrograms(res.data.programs || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
      setPrograms([])
      showError('Failed to load programs')
    } finally {
      setLoadingPrograms(false)
    }
  }

  const handleApply = async (program) => {
    const confirmed = await confirm({
      title: 'Apply to Program',
      message: `Are you sure you want to apply to ${program.name} at ${selectedUniversity?.name}?`,
      confirmText: 'Apply',
      cancelText: 'Cancel',
      type: 'info'
    })

    if (!confirmed) return

    try {
      await api.post('/api/applications', {
        universityId: selectedUniversity._id,
        programId: program._id
      })
      showSuccess('Application submitted successfully!')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit application')
    }
  }

  const fetchUniversities = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: limit
      }
      if (search) params.search = search
      if (city) params.city = city
      if (type) params.type = type

      const res = await api.get('/api/universities', { params })
      setUniversities(res.data.universities || [])
      setTotalPages(res.data.totalPages || 1)
      setTotal(res.data.total || 0)
    } catch (error) {
      console.error('Error fetching universities:', error)
      setUniversities([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full bg-slate-50 pb-8">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <GraduationCap className="w-6 h-6 md:w-10 md:h-10 text-indigo-600" />
            HEC-Recognized Universities
          </h1>
          <p className="text-slate-600 text-sm md:text-lg">Explore top universities across Pakistan</p>
        </div>

        {/* Filters */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search universities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Cities</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Quetta">Quetta</option>
            </select>

            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-600 text-lg">Loading universities...</p>
          </div>
        ) : universities.length === 0 ? (
          <Card className="p-12 text-center">
            <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No universities found</h3>
            <p className="text-slate-600">Admin needs to add university data.</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universities.map(uni => (
                <Card key={uni._id} className="p-6 hover:shadow-lg transition-all relative flex flex-col h-full">
                  <button
                    onClick={() => savedUniversities.has(uni._id) 
                      ? handleUnsaveUniversity(uni._id) 
                      : handleSaveUniversity(uni._id)
                    }
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors z-10"
                    title={savedUniversities.has(uni._id) ? 'Remove from saved' : 'Save university'}
                  >
                    {savedUniversities.has(uni._id) ? (
                      <BookmarkCheck className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                    )}
                  </button>
                  <div className="flex items-start gap-4 mb-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 pr-8 min-w-0">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{uni.name}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{uni.city}</span>
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span>{uni.type} University</span>
                        </p>
                        {uni.hecRanking && (
                          <p className="text-sm text-indigo-600 font-medium">
                            HEC Rank: {uni.hecRanking}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col justify-end mt-auto">
                    <div className="mt-auto">
                      {uni.website ? (
                        <Button 
                          onClick={() => window.open(uni.website, '_blank', 'noopener,noreferrer')}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                        >
                          Explore
                        </Button>
                      ) : (
                        <Button 
                          disabled
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white opacity-50 cursor-not-allowed"
                        >
                          Explore
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[40px] ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                              : 'bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-slate-400">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Results count */}
            {total > 0 && (
              <div className="mt-4 text-center text-sm text-slate-600">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} universities
              </div>
            )}
          </>
        )}
      </div>
      <div className="h-8"></div>

      {/* Programs Modal */}
      {showProgramsModal && selectedUniversity && (
        <>
          {ConfirmationComponent}
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowProgramsModal(false)}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedUniversity.name} - Programs</h2>
                  <p className="text-sm text-slate-600">{selectedUniversity.city}</p>
                </div>
                <button
                  onClick={() => setShowProgramsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {loadingPrograms ? (
                  <div className="text-center py-8 text-slate-600">Loading programs...</div>
                ) : programs.length === 0 ? (
                  <div className="text-center py-8 text-slate-600">No programs available for this university</div>
                ) : (
                  <div className="space-y-3">
                    {programs.map(program => (
                      <Card key={program._id} className="p-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">{program.name}</h3>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p><span className="font-medium">Degree:</span> {program.degree || program.degreeType || 'N/A'}</p>
                              <p><span className="font-medium">Duration:</span> {program.duration || 'N/A'}</p>
                              {program.feePerSemester && (
                                <p><span className="font-medium">Fee:</span> Rs. {program.feePerSemester} per semester</p>
                              )}
                              {program.category && (
                                <p><span className="font-medium">Category:</span> {program.category}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleApply(program)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white whitespace-nowrap"
                          >
                            Apply
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Universities
