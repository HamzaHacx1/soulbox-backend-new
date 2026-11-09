const express = require("express");
const createStripeClient = require("stripe");
const gifts = require("../services/gift");

let stripeClient;
// Created on first use so it always sees the loaded environment variables.
function getStripe() {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) stripeClient = createStripeClient(process.env.STRIPE_SECRET_KEY);
  return stripeClient || null;
}

function fail(res, error) {
  const status = error.status && error.status < 500 ? error.status : 500;
  if (status === 500) console.error("[gift]", error);
  res.status(status).json({ ok: false, error: status === 500 ? "Something went wrong. Please try again." : error.message });
}

// JSON routes, mounted under /api (after express.json()).
const router = express.Router();

// The Gift Flow app itself, loaded by the /gift page in Webflow. Cached at the edge for
// 5 minutes, so a deploy reaches visitors within minutes.
router.get("/gift-app.js", (req, res) => {
  res.set({
    "Content-Type": "application/javascript; charset=utf-8",
    "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
    "Access-Control-Allow-Origin": "*",
  });
  res.send(require("../generated/gift-app.js"));
});

// Screen 0: "I'm in the UK". The browser generates gift_id so the call can be retried safely.
router.post("/gift", async (req, res) => {
  try {
    const result = await gifts.createGift(req.body || {});
    if (result.created) {
      await Promise.allSettled([gifts.recordMilestone(result.gift, "gift_uk_confirmed"), gifts.syncGiftToSheet(result.gift)]);
    }
    res.json({ ok: true, gift_id: result.gift_id });
  } catch (error) { fail(res, error); }
});

// Every screen: save the answers the user just gave (and last_screen_reached).
router.post("/gift/:giftId", async (req, res) => {
  try {
    const result = await gifts.updateGift(req.params.giftId, req.body && req.body.answers);
    res.json({ ok: true, gift_id: result.gift_id });
  } catch (error) { fail(res, error); }
});

// "Buy the Gift Box": create the Stripe Checkout session for this gift.
router.post("/gift/:giftId/checkout", async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(500).json({ ok: false, error: "Checkout is not configured." });
    const gift = await gifts.getGift(req.params.giftId);
    if (!gift) return res.status(404).json({ ok: false, error: "Gift not found." });
    if (gift.payment_status === "paid") return res.status(409).json({ ok: false, error: "This gift has already been paid for." });
    const missing = gifts.missingAnswers(gift);
    if (missing.length) return res.status(400).json({ ok: false, error: "Some answers are missing.", missing });

    const session = await stripe.checkout.sessions.create(gifts.buildGiftCheckout({ gift, origin: req.headers.origin }));
    await Promise.allSettled([gifts.recordMilestone(gift, "gift_buy_tapped"), gifts.syncGiftToSheet(gift)]);
    res.json({ ok: true, url: session.url });
  } catch (error) { fail(res, error); }
});

// Thank-you screen: confirm payment straight from Stripe (backs up the webhook).
router.get("/gift/:giftId/confirm", async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(500).json({ ok: false, error: "Checkout is not configured." });
    const sessionId = String(req.query.session_id || "");
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return res.status(400).json({ ok: false, error: "Invalid session." });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!gifts.isGiftSession(session) || session.metadata.gift_id.toLowerCase() !== String(req.params.giftId).toLowerCase()) {
      return res.status(404).json({ ok: false, error: "Payment not found for this gift." });
    }
    const result = await gifts.markGiftPaid(session);
    res.json({ ok: true, paid: result.paid });
  } catch (error) { fail(res, error); }
});

// Catch-up Sheet mirror. Call on a schedule with Authorization: Bearer $CRON_SECRET.
router.all("/gift-sync-sheet", async (req, res) => {
  try {
    if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
    res.json({ ok: true, results: await gifts.syncPendingGifts() });
  } catch (error) { fail(res, error); }
});

// Stripe webhook. Must be mounted BEFORE express.json() so the signature can be checked.
async function stripeWebhook(req, res) {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).send("Webhook is not configured.");
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }
  try {
    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      await gifts.markGiftPaid(event.data.object);
      // Soul Report / SoulBox bought from the quiz's sales page: record it on the reader.
      await require("../services/reader").markReaderPurchase(event.data.object);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("[gift] webhook failed:", error);
    res.status(500).send("Webhook handling failed.");
  }
}

module.exports = { router, stripeWebhook };
