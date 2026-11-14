'use strict';
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.


/**
 * Entirely fictional design fixture, not practitioner-approved training content.
 * Deliberately avoids a realistic crisis narrative, service-user record, or advice.
 */
window.PEAR_SCENARIOS = Object.freeze([
  {
    id: 'fictional-handoff-001',
    title: 'Before a fictional practice conversation',
    shortTitle: 'Preparation and support',
    status: 'Fictional · practitioner review pending',
    summary: 'A deliberately non-clinical design fixture: a worker wants to prepare, identify support, and notice assumptions before a constructed practice conversation. It contains no real person, event, or service-user narrative.',
    purpose: 'Explore whether a worker can orient themselves without receiving an assessment, scripted response, or instruction to disclose.',
    preparationPrompt: 'What intention, support, or boundary would you like to carry into this fictional practice?',
    limits: [
      'Not a reviewed training scenario and not a demonstration of effective crisis practice.',
      'The prompt may not fit every worker, language, community, or professional role.',
      'Reflection must not replace staffing, supervision, workload safety, or organisational accountability.',
      'Do not replace this fictional prompt with a real case in this prototype.',
    ],
    provenance: {
      origin: 'Authored as a synthetic interface fixture for the pear concept skeleton, 6 November 2026.',
      review: 'Pending Alex K and practitioner/affected-community review. No endorsement is claimed.',
      version: '0.1-design-fixture',
      contribution: 'Embedded read-only resource. Private navigation entries cannot be contributed or published through this prototype.',
    },
  },
]);

window.PEAR_PROMPTS = Object.freeze([
  { id: 'notice', label: 'Notice', question: 'What are you noticing now?', hint: 'You may name uncertainty, leave this blank, or choose not to reflect.' },
  { id: 'context', label: 'Context', question: 'What is affecting you—in the work and around it?', hint: 'Include structural conditions if relevant. Do not identify another person or case.' },
  { id: 'resources', label: 'Resources', question: 'What support, relationships, or choices are available?', hint: 'A colleague option here is only a planning note; it does not contact anyone.' },
  { id: 'choice', label: 'Choice', question: 'What, if anything, do you want to do next?', hint: 'Pausing, declining, seeking support, changing approach, and doing nothing further are all permissible outcomes.' },
]);
