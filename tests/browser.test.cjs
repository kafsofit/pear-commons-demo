// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

const ROOT = path.join(__dirname, '..');
const URL = `file://${path.join(ROOT, 'prototype', 'index.html')}`;
const OUT = path.join(ROOT, 'artifacts', 'local');
fs.mkdirSync(OUT, { recursive: true });
let browser;

async function fixture(viewport = { width: 1440, height: 1100 }) {
  const context = await browser.newContext({
    viewport,
    offline: true,
    acceptDownloads: true,
    reducedMotion: 'reduce',
  });
  const external = [];
  await context.route(/^https?:/, async (route) => {
    external.push(route.request().url());
    await route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(URL);
  await page.waitForFunction(() => Boolean(window.pearPrototype));
  // Most workflow checks start inside the walkthrough, reached through the
  // same visible reviewer action as a person opening the front door.
  if (!process.env.PEAR_TEST_FRONT_DOOR) {
    await page.locator('.hero-actions [data-action="start-demo"]').click();
  }
  return { context, page, external, errors };
}

test.before(async () => {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
});
test.after(async () => { if (browser) await browser.close(); });

test('reviewer front door explains the proposition and links to an honest evidence view', async () => {
  process.env.PEAR_TEST_FRONT_DOOR = '1';
  const { context, page, external, errors } = await fixture();
  delete process.env.PEAR_TEST_FRONT_DOOR;
  try {
    assert.equal(await page.locator('#view-about').isVisible(), true);
    assert.match(await page.locator('.reviewer-hero').innerText(), /Support for those\s*who care for others/);
    assert.match(await page.locator('.hero-note').innerText(), /No account, model, analytics, or network connection required/);
    assert.equal(await page.locator('#view-prepare').isVisible(), false);
    await page.locator('.hero-actions [data-view="evidence"]').click();
    assert.equal(await page.locator('#view-evidence').isVisible(), true);
    assert.match(await page.locator('.evidence-caveat').innerText(), /not clinical, occupational, production-security, or full accessibility validation/);
    assert.match(await page.locator('.evidence-table').innerText(), /Failed re-save and deletion produce persistent warnings/);
    await page.locator('#view-evidence [data-action="start-demo"]').click();
    assert.equal(await page.locator('#view-prepare').isVisible(), true);
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('reviewer can fill a fictional journey without silent persistence and complete its review', async () => {
  const { context, page, external, errors } = await fixture();
  try {
    await page.locator('[data-action="fill-example"]').click();
    assert.match(await page.locator('#preparation').inputValue(), /^FICTIONAL EXAMPLE/);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    assert.match(await page.locator('#prompt-notice').inputValue(), /^FICTIONAL EXAMPLE/);
    assert.match(await page.locator('#prompt-choice').inputValue(), /^FICTIONAL EXAMPLE/);
    await page.locator('#view-navigate [data-action="to-close"]').click();
    assert.match(await page.locator('#reflection-review').innerText(), /FICTIONAL EXAMPLE/);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('example replacement requires confirmation, preserves sentinel on cancel, and retains saved copy', async () => {
  const { context, page, external, errors } = await fixture();
  try {
    await page.getByLabel(/What intention, support, or boundary/).fill('Sentinel saved text');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="save"]').click();
    await page.getByRole('button', { name: 'Save fictional entry' }).click();
    assert.equal(await page.evaluate(() => localStorage.length), 1);
    await page.locator('.nav-item[data-view="prepare"]').click();
    await page.locator('#preparation').fill('Sentinel unsaved working text');
    await page.locator('[data-action="fill-example"]').click();
    assert.equal(await page.locator('#app-dialog').isVisible(), true);
    assert.match(await page.locator('#dialog-body').innerText(), /cannot be undone/);
    await page.getByRole('button', { name: 'Keep my working answers' }).click();
    assert.equal(await page.locator('#preparation').inputValue(), 'Sentinel unsaved working text');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('pear.prototype.reflection.v1')).preparation), 'Sentinel saved text');
    await page.locator('[data-action="fill-example"]').click();
    await page.getByRole('button', { name: 'Replace with fictional example' }).click();
    assert.match(await page.locator('#preparation').inputValue(), /^FICTIONAL EXAMPLE/);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('pear.prototype.reflection.v1')).preparation), 'Sentinel saved text');
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('example replacement preserves an existing failed-deletion warning', async () => {
  const { context, page, errors } = await fixture();
  try {
    await page.getByLabel(/What intention, support, or boundary/).fill('Saved warning fixture');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="save"]').click();
    await page.getByRole('button', { name: 'Save fictional entry' }).click();
    await page.evaluate(() => {
      Object.defineProperty(Object.getPrototypeOf(localStorage), 'removeItem', {
        configurable: true,
        value() { throw new Error('Simulated removal failure before example fill'); },
      });
    });
    await page.locator('#view-close [data-action="delete"]').click();
    await page.getByRole('button', { name: 'Delete current entry', exact: true }).click();
    assert.equal(await page.locator('#storage-warning').isVisible(), true);
    assert.match(await page.locator('#storage-warning').innerText(), /saved copy may remain/);
    // Working text is already empty after deletion; no replacement dialog is
    // needed. The uncertain saved-copy warning must nevertheless survive.
    await page.locator('[data-action="fill-example"]').click();
    assert.equal(await page.locator('#app-dialog').isVisible(), false);
    assert.match(await page.locator('#preparation').inputValue(), /^FICTIONAL EXAMPLE/);
    assert.equal(await page.locator('#storage-warning').isVisible(), true);
    assert.match(await page.locator('#storage-warning').innerText(), /saved copy may remain/);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('navigation focuses each new heading and mobile evidence has no clipped inner regions', async () => {
  process.env.PEAR_TEST_FRONT_DOOR = '1';
  const { context, page, errors } = await fixture({ width: 390, height: 844 });
  delete process.env.PEAR_TEST_FRONT_DOOR;
  try {
    await page.locator('.hero-actions [data-view="evidence"]').click();
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1');
    assert.match(await page.evaluate(() => document.activeElement.textContent), /Claims with edges/);
    const layout = await page.evaluate(() => {
      const table = document.querySelector('.evidence-table');
      const firstRow = document.querySelector('.evidence-table tbody tr');
      return {
        pageOverflow: document.documentElement.scrollWidth > window.innerWidth,
        tableWidth: table.getBoundingClientRect().width,
        firstRowDisplay: getComputedStyle(firstRow).display,
        captionWidth: document.querySelector('.evidence-table caption').getBoundingClientRect().width,
        navScrollWidth: document.querySelector('.sidebar nav').scrollWidth,
        navClientWidth: document.querySelector('.sidebar nav').clientWidth,
      };
    });
    assert.equal(layout.pageOverflow, false);
    assert.equal(layout.firstRowDisplay, 'block');
    assert.ok(layout.tableWidth <= 390);
    assert.ok(layout.captionWidth > 300, `Evidence caption should use the mobile content width; got ${layout.captionWidth}px`);
    assert.equal(layout.navScrollWidth <= layout.navClientWidth, true);
    const evidenceNav = page.locator('.nav-item[data-view="evidence"]');
    await evidenceNav.focus();
    const visible = await evidenceNav.evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= window.innerWidth;
    });
    assert.equal(visible, true);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('export creation failure is disclosed without confirming an export', async () => {
  const { context, page, errors } = await fixture();
  try {
    await page.locator('[data-action="fill-example"]').click();
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="export"]').click();
    await page.evaluate(() => { URL.createObjectURL = () => { throw new Error('Simulated export creation failure'); }; });
    await page.getByRole('button', { name: 'Download JSON backup' }).click();
    assert.match(await page.locator('.export-status').innerText(), /could not create or request this export/);
    assert.match(await page.locator('.export-status').innerText(), /No export was confirmed/);
    assert.match(await page.locator('#reflection-review').innerText(), /FICTIONAL EXAMPLE/);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('demo archive exports selected fixtures as TXT, PDF, and JSON with truthful timestamps', async () => {
  const { context, page, external, errors } = await fixture();
  try {
    await page.locator('[data-action="fill-example"]').click();
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="export"]').click();
    await page.locator('#export-scope').selectOption('all');
    assert.match(await page.locator('#dialog-body').innerText(), /Demo fixtures only—not your saved journal/);
    assert.match(await page.locator('.archive-choice').innerText(), /Fictional archive entry 01/);
    assert.match(await page.locator('.archive-choice').innerText(), /Fictional archive entry 02/);
    for (const [buttonName, extension] of [['Download readable text','txt'],['Download PDF','pdf'],['Download JSON backup','json']]) {
      const promise = page.waitForEvent('download');
      await page.getByRole('button', { name: buttonName, exact: true }).click();
      const download = await promise;
      assert.ok(download.suggestedFilename().endsWith(extension));
      const bytes = require('node:fs').readFileSync(await download.path());
      assert.ok(bytes.length > 100);
      if (extension === 'json') {
        const data = JSON.parse(bytes.toString('utf8'));
        assert.equal(data.entryCount, 2);
        assert.ok(data.entries.every(entry => entry.fixture && entry.preparation === 'test text'));
        assert.ok(data.entries.every(entry => entry.createdAt && entry.modifiedAt && data.exportedAt));
        assert.match(data.entries[0].dateNote, /Illustrative fixture timestamps/);
      } else if (extension === 'txt') {
        assert.match(bytes.toString('utf8'), /Created: 2026-11-01T09:15:00Z/);
        assert.match(bytes.toString('utf8'), /Last modified: 2026-11-04T16:20:00Z/);
      } else {
        assert.equal(bytes.subarray(0,4).toString(), '%PDF');
      }
    }
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v => ({id:v.id,nodes:v.nodes.length})), []);
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('save and finish preserves work on failure and clears only after confirmed save', async () => {
  const { context, page, errors } = await fixture();
  try {
    await page.locator('#preparation').fill('Sentinel save and finish');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.evaluate(() => { Object.defineProperty(Object.getPrototypeOf(localStorage), 'setItem', { configurable: true, value() { throw new Error('save failure'); } }); });
    await page.locator('#view-close [data-action="save-finish"]').click();
    await page.locator('#dialog-actions').getByRole('button', { name: 'Save and finish', exact: true }).click();
    assert.match(await page.locator('#dialog-title').innerText(), /not saved/);
    assert.equal((await page.evaluate(() => window.pearPrototype.snapshot())).draft.preparation, 'Sentinel save and finish');
    await page.getByRole('button', { name: 'Return to my working text' }).click();
    await page.reload(); await page.waitForFunction(() => Boolean(window.pearPrototype));
    await page.locator('.hero-actions [data-action="start-demo"]').click();
    await page.locator('#preparation').fill('Confirmed save and finish');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="save-finish"]').click();
    await page.locator('#dialog-actions').getByRole('button', { name: 'Save and finish', exact: true }).click();
    assert.equal(await page.locator('#preparation').inputValue(), '');
    assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem('pear.prototype.reflection.v1'))).preparation, 'Confirmed save and finish');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('offline file workflow: edit without save, pause, resource separation, and no network', async () => {
  const { context, page, external, errors } = await fixture();
  try {
    await page.getByLabel(/What intention, support, or boundary/).fill('Fictional intention: notice assumptions and retain a pause.');
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#prompt-notice').fill('Fictional uncertainty.');
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    await page.locator('#view-navigate [data-action="pause"]').click();
    assert.equal(await page.locator('#app-dialog').isVisible(), true);
    assert.match(await page.locator('#dialog-body').innerText(), /Nothing here contacts a colleague or emergency service/);
    await page.getByRole('button', { name: 'Keep paused' }).click();
    await page.locator('.nav-item[data-view="resource"]').click();
    assert.match(await page.locator('#view-resource').innerText(), /No automatic commons flow/);
    assert.equal(await page.locator('[data-action="publish"], [data-action="contribute"], [data-action="share"]').count(), 0);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('explicit save, reload/revision, export preview/download, and scoped delete', async () => {
  const { context, page, external, errors } = await fixture();
  try {
    await page.getByLabel(/What intention, support, or boundary/).fill('Fictional save test');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('[data-action="save"]').click();
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    await page.getByRole('button', { name: 'Save fictional entry' }).click();
    assert.equal(await page.evaluate(() => localStorage.length), 1);
    assert.match(await page.locator('#save-status').innerText(), /Saved in this browser/);
    await page.reload();
    await page.waitForFunction(() => Boolean(window.pearPrototype));
    await page.locator('.hero-actions [data-action="start-demo"]').click();
    assert.equal(await page.locator('#preparation').inputValue(), 'Fictional save test');
    await page.locator('#preparation').fill('Revised fictional save test');
    assert.match(await page.locator('#save-status').innerText(), /not yet saved/);
    await page.locator('#preparation').fill('Fictional save test');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="export"]').click();
    await page.locator('#export-scope').focus();
    await page.keyboard.press('End');
    await page.waitForFunction(() => {
      const p = document.querySelector('#export-scope');
      return p.value === 'all';
    });
    const exportAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    assert.deepEqual(exportAxe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), []);
    await page.keyboard.press('Escape');
    await page.locator('#view-close [data-action="export"]').click();
    assert.match(await page.locator('#export-scope').inputValue(), /current/);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download JSON backup' }).click();
    const download = await downloadPromise;
    const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(exported.entries[0].preparation, 'Fictional save test');
    assert.equal(exported.fictionalOnly, true);
    await page.getByRole('button', { name: 'Close export' }).click();
    await page.locator('[data-action="delete"]').click();
    await page.getByRole('button', { name: 'Delete current entry', exact: true }).click();
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.equal((await page.evaluate(() => window.pearPrototype.snapshot())).draft.preparation, '');
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('failed deletion retains the key and leaves a persistent unconfirmed-copy warning', async () => {
  const { context, page, errors } = await fixture();
  try {
    await page.getByLabel(/What intention, support, or boundary/).fill('Fictional deletion failure test');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="save"]').click();
    await page.getByRole('button', { name: 'Save fictional entry' }).click();
    assert.equal(await page.evaluate(() => localStorage.length), 1);
    // Simulate a browser/storage failure only after a legitimate explicit save.
    await page.evaluate(() => {
      const proto = Object.getPrototypeOf(localStorage);
      Object.defineProperty(proto, 'removeItem', {
        configurable: true,
        value() { throw new Error('Simulated browser removal failure'); },
      });
    });
    await page.locator('#view-close [data-action="delete"]').click();
    await page.getByRole('button', { name: 'Delete current entry', exact: true }).click();
    assert.equal(await page.evaluate(() => localStorage.length), 1);
    assert.equal((await page.evaluate(() => window.pearPrototype.snapshot())).savedCopy, 'present');
    assert.equal((await page.evaluate(() => window.pearPrototype.snapshot())).retentionUncertain, true);
    assert.match(await page.locator('#save-status').innerText(), /saved copy may remain/);
    const warning = page.locator('#storage-warning');
    assert.equal(await warning.isVisible(), true);
    assert.match(await warning.innerText(), /saved copy may remain/);
    assert.doesNotMatch(await page.locator('#save-status').innerText(), /^Unsaved/);
    await page.waitForTimeout(6800);
    assert.equal(await warning.isVisible(), true);
    await page.locator('.exit-actions [data-action="end"]').click();
    await page.locator('#dialog-actions').getByRole('button', { name: 'Finish without saving', exact: true }).click();
    assert.equal(await warning.isVisible(), true);
    assert.match(await warning.innerText(), /saved copy may remain/);
    assert.match(await page.locator('#save-status').innerText(), /saved copy may remain/);
    assert.equal(await page.locator('#toast').isVisible(), false);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('ending preserves a saved version; a failed newer save keeps it distinct', async () => {
  const { context, page, errors } = await fixture();
  try {
    await page.getByLabel(/What intention, support, or boundary/).fill('Fictional older version');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="save"]').click();
    await page.getByRole('button', { name: 'Save fictional entry' }).click();
    await page.locator('#view-close [data-action="end"]').click();
    await page.locator('#dialog-actions').getByRole('button', { name: 'Finish without saving', exact: true }).click();
    assert.match(await page.locator('#save-status').innerText(), /previous saved version remains/);
    const endWarning = page.locator('#storage-warning');
    assert.equal(await endWarning.isVisible(), true);
    assert.match(await endWarning.innerText(), /previously saved version remains/);
    await page.reload();
    await page.waitForFunction(() => Boolean(window.pearPrototype));
    await page.locator('.hero-actions [data-action="start-demo"]').click();
    assert.equal(await page.locator('#preparation').inputValue(), 'Fictional older version');
    await page.locator('#preparation').fill('Fictional newer unsaved version');
    await page.evaluate(() => {
      Object.defineProperty(Object.getPrototypeOf(localStorage), 'setItem', {
        configurable: true,
        value() { throw new Error('Simulated browser save failure'); },
      });
    });
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="save"]').click();
    await page.getByRole('button', { name: 'Save fictional entry' }).click();
    assert.match(await page.locator('#save-status').innerText(), /previous saved version available/);
    const warning = page.locator('#storage-warning');
    assert.equal(await warning.isVisible(), true);
    assert.match(await warning.innerText(), /older saved copy may remain/);
    assert.equal(await page.locator('#toast').isVisible(), false);
    await page.reload();
    await page.waitForFunction(() => Boolean(window.pearPrototype));
    await page.locator('.hero-actions [data-action="start-demo"]').click();
    assert.equal(await page.locator('#preparation').inputValue(), 'Fictional older version');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('same-page failed re-save clears a still-visible earlier success toast', async () => {
  const { context, page, errors } = await fixture();
  try {
    await page.getByLabel(/What intention, support, or boundary/).fill('Fictional initial save');
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="save"]').click();
    await page.getByRole('button', { name: 'Save fictional entry' }).click();
    const toast = page.locator('#toast');
    assert.equal(await toast.isVisible(), true);
    assert.match(await toast.innerText(), /Saved only in this browser profile/);
    await page.locator('#view-prepare .nav-item[data-view="prepare"], .nav-item[data-view="prepare"]').first().click();
    await page.locator('#preparation').fill('Fictional newer unsaved edit');
    await page.evaluate(() => {
      Object.defineProperty(Object.getPrototypeOf(localStorage), 'setItem', {
        configurable: true,
        value() { throw new Error('Simulated same-page save failure'); },
      });
    });
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#view-navigate [data-action="to-close"]').click();
    await page.locator('#view-close [data-action="save"]').click();
    await page.getByRole('button', { name: 'Save fictional entry' }).click();
    assert.equal(await toast.isVisible(), false);
    assert.equal(await toast.innerText(), '');
    assert.equal(await page.locator('#storage-warning').isVisible(), true);
    assert.match(await page.locator('#storage-warning').innerText(), /did not save your latest edits/);
    assert.equal(await page.evaluate(() => localStorage.length), 1);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('decline requires confirmation and does not create durable state', async () => {
  const { context, page } = await fixture();
  try {
    await page.locator('#view-prepare [data-action="to-navigate"]').click();
    await page.locator('#prompt-choice').fill('Fictional choice');
    await page.locator('[data-action="decline"]').click();
    await page.getByRole('button', { name: 'Clear navigation answers' }).click();
    assert.equal(await page.locator('#prompt-choice').inputValue(), '');
    assert.equal(await page.evaluate(() => localStorage.length), 0);
  } finally { await context.close(); }
});

test('all views and storage dialog pass the automated accessibility scan', async () => {
  const { context, page, errors } = await fixture();
  try {
    const reports = {};
    for (const view of ['about', 'prepare', 'navigate', 'close', 'resource', 'evidence']) {
      await page.locator(`.nav-item[data-view="${view}"]`).click();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      reports[view] = results.violations;
    }
    await page.locator('[data-action="storage"]').click();
    const dialogResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    reports.storageDialog = dialogResults.violations;
    fs.writeFileSync(path.join(OUT, 'axe-all-views.json'), JSON.stringify(reports, null, 2));
    const summary = Object.entries(reports).flatMap(([view, violations]) => violations.map(v => ({ view, id: v.id, impact: v.impact, nodes: v.nodes.length })));
    assert.deepEqual(summary, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('keyboard navigation, dialog escape, responsive layout, and axe scan', async () => {
  process.env.PEAR_TEST_FRONT_DOOR = '1';
  const { context, page, errors } = await fixture();
  delete process.env.PEAR_TEST_FRONT_DOOR;
  try {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#view-prepare').isVisible(), true);
    await page.locator('.nav-item[data-view="about"]').click();
    assert.equal(await page.locator('#view-about').isVisible(), true);
    await page.locator('[data-action="storage"]').click();
    assert.equal(await page.locator('#app-dialog').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#app-dialog').isVisible(), false);
    await page.locator('[data-action="start-demo"]').first().click();
    await page.screenshot({ path: path.join(OUT, 'pear-desktop.png'), fullPage: true });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    fs.writeFileSync(path.join(OUT, 'axe-desktop.json'), JSON.stringify(results.violations, null, 2));
    assert.deepEqual(results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), []);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: path.join(OUT, 'pear-mobile.png'), fullPage: true });
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
