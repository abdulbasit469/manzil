import { useState } from 'react';
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
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';
import { AdminStudentsPage } from './AdminStudentsPage';
import { AdminUniversitiesPage } from './AdminUniversitiesPage';
import { AdminCommunityPage } from './AdminCommunityPage';
import { AdminSettingsPage } from './AdminSettingsPage';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('overview');

  const stats = [
    {
      label: 'Total Students',
      value: '10,247',
      change: '+12.5%',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Universities Listed',
      value: '523',
      change: '+8.2%',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Community Posts',
      value: '3,842',
      change: '+23.1%',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Mock Tests Taken',
      value: '15,634',
      change: '+18.7%',
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const recentActivities = [
    { user: 'Ahmed Khan', action: 'completed NAT mock test', time: '5 mins ago' },
    { user: 'Ayesha Ali', action: 'joined Community Forum', time: '12 mins ago' },
    { user: 'Hassan Ahmed', action: 'saved NUST to favorites', time: '23 mins ago' },
    { user: 'Fatima Malik', action: 'completed Career Assessment', time: '45 mins ago' },
    { user: 'Ali Raza', action: 'started ECAT preparation', time: '1 hour ago' },
  ];

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
                <h1 className="text-xl"><span className="font-bold">MANZIL</span> Admin</h1>
                <p className="text-xs text-blue-200">Administrator Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Admin Portal</span>
              </div>
              <Button
                onClick={onLogout}
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
                  setSidebarOpen(false);
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
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>{stat.change}</span>
                        </div>
                      </div>
                      <div className="text-2xl mb-1">{stat.value}</div>
                      <div className="text-slate-600 text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-sm p-6 border border-slate-200"
                  >
                    <h3 className="text-xl mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
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
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-sm p-6 border border-slate-200"
                  >
                    <h3 className="text-xl mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setCurrentSection('students')}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Manage Students
                      </Button>
                      <Button 
                        onClick={() => setCurrentSection('universities')}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg"
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Add University
                      </Button>
                      <Button 
                        onClick={() => setCurrentSection('community')}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Monitor Community
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg">
                        <FileText className="w-4 h-4 mr-2" />
                        Create Mock Test
                      </Button>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
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