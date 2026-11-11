// Gift Flow (Build Brief Part A, Logic & Data Spec 7.3 / 8).
// Every value and screen name here is the canonical spelling from the brief.
const crypto = require("crypto");
const fetch = require("node-fetch");
const db = require("./supabase");

// ── Tables (edit here, not in the functions) ────────────────────────────────
const RELATIONSHIPS = ["Lover", "Best Friend", "Parent", "Sibling", "Child", "Colleague"];
const OCCASIONS = ["Birthday", "Christmas", "Valentine's", "A Hard Chapter", "New Chapter", "Thank You", "Just Because"];
const MOOD_FIELDS = [
  "mood_harrypotter", "mood_gameofthrones", "mood_prideprejudice", "mood_sherlock",
  "mood_gonegirl", "mood_shining", "mood_hungergames", "mood_jurassicpark",
  "mood_hitchhikers", "mood_gatsby", "mood_ove", "mood_acotar",
];
const MOOD_VALUES = ["Loved it", "Maybe", "Not them"];
const HARD_NOS = ["No heavy trauma or grief", "No explicit spice", "No gore or horror", "No preachy self-help", "Something else"];
const HARD_NOS_OTHER = "Something else"; // its text is saved as hard_nos_other
const LIFE_CHAPTERS = ["Running on empty", "Starting something new", "Thriving", "Craving excitement", "Steady as ever"];
const READING_FUELS = ["Shortbread", "Dark Chocolate", "Candy Kittens", "Fudge"];
const SCREENS = [
  "gift_uk_notice", "gift_names", "gift_relationship", "gift_occasion", "gift_moods",
  "gift_loved_book", "gift_hard_nos", "gift_life_chapter", "gift_details", "gift_meaning",
  "gift_memory_choice", "gift_memory_place", "gift_memory_joke", "gift_memory_tribute",
  "gift_fuel", "gift_checkout", "gift_thank_you",
];

// Stripe product "The Gift Box" (£45) and its UK shipping rate. Env vars override for testing.
const GIFT_BOX = {
  name: "The Gift Box",
  amount: 4500,
  currency: "gbp",
  priceId: "price_1UYoF8FHbt8VjRVzMVvTn6ca",
  shippingRateId: "shr_1UYoFoFHbt8VjRVzpMTWMgXa",
};
const GIFT_PAGE_PATH = "/gift";
const ALLOWED_ORIGINS = new Set(["https://soulboxed.com", "https://www.soulboxed.com", "https://soul-box.webflow.io"]);
const POSTHOG_HOST = "https://eu.i.posthog.com";
const POSTHOG_PROJECT_KEY = "phc_vZ7z2DsaWJ88MzhzF36a35mNWjKvGPrMfFo4FZwQujS6"; // public project key

const SHORT_TEXT = 200;
const LONG_TEXT = 10000;

// Field → validator. A validator returns the cleaned value or throws.
const text = (max) => (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new Error("must be text");
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`must be at most ${max} characters`);
  return trimmed || null;
};
const longText = (max) => (value) => {
  // Long answers are saved exactly as typed (only outer whitespace removed).
  return text(max)(value);
};
const oneOf = (values) => (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (!values.includes(value)) throw new Error(`must be one of: ${values.join(", ")}`);
  return value;
};

