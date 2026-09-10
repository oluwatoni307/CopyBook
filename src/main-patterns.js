import { createPatternsEngine } from "./engine/patterns-engine.js";
import { initTheme } from "./ui/theme.js";
import { getAllPatterns, getCategories, getPatternsByCategory } from "./content/patterns/index.js";

initTheme();

const el = id => document.getElementById(id);
const categorySelect = el("categorySelect");
const patternSelect = el("patternSelect");
const patternName = el("patternName");
const patternCategory = el("patternCategory");
const patternDesc = el("patternDesc");
const completedBadge = el("completedBadge");
const textWrap = el("textWrap");
const hiddenInput = el("hiddenInput");
const completionStatus = el("completionStatus");
const progressLabel = el("progressLabel");
const blockProgressFill = el("blockProgressFill");
const toast = el("toast");

const allPatterns = getAllPatterns();
const categories = getCategories();

let engine; // assigned below, referenced by populatePatternSelect for completion marks

categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");

function populatePatternSelect(category) {
  const inCategory = getPatternsByCategory(category);
  patternSelect.innerHTML = inCategory.map(p => {
    const done = engine && engine.isPatternCompleted(p.id);
    const mark = done ? "\u2713 " : "";
    const cls = done ? ' class="completed-option"' : "";
    return `<option value="${p.id}"${cls}>${mark}${p.name} (${p.language})</option>`;
  }).join("");
}

function charState(i, typed, target) {
  if (i < typed.length) return typed[i] === target[i] ? "correct" : "wrong";
  if (i === typed.length) return "current";
  return "pending";
}

function renderCode(target, typed) {
  textWrap.innerHTML = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    const state = charState(i, typed, target);
    if (ch === "\n") {
      if (state === "current") {
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
      state === "correct" ? "ch-correct" :
      state === "wrong" ? "ch-wrong" :
      state === "current" ? "ch-current" :
      (ch === " " ? "ch-pending-space" : "ch-pending")
    );
    span.textContent = ch === " " ? "\u00b7" : ch;
    textWrap.appendChild(span);
  }
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("visible"), 1800);
}

function render(state) {
  progressLabel.textContent = `${state.completedCount} / ${state.totalCount} patterns`;

  if (!state.currentPattern) {
    patternName.textContent = "\u2014";
    patternCategory.textContent = "\u2014";
    patternDesc.textContent = "Choose a pattern above.";
    textWrap.innerHTML = "";
    completionStatus.textContent = "";
    completedBadge.style.display = "none";
    blockProgressFill.style.width = "0%";
    return;
  }

  patternName.textContent = state.currentPattern.name;
  patternCategory.textContent = `${state.currentPattern.category} \u00b7 ${state.currentPattern.language}`;
  patternDesc.textContent = state.currentPattern.description;
  renderCode(state.currentPattern.code, state.typed);

  const card = el("card");
  card.className = "card" + (state.justFinished ? " glow-clean" : "");

  completedBadge.style.display = state.isCompleted ? "inline-flex" : "none";
  completionStatus.textContent = state.isCompleted
    ? "Retyping \u2014 already marked complete"
    : `${state.typed.length} / ${state.currentPattern.code.length} characters`;

  const pct = state.currentPattern.code.length
    ? Math.min(100, (state.typed.length / state.currentPattern.code.length) * 100)
    : 0;
  blockProgressFill.style.width = pct + "%";

  hiddenInput.value = state.typed;
  if (!state.justCompleted) requestAnimationFrame(() => hiddenInput.focus());
}

engine = createPatternsEngine({
  patterns: allPatterns,
  onChange: (state) => {
    render(state);
    if (state.justFinished) {
      showToast("Clean pass \u2014 nice.");
      populatePatternSelect(categorySelect.value); // refresh completion marks
    }
  },
});

categorySelect.addEventListener("change", () => {
  populatePatternSelect(categorySelect.value);
  const first = getPatternsByCategory(categorySelect.value)[0];
  if (first) {
    patternSelect.value = first.id;
    engine.selectPattern(first.id);
  }
});

patternSelect.addEventListener("change", () => {
  engine.selectPattern(patternSelect.value);
});

hiddenInput.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "Tab") {
    e.preventDefault();
    engine.handleTab();
  }
});
hiddenInput.addEventListener("input", () => engine.handleInput(hiddenInput.value));
hiddenInput.addEventListener("paste", (e) => e.preventDefault());

el("resetBtn").addEventListener("click", () => engine.reset());

// Boot: first category, first pattern.
if (categories.length) {
  categorySelect.value = categories[0];
  populatePatternSelect(categories[0]);
  const first = getPatternsByCategory(categories[0])[0];
  if (first) {
    patternSelect.value = first.id;
    engine.selectPattern(first.id);
  }
}

categorySelect.addEventListener("change", () => {
  populatePatternSelect(categorySelect.value);
  const first = getPatternsByCategory(categorySelect.value)[0];
  if (first) {
    patternSelect.value = first.id;
    engine.selectPattern(first.id);
  }
});

patternSelect.addEventListener("change", () => {
  engine.selectPattern(patternSelect.value);
});

hiddenInput.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "Tab") {
    e.preventDefault();
    engine.handleTab();
  }
});
hiddenInput.addEventListener("input", () => engine.handleInput(hiddenInput.value));
hiddenInput.addEventListener("paste", (e) => e.preventDefault());

el("resetBtn").addEventListener("click", () => engine.reset());

// Boot: first category, first pattern.
if (categories.length) {
  categorySelect.value = categories[0];
  populatePatternSelect(categories[0]);
  const first = getPatternsByCategory(categories[0])[0];
  if (first) {
    patternSelect.value = first.id;
    engine.selectPattern(first.id);
  }
}
