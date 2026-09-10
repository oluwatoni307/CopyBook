# Iwe Akọwé — The Copybook

A typing-familiarity trainer for code syntax. Instead of testing raw WPM, it
builds a hesitation profile: which character transitions you're slow on,
which characters you miscount, whether your shift-hand habits are creating
strain — while you work through real, idiomatic snippets in tiers of
increasing complexity.

By Toniking.

## Modes

The app is four separate static pages, sharing a common style system:

- **Practice** (`practice.html`) — the original mode. A curated,
  hand-written bank of snippets, organized into four tiers (Warm-up →
  Fluent → Compound → Composed). Clear a tier's required number of clean
  passes to unlock the next; clearing every tier starts a new round at
  Tier 1. Supports Python and Dart, switchable in the header.

- **Generative** (`generative.html`) — shares Practice's tier/round/streak
  engine and Skip button, but the *view* is deliberately different: you
  don't see the target code. Instead you get an English prompt (e.g.
  "Define a variable x and assign it the value 5") and type the code from
  understanding, not from sight. Untyped characters render as faint ghost
  dots — no length-revealing whitespace hints beyond what you've already
  typed — with the same live green/red correctness coloring as Practice as
  you type. Content comes from a pre-generated pool (`*-generated.js`)
  where each entry is a `{ prompt, code }` pair, not bare code. Practice
  and Generative share a stats store per language, since they're both
  measuring the same underlying hesitation profile — a snippet skipped in
  one mode may resurface in the other.

- **Patterns** (`patterns.html`) — a different kind of exercise entirely.
  Pick a common programming pattern (OOP fundamentals, classic design
  patterns, more categories over time), read its description, and type the
  whole block in one continuous pass — no chunking, no tiers, no streak.
  Progress here is just a completion set (which pattern IDs you've typed
  cleanly), tracked independently of the tiered-practice stats.

- **Quiz** (`quiz.html`) — 300 multiple-choice questions across Python,
  Flutter, and FastAPI, split into three difficulty tiers (Easy → Medium →
  Hard, 100 questions each, languages mixed within a tier rather than
  siloed). Feedback is immediate: pick an option and see correct/incorrect
  plus an explanation right away. Progression is streak-gated like
  Practice's dots — 5 correct answers in a row unlocks the next tier; a
  wrong answer resets the streak to 0 but never knocks you back down.
  Questions loop/reshuffle indefinitely within a tier once you've seen
  them all — the pool never "runs out." Its own `quiz-engine.js` and
  `quiz-view.js`, not shared with the other three modes, since multiple-
  choice-with-immediate-feedback is a different interaction shape than
  typing.

All state (stats, progress, theme, language choice) lives in
`localStorage` — no backend, no accounts.

## Running it

No build step. Serve the folder over HTTP (ES modules don't load over
`file://`):

```bash
python3 -m http.server 8000
# or: npx serve
```

Then open `http://localhost:8000/practice.html` (or `/generative.html`,
`/patterns.html`, `/quiz.html`). The root `index.html` redirects to Practice.

Deploying to Vercel: point it at this repo as a static site — `vercel.json`
already disables clean URLs so `/practice.html` etc. resolve as written.
No environment variables or build command needed.

## Project structure

```
index.html            redirects to /practice.html
practice.html          Practice mode page
generative.html        Generative mode page
patterns.html          Patterns mode page
quiz.html               Quiz mode page

src/
  styles.css            shared design tokens + all page styles

  content/
    python-bank.js        Python tiered snippet bank (Practice) — 163 chunks
    dart-bank.js           Dart tiered snippet bank (Practice) — 164 chunks
    python-generated.js    Python generative pool ({prompt, code} pairs) — 97 chunks
    dart-generated.js      Dart generative pool ({prompt, code} pairs) — 70 chunks
    patterns/
      index.js              registry — imports + combines all pattern files
      oop.js                OOP fundamentals category — 16 patterns
      design-patterns.js    classic design patterns category — 24 patterns
      concurrency.js        concurrency & async patterns category — 10 patterns
    quiz/
      index.js              combines the three tier files into quiz-engine's
                             expected shape, validates ids/structure at load
      easy.js                Easy tier — 100 questions
      medium.js              Medium tier — 100 questions
      hard.js                Hard tier — 100 questions

  engine/
    practice-engine.js    tier/round/streak/chunk logic — content-agnostic,
                           powers both Practice and Generative
    patterns-engine.js    separate engine for Patterns mode (no tiers)
    quiz-engine.js         separate engine for Quiz mode — streak-gated
                           tier unlock, multiple-choice, immediate feedback
    stats.js               hesitation stats (timing, miss rates, shift-hand),
                           break reminders — per-language storage

  ui/
    practice-view.js      DOM rendering + wiring for Practice mode — shows
                           the target text as you type
    generative-view.js    DOM rendering + wiring for Generative mode — shows
                           an English prompt, masks the target as ghost dots
    quiz-view.js            DOM rendering + wiring for Quiz mode — options,
                           correct/wrong highlighting, explanation, streak dots
    theme.js               light/dark theme toggle, shared by all pages

  main-practice.js       entry point: wires python/dart banks into the
                           practice engine + practice-view, handles language
                           switching
  main-generative.js     entry point: wires generated pools into the same
                           practice engine but generative-view instead
  main-patterns.js       entry point: patterns engine + category/pattern
                           selection UI
  main-quiz.js            entry point: wires the combined quiz tiers into
                           quiz-engine + quiz-view
```

