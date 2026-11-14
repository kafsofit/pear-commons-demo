// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PDFDocument } = require('../prototype/vendor/pdf-lib.js');
const { FIXTURES, currentEntry, selectedEntries, makeExport, readableText, makePdf, wrapText } = require('../prototype/exports.js');

const draft = { preparation: 'draft preparation', responses: { notice: 'n', context: 'c', resources: 'r', choice: 'ch' }, updatedAt: '2026-11-14T12:00:00Z' };

test('two archive examples are explicitly fixtures with test text and distinct illustrative dates', () => {
  assert.equal(FIXTURES.length, 2);
  for (const entry of FIXTURES) {
    assert.equal(entry.fixture, true);
    assert.equal(entry.preparation, 'test text');
    assert.deepEqual(Object.values(entry.responses), ['test text','test text','test text','test text']);
    assert.ok(entry.createdAt < entry.modifiedAt);
  }
});

test('selection supports current, selected fixtures, and both fixtures without implying a journal save', () => {
  assert.equal(selectedEntries('current', [], draft, 'absent').length, 1);
  assert.deepEqual(selectedEntries('selected', ['fixture-entry-002'], draft, 'absent').map(e => e.id), ['fixture-entry-002']);
  assert.equal(selectedEntries('all', [], draft, 'absent').length, 2);
  assert.equal(selectedEntries('selected', [], draft, 'absent').length, 0);
});

test('created and modified dates distinguish unsaved and explicitly saved current work', () => {
  const unsaved = currentEntry(draft, 'absent');
  assert.equal(unsaved.createdAt, null);
  assert.equal(unsaved.modifiedAt, null);
  const saved = currentEntry(draft, 'present', undefined, { createdAt: draft.updatedAt, modifiedAt: draft.updatedAt });
  assert.equal(saved.createdAt, draft.updatedAt);
  assert.equal(saved.modifiedAt, draft.updatedAt);
});

test('readable export includes created, modified, exported, fixture disclosure, and every answer', () => {
  const data = makeExport(FIXTURES, '2026-11-14T18:00:00Z');
  const text = readableText(data);
  assert.match(text, /Created: 2026-11-01T09:15:00Z/);
  assert.match(text, /Last modified: 2026-11-04T16:20:00Z/);
  assert.match(text, /Exported: 2026-11-14T18:00:00Z/);
  assert.match(text, /Illustrative fixture timestamps, not evidence of real saving or publication/);
  assert.equal((text.match(/test text/g) || []).length, 10);
});

test('PDF export produces a parseable multi-entry document with metadata and pages', async () => {
  const data = makeExport(FIXTURES, '2026-11-14T18:00:00Z');
  const bytes = await makePdf(data);
  assert.ok(bytes.length > 1000);
  const doc = await PDFDocument.load(bytes);
  assert.ok(doc.getPageCount() >= 1);
  assert.equal(doc.getTitle(), 'pear — fictional journal export');
  assert.equal(data.entryCount, 2);
});

test('long unbroken text is bounded into PDF lines instead of overflowing the page', async () => {
  const { PDFDocument, StandardFonts } = require('../prototype/vendor/pdf-lib.js');
  const doc = await PDFDocument.create(); const font = await doc.embedFont(StandardFonts.Helvetica);
  const lines = wrapText('x'.repeat(1000), font, 10, 491);
  assert.ok(lines.length > 1);
  assert.ok(lines.every(line => font.widthOfTextAtSize(line, 10) <= 491));
});
