import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { UniversitiesPage } from './pages/UniversitiesPage';
import { CareerAssessmentPage } from './pages/CareerAssessmentPage';
import { PersonalityTestPage } from './pages/PersonalityTestPage';
import { MeritCalculatorPage } from './pages/MeritCalculatorPage';
import { CommunityPage } from './pages/CommunityPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { ProfilePage } from './pages/ProfilePage';
import { MockTestPage } from './pages/MockTestPage';
import { TopNavbar } from './TopNavbar';
import { useAuth } from '../context/AuthContext';
import { Target, BookOpen, Users } from 'lucide-react';

export function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Load saved page from localStorage or default to 'dashboard'
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('studentCurrentPage');
    return saved || 'dashboard';
  });
  
  // Load saved post ID from localStorage if viewing post detail
  const [selectedPostId, setSelectedPostId] = useState<string | null>(() => {
    const saved = localStorage.getItem('studentSelectedPostId');
    return saved || null;
  });

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

  const handleNavigateToPost = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentPage('community-post-detail');
    localStorage.setItem('studentSelectedPostId', postId);
    localStorage.setItem('studentCurrentPage', 'community-post-detail');
  };

  const handleNavigateToNewPost = () => {
    setCurrentPage('community-new-post');
    localStorage.setItem('studentCurrentPage', 'community-new-post');
  };

  const handleBackToCommunity = () => {
    setCurrentPage('community');
    setSelectedPostId(null);
    localStorage.setItem('studentCurrentPage', 'community');
    localStorage.removeItem('studentSelectedPostId');
    // Trigger refetch by changing key or using a refetch callback
  };

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studentCurrentPage', currentPage);
  }, [currentPage]);
  
  // Save selected post ID to localStorage whenever it changes
  useEffect(() => {
    if (selectedPostId) {
      localStorage.setItem('studentSelectedPostId', selectedPostId);
    } else {
      localStorage.removeItem('studentSelectedPostId');
    }
  }, [selectedPostId]);


  const renderPage = () => {
    switch (currentPage) {
      case 'universities':
        return <UniversitiesPage />;
      case 'career':
        return <CareerAssessmentPage onPageChange={setCurrentPage} />;
      case 'personality-test':
        return <PersonalityTestPage onPageChange={setCurrentPage} />;
      case 'merit':
        return <MeritCalculatorPage />;
      case 'community':
        return (
          <CommunityPage
            onNavigateToPost={handleNavigateToPost}
            onNavigateToNewPost={handleNavigateToNewPost}
          />
        );
      case 'community-post-detail':
        return <PostDetailPage postId={selectedPostId || ''} onBack={handleBackToCommunity} />;
      case 'community-new-post':
        return (
          <CreatePostPage
            onBack={handleBackToCommunity}
            onPostCreated={() => {
              handleBackToCommunity();
              // Force refresh of community page
              setTimeout(() => {
                setCurrentPage('community');
              }, 100);
            }}
          />
        );
      case 'profile':
        return <ProfilePage onPageChange={setCurrentPage} />;
      case 'mocktest':
        return <MockTestPage />;
      default:
        return (
          <DashboardContent 
            sidebarOpen={sidebarOpen} 
            onPageChange={(page, postId) => {
              setCurrentPage(page);
              localStorage.setItem('studentCurrentPage', page);
              if (postId) {
                setSelectedPostId(postId);
                localStorage.setItem('studentSelectedPostId', postId);
              }
            }} 
          />
        );
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('studentCurrentPage');
    localStorage.removeItem('studentSelectedPostId');
    navigate('/');
    // Scroll to top of landing page after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopNavbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        userName={user?.name || 'User'}
        onProfileClick={() => {
          setCurrentPage('profile');
          localStorage.setItem('studentCurrentPage', 'profile');
        }}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            localStorage.setItem('studentCurrentPage', page);
            // Clear post ID when navigating to a different page
            if (page !== 'community-post-detail' && page !== 'community-new-post') {
              setSelectedPostId(null);
              localStorage.removeItem('studentSelectedPostId');
            }
          }}
          onLogout={handleLogout}
        />
        {renderPage()}
      </div>
    </div>
  );
}