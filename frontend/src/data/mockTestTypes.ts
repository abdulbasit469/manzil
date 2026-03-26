/** Practice MCQ mock aligned with MockTestPage paper patterns (subset of questions, indicative only). */

export type NegativeMarkingRule = 'none' | 'quarter_wrong' | 'ecat_style';

export interface MockQuestion {
  id: string;
  section: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface MockPaperPack {
  testName: string;
  /** Official total questions (from card) — used to scale timer */
  officialTotalQuestions: number;
  /** Official duration in minutes (for scaling practice time) */
  officialDurationMinutes: number;
  /** Official duration string for display */
  officialDurationLabel: string;
  negativeMarking: NegativeMarkingRule;
  negativeMarkingLabel: string;
  questions: MockQuestion[];
}
