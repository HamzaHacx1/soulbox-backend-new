const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSeptemberCheckout } = require('../src/services/september-checkout');

test('September offers charge the exact GBP prices and return to the shared Thank You page', () => {
  for (const [plan, amount] of [['soul_report_september', 1900], ['soulbox_september', 5000]]) {
    const session = buildSeptemberCheckout({ plan, email: 'reader@example.test', submission: { country: 'UK' }, origin: 'https://soul-box.webflow.io' });
    assert.equal(session.mode, 'payment');
    assert.equal(session.line_items[0].price_data.currency, 'gbp');
    assert.equal(session.line_items[0].price_data.unit_amount, amount);
    assert.equal(session.success_url, 'https://soul-box.webflow.io/success?session_id={CHECKOUT_SESSION_ID}');
    assert.equal(session.cancel_url, 'https://soul-box.webflow.io/go-deeper');
    if (plan === 'soulbox_september') assert.deepEqual(session.shipping_address_collection.allowed_countries, ['GB']);
    else assert.equal(session.shipping_address_collection, undefined);
  }
});
test('physical checkout blocks identified non-UK readers while digital checkout remains available', () => {
  for (const country of ['US', 'EU', 'Other', { value: 'US' }]) {
    assert.throws(() => buildSeptemberCheckout({ plan: 'soulbox_september', submission: { country } }), /UK only/);
    assert.ok(buildSeptemberCheckout({ plan: 'soul_report_september', submission: { country } }));
  }
});
test('unknown country still requires a GB shipping address at physical checkout', () => {
  const session = buildSeptemberCheckout({ plan: 'soulbox_september' });
  assert.deepEqual(session.shipping_address_collection.allowed_countries, ['GB']);
});
test('does not accept arbitrary checkout return domains or alter legacy plans', () => {
  const session = buildSeptemberCheckout({ plan: 'soul_report_september', origin: 'https://untrusted.example' });
  assert.match(session.success_url, /^https:\/\/www\.soulboxed\.com\//);
  assert.equal(buildSeptemberCheckout({ plan: 'monthly' }), null);
});
