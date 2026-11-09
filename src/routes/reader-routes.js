const express = require("express");
const readers = require("../services/reader");

function fail(res, error) {
  const status = error.status && error.status < 500 ? error.status : 500;
  if (status === 500) console.error("[reader]", error);
  res.status(status).json({ ok: false, error: status === 500 ? "Something went wrong. Please try again." : error.message });
}

const router = express.Router();

// The quiz app itself, loaded by the quiz page in Webflow.
router.get("/quiz-app.js", (req, res) => {
  res.set({
    "Content-Type": "application/javascript; charset=utf-8",
    "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
    "Access-Control-Allow-Origin": "*",
  });
  res.send(require("../generated/quiz-app.js"));
});

// The visitor's country, from Vercel's geolocation header (K2: pre-select the country).
router.get("/country", (req, res) => {
  const code = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  res.set("Cache-Control", "private, no-store");
  res.json({ ok: true, code: /^[A-Z]{2}$/.test(code) ? code : null });
});

// Choice screen: Quick or Full. The browser generates reader_id so retries are safe.
router.post("/reader", async (req, res) => {
  try {
    const result = await readers.createReader(req.body || {});
    res.json({ ok: true, reader_id: result.reader_id });
  } catch (error) { fail(res, error); }
});

// Every screen: save the answers just given.
router.post("/reader/:readerId", async (req, res) => {
  try {
    await readers.updateReader(req.params.readerId, req.body && req.body.answers);
    res.json({ ok: true });
  } catch (error) { fail(res, error); }
});

// After the Black: calculate and save the results (Section 4), return them for the results page.
router.post("/reader/:readerId/results", async (req, res) => {
  try {
    res.json({ ok: true, ...(await readers.calculateResults(req.params.readerId)) });
  } catch (error) { fail(res, error); }
});

// "Finish your reading" link and the results page: results only, never other answers.
router.get("/reader/:readerId", async (req, res) => {
  try {
    const reader = await readers.readerForFullReading(req.params.readerId);
    if (!reader) return res.status(404).json({ ok: false, error: "We couldn't find your reading." });
    res.json({ ok: true, ...reader });
  } catch (error) { fail(res, error); }
});

// Catch-up Sheet mirror for readers. Call on a schedule with Authorization: Bearer $CRON_SECRET.
router.all("/reader-sync-sheet", async (req, res) => {
  try {
    if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
    res.json({ ok: true, results: await readers.syncPendingReaders() });
  } catch (error) { fail(res, error); }
});

module.exports = { router };