## Extending content

### Adding snippets to a language bank (Practice mode)

Open `src/content/python-bank.js` or `dart-bank.js` and add to the
relevant tier's `snippets` array:

```js
{ category: "core", chunks: ["your_snippet_here"] }
```

`category` is tracked in stats but not yet surfaced in the UI — it's
scaffolding for a future per-category insights breakdown. `chunks` is a
single-element array of a **plain string** unless you want the snippet
typed as multiple sequential parts (see the `Composed` tier for examples
using `if`/`else` or `try`/`except` split across two chunks).

### Filling in the generative pools (Generative mode)

`python-generated.js` and `dart-generated.js` follow the same `tiers` /
`snippets` shape as the bank files, but each `chunks` entry is an object,
**not a bare string**:

```js
{ category: "core", chunks: [{ prompt: "Assign 5 to x.", code: "x = 5" }] }
```

`prompt` is the English instruction shown to the learner; `code` is the
hidden target they type from understanding — it is never displayed, only
matched against character-by-character (see `ui/generative-view.js` for
the masking logic). Getting the prompt right matters: it needs to specify
variable names, exact values, and any function names the code must use,
since there's no visible target to disambiguate against.

Current volume (97 Python / 70 Dart chunks) is a real improvement over the
original 1-snippet-per-tier starter, but still smaller than the hand-written
banks — treat it as a floor to build on, not a finished pool. Extend by
adding more `{ prompt, code }` pairs to any tier's `snippets` array.

### Adding a new language

1. Create `src/content/<lang>-bank.js` and (optionally)
   `src/content/<lang>-generated.js`, following the existing shape.
2. Add the language to the `LANG_TIERS` map in both `main-practice.js`
   and `main-generative.js`.
3. Add an `<option>` to the `#langSelect` dropdown in `practice.html` and
   `generative.html`.

### Adding a new pattern category

1. Create `src/content/patterns/<category>.js` exporting a `patterns`
   array, following the shape in `oop.js`:
   ```js
   export const patterns = [
     {
       id: "unique-id",            // must be unique across ALL pattern files
       name: "Display name",
       category: "Category label",  // groups patterns in the UI dropdown
       language: "python" | "dart" | ...,
       description: "What this pattern is and when it's used.",
       code: `the full code block, typed as one continuous pass`,
     },
   ];
   ```
2. Import and spread it into the `REGISTRY` array in
   `src/content/patterns/index.js`.

Nothing in `patterns-engine.js` or `main-patterns.js` needs to change —
the registry is the only integration point.

### Adding quiz questions

Open `src/content/quiz/easy.js`, `medium.js`, or `hard.js` and add to the
flat `questions` array:

```js
{
  id: "unique-id",              // must be unique across ALL THREE tier files
  language: "python" | "flutter" | "fastapi",
  question: "What does len([1, 2, 3]) return?",
  options: [
    { id: "a", text: "2" },
    { id: "b", text: "3" },
    { id: "c", text: "4" },
    { id: "d", text: "Error" },
  ],
  correctOptionId: "b",
  explanation: "len() returns the number of items in the list.",
}
```

`src/content/quiz/index.js` combines all three files and validates
(at load time, logging warnings to the console) that every `id` is
unique across the combined set and that every `correctOptionId` matches
one of that question's `options`. Nothing in `quiz-engine.js` or
`main-quiz.js` needs to change when adding questions — only when adding
a whole new tier (which would also mean updating the `tiers` array shape
and the streak-gate assumptions in `quiz-engine.js`, since it currently
assumes a linear Easy → Medium → Hard progression).

## Design notes

- The tiered practice engine (`practice-engine.js`) is deliberately
  content-agnostic: it only needs `{ name, eyebrow, required, snippets }`
  tiers. This is what lets Practice (curated bank) and Generative (large
  pool) share identical mechanics and stats plumbing.
- Patterns mode is intentionally a separate, simpler engine — no
  tier/round/streak concepts apply to "type this whole pattern once."
- Quiz mode is also a separate engine, since multiple-choice with
  immediate feedback is a different interaction shape from typing —
  it borrows the *idea* of streak-gated tier progression from Practice's
  dots but implements it independently for correct/incorrect answers
  rather than clean/rough typed passes.
- Stats (timing, miss rates, shift-hand usage) are stored per-language
  (`iweAkowe_stats_v1_<lang>`), not per-mode — Practice and Generative
  contribute to the same profile for a given language. Quiz mode does not
  use this stats store at all; it tracks its own lightweight running
  accuracy in memory for the current session only (not persisted).
- Everything runs as plain ES modules with no bundler. This is a
  deliberate simplicity trade-off for a small, contribution-friendly
  project — if the content or engine complexity grows significantly, a
  lightweight bundler (esbuild/Vite) would be a reasonable next step, but
  isn't needed at the current scale.
