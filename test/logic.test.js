const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/logic/soulbox-logic');

// Olympics answers that add up to a chosen total (q1–q4 correct=3/decoy=1/optout=0, q5 2/4/6).
function olympicsFor(total) {
  for (const q5 of ['commercial', 'upmarket', 'literary']) {
    const rest = total - L.OLYMPICS_POINTS.q5[q5];
    const values = ['correct', 'decoy', 'optout'];
    for (const a of values) for (const b of values) for (const c of values) for (const d of values) {
      const answers = { olympics_q1: a, olympics_q2: b, olympics_q3: c, olympics_q4: d, olympics_q5: q5 };
      if (['olympics_q1', 'olympics_q2', 'olympics_q3', 'olympics_q4'].reduce((s, k) => s + L.OLYMPICS_POINTS.q1_to_q4[answers[k]], 0) === rest) return answers;
    }
  }
  throw new Error('no olympics answers for ' + total);
}
function masksFor(total) {
  const silver = Math.min(3, total - 2);
  const gold = Math.min(3, total - silver - 1);
  return { masks_silver: silver, masks_gold: gold, masks_black: total - silver - gold };
}
function run({ genre, flavour, gate1, gate2, slider = 'Testing', olympics = 9, masks = 5 }) {
  return L.calculate({ genre_calling: genre, genre_flavour: flavour, gate_1: gate1, gate_2: gate2, darkness: slider, ...olympicsFor(olympics), ...masksFor(masks) });
}

test('4.9 Example 1: Fantasy, Epic Quests, the world → Fiction Nerd, Soul, Athena', () => {
  const r = run({ genre: 'Fantasy', flavour: 'Epic Quests', gate1: 'The story', gate2: 'The world', slider: 'Testing', olympics: 9, masks: 4 });
  assert.equal(r.literary_grade, 'D');
  assert.equal(r.final_archetype, 'Fiction Nerd');
  assert.equal(r.house, 'Soul');
  assert.equal(r.moral_band, 'Light');
  assert.equal(r.moral_tier, 'Golden Retriever');
  assert.equal(r.soul_character, 'Athena');
  assert.equal(r.validation_changed, 'no');
  assert.equal(r.fallback_used, 'no');
  assert.equal(r.highbrow_override, 'no');
});

test('4.9 Example 2: Romance, Slow Burn, the writing, grade D → Cupid, Heart, Jane Eyre', () => {
  const r = run({ genre: 'Romance', flavour: 'Slow Burn', gate1: 'The writing', olympics: 9, masks: 6 });
  assert.equal(r.provisional_archetype, 'Writer-Reader');
  assert.equal(r.validation_changed, 'yes');
  assert.equal(r.final_archetype, 'Cupid');
  assert.equal(r.house, 'Heart');
  assert.equal(r.moral_tier, 'Morally Grey');
  assert.equal(r.soul_character, 'Jane Eyre');
});

test('4.9 Example 3: The Literary, Grief & Loss, Feeling at home, A+ → Highbrow, Mind, Faust', () => {
  const r = run({ genre: 'The Literary', flavour: 'Grief & Loss', gate1: 'The love', gate2: 'Feeling at home', olympics: 18, masks: 8 });
  assert.equal(r.literary_grade, 'A+');
  assert.equal(r.provisional_archetype, 'Empath');
  assert.equal(r.highbrow_override, 'yes');
  assert.equal(r.final_archetype, 'Highbrow');
  assert.equal(r.house, 'Mind');
  assert.equal(r.moral_tier, 'Villain Era');
  assert.equal(r.soul_character, 'Faust');
});

test('4.9 Example 4: Horror, Body, the dark, Gentle → Adrenaline Junkie, Body', () => {
  const r = run({ genre: 'Horror', flavour: 'Body', gate1: 'The guilty pleasure', gate2: 'The dark', slider: 'Gentle' });
  assert.equal(r.provisional_archetype, 'Nihilist');
  assert.equal(r.validation_changed, 'yes');
  assert.equal(r.final_archetype, 'Adrenaline Junkie');
  assert.equal(r.house, 'Body');
  assert.equal(r.fallback_used, 'no');
});

