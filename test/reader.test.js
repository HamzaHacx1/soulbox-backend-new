const { test } = require('node:test');
const assert = require('node:assert/strict');
const readers = require('../src/services/reader');

test('reader answers are validated against the canonical values', () => {
  const clean = readers.sanitizeReaderPatch({
    reading_type: 'full', genre_calling: 'Mystery', genre_flavour: ' Who?! ', gate_1: 'The story', gate_2: 'The twists and turns',
    darkness: 'Unflinching', olympics_q1: 'correct', olympics_q5: 'literary', masks_silver: '2', swipe_01: 'The Hobbit | Loved it',
    email: ' Reader@Example.TEST ', answers: { 'desire.tone': 'Warm', 'soul_climate.temperature_secondary.whisper_text': 'Hopeful' },
  });
  assert.equal(clean.genre_flavour, 'Who?!');
  assert.equal(clean.masks_silver, 2);
  assert.equal(clean.email, 'reader@example.test');
  assert.deepEqual(clean.answers, { 'desire.tone': 'Warm', 'soul_climate.temperature_secondary.whisper_text': 'Hopeful' });
  for (const bad of [{ gate_1: 'The vibes' }, { olympics_q2: 'Two.' }, { masks_gold: 4 }, { darkness: 'Hard' }, { swipe_02: 'Dune | Meh' },
    { email: 'not-an-email' }, { final_archetype: 'Highbrow' }, { answers: { 'bad key!': 1 } }]) {
    assert.throws(() => readers.sanitizeReaderPatch(bad), /must|Unknown field|invalid key/, JSON.stringify(bad));
  }
});

test('unticking "Other" on triggers discards its text', () => {
  const clean = readers.sanitizeReaderPatch({ answers: { 'reader_context.heavy_triggers': ['Death'] } });
  assert.equal(clean.triggers_other, null);
  assert.equal(readers.sanitizeReaderPatch({ answers: { 'reader_context.heavy_triggers': ['Other'] }, triggers_other: 'Spiders' }).triggers_other, 'Spiders');
});

test('every reader gets a "Finish your reading" link', () => {
  assert.equal(readers.fullReadingLink('3b241101-e2bb-4255-8caf-4136c566a962'), 'https://soulboxed.com/full?id=3b241101-e2bb-4255-8caf-4136c566a962');
});

test('public results expose only results, deck and link', () => {
  const out = readers.publicResults({
    reader_id: 'x', reading_type: 'quick', full_reading_completed: 'no', full_reading_link: 'l', final_archetype: 'Fiction Nerd',
    house: 'Soul', moral_band: 'Light', masks_total: 4, literary_grade: 'D', soul_character: 'Athena', moral_tier: 'Golden Retriever',
    email: 'secret@example.test', eden_betrayal: 'private answer',
  });
  assert.equal(out.results.files.character, 'character_athena.png');
  assert.equal(out.results.files.grade, 'grade_d.png');
  assert.equal(out.swipe_deck.length, 12);
  assert.ok(!JSON.stringify(out).includes('secret@') && !JSON.stringify(out).includes('private answer'));
});
