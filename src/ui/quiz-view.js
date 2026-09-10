// Quiz mode's rendering: multiple-choice options, immediate feedback on
// selection (correct/wrong highlighting + explanation), a Next button to
// advance, and a streak-dot indicator showing progress toward unlocking
// the next difficulty tier — mirroring Practice's dot-progress language
// but for a streak rather than a clean-pass count.

export function mountQuizView({ engine, root = document }) {
  const el = id => root.getElementById(id);
  const tierLabel = el("quizTierLabel");
  const langTag = el("quizLangTag");
  const questionEl = el("quizQuestion");
  const optionsEl = el("quizOptions");
  const explanationEl = el("quizExplanation");
  const nextRow = el("quizNextRow");
  const streakDotsEl = el("quizStreakDots");
  const streakLabel = el("quizStreakLabel");
  const statsRow = el("quizStatsRow");
  const toast = el("toast");

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  function render(state) {
    const { tier, currentQuestion, selectedOptionId, answered, streak, streakToUnlock, isLastTier, nextTierName, totalAnswered, totalCorrect } = state;

    tierLabel.textContent = tier.name + " tier";
    langTag.textContent = currentQuestion.language;
    questionEl.textContent = currentQuestion.question;

    // Streak dots: filled up to current streak, capped at streakToUnlock.
    // On the last tier there's nothing left to unlock, so dots are hidden
    // in favor of a plain running-streak label.
    if (isLastTier) {
      streakDotsEl.style.display = "none";
      streakLabel.textContent = `Streak: ${streak}`;
    } else {
      streakDotsEl.style.display = "flex";
      streakDotsEl.innerHTML = "";
      for (let i = 0; i < streakToUnlock; i++) {
        const d = document.createElement("span");
        d.className = "streak-dot" + (i < streak ? " filled" : "");
        streakDotsEl.appendChild(d);
      }
      streakLabel.textContent = `${streak}/${streakToUnlock} to unlock ${nextTierName}`;
    }

    optionsEl.innerHTML = "";
    for (const opt of currentQuestion.options) {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = opt.text;
      btn.disabled = answered;
      if (answered) {
        if (opt.id === currentQuestion.correctOptionId) btn.classList.add("correct-answer");
        else if (opt.id === selectedOptionId) btn.classList.add("wrong-answer");
      }
      btn.addEventListener("click", () => engine.selectOption(opt.id));
      optionsEl.appendChild(btn);
    }

    if (answered) {
      const wasCorrect = selectedOptionId === currentQuestion.correctOptionId;
      explanationEl.style.display = "block";
      explanationEl.innerHTML = `<span class="verdict ${wasCorrect ? "correct" : "wrong"}">${wasCorrect ? "Correct." : "Not quite."}</span> ${currentQuestion.explanation}`;
      nextRow.style.display = "flex";
    } else {
      explanationEl.style.display = "none";
      nextRow.style.display = "none";
    }

    const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    statsRow.textContent = totalAnswered ? `${totalCorrect}/${totalAnswered} correct (${accuracy}%)` : "";
  }

  el("quizSkipBtn").addEventListener("click", () => engine.skip());
  el("quizNextBtn").addEventListener("click", () => engine.next());

  return {
    onEngineChange(state) {
      render(state);
      if (state.toast) showToast(state.toast);
    },
  };
}
