# pear demo archive/export iteration — verification
**14 November 2026 · publication candidate · not yet uploaded or made public**

The previous reviewer-demo candidate passed 35/35 checks. This iteration adds two explicitly fictional archive fixtures, current/selected/all export selection, readable TXT, offline PDF, structured JSON, created/modified/exported timestamps, and clearer save-and-finish controls.

## Final full-suite command
```
# With Playwright and @axe-core/playwright installed as development-only tools:
node --test tests/*.test.cjs
```
**Result: 43 passed, 0 failed.** Test composition: 13 original state/storage unit checks, 6 export/PDF unit checks, 8 static checks, and 16 browser workflow/accessibility checks.

## Direct export verification
- Browser downloaded TXT, PDF, and JSON containing both fictional entries.
- JSON contains illustrative created/modified dates and an actual export timestamp.
- PDF was parsed successfully with PyMuPDF: one page for the two short fixtures, all five fields per entry, both created/modified dates, export timestamp, and disclosure text.
- PDF layout was visually inspected for overlap/clipping; the export dialog was inspected at desktop and 390px, including scrolling to Close.
- Save and finish clears the working screen only after a confirmed explicit save. An injected save failure preserves working text and shows a failure dialog.
- No external requests were captured; the PDF library is bundled locally with its MIT license notice.

## Scope limits
- Two previous entries are read-only demo fixtures, not saved worker entries or a multi-entry storage implementation.
- Created/modified timestamps on a current reflection refer to the explicitly saved browser copy, not every keystroke. Unsaved work has no original-save timestamp.
- The PDF is a simple readable archive, not a designed publication or accessible-PDF conformance claim.
- No full screen-reader, cross-browser, practitioner, production-security, or multi-user evaluation has been performed.
- A fresh independent-review dispatch failed at the tool layer before starting; no second independent audit is claimed.
- Alex selected MPL 2.0 for original code and CC BY-SA 4.0 for original documentation/design on 14 November 2026. The bundled pdf-lib library retains its own MIT licence.

## Release-package additions
- Full MPL 2.0 and CC BY-SA 4.0 texts and a scope map are included; third-party MIT material is kept separate.
- Public README names the intended GitHub/Pages URLs without claiming they are already live.
- The package remains unuploaded and unpublicised until Alex gives separate release approval.
