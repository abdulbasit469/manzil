import { useState, useEffect } from 'react'
import api from '../services/api'
import './Universities.css'

const Universities = () => {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    fetchUniversities()
  }, [search, city, type])

  const fetchUniversities = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (city) params.city = city
      if (type) params.type = type

      const res = await api.get('/api/universities', { params })
      setUniversities(res.data.universities)
    } catch (error) {
      console.error('Error fetching universities:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="universities-container">
      <div className="container">
        <h1>HEC-Recognized Universities</h1>
        <p className="subtitle">Explore top universities across Pakistan</p>

        <div className="filters">
          <input
            type="text"
            placeholder="Search universities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          
          <select value={city} onChange={(e) => setCity(e.target.value)} className="filter-select">
            <option value="">All Cities</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Quetta">Quetta</option>
          </select>

          <select value={type} onChange={(e) => setType(e.target.value)} className="filter-select">
            <option value="">All Types</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        {loading ? (
          <p>Loading universities...</p>
        ) : universities.length === 0 ? (
          <div className="empty-state">
            <p>No universities found. Admin needs to add university data.</p>
          </div>
        ) : (
          <div className="universities-grid">
            {universities.map(uni => (
              <div key={uni._id} className="university-card">
                <h3>{uni.name}</h3>
                <p className="university-location">📍 {uni.city}</p>
                <p className="university-type">{uni.type} University</p>
                {uni.hecRanking && <p className="university-ranking">HEC Rank: {uni.hecRanking}</p>}
                {uni.website && (
                  <a href={uni.website} target="_blank" rel="noopener noreferrer" className="university-link">
                    Visit Website
                  </a>
                )}
                <button className="btn btn-primary">View Programs</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Universities