const FIELD_RULES = {
  gifter_name: text(SHORT_TEXT),
  recipient_name: text(SHORT_TEXT),
  relationship: oneOf(RELATIONSHIPS),
  occasion: oneOf(OCCASIONS),
  ...Object.fromEntries(MOOD_FIELDS.map((field) => [field, oneOf(MOOD_VALUES)])),
  loved_book: text(500),
  hard_nos: (value) => {
    if (value === null || value === undefined) return [];
    if (!Array.isArray(value)) throw new Error("must be a list");
    const unknown = value.filter((item) => !HARD_NOS.includes(item));
    if (unknown.length) throw new Error(`unknown options: ${unknown.join(", ")}`);
    return HARD_NOS.filter((item) => value.includes(item));
  },
  hard_nos_other: text(500),
  life_chapter: oneOf(LIFE_CHAPTERS),
  specific_details: longText(LONG_TEXT),
  what_they_mean: longText(LONG_TEXT),
  memory_cards: oneOf(["Yes", "No"]),
  memory_place: longText(LONG_TEXT),
  memory_joke: longText(LONG_TEXT),
  memory_tribute: longText(LONG_TEXT),
  reading_fuel: oneOf(READING_FUELS),
  last_screen_reached: oneOf(SCREENS),
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class GiftError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function assertGiftId(giftId) {
  if (typeof giftId !== "string" || !UUID.test(giftId)) throw new GiftError(400, "Invalid gift_id.");
  return giftId.toLowerCase();
}

function sanitizeGiftPatch(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new GiftError(400, "Expected an object of answers.");
  const clean = {};
  for (const [field, value] of Object.entries(patch)) {
    const rule = FIELD_RULES[field];
    if (!rule) throw new GiftError(400, `Unknown field: ${field}`);
    try { clean[field] = rule(value); } catch (error) { throw new GiftError(400, `${field} ${error.message}`); }
  }
  // Choosing "Skip for now" on memory cards clears anything typed earlier.
  if (clean.memory_cards === "No") Object.assign(clean, { memory_place: null, memory_joke: null, memory_tribute: null });
  // Unticking "Something else" discards its text.
  if (clean.hard_nos && !clean.hard_nos.includes(HARD_NOS_OTHER)) clean.hard_nos_other = null;
  return clean;
}

function sanitizeMeta(meta = {}) {
  const ref = typeof meta.source_ref === "string" ? meta.source_ref.trim().slice(0, 100) : "";
  const session = typeof meta.session_id === "string" ? meta.session_id.trim().slice(0, 200) : "";
  return {
    source_ref: ref || null,
    ab_variant: meta.ab_variant === "A" || meta.ab_variant === "B" ? meta.ab_variant : null,
    session_id: session || null,
  };
}

// Answers that must be present before checkout (Screens 1–4, 7–11).
function missingAnswers(gift) {
  const required = ["gifter_name", "recipient_name", "relationship", "occasion", ...MOOD_FIELDS,
    "life_chapter", "specific_details", "what_they_mean", "memory_cards", "reading_fuel"];
  if (gift.memory_cards === "Yes") required.push("memory_place", "memory_joke", "memory_tribute");
  return required.filter((field) => !gift[field]);
}

// ── Rows ────────────────────────────────────────────────────────────────────
async function createGift({ gift_id, ...meta }) {
  const id = assertGiftId(gift_id);
  // Idempotent: the browser retries creates, so a duplicate id is ignored.
  const rows = await db.insert("gifts", { gift_id: id, ...sanitizeMeta(meta), last_screen_reached: "gift_uk_notice" }, { ignoreDuplicates: true });
  return { gift_id: id, gift: rows[0] || null, created: rows.length > 0 };
}

async function updateGift(giftId, patch) {
  const id = assertGiftId(giftId);
  const clean = sanitizeGiftPatch(patch);
  if (!Object.keys(clean).length) return { gift_id: id };
  // sheet_synced_at = null marks the row as changed for the Sheet mirror.
  const rows = await db.update("gifts", `gift_id=${db.eq(id)}&payment_status=${db.eq("not paid")}`, { ...clean, sheet_synced_at: null });
  if (rows.length) return { gift_id: id, gift: rows[0] };
  const existing = await db.select("gifts", `gift_id=${db.eq(id)}&select=payment_status`);
  if (!existing.length) throw new GiftError(404, "Gift not found.");
  throw new GiftError(409, "This gift has already been paid for.");
}

async function getGift(giftId) {
  const rows = await db.select("gifts", `gift_id=${db.eq(assertGiftId(giftId))}&select=*`);
  return rows[0] || null;
}

// ── Stripe ──────────────────────────────────────────────────────────────────
function siteFor(origin) {
  return ALLOWED_ORIGINS.has(origin) ? origin : "https://www.soulboxed.com";
}

function buildGiftCheckout({
  gift,
  origin,
  priceId = process.env.STRIPE_GIFT_PRICE_ID || GIFT_BOX.priceId,
  shippingRateId = process.env.STRIPE_GIFT_SHIPPING_RATE_ID || GIFT_BOX.shippingRateId,
}) {
  const site = siteFor(origin);
  const page = `${site}${GIFT_PAGE_PATH}?gift_id=${encodeURIComponent(gift.gift_id)}`;
  return {
    mode: "payment",
    client_reference_id: gift.gift_id,
    line_items: [priceId
      ? { price: priceId, quantity: 1 }
      : { price_data: { currency: GIFT_BOX.currency, product_data: { name: GIFT_BOX.name }, unit_amount: GIFT_BOX.amount }, quantity: 1 }],
    // UK addresses only: Stripe will not accept any other country.
    shipping_address_collection: { allowed_countries: ["GB"] },
    ...(shippingRateId && { shipping_options: [{ shipping_rate: shippingRateId }] }),
    phone_number_collection: { enabled: true },
    success_url: `${page}&status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${page}&status=cancelled`,
    metadata: { plan: "gift_box", gift_id: gift.gift_id },
    payment_intent_data: { metadata: { plan: "gift_box", gift_id: gift.gift_id } },
  };
}

// Stripe moved shipping details to collected_information in newer API versions.
function paidUpdateFromSession(session) {
  const shipping = session.collected_information?.shipping_details || session.shipping_details || session.customer_details || {};
  const address = shipping.address || null;
  return {
    payment_status: "paid",
    stripe_session_id: session.id,
    stripe_order_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || session.id,
    paid_at: new Date((session.created || Date.now() / 1000) * 1000).toISOString(),
    gifter_email: session.customer_details?.email || session.customer_email || null,
    shipping_name: shipping.name || session.customer_details?.name || null,
    shipping_phone: session.customer_details?.phone || null,
    shipping_address: address,
  };
}

// The gift a Checkout session paid for. Our own sessions carry metadata.gift_id; the
// client's Stripe Payment Link carries it as client_reference_id (added by the gift page).
function giftIdOf(session) {
  if (session?.metadata?.plan === "gift_box" && UUID.test(session.metadata.gift_id || "")) return session.metadata.gift_id.toLowerCase();
  if (session?.payment_link && UUID.test(session.client_reference_id || "")) return session.client_reference_id.toLowerCase();
  return null;
}

function isGiftSession(session) {
  return giftIdOf(session) !== null;
}

// Marks the gift paid. Safe to call from both the webhook and the thank-you
// page: only the first call changes the row and fires the gift_paid milestone.
async function markGiftPaid(session, deps = {}) {
  if (!isGiftSession(session)) return { handled: false };
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return { handled: true, paid: false };
  const id = giftIdOf(session);
  const rows = await db.update("gifts", `gift_id=${db.eq(id)}&payment_status=${db.eq("not paid")}`, {
    ...paidUpdateFromSession(session),
    last_screen_reached: "gift_thank_you",
  });
  if (rows.length) {
    const gift = rows[0];
    await Promise.allSettled([
      recordMilestone(gift, "gift_paid", { posthog: true }),
      (deps.syncSheet || syncGiftToSheet)(gift),
    ]);
  }
  return { handled: true, paid: true, gift_id: id, first: rows.length > 0 };
}

// ── Tracking (server-side milestones; the page sends screen events to PostHog) ──
// Always writes to the events table. Sends to PostHog only when asked, because the
// page already sends the milestones it can see (gift_uk_confirmed, gift_buy_tapped).
async function recordMilestone(gift, milestone, { posthog = false } = {}) {
  const properties = {
    event_type: "milestone",
    milestone_name: milestone,
    gift_id: gift.gift_id,
    source_ref: gift.source_ref || null,
    ab_variant: gift.ab_variant || null,
    reading_type: "gift",
  };
  const tasks = [
    db.insert("events", {
      gift_id: gift.gift_id,
      session_id: gift.session_id,
      event_type: "milestone",
      milestone_name: milestone,
      source_ref: gift.source_ref,
      ab_variant: gift.ab_variant,
      reading_type: "gift",
    }),
  ];
  const key = process.env.POSTHOG_KEY || POSTHOG_PROJECT_KEY;
  if (key && posthog) {
    tasks.push(fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: key, event: milestone, distinct_id: gift.session_id || gift.gift_id, properties }),
      timeout: 5000,
    }));
  }
  const results = await Promise.allSettled(tasks);
  results.filter((r) => r.status === "rejected").forEach((r) => console.error("[gift] milestone failed:", r.reason));
}

