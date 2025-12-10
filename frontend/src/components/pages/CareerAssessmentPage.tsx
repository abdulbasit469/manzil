import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, Lightbulb, User, CheckCircle2, ArrowRight, Info, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';

interface CareerAssessmentPageProps {
  onPageChange?: (page: string) => void;
}

export function CareerAssessmentPage({ onPageChange }: CareerAssessmentPageProps) {
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

  const assessments = [
    {
      title: 'Personality Insights',
      subtitle: 'MBTI Test',
      description: 'Discover your personality type and how it shapes your career choices',
      icon: User,
      completed: assessmentStatus.personality,
      result: mbtiType || null,
      color: 'from-amber-500 to-amber-600',
      isMBTI: true, // Flag to identify MBTI test
      details: null // Will be fetched dynamically
    },
    {
      title: 'Aptitude Test',
      subtitle: 'Aptitude Assessment',
      description: 'Measure your cognitive abilities and problem-solving skills',
      icon: Brain,
      completed: assessmentStatus.aptitude,
      result: assessmentStatus.aptitude ? 'Completed' : null,
      color: 'from-blue-500 to-cyan-500',
      details: assessmentStatus.aptitude ? {
        title: 'Aptitude Test: Completed',
        breakdown: null,
        description: [
          "Your aptitude test results help identify your cognitive strengths and problem-solving abilities.",
          "These results are combined with your personality and interest assessments to generate personalized career recommendations.",
        ]
      } : null
    },
    {
      title: 'Career Path Profiler',
      subtitle: 'Interest Assessment',
      description: 'Identify your interests, motivations, and ideal career paths',
      icon: Lightbulb,
      completed: assessmentStatus.interest,
      result: assessmentStatus.interest ? 'Completed' : null,
      color: 'from-purple-500 to-pink-500',
      details: assessmentStatus.interest ? {
        title: 'Interest Assessment: Completed',
        breakdown: null,
        description: [
          "Your interest assessment reveals what activities and fields you're naturally drawn to.",
          "This information helps match you with careers that align with your passions and motivations.",
        ]
      } : null
    },
  ];

  const openDetailModal = async (assessment: any) => {
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

      // Only fetch recommendations if all tests are completed
      if (status.allCompleted && statusResponse.data.hasAggregatedResults) {
        const resultsResponse = await api.get('/assessment/results');
        const aggregatedResults = resultsResponse.data.aggregated;
        
        if (aggregatedResults && aggregatedResults.topCareers) {
          // Transform backend format to frontend format
          const formattedRecommendations = aggregatedResults.topCareers.map((career: any) => ({
            field: career.career || career.category || 'Unknown',
            match: career.score || 0,
            description: career.description || `Based on your assessment results in ${career.category || 'this field'}`,
          }));
          setRecommendations(formattedRecommendations);
        } else {
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } catch (error: any) {
      console.error('Error fetching assessment data:', error);
      // Don't show error toast if it's just no assessment found
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
                            // Navigate to appropriate test page based on assessment type
                            if (assessment.title === 'Personality Insights') {
                              onPageChange('personality-test');
                            } else if (assessment.title === 'Aptitude Test') {
                              // Add aptitude test page navigation when implemented
                              onPageChange('aptitude-test');
                            } else if (assessment.title === 'Career Path Profiler') {
                              // Add interest test page navigation when implemented
                              onPageChange('interest-test');
                            }
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
                          if (assessment.title === 'Personality Insights') {
                            // Navigate to personality test for this one
                            if (onPageChange) {
                              onPageChange('personality-test');
                            }
                          } else {
                            // Show coming soon modal for Aptitude Test and Career Path Profiler
                            setShowComingSoonModal(true);
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
          <h2 className="mb-6">Your Career Recommendations</h2>
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
                  Complete all 3 assessments (Personality, Aptitude, and Interest) to receive personalized career recommendations.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className={assessmentStatus.personality ? 'text-green-600' : ''}>
                    {assessmentStatus.personality ? '✓' : '○'} Personality
                  </span>
                  <span>•</span>
                  <span className={assessmentStatus.aptitude ? 'text-green-600' : ''}>
                    {assessmentStatus.aptitude ? '✓' : '○'} Aptitude
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
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Recommendations Yet</h3>
                <p className="text-slate-600">
                  Your career recommendations will appear here once all assessments are processed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold">{rec.field}</h3>
                      <p className="text-sm text-slate-600">{rec.description}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-2xl font-bold text-amber-600">{rec.match}%</div>
                      <span className="text-xs text-slate-500">Match</span>
                    </div>
                  </div>
                ))}
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
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
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
                  {selectedTest.details.breakdown && (
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