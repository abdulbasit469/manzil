import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

interface BrainHemisphereTestPageProps {
  onPageChange?: (page: string) => void;
}

interface Question {
  id: number;
  question: string;
  hemisphere: string;
}

const QUESTIONS_PER_PAGE = 5;

export function BrainHemisphereTestPage({ onPageChange }: BrainHemisphereTestPageProps = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE) || 1;
  const currentPageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const container = document.querySelector('.flex-1.overflow-auto');
    if (container) (container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    const scrollableParent = document.querySelector('.overflow-auto');
    if (scrollableParent) (scrollableParent as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assessment/brain/questions');
      setQuestions(response.data.questions || []);
    } catch (error: any) {
      console.error('Error fetching brain questions:', error);
      toast.error('Failed to load questions. Please try again.');
      setTimeout(() => {
        if (onPageChange) onPageChange('career');
        else window.location.href = '/dashboard';
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
  const isLastPage = currentPage === totalPages - 1;

  const handleNext = () => {
    const allAnswered = currentPageQuestions.every(q => answers[q.id] !== undefined);
    if (!allAnswered) {
      toast.info('Please answer all questions on this page before continuing');
      return;
    }
    if (isLastPage) {
      handleSubmit();
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getAnswerText = (value: number): string => {
    const answerMap: Record<number, string> = {
      0: 'Strongly Agree',
      1: 'Agree',
      2: 'Neutral',
      3: 'Disagree',
      4: 'Strongly Disagree'
    };
    return answerMap[value] ?? 'Neutral';
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const responses = Object.entries(answers).map(([questionId, answerValue]) => ({
        questionId: parseInt(questionId),
        answer: getAnswerText(answerValue)
      }));
      await api.post('/assessment/brain/submit', { responses });
      toast.success('Assessment submitted successfully!');
      setTimeout(() => {
        if (onPageChange) onPageChange('career');
        else window.location.href = '/dashboard';
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting brain assessment:', error);
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
          <Button onClick={() => { if (onPageChange) onPageChange('career'); else window.history.back(); }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-4xl mb-2 font-bold">Brain Hemisphere</h1>
                <p className="text-sm md:text-base text-blue-100">
                  Discover whether you lean toward left-brain (logical) or right-brain (creative) thinking
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
              const isLastQuestionOnPage = questionIndex === currentPageQuestions.length - 1;
              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: questionIndex * 0.1 }}
                  className={`py-6 md:py-8 ${isLastQuestionOnPage ? 'mb-8 md:mb-12' : ''}`}
                >
                  <h2 className="text-lg md:text-xl font-medium text-slate-800 mb-6 md:mb-8 text-center">
                    {question.question}
                  </h2>

                  <div className="flex items-center justify-center gap-2 md:gap-4 px-4">
                    <span className="text-sm md:text-base text-slate-600 font-medium min-w-[60px] text-right">
                      Agree
                    </span>
                    <div className="flex items-center gap-2 md:gap-3">
                      {[0, 1, 2, 3, 4].map((value) => {
                        const sizes = [44, 32, 24, 32, 44];
                        const size = sizes[value];
                        const isSelected = answerValue === value;
                        const isAgreeSide = value <= 1;
                        const isDisagreeSide = value >= 3;
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
                            circleColor = 'border-amber-500';
                            fillColor = 'bg-slate-600';
                          }
                        } else {
                          if (isAgreeSide) circleColor = 'border-green-400';
                          else if (isDisagreeSide) circleColor = 'border-purple-400';
                          else circleColor = 'border-slate-400';
                        }
                        return (
                          <button
                            key={value}
                            onClick={() => handleAnswerChange(question.id, value)}
                            className={`
                              rounded-full border-2 transition-all duration-200 relative
                              ${circleColor} ${isSelected ? fillColor : 'bg-transparent'}
                              hover:scale-105 active:scale-95
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                              group
                            `}
                            style={{ width: `${size}px`, height: `${size}px` }}
                            aria-label={`Select option ${value}`}
                          >
                            <span
                              className="absolute inset-0 rounded-full border-2 border-slate-700 opacity-0 group-hover:opacity-40 transition-opacity duration-200 pointer-events-none"
                              style={{ width: `${size + 6}px`, height: `${size + 6}px`, top: '-3px', left: '-3px' }}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-sm md:text-base text-slate-600 font-medium min-w-[70px] text-left">
                      Disagree
                    </span>
                  </div>

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
