import { useState, useEffect } from 'react'
import api from '../services/api'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { GraduationCap, Search, MapPin, Building2 } from 'lucide-react'

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
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (city) params.city = city
      if (type) params.type = type

      const res = await api.get('/api/universities', { params })
      setUniversities(res.data.universities || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
      setUniversities([])
    } finally {
      setLoading(false)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map(uni => (
              <Card key={uni._id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{uni.name}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {uni.city}
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {uni.type} University
                      </p>
                      {uni.hecRanking && (
                        <p className="text-sm text-indigo-600 font-medium">
                          HEC Rank: {uni.hecRanking}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {uni.website && (
                  <a 
                    href={uni.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-3 inline-block"
                  >
                    Visit Website →
                  </a>
                )}
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  View Programs
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div className="h-8"></div>
    </div>
  )
}

export default Universities
