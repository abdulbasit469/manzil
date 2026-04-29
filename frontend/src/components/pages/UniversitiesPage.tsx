import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, MapPin, Bookmark, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';
import { getUniversityImage } from '../../utils/universityImage';
import { universityNameLabel, universityCityLabel } from '../../utils/universityDisplay';

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

interface UniversitiesPageProps {
  onOpenUniversityDetail?: (universityId: string) => void;
}

export function UniversitiesPage({ onOpenUniversityDetail }: UniversitiesPageProps) {
  const { isAuthenticated } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedUniversities, setSavedUniversities] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [cities, setCities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Declared before useEffects so dependency arrays can reference them safely
  const fetchUniversities = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 12
      };
      
      if (debouncedSearch) {
        params.search = debouncedSearch;
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
          type: uni.type || 'Public'
        }));
        
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
  }, [currentPage, debouncedSearch, selectedCity, selectedType]);

  const fetchCities = async () => {
    try {
      const response = await api.get('/universities/cities');
      if (response.data.success) {
        setCities(response.data.cities || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Fetch all cities on mount
  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchQuery.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) setCurrentPage(1);
        return next;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedType]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  // Fetch saved universities on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedUniversities();
    }
  }, [isAuthenticated]);

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

        {/* Loading State — skeleton cards so the grid never goes blank */}
        {loading && universities.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-9 bg-slate-200 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : universities.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No universities found. Try adjusting your search filters.</p>
          </Card>
        ) : (
          <>
        {/* Universities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
              {universities.map((university) => {
                const isSaved = savedUniversities.has(university._id);
                const universityImage = getUniversityImage(university);
                const universityType = university.type || 'Public';
                
                return (
                  <div key={university._id} className="h-full flex">
                    <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full w-full flex flex-col">
                      {/* University Image */}
                      <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                  <img
                          src={universityImage}
                    alt={universityNameLabel(university.name)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                          onError={(e) => {
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

                      {/* University Info — fixed title block height so location + CTA align across the row */}
                <div className="p-5 flex flex-col flex-1 min-h-0">
                        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-snug h-[4.5rem] flex items-start shrink-0">
                          {universityNameLabel(university.name)}
                        </h3>
                        
                        <div className="flex items-center justify-between gap-2 text-sm text-slate-600 mt-3 mb-3 shrink-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span className="truncate">{universityCityLabel(university.city)}</span>
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
                            if (onOpenUniversityDetail) {
                              onOpenUniversityDetail(university._id);
                            } else {
                              toast.error('Navigation not available');
                            }
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white mt-auto shrink-0"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                </div>
              </Card>
                  </div>
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