test('4.9 Example 5: Romance, Dark Obsession, the dark, Testing → Smutter with fallback', () => {
  const r = run({ genre: 'Romance', flavour: 'Dark Obsession', gate1: 'The guilty pleasure', gate2: 'The dark', slider: 'Testing' });
  assert.equal(r.final_archetype, 'Smutter');
  assert.equal(r.house, 'Body');
  assert.equal(r.fallback_used, 'yes');
});

test('10.2 Writer-Reader below B falls back to the genre default in an open flavour, and the main in a normal one', () => {
  const open = run({ genre: 'Historical', flavour: 'Tudor England', gate1: 'The writing', olympics: 11 });
  assert.equal(open.final_archetype, 'Adventurer');
  assert.equal(open.fallback_used, 'no');
  const weird = run({ genre: 'Fantasy', flavour: 'Weird', gate1: 'The writing', olympics: 7 });
  assert.equal(weird.final_archetype, 'Adventurer');
  const normal = run({ genre: 'Mystery', flavour: 'Psychological', gate1: 'The writing', olympics: 10 });
  assert.equal(normal.final_archetype, 'Spectator');
  // At B or above, Writer-Reader stays wherever the flavour allows it.
  assert.equal(run({ genre: 'Mystery', flavour: 'Noir', gate1: 'The writing', olympics: 12 }).final_archetype, 'Writer-Reader');
});

test('10.3 Nihilist survives only on Unflinching (and the old "Hard" value)', () => {
  for (const slider of ['Unflinching', 'Hard']) {
    assert.equal(run({ genre: 'Horror', flavour: 'Body', gate1: 'The guilty pleasure', gate2: 'The dark', slider }).final_archetype, 'Nihilist');
  }
  assert.equal(run({ genre: 'Romance', flavour: 'Dark Obsession', gate1: 'The guilty pleasure', gate2: 'The dark', slider: 'Unflinching' }).final_archetype, 'Nihilist');
});

test('10.4 Highbrow fires only on The Literary and Contemporary at A+, never on "The writing"', () => {
  for (const genre of ['The Literary', 'Contemporary']) {
    assert.equal(run({ genre, flavour: 'Old Wounds', gate1: 'The story', gate2: 'The meaning', olympics: 18 }).final_archetype, 'Highbrow');
    assert.equal(run({ genre, flavour: 'Old Wounds', gate1: 'The writing', olympics: 18 }).final_archetype, 'Writer-Reader');
    assert.notEqual(run({ genre, flavour: 'Old Wounds', gate1: 'The story', gate2: 'The meaning', olympics: 16 }).final_archetype, 'Highbrow');
  }
  for (const [genre, flavour] of [['Fantasy', 'Dark Academia'], ['Mystery', 'Noir'], ['Romance', 'Slow Burn'], ['Historical', 'Any'], ['Horror', 'Folk'], ['Science Fiction', 'Cyber'], ['Romantasy', 'Slow Burn']]) {
    assert.notEqual(run({ genre, flavour, gate1: 'The love', gate2: 'Falling in love', olympics: 18 }).final_archetype, 'Highbrow', genre);
  }
});

test('10.5 every one of the 39 SoulCharacters can be reached', () => {
  const reached = new Set();
  const gates = Object.entries(L.GATE_TABLE).flatMap(([g1, row]) => Object.keys(row).map((g2) => [g1, g2 === '*' ? undefined : g2]));
  const flavours = Object.entries(L.SHORTLISTS).flatMap(([genre, rows]) => Object.keys(rows).map((f) => [genre, f])).concat([['Historical', 'Any era']]);
  for (const [genre, flavour] of flavours) for (const [g1, g2] of gates) for (const slider of ['Gentle', 'Unflinching']) for (const olympics of [9, 18]) for (const masks of [3, 6, 9]) {
    const r = run({ genre, flavour, gate1: g1, gate2: g2, slider, olympics, masks });
    reached.add(r.final_archetype + '|' + r.moral_band);
  }
  const expected = Object.keys(L.SOUL_CHARACTERS).flatMap((a) => ['Light', 'Grey', 'Dark'].map((b) => a + '|' + b));
  assert.equal(expected.length, 39);
  assert.deepEqual(expected.filter((key) => !reached.has(key)), []);
});

