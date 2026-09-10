// Quiz mode engine.
//
// Multiple-choice, difficulty-tiered (Easy -> Medium -> Hard), mixed
// language content per tier. Progression is streak-gated like Practice
// mode: STREAK_TO_UNLOCK correct answers in a row unlocks the next tier;
// a wrong answer resets the streak to 0 (does not knock you back a tier).
// Once the top tier is unlocked, or within any tier, questions loop/reshuffle
// indefinitely — the pool does not run out.
//
// Feedback is immediate: selecting an option reveals correct/incorrect
// right away (via emitted state), then the caller advances to the next
// question (typically after a short delay, handled by the view layer).

const STREAK_TO_UNLOCK = 5;

export function createQuizEngine({ tiers, onChange }) {
  let tierIndex = 0;
  let streak = 0;
  let bestStreak = 0;
  let totalAnswered = 0;
  let totalCorrect = 0;
  let currentQuestion = null;
  let selectedOptionId = null;
  let answered = false;
  let lastQuestion = null;

  function pickQuestion(idx, avoid) {
    const pool = tiers[idx].questions;
    if (pool.length === 1) return pool[0];
    let next = avoid;
    while (next === avoid) next = pool[Math.floor(Math.random() * pool.length)];
    return next;
  }

  function emit(extra = {}) {
    onChange({
      tierIndex,
      tier: tiers[tierIndex],
      nextTierName: tierIndex < tiers.length - 1 ? tiers[tierIndex + 1].name : null,
      streak,
      bestStreak,
      totalAnswered,
      totalCorrect,
      streakToUnlock: STREAK_TO_UNLOCK,
      currentQuestion,
      selectedOptionId,
      answered,
      isLastTier: tierIndex === tiers.length - 1,
      ...extra,
    });
  }

  function loadQuestion() {
    currentQuestion = pickQuestion(tierIndex, lastQuestion);
    lastQuestion = currentQuestion;
    selectedOptionId = null;
    answered = false;
  }

  function selectOption(optionId) {
    if (answered || !currentQuestion) return;
    selectedOptionId = optionId;
    answered = true;
    totalAnswered++;
    const correct = optionId === currentQuestion.correctOptionId;
    if (correct) {
      totalCorrect++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }

    let unlocked = false;
    if (correct && streak >= STREAK_TO_UNLOCK && tierIndex < tiers.length - 1) {
      unlocked = true;
    }

    emit({ justAnswered: true, wasCorrect: correct, unlocked });
  }

  function next() {
    if (!answered) return;
    // Tier-unlock check happens here so the correct/incorrect flash is
    // visible before the tier changes underneath the learner.
    if (streak >= STREAK_TO_UNLOCK && tierIndex < tiers.length - 1) {
      tierIndex++;
      streak = 0;
      lastQuestion = null;
      loadQuestion();
      emit({ toast: tiers[tierIndex].name + " unlocked" });
    } else {
      loadQuestion();
      emit();
    }
  }

  function skip() {
    loadQuestion();
    emit();
  }

  function boot() {
    loadQuestion();
    emit();
  }

  return { boot, selectOption, next, skip };
}
