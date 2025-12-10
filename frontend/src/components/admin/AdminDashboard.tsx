import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, 
  GraduationCap, 
  MessageSquare, 
  FileText, 
  Settings,
  LogOut,
  BarChart3,
  TrendingUp,
  Menu,
  X,
  Shield,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import api from '../../services/api';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';
import { AdminStudentsPage } from './AdminStudentsPage';
import { AdminUniversitiesPage } from './AdminUniversitiesPage';
import { AdminCommunityPage } from './AdminCommunityPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { AdminMockTestPage } from './AdminMockTestPage';

export function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Load saved section from localStorage or default to 'overview'
  const [currentSection, setCurrentSection] = useState(() => {
    const saved = localStorage.getItem('adminCurrentSection');
    return saved || 'overview';
  });
  const [stats, setStats] = useState([
    {
      label: 'Total Students',
      value: '0',
      change: '+0.0%',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Universities Listed',
      value: '0',
      change: '+0.0%',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Community Posts',
      value: '0',
      change: '+0.0%',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Assessments Taken',
      value: '0',
      change: '+0.0%',
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
    },
  ]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        const data = response.data.stats;
        setStats([
          {
            label: 'Total Students',
            value: data.users.students.toLocaleString(),
            change: `${data.changes.students >= 0 ? '+' : ''}${data.changes.students}%`,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
          },
          {
            label: 'Universities Listed',
            value: data.universities.toLocaleString(),
            change: `${data.changes.universities >= 0 ? '+' : ''}${data.changes.universities}%`,
            icon: GraduationCap,
            color: 'from-purple-500 to-purple-600',
          },
          {
            label: 'Community Posts',
            value: data.posts.toLocaleString(),
            change: `${data.changes.posts >= 0 ? '+' : ''}${data.changes.posts}%`,
            icon: MessageSquare,
            color: 'from-green-500 to-green-600',
          },
          {
            label: 'Assessments Taken',
            value: data.assessments.toLocaleString(),
            change: `${data.changes.assessments >= 0 ? '+' : ''}${data.changes.assessments}%`,
            icon: FileText,
            color: 'from-amber-500 to-amber-600',
          },
        ]);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await api.get('/admin/recent-activities');
      if (response.data.success) {
        setRecentActivities(response.data.activities);
      }
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecentActivities()]);
      setLoading(false);
    };
    loadData();

    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Save section to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('adminCurrentSection', currentSection);
  }, [currentSection]);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'universities', label: 'Universities', icon: GraduationCap },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white shadow-lg sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <img src={manzilLogo} alt="Manzil Logo" className="w-20 h-20" />
              <div>
                <h1 className="text-xl"><span className="font-bold">MANZIL</span></h1>
                <p className="text-xs text-blue-200">Administrator Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Admin Portal</span>
              </div>
              <Button
                onClick={() => {
                  logout();
                  localStorage.removeItem('adminCurrentSection');
                  toast.success('Logged out successfully');
                  navigate('/');
                  // Scroll to top of landing page after navigation
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }, 100);
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ top: '80px' }}
        >
          <div className="p-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSection(item.id);
                  localStorage.setItem('adminCurrentSection', item.id);
                  setSidebarOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentSection === item.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {currentSection === 'overview' && (
              <>
                {/* Welcome Section */}
                <div className="mb-8">
                  <h2 className="text-3xl mb-2">Welcome back, Admin!</h2>
                  <p className="text-slate-600">
                    Here&rsquo;s what&rsquo;s happening with your platform today.
                  </p>
                </div>

                {/* Stats Grid */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-sm p-6 border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className={`flex items-center gap-1 text-sm ${parseFloat(stat.change.replace('%', '')) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className="w-4 h-4" />
                            <span>{stat.change}</span>
                          </div>
                        </div>
                        <div className="text-2xl mb-1">{stat.value}</div>
                        <div className="text-slate-600 text-sm">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col h-full"
                  >
                    <h3 className="text-xl mb-4">Recent Activity</h3>
                    <div className="space-y-4 flex-1">
                      {loading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                        </div>
                      ) : recentActivities.length > 0 ? (
                        recentActivities.slice(0, 5).map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                              {activity.user.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-medium">{activity.user}</span>{' '}
                                <span className="text-slate-600">{activity.action}</span>
                              </p>
                              <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-8">No recent activities</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col h-full"
                  >
                    <h3 className="text-xl mb-4">Quick Actions</h3>
                    <div className="space-y-3 flex-1">
                      <Button 
                        onClick={() => {
                          setCurrentSection('students');
                          localStorage.setItem('adminCurrentSection', 'students');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Manage Students
                      </Button>
                      <Button 
                        onClick={() => {
                          setCurrentSection('universities');
                          localStorage.setItem('adminCurrentSection', 'universities');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg"
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Manage Universities
                      </Button>
                      <Button 
                        onClick={() => {
                          setCurrentSection('community');
                          localStorage.setItem('adminCurrentSection', 'community');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Monitor Community
                      </Button>
                      <Button 
                        onClick={() => {
                          setCurrentSection('mocktest');
                          localStorage.setItem('adminCurrentSection', 'mocktest');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Create Mock Test
                      </Button>
                    </div>

                    <div className="mt-auto pt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <h4 className="text-sm mb-2">System Status</h4>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>All systems operational</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}

            {currentSection === 'students' && <AdminStudentsPage />}
            {currentSection === 'universities' && <AdminUniversitiesPage />}
            {currentSection === 'community' && <AdminCommunityPage />}
            {currentSection === 'mocktest' && <AdminMockTestPage onBack={() => setCurrentSection('overview')} />}
            {currentSection === 'settings' && <AdminSettingsPage />}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}