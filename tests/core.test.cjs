// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createStore, emptyDraft, normaliseDraft, STORAGE_KEY } = require('../prototype/core.js');

function adapter(initial = null) {
  const data = new Map();
  if (initial !== null) data.set(STORAGE_KEY, initial);
  return {
    writes: 0, removals: 0,
    setItem(key, value) { this.writes += 1; data.set(key, String(value)); },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    removeItem(key) { this.removals += 1; data.delete(key); },
    value() { return data.get(STORAGE_KEY); },
  };
}

test('editing is in-memory and never silently saves', () => {
  const a = adapter(); const s = createStore(a, () => '2026-11-06T00:00:00Z');
  s.update({ preparation: 'fictional preparation', responses: { notice: 'uncertain' } });
  assert.equal(a.writes, 0);
  assert.equal(a.value(), undefined);
  assert.equal(s.snapshot().saved, false);
  assert.equal(s.snapshot().draft.responses.notice, 'uncertain');
});

test('save requires an explicit action and preserves worker-authored unknowns', () => {
  const a = adapter(); const s = createStore(a, () => '2026-11-06T00:00:00Z');
  s.update({ responses: { choice: 'Not decided' } });
  s.save();
  assert.equal(a.writes, 1);
  assert.equal(s.snapshot().saved, true);
  const persisted = JSON.parse(a.value());
  assert.equal(persisted.responses.choice, 'Not decided');
  assert.equal(persisted.responses.notice, '');
});

test('restore reads only the normalised fictional fixture schema', () => {
  const raw = JSON.stringify({ ...emptyDraft(), preparation: 'fictional', unexpected: 'ignore me' });
  const a = adapter(raw); const s = createStore(a);
  const state = s.restore();
  assert.equal(state.saved, true);
  assert.equal(state.draft.preparation, 'fictional');
  assert.equal(Object.hasOwn(state.draft, 'unexpected'), false);
});

test('saved and dirty states distinguish a persisted version from later edits', () => {
  const a = adapter(); const s = createStore(a);
  s.update({ preparation: 'fictional initial' });
  assert.equal(s.snapshot().dirty, true);
  s.save();
  assert.equal(s.snapshot().saved, true);
  assert.equal(s.snapshot().dirty, false);
  s.update({ preparation: 'fictional revision' });
  assert.equal(s.snapshot().saved, true);
  assert.equal(s.snapshot().dirty, true);
});

test('failed re-save preserves knowledge of an older saved copy', () => {
  const a = adapter(); const s = createStore(a);
  s.update({ preparation: 'fictional older version' }); s.save();
  s.update({ preparation: 'fictional newer unsaved version' });
  a.setItem = () => { throw new Error('quota'); };
  const state = s.save();
  assert.equal(state.saved, true);
  assert.equal(state.savedCopy, 'present');
  assert.equal(state.dirty, true);
  assert.match(state.lastError, /older saved copy may remain/);
  assert.equal(JSON.parse(a.value()).preparation, 'fictional older version');
});

test('clearWorking clears current text without erasing saved-copy knowledge', () => {
  const a = adapter(); const s = createStore(a);
  s.update({ preparation: 'fictional saved version' }); s.save();
  const state = s.clearWorking();
  assert.equal(state.draft.preparation, '');
  assert.equal(state.savedCopy, 'present');
  assert.equal(state.dirty, true);
  assert.equal(a.removals, 0);
  assert.equal(JSON.parse(a.value()).preparation, 'fictional saved version');
});

test('delete clears working state and requests removal of saved state', () => {
  const a = adapter(); const s = createStore(a);
  s.update({ preparation: 'fictional' }); s.save();
  s.update({ preparation: 'revised fictional' });
  const state = s.remove();
  assert.equal(a.removals, 1);
  assert.equal(a.value(), undefined);
  assert.equal(state.saved, false);
  assert.equal(state.draft.preparation, '');
  assert.deepEqual(state.draft.responses, emptyDraft().responses);
});

test('export is detached and does not create a storage write', () => {
  const a = adapter(); const s = createStore(a, () => '2026-11-06T00:00:00Z');
  s.update({ preparation: 'fictional export' });
  const exported = s.exportSnapshot();
  assert.equal(a.writes, 0);
  assert.equal(exported.fictionalOnly, true);
  assert.equal(exported.reflection.preparation, 'fictional export');
  assert.match(exported.notice, /outside prototype deletion control/);
  exported.reflection.preparation = 'changed outside';
  assert.equal(s.snapshot().draft.preparation, 'fictional export');
});

test('failed save is disclosed rather than reported as success', () => {
  const a = adapter(); a.setItem = () => { throw new Error('quota'); };
  const s = createStore(a); s.update({ preparation: 'fictional' });
  const state = s.save();
  assert.equal(state.saved, false);
  assert.match(state.lastError, /did not save/);
  assert.equal(state.draft.preparation, 'fictional');
});

test('failed delete does not make a false removal guarantee', () => {
  const a = adapter(); a.removeItem = () => { throw new Error('blocked'); };
  const s = createStore(a); const state = s.remove();
  assert.equal(state.savedCopy, 'mayRemain');
  assert.equal(state.saved, false);
  assert.match(state.lastError, /did not confirm removal/);
});

test('corrupt or unsupported saved content does not become an active reflection', () => {
  const a = adapter('{not-json'); const s = createStore(a); const state = s.restore();
  assert.equal(state.saved, false);
  assert.deepEqual({ ...state.draft, createdAt: undefined }, { ...emptyDraft(), createdAt: undefined });
  assert.equal(state.savedCopy, 'mayRemain');
  assert.match(state.lastError, /could not be read/);
});

test('storage read failure cannot be represented as confirmed absence', () => {
  const a = adapter(); a.getItem = () => { throw new Error('blocked'); };
  const s = createStore(a); const state = s.restore();
  assert.equal(state.savedCopy, 'mayRemain');
  assert.match(state.lastError, /saved copy may remain unread/);
});

test('input is bounded and non-string values cannot enter state', () => {
  const state = normaliseDraft({ preparation: 'x'.repeat(7000), responses: { notice: 42 } });
  assert.equal(state.preparation.length, 6000);
  assert.equal(state.responses.notice, '');
});
