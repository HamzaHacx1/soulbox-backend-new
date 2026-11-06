const { test } = require('node:test');
const assert = require('node:assert/strict');
const gifts = require('../src/services/gift');

const GIFT_ID = '3b241101-e2bb-4255-8caf-4136c566a962';

test('answers are trimmed, validated against the canonical values and unknown fields are refused', () => {
  const clean = gifts.sanitizeGiftPatch({
    gifter_name: '  Hamza ', recipient_name: ' Amina  ', relationship: 'Best Friend', occasion: "Valentine's",
    mood_ove: 'Loved it', hard_nos: ['No gore or horror', 'No explicit spice'], loved_book: '   ',
  });
  assert.equal(clean.gifter_name, 'Hamza');
  assert.equal(clean.recipient_name, 'Amina');
  assert.equal(clean.loved_book, null, 'an empty or skipped book is saved empty');
  assert.deepEqual(clean.hard_nos, ['No explicit spice', 'No gore or horror'], 'kept in on-screen order');
  assert.throws(() => gifts.sanitizeGiftPatch({ relationship: 'Friend' }), /relationship must be one of/);
  assert.throws(() => gifts.sanitizeGiftPatch({ occasion: 'Christmas Day' }), /occasion/);
  assert.throws(() => gifts.sanitizeGiftPatch({ mood_ove: 'Love it' }), /mood_ove/);
  assert.throws(() => gifts.sanitizeGiftPatch({ hard_nos: ['No sad endings'] }), /unknown options/);
  assert.throws(() => gifts.sanitizeGiftPatch({ payment_status: 'paid' }), /Unknown field: payment_status/);
  assert.throws(() => gifts.sanitizeGiftPatch({ last_screen_reached: 'gift_somewhere' }), /last_screen_reached/);
});

test('long answers are kept exactly as typed', () => {
  const text = 'Line one,\n  line two with spaces  \n\nand a third.';
  assert.equal(gifts.sanitizeGiftPatch({ what_they_mean: text }).what_they_mean, text);
});

test('skipping memory cards clears the three memory answers', () => {
  assert.deepEqual(gifts.sanitizeGiftPatch({ memory_cards: 'No' }), { memory_cards: 'No', memory_place: null, memory_joke: null, memory_tribute: null });
});

test('every one of the 12 moods and the 17 screen names are accepted', () => {
  for (const field of gifts.MOOD_FIELDS) for (const value of gifts.MOOD_VALUES) gifts.sanitizeGiftPatch({ [field]: value });
  for (const screen of gifts.SCREENS) gifts.sanitizeGiftPatch({ last_screen_reached: screen });
  assert.equal(gifts.MOOD_FIELDS.length, 12);
  assert.equal(gifts.SCREENS.length, 17);
});

test('checkout requires every required answer, and memory text only when memory cards were added', () => {
  const complete = {
    gifter_name: 'Hamza', recipient_name: 'Amina', relationship: 'Sibling', occasion: 'Birthday',
    ...Object.fromEntries(gifts.MOOD_FIELDS.map((f) => [f, 'Maybe'])),
    life_chapter: 'Thriving', specific_details: 'Collects stamps', what_they_mean: 'Everything', memory_cards: 'No', reading_fuel: 'Fudge',
  };
  assert.deepEqual(gifts.missingAnswers(complete), []);
  assert.deepEqual(gifts.missingAnswers({ ...complete, memory_cards: 'Yes', memory_joke: 'The goose' }), ['memory_place', 'memory_tribute']);
  assert.deepEqual(gifts.missingAnswers({ ...complete, mood_acotar: null, reading_fuel: null }), ['mood_acotar', 'reading_fuel']);
});

