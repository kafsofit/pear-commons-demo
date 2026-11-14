# Boundary checks — what the skeleton demonstrates

**Scope:** specific behaviours in this concept implementation. These checks do not validate pear as a real-world support tool.

| Design boundary | Check performed | Evidence and limitation |
|---|---|---|
| No hidden model/network path | Static checks for network/model/telemetry APIs and remote assets; CSP `connect-src 'none'`; Chromium context set offline with external HTTP(S) requests blocked and counted | The tested workflow completed with no captured external request. Does not control browser extensions, OS activity, malicious runtime, or future code changes |
| Core works without install/server | Open `prototype/index.html` directly using `file://` in Chromium; full preparation/navigation/closure journey | Dependency-free local files ran in the tested browser. Other browsers/platforms need their own compatibility review |
| Editing does not imply saving | Unit tests inspect storage writes; browser tests type in preparation/navigation and assert zero localStorage entries | No intentional save occurred. Browser memory, session restore, crash reporting, and device storage are outside complete app control |
| Save is explicit and honestly scoped | Save dialog remains pending until confirmation; save/reload restores fixture; labels identify unencrypted browser storage; failed re-save retains knowledge of an older saved copy | Demonstrates ordinary localStorage only, not encryption, secure custody, or safe sensitive-data storage. Failure leaves a persistent warning rather than a success claim |
| Current edits after save are distinguishable | Browser test edits a restored entry and checks that newer working edits are unsaved while the previous saved version remains available after reload | Prevents the simple misleading status where an old saved version appears to include later edits |
| End is not deletion | End-after-save clears working text but preserves the older saved version; reload restores it; core test verifies no removal call | End does not promise to remove the saved browser entry or exports |
| Export is deliberate and separate | Export preview is opened by worker action; test keyboard-focuses/scrolls the preview, scans its dialog, and inspects downloaded JSON; warnings identify a separate copy outside deletion control | Does not control filesystem, backups, browser sync, screenshots, recipients, or legal access |
| Delete clears current/saved prototype state | Unit test and browser test assert saved-key removal and empty working state; forced browser removal failure verifies the key remains, a persistent warning is shown, and “Unsaved” is not claimed | Does not prove physical erasure or remove exports/backups/synced copies. Unreadable storage is represented as possibly retained, not confirmed absent |
| Pause, decline, and end remain available | Browser checks open support options and decline/clear answers without saving | No actual colleague or emergency connection exists; no claim of adequate human support |
| No automatic commons publication | Static and browser checks find no publishing action; read-only fictional resource shows provenance and limitations | Manual copying is technically possible and needs governance; there is no commons implementation to evaluate |
| No score, readiness, or automatic assessment | Static fixture and UI copy review; prompts are optional free text with no classifier or inference code | Deterministic prompts can still bias, burden, or culturally misclassify; practitioner evaluation is required |
| Basic accessibility | Keyboard tab/dialog Escape path, labelled textareas, visible focus, reduced-motion support, mobile width check; axe WCAG A/AA tag scan | No automated axe violations across all four tested views, storage dialog, and scrollable export dialog. Not a full accessibility audit across every browser, screen reader, language, future state, or user need |
| Local-only and attribution gate | Pre-publication static checks confirmed no `.git`, no licence assertion, and no GitHub remote; superseded by the separately approved release candidate | This is process evidence for this build only, not a long-term publication control |

## Mutation checks

Temporary copies of `prototype/core.js` were modified under the external test-tools directory:

1. adding a storage write during ordinary update caused four tests to fail;
2. replacing saved-key deletion with a no-op caused two tests to fail.

The unmodified implementation then passed the full suite. These checks show that the tests can catch the named boundary regressions; they are not exhaustive fault injection.

## Evidence not yet available

Practitioner approval of content, lived-experience/service-user evaluation, cultural and language review, full accessibility audit, threat-model review, production encryption/key custody, multi-user isolation, backup/deletion proof, secure update process, legal/ethical assessment, clinical or real-world benefit, and the conditions under which any (s)pear capability would be justified.
