# pear / (s)pear
## Three lanes, two product shapes, separate duties

**Prepared for Alex K · Hermes NimbleCo · 6 November 2026**  
**Status:** architecture discussion draft for practitioner review. This is not a validated safety, clinical, legal, or privacy specification; no implementation is authorised by this document.

> **Design centre:** by and for workers at the forefront of crisis response. Support sustainable, relational practice without replacing human relationships, assessing workers, or turning other people's crises into infrastructure.

## Augmentation as psychosocial support, not extraction

**“Augmentation not replacement” means augmenting the support available to workers—not augmenting their output, endurance, or exploitability, and not making them more dependent on a tool or infrastructure they do not control.** pear aims to expand room for preparation, reflection, skill development, connection, choice, and closure without weakening human relationships, duty of care, or the consent and agency of workers and support requesters.

The project's aspirational **psychosocial safety gear** metaphor means support that travels with the worker, rather than infrastructure that monitors, optimises, or consumes them. Standalone or connected, for private self-journaling, skill development, or deliberately contributing to practitioner discussion and collective learning, pear should help care for those who care for others.

Safety gear must never be used to make unsafe conditions acceptable, shift institutional responsibility onto individuals, or justify greater exposure. The metaphor does not establish clinical or occupational protection: pear's value and burdens remain propositions to evaluate with workers and affected communities. See [values-groundwork.md](values-groundwork.md).

**Building worker power and solidarity requires intentional care for ourselves and one another.** pear can support reflection, connection, shared learning, and mutual support, but it only accompanies the practitioners and communities doing that work. Cultural and institutional change still requires showing up, organising, accountability, and material action. Solidarity must not become a monitored workplace programme or an obligation for individuals to endure more; it must leave room for dissent, boundaries, accountability, and refusal.

## Names and product boundary

**pear** is the standalone, local-first worker-support harness. The pear/peer wordplay is a gentle resonance, not a claim that software has lived experience, offers mutuality, or is anyone's peer.

**(s)pear** is a practitioner-governed crisis-work co-pilot configuration, not a premium tier that unlocks progressively more invasive automation. Every additional capability must be individually justified, consented, evaluated, and reversible. pear remains a coherent product, not a deliberately inadequate version of (s)pear.

Both retain these boundaries: **no automated crisis response; no worker scoring, fitness assessment, employer dashboard, or endurance optimisation; no best-response generator or simulated empathy; no hidden technological mediation; and no model training on worker or service-user material.** Refusal of technology must not produce inferior care. A genuinely human, tool-free path remains necessary.

## The architectural rule

The three lanes are **functional and governance boundaries**, not merely labels or folders in one database. Each needs its own data classes, retention, access, authority, review, and technical separation. No material moves between them automatically.

A later live-case capability does not weaken the earlier boundaries. **Consent, encryption, and local hosting are safeguards, not permission to collect everything.**

### What this revision changes

- The earlier draft placed customisable intake, handoff structures, and worker-authored case notes in the first lane. This revision makes the boundary stricter: **pear starts without service-user content; any real-case intake, documentation, or handoff belongs to a separately governed (s)pear capability.** A blank form does not by itself make collection necessary or safe.
- The earlier draft contemplated worker-contributed reflections made with informed consent and left model training as a possible separate decision. This revision requires **deliberately authored commons resources rather than journal or case extracts, and prohibits training on worker or service-user material by default.** Consent is not a universal remedy for an avoidable data pipeline.
- **pear is now a complete standalone product, while (s)pear names conditional additional duties and capabilities—not a measure of sophistication.** The optional model call is no longer a presumed next step for either.

### At a glance

