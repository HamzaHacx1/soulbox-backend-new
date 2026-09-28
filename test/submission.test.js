const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const { computeResults } = require('../src/services/results');

function setup(existingHeaders = [], failure) {
  const calls = { updates: [], appends: [] };
  const values = {
    async get() {
      if (failure === 'get') throw new Error('Sheets unavailable');
      return { data: { values: [existingHeaders] } };
    },
    async update(request) {
      if (failure === 'update') throw new Error('Sheets unavailable');
      calls.updates.push(request.resource.values[0]);
    },
    async append(request) {
      if (failure === 'append') throw new Error('Sheets unavailable');
      calls.appends.push(request.resource.values[0]);
    },
  };
  const context = {
    module: { exports: {} }, process: { env: {} },
    console: { log() {}, error() {} },
    require(name) {
      if (name === './results') return { computeResults };
      if (name === 'googleapis') return { google: {
        sheets: () => ({ spreadsheets: { values } }), auth: { JWT: class {} },
      } };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/services/submission'), 'utf8'), context);
  return { save: context.module.exports.saveSubmission, calls };
}

const profile = () => ({ email: 'reader@example.test', country: 'UK', chosen_curator: 'Wrong curator' });

test('saves every computed result and assigns the House curator', async () => {
  const { save, calls } = setup();
  const expected = computeResults(profile());
  const result = await save(profile());
  assert.equal(result.house, expected.house);
  const record = Object.fromEntries(calls.updates[0].map((header, i) => [header, calls.appends[0][i]]));
  for (const field of ['texture', 'why', 'style', 'house']) {
    assert.equal(record[`result.${field}`], expected[field]);
  }
  assert.equal(record.SoulCharacter, expected.soulCharacter);
  assert.equal(record.chosen_curator, expected.curator[0]);
  assert.equal(record['result.curator'], JSON.stringify(expected.curator));
});

test('retains historical column order and adds missing result columns', async () => {
  const original = ['email', 'legacy_notes', 'result.house', 'country'];
  const { save, calls } = setup(original);
  await save(profile());
  assert.deepEqual(Array.from(calls.updates[0].slice(0, original.length)), original);
  assert.equal(calls.appends[0][0], 'reader@example.test');
  assert.equal(calls.appends[0][1], '');
  assert.equal(calls.appends[0][2], computeResults(profile()).house);
  assert.equal(calls.appends[0][3], 'UK');
});

test('does not rewrite complete headers even when reordered', async () => {
  const initial = setup();
  await initial.save(profile());
  const reordered = Array.from(initial.calls.updates[0]).reverse();
  const { save, calls } = setup(reordered);
  await save(profile());
  assert.equal(calls.updates.length, 0);
  assert.equal(calls.appends[0][reordered.indexOf('email')], 'reader@example.test');
});

for (const failure of ['get', 'update', 'append']) {
  test(`rejects a failed spreadsheet ${failure} instead of reporting success`, async () => {
    const { save, calls } = setup([], failure);
    await assert.rejects(save(profile()), /Sheets unavailable/);
    assert.equal(calls.appends.length, 0);
    if (failure === 'get') assert.equal(calls.updates.length, 0);
  });
}

test('rejects missing required profile fields without writing', async () => {
  const { save, calls } = setup();
  for (const input of [null, {}, { email: 'reader@example.test' }]) {
    await assert.rejects(save(input), /Email and country are required/);
  }
  assert.equal(calls.updates.length, 0);
  assert.equal(calls.appends.length, 0);
});
