import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, MapPin, Star, BookOpen, Users, Award, Bookmark, ExternalLink } from 'lucide-react';

export function UniversitiesPage() {
  const universities = [
    {
      name: 'NUST - National University of Sciences & Technology',
      location: 'Islamabad',
      rating: 4.8,
      programs: 65,
      students: '12,000+',
      type: 'Public',
      saved: true,
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=250&fit=crop',
    },
    {
      name: 'LUMS - Lahore University of Management Sciences',
      location: 'Lahore',
      rating: 4.9,
      programs: 42,
      students: '5,500+',
      type: 'Private',
      saved: true,
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop',
    },
    {
      name: 'FAST - National University of Computer & Emerging Sciences',
      location: 'Multiple Cities',
      rating: 4.6,
      programs: 38,
      students: '15,000+',
      type: 'Public',
      saved: false,
      image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&h=250&fit=crop',
    },
    {
      name: 'University of Engineering & Technology (UET)',
      location: 'Lahore',
      rating: 4.5,
      programs: 52,
      students: '18,000+',
      type: 'Public',
      saved: true,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
    },
    {
      name: 'Pakistan Institute of Engineering & Applied Sciences (PIEAS)',
      location: 'Islamabad',
      rating: 4.7,
      programs: 28,
      students: '3,000+',
      type: 'Public',
      saved: false,
      image: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&h=250&fit=crop',
    },
    {
      name: 'COMSATS University',
      location: 'Multiple Cities',
      rating: 4.4,
      programs: 48,
      students: '40,000+',
      type: 'Public',
      saved: false,
      image: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&h=250&fit=crop',
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl mb-2">Explore Universities</h1>
            <p className="text-blue-100">
              Discover the best universities in Pakistan and find your perfect match
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>All Cities</option>
                <option>Islamabad</option>
                <option>Lahore</option>
                <option>Karachi</option>
                <option>Peshawar</option>
              </select>
              <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>All Types</option>
                <option>Public</option>
                <option>Private</option>
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((university, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="relative h-40 overflow-hidden flex-shrink-0">
                  <img
                    src={university.image}
                    alt={university.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Button
                      size="icon"
                      className={`rounded-full ${
                        university.saved
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-white/90 hover:bg-white text-slate-700'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${university.saved ? 'fill-white' : ''}`} />
                    </Button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm">
                      {university.type}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="mb-2 line-clamp-2 min-h-[3.5rem]">{university.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{university.location}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm">{university.rating}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>{university.programs} Programs</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>{university.students}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all mt-auto">
                    View Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}