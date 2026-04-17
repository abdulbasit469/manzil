import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import type { LucideIcon } from 'lucide-react';
import {
  Lightbulb,
  User,
  CheckCircle2,
  ArrowRight,
  Info,
  X,
  Loader2,
  Activity,
  ChevronDown,
  GraduationCap,
  Palette,
  Briefcase,
  LineChart,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';

interface CareerAssessmentPageProps {
  onPageChange?: (page: string) => void;
}

/** When API omits relatedPrograms, match backend assessmentController.relatedProgramsMap */
const CAREER_PATH_FALLBACK: Record<string, string[]> = {
  Engineering: ['BS Electrical Engineering', 'BS Mechanical Engineering', 'BS Civil Engineering'],
  Medical: ['MBBS', 'Pharm-D', 'BS Medical Lab Sciences'],
  Business: ['BBA', 'MBA', 'BS Accounting'],
  'Computer Science': ['BS Computer Science', 'BS Software Engineering', 'BS Data Science'],
  Arts: ['BS Mass Communication', 'BS Psychology', 'BS Sociology'],
  Finance: ['BBA Finance', 'BS Economics', 'BS Accounting'],
  Teaching: ['B.Ed', 'BS Education', 'M.Ed'],
};

const CAREER_ICONS: Record<string, LucideIcon> = {
  Medical: Activity,
  Arts: Palette,
  Business: Briefcase,
  Engineering: Cpu,
  Finance: LineChart,
  Teaching: BookOpen,
  'Computer Science': Cpu,
};

function careerPathsFor(rec: { field: string; relatedPrograms?: string[] }): string[] {
  const fromApi = rec.relatedPrograms?.filter(Boolean) ?? [];
  if (fromApi.length) return fromApi;
  return CAREER_PATH_FALLBACK[rec.field] ?? [];
}

export function CareerAssessmentPage({ onPageChange }: CareerAssessmentPageProps) {
  const [expandedCareerIndex, setExpandedCareerIndex] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState({
    personality: false,
    aptitude: false,
    interest: false,
    allCompleted: false
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [mbtiType, setMbtiType] = useState<string | null>(null);
  const [brainDominance, setBrainDominance] = useState<string | null>(null);
  const [brainCompleted, setBrainCompleted] = useState(false);
  const [interestTopDimensions, setInterestTopDimensions] = useState<string[] | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const assessments = [
    {
      title: 'Personality Insights',
      subtitle: 'MBTI Test',
      description: 'Discover your personality type and how it shapes your career choices',
      icon: User,
      completed: assessmentStatus.personality,
      result: mbtiType || null,
      color: 'from-amber-500 to-amber-600',
      isMBTI: true,
      details: null
    },
    {
      title: 'Brain Hemisphere',
      subtitle: 'OHBDS',
      description: 'Discover whether you lean toward left-brain (logical) or right-brain (creative) thinking',
      icon: Activity,
      completed: brainCompleted,
      result: brainDominance
        ? brainDominance === 'Balanced'
          ? 'Balanced style'
          : `${brainDominance} brain lean`
        : null,
      color: 'from-teal-500 to-emerald-600',
      isBrain: true,
      details: null
    },
    {
      title: 'Career Path Profiler',
      subtitle: 'Interest Assessment',
      description: 'Identify your interests, motivations, and ideal career paths',
      icon: Lightbulb,
      completed: assessmentStatus.interest,
      result:
        (interestTopDimensions?.length ? interestTopDimensions.slice(0, 3).join(', ') : null) ||
        (assessmentStatus.interest ? 'Completed' : null),
      color: 'from-purple-500 to-pink-500',
      isInterest: true,
      details: null
    },
  ];

  const openDetailModal = async (assessment: any) => {
    // Brain Hemisphere: fetch static details from backend
    if (assessment.isBrain && brainDominance) {
      setLoadingDetails(true);
      setSelectedTest({ ...assessment, details: null });
      setShowDetailModal(true);
      try {
        const response = await api.get(`/assessment/brain/${encodeURIComponent(brainDominance)}/details`);
        const d = response.data.details;
        setSelectedTest({
          ...assessment,
          details: {
            title: d.title || `${brainDominance} Brain`,
            breakdown: null,
            description: Array.isArray(d.description) ? d.description : [d.description || '']
          }
        });
      } catch (error: any) {
        console.error('Error fetching brain details:', error);
        toast.error(error.response?.data?.message || 'Failed to load details.');
        setShowDetailModal(false);
      } finally {
        setLoadingDetails(false);
      }
      return;
    }
    // Career Path Profiler (Interest): fetch details from backend
    if (assessment.isInterest && assessmentStatus.interest) {
      setLoadingDetails(true);
      setSelectedTest({ ...assessment, details: null });
      setShowDetailModal(true);
      try {
        const response = await api.get('/assessment/interest/details');
        const desc = response.data?.description;
        setSelectedTest({
          ...assessment,
          details: {
            title: response.data?.title || 'Career Path Profiler – Your Interests',
            breakdown: null,
            description: Array.isArray(desc) ? desc : [desc || 'Your interest assessment is complete.']
          }
        });
      } catch (error: any) {
        console.error('Error fetching interest details:', error);
        setSelectedTest({
          ...assessment,
          details: {
            title: 'Career Path Profiler – Your Interests',
            breakdown: null,
            description: [
              'Your Career Path Profiler assessment is complete. Your results are used for career field suggestions.',
              'If details do not load, try refreshing the page and opening Details again.'
            ]
          }
        });
      } finally {
        setLoadingDetails(false);
      }
      return;
    }
    // If it's MBTI test, fetch details from Gemini API
    if (assessment.isMBTI && mbtiType) {
      setLoadingDetails(true);
      setSelectedTest({ ...assessment, details: null }); // Set test but no details yet
      setShowDetailModal(true);
      
      try {
        const response = await api.get(`/assessment/personality/mbti/${mbtiType}/details`);
        const details = response.data.details;
        
        // Parse the description - backend now returns an object with description array
        let description: string[] = [];
        if (details && details.description) {
          description = Array.isArray(details.description) 
            ? details.description 
            : [details.description];
        } else if (typeof details === 'string') {
          // Fallback: if backend returns string directly
          const lines = details.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && !trimmed.match(/^[A-Z]\s*->/);
          });
          description = lines.length > 0 ? lines : [details.trim()];
        } else if (Array.isArray(details)) {
          description = details;
        } else {
          description = [
            "Your personality type influences how you approach work, make decisions, and interact with others.",
            "Understanding your MBTI type can help you find careers that align with your natural preferences and strengths."
          ];
        }
        
        // Build breakdown from MBTI type
        const breakdown = [
          { letter: mbtiType[0], meaning: mbtiType[0] === 'E' ? 'Extrovert' : 'Introvert' },
          { letter: mbtiType[1], meaning: mbtiType[1] === 'S' ? 'Sensor' : 'Intuitive' },
          { letter: mbtiType[2], meaning: mbtiType[2] === 'T' ? 'Thinker' : 'Feeler' },
          { letter: mbtiType[3], meaning: mbtiType[3] === 'J' ? 'Judger' : 'Perceiver' },
        ];
        
        setSelectedTest({
          ...assessment,
          details: {
            title: `MBTI Type: ${mbtiType}`,
            breakdown: breakdown,
            description: description
          }
        });
      } catch (error: any) {
        console.error('Error fetching MBTI details:', error);
        toast.error(error.response?.data?.message || 'Failed to load MBTI details. Please try again.');
        setShowDetailModal(false);
      } finally {
        setLoadingDetails(false);
      }
    } else {
      // For other tests, use static details
      setSelectedTest(assessment);
      setShowDetailModal(true);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTest(null);
    setLoadingDetails(false);
  };

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  // Refresh data when component becomes visible (e.g., after returning from test)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAssessmentData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch assessment status
      const statusResponse = await api.get('/assessment/status');
      const status = statusResponse.data.status;
      setAssessmentStatus(status);
      setMbtiType(statusResponse.data.mbtiType || null);
      setBrainCompleted(!!statusResponse.data.brainCompleted);
      setBrainDominance(statusResponse.data.brainDominance || null);
      const fromServer = statusResponse.data.interestTopDimensions || null;
      const fromStorage = (() => {
        try {
          const s = sessionStorage.getItem('manzil_interestTopDimensions');
          if (s) {
            sessionStorage.removeItem('manzil_interestTopDimensions');
            const arr = JSON.parse(s);
            return Array.isArray(arr) ? arr : null;
          }
        } catch (_) {}
        return null;
      })();
      const dims = fromServer || fromStorage || null;
      setInterestTopDimensions(Array.isArray(dims) ? dims.slice(0, 3) : dims);

      // Fetch recommendations and degrees when all 3 tests are completed (rule-based aggregation, not AI)
      if (status.allCompleted) {
        let aggregatedResults: any = null;
        try {
          const resultsResponse = await api.get('/assessment/results');
          aggregatedResults = resultsResponse?.data?.aggregated ?? null;
        } catch (err: any) {
          console.error('Fetch recommendations error:', err?.response?.status, err?.message);
        }
        if (aggregatedResults) {
          if (aggregatedResults.topCareers) {
            const formattedRecommendations = (aggregatedResults.topCareers || [])
              .slice(0, 3)
              .map((career: any) => ({
                field: career.career || career.category || 'Unknown',
                match: career.score || 0,
                description:
                  career.description || `Based on your assessment results in ${career.category || 'this field'}`,
                relatedPrograms: Array.isArray(career.relatedPrograms) ? career.relatedPrograms : [],
              }));
            setRecommendations(formattedRecommendations);
          } else {
            setRecommendations([]);
          }
        } else {
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } catch (error: any) {
      console.error('Error fetching assessment data:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load assessment data');
      }
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl mb-2">Career Assessment</h1>
            <p className="text-blue-100">
              Discover your ideal career path through comprehensive assessments
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Assessment Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="mb-6">Available Assessments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessments.map((assessment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-5 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${assessment.color} flex items-center justify-center flex-shrink-0`}>
                      <assessment.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1">{assessment.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3 mb-0">{assessment.description}</p>
                    </div>
                  </div>
                  
                  {/* Result section - appears above button when completed */}
                  {assessment.completed && (
                    <div className="mt-2 mb-0">
                      <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-slate-600">Your Result</p>
                            <p className="text-sm text-green-700 line-clamp-1">{assessment.result}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => openDetailModal(assessment)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs"
                        >
                          <Info className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Button section - always at bottom */}
                  <div className={assessment.completed ? "mt-2" : "mt-auto"}>
                    {assessment.completed ? (
                      <Button
                        onClick={() => {
                          if (onPageChange) {
                            if (assessment.title === 'Personality Insights') onPageChange('personality-test');
                            else if (assessment.title === 'Brain Hemisphere') onPageChange('brain-test');
                            else if (assessment.title === 'Career Path Profiler') onPageChange('interest-test');
                          }
                        }}
                        className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f] text-white hover:shadow-lg transition-all border border-amber-500 py-2 text-sm"
                      >
                        Retake Assessment
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (assessment.title === 'Personality Insights' && onPageChange) {
                            onPageChange('personality-test');
                          } else if (assessment.title === 'Brain Hemisphere' && onPageChange) {
                            onPageChange('brain-test');
                          } else if (assessment.title === 'Career Path Profiler' && onPageChange) {
                            onPageChange('interest-test');
                          }
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all py-2 text-sm"
                      >
                        Assessment
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Career Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="mb-6">Career fields</h2>
          <Card className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : !assessmentStatus.allCompleted ? (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Complete All Assessments</h3>
                <p className="text-slate-600 mb-4">
                  Complete all 3 assessments (Personality, Brain Hemisphere, and Interest) to see your top career fields.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className={assessmentStatus.personality ? 'text-green-600' : ''}>
                    {assessmentStatus.personality ? '✓' : '○'} Personality
                  </span>
                  <span>•</span>
                  <span className={brainCompleted ? 'text-green-600' : ''}>
                    {brainCompleted ? '✓' : '○'} Brain Hemisphere
                  </span>
                  <span>•</span>
                  <span className={assessmentStatus.interest ? 'text-green-600' : ''}>
                    {assessmentStatus.interest ? '✓' : '○'} Interest
                  </span>
                </div>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No recommendations yet</h3>
                <p className="text-slate-600 mb-4">
                  Your top career fields will appear here once all 3 assessments are processed. Suggestions are rule-based
                  (weighted scores), not AI.
                </p>
                <Button
                  onClick={async () => {
                    setLoadingRecommendations(true);
                    try {
                      const res = await api.get('/assessment/results');
                      const agg = res?.data?.aggregated;
                      if (agg?.topCareers?.length) {
                        setRecommendations(
                          agg.topCareers.slice(0, 3).map((c: any) => ({
                            field: c.career || c.category,
                            match: c.score || 0,
                            description: c.description || '',
                            relatedPrograms: Array.isArray(c.relatedPrograms) ? c.relatedPrograms : [],
                          }))
                        );
                      }
                    } catch (e) {
                      console.error(e);
                      toast.error('Could not load recommendations');
                    } finally {
                      setLoadingRecommendations(false);
                    }
                  }}
                  disabled={loadingRecommendations}
                >
                  {loadingRecommendations && <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />}
                  {loadingRecommendations ? 'Loading…' : 'Refresh recommendations'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, index) => {
                  const open = expandedCareerIndex === index;
                  const paths = careerPathsFor(rec);
                  const Icon = CAREER_ICONS[rec.field] || GraduationCap;
                  return (
                    <div
                      key={`${rec.field}-${index}`}
                      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedCareerIndex(open ? null : index)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                          open
                            ? 'bg-sky-50/80 text-slate-900'
                            : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                        }`}
                        aria-expanded={open}
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                          <div className="min-w-0">
                            <span className="block font-semibold">{rec.field}</span>
                            <span className="mt-0.5 block text-xs font-normal text-slate-600 line-clamp-2">
                              {rec.description}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <div className="flex flex-col items-end leading-none">
                            <span className="text-xl font-bold text-amber-600">{rec.match}%</span>
                            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                              Match
                            </span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </div>
                      </button>
                      {open && (
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                          <p className="rounded-lg border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm font-medium text-slate-900">
                            Study paths under <span className="text-blue-800">{rec.field}</span> (based on your
                            answers)
                          </p>
                          {paths.length > 0 ? (
                            <ul className="mt-3 space-y-2">
                              {paths.map((p) => (
                                <li
                                  key={p}
                                  className="border-l-2 border-amber-400 pl-3 text-sm text-slate-800"
                                >
                                  {p}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-sm text-slate-600">
                              Explore degree programs and diplomas in this field on the Universities page; your match
                              reflects personality, aptitude, and interest together.
                            </p>
                          )}
                          <p className="mt-3 text-xs text-slate-500">
                            Confirm entry requirements, quotas, and deadlines on each university’s official prospectus —
                            this list is indicative, not admission advice.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-xl w-full shadow-2xl ${(selectedTest.isBrain || selectedTest.isInterest) ? 'max-w-md overflow-visible' : 'max-w-2xl max-h-[80vh] overflow-y-auto'}`}
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white p-6 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl">
                {loadingDetails ? 'Loading...' : (selectedTest.details?.title || selectedTest.title)}
              </h2>
              <button
                onClick={closeDetailModal}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : selectedTest.details ? (
                <>
                  {selectedTest.details.breakdown && !selectedTest.isBrain && (
                    <div className="mb-6">
                      <div className="space-y-3">
                        {selectedTest.details.breakdown.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
                              {item.letter}
                            </div>
                            <div>
                              <p className="text-slate-900 font-medium">{item.meaning}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedTest.details.description && selectedTest.details.description.length > 0 ? (
                      selectedTest.details.description.map((paragraph: string, index: number) => (
                        <p key={index} className="text-slate-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-slate-700 leading-relaxed">
                        {selectedTest.details.description || 'No description available.'}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <Button
                      onClick={closeDetailModal}
                      className="w-full bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white hover:shadow-lg"
                    >
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600">No details available.</p>
                  <Button
                    onClick={closeDetailModal}
                    className="mt-4 bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white hover:shadow-lg"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl mb-1 flex items-center gap-2">
                    <Info className="w-6 h-6" />
                    Notice
                  </h2>
                </div>
                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center py-4">
                <p className="text-slate-700 text-lg">
                  This will be implemented in the 8th semester.
                </p>
              </div>
              
              {/* Action Button */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => setShowComingSoonModal(false)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all"
                >
                  Understood
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}