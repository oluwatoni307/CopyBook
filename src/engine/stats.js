// Shared hesitation/familiarity stats engine.
// Used by practice-engine.js (chunked tier practice, both Practice and
// Generative modes). Patterns mode does NOT use this — it has its own
// lightweight progress tracking in patterns-engine.js.

export const HAND_OF_CODE = {
  Backquote: "left", Digit1: "left", Digit2: "left", Digit3: "left", Digit4: "left", Digit5: "left",
  Digit6: "right", Digit7: "right", Digit8: "right", Digit9: "right", Digit0: "right", Minus: "right", Equal: "right",
  KeyQ: "left", KeyW: "left", KeyE: "left", KeyR: "left", KeyT: "left",
  KeyY: "right", KeyU: "right", KeyI: "right", KeyO: "right", KeyP: "right", BracketLeft: "right", BracketRight: "right", Backslash: "right",
  KeyA: "left", KeyS: "left", KeyD: "left", KeyF: "left", KeyG: "left",
  KeyH: "right", KeyJ: "right", KeyK: "right", KeyL: "right", Semicolon: "right", Quote: "right",
  KeyZ: "left", KeyX: "left", KeyC: "left", KeyV: "left", KeyB: "left",
  KeyN: "right", KeyM: "right", Comma: "right", Period: "right", Slash: "right",
};

const STORAGE_PREFIX = "iweAkowe_stats_v1_";

function defaults() {
  return { transitions: {}, chars: {}, recentDeltas: [], shift: { sameHand: 0, total: 0 }, lastTipShownAt: 0, totalLines: 0 };
}

/**
 * Creates an isolated stats tracker scoped to a storage key (e.g. per
 * language: "python", "dart"). Each language keeps its own hesitation
 * profile since finger patterns differ by syntax.
 */
export function createStatsStore(scopeKey) {
  const storageKey = STORAGE_PREFIX + scopeKey;
  let stats = load();

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return { ...defaults(), ...JSON.parse(raw) };
    } catch (e) {}
    return defaults();
  }

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(stats)); } catch (e) {}
  }

  function recordDelta(prevChar, char, delta) {
    if (delta == null || delta > 2000) return;
    stats.recentDeltas.push(delta);
    if (stats.recentDeltas.length > 300) stats.recentDeltas.shift();
    const key = prevChar + "\u2192" + char;
    const t = stats.transitions[key] || { sum: 0, count: 0 };
    t.sum += delta; t.count += 1;
    stats.transitions[key] = t;
  }

  function recordAttempt(char, correct) {
    const c = stats.chars[char] || { attempts: 0, misses: 0 };
    c.attempts += 1;
    if (!correct) c.misses += 1;
    stats.chars[char] = c;
  }

  function recordShift(sameHand) {
    stats.shift.total += 1;
    if (sameHand) stats.shift.sameHand += 1;
  }

  function addLines(n) {
    stats.totalLines = (stats.totalLines || 0) + n;
  }

  function rollingMedian() {
    const arr = stats.recentDeltas.slice().sort((a, b) => a - b);
    if (!arr.length) return 0;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  }

  function getWorstTransitions(n) {
    const median = rollingMedian();
    return Object.entries(stats.transitions)
      .map(([key, v]) => ({ key, avg: v.sum / v.count, count: v.count }))
      .filter(t => t.count >= 3)
      .map(t => ({ ...t, excess: t.avg - median }))
      .filter(t => t.excess > 0)
      .sort((a, b) => b.excess - a.excess)
      .slice(0, n);
  }

  function getWorstChars(n) {
    return Object.entries(stats.chars)
      .map(([ch, v]) => ({ ch, rate: v.misses / v.attempts, attempts: v.attempts, misses: v.misses }))
      .filter(c => c.attempts >= 5 && c.misses > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, n);
  }

  function getShiftSummary() {
    return { sameHand: stats.shift.sameHand, total: stats.shift.total };
  }

  function getTotalLines() {
    return stats.totalLines || 0;
  }

  function getLastTipShownAt() {
    return stats.lastTipShownAt || 0;
  }

  function setLastTipShownAt(ts) {
    stats.lastTipShownAt = ts;
    save();
  }

  return {
    recordDelta, recordAttempt, recordShift, addLines, save,
    getWorstTransitions, getWorstChars, getShiftSummary, getTotalLines,
    getLastTipShownAt, setLastTipShownAt,
  };
}

/**
 * Tracks active typing time and fires a break reminder every
 * BREAK_INTERVAL_MS of active time. A pause longer than IDLE_RESET_MS
 * counts as a break already taken and resets the clock.
 */
export function createBreakTracker({ onBreak, intervalMs = 12 * 60 * 1000, idleResetMs = 45 * 1000 } = {}) {
  let activeMs = 0;
  let sessionActiveMs = 0;
  let lastActivityTs = null;
  let lastBreakShownAtActiveMs = 0;

  function trackActivity() {
    const now = Date.now();
    if (lastActivityTs != null) {
      const delta = now - lastActivityTs;
      if (delta < idleResetMs) {
        activeMs += delta;
      } else {
        activeMs = 0;
        lastBreakShownAtActiveMs = 0;
      }
    }
    lastActivityTs = now;

    if (activeMs - lastBreakShownAtActiveMs >= intervalMs) {
      lastBreakShownAtActiveMs = activeMs;
      if (onBreak) onBreak();
    }
  }

  function addSessionActiveMs(ms) {
    sessionActiveMs += ms;
  }

  function getSessionActiveMs() {
    return sessionActiveMs;
  }

  return { trackActivity, addSessionActiveMs, getSessionActiveMs };
}

export function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
