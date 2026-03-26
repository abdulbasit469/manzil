import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { UniversitiesPage } from './pages/UniversitiesPage';
import { CareerAssessmentPage } from './pages/CareerAssessmentPage';
import { PersonalityTestPage } from './pages/PersonalityTestPage';
import { BrainHemisphereTestPage } from './pages/BrainHemisphereTestPage';
import { InterestTestPage } from './pages/InterestTestPage';
import { MeritCalculatorPage } from './pages/MeritCalculatorPage';
import { CommunityPage } from './pages/CommunityPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { ProfilePage } from './pages/ProfilePage';
import { MockTestPage } from './pages/MockTestPage';
import { DegreeScopePage } from './pages/DegreeScopePage';
import { DegreeScopeDetailPage } from './pages/DegreeScopeDetailPage';
import { UniversityDetailPage } from './pages/UniversityDetailPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { TopNavbar } from './TopNavbar';
import { Chatbot } from './Chatbot';
import { useAuth } from '../context/AuthContext';
import { Target, BookOpen, Users } from 'lucide-react';

export function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Load saved page from localStorage or default to 'dashboard'
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('studentCurrentPage');
    const uni = localStorage.getItem('studentSelectedUniversityId');
    if (saved === 'university-detail' && !uni) return 'universities';
    return saved || 'dashboard';
  });
  
  // Load saved post ID from localStorage if viewing post detail
  const [selectedPostId, setSelectedPostId] = useState<string | null>(() => {
    const saved = localStorage.getItem('studentSelectedPostId');
    return saved || null;
  });
  const [selectedDegreeScopeId, setSelectedDegreeScopeId] = useState<string | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(() => {
    return localStorage.getItem('studentSelectedUniversityId') || null;
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
    handlePageChange('community-post-detail', postId);
  };

  const handleNavigateToNewPost = () => {
    handlePageChange('community-new-post');
  };

  const handleBackToCommunity = () => {
    setCurrentPage('community');
    setSelectedPostId(null);
    setSelectedUniversityId(null);
    localStorage.setItem('studentCurrentPage', 'community');
    localStorage.removeItem('studentSelectedPostId');
    localStorage.removeItem('studentSelectedUniversityId');
  };

  const handlePageChange = (page: string, postId?: string) => {
    setCurrentPage(page);
    localStorage.setItem('studentCurrentPage', page);
    if (page === 'degree-scope-detail') {
      setSelectedDegreeScopeId(postId || null);
      setSelectedPostId(null);
      setSelectedUniversityId(null);
      localStorage.removeItem('studentSelectedPostId');
      localStorage.removeItem('studentSelectedUniversityId');
    } else if (page === 'university-detail' && postId) {
      setSelectedUniversityId(postId);
      setSelectedDegreeScopeId(null);
      setSelectedPostId(null);
      localStorage.removeItem('studentSelectedPostId');
      localStorage.setItem('studentSelectedUniversityId', postId);
    } else if (page === 'community-post-detail' && postId) {
      setSelectedPostId(postId);
      setSelectedDegreeScopeId(null);
      setSelectedUniversityId(null);
      localStorage.removeItem('studentSelectedUniversityId');
      localStorage.setItem('studentSelectedPostId', postId);
    } else {
      setSelectedDegreeScopeId(null);
      setSelectedUniversityId(null);
      localStorage.removeItem('studentSelectedUniversityId');
      if (page !== 'community-post-detail' && page !== 'community-new-post') {
        setSelectedPostId(null);
        localStorage.removeItem('studentSelectedPostId');
      }
    }
  };

  const handleBackToDegreeScope = () => {
    setCurrentPage('degree-scope');
    setSelectedDegreeScopeId(null);
    localStorage.setItem('studentCurrentPage', 'degree-scope');
  };

  const handleBackToUniversities = () => {
    setCurrentPage('universities');
    setSelectedUniversityId(null);
    localStorage.setItem('studentCurrentPage', 'universities');
    localStorage.removeItem('studentSelectedUniversityId');
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

  useEffect(() => {
    if (selectedUniversityId) {
      localStorage.setItem('studentSelectedUniversityId', selectedUniversityId);
    } else {
      localStorage.removeItem('studentSelectedUniversityId');
    }
  }, [selectedUniversityId]);

  const renderPage = () => {
    switch (currentPage) {
      case 'universities':
        return (
          <UniversitiesPage
            onOpenUniversityDetail={(id) => handlePageChange('university-detail', id)}
          />
        );
      case 'university-detail':
        return (
          <UniversityDetailPage universityId={selectedUniversityId} onBack={handleBackToUniversities} />
        );
      case 'career':
        return <CareerAssessmentPage onPageChange={setCurrentPage} />;
      case 'personality-test':
        return <PersonalityTestPage onPageChange={setCurrentPage} />;
      case 'brain-test':
        return <BrainHemisphereTestPage onPageChange={setCurrentPage} />;
      case 'interest-test':
        return <InterestTestPage onPageChange={setCurrentPage} />;
      case 'compare':
        return <ComparisonPage />;
      case 'merit':
        return <MeritCalculatorPage />;
      case 'degree-scope':
        return <DegreeScopePage onPageChange={handlePageChange} />;
      case 'degree-scope-detail':
        return (
          <DegreeScopeDetailPage
            degreeScopeId={selectedDegreeScopeId}
            onBack={handleBackToDegreeScope}
            onPageChange={handlePageChange}
          />
        );
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
        return <DashboardContent sidebarOpen={sidebarOpen} onPageChange={handlePageChange} />;
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('studentCurrentPage');
    localStorage.removeItem('studentSelectedPostId');
    localStorage.removeItem('studentSelectedUniversityId');
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
          onPageChange={handlePageChange}
          onLogout={handleLogout}
        />
        {renderPage()}
      </div>
      <Chatbot />
    </div>
  );
}