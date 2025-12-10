import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { BookOpen, Clock, FileText, Award, ArrowRight, Info, X, Building2, ListChecks } from 'lucide-react';
import { useState } from 'react';

export function MockTestPage() {
  const mockTests = [
    {
      name: 'ECAT',
      fullName: 'Engineering Colleges Admission Test',
      description: 'Entry test for engineering admissions in Punjab',
      duration: '100 minutes',
      questions: 100,
      sections: ['Mathematics', 'Physics', 'English', 'Chemistry/Computer Science'],
      color: 'from-green-500 to-emerald-500',
      universities: ['UET Lahore', 'UET Taxila', 'UET Peshawar', 'UET Mardan', 'BZU Multan', 'Punjab University', 'GC University Lahore', 'University of Engineering & Technology KSK', 'Islamia University Bahawalpur', 'University of Gujrat', 'University of Sargodha'],
      universityCount: '11+',
      paperPattern: {
        totalMarks: 100,
        totalTime: '100 minutes',
        sections: [
          { name: 'Mathematics', questions: 30, marks: 30, time: '30 minutes' },
          { name: 'Physics', questions: 30, marks: 30, time: '30 minutes' },
          { name: 'English', questions: 10, marks: 10, time: '10 minutes' },
          { name: 'Chemistry / Computer Science', questions: 30, marks: 30, time: '30 minutes' }
        ],
        negativeMarking: 'Yes, -1 mark for every 4 wrong answers',
        format: 'Multiple Choice Questions (MCQs)'
      }
    },
    {
      name: 'MDCAT',
      fullName: 'Medical & Dental College Admission Test (PMC)',
      description: 'MBBS & BDS admissions nationwide by Pakistan Medical Commission',
      duration: '210 minutes',
      questions: 200,
      sections: ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'],
      color: 'from-red-500 to-rose-500',
      universities: ['All medical and dental colleges across Pakistan (Public & Private)', 'AKU', 'CMH Medical Colleges', 'Shifa College of Medicine', 'Dow University', 'King Edward Medical University', 'Allama Iqbal Medical College', 'Services Institute of Medical Sciences', 'Jinnah Sindh Medical University', 'Khyber Medical College'],
      universityCount: '100+',
      paperPattern: {
        totalMarks: 200,
        totalTime: '210 minutes (3.5 hours)',
        sections: [
          { name: 'Biology', questions: 68, marks: '34%', time: '71 minutes' },
          { name: 'Chemistry', questions: 54, marks: '27%', time: '57 minutes' },
          { name: 'Physics', questions: 54, marks: '27%', time: '57 minutes' },
          { name: 'English', questions: 18, marks: '9%', time: '19 minutes' },
          { name: 'Logical Reasoning', questions: 6, marks: '3%', time: '6 minutes' }
        ],
        negativeMarking: 'No negative marking',
        format: 'Multiple Choice Questions (MCQs)'
      }
    },
    {
      name: 'NET',
      fullName: 'NUST Entry Test',
      description: 'Entry test exclusively for all NUST programs nationwide',
      duration: '120 minutes',
      questions: 120,
      sections: ['Mathematics', 'Physics', 'Chemistry/Computer', 'English', 'Intelligence'],
      color: 'from-purple-500 to-pink-500',
      universities: ['NUST (National University of Sciences & Technology) - All Campuses'],
      universityCount: '1',
      paperPattern: {
        totalMarks: 200,
        totalTime: '120 minutes',
        sections: [
          { name: 'Mathematics', questions: 40, marks: 80, time: '40 minutes' },
          { name: 'Physics', questions: 30, marks: 60, time: '30 minutes' },
          { name: 'Chemistry / Computer Science', questions: 30, marks: 60, time: '30 minutes' },
          { name: 'English', questions: 20, marks: 20, time: '15 minutes' },
          { name: 'IQ / Analytical', questions: 10, marks: 10, time: '5 minutes' }
        ],
        negativeMarking: 'Yes, 25% deduction for wrong answers',
        format: 'Multiple Choice Questions (MCQs)',
        note: 'NET has three variants: Engineering, Computer Science, and Business/BS Programs with different section weightages'
      }
    },
    {
      name: 'ETEA',
      fullName: 'Educational Testing & Evaluation Agency',
      description: 'Entry test for engineering and medical admissions in KPK',
      duration: '160 minutes',
      questions: 160,
      sections: ['Mathematics', 'Physics', 'Chemistry/Computer', 'English'],
      color: 'from-cyan-500 to-blue-500',
      universities: ['UET Peshawar', 'UET Mardan', 'CECOS University', 'Abasyn University', 'City University', 'Sarhad University', 'All KPK Medical Colleges', 'Khyber Medical College', 'Ayub Medical College'],
      universityCount: '25+',
      paperPattern: {
        totalMarks: 160,
        totalTime: '160 minutes',
        sections: [
          { name: 'Mathematics', questions: 60, marks: 60, time: '60 minutes' },
          { name: 'Physics', questions: 60, marks: 60, time: '60 minutes' },
          { name: 'Chemistry / Computer', questions: 30, marks: 30, time: '30 minutes' },
          { name: 'English', questions: 10, marks: 10, time: '10 minutes' }
        ],
        negativeMarking: 'No negative marking',
        format: 'Multiple Choice Questions (MCQs)',
        note: 'ETEA Medical Pattern: Biology (80), Chemistry (60), Physics (40), English (20) = 200 MCQs'
      }
    },
    {
      name: 'NAT',
      fullName: 'National Aptitude Test (NTS)',
      description: 'Undergraduate admissions test accepted by 32+ universities',
      duration: '120 minutes',
      questions: 90,
      sections: ['Verbal', 'Analytical', 'Quantitative'],
      color: 'from-blue-500 to-cyan-500',
      universities: ['COMSATS University', 'FAST-NUCES', 'Bahria University', 'Air University', 'NUST School of Business', 'GIKI', 'UET Lahore', 'UET Taxila', 'UET Peshawar', 'PIEAS', 'NED University', 'LUMS', 'IBA Karachi', 'IBA Sukkur', 'Habib University', 'Iqra University', 'SZABIST', 'IBT', 'Riphah International University', 'Foundation University', 'Quaid-i-Azam University', 'University of Karachi', 'Punjab University', 'University of Central Punjab', 'Lahore School of Economics', 'Forman Christian College', 'Kinnaird College', 'GIFT University', 'The University of Faisalabad', 'Superior University', 'Abasyn University', 'CECOS University'],
      universityCount: '32+',
      paperPattern: {
        totalMarks: 90,
        totalTime: '120 minutes',
        sections: [
          { name: 'Verbal', questions: 27, marks: '30%', time: '36 minutes' },
          { name: 'Analytical', questions: 27, marks: '30%', time: '36 minutes' },
          { name: 'Quantitative', questions: 36, marks: '40%', time: '48 minutes' }
        ],
        negativeMarking: 'No negative marking',
        format: 'Multiple Choice Questions (MCQs)',
        note: 'NAT has variants: NAT-IE (Engineering), NAT-IM (Medical), NAT-ICS, NAT-ICOM, NAT-IA'
      }
    },
    {
      name: 'PIEAS',
      fullName: 'Pakistan Institute of Engineering & Applied Sciences',
      description: 'Entry test for PIEAS engineering and applied sciences programs',
      duration: '120 minutes',
      questions: 100,
      sections: ['Mathematics', 'Physics', 'Chemistry', 'English'],
      color: 'from-indigo-500 to-purple-500',
      universities: ['PIEAS (Pakistan Institute of Engineering & Applied Sciences)'],
      universityCount: '1',
      paperPattern: {
        totalMarks: 100,
        totalTime: '120 minutes (2 hours)',
        sections: [
          { name: 'Mathematics', questions: 30, marks: 30, time: '36 minutes' },
          { name: 'Physics', questions: 30, marks: 30, time: '36 minutes' },
          { name: 'Chemistry', questions: 20, marks: 20, time: '24 minutes' },
          { name: 'English', questions: 20, marks: 20, time: '24 minutes' }
        ],
        negativeMarking: 'Yes, negative marking applied',
        format: 'Multiple Choice Questions (MCQs)'
      }
    },
    {
      name: 'GIKI',
      fullName: 'Ghulam Ishaq Khan Institute Entry Test',
      description: 'Entry test for GIKI engineering and sciences programs',
      duration: '120 minutes',
      questions: 100,
      sections: ['Mathematics', 'Physics', 'English', 'Logical Reasoning'],
      color: 'from-teal-500 to-cyan-500',
      universities: ['GIKI (Ghulam Ishaq Khan Institute of Engineering Sciences & Technology)'],
      universityCount: '1',
      paperPattern: {
        totalMarks: 100,
        totalTime: '120 minutes',
        sections: [
          { name: 'Mathematics', questions: 40, marks: 40, time: '48 minutes' },
          { name: 'Physics', questions: 30, marks: 30, time: '36 minutes' },
          { name: 'English', questions: 20, marks: 20, time: '24 minutes' },
          { name: 'Logical Reasoning', questions: 10, marks: 10, time: '12 minutes' }
        ],
        negativeMarking: 'Yes, negative marking applied',
        format: 'Multiple Choice Questions (MCQs)'
      }
    },
    {
      name: 'GAT',
      fullName: 'Graduate Assessment Test (NTS)',
      description: 'Required for MS/MPhil admissions across Pakistan',
      duration: '120 minutes',
      questions: 100,
      sections: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Reasoning'],
      color: 'from-orange-500 to-red-500',
      universities: ['Required by HEC for all MS/MPhil programs in Pakistani universities', 'NUST', 'PIEAS', 'GIKI', 'All public sector universities', 'Most private universities'],
      universityCount: '100+',
      paperPattern: {
        totalMarks: 100,
        totalTime: '120 minutes (2 hours)',
        sections: [
          { name: 'Verbal Reasoning', questions: 30, marks: '30%', time: '36 minutes' },
          { name: 'Quantitative Reasoning', questions: 30, marks: '30%', time: '36 minutes' },
          { name: 'Analytical Reasoning', questions: 40, marks: '40%', time: '48 minutes' }
        ],
        negativeMarking: 'No negative marking',
        format: 'Multiple Choice Questions (MCQs)'
      }
    },
    {
      name: 'SAT',
      fullName: 'Scholastic Assessment Test',
      description: 'International test for college admissions worldwide',
      duration: '134 minutes',
      questions: 98,
      sections: ['Reading & Writing', 'Mathematics'],
      color: 'from-amber-500 to-orange-500',
      universities: ['LUMS', 'Habib University', 'IBA Karachi', 'NUST', 'FAST-NUCES', 'Lahore School of Economics', 'Forman Christian College', 'AKU', 'BNU', 'And many international universities worldwide'],
      universityCount: '50+',
      paperPattern: {
        totalMarks: 1600,
        totalTime: '134 minutes',
        sections: [
          { name: 'Reading & Writing', questions: 54, marks: 800, time: '64 minutes' },
          { name: 'Mathematics', questions: 44, marks: 800, time: '70 minutes' }
        ],
        negativeMarking: 'No negative marking',
        format: 'Multiple Choice Questions (MCQs)',
        note: 'Digital SAT format with calculator allowed in Math section'
      }
    },
    {
      name: 'IBA',
      fullName: 'IBA Karachi Entry Test',
      description: 'Entry test for BBA, BSCS, BS Accounting and other programs',
      duration: '120 minutes',
      questions: 100,
      sections: ['Mathematics', 'English', 'IQ/General Knowledge'],
      color: 'from-pink-500 to-rose-500',
      universities: ['IBA Karachi (Institute of Business Administration)', 'IBA Sukkur'],
      universityCount: '2',
      paperPattern: {
        totalMarks: 100,
        totalTime: '120 minutes',
        sections: [
          { name: 'Mathematics', questions: 35, marks: 35, time: '42 minutes' },
          { name: 'English', questions: 45, marks: 45, time: '54 minutes' },
          { name: 'IQ / General Knowledge', questions: 20, marks: 20, time: '24 minutes' }
        ],
        negativeMarking: 'Yes, negative marking applied',
        format: 'Multiple Choice Questions (MCQs)'
      }
    },
    {
      name: 'AKU',
      fullName: 'Aga Khan University Admission Test (MBBS)',
      description: 'Entry test for MBBS program at Aga Khan University',
      duration: '120 minutes',
      questions: 100,
      sections: ['English', 'Science Reasoning', 'Logical Reasoning'],
      color: 'from-emerald-500 to-teal-500',
      universities: ['Aga Khan University (AKU) - Karachi & Other Campuses'],
      universityCount: '1',
      paperPattern: {
        totalMarks: 100,
        totalTime: '120 minutes (2 hours)',
        sections: [
          { name: 'English', questions: 20, marks: '20%', time: '24 minutes' },
          { name: 'Science Reasoning (Biology, Chemistry, Physics)', questions: 60, marks: '60%', time: '72 minutes' },
          { name: 'Logical Reasoning', questions: 20, marks: '20%', time: '24 minutes' }
        ],
        negativeMarking: 'No negative marking',
        format: 'Multiple Choice Questions (MCQs)'
      }
    },
    {
      name: 'LAT',
      fullName: 'Law Admission Test (HEC)',
      description: 'Entry test for LLB programs across Pakistan',
      duration: '150 minutes',
      questions: 80,
      sections: ['Essay', 'MCQs (English, GK, Islamic, Pak Studies, Math, Urdu)'],
      color: 'from-slate-600 to-slate-800',
      universities: ['All law colleges and universities in Pakistan', 'Punjab University Law College', 'Sindh University', 'Balochistan University', 'University of Peshawar', 'LUMS Law School', 'IBA Law', 'SZABIST Law'],
      universityCount: '50+',
      paperPattern: {
        totalMarks: 100,
        totalTime: '150 minutes',
        sections: [
          { name: 'Essay (English/Urdu)', questions: 1, marks: 15, time: '30 minutes' },
          { name: 'Personal Statement', questions: 1, marks: 10, time: '20 minutes' },
          { name: 'MCQs - English', questions: 20, marks: 20, time: '20 minutes' },
          { name: 'MCQs - General Knowledge', questions: 20, marks: 20, time: '20 minutes' },
          { name: 'MCQs - Islamic Studies', questions: 10, marks: 10, time: '10 minutes' },
          { name: 'MCQs - Pakistan Studies', questions: 10, marks: 10, time: '10 minutes' },
          { name: 'MCQs - Mathematics', questions: 5, marks: 5, time: '10 minutes' },
          { name: 'MCQs - Urdu', questions: 10, marks: 10, time: '10 minutes' }
        ],
        negativeMarking: 'No negative marking',
        format: 'Essay Writing + Multiple Choice Questions (MCQs)'
      }
    }
  ];

  const [selectedTest, setSelectedTest] = useState<typeof mockTests[0] | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  // Filter out GAT test
  const filteredTests = mockTests.filter(test => test.name !== 'GAT');
  
  const handleStartTest = () => {
    setShowComingSoonModal(true);
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
            <h1 className="text-4xl mb-2">Mock Tests</h1>
            <p className="text-blue-100">
              Practice with realistic tests to prepare for your exams
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="flex"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col w-full">
                <div className={`bg-gradient-to-r ${test.color} p-6 text-white min-h-[160px] flex flex-col`}>
                  <div className="mb-4">
                    <h2 className="text-3xl mb-1">{test.name}</h2>
                    <p className="text-white/90 text-sm">{test.fullName}</p>
                  </div>
                  <p className="text-white/90 flex-1">{test.description}</p>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Duration</p>
                        <p className="font-semibold">{test.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Questions</p>
                        <p className="font-semibold">{test.questions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Button 
                      onClick={handleStartTest}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all"
                    >
                      Start Test
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button 
                      onClick={() => setSelectedTest(test)}
                      variant="outline" 
                      className="border-amber-500 text-amber-600 hover:bg-amber-50"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-amber-50 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="mb-2">Prepare for Success</h3>
                <p className="text-slate-600">
                  Our mock tests are designed to simulate the actual exam environment, helping you build confidence and identify areas for improvement. Each test includes detailed explanations and performance analytics to track your progress.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${selectedTest.color} p-6 text-white sticky top-0 z-10`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl mb-1">{selectedTest.name}</h2>
                  <p className="text-white/90">{selectedTest.fullName}</p>
                </div>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Universities Section */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  Accepted By {selectedTest.universityCount} {selectedTest.universityCount === '1' ? 'University' : 'Universities'}
                </h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTest.universities.map((university, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-amber-500 hover:bg-amber-50 transition-colors"
                      >
                        {university}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Paper Pattern Section */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-5 h-5 text-amber-600" />
                  Paper Pattern
                </h3>
                <div className="bg-gradient-to-br from-slate-50 to-amber-50 rounded-xl p-6 border border-amber-200">
                  {/* Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1">Total Marks</p>
                      <p className="text-2xl text-amber-600">{selectedTest.paperPattern.totalMarks}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1">Total Time</p>
                      <p className="text-2xl text-amber-600">{selectedTest.paperPattern.totalTime}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1">Format</p>
                      <p className="text-sm text-slate-700">{selectedTest.paperPattern.format}</p>
                    </div>
                  </div>

                  {/* Sections Breakdown */}
                  <div className="mb-4">
                    <h4 className="mb-3 text-slate-700">Test Sections Breakdown</h4>
                    <div className="space-y-3">
                      {selectedTest.paperPattern.sections.map((section, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-slate-800">{section.name}</h5>
                            <span className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${selectedTest.color} text-white`}>
                              {section.marks} {typeof section.marks === 'number' ? 'marks' : ''}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <FileText className="w-4 h-4 text-amber-600" />
                              <span>{section.questions} questions</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span>{section.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Negative Marking */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm mb-1">Negative Marking</p>
                        <p className="text-slate-700">{selectedTest.paperPattern.negativeMarking}</p>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  {selectedTest.paperPattern.note && (
                    <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm mb-1">Note</p>
                          <p className="text-slate-700">{selectedTest.paperPattern.note}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleStartTest}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all"
                >
                  Start Practice Test
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => setSelectedTest(null)}
                  variant="outline"
                  className="border-slate-300"
                >
                  Close
                </Button>
              </div>
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
              <div className="flex justify-end mt-6">
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