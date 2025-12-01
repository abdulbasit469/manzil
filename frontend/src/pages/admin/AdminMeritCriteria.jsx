import { useState, useEffect } from 'react'
import api from '../../services/api'
import './Admin.css'

const AdminMeritCriteria = () => {
  const [criteria, setCriteria] = useState([])
  const [universities, setUniversities] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCriteria, setEditingCriteria] = useState(null)
  const [formData, setFormData] = useState({
    university: '',
    program: '',
    matricWeight: 10,
    firstYearWeight: 0,
    secondYearWeight: 0,
    intermediateWeight: 40,
    entryTestWeight: 50,
    entryTestRequired: true,
    entryTestName: 'ECAT',
    entryTestTotalMarks: 200,
    minimumMatricMarks: 600,
    minimumIntermediateMarks: 650,
    minimumEntryTestMarks: 100
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCriteria()
    fetchUniversities()
  }, [])

  useEffect(() => {
    if (formData.university) {
      fetchPrograms(formData.university)
    } else {
      setPrograms([])
    }
  }, [formData.university])

  const fetchCriteria = async () => {
    try {
      const res = await api.get('/api/admin/merit-criteria')
      setCriteria(res.data.criteria || [])
    } catch (error) {
      console.error('Error fetching criteria:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/api/universities')
      setUniversities(res.data.universities || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
    }
  }

  const fetchPrograms = async (universityId) => {
    try {
      const res = await api.get(`/api/universities/${universityId}/programs`)
      setPrograms(res.data.programs || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
      setPrograms([])
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate weights sum to ~100
    const totalWeight = parseFloat(formData.matricWeight) + 
                       parseFloat(formData.firstYearWeight) + 
                       parseFloat(formData.secondYearWeight) + 
                       parseFloat(formData.intermediateWeight) + 
                       parseFloat(formData.entryTestWeight)

    if (totalWeight < 95 || totalWeight > 105) {
      setError('Merit weights must sum to approximately 100%')
      return
    }

    try {
      if (editingCriteria) {
        await api.put(`/api/admin/merit-criteria/${editingCriteria._id}`, formData)
        setSuccess('Criteria updated successfully!')
      } else {
        await api.post('/api/admin/merit-criteria', formData)
        setSuccess('Criteria created successfully!')
      }
      
      setShowModal(false)
      setEditingCriteria(null)
      resetForm()
      fetchCriteria()
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed')
    }
  }

  const resetForm = () => {
    setFormData({
      university: '',
      program: '',
      matricWeight: 10,
      firstYearWeight: 0,
      secondYearWeight: 0,
      intermediateWeight: 40,
      entryTestWeight: 50,
      entryTestRequired: true,
      entryTestName: 'ECAT',
      entryTestTotalMarks: 200,
      minimumMatricMarks: 600,
      minimumIntermediateMarks: 650,
      minimumEntryTestMarks: 100
    })
  }

  const handleEdit = (item) => {
    setEditingCriteria(item)
    setFormData({
      university: item.university._id,
      program: item.program._id,
      matricWeight: item.matricWeight,
      firstYearWeight: item.firstYearWeight,
      secondYearWeight: item.secondYearWeight,
      intermediateWeight: item.intermediateWeight,
      entryTestWeight: item.entryTestWeight,
      entryTestRequired: item.entryTestRequired,
      entryTestName: item.entryTestName || 'ECAT',
      entryTestTotalMarks: item.entryTestTotalMarks || 200,
      minimumMatricMarks: item.minimumMatricMarks || 600,
      minimumIntermediateMarks: item.minimumIntermediateMarks || 650,
      minimumEntryTestMarks: item.minimumEntryTestMarks || 100
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this criteria?')) {
      return
    }

    try {
      await api.delete(`/api/admin/merit-criteria/${id}`)
      setSuccess('Criteria deleted successfully!')
      fetchCriteria()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  const openAddModal = () => {
    setEditingCriteria(null)
    resetForm()
    setShowModal(true)
  }

  if (loading) return <div className="admin-container"><p>Loading...</p></div>

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Merit Criteria Management</h1>
        <button onClick={openAddModal} className="btn btn-primary">Add Criteria</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>University</th>
              <th>Program</th>
              <th>Matric</th>
              <th>Intermediate</th>
              <th>Entry Test</th>
              <th>Entry Test Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {criteria.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  No merit criteria found. Click "Add Criteria" to create one.
                </td>
              </tr>
            ) : (
              criteria.map((item) => (
                <tr key={item._id}>
                  <td>{item.university?.name || 'N/A'}</td>
                  <td>{item.program?.name || 'N/A'}</td>
                  <td>{item.matricWeight}%</td>
                  <td>{item.intermediateWeight}%</td>
                  <td>{item.entryTestWeight}%</td>
                  <td>{item.entryTestName || 'N/A'}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => handleEdit(item)} className="btn btn-sm btn-edit">Edit</button>
                      <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCriteria ? 'Edit Merit Criteria' : 'Add Merit Criteria'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>University *</label>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select University...</option>
                    {universities.map(uni => (
                      <option key={uni._id} value={uni._id}>
                        {uni.name} - {uni.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Program *</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    required
                    disabled={!formData.university}
                  >
                    <option value="">Select Program...</option>
                    {programs.map(prog => (
                      <option key={prog._id} value={prog._id}>
                        {prog.name} ({prog.degree})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>Merit Weights (Must sum to ~100%)</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Matric Weight (%)</label>
                  <input
                    type="number"
                    name="matricWeight"
                    value={formData.matricWeight}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Intermediate Weight (%)</label>
                  <input
                    type="number"
                    name="intermediateWeight"
                    value={formData.intermediateWeight}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>1st Year Weight (%)</label>
                  <input
                    type="number"
                    name="firstYearWeight"
                    value={formData.firstYearWeight}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>2nd Year Weight (%)</label>
                  <input
                    type="number"
                    name="secondYearWeight"
                    value={formData.secondYearWeight}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Entry Test Weight (%)</label>
                <input
                  type="number"
                  name="entryTestWeight"
                  value={formData.entryTestWeight}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Entry Test Required</label>
                  <input
                    type="checkbox"
                    name="entryTestRequired"
                    checked={formData.entryTestRequired}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Entry Test Name</label>
                  <select
                    name="entryTestName"
                    value={formData.entryTestName}
                    onChange={handleChange}
                  >
                    <option value="ECAT">ECAT</option>
                    <option value="MDCAT">MDCAT</option>
                    <option value="NET">NET</option>
                    <option value="NTS">NTS</option>
                    <option value="USAT">USAT</option>
                    <option value="NUMS">NUMS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Entry Test Total Marks</label>
                  <input
                    type="number"
                    name="entryTestTotalMarks"
                    value={formData.entryTestTotalMarks}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>Minimum Requirements</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Matric Marks</label>
                  <input
                    type="number"
                    name="minimumMatricMarks"
                    value={formData.minimumMatricMarks}
                    onChange={handleChange}
                    min="0"
                    max="1100"
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Intermediate Marks</label>
                  <input
                    type="number"
                    name="minimumIntermediateMarks"
                    value={formData.minimumIntermediateMarks}
                    onChange={handleChange}
                    min="0"
                    max="1100"
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Entry Test Marks</label>
                  <input
                    type="number"
                    name="minimumEntryTestMarks"
                    value={formData.minimumEntryTestMarks}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '6px' }}>
                <strong>Total Weight: </strong>
                {parseFloat(formData.matricWeight) + 
                 parseFloat(formData.firstYearWeight) + 
                 parseFloat(formData.secondYearWeight) + 
                 parseFloat(formData.intermediateWeight) + 
                 parseFloat(formData.entryTestWeight)}%
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCriteria ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMeritCriteria



