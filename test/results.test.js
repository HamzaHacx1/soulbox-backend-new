const assert = require("node:assert/strict");
const { computeResults } = require("../src/services/results");

function submission(overrides = {}) {
  return {
    desire: {
      genre_calling: { value: "Fantasy" },
      genre_subflavour: { value: "fantasy_epic_quests" },
      plot_engine: { value: "truth" },
      tone: { value: "Warm" },
      pacing: { value: "Medium" },
      literary_depth: { value: "Mixed" },
      sensitivity: { value: "Gentle" },
      ...(overrides.desire || {}),
    },
    reader_context: { age_stage: { value: "A" }, ...(overrides.reader_context || {}) },
    yearning: { final: { value: "To discover" }, ...(overrides.yearning || {}) },
  };
}

const cases = [
  ["Fantasy branch", submission(), { texture: "Threshold", why: "Wonder and awe", house: "Soul", style: "Reader" }],
  ["Global Inner", submission({ desire: { genre_calling: { value: "Horror" }, plot_engine: { value: "self" }, literary_depth: { value: "Literary" } } }), { texture: "Inner" }],
  ["Global Abyss", submission({ desire: { tone: { value: "Heavy" }, sensitivity: { value: "Unflinching" }, plot_engine: { value: "death" } } }), { texture: "Abyss" }],
  ["Global Surge", submission({ desire: { tone: { value: "Tense" }, sensitivity: { value: "Unflinching" }, plot_engine: { value: "truth" } } }), { texture: "Surge" }],
  ["Sci-Fi", submission({ desire: { genre_calling: { value: "Science Fiction" }, genre_subflavour: { value: "sci_cyber" }, literary_depth: { value: "Literary" } } }), { texture: "Populace" }],
  ["Romance visual override", submission({ desire: { genre_calling: { value: "Romantasy" }, genre_subflavour: { value: "rom_healing_love" }, genre_visual: { value: "rom_visual_royal" }, tone: { value: "Warm" }, sensitivity: { value: "Gentle" } } }), { texture: "Web" }],
  ["Historical", submission({ desire: { genre_calling: { value: "Historical Fiction" }, genre_flavour: { value: "hist_recent_ww1" }, genre_subflavour: {} , tone: { value: "Melancholic" } } }), { texture: "Ache" }],
  ["Literary override", submission({ desire: { genre_calling: { value: "Literary" }, genre_flavour: { value: "cont_family_secrets" }, genre_visual: { value: "Psychological" } } }), { texture: "Inner" }],
  ["Contemporary", submission({ desire: { genre_calling: { value: "Contemporary" }, genre_flavour: { value: "cont_society_crisis" }, tone: { value: "Grounded" } } }), { texture: "Populace" }],
  ["Horror", submission({ desire: { genre_calling: { value: "Horror" }, plot_engine: { value: "survival" } } }), { texture: "Gauntlet" }],
];

for (const [name, input, expected] of cases) {
  const actual = computeResults(input);
  for (const [key, value] of Object.entries(expected)) assert.equal(actual[key], value, `${name}: ${key}`);
  for (const key of ["texture", "why", "style", "house", "curator"]) assert.ok(actual[key], `${name}: ${key} is blank`);
}

console.log(`Result mapping tests passed (${cases.length} cases).`);
