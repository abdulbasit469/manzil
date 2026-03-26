import type { MockQuestion, NegativeMarkingRule } from './mockTestTypes';

export function computeScore(
  answers: (number | null)[],
  questions: MockQuestion[],
  rule: NegativeMarkingRule
): {
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;
  maxScore: number;
} {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const n = questions.length;
  const maxScore = n;

  for (let i = 0; i < n; i++) {
    const a = answers[i];
    const c = questions[i].correctIndex;
    if (a === null || a === undefined) {
      unanswered += 1;
    } else if (a === c) {
      correct += 1;
    } else {
      wrong += 1;
    }
  }

  let score = 0;
  if (rule === 'none') {
    score = correct;
  } else if (rule === 'quarter_wrong') {
    // −¼ mark per wrong (NET / IBA / PIEAS / GIKI style)
    score = Math.max(0, correct - 0.25 * wrong);
  } else if (rule === 'ecat_style') {
    // −1 mark per 4 wrong answers ⇒ −0.25 per wrong
    score = Math.max(0, correct - 0.25 * wrong);
  }

  return { correct, wrong, unanswered, score, maxScore };
}

/**
 * Timer for mock: full paper (practiceQs ≥ officialQs) uses official duration (capped 240m).
 * Shorter subsets scale proportionally (12–official cap).
 */
export function scaledTimeMinutes(officialMinutes: number, practiceQs: number, officialQs: number): number {
  if (officialQs <= 0 || practiceQs <= 0) return Math.max(12, Math.min(officialMinutes, 240));
  if (practiceQs >= officialQs) return Math.max(12, Math.min(officialMinutes, 240));
  const m = Math.round((officialMinutes * practiceQs) / officialQs);
  return Math.max(12, Math.min(officialMinutes, m));
}
