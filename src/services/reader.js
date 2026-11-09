// Readers (Logic & Data Spec 7.2, Section 9) for the November quiz.
const db = require("./supabase");
const L = require("../logic/soulbox-logic");

const SITE = "https://soulboxed.com";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LONG = 10000;
const SWIPE_ANSWERS = ["Loved it", "Didn't like it", "Want to read", "Not interested"];
const DARKNESS = ["Gentle", "Testing", "Unflinching"];

class ReaderError extends Error { constructor(status, message) { super(message); this.status = status; } }

const text = (max) => (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new Error("must be text");
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`must be at most ${max} characters`);
  return trimmed || null;
};
const oneOf = (values) => (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (!values.includes(value)) throw new Error(`must be one of: ${values.join(", ")}`);
  return value;
};
const mask = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (![1, 2, 3].includes(n)) throw new Error("must be 1, 2 or 3");
  return n;
};
const swipe = (value) => {
  const clean = text(400)(value);
  if (clean === null) return null;
  const answer = clean.split(" | ").pop();
  if (!SWIPE_ANSWERS.includes(answer)) throw new Error(`must end with one of: ${SWIPE_ANSWERS.join(", ")}`);
  return clean;
};
const email = (value) => {
  const clean = text(254)(value);
  if (clean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error("must be a valid email");
  return clean && clean.toLowerCase();
};
// Existing questions' answers, keyed by their existing field names (e.g. "desire.tone").
const legacy = (value) => {
  if (value === null || value === undefined) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("must be an object");
  const size = JSON.stringify(value).length;
  if (size > 60000) throw new Error("is too large");
  for (const key of Object.keys(value)) if (!/^[a-z_]+(\.[a-z0-9_]+)*$/i.test(key)) throw new Error(`has an invalid key: ${key}`);
  return value;
};

const FIELD_RULES = {
  reading_type: oneOf(["quick", "full"]),
  last_screen_reached: text(80),
  answers: legacy,
  genre_calling: oneOf(L.GENRES),
  genre_flavour: text(100),
  gate_1: oneOf(L.GATE_1),
  gate_2: oneOf(Object.values(L.GATE_TABLE).flatMap((row) => Object.keys(row)).filter((k) => k !== "*")),
  darkness: oneOf(DARKNESS),
  olympics_q1: oneOf(["correct", "decoy", "optout"]),
  olympics_q2: oneOf(["correct", "decoy", "optout"]),
  olympics_q3: oneOf(["correct", "decoy", "optout"]),
  olympics_q4: oneOf(["correct", "decoy", "optout"]),
  olympics_q5: oneOf(["commercial", "upmarket", "literary"]),
  masks_silver: mask, masks_gold: mask, masks_black: mask,
  swipe_deck: oneOf(Object.keys(L.ARCHETYPES)),
  ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`swipe_${String(i + 1).padStart(2, "0")}`, swipe])),
  triggers_other: text(500),
  eden_first_law: text(LONG), eden_shortage: text(LONG), eden_betrayal: text(LONG),
  final_mirror: text(LONG), final_ghost: text(LONG), final_rejection: text(LONG),
  full_reading_completed: oneOf(["yes", "no"]),
  results_saved: oneOf(["yes"]),
  house_joined: oneOf(["yes", "no"]),
  first_name: text(100),
  email,
  country: text(100),
  country_detected: text(100),
};

function assertReaderId(id) {
  if (typeof id !== "string" || !UUID.test(id)) throw new ReaderError(400, "Invalid reader_id.");
  return id.toLowerCase();
}

function sanitizeReaderPatch(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new ReaderError(400, "Expected an object of answers.");
  const clean = {};
  for (const [field, value] of Object.entries(patch)) {
    const rule = FIELD_RULES[field];
    if (!rule) throw new ReaderError(400, `Unknown field: ${field}`);
    try { clean[field] = rule(value); } catch (error) { throw new ReaderError(400, `${field} ${error.message}`); }
  }
  // Unticking "Other" on triggers discards its text (Build Brief G4).
  if (clean.answers && Array.isArray(clean.answers["reader_context.heavy_triggers"]) &&
      !clean.answers["reader_context.heavy_triggers"].includes("Other") && !("triggers_other" in clean)) clean.triggers_other = null;
  return clean;
}

function fullReadingLink(readerId) { return `${SITE}/full?id=${readerId}`; }

