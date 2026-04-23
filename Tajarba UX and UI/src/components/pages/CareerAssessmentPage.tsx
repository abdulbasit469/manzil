import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, Lightbulb, User, CheckCircle2, ArrowRight, Info, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export function CareerAssessmentPage() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const assessments = [
    {
      title: 'Personality Insights',
      subtitle: 'MBTI Test',
      description: 'Discover your personality type and how it shapes your career choices',
      icon: User,
      completed: true,
      result: 'ISTJ',
      color: 'from-amber-500 to-amber-600',
      details: {
        title: 'MBTI Type: ISTJ',
        breakdown: [
          { letter: 'I', meaning: 'Introvert' },
          { letter: 'S', meaning: 'Sensor' },
          { letter: 'T', meaning: 'Thinker' },
          { letter: 'J', meaning: 'Judger' },
        ],
        description: [
          "They're natural-born organizers and leaders, great at managing projects and people to get things done efficiently. They thrive on logic and clear, practical steps.",
          "They often thrive in structured fields like business management, finance, law enforcement, and the military where there are clear rules and goals.",
          "Professional roles like manager, financial officer, project lead, school principal, or police captain suit them best.",
          "Their biggest impact comes from bringing order and structure to organizations and making sure rules and standards are met."
        ]
      }
    },
    {
      title: 'Brain Hemisphere',
      subtitle: 'Brain Hemisphere Test',
      description: 'Understand your thinking patterns and cognitive preferences',
      icon: Brain,
      completed: true,
      result: 'Right Dominant',
      color: 'from-blue-500 to-cyan-500',
      details: {
        title: 'Brain Hemisphere: Right Hemisphere Dominant',
        breakdown: null,
        description: [
          "Right-brain dominant individuals are typically creative, intuitive, and holistic thinkers. They excel at seeing the big picture and making connections between ideas.",
          "They are often strong in areas like art, music, design, and creative problem-solving. They tend to think in images and patterns rather than words and numbers.",
          "Careers in creative fields, design, arts, counseling, and innovative industries align well with right-brain dominance.",
          "Their strength lies in imagination, creativity, spatial awareness, and emotional intelligence."
        ]
      }
    },
    {
      title: 'Career Path Profiler',
      subtitle: 'Personal Information Test',
      description: 'Identify your interests, motivations, and ideal career paths',
      icon: Lightbulb,
      completed: false,
      result: null,
      color: 'from-purple-500 to-pink-500',
      details: null
    },
  ];

  const openDetailModal = (assessment: any) => {
    setSelectedTest(assessment);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
  };

  const recommendations = [
    {
      field: 'Computer Science',
      match: 92,
      description: 'Based on your interests in technology and problem-solving',
    },
    {
      field: 'Electrical Engineering',
      match: 85,
      description: 'Your analytical skills align well with this field',
    },
    {
      field: 'Software Engineering',
      match: 88,
      description: 'Strong compatibility with your technical aptitude',
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-8 shadow-lg">
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
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${assessment.color} flex items-center justify-center flex-shrink-0`}>
                      <assessment.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-h-[90px]">
                      <h3 className="text-lg mb-1">{assessment.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3">{assessment.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    {assessment.completed && (
                      <>
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
                        <Button
                          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f] text-white hover:shadow-lg transition-all border border-amber-500 py-2 text-sm"
                        >
                          Retake Assessment
                          <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      </>
                    )}

                    {!assessment.completed && (
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all py-2 text-sm"
                      >
                        Start Assessment
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
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="mb-1">{rec.field}</h3>
                    <p className="text-sm text-slate-600">{rec.description}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-2xl text-amber-600">{rec.match}%</div>
                    <span className="text-xs text-slate-500">Match</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Detail Modal — portaled so parent layout cannot stretch it full-width */}
      {showDetailModal &&
        selectedTest &&
        selectedTest.details &&
        createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="manzil-modal-square flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 shrink-0 flex items-center justify-between rounded-t-xl bg-gradient-to-r from-[#1e3a5f] to-amber-500 p-4 text-white">
              <h2 className="min-w-0 pr-2 text-base font-semibold leading-tight sm:text-lg">{selectedTest.details.title}</h2>
              <button
                onClick={closeDetailModal}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 min-h-0">
              {selectedTest.details.breakdown && (
                <div className="mb-5">
                  <div className="space-y-3">
                    {selectedTest.details.breakdown.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                          {item.letter}
                        </div>
                        <div>
                          <p className="text-slate-900">{item.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-3 text-sm leading-relaxed">
                {selectedTest.details.description.map((paragraph: string, index: number) => (
                  <p key={index} className="text-slate-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button
                  onClick={closeDetailModal}
                  className="w-full bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white hover:shadow-lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}