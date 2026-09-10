import { createPracticeEngine } from "./engine/practice-engine.js";
import { createStatsStore, createBreakTracker } from "./engine/stats.js";
import { mountGenerativeView } from "./ui/generative-view.js";
import { initTheme } from "./ui/theme.js";
import { tiers as pythonGenerated } from "./content/python-generated.js";
import { tiers as dartGenerated } from "./content/dart-generated.js";

// Generative mode shares the SAME tier/round/streak engine as Practice —
// only the content source (large generated pool) and the VIEW differ.
// The view is the important difference: generative-view.js hides the
// target code and shows only an English prompt, unlike practice-view.js
// which shows the target text in full. See generative-view.js for the
// masking logic. Stats are tracked per-language, shared with Practice
// mode's stats store, since they're both measuring the same underlying
// hesitation profile for that language regardless of which mode surfaced
// the snippet.

initTheme();

const LANG_TIERS = { python: pythonGenerated, dart: dartGenerated };
const LANG_STORAGE_KEY = "iweAkowe_generativeLang";

const langSelect = document.getElementById("langSelect");
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || "python";
langSelect.value = currentLang;

let view = null;
let breakTracker = null;

function boot(lang) {
  currentLang = lang;
  try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) {}

  const statsStore = createStatsStore(lang);
  breakTracker = createBreakTracker({});

  const engine = createPracticeEngine({
    tiers: LANG_TIERS[lang],
    statsStore,
    breakTracker,
    onChange: (state) => view.onEngineChange({ ...state, tiersLength: LANG_TIERS[lang].length }),
  });

  view = mountGenerativeView({ engine, statsStore, breakTracker });
  engine.boot();
}

langSelect.addEventListener("change", () => boot(langSelect.value));

boot(currentLang);
