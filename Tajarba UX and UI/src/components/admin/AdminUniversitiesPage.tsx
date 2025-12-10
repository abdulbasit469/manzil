import { motion } from 'motion/react';
import { Search, Filter, Plus, Edit, Trash2, MapPin, Globe, Users } from 'lucide-react';
import { Button } from '../ui/button';

export function AdminUniversitiesPage() {
  const universities = [
    {
      id: 1,
      name: 'National University of Sciences and Technology (NUST)',
      shortName: 'NUST',
      location: 'Islamabad',
      type: 'Public',
      students: 15240,
      programs: 45,
      website: 'www.nust.edu.pk',
      rank: 1,
    },
    {
      id: 2,
      name: 'Lahore University of Management Sciences (LUMS)',
      shortName: 'LUMS',
      location: 'Lahore',
      type: 'Private',
      students: 5420,
      programs: 28,
      website: 'www.lums.edu.pk',
      rank: 2,
    },
    {
      id: 3,
      name: 'Institute of Business Administration',
      shortName: 'IBA',
      location: 'Karachi',
      type: 'Public',
      students: 4830,
      programs: 22,
      website: 'www.iba.edu.pk',
      rank: 3,
    },
    {
      id: 4,
      name: 'FAST National University of Computer and Emerging Sciences',
      shortName: 'FAST',
      location: 'Islamabad',
      type: 'Private',
      students: 12680,
      programs: 35,
      website: 'www.nu.edu.pk',
      rank: 4,
    },
    {
      id: 5,
      name: 'Ghulam Ishaq Khan Institute of Engineering Sciences and Technology',
      shortName: 'GIKI',
      location: 'Topi, KPK',
      type: 'Private',
      students: 2150,
      programs: 18,
      website: 'www.giki.edu.pk',
      rank: 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl mb-2">University Management</h2>
          <p className="text-slate-600">Manage university listings and information</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Add New University
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-purple-600 mb-2">523</div>
          <div className="text-slate-600 text-sm">Total Universities</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-blue-600 mb-2">248</div>
          <div className="text-slate-600 text-sm">Public Universities</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-amber-600 mb-2">275</div>
          <div className="text-slate-600 text-sm">Private Universities</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-green-600 mb-2">1,847</div>
          <div className="text-slate-600 text-sm">Total Programs</div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search universities by name, location, or type..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Universities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {universities.map((university, index) => (
          <motion.div
            key={university.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-lg">
                    {university.shortName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">{university.shortName}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          university.type === 'Public'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {university.type}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">
                        Rank #{university.rank}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">{university.name}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{university.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{university.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="text-xs">{university.website}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">{university.programs}</span> programs
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button className="bg-white border border-red-300 text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing <span className="font-medium">1-5</span> of <span className="font-medium">523</span> universities
        </div>
        <div className="flex gap-2">
          <Button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
            Previous
          </Button>
          <Button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
