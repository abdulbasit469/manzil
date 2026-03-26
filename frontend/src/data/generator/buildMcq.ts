import type { MockQuestion } from '../mockTestTypes';

export function shuffleFour(
  correct: string,
  w1: string,
  w2: string,
  w3: string,
  rng: () => number
): { options: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 } {
  const arr = [correct, w1, w2, w3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  const correctIndex = arr.indexOf(correct) as 0 | 1 | 2 | 3;
  return { options: arr as [string, string, string, string], correctIndex };
}

export function makeQ(
  id: string,
  section: string,
  text: string,
  correct: string,
  wrongs: [string, string, string],
  rng: () => number
): MockQuestion {
  const { options, correctIndex } = shuffleFour(correct, wrongs[0], wrongs[1], wrongs[2], rng);
  return { id, section, text, options, correctIndex };
}
