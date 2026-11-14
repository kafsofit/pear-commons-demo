'use strict';
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.


/** Export fixtures and serializers. No storage, network, or save side effects. */
(function exposePearExports(root, factory) {
  const api = factory(root && root.PDFLib ? root.PDFLib : (typeof module === 'object' && module.exports ? require('./vendor/pdf-lib.js') : null));
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PearExports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createExports(pdfLib) {
  const PROMPTS = [
    ['Preparation', 'preparation'],
    ['Notice', 'notice'],
    ['Context', 'context'],
    ['Resources', 'resources'],
    ['Choice', 'choice'],
  ];

  const FIXTURES = Object.freeze([
    Object.freeze({
      id: 'fixture-entry-001', title: 'Fictional archive entry 01', fixture: true,
      createdAt: '2026-11-01T09:15:00Z', modifiedAt: '2026-11-01T09:42:00Z',
      preparation: 'test text', responses: Object.freeze({ notice: 'test text', context: 'test text', resources: 'test text', choice: 'test text' }),
    }),
    Object.freeze({
      id: 'fixture-entry-002', title: 'Fictional archive entry 02', fixture: true,
      createdAt: '2026-11-03T14:05:00Z', modifiedAt: '2026-11-04T16:20:00Z',
      preparation: 'test text', responses: Object.freeze({ notice: 'test text', context: 'test text', resources: 'test text', choice: 'test text' }),
    }),
  ]);

  function isTimestamp(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
  }

  function currentEntry(draft, savedCopy, now, savedTimestamps = {}) {
    const modifiedAt = savedCopy === 'present' && isTimestamp(savedTimestamps.modifiedAt) ? savedTimestamps.modifiedAt : null;
    const createdAt = savedCopy === 'present' && isTimestamp(savedTimestamps.createdAt) ? savedTimestamps.createdAt : null;
    return {
      id: 'current-reflection', title: savedCopy === 'present' ? 'Current saved reflection' : 'Current unsaved reflection',
      fixture: false, createdAt, modifiedAt,
      preparation: draft.preparation,
      responses: { ...draft.responses },
      status: createdAt ? 'Explicitly saved in this browser' : 'Unsaved working copy; creation date not yet established',
    };
  }

  function selectedEntries(scope, selectedIds, draft, savedCopy, now, savedTimestamps = {}) {
    if (scope === 'current') return [currentEntry(draft, savedCopy, now, savedTimestamps)];
    const chosen = scope === 'all' ? FIXTURES.map(entry => entry.id) : selectedIds;
    return FIXTURES.filter(entry => chosen.includes(entry.id)).map(entry => ({ ...entry, responses: { ...entry.responses } }));
  }

  function makeExport(entries, exportedAt) {
    if (!isTimestamp(exportedAt)) throw new TypeError('A valid export timestamp is required');
    return {
      format: 'pear-concept-journal-export', version: 2, prototype: true, fictionalOnly: true,
      notice: 'Concept export. No crisis-response or live service-user use. Downloaded copies are outside prototype deletion control. Fixture entries are built-in examples, not saved worker entries.',
      exportedAt,
      entryCount: entries.length,
      entries: entries.map(entry => ({
        id: entry.id, title: entry.title, fixture: entry.fixture,
        createdAt: entry.createdAt, modifiedAt: entry.modifiedAt,
        dateNote: entry.fixture ? 'Illustrative fixture timestamps, not evidence of real saving or publication.' : entry.createdAt ? 'Created means first explicit browser save in this demo; modified means latest explicit save.' : 'Unsaved working copy: no original save timestamp has been established.',
        preparation: entry.preparation, responses: { ...entry.responses },
      })),
    };
  }

  function readableText(data) {
    const lines = [
      'PEAR — FICTIONAL JOURNAL EXPORT',
      'Concept material only. Not for crisis response or live service-user records.',
      `Exported: ${data.exportedAt}`,
      `Entries: ${data.entryCount}`,
      '',
    ];
    for (const [index, entry] of data.entries.entries()) {
      lines.push('='.repeat(64));
      lines.push(`${index + 1}. ${entry.title}`);
      lines.push(entry.fixture ? 'Type: Built-in fictional demo fixture (not a saved worker entry)' : 'Type: Current reflection');
      lines.push(`Created: ${entry.createdAt || 'Not yet established — unsaved working copy'}`);
      lines.push(`Last modified: ${entry.modifiedAt || 'Not yet established'}`);
      lines.push(`Date note: ${entry.dateNote}`);
      for (const [label, id] of PROMPTS) {
        const value = id === 'preparation' ? entry.preparation : entry.responses[id];
        lines.push('', label.toUpperCase(), value || 'Left blank — a valid choice.');
      }
      lines.push('');
    }
    lines.push('Downloaded copies are outside pear prototype deletion, retention, and access control.');
    return lines.join('\n');
  }

  function wrapText(text, font, size, width) {
    const paragraphs = String(text).split('\n');
    const result = [];
    for (const paragraph of paragraphs) {
      if (!paragraph) { result.push(''); continue; }
      const words = paragraph.split(/\s+/);
      let line = '';
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
        else {
          if (line) result.push(line);
          line = word;
          while (font.widthOfTextAtSize(line, size) > width) {
            let cut = line.length - 1;
            while (cut > 1 && font.widthOfTextAtSize(line.slice(0, cut), size) > width) cut -= 1;
            result.push(line.slice(0, cut)); line = line.slice(cut);
          }
        }
      }
      if (line) result.push(line);
    }
    return result;
  }

  async function makePdf(data) {
    if (!pdfLib) throw new Error('Offline PDF library unavailable');
    const { PDFDocument, StandardFonts, rgb } = pdfLib;
    const document = await PDFDocument.create();
    document.setTitle('pear — fictional journal export');
    document.setSubject('Concept export; fictional material only');
    document.setCreator('pear local concept prototype');
    const regular = await document.embedFont(StandardFonts.Helvetica);
    const bold = await document.embedFont(StandardFonts.HelveticaBold);
    const pageWidth = 595.28, pageHeight = 841.89, margin = 52, bottom = 52;
    const contentWidth = pageWidth - (margin * 2);
    let page, y;
    function newPage() {
      page = document.addPage([pageWidth, pageHeight]); y = pageHeight - margin;
      page.drawText('pear · fictional journal export', { x: margin, y, size: 9, font: bold, color: rgb(0.14, 0.37, 0.33) });
      y -= 24;
    }
    function write(text, size = 10, isBold = false, gap = 5) {
      const font = isBold ? bold : regular;
      for (const line of wrapText(text, font, size, contentWidth)) {
        if (y < bottom + size + gap) newPage();
        if (line) page.drawText(line, { x: margin, y, size, font, color: rgb(0.16, 0.20, 0.18) });
        y -= size + 4;
      }
      y -= gap;
    }
    newPage();
    write('PEAR — FICTIONAL JOURNAL EXPORT', 18, true, 4);
    write('Concept material only. Not for crisis response or live service-user records.', 10, true);
    write(`Exported: ${data.exportedAt}\nEntries: ${data.entryCount}`);
    for (const [index, entry] of data.entries.entries()) {
      if (y < 200) newPage();
      write(`${index + 1}. ${entry.title}`, 14, true, 2);
      write(entry.fixture ? 'Built-in fictional demo fixture — not a saved worker entry' : 'Current reflection', 9, true, 2);
      write(`Created: ${entry.createdAt || 'Not yet established — unsaved working copy'}\nLast modified: ${entry.modifiedAt || 'Not yet established'}\nDate note: ${entry.dateNote}`, 9);
      for (const [label, id] of PROMPTS) {
        const value = id === 'preparation' ? entry.preparation : entry.responses[id];
        write(label, 11, true, 1);
        write(value || 'Left blank — a valid choice.', 10);
      }
    }
    write('Downloaded copies are outside pear prototype deletion, retention, and access control.', 9, true);
    return document.save();
  }

  return Object.freeze({ FIXTURES, PROMPTS, isTimestamp, currentEntry, selectedEntries, makeExport, readableText, makePdf, wrapText });
});