async function createReader({ reader_id, source_ref, ab_variant, session_id, reading_type }) {
  const id = assertReaderId(reader_id);
  const ref = typeof source_ref === "string" ? source_ref.trim().slice(0, 100) : "";
  const rows = await db.insert("readers", {
    reader_id: id,
    source_ref: ref || null,
    ab_variant: ab_variant === "A" || ab_variant === "B" ? ab_variant : null,
    session_id: typeof session_id === "string" ? session_id.slice(0, 200) : null,
    reading_type: oneOf(["quick", "full"])(reading_type),
    full_reading_link: fullReadingLink(id),
    last_screen_reached: "choice_screen",
  }, { ignoreDuplicates: true });
  return { reader_id: id, created: rows.length > 0, reader: rows[0] || null };
}

async function updateReader(readerId, patch) {
  const id = assertReaderId(readerId);
  const clean = sanitizeReaderPatch(patch);
  if (!Object.keys(clean).length) return { reader_id: id };
  const rows = await db.update("readers", `reader_id=${db.eq(id)}`, { ...clean, sheet_synced_at: null });
  if (!rows.length) throw new ReaderError(404, "Reader not found.");
  return { reader_id: id, reader: rows[0] };
}

async function getReader(readerId) {
  const rows = await db.select("readers", `reader_id=${db.eq(assertReaderId(readerId))}&select=*`);
  return rows[0] || null;
}

// Section 4: calculate from the saved answers and save every calculated field.
async function calculateResults(readerId) {
  const reader = await getReader(readerId);
  if (!reader) throw new ReaderError(404, "Reader not found.");
  let result;
  try {
    result = L.calculate({
      genre_calling: reader.genre_calling, genre_flavour: reader.genre_flavour,
      gate_1: reader.gate_1, gate_2: reader.gate_2, darkness: reader.darkness,
      olympics_q1: reader.olympics_q1, olympics_q2: reader.olympics_q2, olympics_q3: reader.olympics_q3,
      olympics_q4: reader.olympics_q4, olympics_q5: reader.olympics_q5,
      masks_silver: reader.masks_silver, masks_gold: reader.masks_gold, masks_black: reader.masks_black,
    });
  } catch (error) {
    throw new ReaderError(400, `Cannot calculate yet: ${error.message}`);
  }
  const saved = {
    olympics_total: result.olympics_total, literary_grade: result.literary_grade,
    masks_total: result.masks_total, moral_tier: result.moral_tier, moral_band: result.moral_band,
    provisional_archetype: result.provisional_archetype, validation_changed: result.validation_changed,
    fallback_used: result.fallback_used, highbrow_override: result.highbrow_override,
    final_archetype: result.final_archetype, house: result.house, soul_character: result.soul_character,
    swipe_deck: result.final_archetype, sheet_synced_at: null,
  };
  await db.update("readers", `reader_id=${db.eq(reader.reader_id)}`, saved);
  return publicResults({ ...reader, ...saved }, result);
}

// What the page may see about a reader: results only, never other answers.
function publicResults(reader, result) {
  const archetype = reader.final_archetype;
  const info = archetype && L.ARCHETYPES[archetype];
  const character = info && reader.moral_band && L.SOUL_CHARACTERS[archetype][reader.moral_band];
  const moral = reader.masks_total && L.MORAL_TIERS[reader.masks_total];
  const grade = reader.literary_grade && L.GRADES[reader.literary_grade];
  return {
    reader_id: reader.reader_id,
    reading_type: reader.reading_type,
    full_reading_completed: reader.full_reading_completed,
    full_reading_link: reader.full_reading_link,
    results: archetype ? {
      final_archetype: archetype,
      house: reader.house,
      house_colour: L.HOUSES[reader.house].colour,
      soul_character: reader.soul_character,
      literary_grade: reader.literary_grade,
      literary_grade_name: grade && grade.name,
      moral_tier: reader.moral_tier,
      moral_band: reader.moral_band,
      files: result ? result.files : {
        character: `character_${character[1]}.png`, archetype: `archetype_${info.slug}.png`,
        grade: `grade_${grade.slug}.png`, moral: `moral_${moral.slug}.png`,
        house: L.HOUSES[reader.house].image, emblem: L.HOUSES[reader.house].emblem,
      },
    } : null,
    swipe_deck: archetype ? L.swipeDeck(archetype) : null,
  };
}

// Section 9: the "Finish your reading" link.
async function readerForFullReading(readerId) {
  const reader = await getReader(readerId);
  if (!reader) return null;
  return publicResults(reader);
}

module.exports = {
  ReaderError, FIELD_RULES, SWIPE_ANSWERS,
  sanitizeReaderPatch, fullReadingLink, createReader, updateReader, getReader, calculateResults, publicResults, readerForFullReading,
};
