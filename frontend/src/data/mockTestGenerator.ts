import type { MockPaperPack, MockQuestion } from './mockTestTypes';
import { PAPER_LAYOUTS } from './generator/paperLayouts';
import { generateOneQuestion } from './generator/subjects';

/**
 * Builds a full-length practice paper (75–200 MCQs) matching Manzil’s official section counts.
 * Questions are procedurally generated with deterministic seeds (same indices → same stems/options).
 */
export function generateMockPaperPack(testName: string): MockPaperPack | null {
  const layout = PAPER_LAYOUTS[testName];
  if (!layout) return null;

  const questions: MockQuestion[] = [];
  let global = 0;
  for (const sec of layout.sections) {
    for (let i = 0; i < sec.count; i++) {
      questions.push(generateOneQuestion(testName, sec.name, sec.genre, i, global));
      global += 1;
    }
  }

  return {
    testName: layout.testName,
    officialTotalQuestions: layout.officialTotalQuestions,
    officialDurationMinutes: layout.officialDurationMinutes,
    officialDurationLabel: layout.officialDurationLabel,
    negativeMarking: layout.negativeMarking,
    negativeMarkingLabel: layout.negativeMarkingLabel,
    questions,
  };
}

/** Alias for existing imports */
export function getMockPaperPack(testName: string): MockPaperPack | null {
  return generateMockPaperPack(testName);
}
