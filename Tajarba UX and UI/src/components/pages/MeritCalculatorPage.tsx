import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calculator, Info } from 'lucide-react';
import { useState } from 'react';

export function MeritCalculatorPage() {
  const [selectedTest, setSelectedTest] = useState('');
  const [matricTotal, setMatricTotal] = useState('');
  const [matricObtained, setMatricObtained] = useState('');
  const [interTotal, setInterTotal] = useState('');
  const [interObtained, setInterObtained] = useState('');
  const [testObtained, setTestObtained] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [meritPercentage, setMeritPercentage] = useState(0);

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

  const calculateMerit = () => {
    if (!selectedTest) {
      alert('Please select an entry test');
      return;
    }

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
    if (!showResult || !selectedTest) return 0;
    
    const formula = meritFormulas[selectedTest as keyof typeof meritFormulas];
    if (!formula) return 0;
    
    let totalAggregate = 0;
    
    if (formula.matricWeight > 0) {
      totalAggregate += ((parseFloat(matricObtained) / parseFloat(matricTotal)) * 100) * formula.matricWeight / 100;
    }
    totalAggregate += ((parseFloat(interObtained) / parseFloat(interTotal)) * 100) * formula.interWeight / 100;
    totalAggregate += ((parseFloat(testObtained) / formula.maxMarks) * 100) * formula.testWeight / 100;
    
    return totalAggregate;
  };

  const selectedFormula = selectedTest ? meritFormulas[selectedTest as keyof typeof meritFormulas] : null;
  const totalAggregate = calculateTotalAggregate();
  const status = getMeritStatus(totalAggregate || meritPercentage);

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

              {/* Formula Info */}
              {selectedFormula && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm mb-2">{selectedFormula.description}</p>
                      <div className="flex gap-4 text-sm">
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
                disabled={!selectedTest}
                className="w-full bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white hover:shadow-lg transition-all py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Merit
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

              {/* Calculation Breakdown */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="mb-4">Calculation Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Entry Test</span>
                    <span className="text-slate-900">{selectedFormula.name}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <p className="text-sm mb-3">Merit Formula Applied:</p>
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
                        {((parseFloat(testObtained) / (selectedFormula?.maxMarks || 200)) * 100).toFixed(2)}% × {selectedFormula?.testWeight}% = {(((parseFloat(testObtained) / (selectedFormula?.maxMarks || 200)) * 100) * selectedFormula?.testWeight / 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="border-t border-slate-300 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-900">Total Aggregate:</span>
                        <span className="text-[#1e3a5f]">{totalAggregate.toFixed(2)}%</span>
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
