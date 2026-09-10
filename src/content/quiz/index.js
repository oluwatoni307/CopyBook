// Quiz mode content index.
//
// Combines the three difficulty tier files into the `tiers` shape the
// quiz engine expects: [{ name, questions: [...] }, ...]
// Progression through tiers is streak-gated (see engine/quiz-engine.js).
//
// To add more questions to a tier, edit easy.js / medium.js / hard.js
// directly — each is a flat array of { id, language, question, options,
// correctOptionId, explanation }. `id` must stay unique across all three
// files combined (validated at load time below).

import { questions as easyQuestions } from "./easy.js";
import { questions as mediumQuestions } from "./medium.js";
import { questions as hardQuestions } from "./hard.js";

export const tiers = [
  { name: "Easy", questions: easyQuestions },
  { name: "Medium", questions: mediumQuestions },
  { name: "Hard", questions: hardQuestions },
];

// Basic shape + uniqueness validation at load time, so a malformed or
// duplicated question fails loudly during development.
const seenIds = new Set();
for (const tier of tiers) {
  for (const q of tier.questions) {
    if (!q.id || !q.language || !q.question || !Array.isArray(q.options) || q.options.length < 2) {
      console.warn(`Quiz question "${q.id || "(unknown)"}" is malformed`);
    }
    if (seenIds.has(q.id)) {
      console.warn(`Duplicate quiz question id: ${q.id}`);
    }
    seenIds.add(q.id);
    if (!q.options.some(o => o.id === q.correctOptionId)) {
      console.warn(`Quiz question "${q.id}" has a correctOptionId not present in its options`);
    }
  }
}

export function getTotalQuestionCount() {
  return tiers.reduce((sum, t) => sum + t.questions.length, 0);
}
