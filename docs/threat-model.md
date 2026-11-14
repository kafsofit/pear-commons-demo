# Prototype threat model — pear local skeleton

**Status:** design prompt for practitioner/security review, not a completed security assessment. This concerns only the dependency-free browser walkthrough.

## Assets and affected people

- A worker's optional fictional reflection and their ability to pause, revise, export, or delete it.
- People receiving support are affected non-users even when no direct service-user workflow exists. Real narratives, identifiers, quotations, and metadata must not be entered into this prototype.
- Fictional resource content, its provenance/review status, and project attribution.

## Trust boundaries

1. Typed text enters the browser document and in-memory JavaScript state.
2. Only the explicit “Save on this browser” action writes the current reflection to origin-scoped localStorage. This storage is unencrypted application data.
3. Export creates a separate downloaded JSON file after a worker action. Browser download behaviour and the destination filesystem are outside the prototype's control.
4. The browser profile, operating system, device users, extensions, backups, sync, malware, and physical/legal access are outside the prototype's trust boundary.

## Principal threats

| Threat | Consequence | Prototype response | Remaining limit |
|---|---|---|---|
| Sensitive real-case input | Exposure through browser profile, exports, screenshots, sync, or shared device | Repeated synthetic-only warning; no case fields or validation of narratives | Cannot reliably prevent someone typing sensitive text; do not use with real cases |
| Silent persistence | Worker believes an entry is temporary when it is retained | In-memory default; explicit save; visible saved/unsaved status | Browser memory/crash/session restore behaviour is not fully controlled |
| Coerced save/export or employer access | Worker reflections become employment evidence | No account, sharing, employer role, analytics, or auto-export | Cannot prevent device/ browser/profile coercion or someone demanding an export |
| Unexpected network disclosure | Content sent to a service/model | No network APIs, remote assets, telemetry, external fonts, service worker, or model adapter | Browser extensions, OS telemetry, synced profiles, and a compromised runtime remain outside scope |
| Cross-lane flow | Private material becomes a commons resource | Read-only embedded fictional resources; no contribution or publishing feature | A person can manually copy/export material; governance remains necessary |
| False deletion assurance | Exported/synced copies survive | Delete clears working state and this prototype's localStorage key; export warning names its separate copy | Does not prove physical erasure or control backups, browser sync, filesystem copies, or recipients |
| Authoritative reflection | Worker/tool treats prompts as diagnosis or correct answers | No score/classification/generation; optional prompts; uncertainty and structural context | Deterministic wording can still bias or burden; practitioner evaluation needed |
| Loss of agency | Interface traps worker in a flow or requires disclosure | Pause, end, continue without saving, optional fields, reset/delete | “Colleague” is a planning aid, not a connection to an actual person/service |
| False legitimacy | Reviewers treat concept assets as validated | Prominent concept/fictional/pending-review labels and verification limitations | Presentation elsewhere may omit labels; proposal must preserve them |

## Security properties deliberately not claimed

No encryption-at-rest claim, authentication, multi-user isolation, tamper resistance, audit log, secure update mechanism, physical erasure, legal protection, threat anonymity, production readiness, clinical efficacy, or service-user consent validity.

## Stop conditions for expanding this prototype

Stop if testing requires real crisis material; if organisational access cannot be constrained; if a model or export becomes ambient; if deletion claims exceed tested scope; if refusal reduces support; if workers become more surveilled or burdened; or if practitioner/affected-community evaluation identifies unresolved relational harm.
