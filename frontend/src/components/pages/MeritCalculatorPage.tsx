import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calculator, Info, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { universityNameLabel, stripUnknownUniversityText } from '../../utils/universityDisplay';
import { inferMeritTestsForUniversity } from '../../utils/meritUniversityInference';
import {
  getUniversityMeritRule,
  type ResolvedUniversityMeritRule,
} from '../../utils/meritUniversityRules';

const MERIT_FORMULA_KEYS = ['ECAT', 'NET', 'NAT', 'SAT', 'MDCAT', 'GIKI', 'PIEAS'] as const;
type MeritFormulaKey = (typeof MERIT_FORMULA_KEYS)[number];

type MeritFormulaRow = {
  name: string;
  testWeight: number;
  interWeight: number;
  matricWeight: number;
  maxMarks: number;
  description: string;
  intermediateHint?: string;
};

type EffectiveMeritFormula = MeritFormulaRow & { meritDisclaimer?: string };

function applyMeritUniversityRule(
  base: MeritFormulaRow,
  rule: ResolvedUniversityMeritRule | null
): EffectiveMeritFormula {
  if (!rule) return base;
  const useBaseMax = rule.tests.length > 1;
  const maxM = useBaseMax ? base.maxMarks : rule.maxMarks ?? base.maxMarks;
  const intHint = rule.intermediateHint ?? base.intermediateHint;
  const out: EffectiveMeritFormula = {
    ...base,
    testWeight: rule.weights.test,
    interWeight: rule.weights.intermediate,
    matricWeight: rule.weights.matric,
    maxMarks: maxM,
    description: rule.officialLine,
  };
  if (intHint) out.intermediateHint = intHint;
  if (rule.disclaimer) out.meritDisclaimer = rule.disclaimer;
  return out;
}

/** Second line under test code: avoid "NATNAT / …" when full name already starts with the code */
function meritFormulaSubtitleAfterCode(code: string, fullName: string): string {
  const c = (code || '').trim();
  const f = (fullName || '').trim();
  if (!f) return '';
  if (!c) return f;
  if (f.toUpperCase().startsWith(c.toUpperCase())) {
    const rest = f.slice(c.length).replace(/^[\s/:–-]+/, '').trim();
    return rest || f;
  }
  return f;
}

