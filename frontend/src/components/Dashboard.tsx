import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
const DashboardContent = lazy(() => import('./DashboardContent').then((m) => ({ default: m.DashboardContent })));
const UniversitiesPage = lazy(() => import('./pages/UniversitiesPage').then((m) => ({ default: m.UniversitiesPage })));
const CareerAssessmentPage = lazy(() => import('./pages/CareerAssessmentPage').then((m) => ({ default: m.CareerAssessmentPage })));
const PersonalityTestPage = lazy(() => import('./pages/PersonalityTestPage').then((m) => ({ default: m.PersonalityTestPage })));
const BrainHemisphereTestPage = lazy(() => import('./pages/BrainHemisphereTestPage').then((m) => ({ default: m.BrainHemisphereTestPage })));
const InterestTestPage = lazy(() => import('./pages/InterestTestPage').then((m) => ({ default: m.InterestTestPage })));
const MeritCalculatorPage = lazy(() => import('./pages/MeritCalculatorPage').then((m) => ({ default: m.MeritCalculatorPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage').then((m) => ({ default: m.PostDetailPage })));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage').then((m) => ({ default: m.CreatePostPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const MockTestPage = lazy(() => import('./pages/MockTestPage').then((m) => ({ default: m.MockTestPage })));
const MockTestRunPage = lazy(() => import('./pages/MockTestRunPage').then((m) => ({ default: m.MockTestRunPage })));
const DegreeScopePage = lazy(() => import('./pages/DegreeScopePage').then((m) => ({ default: m.DegreeScopePage })));
const DegreeScopeDetailPage = lazy(() => import('./pages/DegreeScopeDetailPage').then((m) => ({ default: m.DegreeScopeDetailPage })));
const UniversityDetailPage = lazy(() => import('./pages/UniversityDetailPage').then((m) => ({ default: m.UniversityDetailPage })));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage').then((m) => ({ default: m.ComparisonPage })));
import { TopNavbar } from './TopNavbar';
const Chatbot = lazy(() => import('./Chatbot').then((m) => ({ default: m.Chatbot })));
import { useAuth } from '../context/AuthContext';
import { Target, BookOpen, Users } from 'lucide-react';

/** Keys used in Dashboard switch (renderPage). */
const VALID_STUDENT_PAGES = new Set([
  'dashboard',
  'universities',
  'university-detail',
  'career',
  'personality-test',
  'brain-test',
  'interest-test',
  'compare',
  'merit',
  'degree-scope',
  'degree-scope-detail',
  'community',
  'community-post-detail',
  'community-new-post',
  'profile',
  'mocktest',
  'mocktest-run',
]);

const STUDENT_PAGE_KEY = 'studentCurrentPage';

function readInitialStudentPage(): string {
  if (typeof window === 'undefined') return 'dashboard';
  // Per-tab session only — avoids opening Compare (or any subpage) on every new visit / deploy tab.
  const saved = sessionStorage.getItem(STUDENT_PAGE_KEY);
  const uni = localStorage.getItem('studentSelectedUniversityId');
  if (saved === 'university-detail' && !uni) return 'universities';
  if (saved && VALID_STUDENT_PAGES.has(saved)) return saved;
  return 'dashboard';
}

export function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Drop legacy localStorage page (used before sessionStorage); it caused /dashboard to reopen Compare forever.
  useEffect(() => {
    try {
      localStorage.removeItem(STUDENT_PAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const [currentPage, setCurrentPage] = useState(readInitialStudentPage);
  
  // Load saved post ID from localStorage if viewing post detail
  const [selectedPostId, setSelectedPostId] = useState<string | null>(() => {
    const saved = localStorage.getItem('studentSelectedPostId');
    return saved || null;
  });
  const [selectedDegreeScopeId, setSelectedDegreeScopeId] = useState<string | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(() => {
    return localStorage.getItem('studentSelectedUniversityId') || null;
  });

  const [mockRunSession, setMockRunSession] = useState<{ name: string; color: string } | null>(() => {
    try {
      const raw = localStorage.getItem('studentMockRunSession');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { name?: string; color?: string; gradient?: string };
      const colorVal = parsed?.color || parsed?.gradient; // handle old stored sessions
      if (parsed?.name && colorVal) return { name: parsed.name, color: colorVal };
    } catch {
      /* ignore */
    }
    return null;
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

  const handlePageChange = (page: string, postId?: string) => {
    if (page !== 'mocktest-run') {
      setMockRunSession(null);
      localStorage.removeItem('studentMockRunSession');
    }
    setCurrentPage(page);
    setSidebarOpen(false);
    sessionStorage.setItem(STUDENT_PAGE_KEY, page);
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

  const handleNavigateToPost = (postId: string) => {
    handlePageChange('community-post-detail', postId);
  };

  const handleNavigateToNewPost = () => {
    handlePageChange('community-new-post');
  };

  const handleBackToCommunity = () => {
    handlePageChange('community');
  };

  const handleBackToDegreeScope = () => {
    handlePageChange('degree-scope');
  };

  const handleBackToUniversities = () => {
    handlePageChange('universities');
  };

  const startMockTestRun = (config: { name: string; color: string }) => {
    setMockRunSession(config);
    localStorage.setItem('studentMockRunSession', JSON.stringify(config));
    handlePageChange('mocktest-run');
  };

  const handleBackFromMockRun = () => {
    handlePageChange('mocktest');
  };

  useEffect(() => {
    sessionStorage.setItem(STUDENT_PAGE_KEY, currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'mocktest-run' && !mockRunSession) {
      handlePageChange('mocktest');
    }
  }, [currentPage, mockRunSession]);

  useEffect(() => {
    if (currentPage !== 'mocktest-run' || !mockRunSession) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [currentPage, mockRunSession]);
  
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
        return <CareerAssessmentPage onPageChange={handlePageChange} />;
      case 'personality-test':
        return <PersonalityTestPage onPageChange={handlePageChange} />;
      case 'brain-test':
        return <BrainHemisphereTestPage onPageChange={handlePageChange} />;
      case 'interest-test':
        return <InterestTestPage onPageChange={handlePageChange} />;
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
              setTimeout(() => {
                handlePageChange('community');
              }, 100);
            }}
          />
        );
      case 'profile':
        return <ProfilePage onPageChange={handlePageChange} />;
      case 'mocktest':
        return <MockTestPage onStartPractice={startMockTestRun} />;
      case 'mocktest-run':
        return mockRunSession ? (
          <MockTestRunPage
            testName={mockRunSession.name}
            gradientClass={mockRunSession.color}
            onBack={handleBackFromMockRun}
          />
        ) : (
          <MockTestPage onStartPractice={startMockTestRun} />
        );
      default:
        return <DashboardContent sidebarOpen={sidebarOpen} onPageChange={handlePageChange} />;
    }
  };

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem(STUDENT_PAGE_KEY);
    try {
      localStorage.removeItem(STUDENT_PAGE_KEY);
    } catch {
      /* ignore */
    }
    localStorage.removeItem('studentSelectedPostId');
    localStorage.removeItem('studentSelectedUniversityId');
    localStorage.removeItem('studentMockRunSession');
    navigate('/');
    // Scroll to top of landing page after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
  };

  if (currentPage === 'mocktest-run' && mockRunSession) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
        <Suspense fallback={<div className="flex-1 bg-slate-100" />}>
          <MockTestRunPage
            testName={mockRunSession.name}
            gradientClass={mockRunSession.color}
            onBack={handleBackFromMockRun}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh max-h-dvh min-h-0 w-full max-w-full bg-slate-50 overflow-hidden">
      <TopNavbar
        onMenuClick={() => setSidebarOpen((o) => !o)}
        userName={user?.name || 'User'}
        onProfileClick={() => handlePageChange('profile')}
      />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-x-0 bottom-0 top-14 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
        <Sidebar
          isOpen={sidebarOpen}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
        />
        <main className="flex flex-1 min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden">
          <Suspense fallback={<div className="flex-1 bg-slate-50 min-h-[12rem]" />}>{renderPage()}</Suspense>
        </main>
      </div>
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </div>
  );
}