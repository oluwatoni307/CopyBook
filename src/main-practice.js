import { createPracticeEngine } from "./engine/practice-engine.js";
import { createStatsStore, createBreakTracker } from "./engine/stats.js";
import { mountPracticeView } from "./ui/practice-view.js";
import { initTheme } from "./ui/theme.js";
import { tiers as pythonTiers } from "./content/python-bank.js";
import { tiers as dartTiers } from "./content/dart-bank.js";

initTheme();

const LANG_TIERS = { python: pythonTiers, dart: dartTiers };
const LANG_STORAGE_KEY = "iweAkowe_practiceLang";

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

  view = mountPracticeView({ engine, statsStore, breakTracker });
  engine.boot();
}

langSelect.addEventListener("change", () => boot(langSelect.value));

boot(currentLang);