test('grade bands and moral tiers cover every possible total', () => {
  const grades = { 2: 'F', 3: 'F', 4: 'E', 6: 'E', 7: 'D', 9: 'D', 10: 'C', 11: 'C', 12: 'B', 13: 'B', 14: 'A', 16: 'A', 17: 'A', 18: 'A+' };
  for (const [total, grade] of Object.entries(grades)) assert.equal(L.gradeFor(Number(total)), grade, total);
  for (let t = 2; t <= 18; t++) if (t !== 17) assert.equal(L.olympicsTotal(olympicsFor(t)), t);
  for (let m = 3; m <= 9; m++) assert.ok(L.MORAL_TIERS[m], m);
  assert.throws(() => L.olympicsTotal({ ...olympicsFor(9), olympics_q2: 'Two.' }), /olympics_q2/);
});

test('results files use the spec slugs', () => {
  const r = run({ genre: 'Romance', flavour: 'Power Play', gate1: 'The guilty pleasure', gate2: 'The heat', masks: 6, olympics: 18 });
  assert.deepEqual(r.files, {
    character: 'character_mr-darcy.png', archetype: 'archetype_smutter.png', grade: 'grade_a-plus.png',
    moral: 'moral_morally-grey.png', house: 'house_of_body', emblem: 'emblem_body.png',
  });
  assert.equal(r.house_colour, '#271020');
});

test('older quiz genre spellings are read as the canonical ones', () => {
  assert.equal(run({ genre: 'Sci-Fi', flavour: 'Cyber', gate1: 'The story', gate2: 'The world' }).genre_calling, 'Science Fiction');
  assert.equal(run({ genre: 'Literary', flavour: 'Old Wounds', gate1: 'The story', gate2: 'The meaning', olympics: 18 }).final_archetype, 'Highbrow');
  assert.equal(run({ genre: 'Historical Fiction', flavour: 'x', gate1: 'The story', gate2: 'The hero' }).genre_calling, 'Historical');
});

test('10.6 every archetype has a 12-book swipe deck with its own file names', () => {
  for (const archetype of Object.keys(L.ARCHETYPES)) {
    const deck = L.swipeDeck(archetype);
    assert.equal(deck.length, 12, archetype);
    for (const book of deck) assert.ok(book.title && book.author && book.hook, archetype + ' ' + book.number);
  }
  assert.equal(L.swipeDeck('Cupid')[3].image, 'book_cupid_04.jpg');
  assert.equal(L.swipeDeck('Writer-Reader')[1].image, 'book_writer-reader_02.jpg');
  assert.equal(L.swipeDeck('Cupid')[3].title, 'Pride and Prejudice');
  assert.equal(L.swipeValue(L.swipeDeck('Adventurer')[11], 'Loved it'), 'The Hobbit | Loved it');
});

test('every shortlist uses real archetype names, and no main is Writer-Reader or Highbrow', () => {
  for (const [genre, rows] of Object.entries(L.SHORTLISTS)) for (const [flavour, [main, allowed]] of Object.entries(rows)) {
    if (main === null) continue;
    assert.ok(L.ARCHETYPES[main], `${genre}/${flavour} main`);
    assert.ok(!['Writer-Reader', 'Highbrow'].includes(main), `${genre}/${flavour} main`);
    assert.ok(allowed.includes(main), `${genre}/${flavour}: main must be allowed`);
    for (const a of allowed) assert.ok(L.ARCHETYPES[a], `${genre}/${flavour}: ${a}`);
  }
});
