// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const html = read('prototype/index.html');
const app = read('prototype/app.js');
const core = read('prototype/core.js');
const css = read('prototype/styles.css');

test('prototype discloses fictional, non-crisis, non-validated status', () => {
  assert.match(html, /Concept prototype · fictional material only/);
  assert.match(html, /Not for crisis response or live service-user records/);
  assert.match(html, /No clinical or privacy validation/);
});

test('CSP denies network connections and remote default resources', () => {
  const csp = html.match(/Content-Security-Policy" content="([^"]+)/)[1];
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /connect-src 'none'/);
  assert.match(csp, /form-action 'none'/);
});

test('runtime has no network, analytics, external frames, or model APIs', () => {
  const runtime = `${app}\n${core}`;
  const forbidden = [
    /\bfetch\s*\(/, /XMLHttpRequest/, /\bWebSocket\s*\(/, /\bEventSource\s*\(/,
    /\bnavigator\s*\.\s*sendBeacon\b/, /\bserviceWorker\b/, /\bRTCPeerConnection\b/,
    /\banalytics\b/i, /\bopenai\b/i, /\banthropic\b/i, /<iframe/i,
  ];
  forbidden.forEach((pattern) => assert.doesNotMatch(runtime, pattern));
  assert.doesNotMatch(html, /(?:src|href)=["']https?:\/\//i);
  assert.doesNotMatch(css, /@import|url\s*\(\s*["']?https?:/i);
});

test('core workflow, pause, refusal, export, and deletion controls are present', () => {
  for (const action of ['to-navigate', 'to-close', 'start-demo', 'fill-example', 'save-finish', 'pause', 'colleague', 'decline', 'end', 'without-saving', 'save', 'export', 'delete']) {
    assert.match(html, new RegExp(`data-action="${action}"`));
  }
  assert.match(app, /No one has been contacted/);
  assert.match(app, /unencrypted localStorage/);
  assert.match(read('prototype/exports.js'), /outside prototype deletion/);
});

test('commons resource is read-only and no private publishing flow exists', () => {
  assert.doesNotMatch(html, /data-action="(?:publish|contribute|share|post)"/);
  assert.match(html, /No automatic commons flow/);
  assert.match(read('prototype/scenarios.js'), /practitioner review pending/);
});

test('values groundwork protects support, consent, structural responsibility, and metaphor limits', () => {
  const values = read('docs/values-groundwork.md');
  assert.match(values, /augmenting the support available to workers—not augmenting their output, endurance, or exploitability/);
  assert.match(values, /psychosocial safety gear/);
  assert.match(values, /workers or the people seeking support/);
  assert.match(values, /not an established clinical or occupational-safety claim/);
  assert.match(values, /Consent does not justify unnecessary collection or secondary use/);
  assert.match(values, /shift responsibility for unsafe conditions from institutions to individuals/);
  assert.match(values, /Building worker power and solidarity requires intentional care for ourselves and one another/);
  assert.match(values, /relationships, organising, collective bargaining, or the material conditions/);
  assert.match(values, /Solidarity requires room for dissent, accountability, boundaries, and the refusal to disclose/);
  assert.match(values, /Tools do not replace showing up or doing the work needed to shift culture, society, and power/);
  assert.match(values, /pear can accompany that work; it cannot perform it on anyone's behalf/);
  assert.match(values, /pear, \(s\)pear, the practitioner commons, and the potential forum-like \/ wider civil-society horizon/);
  assert.match(read('docs/three-lanes.md'), /values-groundwork\.md/);
  assert.match(read('docs/three-lanes.md'), /values-groundwork\.md/);
  assert.match(read('README.md'), /docs\/values-groundwork\.md/);
});

test('basic semantic accessibility hooks exist', () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main id="main" tabindex="-1">/);
  assert.match(html, /<dialog id="app-dialog" aria-labelledby="dialog-title">/);
  assert.match(html, /aria-live="polite"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

test('release package has selected licenses, third-party notice, and confirmed attribution', () => {
  const license = read('LICENSE');
  assert.match(license, /Mozilla Public License 2\.0/);
  assert.match(license, /Attribution-ShareAlike 4\.0 International/);
  assert.match(license, /not.*relicensed/i);
  assert.match(read('LICENSE-CODE-MPL-2.0.txt'), /Mozilla Public License/);
  assert.match(read('LICENSE-DOCS-CC-BY-SA-4.0.txt'), /Attribution-ShareAlike 4\.0 International/);
  assert.match(read('prototype/vendor/pdf-lib-LICENSE.txt'), /MIT License/);
  const attribution = read('ATTRIBUTION.md');
  assert.match(attribution, /Owned and led by Alex K\. \/ Alex Argüelles · hosted by Cyborg Garden/);
  assert.match(attribution, /Confirmed by Alex K on 14 November 2026/);
  assert.match(read('README.md'), /https:\/\/github\.com\/kafsofit\/pear-commons-demo/);
  for (const rel of ['prototype/app.js','prototype/core.js','prototype/exports.js']) assert.match(read(rel), /Mozilla Public License, v\. 2\.0/);
});
