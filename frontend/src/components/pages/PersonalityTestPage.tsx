import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

interface PersonalityTestPageProps {
  onPageChange?: (page: string) => void;
}

interface Question {
  id: number;
  question: string;
  mbtiDimension: string;
  dimensionType: string;
}

const QUESTIONS_PER_PAGE = 8;

export function PersonalityTestPage({ onPageChange }: PersonalityTestPageProps = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({}); // Store answer as number (0-6)
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentPageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    // Scroll both window and container
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also scroll the main container if it exists
    const container = document.querySelector('.flex-1.overflow-auto');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Also try scrolling the parent scrollable container
    const scrollableParent = document.querySelector('.overflow-auto');
    if (scrollableParent) {
      scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assessment/personality/questions');
      setQuestions(response.data.questions || []);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions. Please try again.');
      // Navigate back to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
  const isLastPage = currentPage === totalPages - 1;

  const handleNext = () => {
    // Check if all questions on current page are answered
    const allAnswered = currentPageQuestions.every(q => answers[q.id] !== undefined);
    
    if (!allAnswered) {
      toast.info('Please answer all questions on this page before continuing');
      return;
    }

    if (isLastPage) {
      handleSubmit();
    } else {
      setCurrentPage(currentPage + 1);
      // Scroll will be handled by useEffect when currentPage changes
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnswerChange = (questionId: number, value: number) => {
    // Use functional update to ensure we're working with latest state
    setAnswers(prev => {
      const newAnswers = { ...prev };
      newAnswers[questionId] = value;
      return newAnswers;
    });
  };

  // Convert answer number (0-4) to text format for backend
  // 0 = Strongly Agree, 1 = Agree, 2 = Neutral, 3 = Disagree, 4 = Strongly Disagree
  const getAnswerText = (value: number): string => {
    const answerMap = {
      0: 'Strongly Agree',
      1: 'Agree',
      2: 'Neutral',
      3: 'Disagree',
      4: 'Strongly Disagree'
    };
    return answerMap[value as keyof typeof answerMap] || 'Neutral';
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Convert answers to array format with text values
      const responses = Object.entries(answers).map(([questionId, answerValue]) => ({
        questionId: parseInt(questionId),
        answer: getAnswerText(answerValue as number)
      }));

      const response = await api.post('/assessment/personality/submit', { responses });
      
      toast.success('Assessment submitted successfully!');
      
      // Navigate to career assessment page after a short delay
      setTimeout(() => {
        if (onPageChange) {
          onPageChange('career');
        } else {
          // Fallback: redirect to dashboard and then to career page
          window.location.href = '/dashboard';
        }
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-8">
        <Card className="p-8 max-w-md text-center">
          <p className="text-slate-600 mb-4">No questions available</p>
          <Button onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = '/dashboard';
            }
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
        </Card>
      </div>
    );
  }

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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-4xl mb-2 font-bold">Personality Insights (MBTI)</h1>
                <p className="text-sm md:text-base text-blue-100">
                  Discover your personality type through comprehensive assessment
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm md:text-base text-blue-100">
                  Step {currentPage + 1} of {totalPages}
                </p>
                <div className="mt-2 w-32 md:w-48">
                  <Progress value={progress} className="h-2 bg-white/20" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 md:space-y-12"
          >
            {currentPageQuestions.map((question, questionIndex) => {
              const answerValue = answers[question.id];
              const isAnswered = answerValue !== undefined;
              const isLastQuestionOnPage = questionIndex === currentPageQuestions.length - 1;
              
              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: questionIndex * 0.1 }}
                  className={`py-6 md:py-8 ${isLastQuestionOnPage ? 'mb-8 md:mb-12' : ''}`}
                >
                  {/* Question Text */}
                  <h2 className="text-lg md:text-xl font-medium text-slate-800 mb-6 md:mb-8 text-center">
                    {question.question}
                  </h2>

                  {/* Answer Scale */}
                  <div className="flex items-center justify-center gap-2 md:gap-4 px-4">
                    {/* Agree Label */}
                    <span className="text-sm md:text-base text-slate-600 font-medium min-w-[60px] text-right">
                      Agree
                    </span>

                    {/* Circles - 5 total with size pattern: large, medium, small, medium, large */}
                    <div className="flex items-center gap-2 md:gap-3">
                      {[0, 1, 2, 3, 4].map((value) => {
                        // Size pattern: large (0,4), medium (1,3), small (2)
                        const sizes = [44, 32, 24, 32, 44]; // px sizes
                        const size = sizes[value];
                        const isSelected = answerValue === value;
                        const isAgreeSide = value <= 1; // First two circles (0,1) are Agree side
                        const isDisagreeSide = value >= 3; // Last two circles (3,4) are Disagree side
                        const isNeutral = value === 2; // Center circle (2) is Neutral

                        let circleColor = 'border-slate-400';
                        let fillColor = 'bg-transparent';
                        
                        if (isSelected) {
                          if (isAgreeSide) {
                            circleColor = 'border-green-500';
                            fillColor = 'bg-green-500';
                          } else if (isDisagreeSide) {
                            circleColor = 'border-purple-500';
                            fillColor = 'bg-purple-500';
                          } else {
                            // Center circle - grey fill and amber/yellow border when selected
                            circleColor = 'border-amber-500';
                            fillColor = 'bg-slate-600'; // Darker grey for better visibility
                          }
                        } else {
                          if (isAgreeSide) {
                            circleColor = 'border-green-400';
                          } else if (isDisagreeSide) {
                            circleColor = 'border-purple-400';
                          } else {
                            // Center circle - grey border when not selected
                            circleColor = 'border-slate-400';
                          }
                        }

                        return (
                          <button
                            key={value}
                            onClick={() => handleAnswerChange(question.id, value)}
                            className={`
                              rounded-full border-2 transition-all duration-200 relative
                              ${circleColor}
                              ${isSelected ? fillColor : 'bg-transparent'}
                              hover:scale-105 active:scale-95
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                              group
                            `}
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                            }}
                            aria-label={`Select option ${value}`}
                          >
                            {/* Hover ring effect - subtle grey/black ring that appears on hover */}
                            <span 
                              className="absolute inset-0 rounded-full border-2 border-slate-700 opacity-0 group-hover:opacity-40 transition-opacity duration-200 pointer-events-none"
                              style={{
                                width: `${size + 6}px`,
                                height: `${size + 6}px`,
                                top: '-3px',
                                left: '-3px',
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Disagree Label */}
                    <span className="text-sm md:text-base text-slate-600 font-medium min-w-[70px] text-left">
                      Disagree
                    </span>
                  </div>

                  {/* Next Step Button - Only show after last question on page */}
                  {isLastQuestionOnPage && (
                    <div className="flex justify-end mt-8 md:mt-10">
                      <Button
                        onClick={handleNext}
                        disabled={submitting}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 md:px-8"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : isLastPage ? (
                          'Submit Assessment'
                        ) : (
                          'Next Step'
                        )}
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