const MERIT_FORMULAS: Record<MeritFormulaKey, MeritFormulaRow> = {
  ECAT: {
    name: 'ECAT (UET Punjab Engineering)',
    testWeight: 33,
    interWeight: 50,
    matricWeight: 17,
    maxMarks: 400,
    description:
      'UET (ECAT) aggregate: entry test 33%, HSSC (Intermediate) 50%, SSC (Matric) 17% (UET Lahore / Taxila and aligned programs).',
  },
  NET: {
    name: 'NET (NUST Entry Test)',
    testWeight: 75,
    interWeight: 15,
    matricWeight: 10,
    maxMarks: 200,
    description: 'For engineering, CS, business, and applied sciences at NUST',
  },
  NAT: {
    name: 'NAT / NTS-style & ETEA (KPK) aggregate',
    testWeight: 50,
    interWeight: 40,
    matricWeight: 10,
    maxMarks: 100,
    description:
      'NTS (NAT) and ETEA (KPK) engineering-style aggregate: 50% entry test, 40% HSSC (Intermediate), 10% SSC (Matric). Used by many universities on NAT or ETEA.',
  },
  SAT: {
    name: 'SAT (and similar standardized tests)',
    testWeight: 75,
    interWeight: 15,
    matricWeight: 10,
    maxMarks: 1600,
    description:
      'Illustrative default split only. LUMS (LCAT/SAT), IBA, and others use cut-offs or holistic review — when you select a university, the app applies that university’s documented weights where available.',
  },
  MDCAT: {
    name: 'MDCAT (Medical & Dental)',
    testWeight: 50,
    interWeight: 40,
    matricWeight: 10,
    maxMarks: 200,
    description:
      'Common aggregate for MBBS/BDS admissions: entry test 50%, FSc / Intermediate 40%, Matric 10%.',
  },
  GIKI: {
    name: 'GIKI Entry Test',
    testWeight: 85,
    interWeight: 15,
    matricWeight: 0,
    maxMarks: 200,
    description:
      'GIKI Institute of Engineering & Sciences: entry test 85%; FSc / Intermediate combined 15%. Matric is not part of this formula.',
    intermediateHint:
      'Use your combined FSc / Intermediate marks (or total obtained vs total max) as one percentage.',
  },
  PIEAS: {
    name: 'PIEAS Entry Test',
    testWeight: 60,
    interWeight: 25,
    matricWeight: 15,
    maxMarks: 200,
    description:
      'Pakistan Institute of Engineering & Applied Sciences: entry test 60%, FSc / Intermediate 25%, Matric 15%.',
  },
};

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

  const selectedUniRecord = useMemo(() => {
    if (!selectedUniversity) return null;
    return (
      universities.find(
        (u) =>
          String((u as University & { id?: string })._id ?? (u as University & { id?: string }).id) ===
          String(selectedUniversity)
      ) ?? null
    );
  }, [universities, selectedUniversity]);

  const universityMeritRule = useMemo(
    () => getUniversityMeritRule(selectedUniRecord?.name ?? ''),
    [selectedUniRecord?.name]
  );

  const selectedFormula = useMemo((): EffectiveMeritFormula | null => {
    if (!selectedTest) return null;
    const base = MERIT_FORMULAS[selectedTest as MeritFormulaKey];
    if (!base) return null;
    return applyMeritUniversityRule(base, universityMeritRule);
  }, [selectedTest, universityMeritRule]);

  const inferredEntryTests = useMemo(() => {
    if (!isAuthenticated || !selectedUniversity) return [] as string[];
    const uni = selectedUniRecord;
    if (!uni?.name) return [] as string[];
    const fromRule = universityMeritRule?.tests?.filter((t) =>
      (MERIT_FORMULA_KEYS as readonly string[]).includes(t)
    );
    if (fromRule?.length) return [...fromRule];
    return inferMeritTestsForUniversity(uni.name);
  }, [isAuthenticated, selectedUniversity, selectedUniRecord, universityMeritRule]);

  useEffect(() => {
    if (!isAuthenticated || !selectedUniversity) return;
    const tests = inferredEntryTests;
    if (tests.length === 0) {
      setSelectedTest('');
      return;
    }
    if (tests.length === 1) {
      setSelectedTest(tests[0]!);
    } else if (tests.length > 1) {
      setSelectedTest((prev) => (prev && tests.includes(prev) ? prev : tests[0]!));
    }
  }, [isAuthenticated, selectedUniversity, inferredEntryTests]);

  useEffect(() => {
    if (isAuthenticated && !selectedUniversity) {
      setSelectedTest('');
      setShowResult(false);
    }
  }, [isAuthenticated, selectedUniversity]);

  const MERIT_UNI_CACHE_KEY = 'meritCalcUniversities_v1';
  const MERIT_UNI_CACHE_MS = 12 * 60 * 1000;

  const fetchUniversities = async () => {
    let primedFromCache = false;
    try {
      const raw = sessionStorage.getItem(MERIT_UNI_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { at: number; data: University[] };
        if (
          typeof parsed?.at === 'number' &&
          Array.isArray(parsed.data) &&
          parsed.data.length > 0 &&
          Date.now() - parsed.at < MERIT_UNI_CACHE_MS
        ) {
          setUniversities(parsed.data);
          primedFromCache = true;
        }
      }
    } catch {
      /* ignore bad cache */
    }

    if (!primedFromCache) setLoadingUniversities(true);
    try {
      const response = await api.get('/universities', {
        params: {
          limit: 3000,
          page: 1,
          omitPlaceholderUniversities: 'true',
          meritPicker: 'true',
        },
      });
      if (response.data.success) {
        const raw = response.data.universities || [];
        const filtered = raw.filter(
          (u: University) =>
            u?.name &&
            !/\(\s*not specified\s*\)/i.test(u.name) &&
            !/^not specified$/i.test(String(u.city ?? '').trim()) &&
            !/^unknown$/i.test(String(u.city ?? '').trim())
        );
        setUniversities(filtered);
        try {
          sessionStorage.setItem(
            MERIT_UNI_CACHE_KEY,
            JSON.stringify({ at: Date.now(), data: filtered })
          );
        } catch {
          /* quota / private mode */
        }
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
    if (isAuthenticated && !selectedUniversity) {
      toast.error('Please select a university first');
      return;
    }
    if (!selectedTest) {
      toast.error('Please select an entry test (or pick a university to auto-select)');
      return;
    }

    const baseF = MERIT_FORMULAS[selectedTest as keyof typeof MERIT_FORMULAS];
    const formulaForValidation = baseF
      ? applyMeritUniversityRule(baseF as MeritFormulaRow, universityMeritRule)
      : null;
    if (!formulaForValidation) {
      toast.error('Invalid entry test selection');
      return;
    }

    // Validate required fields (matric only when it has weight in the selected formula)
    if (
      formulaForValidation.matricWeight > 0 &&
      (!matricObtained || parseFloat(matricObtained) <= 0)
    ) {
      toast.error('Please enter matric obtained marks');
      return;
    }

    if (!interObtained || parseFloat(interObtained) <= 0) {
      toast.error('Please enter intermediate obtained marks');
      return;
    }

    const testOptional = universityMeritRule?.entryTestOptional || formulaForValidation.testWeight <= 0;
    if (
      !testOptional &&
      (!testObtained || parseFloat(testObtained) <= 0)
    ) {
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
          matricMarks:
            formulaForValidation.matricWeight > 0
              ? parseFloat(matricObtained)
              : 0,
          intermediateMarks: parseFloat(interObtained),
          firstYearMarks: firstYearMarks ? parseFloat(firstYearMarks) : undefined,
          secondYearMarks: secondYearMarks ? parseFloat(secondYearMarks) : undefined,
          entryTestMarks:
            formulaForValidation.testWeight > 0 ? parseFloat(testObtained || '0') : 0,
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
    const baseF = MERIT_FORMULAS[selectedTest as keyof typeof MERIT_FORMULAS];
    if (!baseF) return;
    const formula = applyMeritUniversityRule(baseF as MeritFormulaRow, universityMeritRule);

    const matricPercentage = parseFloat(matricTotal) > 0 
      ? (parseFloat(matricObtained) / parseFloat(matricTotal)) * 100 
      : 0;
    const interPercentage = parseFloat(interTotal) > 0
      ? (parseFloat(interObtained) / parseFloat(interTotal)) * 100
      : 0;
    const testPercentage =
      formula.testWeight > 0 && parseFloat(testObtained) > 0 && formula.maxMarks > 0
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
            initial={false}
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
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="space-y-6">
              {isAuthenticated && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">
                      Select University <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => {
                        setSelectedUniversity(e.target.value);
                        setSelectedProgram('');
                        setShowResult(false);
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="">
                        {loadingUniversities && universities.length === 0
                          ? 'Loading universities…'
                          : 'Select University'}
                      </option>
                      {universities.map((uni) => {
                        const id = String((uni as University & { id?: string })._id ?? (uni as University & { id?: string }).id);
                        return (
                          <option key={id} value={id}>
                            {universityNameLabel(uni.name)}
                            {stripUnknownUniversityText(uni.city)
                              ? ` (${stripUnknownUniversityText(uni.city)})`
                              : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Select Program (optional — for program-specific merit)</label>
                    <select
                      value={selectedProgram}
                      onChange={(e) => {
                        setSelectedProgram(e.target.value);
                        setShowResult(false);
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      disabled={!selectedUniversity || loadingPrograms}
                    >
                      <option value="">
                        {!selectedUniversity
                          ? 'Select University first'
                          : loadingPrograms
                            ? 'Loading programs…'
                            : 'Select Program'}
                      </option>
                      {programs.map((prog) => {
                        const id = String((prog as Program & { id?: string })._id ?? (prog as Program & { id?: string }).id);
                        return (
                          <option key={id} value={id}>
                            {prog.name} ({prog.degree})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              {/* Merit formula: sab kuch ek hi gradient box — neeche % ek line, beech gap, koi partition nahi */}
              {selectedFormula && (
                <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
                  <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-600 px-4 pb-4 pt-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100/90">
                      Merit formula
                    </p>
                    <p className="mt-2 text-2xl font-bold leading-none tracking-tight">{selectedTest || '—'}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-snug text-blue-100/95">
                      {meritFormulaSubtitleAfterCode(
                        selectedTest,
                        MERIT_FORMULAS[selectedTest as MeritFormulaKey]?.name ?? ''
                      ) ||
                        MERIT_FORMULAS[selectedTest as MeritFormulaKey]?.name}
                    </p>
                    {useBackendCalculation && meritResult && (
                      <p className="mt-2 text-xs text-blue-100/85">
                        {meritResult.criteria.university} — {meritResult.criteria.program}
                      </p>
                    )}
                    {useBackendCalculation && meritResult ? (
                      <div className="mt-4 flex flex-wrap items-baseline text-sm text-blue-50/95">
                        {meritResult.criteria.weights.matric > 0 && (
                          <>
                            <span className="shrink-0 whitespace-nowrap">
                              Matric:{' '}
                              <strong className="font-bold text-white">{meritResult.criteria.weights.matric}%</strong>
                            </span>
                            <span
                              className="shrink-0 px-3 text-base font-light text-blue-200/90 sm:px-5"
                              aria-hidden
                            >
                              ·
                            </span>
                          </>
                        )}
                        <span className="shrink-0 whitespace-nowrap">
                          Intermediate:{' '}
                          <strong className="font-bold text-white">
                            {meritResult.criteria.weights.intermediate}%
                          </strong>
                        </span>
                        <span
                          className="shrink-0 px-3 text-base font-light text-blue-200/90 sm:px-5"
                          aria-hidden
                        >
                          ·
                        </span>
                        <span className="shrink-0 whitespace-nowrap">
                          Test:{' '}
                          <strong className="font-bold text-white">{meritResult.criteria.weights.entryTest}%</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-baseline text-sm text-blue-50/95">
                        {selectedFormula.matricWeight > 0 && (
                          <>
                            <span className="shrink-0 whitespace-nowrap">
                              Matric:{' '}
                              <strong className="font-bold text-white">{selectedFormula.matricWeight}%</strong>
                            </span>
                            <span
                              className="shrink-0 px-3 text-base font-light text-blue-200/90 sm:px-5"
                              aria-hidden
                            >
                              ·
                            </span>
                          </>
                        )}
                        <span className="shrink-0 whitespace-nowrap">
                          Intermediate:{' '}
                          <strong className="font-bold text-white">{selectedFormula.interWeight}%</strong>
                        </span>
                        <span
                          className="shrink-0 px-3 text-base font-light text-blue-200/90 sm:px-5"
                          aria-hidden
                        >
                          ·
                        </span>
                        <span className="shrink-0 whitespace-nowrap">
                          Test:{' '}
                          <strong className="font-bold text-white">{selectedFormula.testWeight}%</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Entry test: merit formula ke neeche — guests manually; logged-in jab multiple tests hon */}
              {(!isAuthenticated || (isAuthenticated && selectedUniversity && inferredEntryTests.length > 1)) && (
                <div>
                  <label className="block text-sm mb-3">
                    Select Entry Test <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(isAuthenticated && selectedUniversity
                      ? inferredEntryTests
                      : (Object.keys(MERIT_FORMULAS) as string[])
                    ).map((test) => (
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
                              selectedTest === test ? 'border-amber-500 bg-amber-500' : 'border-slate-400'
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
                          {MERIT_FORMULAS[test as keyof typeof MERIT_FORMULAS]?.name || test}
                        </p>
                      </div>
                    ))}
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
                <div className="space-y-2">
                  {'intermediateHint' in selectedFormula &&
                    (selectedFormula as { intermediateHint?: string }).intermediateHint && (
                      <p className="text-xs text-slate-600">
                        {(selectedFormula as { intermediateHint: string }).intermediateHint}
                      </p>
                    )}
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
                </div>
              )}

              {/* Test Marks Input */}
              {selectedFormula && selectedFormula.testWeight > 0 && (
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
            initial={false}
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
                        {(selectedFormula?.testWeight ?? 0) > 0 && (
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
                        )}
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
