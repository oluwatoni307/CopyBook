import { formatDuration } from "../engine/stats.js";

const BREAK_MESSAGES = [
  "You've been at this a while \u2014 a short hand break wouldn't hurt.",
  "Good stretch of practice. Worth shaking out your hands for a minute.",
  "That's a solid run \u2014 a quick pause before you keep going.",
];

export function mountPracticeView({ engine, statsStore, breakTracker, root = document }) {
  const el = id => root.getElementById(id);
  const hiddenInput = el("hiddenInput");
  const textWrap = el("textWrap");
  const chunkTag = el("chunkTag");

  function charState(i, typed, target) {
    if (i < typed.length) return typed[i] === target[i] ? "correct" : "wrong";
    if (i === typed.length) return "current";
    return "pending";
  }

  function render(state) {
    const { tier, tierIndex, round, streak, currentSnippet, chunkIndex, target, typed, justCompleted, cleanCount, disabled } = state;

    el("eyebrow").textContent = tier.eyebrow + (tierIndex === state.tiersLength - 1 && round > 1 ? " \u00b7 Round " + round : "");
    el("tierName").textContent = tier.name;
    el("streakVal").textContent = streak;
    el("streak").className = "streak" + (streak > 0 ? " active" : "");

    chunkTag.style.display = currentSnippet.chunks.length > 1 ? "block" : "none";
    chunkTag.textContent = "part " + (chunkIndex + 1) + "/" + currentSnippet.chunks.length;

    textWrap.innerHTML = "";
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      const st = charState(i, typed, target);
      if (ch === "\n") {
        if (st === "current") {
          const span = document.createElement("span");
          span.className = "caret-return";
          span.textContent = "\u21b5";
          textWrap.appendChild(span);
        }
        textWrap.appendChild(document.createElement("br"));
        continue;
      }
      const span = document.createElement("span");
      span.className = "ch " + (
        st === "correct" ? "ch-correct" :
        st === "wrong" ? "ch-wrong" :
        st === "current" ? "ch-current" :
        (ch === " " ? "ch-pending-space" : "ch-pending")
      );
      span.textContent = ch === " " ? "\u00b7" : ch;
      textWrap.appendChild(span);
    }

    const card = el("card");
    card.className = "card" + (justCompleted === "clean" ? " glow-clean" : justCompleted === "rough" ? " glow-rough" : "");

    const dotsEl = el("dots");
    dotsEl.innerHTML = "";
    for (let i = 0; i < tier.required; i++) {
      const d = document.createElement("span");
      d.className = "dot" + (i < cleanCount ? " filled" : "");
      dotsEl.appendChild(d);
    }
    el("hint").textContent = tier.snippets.some(s => s.chunks.some(c => (typeof c === "string" ? c : c.code).includes("\n")))
      ? "Tab inserts an indent" : "Type it once, cleanly";

    hiddenInput.disabled = disabled;
    if (!disabled) {
      hiddenInput.value = typed;
      requestAnimationFrame(() => hiddenInput.focus());
    }
  }

  function showToast(text) {
    const t = el("toast");
    t.textContent = text;
    t.classList.add("visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove("visible"), 1800);
  }

  function showTip(text) {
    const bar = el("tipBar");
    bar.textContent = text;
    bar.classList.add("visible");
  }
  function hideTip() {
    el("tipBar").classList.remove("visible");
  }

  function showBreakReminder() {
    const bar = el("breakBar");
    el("breakText").textContent = BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)];
    bar.classList.add("visible");
    clearTimeout(showBreakReminder._timer);
    showBreakReminder._timer = setTimeout(hideBreakReminder, 20 * 1000);
  }
  function hideBreakReminder() {
    el("breakBar").classList.remove("visible");
    clearTimeout(showBreakReminder._timer);
  }
  breakTracker.onBreak = showBreakReminder;

  function openInsights() {
    const sessionEl = el("insightsSession");
    sessionEl.innerHTML = `
      <div class="insights-row"><span>Lines</span><span class="val">${engine.getSessionLines()}</span></div>
      <div class="insights-row"><span>Time practiced</span><span class="val">${formatDuration(breakTracker.getSessionActiveMs())}</span></div>
    `;

    const linesEl = el("insightsLines");
    const totalLines = statsStore.getTotalLines();
    linesEl.innerHTML = `<div class="insights-row"><span>Total</span><span class="val">${totalLines} line${totalLines === 1 ? "" : "s"}</span></div>`;

    const tEl = el("insightsTransitions");
    const cEl = el("insightsChars");
    const sEl = el("insightsShift");

    const worstT = statsStore.getWorstTransitions(5);
    tEl.innerHTML = worstT.length
      ? worstT.map(t => `<div class="insights-row"><span>${t.key}</span><span class="val">+${Math.round(t.excess)}ms</span></div>`).join("")
      : '<div class="insights-empty">Not enough data yet.</div>';

    const worstC = statsStore.getWorstChars(5);
    cEl.innerHTML = worstC.length
      ? worstC.map(c => `<div class="insights-row"><span>${c.ch === " " ? "\u00b7 (space)" : c.ch}</span><span class="val">${Math.round(c.rate * 100)}% miss</span></div>`).join("")
      : '<div class="insights-empty">Not enough data yet.</div>';

    const shift = statsStore.getShiftSummary();
    sEl.innerHTML = shift.total >= 5
      ? `<div class="insights-row"><span>Same-side shift</span><span class="val">${Math.round((shift.sameHand / shift.total) * 100)}% of ${shift.total}</span></div>`
      : '<div class="insights-empty">Not enough data yet.</div>';

    el("insightsPanel").classList.add("visible");
  }
  el("insightsBtn").addEventListener("click", openInsights);
  el("insightsCloseBtn").addEventListener("click", () => el("insightsPanel").classList.remove("visible"));

  hiddenInput.addEventListener("keydown", (e) => {
    const result = engine.handleKeydown(e);
    if (result === "handled-tab") e.preventDefault();
  });
  hiddenInput.addEventListener("keyup", (e) => engine.handleKeyup(e));
  hiddenInput.addEventListener("input", () => engine.handleInput(hiddenInput.value));
  hiddenInput.addEventListener("paste", (e) => e.preventDefault());

  el("skipBtn").addEventListener("click", () => engine.skip());
  el("breakDismiss").addEventListener("click", hideBreakReminder);

  return {
    onEngineChange(state) {
      render(state);
      if (state.toast) showToast(state.toast);
      if (state.tip) showTip(state.tip);
      else if (state.tip === null && state.chunkIndex === 0 && state.typed === "") hideTip();
      if (state.openInsights) openInsights();
    },
  };
}
