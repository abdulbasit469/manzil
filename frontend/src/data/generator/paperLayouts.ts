/**
 * Official-style section counts (MCQ-only where the real test mixes essays, we only simulate MCQ blocks).
 */
export type SectionRow = { name: string; count: number; genre: string };

export type PaperLayout = {
  testName: string;
  officialTotalQuestions: number;
  officialDurationMinutes: number;
  officialDurationLabel: string;
  negativeMarking: 'none' | 'quarter_wrong' | 'ecat_style';
  negativeMarkingLabel: string;
  sections: SectionRow[];
};

export const PAPER_LAYOUTS: Record<string, PaperLayout> = {
  ECAT: {
    testName: 'ECAT',
    officialTotalQuestions: 100,
    officialDurationMinutes: 100,
    officialDurationLabel: '100 minutes',
    negativeMarking: 'ecat_style',
    negativeMarkingLabel: 'Yes (−¼ mark per wrong ≈ −1 per 4 wrong)',
    sections: [
      { name: 'Mathematics', count: 30, genre: 'math' },
      { name: 'Physics', count: 30, genre: 'physics' },
      { name: 'English', count: 10, genre: 'english' },
      { name: 'Chemistry / Computer Science', count: 30, genre: 'chemistry_cs' },
    ],
  },
  MDCAT: {
    testName: 'MDCAT',
    officialTotalQuestions: 200,
    officialDurationMinutes: 210,
    officialDurationLabel: '210 minutes (3.5 hours)',
    negativeMarking: 'none',
    negativeMarkingLabel: 'No negative marking',
    sections: [
      { name: 'Biology', count: 68, genre: 'biology' },
      { name: 'Chemistry', count: 54, genre: 'chemistry' },
      { name: 'Physics', count: 54, genre: 'physics' },
      { name: 'English', count: 18, genre: 'english' },
      { name: 'Logical Reasoning', count: 6, genre: 'iq' },
    ],
  },
  NET: {
    testName: 'NET',
    officialTotalQuestions: 120,
    officialDurationMinutes: 120,
    officialDurationLabel: '120 minutes',
    negativeMarking: 'quarter_wrong',
    negativeMarkingLabel: 'Yes (25% deduction per wrong — practice: −¼ per wrong)',
    sections: [
      { name: 'Mathematics', count: 40, genre: 'math' },
      { name: 'Physics', count: 30, genre: 'physics' },
      { name: 'Chemistry / Computer Science', count: 30, genre: 'chemistry_cs' },
      { name: 'English', count: 20, genre: 'english' },
      { name: 'IQ / Analytical', count: 10, genre: 'iq' },
    ],
  },
  ETEA: {
    testName: 'ETEA',
    officialTotalQuestions: 160,
    officialDurationMinutes: 160,
    officialDurationLabel: '160 minutes',
    negativeMarking: 'none',
    negativeMarkingLabel: 'No negative marking',
    sections: [
      { name: 'Mathematics', count: 60, genre: 'math' },
      { name: 'Physics', count: 60, genre: 'physics' },
      { name: 'Chemistry / Computer', count: 30, genre: 'chemistry_cs' },
      { name: 'English', count: 10, genre: 'english' },
    ],
  },
  NAT: {
    testName: 'NAT',
    officialTotalQuestions: 90,
    officialDurationMinutes: 120,
    officialDurationLabel: '120 minutes',
    negativeMarking: 'none',
    negativeMarkingLabel: 'No negative marking',
    sections: [
      { name: 'Verbal', count: 27, genre: 'verbal' },
      { name: 'Analytical', count: 27, genre: 'analytical' },
      { name: 'Quantitative', count: 36, genre: 'quant' },
    ],
  },
  PIEAS: {
    testName: 'PIEAS',
    officialTotalQuestions: 100,
    officialDurationMinutes: 120,
    officialDurationLabel: '120 minutes (2 hours)',
    negativeMarking: 'quarter_wrong',
    negativeMarkingLabel: 'Yes (practice: −¼ per wrong)',
    sections: [
      { name: 'Mathematics', count: 30, genre: 'math' },
      { name: 'Physics', count: 30, genre: 'physics' },
      { name: 'Chemistry', count: 20, genre: 'chemistry' },
      { name: 'English', count: 20, genre: 'english' },
    ],
  },
  GIKI: {
    testName: 'GIKI',
    officialTotalQuestions: 100,
    officialDurationMinutes: 120,
    officialDurationLabel: '120 minutes',
    negativeMarking: 'quarter_wrong',
    negativeMarkingLabel: 'Yes (practice: −¼ per wrong)',
    sections: [
      { name: 'Mathematics', count: 40, genre: 'math' },
      { name: 'Physics', count: 30, genre: 'physics' },
      { name: 'English', count: 20, genre: 'english' },
      { name: 'Logical Reasoning', count: 10, genre: 'iq' },
    ],
  },
  GAT: {
    testName: 'GAT',
    officialTotalQuestions: 100,
    officialDurationMinutes: 120,
    officialDurationLabel: '120 minutes (2 hours)',
    negativeMarking: 'none',
    negativeMarkingLabel: 'No negative marking',
    sections: [
      { name: 'Verbal Reasoning', count: 30, genre: 'verbal' },
      { name: 'Quantitative Reasoning', count: 30, genre: 'quant' },
      { name: 'Analytical Reasoning', count: 40, genre: 'analytical' },
    ],
  },
  SAT: {
    testName: 'SAT',
    officialTotalQuestions: 98,
    officialDurationMinutes: 134,
    officialDurationLabel: '134 minutes',
    negativeMarking: 'none',
    negativeMarkingLabel: 'No negative marking',
    sections: [
      { name: 'Reading & Writing', count: 54, genre: 'rw' },
      { name: 'Mathematics', count: 44, genre: 'sat_math' },
    ],
  },
  IBA: {
    testName: 'IBA',
    officialTotalQuestions: 100,
    officialDurationMinutes: 120,
    officialDurationLabel: '120 minutes',
    negativeMarking: 'quarter_wrong',
    negativeMarkingLabel: 'Yes (practice: −¼ per wrong)',
    sections: [
      { name: 'Mathematics', count: 35, genre: 'math' },
      { name: 'English', count: 45, genre: 'english' },
      { name: 'IQ / General Knowledge', count: 20, genre: 'gk' },
    ],
  },
  AKU: {
    testName: 'AKU',
    officialTotalQuestions: 100,
    officialDurationMinutes: 120,
    officialDurationLabel: '120 minutes (2 hours)',
    negativeMarking: 'none',
    negativeMarkingLabel: 'No negative marking',
    sections: [
      { name: 'English', count: 20, genre: 'english' },
      { name: 'Science Reasoning (Biology, Chemistry, Physics)', count: 60, genre: 'science_mixed' },
      { name: 'Logical Reasoning', count: 20, genre: 'iq' },
    ],
  },
  LAT: {
    testName: 'LAT',
    officialTotalQuestions: 75,
    officialDurationMinutes: 150,
    officialDurationLabel: '150 minutes (full paper includes essay — this run is MCQ-only)',
    negativeMarking: 'none',
    negativeMarkingLabel: 'No negative marking',
    sections: [
      { name: 'MCQs - English', count: 20, genre: 'english' },
      { name: 'MCQs - General Knowledge', count: 20, genre: 'gk' },
      { name: 'MCQs - Islamic Studies', count: 10, genre: 'islamic' },
      { name: 'MCQs - Pakistan Studies', count: 10, genre: 'pakstudy' },
      { name: 'MCQs - Mathematics', count: 5, genre: 'math' },
      { name: 'MCQs - Urdu', count: 10, genre: 'urdu' },
    ],
  },
};
