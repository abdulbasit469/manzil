import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { UniversitiesPage } from './pages/UniversitiesPage';
import { CareerAssessmentPage } from './pages/CareerAssessmentPage';
import { MeritCalculatorPage } from './pages/MeritCalculatorPage';
import { CommunityPage } from './pages/CommunityPage';
import { ProfilePage } from './pages/ProfilePage';
import { MockTestPage } from './pages/MockTestPage';
import { TopNavbar } from './TopNavbar';
import { useAuth } from '../context/AuthContext';
import { Target, BookOpen, Users } from 'lucide-react';

export function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const actionCards = [
    {
      title: 'Career Assessment',
      description: 'Take a comprehensive assessment to discover your ideal career path',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Mock Test',
      description: 'Practice with realistic tests to prepare for your exams',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Community Forum',
      description: 'Connect with peers and mentors in our community',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'universities':
        return <UniversitiesPage />;
      case 'career':
        return <CareerAssessmentPage />;
      case 'merit':
        return <MeritCalculatorPage />;
      case 'community':
        return <CommunityPage />;
      case 'profile':
        return <ProfilePage onPageChange={setCurrentPage} />;
      case 'mocktest':
        return <MockTestPage />;
      default:
        return <DashboardContent sidebarOpen={sidebarOpen} actionCards={actionCards} onPageChange={setCurrentPage} />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userName={user?.name || 'User'} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
        />
        {renderPage()}
      </div>
    </div>
  );
}