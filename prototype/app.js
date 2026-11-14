'use strict';
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.


(function pearPrototype() {
  const scenario = window.PEAR_SCENARIOS[0];
  const prompts = window.PEAR_PROMPTS;
  const store = window.PearCore.createStore(window.localStorage);
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  let activeView = 'prepare';
  let toastTimer;

  function setText(selector, value) { $(selector).textContent = value; }
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderResource() {
    setText('#scenario-title', scenario.title);
    setText('#scenario-status', scenario.status);
    setText('#scenario-summary', scenario.summary);
    setText('#preparation-label', scenario.preparationPrompt);
    setText('#resource-title', scenario.title);
    setText('#resource-purpose', scenario.purpose);
    const list = $('#resource-limits');
    list.replaceChildren(...scenario.limits.map((item) => make('li', '', item)));
    const dl = $('#resource-provenance');
    const entries = [
      ['Origin', scenario.provenance.origin],
      ['Review', scenario.provenance.review],
      ['Version', scenario.provenance.version],
      ['Contribution boundary', scenario.provenance.contribution],
    ];
    dl.replaceChildren(...entries.flatMap(([term, description]) => [make('dt', '', term), make('dd', '', description)]));
  }

  function renderPrompts() {
    const container = $('#prompt-fields');
    const blocks = prompts.map((prompt, index) => {
      const wrap = make('div', 'prompt-block');
      const label = make('label', '', prompt.question);
      label.htmlFor = `prompt-${prompt.id}`;
      const number = make('span', 'prompt-number', `${String(index + 1).padStart(2, '0')} · ${prompt.label}`);
      label.prepend(number);
      const hint = make('p', 'field-hint', prompt.hint);
      hint.id = `hint-${prompt.id}`;
      const field = make('textarea');
      field.id = `prompt-${prompt.id}`;
      field.dataset.prompt = prompt.id;
      field.maxLength = 6000;
      field.setAttribute('aria-describedby', hint.id);
      field.placeholder = 'Optional fictional reflection…';
      const footer = make('div', 'field-footer');
      footer.append(make('span', '', 'Optional · no assessment'), make('span', '', `0 / 6000`));
      footer.lastElementChild.id = `count-${prompt.id}`;
      wrap.append(label, hint, field, footer);
      return wrap;
    });
    container.replaceChildren(...blocks);
  }

  function showView(view, focus = true) {
    activeView = view;
    $$('.view').forEach((node) => { node.hidden = node.id !== `view-${view}`; });
    $$('.nav-item').forEach((node) => {
      const current = node.dataset.view === view;
      node.classList.toggle('current', current);
      if (current) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });
    if (view === 'close') renderReview();
    if (focus) {
      const heading = document.querySelector(`#view-${view} h1`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      } else {
        $('#main').focus({ preventScroll: true });
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function syncState(state = store.snapshot()) {
    const { draft, savedCopy, retentionUncertain, lastError } = state;
    if (document.activeElement !== $('#preparation')) $('#preparation').value = draft.preparation;
    setText('#preparation-count', `${draft.preparation.length} / 6000`);
    for (const prompt of prompts) {
      const field = $(`#prompt-${prompt.id}`);
      if (document.activeElement !== field) field.value = draft.responses[prompt.id];
      setText(`#count-${prompt.id}`, `${draft.responses[prompt.id].length} / 6000`);
    }
    const status = retentionUncertain
      ? 'Saved-copy deletion unconfirmed · a saved copy may remain'
      : savedCopy === 'present'
        ? state.draft.preparation === '' && Object.values(state.draft.responses).every(value => value === '')
          ? 'Working text cleared · previous saved version remains in this browser'
          : state.dirty ? 'Newer working edits not yet saved · previous saved version available after reload' : 'Saved in this browser · unencrypted prototype storage'
        : savedCopy === 'mayRemain'
          ? 'Saved-copy status unconfirmed · a saved copy may remain'
          : 'Unsaved · working in memory';
    setText('#save-status', status);
    const warning = $('#storage-warning');
    warning.hidden = !lastError;
    warning.textContent = lastError || '';
    if (lastError) {
      // An older success toast must not compete with a current storage error.
      clearTimeout(toastTimer);
      $('#toast').hidden = true;
      $('#toast').textContent = '';
    }
  }

  function capture() {
    const responses = {};
    for (const prompt of prompts) responses[prompt.id] = $(`#prompt-${prompt.id}`).value;
    return store.update({ preparation: $('#preparation').value, responses });
  }

  function announce(message) {
    clearTimeout(toastTimer);
    const toast = $('#toast');
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6500);
  }

  function showDialog(title, bodyNodes, actions, kicker = 'PEAR · YOUR CHOICE') {
    const dialog = $('#app-dialog');
    if (dialog.open) dialog.close();
    setText('#dialog-title', title);
    setText('#dialog-kicker', kicker);
    const body = $('#dialog-body');
    body.replaceChildren(...bodyNodes);
    const actionArea = $('#dialog-actions');
    const buttons = actions.map((action) => {
      const button = make('button', action.primary ? 'primary-button' : 'secondary-button', action.label);
      button.type = 'button';
      button.addEventListener('click', () => {
        if (action.close !== false) dialog.close();
        if (action.run) action.run();
      });
      return button;
    });
    actionArea.replaceChildren(...buttons);
    dialog.showModal();
  }

  function paragraph(text, className = '') { return make('p', className, text); }

  function renderReview() {
    const { draft } = store.snapshot();
    const entries = [
      ['Preparation', draft.preparation],
      ...prompts.map((p) => [p.question, draft.responses[p.id]]),
    ];
    const nodes = entries.map(([title, value]) => {
      const entry = make('section', 'review-entry');
      entry.append(make('h3', '', title));
      const text = make('p', value ? '' : 'empty-answer', value || 'Left blank — a valid choice.');
      entry.append(text);
      return entry;
    });
    $('#reflection-review').replaceChildren(...nodes);
  }

  function storageInfo() {
    showDialog('What “local” means here', [
      paragraph('Unsaved entries are held in this page’s working memory. Saving is always your choice. Browser session restore and device behaviour are outside the prototype’s complete control.'),
      paragraph('“Save in this browser” uses ordinary, unencrypted localStorage. Anyone or anything with access to this browser profile may be able to read it. Do not save sensitive or real case material.'),
      paragraph('Export is a separate file that this prototype cannot later delete. Deletion clears current working state and requests removal of this prototype’s saved key; it cannot prove physical erasure or remove backups, synced copies, or exports.'),
    ], [{ label: 'I understand', primary: true }], 'STORAGE · NO SAFETY GUARANTEE');
  }

  function supportOptions() {
    showDialog('Pause is a valid outcome', [
      paragraph('You do not need to complete a reflection. You could pause, seek human support, decline, change approach, end the session, or document an unsafe condition outside this prototype.'),
      paragraph('Nothing here contacts a colleague or emergency service. Do not rely on this concept prototype for crisis response.'),
    ], [
      { label: 'Keep paused', primary: true, run: () => showView('prepare') },
      { label: 'Finish without saving', run: endSession },
    ], 'PAUSE · NO REQUIRED DISCLOSURE');
  }

  function colleaguePlan() {
    store.update({ responses: { resources: 'Plan: identify an appropriate trusted colleague or support route outside this prototype. No one has been contacted.' } });
    syncState();
    showDialog('A planning note—not a connection', [
      paragraph('A fictional planning note was added under Resources. Review or remove it. No colleague has been contacted and no information has left this page.'),
    ], [{ label: 'Return to navigation', primary: true }], 'HUMAN SUPPORT · EXTERNAL TO PEAR');
  }

  function declineReflection() {
    showDialog('Decline reflection?', [
      paragraph('This clears the four optional navigation answers but preserves your preparation note. You can also end without saving. No explanation or disclosure is required.'),
    ], [
      { label: 'Keep my answers' },
      { label: 'Clear navigation answers', primary: true, run: () => {
        store.update({ responses: { notice: '', context: '', resources: '', choice: '' } });
        syncState(); announce('Navigation answers cleared. Preparation kept; no durable save was triggered.');
      } },
    ]);
  }

  function withoutSaving() {
    showView('navigate');
    announce('Continuing to edit in memory. No intentional durable save or export was made.');
    syncState();
  }

  function fillExample() {
    capture();
    const state = store.snapshot();
    const hasWorkingText = state.draft.preparation !== '' || Object.values(state.draft.responses).some(value => value !== '');
    if (hasWorkingText) {
      showDialog('Replace your current working answers?', [
        paragraph('Loading the fictional example replaces the preparation and all four navigation answers currently held in this page’s working memory. This cannot be undone.'),
        paragraph('Any previously saved browser copy remains untouched. No new save, export, publication, or network request will occur. Existing storage warnings will remain visible.'),
      ], [
        { label: 'Keep my working answers' },
        { label: 'Replace with fictional example', primary: true, run: applyExample },
      ], 'FICTIONAL EXAMPLE · REPLACEMENT REQUIRES CONFIRMATION');
      return;
    }
    applyExample();
  }

  function applyExample() {
    const example = {
      preparation: 'FICTIONAL EXAMPLE — I want to notice my assumptions and identify where I can pause or ask a colleague for support.',
      notice: 'FICTIONAL EXAMPLE — I notice uncertainty and tension before this constructed practice conversation. I do not need to resolve it to continue.',
      context: 'FICTIONAL EXAMPLE — I am working with limited time and support. Those conditions belong to the workplace; they are not an individual resilience failure.',
      resources: 'FICTIONAL EXAMPLE — I can pause, leave this prompt blank, identify a trusted colleague outside this prototype, or end the practice.',
      choice: 'FICTIONAL EXAMPLE — I will review this reflection without saving it, then choose whether to export or delete it.',
    };
    store.update({ preparation: example.preparation, responses: {
      notice: example.notice, context: example.context,
      resources: example.resources, choice: example.choice,
    } });
    syncState();
    announce('Fictional example loaded in memory. Review it, edit it, or decline; nothing has been saved or sent.');
  }

  function saveAndFinish() {
    capture();
    showDialog('Save and finish this fictional entry?', [
      paragraph('This saves the current entry to unencrypted localStorage in this browser profile, then clears the working screen. It is not secure journal storage and is unsuitable for sensitive material.'),
      paragraph('Saving does not publish, export, contact anyone, or invoke a model. The explicitly saved browser copy remains available until you choose Delete.'),
    ], [
      { label: 'Continue editing' },
      { label: 'Save and finish', primary: true, run: () => {
        const saved = store.save();
        if (saved.lastError || saved.savedCopy !== 'present' || saved.dirty) {
          syncState(saved);
          showDialog('The entry was not saved—your working text is still here', [
            paragraph(saved.lastError || 'The browser did not confirm the save. Your current working text has not been cleared. You can try again, continue editing, finish without saving, or export.'),
          ], [{ label: 'Return to my working text', primary: true }], 'SAVE NOT CONFIRMED · WORK PRESERVED');
          return;
        }
        const finished = store.clearWorking();
        syncState(finished); showView('prepare');
        announce('Entry saved in this browser profile. Working screen cleared; the saved copy remains until you choose Delete.');
      } },
    ], 'EXPLICIT SAVE AND FINISH · UNENCRYPTED');
  }

  function saveEntry() {
    capture();
    showDialog('Save this fictional entry?', [
      paragraph('This writes the current entry to unencrypted localStorage in this browser profile. It is not a secure journal and is unsuitable for sensitive material.'),
      paragraph('Saving does not publish, export, contact anyone, or invoke a model. You can revise or delete the saved prototype entry later.'),
    ], [
      { label: 'Cancel' },
      { label: 'Save fictional entry', primary: true, run: () => {
        const state = store.save(); syncState(state);
        if (!state.lastError && state.savedCopy === 'present' && !state.dirty) {
          announce('Saved only in this browser profile. Unencrypted; fictional content only.');
        }
        // A failed re-save must never announce success for the older saved copy.
      } },
    ], 'EXPLICIT SAVE · UNENCRYPTED');
  }

  function exportPreview() {
    capture();
    const state = store.snapshot();
    const exportState = store.exportSnapshot();
    const body = $('#dialog-body');
    const fixtureList = make('div', 'archive-choice');
    for (const entry of window.PearExports.FIXTURES) {
      const label = make('label');
      const checkbox = make('input'); checkbox.type = 'checkbox'; checkbox.value = entry.id;
      const text = make('span');
      text.append(make('strong', '', entry.title));
      text.append(make('small', '', `Created ${entry.createdAt} · Last modified ${entry.modifiedAt}`));
      label.append(checkbox, text); fixtureList.append(label);
    }
    const scope = make('select'); scope.id = 'export-scope';
    scope.append(new Option('Current reflection only', 'current'), new Option('Selected demo fixtures', 'selected'), new Option('Both demo fixtures', 'all'));
    const scopeLabel = make('label', '', 'What would you like to export?'); scopeLabel.htmlFor = 'export-scope';
    const scopeWrap = make('p'); scopeWrap.append(scopeLabel, scope);
    const formats = make('div', 'export-formats');
    for (const [label, format] of [['Download readable text', 'txt'], ['Download PDF', 'pdf'], ['Download JSON backup', 'json']]) {
      const button = make('button', format === 'txt' ? 'primary-button' : 'secondary-button', label);
      button.type = 'button'; button.dataset.exportFormat = format; formats.append(button);
    }
    const status = make('p', 'export-status', 'No file is created until you choose a format. PDF is generated locally using the bundled pdf-lib library.');
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const fixtureHeading = make('h3', '', 'Optional fictional archive entries');
    const fixtureNote = paragraph('Demo fixtures only—not your saved journal. All fields contain “test text.” Their dates illustrate the intended archive design; they are not publication dates or evidence of real saving.', 'fixture-disclosure');
    showDialog('Export one or several reflections', [scopeWrap, fixtureHeading, fixtureNote, fixtureList, formats, status], [{ label: 'Close export' }], 'EXPORT · A SEPARATE WORKER-REQUESTED COPY');
    function updateVisibility() { fixtureList.hidden = scope.value === 'current'; fixtureHeading.hidden = scope.value === 'current'; fixtureNote.hidden = scope.value === 'current'; }
    scope.addEventListener('change', updateVisibility); updateVisibility();
    formats.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-export-format]');
      if (!button) return;
      const selectedIds = Array.from(fixtureList.querySelectorAll('input:checked')).map(input => input.value);
      const entries = window.PearExports.selectedEntries(scope.value, selectedIds, state.draft, state.savedCopy, new Date().toISOString(), exportState.savedTimestamps);
      if (!entries.length) { status.textContent = 'Select at least one demo fixture, or choose Current reflection only.'; return; }
      const exportedAt = new Date().toISOString();
      const data = window.PearExports.makeExport(entries, exportedAt);
      const format = button.dataset.exportFormat;
      formats.querySelectorAll('button').forEach(node => { node.disabled = true; });
      try {
        let blob, extension;
        if (format === 'json') {
          blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); extension = 'json';
        } else if (format === 'txt') {
          blob = new Blob([window.PearExports.readableText(data)], { type: 'text/plain;charset=utf-8' }); extension = 'txt';
        } else {
          const bytes = await window.PearExports.makePdf(data);
          blob = new Blob([bytes], { type: 'application/pdf' }); extension = 'pdf';
        }
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a'); anchor.href = url;
        anchor.download = `fictional-pear-${scope.value}-entries.${extension}`;
        document.body.append(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = `${format.toUpperCase()} download requested for ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}. The browser controls completion; exported copies remain outside pear deletion control.`;
      } catch (error) {
        status.textContent = 'The browser could not create or request this export. No export was confirmed. Your working text remains available.';
      } finally {
        formats.querySelectorAll('button').forEach(node => { node.disabled = false; });
      }
    });
  }

  function deleteEntry() {
    showDialog('Delete the current entry?', [
      paragraph('This clears the working entry and requests removal of the saved prototype entry from this browser profile.'),
      paragraph('It cannot delete downloaded exports, screenshots, backups, synced/browser-managed copies, or prove physical erasure. This is a prototype control, not a production deletion guarantee.'),
    ], [
      { label: 'Cancel' },
      { label: 'Delete current entry', primary: true, run: () => {
        const state = store.remove();
        syncState(state); showView('prepare');
        if (state.savedCopy === 'absent') announce('Working entry cleared and saved prototype key removed. External copies are not controlled.');
        // If removal failed, the persistent storage warning must remain visible.
      } },
    ], 'DELETE · LIMITED SCOPE');
  }

  function endSession() {
    showDialog('Finish without saving?', [
      paragraph('This clears the current working entry from the page. If you previously saved explicitly, that saved browser copy remains until you choose Delete. Exports also remain separate.'),
    ], [
      { label: 'Keep working' },
      { label: 'Finish without saving', primary: true, run: () => {
        const state = store.clearWorking();
        syncState(state); showView('prepare');
        if (state.savedCopy === 'absent') announce('Working entry cleared. No new save or export was made.');
        // A retained or uncertain saved copy uses the persistent warning instead.
      } },
    ], 'END · NO AUTOMATIC SAVE');
  }

  function handleAction(action) {
    const actions = {
      'to-navigate': () => { capture(); showView('navigate'); },
      'to-prepare': () => { capture(); showView('prepare'); },
      'to-close': () => { capture(); showView('close'); },
      'start-demo': () => showView('prepare'),
      pause: supportOptions,
      colleague: colleaguePlan,
      decline: declineReflection,
      end: endSession,
      'without-saving': withoutSaving,
      'fill-example': fillExample,
      storage: storageInfo,
      save: saveEntry,
      'save-finish': saveAndFinish,
      export: exportPreview,
      delete: deleteEntry,
    };
    if (actions[action]) actions[action]();
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.view) showView(button.dataset.view);
    if (button.dataset.action) handleAction(button.dataset.action);
  });

  $('#preparation').addEventListener('input', (event) => {
    store.update({ preparation: event.target.value });
    setText('#preparation-count', `${event.target.value.length} / 6000`);
    syncState();
  });
  $('#navigation-form').addEventListener('input', (event) => {
    if (!event.target.dataset.prompt) return;
    store.update({ responses: { [event.target.dataset.prompt]: event.target.value } });
    setText(`#count-${event.target.dataset.prompt}`, `${event.target.value.length} / 6000`);
    syncState();
  });
  $('#preparation-form').addEventListener('submit', (event) => event.preventDefault());
  $('#navigation-form').addEventListener('submit', (event) => event.preventDefault());

  renderResource();
  renderPrompts();
  syncState(store.restore());
  showView('about', false);
  // Read-only diagnostic surface for tests. It exposes no network or persistence capability.
  window.pearPrototype = Object.freeze({ snapshot: () => store.snapshot(), showView });
})();
