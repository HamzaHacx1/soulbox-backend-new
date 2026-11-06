# September 2026 Webflow pages

Edit source pages in `src`, then run `node webflow/build.js`. The generated `dist` files are the Webflow embeds or footer code for the results, curator, home, about, success and Go Deeper pages. The quiz sources retain existing quiz behavior and replace the supplied images; the quiz footer sources add button styling.

`assets.json` separates on-page JPGs from the original downloadable PNGs. Downloads include six cards and use native file sharing where supported, with individual download links as a fallback. Heart and Mind retain their existing gradient images because replacements were absent. The pre-house display JPG was derived from the supplied PNG.

Checkout uses `soul_report_september` (£19) and `soulbox_september` (£50). Physical checkout accepts GB shipping only. Existing checkout plans remain available.

Run `npm test` for result mappings, saving failures, checkout parameters and asset mappings. Browser checks cover desktop and mobile layouts, save failures, navigation and sharing with a mocked native API. Actual mobile share sheets still require a device check.

## Client follow-up

The landing page now lives in its Webflow HTML embed, with the old footer renderer removed, so its content can render without JavaScript. The curator form collects country/region (previously only available on a skipped identity page), required for saving profiles and determining physical shipping eligibility. `src/quiz3.html` contains the final quiz embed with a five-second completion pause. The three quiz footers retain their original button styles. The results download panel uses SoulBox navy and reserves space for the second button.

Verified on staging: a labelled real profile submission returned success and navigated to Go Deeper; desktop/mobile layouts and landing content with JavaScript disabled passed. The corrected Heart/Mind gradient files remain pending delivery.

## November 2026: Gift Flow

`src/gift.html` is the whole Gift Flow (Build Brief Part A) in one embed: Screens 0–11, the checkout card and the thank-you screen. Run `node webflow/build.js` and paste `dist/gift.html` into an Embed on a Webflow page at **/gift**. The "For another" buttons link to `/gift`.

- **Images:** `gift-assets.json` maps each brief file name to its hosted URL. Empty entries show a labelled placeholder, so files can be added one by one. Rebuild after editing.
- **Settings at the top of the script:** `CHRISTMAS_ORDER_BY` (empty hides the Christmas line), `SHOW_PRODUCT_IMAGE`.
- **Saving:** the browser creates the gift id when "I'm in the UK" is tapped, then saves every screen to `POST /api/gift/:id`. Unsent answers wait in `localStorage` and retry until they arrive.
- **Tracking:** `src/tracking.js` captures `?ref=`, assigns A/B once per session and sends screen events and milestones to PostHog (EU). `gift_paid` is sent by the server.
- **Payment:** Stripe Checkout uses price `price_1UYoF8FHbt8VjRVzMVvTn6ca` and shipping rate `shr_1UYoFoFHbt8VjRVzpMTWMgXa`, with GB-only addresses. A cancelled payment returns to checkout; success shows the thank-you screen and confirms payment with the server.

### Backend environment variables (Vercel)

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | `https://vjjopzxriilqlenmxwed.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase secret key (`sb_secret_…`) or legacy `service_role` key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the webhook endpoint `https://soulbox-backend-new.vercel.app/api/stripe-webhook` (events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`) |
| `GIFTS_SHEET_ID` | Google Sheet with a **Gifts** tab, shared with the service account (optional until the new Sheet exists) |
| `CRON_SECRET` | Protects `/api/gift-sync-sheet`, which mirrors any rows the Sheet has missed |
| `STRIPE_GIFT_PRICE_ID`, `STRIPE_GIFT_SHIPPING_RATE_ID`, `POSTHOG_KEY` | Optional overrides |

The database schema is in `supabase/migrations/001_gift_flow.sql`.
