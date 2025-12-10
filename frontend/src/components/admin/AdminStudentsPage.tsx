import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Mail, Phone, Calendar, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  role: string;
  profilePicture?: string;
}

export function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    engagementRate: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
          role: 'student'
        }
      });
      if (response.data.success) {
        setStudents(response.data.users || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
        
        setStats(prev => ({
          ...prev,
          total: response.data.total || 0,
          active: response.data.total || 0 // Assuming all are active for now
        }));
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(prev => ({
          ...prev,
          newThisMonth: response.data.stats.users.newThisMonth || 0,
          engagementRate: response.data.stats.users.engagementRate || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchStudents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [page]);

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStudents();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [page, searchQuery]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${studentId}`);
      toast.success('Student deleted successfully');
      // Refresh both students list and stats
      fetchStudents();
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl mb-2">Student Management</h2>
          <p className="text-slate-600">Manage and monitor all registered students</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-blue-600 mb-2">{stats.total.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">Total Students</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-green-600 mb-2">{stats.active.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">Active Students</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-amber-600 mb-2">{stats.newThisMonth.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">New This Month</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-purple-600 mb-2">{stats.engagementRate}%</div>
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
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                <th className="text-left px-6 py-4 text-sm text-slate-600">Joined Date</th>
                <th className="text-left px-6 py-4 text-sm text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.profilePicture ? (
                          <img 
                            src={student.profilePicture} 
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white ${student.profilePicture ? 'hidden' : ''}`}
                        >
                          {getInitials(student.name)}
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
                        {student.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            <span className="text-xs">{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(student.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.name)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing <span className="font-medium">{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span> of <span className="font-medium">{total.toLocaleString()}</span> students
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <Button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
