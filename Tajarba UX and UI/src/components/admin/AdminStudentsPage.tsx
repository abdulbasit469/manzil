import { motion } from 'motion/react';
import { Search, Filter, UserPlus, MoreVertical, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '../ui/button';

export function AdminStudentsPage() {
  const students = [
    {
      id: 1,
      name: 'Ahmed Khan',
      email: 'ahmed.khan@email.com',
      phone: '+92 300 1234567',
      university: 'NUST',
      joinedDate: '2024-01-15',
      status: 'Active',
      avatar: 'AK',
    },
    {
      id: 2,
      name: 'Ayesha Ali',
      email: 'ayesha.ali@email.com',
      phone: '+92 301 2345678',
      university: 'LUMS',
      joinedDate: '2024-02-20',
      status: 'Active',
      avatar: 'AA',
    },
    {
      id: 3,
      name: 'Hassan Ahmed',
      email: 'hassan.ahmed@email.com',
      phone: '+92 302 3456789',
      university: 'IBA',
      joinedDate: '2024-03-10',
      status: 'Active',
      avatar: 'HA',
    },
    {
      id: 4,
      name: 'Fatima Malik',
      email: 'fatima.malik@email.com',
      phone: '+92 303 4567890',
      university: 'FAST',
      joinedDate: '2024-04-05',
      status: 'Inactive',
      avatar: 'FM',
    },
    {
      id: 5,
      name: 'Ali Raza',
      email: 'ali.raza@email.com',
      phone: '+92 304 5678901',
      university: 'GIKI',
      joinedDate: '2024-05-12',
      status: 'Active',
      avatar: 'AR',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl mb-2">Student Management</h2>
          <p className="text-slate-600">Manage and monitor all registered students</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-blue-600 mb-2">10,247</div>
          <div className="text-slate-600 text-sm">Total Students</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-green-600 mb-2">8,932</div>
          <div className="text-slate-600 text-sm">Active Students</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-amber-600 mb-2">1,315</div>
          <div className="text-slate-600 text-sm">New This Month</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-purple-600 mb-2">87%</div>
          <div className="text-slate-600 text-sm">Engagement Rate</div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students by name, email, or university..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Student</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">University</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Joined Date</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Status</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                        {student.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-slate-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-xs">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-xs">{student.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {student.university}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {student.joinedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        student.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing <span className="font-medium">1-5</span> of <span className="font-medium">10,247</span> students
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
      </motion.div>
    </div>
  );
}
