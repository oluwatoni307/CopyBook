// Language- and content-agnostic tiered practice engine.
//
// Any content source that provides `tiers` shaped like:
//   [{ name, eyebrow, required, snippets: [{ category, chunks: [chunk, ...] }] }, ...]
// can drive this engine. Each `chunk` is EITHER:
//   - a plain string (the code to type) — used by Practice mode, where the
//     target text is shown to the learner as they type.
//   - a { prompt, code } object — used by Generative mode, where `prompt`
//     is an English instruction shown to the learner and `code` is the
//     hidden target they type from memory/understanding, not from sight.
// The engine normalizes both shapes internally (see chunkOf/promptOf) so
// tier/round/streak/multi-chunk logic is identical either way — only the
// UI layer (practice-view.js vs generative-view.js) treats `prompt`
// differently: practice-view ignores it (there is none); generative-view
// renders it as the visible instruction and masks the code.
//
// This is what lets Practice mode (hand-written bank) and Generative mode
// (large pre-generated pool) share identical progression mechanics while
// presenting completely different interaction models.
//
// The engine is UI-agnostic: it exposes state + actions, and calls
// `onChange(state)` whenever something the UI should render has changed.

import { HAND_OF_CODE } from "./stats.js";

export function createPracticeEngine({ tiers, statsStore, breakTracker, onChange, tipCooldownMs = 12 * 60 * 60 * 1000 }) {
  let tierIndex = 0;
  let round = 1;
  let cleanCount = 0;
  let streak = 0;
  let currentSnippet = { category: "core", chunks: [] };
  let chunkIndex = 0;
  let cleanAllChunks = true;
  let target = "";
  let typed = "";
  let justCompleted = null;
  let lastKeyTime = null;
  let pendingKey = null;
  let activeShiftSide = null;
  let sameHandThisSession = 0;
  let tipShownThisSession = false;
  let sessionCompletions = 0;
  let summaryMilestoneHit = false;
  let lastSnippet = null;
  let chunkStartTime = null;
  let sessionLines = 0;
  let disabled = false;

  function pickSnippet(idx, avoid) {
    const pool = tiers[idx].snippets;
    if (pool.length === 1) return pool[0];
    let next = avoid;
    while (next === avoid) next = pool[Math.floor(Math.random() * pool.length)];
    return next;
  }

  // A chunk is either a plain string or { prompt, code }. These two
  // helpers are the only place that distinction is resolved, so the rest
  // of the engine can just deal with plain strings.
  function codeOf(chunk) {
    return typeof chunk === "string" ? chunk : chunk.code;
  }
  function promptOf(chunk) {
    return typeof chunk === "string" ? null : (chunk.prompt || null);
  }

  function emit(extra = {}) {
    onChange({
      tierIndex, round, cleanCount, streak,
      tier: tiers[tierIndex],
      currentSnippet, chunkIndex, target, typed, justCompleted, disabled,
      prompt: promptOf(currentSnippet.chunks[chunkIndex]),
      ...extra,
    });
  }

  function maybeGetTip() {
    if (tipShownThisSession) return null;
    const cooldownOk = (Date.now() - statsStore.getLastTipShownAt()) > tipCooldownMs;
    if (sameHandThisSession >= 3 && cooldownOk) {
      tipShownThisSession = true;
      statsStore.setLastTipShownAt(Date.now());
      return "Noticed a few same-side shift chords \u2014 try the opposite shift key for symbols like { } ( ) _ +. It can ease pinky strain.";
    }
    return null;
  }

  function startSnippet(idx, snippet) {
    tierIndex = idx;
    currentSnippet = snippet;
    chunkIndex = 0;
    cleanAllChunks = true;
    lastSnippet = snippet;
    const tip = maybeGetTip();
    loadChunk();
    emit({ tip });
  }

  function loadChunk() {
    target = codeOf(currentSnippet.chunks[chunkIndex]);
    typed = "";
    justCompleted = null;
    lastKeyTime = null;
    chunkStartTime = null;
    disabled = false;
  }

  function evaluateNewChar(index) {
    const targetChar = target[index];
    const correct = typed[index] === targetChar;
    statsStore.recordAttempt(targetChar, correct);
  }

  function completeChunk(cleanChunk) {
    if (!cleanChunk) cleanAllChunks = false;
    const lines = target.split("\n").length;
    statsStore.addLines(lines);
    sessionLines += lines;
    if (chunkStartTime != null) breakTracker.addSessionActiveMs(Date.now() - chunkStartTime);
    statsStore.save();
    justCompleted = cleanChunk ? "clean" : "rough";
    disabled = true;
    emit();
    setTimeout(() => {
      if (chunkIndex + 1 < currentSnippet.chunks.length) {
        chunkIndex++;
        loadChunk();
        emit();
      } else {
        completeSnippet(cleanAllChunks);
      }
    }, 380);
  }

  function completeSnippet(clean) {
    sessionCompletions++;
    streak = clean ? streak + 1 : 0;
    const newClean = clean ? cleanCount + 1 : 0;
    cleanCount = newClean;
    const tier = tiers[tierIndex];
    statsStore.save();

    setTimeout(() => {
      let toast = null;
      if (newClean >= tier.required) {
        if (tierIndex === tiers.length - 1) {
          round++;
          cleanCount = 0;
          toast = "Round " + round + " \u2014 " + tier.name;
          startSnippet(tierIndex, pickSnippet(tierIndex, lastSnippet));
        } else {
          cleanCount = 0;
          toast = tiers[tierIndex + 1].name + " unlocked";
          startSnippet(tierIndex + 1, pickSnippet(tierIndex + 1, null));
        }
      } else {
        startSnippet(tierIndex, pickSnippet(tierIndex, lastSnippet));
      }
      if (toast) emit({ toast });

      let milestone = false;
      if (sessionCompletions >= 15 && !summaryMilestoneHit) {
        summaryMilestoneHit = true;
        milestone = true;
      }
      if (milestone) emit({ openInsights: true });
    }, 0);
  }

  function handleTab() {
    if (justCompleted) return;
    breakTracker.trackActivity();
    const remaining = target.length - typed.length;
    const insertion = "    ".slice(0, Math.max(0, remaining));
    if (!insertion) return;
    if (chunkStartTime === null && typed.length === 0) chunkStartTime = Date.now();
    const now = performance.now();
    const startIdx = typed.length;
    typed = typed + insertion;
    for (let i = 0; i < insertion.length; i++) evaluateNewChar(startIdx + i);
    if (lastKeyTime != null) statsStore.recordDelta(target[startIdx - 1] || "start", target[startIdx], now - lastKeyTime);
    lastKeyTime = now;
    emit();
    if (typed.length === target.length) completeChunk(typed === target);
  }

  function handleKeydown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return null;
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      activeShiftSide = e.code;
      return null;
    }
    if (e.key === "Tab") {
      handleTab();
      return "handled-tab";
    }
    if (e.key.length === 1) {
      pendingKey = { key: e.key, code: e.code, shiftKey: e.shiftKey, time: performance.now() };
    } else {
      pendingKey = null;
    }
    return null;
  }

  function handleKeyup(e) {
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      if (activeShiftSide === e.code) activeShiftSide = null;
    }
  }

  function handleInput(rawValue) {
    if (justCompleted) return;
    breakTracker.trackActivity();
    let value = rawValue;
    if (value.length > target.length) value = value.slice(0, target.length);

    const isBackspace = value.length < typed.length;

    if (!isBackspace && chunkStartTime === null && typed.length === 0 && value.length > 0) {
      chunkStartTime = Date.now();
    }

    if (!isBackspace && pendingKey) {
      const index = value.length - 1;
      if (index >= 0) {
        if (lastKeyTime != null) statsStore.recordDelta(target[index - 1] || "start", target[index], pendingKey.time - lastKeyTime);
        lastKeyTime = pendingKey.time;

        if (pendingKey.shiftKey && activeShiftSide && HAND_OF_CODE[pendingKey.code]) {
          const keyHand = HAND_OF_CODE[pendingKey.code];
          const shiftHand = activeShiftSide === "ShiftLeft" ? "left" : "right";
          const sameHand = keyHand === shiftHand;
          statsStore.recordShift(sameHand);
          if (sameHand) sameHandThisSession++;
        }
      }
    }

    typed = value;
    if (!isBackspace && typed.length > 0) evaluateNewChar(typed.length - 1);
    pendingKey = null;
    emit();

    if (typed.length === target.length) completeChunk(typed === target);
  }

  function skip() {
    startSnippet(tierIndex, pickSnippet(tierIndex, lastSnippet));
  }

  function getSessionLines() {
    return sessionLines;
  }

  function boot() {
    startSnippet(0, pickSnippet(0, null));
  }

  return {
    boot, skip, handleKeydown, handleKeyup, handleInput,
    getSessionLines,
  };
}
