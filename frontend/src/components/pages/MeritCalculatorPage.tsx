import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calculator, Info, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface University {
  _id: string;
  name: string;
  city: string;
}

interface Program {
  _id: string;
  name: string;
  degree: string;
  university: string;
}

interface MeritResult {
  meritPercentage: number;
  admissionProbability: string | null;
  probabilityMessage: string;
  criteria: {
    university: string;
    program: string;
    entryTestName: string;
    entryTestRequired: boolean;
    entryTestTotalMarks?: number;
    weights: {
      matric: number;
      firstYear: number;
      secondYear: number;
      intermediate: number;
      entryTest: number;
    };
    pastMeritTrends?: Array<{ closingMerit: number; year?: number; programName?: string }>;
  };
}

export function MeritCalculatorPage() {
  const { isAuthenticated } = useAuth();
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [matricTotal, setMatricTotal] = useState('1100');
  const [matricObtained, setMatricObtained] = useState('');
  const [interTotal, setInterTotal] = useState('1100');
  const [interObtained, setInterObtained] = useState('');
  const [firstYearMarks, setFirstYearMarks] = useState('');
  const [secondYearMarks, setSecondYearMarks] = useState('');
  const [testObtained, setTestObtained] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [meritPercentage, setMeritPercentage] = useState(0);
  const [meritResult, setMeritResult] = useState<MeritResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [useBackendCalculation, setUseBackendCalculation] = useState(false);

  const meritFormulas = {
    ECAT: {
      name: 'ECAT (UET + Punjab Engineering)',
      testWeight: 33,
      interWeight: 45,
      matricWeight: 22,
      maxMarks: 400,
      description: 'Used by UET Lahore, UET Taxila, and most Punjab engineering universities'
    },
    NET: {
      name: 'NET (NUST Entry Test)',
      testWeight: 75,
      interWeight: 15,
      matricWeight: 10,
      maxMarks: 200,
      description: 'For engineering, CS, business, and applied sciences at NUST'
    },
    NAT: {
      name: 'NAT (National Aptitude Test)',
      testWeight: 50,
      interWeight: 40,
      matricWeight: 10,
      maxMarks: 100,
      description: 'General formula used by 30+ universities accepting NAT'
    },
    SAT: {
      name: 'SAT (NUST/LUMS/IBA)',
      testWeight: 75,
      interWeight: 15,
      matricWeight: 10,
      maxMarks: 1600,
      description: 'General formula for SAT-based admissions (varies by university)'
    }
  };

  // Fetch universities on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUniversities();
    }
  }, [isAuthenticated]);

  // Fetch programs when university is selected
  useEffect(() => {
    if (selectedUniversity) {
      fetchPrograms(selectedUniversity);
    } else {
      setPrograms([]);
      setSelectedProgram('');
    }
  }, [selectedUniversity]);

  const fetchUniversities = async () => {
    try {
      setLoadingUniversities(true);
      const response = await api.get('/universities', { params: { limit: 1000 } });
      if (response.data.success) {
        setUniversities(response.data.universities || []);
      }
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      toast.error('Failed to load universities');
    } finally {
      setLoadingUniversities(false);
    }
  };

  const fetchPrograms = async (universityId: string) => {
    try {
      setLoadingPrograms(true);
      const response = await api.get(`/universities/${universityId}/programs`);
      if (response.data.success) {
        setPrograms(response.data.programs || []);
      }
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoadingPrograms(false);
    }
  };

  const calculateMerit = async () => {
    if (!selectedTest) {
      toast.error('Please select an entry test');
      return;
    }

    // Validate required fields
    if (!matricObtained || parseFloat(matricObtained) <= 0) {
      toast.error('Please enter matric obtained marks');
      return;
    }

    if (!interObtained || parseFloat(interObtained) <= 0) {
      toast.error('Please enter intermediate obtained marks');
      return;
    }

    if (!testObtained || parseFloat(testObtained) <= 0) {
      toast.error('Please enter entry test obtained marks');
      return;
    }

    // If university and program are selected, use backend calculation
    if (selectedUniversity && selectedProgram) {
      try {
        setLoading(true);
        const response = await api.post('/merit/calculate', {
          universityId: selectedUniversity,
          programId: selectedProgram,
          matricMarks: parseFloat(matricObtained),
          intermediateMarks: parseFloat(interObtained),
          firstYearMarks: firstYearMarks ? parseFloat(firstYearMarks) : undefined,
          secondYearMarks: secondYearMarks ? parseFloat(secondYearMarks) : undefined,
          entryTestMarks: parseFloat(testObtained)
        });

        if (response.data.success) {
          setMeritPercentage(response.data.data.meritPercentage);
          setMeritResult(response.data.data);
          setUseBackendCalculation(true);
          setShowResult(true);
        }
      } catch (error: any) {
        console.error('Error calculating merit:', error);
        const errorMessage = error.response?.data?.message || 'Failed to calculate merit';
        const errors = error.response?.data?.errors || [];
        
        if (errors.length > 0) {
          toast.error(`${errorMessage}: ${errors.join(', ')}`);
        } else {
          toast.error(errorMessage);
        }
        
        // Fall back to frontend calculation
        calculateFrontendMerit();
      } finally {
        setLoading(false);
      }
    } else {
      // Use frontend calculation
      calculateFrontendMerit();
    }
  };

  const calculateFrontendMerit = () => {
    const formula = meritFormulas[selectedTest as keyof typeof meritFormulas];
    
    const matricPercentage = parseFloat(matricTotal) > 0 
      ? (parseFloat(matricObtained) / parseFloat(matricTotal)) * 100 
      : 0;
    const interPercentage = parseFloat(interTotal) > 0
      ? (parseFloat(interObtained) / parseFloat(interTotal)) * 100
      : 0;
    const testPercentage = parseFloat(testObtained) > 0
      ? (parseFloat(testObtained) / formula.maxMarks) * 100
      : 0;

    const merit = 
      (matricPercentage * formula.matricWeight / 100) + 
      (interPercentage * formula.interWeight / 100) + 
      (testPercentage * formula.testWeight / 100);
    
    setMeritPercentage(merit);
    setMeritResult(null);
    setUseBackendCalculation(false);
    setShowResult(true);
  };

  const getMeritStatus = (merit: number) => {
    if (merit >= 80) return { text: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (merit >= 70) return { text: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    if (merit >= 60) return { text: 'Good', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
    return { text: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
  };

  // Calculate total aggregate as sum of displayed components
  const calculateTotalAggregate = (): number => {
    if (!showResult) return 0;
    
    let totalAggregate = 0;
    
    if (useBackendCalculation && meritResult) {
      // Calculate each component contribution (same as displayed)
      // Prioritize selectedFormula maxMarks to match user's selected test, fallback to backend value
      let entryTestMaxMarks = 200; // Default fallback
      if (selectedFormula?.maxMarks && selectedFormula.maxMarks > 0) {
        // Use the max marks from the selected formula (matches what user selected)
        entryTestMaxMarks = selectedFormula.maxMarks;
      } else if (meritResult.criteria.entryTestTotalMarks && meritResult.criteria.entryTestTotalMarks > 0) {
        // Fallback to backend value if formula doesn't have it
        entryTestMaxMarks = meritResult.criteria.entryTestTotalMarks;
      }
      
      if (meritResult.criteria.weights.matric > 0 && parseFloat(matricObtained) > 0 && parseFloat(matricTotal) > 0) {
        totalAggregate += ((parseFloat(matricObtained) / parseFloat(matricTotal)) * 100) * meritResult.criteria.weights.matric / 100;
      }
      if (parseFloat(interObtained) > 0 && parseFloat(interTotal) > 0) {
        totalAggregate += ((parseFloat(interObtained) / parseFloat(interTotal)) * 100) * meritResult.criteria.weights.intermediate / 100;
      }
      if (parseFloat(testObtained) > 0 && entryTestMaxMarks > 0 && meritResult.criteria.weights.entryTest > 0) {
        totalAggregate += ((parseFloat(testObtained) / entryTestMaxMarks) * 100) * meritResult.criteria.weights.entryTest / 100;
      }
    } else if (selectedFormula) {
      // Frontend calculation
      if (selectedFormula.matricWeight > 0 && parseFloat(matricObtained) > 0 && parseFloat(matricTotal) > 0) {
        totalAggregate += ((parseFloat(matricObtained) / parseFloat(matricTotal)) * 100) * selectedFormula.matricWeight / 100;
      }
      if (parseFloat(interObtained) > 0 && parseFloat(interTotal) > 0) {
        totalAggregate += ((parseFloat(interObtained) / parseFloat(interTotal)) * 100) * selectedFormula.interWeight / 100;
      }
      const entryTestMaxMarks = selectedFormula.maxMarks || 200;
      if (parseFloat(testObtained) > 0 && entryTestMaxMarks > 0 && selectedFormula.testWeight > 0) {
        totalAggregate += ((parseFloat(testObtained) / entryTestMaxMarks) * 100) * selectedFormula.testWeight / 100;
      }
    }
    
    return totalAggregate;
  };

  // Calculate admission probability based on correct total aggregate
  const calculateAdmissionProbability = (aggregate: number, pastMeritTrends?: Array<{ closingMerit: number }>): { probability: string; message: string } | null => {
    if (!pastMeritTrends || pastMeritTrends.length === 0) return null;
    
    const closingMerits = pastMeritTrends
      .map(trend => trend.closingMerit)
      .filter(merit => merit > 0);
    
    if (closingMerits.length === 0) return null;
    
    const averageClosingMerit = closingMerits.reduce((a, b) => a + b, 0) / closingMerits.length;
    const minClosingMerit = Math.min(...closingMerits);
    const maxClosingMerit = Math.max(...closingMerits);

    if (aggregate >= maxClosingMerit) {
      return {
        probability: 'Very High',
        message: `Your merit (${aggregate.toFixed(2)}%) is above the highest closing merit (${maxClosingMerit}%) in recent years.`
      };
    } else if (aggregate >= averageClosingMerit) {
      return {
        probability: 'High',
        message: `Your merit (${aggregate.toFixed(2)}%) is above the average closing merit (${averageClosingMerit.toFixed(2)}%).`
      };
    } else if (aggregate >= minClosingMerit) {
      return {
        probability: 'Moderate',
        message: `Your merit (${aggregate.toFixed(2)}%) is between the minimum (${minClosingMerit}%) and average (${averageClosingMerit.toFixed(2)}%) closing merit.`
      };
    } else {
      return {
        probability: 'Low',
        message: `Your merit (${aggregate.toFixed(2)}%) is below the minimum closing merit (${minClosingMerit}%) in recent years.`
      };
    }
  };

  const selectedFormula = selectedTest ? meritFormulas[selectedTest as keyof typeof meritFormulas] : null;
  const totalAggregate = calculateTotalAggregate();
  const status = getMeritStatus(totalAggregate || meritPercentage);
  
  // Calculate admission probability with correct aggregate
  const admissionProbability = useBackendCalculation && meritResult?.criteria.pastMeritTrends
    ? calculateAdmissionProbability(totalAggregate, meritResult.criteria.pastMeritTrends)
    : null;

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
            <h1 className="text-4xl mb-2">Merit Calculator</h1>
            <p className="text-blue-100">
              Calculate your aggregate merit for university admissions
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="space-y-6">
              {/* Entry Test Selection */}
              <div>
                <label className="block text-sm mb-3">
                  Select Entry Test <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.keys(meritFormulas).map((test) => (
                    <div
                      key={test}
                      onClick={() => {
                        setSelectedTest(test);
                        setShowResult(false);
                      }}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        selectedTest === test
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-300 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedTest === test
                              ? 'border-amber-500 bg-amber-500'
                              : 'border-slate-400'
                          }`}
                        >
                          {selectedTest === test && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold mb-1">{test}</p>
                      <p className="text-xs text-slate-600">
                        {meritFormulas[test as keyof typeof meritFormulas].name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* University and Program Selection (Optional - for backend calculation) */}
              {isAuthenticated && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">
                      Select University (Optional - for accurate calculation)
                    </label>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => {
                        setSelectedUniversity(e.target.value);
                        setSelectedProgram('');
                        setShowResult(false);
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      disabled={loadingUniversities}
                    >
                      <option value="">Select University</option>
                      {universities.map((uni) => (
                        <option key={uni._id} value={uni._id}>
                          {uni.name} {uni.city ? `(${uni.city})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Select Program (Optional - for accurate calculation)
                    </label>
                    <select
                      value={selectedProgram}
                      onChange={(e) => {
                        setSelectedProgram(e.target.value);
                        setShowResult(false);
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      disabled={!selectedUniversity || loadingPrograms}
                    >
                      <option value="">Select Program</option>
                      {programs.map((prog) => (
                        <option key={prog._id} value={prog._id}>
                          {prog.name} ({prog.degree})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Formula Info */}
              {selectedFormula && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm mb-2">
                        {useBackendCalculation && meritResult
                          ? `Using merit criteria for ${meritResult.criteria.university} - ${meritResult.criteria.program}`
                          : selectedFormula.description}
                      </p>
                      <div className="flex gap-4 text-sm">
                        {useBackendCalculation && meritResult ? (
                          <>
                            {meritResult.criteria.weights.matric > 0 && (
                              <span className="text-slate-700">
                                Matric: <strong>{meritResult.criteria.weights.matric}%</strong>
                              </span>
                            )}
                            <span className="text-slate-700">
                              Intermediate: <strong>{meritResult.criteria.weights.intermediate}%</strong>
                            </span>
                            <span className="text-slate-700">
                              Entry Test: <strong>{meritResult.criteria.weights.entryTest}%</strong>
                            </span>
                          </>
                        ) : (
                          <>
                            {selectedFormula.matricWeight > 0 && (
                              <span className="text-slate-700">
                                Matric: <strong>{selectedFormula.matricWeight}%</strong>
                              </span>
                            )}
                            <span className="text-slate-700">
                              Intermediate: <strong>{selectedFormula.interWeight}%</strong>
                            </span>
                            <span className="text-slate-700">
                              Test: <strong>{selectedFormula.testWeight}%</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matric Marks */}
              {selectedFormula && selectedFormula.matricWeight > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">
                      Matric Total Marks <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={matricTotal}
                      onChange={(e) => setMatricTotal(e.target.value)}
                      placeholder="e.g., 1100"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Matric Obtained Marks <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={matricObtained}
                      onChange={(e) => setMatricObtained(e.target.value)}
                      placeholder="e.g., 950"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Intermediate Marks */}
              {selectedFormula && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">
                      Intermediate Total Marks <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={interTotal}
                      onChange={(e) => setInterTotal(e.target.value)}
                      placeholder="e.g., 1100"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Intermediate Obtained Marks <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={interObtained}
                      onChange={(e) => setInterObtained(e.target.value)}
                      placeholder="e.g., 900"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Test Marks Input */}
              {selectedFormula && (
                <div>
                  <label className="block text-sm mb-2">
                    {selectedTest} Obtained Marks <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={testObtained}
                    onChange={(e) => setTestObtained(e.target.value)}
                    placeholder={`Enter marks out of ${selectedFormula.maxMarks}`}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum Marks: {selectedFormula.maxMarks}
                  </p>
                </div>
              )}

              {/* Calculate Button */}
              <Button
                onClick={calculateMerit}
                disabled={!selectedTest || loading}
                className="w-full bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white hover:shadow-lg transition-all py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5 mr-2" />
                    Calculate Merit
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Merit Result */}
        {showResult && selectedFormula && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-8">
              <h2 className="mb-6">Merit Calculation Result</h2>

              {/* Merit Percentage */}
              <div className="text-center mb-6 p-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                <div className="text-6xl text-[#1e3a5f] mb-2">
                  {totalAggregate.toFixed(2)}%
                </div>
                <p className="text-sm text-slate-600">Your Aggregate Merit Percentage</p>
              </div>

              {/* Status */}
              <div className={`mb-6 p-4 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Merit Status:</span>
                  <span className={`font-semibold ${status.color}`}>{status.text}</span>
                </div>
              </div>

              {/* Admission Probability */}
              {(admissionProbability || (useBackendCalculation && meritResult?.admissionProbability)) && (
                <div className="mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Admission Probability: {admissionProbability?.probability || meritResult?.admissionProbability}
                      </p>
                      <p className="text-xs text-blue-700">{admissionProbability?.message || meritResult?.probabilityMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculation Breakdown */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="mb-4">Calculation Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm mb-3">Merit Formula Applied:</p>
                    {useBackendCalculation && meritResult ? (
                      <>
                        {meritResult.criteria.weights.matric > 0 && (
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Matric ({meritResult.criteria.weights.matric}%)</span>
                            <span className="text-slate-900">
                              {((parseFloat(matricObtained) / parseFloat(matricTotal)) * 100).toFixed(2)}% × {meritResult.criteria.weights.matric}% = {(((parseFloat(matricObtained) / parseFloat(matricTotal)) * 100) * meritResult.criteria.weights.matric / 100).toFixed(2)}%
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Intermediate ({meritResult.criteria.weights.intermediate}%)</span>
                          <span className="text-slate-900">
                            {((parseFloat(interObtained) / parseFloat(interTotal)) * 100).toFixed(2)}% × {meritResult.criteria.weights.intermediate}% = {(((parseFloat(interObtained) / parseFloat(interTotal)) * 100) * meritResult.criteria.weights.intermediate / 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Entry Test ({meritResult.criteria.weights.entryTest}%)</span>
                          <span className="text-slate-900">
                                  {(() => {
                                    // Prioritize selectedFormula maxMarks to match user's selected test, fallback to backend value
                                    let entryTestMaxMarks = 200; // Default fallback
                                    if (selectedFormula?.maxMarks && selectedFormula.maxMarks > 0) {
                                      // Use the max marks from the selected formula (matches what user selected)
                                      entryTestMaxMarks = selectedFormula.maxMarks;
                                    } else if (meritResult.criteria.entryTestTotalMarks && meritResult.criteria.entryTestTotalMarks > 0) {
                                      // Fallback to backend value if formula doesn't have it
                                      entryTestMaxMarks = meritResult.criteria.entryTestTotalMarks;
                                    }
                                    
                                    const entryTestPercentage = parseFloat(testObtained) > 0 && entryTestMaxMarks > 0
                                      ? (parseFloat(testObtained) / entryTestMaxMarks) * 100
                                      : 0;
                                    const entryTestContribution = (entryTestPercentage * meritResult.criteria.weights.entryTest / 100);
                                    return `${entryTestPercentage.toFixed(2)}% × ${meritResult.criteria.weights.entryTest}% = ${entryTestContribution.toFixed(2)}%`;
                                  })()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {selectedFormula?.matricWeight > 0 && (
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Matric ({selectedFormula.matricWeight}%)</span>
                            <span className="text-slate-900">
                              {((parseFloat(matricObtained) / parseFloat(matricTotal)) * 100).toFixed(2)}% × {selectedFormula.matricWeight}% = {(((parseFloat(matricObtained) / parseFloat(matricTotal)) * 100) * selectedFormula.matricWeight / 100).toFixed(2)}%
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Intermediate ({selectedFormula?.interWeight}%)</span>
                          <span className="text-slate-900">
                            {((parseFloat(interObtained) / parseFloat(interTotal)) * 100).toFixed(2)}% × {selectedFormula?.interWeight}% = {(((parseFloat(interObtained) / parseFloat(interTotal)) * 100) * selectedFormula?.interWeight / 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Entry Test ({selectedFormula?.testWeight}%)</span>
                          <span className="text-slate-900">
                            {(() => {
                              const entryTestMaxMarks = selectedFormula?.maxMarks || 200;
                              const entryTestPercentage = parseFloat(testObtained) > 0 && entryTestMaxMarks > 0
                                ? (parseFloat(testObtained) / entryTestMaxMarks) * 100
                                : 0;
                              const entryTestContribution = (entryTestPercentage * (selectedFormula?.testWeight || 0) / 100);
                              return `${entryTestPercentage.toFixed(2)}% × ${selectedFormula?.testWeight}% = ${entryTestContribution.toFixed(2)}%`;
                            })()}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="border-t border-slate-300 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-900">Total Aggregate:</span>
                        <span className="text-[#1e3a5f] font-semibold">{totalAggregate.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