// ── Google Sheet mirror ("Gifts" tab) ───────────────────────────────────────
const SHEET_COLUMNS = [
  "gift_id", "created_at", "source_ref", "ab_variant", "gifter_name", "recipient_name", "relationship", "occasion",
  ...MOOD_FIELDS, "loved_book", "hard_nos", "hard_nos_other", "life_chapter", "specific_details", "what_they_mean",
  "memory_cards", "memory_place", "memory_joke", "memory_tribute", "reading_fuel", "last_screen_reached",
  "payment_status", "stripe_order_id", "paid_at", "gifter_email", "shipping_name", "shipping_phone", "shipping_address",
];

function sheetRow(gift) {
  return SHEET_COLUMNS.map((column) => {
    const value = gift[column];
    if (value === null || value === undefined) return "";
    if (column === "hard_nos") return value.join(", ");
    if (column === "shipping_address") {
      return [value.line1, value.line2, value.city, value.state, value.postal_code, value.country].filter(Boolean).join(", ");
    }
    return String(value);
  });
}

let sheetsClient;
function sheets() {
  if (sheetsClient) return sheetsClient;
  const { google } = require("googleapis");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

async function syncGiftToSheet(gift) {
  const spreadsheetId = process.env.GIFTS_SHEET_ID;
  if (!spreadsheetId || !gift) return { skipped: true };
  const tab = process.env.GIFTS_SHEET_TAB || "Gifts";
  try {
    const api = sheets();
    const ids = (await api.spreadsheets.values.get({ spreadsheetId, range: `${tab}!A:A` })).data.values || [];
    if (!ids.length) {
      await api.spreadsheets.values.update({ spreadsheetId, range: `${tab}!A1`, valueInputOption: "RAW", requestBody: { values: [SHEET_COLUMNS] } });
      ids.push(["gift_id"]);
    }
    const index = ids.findIndex((row) => row[0] === gift.gift_id);
    const values = [sheetRow(gift)];
    if (index > 0) {
      await api.spreadsheets.values.update({ spreadsheetId, range: `${tab}!A${index + 1}`, valueInputOption: "RAW", requestBody: { values } });
    } else {
      await api.spreadsheets.values.append({ spreadsheetId, range: `${tab}!A1`, valueInputOption: "RAW", insertDataOption: "INSERT_ROWS", requestBody: { values } });
    }
    await db.update("gifts", `gift_id=${db.eq(gift.gift_id)}`, { sheet_synced_at: new Date().toISOString() });
    return { synced: true };
  } catch (error) {
    console.error("[gift] sheet sync failed:", error.message);
    return { synced: false, error: error.message };
  }
}

// Catch-up mirror for every row changed since its last sync (run on a schedule).
async function syncPendingGifts(limit = 50) {
  const rows = await db.select("gifts", `select=*&sheet_synced_at=is.null&order=updated_at.asc&limit=${limit}`);
  const results = [];
  for (const gift of rows) results.push({ gift_id: gift.gift_id, ...(await syncGiftToSheet(gift)) });
  return results;
}

function newGiftId() { return crypto.randomUUID(); }

module.exports = {
  RELATIONSHIPS, OCCASIONS, MOOD_FIELDS, MOOD_VALUES, HARD_NOS, LIFE_CHAPTERS, READING_FUELS, SCREENS,
  GIFT_BOX, SHEET_COLUMNS,
  GiftError,
  sanitizeGiftPatch, sanitizeMeta, missingAnswers, buildGiftCheckout, paidUpdateFromSession, isGiftSession, giftIdOf, sheetRow,
  createGift, updateGift, getGift, markGiftPaid, recordMilestone, syncGiftToSheet, syncPendingGifts, newGiftId,
};
