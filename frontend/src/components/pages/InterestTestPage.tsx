import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

interface InterestTestPageProps {
  onPageChange?: (page: string) => void;
}

interface Option {
  letter: string;
  text: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

export function InterestTestPage({ onPageChange }: InterestTestPageProps = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const isLast = currentIndex === total - 1;

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assessment/interest/questions');
      setQuestions(response.data.questions || []);
    } catch (error: any) {
      console.error('Error fetching interest questions:', error);
      toast.error('Failed to load questions. Please try again.');
      setTimeout(() => {
        if (onPageChange) onPageChange('career');
        else window.location.href = '/dashboard';
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!currentQuestion || answers[currentQuestion.id] === undefined) {
      toast.info('Please select one option');
      return;
    }
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOptionSelect = (questionId: number, letter: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: letter }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));
      const res = await api.post('/assessment/interest/submit', { responses });
      if (res.data?.topDimensions?.length) {
        try {
          sessionStorage.setItem('manzil_interestTopDimensions', JSON.stringify(res.data.topDimensions));
        } catch (_) {}
      }
      toast.success('Assessment submitted successfully!');
      setTimeout(() => {
        if (onPageChange) onPageChange('career');
        else window.location.href = '/dashboard';
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting interest assessment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit. Please try again.');
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
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-purple-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-4xl mb-2 font-bold">Career Path Profiler</h1>
                <p className="text-sm md:text-base text-blue-100">
                  Identify your interests and motivations to discover ideal career paths
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm md:text-base text-blue-100">
                  Question {currentIndex + 1} of {total}
                </p>
                <div className="mt-2 w-32 md:w-48">
                  <Progress value={progress} className="h-2 bg-white/20" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="text-lg md:text-xl font-medium text-slate-800">
                {currentQuestion.question}
              </h2>
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.letter;
                  return (
                    <button
                      key={opt.letter}
                      onClick={() => handleOptionSelect(currentQuestion.id, opt.letter)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 text-slate-900'
                          : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {opt.letter}
                      </span>
                      <span className="pt-0.5">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end mt-8">
                <Button
                  onClick={handleNext}
                  disabled={submitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 md:px-8"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : isLast ? (
                    'Submit Assessment'
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
