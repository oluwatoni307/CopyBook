import { createQuizEngine } from "./engine/quiz-engine.js";
import { mountQuizView } from "./ui/quiz-view.js";
import { initTheme } from "./ui/theme.js";
import { tiers } from "./content/quiz/index.js";

initTheme();

let view;
const engine = createQuizEngine({
  tiers,
  onChange: (state) => view.onEngineChange(state),
});

view = mountQuizView({ engine });
engine.boot();
