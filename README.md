# pear — worker-controlled support infrastructure

**Owned and led by Alex K. / Alex Argüelles · hosted by Cyborg Garden.**  
**Status:** interactive concept prototype, pre-launch. Fictional material only.  
**Code:** Mozilla Public License 2.0 · **Documentation/design:** CC BY-SA 4.0.

> **Not for crisis response or live service-user records.** This demo is not a validated intervention, secure journal, or production deployment.

## Open the interactive demo

**Live demo:** https://kafsofit.github.io/pear-commons-demo/  
**Project source:** https://github.com/kafsofit/pear-commons-demo

The live link will work after the repository is public and GitHub Pages is enabled. For local review, unzip the package and open `index.html` directly in a modern browser; no server or installation is required.

Choose **Try the interactive walkthrough** to follow one worker journey: Prepare → Navigate → Close. Choose **Inspect the evidence** to see which implementation behaviors have been tested and which claims remain unvalidated.

## What pear is exploring

Small support organizations are being offered technology that can turn care into surveillance: intake automation, worker scoring, engagement analytics, and model training on sensitive encounters. pear asks what support should travel with the **worker**, rather than what information an institution can extract from them.

This concept demonstrates:

- preparation using a fictional prompt, without assessment or required disclosure;
- optional private reflection, pause, decline, and routes to plan human support;
- explicit local browser saving—editing does not silently persist;
- clear **Save and finish**, **Finish without saving**, and **Continue editing** choices;
- readable **TXT**, offline **PDF**, and structured **JSON** exports;
- export of a current reflection or two explicitly fictional archive fixtures;
- created, last-modified, and exported timestamps;
- a read-only fictional resource with provenance, limitations, and review status;
- no model calls, analytics, accounts, automatic publication, employer dashboard, or worker scoring.

**The two previous entries are built-in demo fixtures containing “test text.”** They illustrate intended archive/export interactions; they are not saved worker entries and do not demonstrate a multi-entry journal backend. Current saving stores one browser entry.

## Privacy and retention boundaries

The demo uses only local HTML, CSS, JavaScript, fictional data, and a bundled offline PDF library. No internet connection is required.

- Unsaved work is held in page memory; browser and device behavior remain outside pear's complete control.
- Explicit saving uses **ordinary, unencrypted browser localStorage**. It is not secure journal storage and is unsuitable for sensitive material.
- Exported files are separate copies outside pear's deletion, retention, and access controls.
- Deletion requests removal of the current browser storage key; it cannot guarantee physical erasure or remove exports, backups, screenshots, or synced copies.
- No private reflection can be published to a Commons through this demo. A future Commons requires separate governance, moderation, consent, and safety work.

Read the [threat model](docs/threat-model.md), [retention matrix](docs/retention-matrix.md), [three-lanes boundary](docs/three-lanes.md), and [values groundwork](docs/values-groundwork.md) before interpreting these controls.

## What this demo does not establish

Passing implementation checks is not evidence of clinical effectiveness, occupational benefit, practitioner approval, production privacy, secure multi-user operation, service-user consent quality, cultural appropriateness, or full accessibility.

The fictional scenario and prompt language are **not practitioner-approved training content**. Practitioner and affected-community review, independent privacy/accessibility assessment, and real-world evaluation remain future work.

**(s)pear is not implemented here.** Any future co-pilot, real-case workflow, model processing, handoff, or service-user mediation requires separate authority, governance, consent, evidence, and stop conditions.

## Repository structure

```text
index.html                       # local/GitHub Pages entry point
prototype/                      # offline interactive demo
  vendor/                       # bundled pdf-lib and its MIT notice
content/synthetic-scenarios/    # fictional design material
docs/                           # boundaries, governance, and verification
governance/                     # review and impact templates
tests/                          # state, export, static, and browser checks
ATTRIBUTION.md                  # ownership, hosting, and credit
LICENSE                         # licensing map and third-party boundary
LICENSE-CODE-MPL-2.0.txt         # full code license
LICENSE-DOCS-CC-BY-SA-4.0.txt    # full documentation/design license
```

## Verification

The current candidate passed **43/43 implementation checks**: 13 state/storage unit checks, 6 export/PDF unit checks, 8 static checks, and 16 browser workflow/accessibility checks.

The browser tests exercised the offline journey, example-replacement confirmation, save/finish success and failure, explicit saving and revision, scoped deletion and deletion failure, TXT/PDF/JSON downloads, two-entry fixture export, keyboard/mobile layouts, and automated axe scans.

The generated PDF was also parsed and visually inspected. These are narrow implementation observations, not production or accessibility conformance certification.

See [docs/demo-verification.md](docs/demo-verification.md) for the detailed record and limits. To rerun browser tests, install Playwright and `@axe-core/playwright` as development-only tooling, then run `node --test tests/*.test.cjs`. The demo itself has no runtime package dependencies.

## Licensing and attribution

- **Original pear source code:** [Mozilla Public License 2.0](LICENSE-CODE-MPL-2.0.txt).
- **Original documentation, governance templates, fictional scenarios, and visual/design material:** [Creative Commons Attribution-ShareAlike 4.0 International](LICENSE-DOCS-CC-BY-SA-4.0.txt).
- **Bundled `pdf-lib`:** MIT, with its own notice in `prototype/vendor/pdf-lib-LICENSE.txt`. It is not relicensed under MPL or CC BY-SA.
- **Attribution:** “Owned and led by Alex K. / Alex Argüelles · hosted by Cyborg Garden.” See [ATTRIBUTION.md](ATTRIBUTION.md).

These licenses permit reuse and derivatives under their respective conditions. They do not transfer project ownership, imply endorsement, or grant trademark rights in the pear name, logo, or visual identity.
