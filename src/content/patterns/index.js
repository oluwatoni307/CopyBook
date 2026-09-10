// Patterns registry.
//
// Each category file exports `patterns`: an array of
//   { id, name, category, language, description, code }
//
// To add a new category (e.g. concurrency patterns, functional patterns),
// create a new file in this folder following the shape of oop.js or
// design-patterns.js, then import + register it below. Nothing in
// patterns-engine.js or the Patterns UI needs to change.

import { patterns as oopPatterns } from "./oop.js";
import { patterns as designPatterns } from "./design-patterns.js";
import { patterns as concurrencyPatterns } from "./concurrency.js";

const REGISTRY = [
  ...oopPatterns,
  ...designPatterns,
  ...concurrencyPatterns,
];

// Basic shape validation at load time so a malformed pattern fails loudly
// during development rather than silently breaking the UI later.
const REQUIRED_FIELDS = ["id", "name", "category", "language", "description", "code"];
for (const p of REGISTRY) {
  for (const field of REQUIRED_FIELDS) {
    if (!p[field]) {
      console.warn(`Pattern "${p.id || "(unknown)"}" is missing required field "${field}"`);
    }
  }
}

export function getAllPatterns() {
  return REGISTRY;
}

export function getCategories() {
  return [...new Set(REGISTRY.map(p => p.category))];
}

export function getLanguages() {
  return [...new Set(REGISTRY.map(p => p.language))];
}

export function getPatternsByCategory(category) {
  return REGISTRY.filter(p => p.category === category);
}

export function getPatternById(id) {
  return REGISTRY.find(p => p.id === id);
}