| Lane | pear — standalone | (s)pear — conditional co-pilot | Concerns that must remain visible |
|---|---|---|---|
| **1 · Practice & navigation** | Reviewed synthetic training; preparation and closure without case identifiers; optional private worker reflection; pause, colleague, decline, and end-shift routes. | Only if separately approved: worker-controlled intake, documentation, and handoff workflows; narrowly bounded assistance for a declared task. Human review and correction. | More fields and summaries can burden workers, reduce presence, freeze interpretations, expose service users, or become employment evidence. No automatic case formulation, diagnosis, score, route, or response. |
| **2 · Optional bounded assistance** | Off by default and not required. If ever added: synthetic or non-case material only; the worker selects exact input and sees model, location, purpose, retention, and alternatives first. Local inference preferred; no cloud fallback. | A separate action with capability-specific governance. Possible research or reflective support only after necessity, service-user effects, legal/ethical basis, and evaluation are established. Never invisible or always-on. | Local is not automatically private; hosted is not automatically safe. Models may agree with error, stereotype, conceal uncertainty, leak material, or shift accountability. Optional features tend to become defaults. |
| **3 · Practitioner commons** | Optional, separately governed collection of deliberately authored and reviewed practice resources. Joining contributes nothing automatically. No link from private entries. | May use explicitly authored co-pilot practice resources, but no automatic export of journals, case notes, prompts, outputs, logs, or handoffs. | De-identification is incomplete. Contribution and moderation are labour; access, reputation, coercion, legal exposure, and knowledge hierarchies matter. No case-derived publishing or training pipeline. |

## Lane 1 · Practice tools and private navigation

### Purpose

Help a worker prepare, reflect, connect, make choices, and close or hand off work without making the tool an authority on either the worker or the person receiving support.

### pear — the standalone starting point

- A **practitioner-reviewed library** of constructed/synthetic scenarios and reflective materials; no live-case corpus.
- Preparation and closure structures that can be used without entering a person's identity or narrative.
- Optional private, worker-controlled reflection. Prompts invite noticing, context, resources, uncertainty, and choices; they do not classify distress or infer motives.
- A visible **pause / seek a colleague / decline / end shift / document unsafe conditions** route.
- Worker-selected local save, revision, export, and deletion. No durable conversational memory by default.
- Ordinary deterministic software can provide the first version. **No model, GPU, internet connection, account federation, Swarm Map, or employer access is required for core use.**

**Data boundary:** no service-user content by default. Workers should be able to use the tool without documenting themselves or the people they support. A private journal can still be sensitive, may contain inadvertent case details, and can be exposed through a shared device, backup, export, coercion, malware, or legal process.

### (s)pear — conditional additions, not presumed features

Where practitioners establish a genuine need, (s)pear could add worker-controlled structures for intake, documentation, closure, or handoff. Each requires its own workflow, permissions, retention, consent, transparency, and evaluation. Any summary must preserve source language, observations, interpretations, unknowns, disagreement, and a practical correction route.

**No autonomous completion or handoff.** The worker must be able to inspect, amend, reject, and avoid the tool. Assistance must not optimise throughput or make presence secondary to interface work.

### Required disclosure in the interface

> **Private is not risk-free.** What is stored? On whose device or server? Who can access or compel access? What enters backups and exports? What expires, and what can actually be deleted? Can an employer, host, colleague, or future operator gain access? A worker should not have to disclose personal health, trauma history, identity, family life, or employment concerns to receive support.

## Lane 2 · Optional, bounded assistance

### pear — not necessary for the first product

The strongest initial pear has **no generative assistant**. Reviewed scenarios, navigation prompts, and plain software are sufficient to test the core proposition.

If a model feature is later justified, it must:

1. begin only with synthetic or non-case material;
2. be a distinct worker-initiated action, never ambient processing;
3. show the exact selected text, task, model/provider and version, processing location, recipients, retention, training prohibition, alternatives, and known limits;
4. prefer local or worker/community-controlled inference, with no silent hosted fallback;
5. return questions or alternatives rather than assessments, labels, or authoritative formulations;
6. preserve worker authorship and permit rejection without penalty;
7. leave no durable prompt, output, log, or conversational memory beyond a separately declared retention rule.

**(s)pear — higher burden of proof:** any direct-care or real-case model processing needs separate practitioner and affected-community governance, jurisdiction- and role-specific legal/ethical assessment, a necessity and alternatives analysis, informed and uncoerced choice where applicable, and evidence about relational and distributive effects. A checkbox cannot settle this. If a model materially shapes care, its role must be transparent and accountable to the person receiving support.

### Concerns disclosed at the point of use