test('the Gift Box checkout uses the £45 price, the UK shipping rate, UK addresses only, and links back to the gift', () => {
  delete process.env.STRIPE_GIFT_PRICE_ID;
  delete process.env.STRIPE_GIFT_SHIPPING_RATE_ID;
  const session = gifts.buildGiftCheckout({ gift: { gift_id: GIFT_ID }, origin: 'https://www.soulboxed.com' });
  assert.equal(session.mode, 'payment');
  assert.deepEqual(session.line_items, [{ price: 'price_1UYoF8FHbt8VjRVzMVvTn6ca', quantity: 1 }]);
  assert.deepEqual(session.shipping_options, [{ shipping_rate: 'shr_1UYoFoFHbt8VjRVzpMTWMgXa' }]);
  assert.deepEqual(session.shipping_address_collection.allowed_countries, ['GB']);
  assert.equal(session.client_reference_id, GIFT_ID);
  assert.deepEqual(session.metadata, { plan: 'gift_box', gift_id: GIFT_ID });
  assert.equal(session.payment_intent_data.metadata.gift_id, GIFT_ID);
  assert.equal(session.success_url, `https://www.soulboxed.com/gift?gift_id=${GIFT_ID}&status=success&session_id={CHECKOUT_SESSION_ID}`);
  assert.equal(session.cancel_url, `https://www.soulboxed.com/gift?gift_id=${GIFT_ID}&status=cancelled`);
});

test('checkout never returns to an untrusted domain', () => {
  const session = gifts.buildGiftCheckout({ gift: { gift_id: GIFT_ID }, origin: 'https://evil.example' });
  assert.match(session.success_url, /^https:\/\/www\.soulboxed\.com\/gift\?/);
});

test('a paid Stripe session maps to the Gifts payment fields (new and old Stripe API shapes)', () => {
  const address = { line1: '1 Baker Street', line2: null, city: 'London', state: null, postal_code: 'NW1 6XE', country: 'GB' };
  const base = { id: 'cs_test_1', payment_intent: 'pi_123', created: 1793900000, metadata: { plan: 'gift_box', gift_id: GIFT_ID },
    customer_details: { email: 'gifter@example.test', name: 'Hamza', phone: '+447700900000' } };
  const fromNew = gifts.paidUpdateFromSession({ ...base, collected_information: { shipping_details: { name: 'Amina', address } } });
  const fromOld = gifts.paidUpdateFromSession({ ...base, shipping_details: { name: 'Amina', address } });
  for (const update of [fromNew, fromOld]) {
    assert.equal(update.payment_status, 'paid');
    assert.equal(update.stripe_order_id, 'pi_123');
    assert.equal(update.stripe_session_id, 'cs_test_1');
    assert.equal(update.gifter_email, 'gifter@example.test');
    assert.equal(update.shipping_name, 'Amina');
    assert.equal(update.shipping_phone, '+447700900000');
    assert.deepEqual(update.shipping_address, address);
    assert.equal(update.paid_at, new Date(1793900000 * 1000).toISOString());
  }
});

test('only Gift Box sessions are treated as gifts', () => {
  assert.equal(gifts.isGiftSession({ metadata: { plan: 'gift_box', gift_id: GIFT_ID } }), true);
  assert.equal(gifts.isGiftSession({ metadata: { plan: 'soulbox_september', submissionId: '1' } }), false);
  assert.equal(gifts.isGiftSession({ metadata: { plan: 'gift_box', gift_id: 'not-a-uuid' } }), false);
});

test('the Sheet row follows the column list and flattens lists and addresses', () => {
  const row = gifts.sheetRow({ gift_id: GIFT_ID, hard_nos: ['No explicit spice', 'No gore or horror'],
    shipping_address: { line1: '1 Baker Street', city: 'London', postal_code: 'NW1 6XE', country: 'GB' } });
  assert.equal(row.length, gifts.SHEET_COLUMNS.length);
  assert.equal(row[gifts.SHEET_COLUMNS.indexOf('hard_nos')], 'No explicit spice, No gore or horror');
  assert.equal(row[gifts.SHEET_COLUMNS.indexOf('shipping_address')], '1 Baker Street, London, NW1 6XE, GB');
  assert.equal(row[gifts.SHEET_COLUMNS.indexOf('relationship')], '');
});

test('the source tag and A/B variant are cleaned before saving', () => {
  assert.deepEqual(gifts.sanitizeMeta({ source_ref: '  creatorname ', ab_variant: 'B', session_id: 'abc' }), { source_ref: 'creatorname', ab_variant: 'B', session_id: 'abc' });
  assert.deepEqual(gifts.sanitizeMeta({ source_ref: '', ab_variant: 'C' }), { source_ref: null, ab_variant: null, session_id: null });
});
