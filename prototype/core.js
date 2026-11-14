'use strict';
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.


/**
 * Prototype state only. This is not a production storage or privacy layer.
 * Saving is explicit and uses unencrypted browser localStorage via the adapter.
 */
(function exposePearCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PearCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createCore() {
  const STORAGE_KEY = 'pear.prototype.reflection.v1';
  const DRAFT_VERSION = 1;
  const PROMPT_IDS = Object.freeze(['notice', 'context', 'resources', 'choice']);

  function emptyDraft() {
    return {
      version: DRAFT_VERSION,
      scenarioId: 'fictional-handoff-001',
      preparation: '',
      responses: { notice: '', context: '', resources: '', choice: '' },
      updatedAt: null,
    };
  }

  function cleanText(value, max = 6000) {
    if (typeof value !== 'string') return '';
    return value.slice(0, max);
  }

  function normaliseDraft(value) {
    const base = emptyDraft();
    if (!value || typeof value !== 'object') return base;
    base.scenarioId = 'fictional-handoff-001';
    base.preparation = cleanText(value.preparation);
    for (const id of PROMPT_IDS) {
      base.responses[id] = cleanText(value.responses && value.responses[id]);
    }
    base.updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : null;
    base.createdAt = typeof value.createdAt === 'string' ? value.createdAt : null;
    return base;
  }

  function createStore(adapter, now = () => new Date().toISOString()) {
    if (!adapter || typeof adapter.getItem !== 'function' ||
        typeof adapter.setItem !== 'function' || typeof adapter.removeItem !== 'function') {
      throw new TypeError('A localStorage-compatible adapter is required');
    }
    let current = emptyDraft();
    let createdAt = null;
    // Persisted-copy knowledge is independent of whether working text differs.
    // mayRemain means a read/delete failed: absence must not be asserted.
    let savedCopy = 'absent'; // absent | present | mayRemain
    let savedVersion = null;
    let retentionUncertain = false;
    let lastError = null;

    function draftContent(draft) {
      const value = normaliseDraft(draft);
      value.updatedAt = null;
      return JSON.stringify(value);
    }

    function update(patch) {
      const next = { ...current, ...patch, responses: { ...current.responses } };
      if (patch.responses) Object.assign(next.responses, patch.responses);
      next.updatedAt = now();
      current = normaliseDraft(next);
      // Deliberately no adapter.setItem here: editing never implies saving.
      return snapshot();
    }

    function snapshot() {
      return {
        draft: normaliseDraft(current),
        saved: savedCopy === 'present',
        savedCopy,
        retentionUncertain,
        dirty: savedCopy === 'present' ? draftContent(current) !== savedVersion : draftContent(current) !== draftContent(emptyDraft()),
        lastError,
      };
    }

    function save() {
      const timestamp = now();
      if (!createdAt) createdAt = timestamp;
      current = normaliseDraft({ ...current, createdAt, updatedAt: timestamp });
      try {
        adapter.setItem(STORAGE_KEY, JSON.stringify(current));
        savedCopy = 'present';
        savedVersion = draftContent(current);
        createdAt = current.createdAt || current.updatedAt || createdAt;
        retentionUncertain = false;
        lastError = null;
      } catch (error) {
        // An older persisted copy may still exist; do not erase that knowledge.
        lastError = savedCopy === 'present'
          ? 'This browser did not save your latest edits. The older saved copy may remain. Your current working text is still available; you can continue without saving or choose export.'
          : 'This browser did not save the entry. Your current working text remains available; you can continue without saving or choose export.';
      }
      return snapshot();
    }

    function restore() {
      let raw = null;
      try { raw = adapter.getItem(STORAGE_KEY); } catch (error) {
        savedCopy = 'mayRemain';
        retentionUncertain = true;
        lastError = 'Saved browser storage is unavailable. A saved copy may remain unread. You can still use the walkthrough without saving, but do not rely on deletion until browser storage is accessible and cleared.';
        return snapshot();
      }
      if (raw === null) return snapshot();
      try {
        const value = JSON.parse(raw);
        if (!value || value.version !== DRAFT_VERSION) throw new Error('Unsupported version');
        current = normaliseDraft(value);
        createdAt = current.createdAt || current.updatedAt || null;
        savedCopy = 'present';
        savedVersion = draftContent(current);
        createdAt = current.createdAt || current.updatedAt || createdAt;
        retentionUncertain = false;
        lastError = null;
      } catch (error) {
        // Never expose arbitrary stored properties or crash the workflow.
        current = emptyDraft();
        savedCopy = 'mayRemain';
        savedVersion = null;
        retentionUncertain = true;
        lastError = 'The saved prototype entry could not be read. It has not been exported or shared. You can delete it and begin again.';
      }
      return snapshot();
    }

    function remove() {
      current = emptyDraft();
      lastError = null;
      try {
        adapter.removeItem(STORAGE_KEY);
        savedCopy = 'absent';
        savedVersion = null;
        retentionUncertain = false;
      } catch (error) {
        if (savedCopy !== 'present') savedCopy = 'mayRemain';
        retentionUncertain = true;
        lastError = 'The working entry was cleared, but this browser did not confirm removal of its saved copy. A saved copy may remain. Clear this browser profile’s site data before relying on deletion.';
      }
      return snapshot();
    }

    function clearWorking() {
      current = emptyDraft();
      // Finishing is not deletion. Preserve any retention warning that was
      // already present; never replace a failed-removal warning with a generic
      // "saved version" notice.
      const previousError = lastError;
      if (previousError) {
        lastError = previousError;
      } else if (savedCopy === 'present') {
        lastError = 'Working text was cleared, but the previously saved version remains in this browser profile. Use Delete to request its removal, subject to the stated deletion limits.';
      } else if (savedCopy === 'mayRemain') {
        lastError = 'Working text was cleared, but saved-copy deletion or storage access was not confirmed. A saved copy may remain. Clear this browser profile’s site data before relying on deletion.';
      } else {
        lastError = null;
      }
      // Do not touch savedCopy or savedVersion: a previously saved copy remains.
      return snapshot();
    }

    function exportSnapshot() {
      // Export is a detached, worker-requested snapshot, not a storage side effect.
      const persisted = savedVersion ? normaliseDraft(JSON.parse(savedVersion)) : null;
      return {
        format: 'pear-concept-reflection',
        version: DRAFT_VERSION,
        prototype: true,
        fictionalOnly: true,
        notice: 'Concept export. No crisis-response or live service-user use. This downloaded copy is outside prototype deletion control.',
        exportedAt: now(),
        reflection: normaliseDraft(current),
        savedTimestamps: persisted ? { createdAt: persisted.createdAt || persisted.updatedAt || null, modifiedAt: persisted.updatedAt || null } : { createdAt: null, modifiedAt: null },
      };
    }

    return { update, save, restore, remove, clearWorking, exportSnapshot, snapshot };
  }

  return { STORAGE_KEY, DRAFT_VERSION, PROMPT_IDS, emptyDraft, normaliseDraft, createStore };
});
