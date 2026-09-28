const OFFERS = {
  soul_report_september: { name: 'The Soul Report', amount: 1900 },
  soulbox_september: { name: 'The SoulBox', amount: 5000, physical: true },
};

function isUK(country) {
  return ['uk', 'gb', 'gbr', 'united kingdom', 'great britain'].includes(String(country || '').trim().toLowerCase());
}

function buildSeptemberCheckout({ plan, email, submission = {}, origin }) {
  const offer = OFFERS[plan];
  if (!offer) return null;
  const country = submission.country?.value || submission.country || submission.region;
  if (offer.physical && country && !isUK(country)) {
    throw new Error('Currently available in the UK only.');
  }
  const allowedOrigins = new Set(['https://soulboxed.com', 'https://www.soulboxed.com', 'https://soul-box.webflow.io']);
  const site = allowedOrigins.has(origin) ? origin : 'https://www.soulboxed.com';
  return {
    mode: 'payment',
    ...(email && { customer_email: email }),
    line_items: [{ price_data: { currency: 'gbp', product_data: { name: offer.name }, unit_amount: offer.amount }, quantity: 1 }],
    ...(offer.physical && { shipping_address_collection: { allowed_countries: ['GB'] } }),
    success_url: `${site}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/go-deeper`,
    metadata: { plan, submissionId: String(submission.id || 'local') },
  };
}

module.exports = { buildSeptemberCheckout, isUK };
