import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, MapPin, Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';

interface University {
  _id: string;
  name: string;
  city: string;
  type: string;
  image?: string;
  logo?: string;
  description?: string;
  website?: string;
  [key: string]: any;
}

// Helper function to get university image
const getUniversityImage = (university: University): string => {
  if (university.image) return university.image;
  
  // Map specific universities to their images
  const name = university.name.toLowerCase();
  
  if (name.includes('nust') || name.includes('national university of sciences')) {
    return 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop';
  }
  if (name.includes('lums') || name.includes('lahore university of management')) {
    return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=500&fit=crop';
  }
  if (name.includes('fast') || name.includes('computer & emerging sciences')) {
    return 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=500&fit=crop';
  }
  if (name.includes('uet') || name.includes('university of engineering & technology')) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop';
  }
  if (name.includes('pieas') || name.includes('pakistan institute of engineering')) {
    return 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=500&fit=crop';
  }
  if (name.includes('comsats')) {
    return 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&h=500&fit=crop';
  }
  if (name.includes('aiou') || name.includes('allama iqbal open')) {
    return 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop';
  }
  if (name.includes('bahria')) {
    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop';
  }
  if (name.includes('iba') || name.includes('institute of business administration')) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop';
  }
  if (name.includes('giki') || name.includes('ghulam ishaq khan')) {
    return 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop';
  }
  if (name.includes('aga khan')) {
    return 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=500&fit=crop';
  }
  if (name.includes('air university')) {
    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop';
  }
  if (name.includes('bzu') || name.includes('bahauddin zakariya')) {
    return 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop';
  }
  
  // Default university image
  return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop';
};

export function UniversitiesPage() {
  const { isAuthenticated } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedUniversities, setSavedUniversities] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [cities, setCities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all cities on mount
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch universities when filters change
  useEffect(() => {
    fetchUniversities();
  }, [currentPage, searchQuery, selectedCity, selectedType]);

  // Fetch saved universities on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedUniversities();
    }
  }, [isAuthenticated]);

  const fetchCities = async () => {
    try {
      const response = await api.get('/universities/cities');
      if (response.data.success) {
        setCities(response.data.cities || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Continue without cities - will be populated from university results
    }
  };

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 12
      };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (selectedCity && selectedCity.trim() !== '' && selectedCity !== 'All Cities') {
        params.city = selectedCity.trim();
      }
      
      if (selectedType && selectedType.trim() !== '' && selectedType !== 'All Types') {
        params.type = selectedType.trim();
      }

      const response = await api.get('/universities', { params });
      
      if (response.data.success) {
        const universitiesData = response.data.universities || [];
        
        // Ensure each university has a type
        const universitiesWithType = universitiesData.map((uni: University) => ({
          ...uni,
          type: uni.type || 'Public' // Default to Public if type is missing
        }));
        
        // Debug: Log first university to check data structure
        if (universitiesWithType.length > 0) {
          console.log('Sample university data:', universitiesWithType[0]);
          console.log('University type:', universitiesWithType[0].type);
        }
        
        setUniversities(universitiesWithType);
        setTotalPages(response.data.totalPages || 1);
        
        // Add cities from current results to the list (if not already fetched)
        if (cities.length === 0) {
          const uniqueCities = new Set<string>();
          universitiesWithType.forEach((uni: University) => {
            if (uni.city) uniqueCities.add(uni.city);
          });
          if (uniqueCities.size > 0) {
            setCities(Array.from(uniqueCities).sort());
          }
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch universities');
      }
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load universities. Please check your connection.';
      toast.error(errorMessage);
      setUniversities([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedUniversities = async () => {
    try {
      const response = await api.get('/saved-universities');
      const saved = new Set(
        response.data.savedUniversities?.map((su: any) => su.university?._id || su.university) || []
      );
      setSavedUniversities(saved);
    } catch (error) {
      console.error('Error fetching saved universities:', error);
    }
  };

  const handleSaveUniversity = async (universityId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to save universities');
      return;
    }

    try {
      const isSaved = savedUniversities.has(universityId);
      
      if (isSaved) {
        await api.delete(`/saved-universities/${universityId}`);
        setSavedUniversities(prev => {
          const newSet = new Set(prev);
          newSet.delete(universityId);
          return newSet;
        });
        toast.success('University removed from saved list');
      } else {
        await api.post('/saved-universities', { universityId });
        setSavedUniversities(prev => new Set(prev).add(universityId));
        toast.success('University saved successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save university');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect when searchQuery changes
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl mb-2 font-bold">Explore Universities</h1>
            <p className="text-sm md:text-base text-blue-100">
              Discover the best universities in Pakistan and find your perfect match
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <Card className="p-4 md:p-6 bg-white rounded-lg shadow-sm">
            <div className="flex flex-row gap-3 md:gap-4 items-center">
              {/* Search Bar - Takes most of the width */}
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search universities..."
                  className="w-full pl-10 pr-4 py-2 md:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm md:text-base bg-white h-full"
                />
              </div>
              
              {/* All Cities Dropdown */}
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 md:px-4 py-2 md:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm md:text-base min-w-[140px] md:min-w-[150px] bg-white cursor-pointer h-[42px] md:h-[48px]"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              
              {/* All Types Dropdown */}
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 md:px-4 py-2 md:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm md:text-base min-w-[140px] md:min-w-[150px] bg-white cursor-pointer h-[42px] md:h-[48px]"
              >
                <option value="">All Types</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="ml-3 text-slate-600">Loading universities...</span>
          </div>
        ) : universities.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No universities found. Try adjusting your search filters.</p>
          </Card>
        ) : (
          <>
        {/* Universities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {universities.map((university) => {
                const isSaved = savedUniversities.has(university._id);
                const universityImage = getUniversityImage(university);
                const universityType = university.type || 'Public';
                
                return (
            <motion.div
                    key={university._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
            >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      {/* University Image */}
                      <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                  <img
                          src={universityImage}
                    alt={university.name}
                    className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to default image
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop';
                          }}
                        />
                        {/* Public/Private Badge - Positioned on image at bottom-left */}
                        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                          <span className="inline-block bg-slate-800/60 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-md whitespace-nowrap">
                            {universityType}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSaveUniversity(university._id)}
                          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all ${
                            isSaved
                              ? 'bg-amber-500 text-white shadow-lg'
                              : 'bg-white/90 text-slate-600 hover:bg-amber-500 hover:text-white'
                      }`}
                    >
                          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                  </div>

                      {/* University Info */}
                <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold mb-2 text-slate-800 line-clamp-2 min-h-[3.5rem]">
                          {university.name}
                        </h3>
                        
                        <div className="flex items-center justify-between gap-2 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span className="truncate">{university.city || 'N/A'}</span>
                  </div>
                          <button
                            onClick={() => handleSaveUniversity(university._id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                              isSaved
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-slate-100 text-slate-700 hover:bg-amber-500 hover:text-white'
                            }`}
                          >
                            <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                  </div>

                        <Button
                          onClick={() => {
                            if (university.website) {
                              // Ensure website URL has protocol
                              let websiteUrl = university.website.trim();
                              if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                                websiteUrl = 'https://' + websiteUrl;
                              }
                              // Open university website in new tab
                              window.open(websiteUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              toast.info('Website link not available for this university');
                            }
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white mt-auto"
                        >
                    View Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 md:mt-8">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="px-4"
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="px-4"
                >
                  Next
                </Button>
        </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
