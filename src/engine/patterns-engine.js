// Patterns mode engine.
//
// Deliberately separate from practice-engine.js: no tiers, no rounds, no
// streaks. You pick a pattern, read its description, type the whole code
// block in one continuous pass (not chunked), and it's marked complete.
// Progress here is just "which pattern IDs have you completed" — a simple
// completion set, persisted independently of the tiered-practice stats.

const STORAGE_KEY = "iweAkowe_patternsProgress_v1";

function loadCompleted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

function saveCompleted(set) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch (e) {}
}

export function createPatternsEngine({ patterns, onChange }) {
  let completed = loadCompleted();
  let currentPattern = null;
  let typed = "";
  let justCompleted = false;

  function emit(extra = {}) {
    onChange({
      currentPattern, typed, justCompleted,
      isCompleted: currentPattern ? completed.has(currentPattern.id) : false,
      completedCount: completed.size,
      totalCount: patterns.length,
      ...extra,
    });
  }

  function selectPattern(id) {
    const pattern = patterns.find(p => p.id === id);
    if (!pattern) return;
    currentPattern = pattern;
    typed = "";
    justCompleted = false;
    emit();
  }

  function handleInput(rawValue) {
    if (!currentPattern) return;
    const target = currentPattern.code;
    let value = rawValue;
    if (value.length > target.length) value = value.slice(0, target.length);
    typed = value;

    if (typed.length === target.length) {
      const clean = typed === target;
      if (clean) {
        completed.add(currentPattern.id);
        saveCompleted(completed);
        justCompleted = true;
      }
      emit({ justFinished: clean });
    } else {
      emit();
    }
  }

  function handleTab() {
    if (!currentPattern) return;
    const target = currentPattern.code;
    const remaining = target.length - typed.length;
    const insertion = "  ".slice(0, Math.max(0, remaining));
    if (!insertion) return;
    typed = typed + insertion;
    if (typed.length === target.length) {
      const clean = typed === target;
      if (clean) {
        completed.add(currentPattern.id);
        saveCompleted(completed);
        justCompleted = true;
      }
      emit({ justFinished: clean });
    } else {
      emit();
    }
  }

  function reset() {
    typed = "";
    justCompleted = false;
    emit();
  }

  function isPatternCompleted(id) {
    return completed.has(id);
  }

  return { selectPattern, handleInput, handleTab, reset, isPatternCompleted, emit };
}