- **Relational:** attention may move from person to screen; generated language may simulate care or narrow judgment.
- **Epistemic:** a fluent output may agree with an initial error, stereotype a culture or identity, hide uncertainty, or turn an early interpretation into a durable record.
- **Privacy:** a local model removes an external inference provider, not device, operator, backup, update, or seizure risks. Hosted processing adds provider and jurisdiction concerns. Technical no-training settings and contracts do not make raw crisis narratives acceptable by default.
- **Responsibility:** “human in the loop” does not resolve accountability among worker, organisation, developer, host, and provider.
- **Purpose drift:** a narrow adapter can become an invisible default. Prohibitions need architectural, procurement, contractual, and governance enforcement.

**Stop conditions:** pause or reject deployment if refusal degrades care; organisational access cannot be constrained; human presence or judgment worsens; correction is impractical; unknown material flows are found; or burdens and harms outweigh demonstrated benefit.

## Lane 3 · Practitioner commons and the longer civil-society horizon

### A commons, not a case archive

The commons can hold training materials, deliberately constructed scenarios, practice guides, contextual reflection, corrections, limitations, provenance, review history, and disagreement. Contributions are authored for that purpose; they are not extracted from private journals, training entries, live cases, model prompts, outputs, or operational logs.

Joining pear or (s)pear does not join the commons. Reading a resource does not disclose a worker's reflections. Contribution is a separate act with its own destination, audience, licence, attribution choice, review, retention, and withdrawal limits. **Model training on contributed knowledge is prohibited by default, not quietly enabled by participation.**

### Governance and labour

Practitioners and people with lived experience of giving and receiving support need compensated roles in governance and evaluation. Review, cultural correction, moderation, and maintenance are labour. Include attribution choices, dissent, corrections, appeals, withdrawal where technically possible, and honest statements about copies already distributed.

Avoid global prestige metrics and engagement optimisation. Role- and community-based access may be necessary, but role-based access alone does not resolve retaliation, confidentiality, or power. A private repository controls source visibility; it is not itself inference privacy.

### The neo-forum possibility remains a horizon

A future **separately governed civil-society commons** could connect learning among crisis workers, investigative reporters, lawyers, and human-rights NGOs. It should not become a single undifferentiated social network or make pear into a forum.

These are distinct practice communities:

- **Crisis workers:** relational care, service-user consent, and institutional duties.
- **Investigative reporters:** source protection, legal exposure, newsroom access, and evidentiary integrity.
- **Lawyers:** professional privilege, client confidentiality, and jurisdiction-specific duties.
- **Human-rights NGOs:** survivor testimony, security of affected communities, and cross-border/political risks.

A shared kernel may eventually support them; universal workflows, vocabularies, governance, and pooled knowledge must not be assumed. Any expansion should be earned through separate partnerships, cultural review, threat models, governance, and evidence.

## Product and data separation

**(s)pear may contain pear's workflows, but pear does not need (s)pear.** Intersection means shared values, reviewed resources, worker-controlled navigation, and explicit gateways—not shared access to every data store.

- Lane-separated storage and encryption/access boundaries; no cross-lane worker profile.
- No employer analytics, administrator browsing of private reflections, or secondary-use pipeline.
- Separate retention matrices for synthetic resources, private working state, any future real-case record, and commons resources.
- Explicit export and handoff gateways showing content, destination, recipients, purpose, retention, correction, and deletion limits.
- Offline pear must have no CDN dependencies, analytics, crash reporting, hidden update checks, cloud login, or cloud-model fallback. Core workflows must be tested with networking disabled.
- Swarm Map may later orchestrate deployment; it is not a dependency of the standalone product and does not confer safety.

## Questions still requiring practitioner decisions

1. Which single worker journey is the pear pilot, using what synthetic/non-case material?
2. What private working state is genuinely necessary, for how long, and under whose custody?
3. Which capabilities, if any, justify the name “co-pilot” in (s)pear? What must never be called assistance?
4. What authority, notice, consent, correction, and human alternative are required for any affected service user?
5. Who governs each lane and the commons; who is paid; how are disagreement and withdrawal handled?
6. What must employers, funders, hosts, future operators, and model providers be technically and contractually unable to do?
7. What evidence would stop pear, stop a specific (s)pear capability, or prevent expansion to another practice community?

**Design inference note:** the pear/(s)pear names, product boundary, wireframes, and controls above are design proposals from the project conversation. They are not claims made or endorsed by the cited literature or Intentional Peer Support.
