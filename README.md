# DescribeAT Admin

> **Companion admin portal for [DescribeAT App](https://github.com/ShazaCin/describeat-app-public) — the listener-facing PWA.**
> This repository hosts the **DescribeAT Admin** web app: the staff-facing console DescribeAT content managers use to run the audio description catalogue.

---

## What is the DescribeAT Admin portal?

The DescribeAT Admin portal is a single-page web app used by **DescribeAT staff and content managers** to operate the DescribeAT catalogue. It is **not the listener app**. The listener app is what end users open on their phone to listen to audio description tracks in sync with what they're watching. The admin portal is the back-office tool the DescribeAT team uses to put content into that catalogue and keep it correct.

In concrete terms, the admin portal lets you:

- **Manage titles** — create, edit, and retire catalogue entries (movies, TV shows, episodes, chapters). Edit metadata, posters, and visibility flags.
- **Edit audio description (AD) tracks** — upload, preview, order, and remove the per-title AD audio files that the listener app plays back in sync.
- **Manage categories and taxonomy** — define the categories listeners browse, including parent/child relationships for episodes and chapters.
- **Review user feedback** — read the ratings and messages submitted by listeners inside the DescribeAT app, triage issues, and follow up.
- **Send notifications** — push announcements to listener devices (new title drops, service notices, featured content).
- **Manage operator configuration** — feature flags, public visibility defaults, and runtime settings that control what listeners see.
- **Manage users** — view, enable, disable, and audit administrator accounts that have access to this portal.

If you are a listener trying to use the DescribeAT product, **this is not the app you want**. You want the [DescribeAT App](https://github.com/ShazaCin/describeat-app-public) repository instead.

## Why is it open source?

Two reasons.

**1. Transparency for the content workflow.** The admin portal controls what content is visible to listeners, what metadata it carries, and what feedback reaches the team. Auditing that workflow in private is not enough — the blind and visually impaired community that depends on DescribeAT deserves to see how content decisions are made. Open-sourcing the admin portal lets anyone — community members, accessibility researchers, self-hosters — read the code that determines what content reaches listeners.

**2. A common base for self-hosters.** Some people and organisations want to run their own DescribeAT instance with their own catalogue (regional AD content, organisational libraries, experimental setups). They need the admin portal as much as they need the listener app. Open-sourcing it means they can run their own catalogue without depending on Shazacin's infrastructure.

The admin portal is released under **AGPLv3 + DCO**, the same terms as the [DescribeAT App](https://github.com/ShazaCin/describeat-app-public) and the [DescribeAT Backend & Ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem) repos. If you deploy a modified admin portal as a service, you must publish your modifications under the same licence. That is the point.

## Repository status — sanitised public preview

This is a **sanitised public preview**, not the live production code. The version published here has been:

- Stripped of all Shazacin-specific identifiers (account IDs, Cognito pool IDs, API keys, S3 bucket names, internal endpoints, signing keys).
- Decoupled from the production AWS backend. Nothing in this repo will talk to a real Shazacin AWS account if you clone it.
- Verified to compile and build against the published stack versions (see "Tech stack" below).

It is **not** a turnkey deployable instance. To use it, you must stand up your own AWS backend (or compatible alternative), wire your own auth provider, point the GraphQL client at your own AppSync endpoint, and configure your own S3 buckets. See [CONTRIBUTING.md](CONTRIBUTING.md) and [GOVERNANCE.md](GOVERNANCE.md) for what is and isn't covered by this preview.

The Shazacin team's internal admin instance is not the same code as this preview. Shazacin may be running a different version internally, with private features that are not — and will not be — open-sourced.

## Who this is for

- **DescribeAT staff and content managers** who want to read the code they use every day, propose improvements, or understand the data model.
- **Self-hosters** running their own DescribeAT instance who need the admin console to manage their own catalogue.
- **Accessibility researchers and auditors** who want to verify how content visibility and feedback review work.
- **Contributors** who want to fix a bug, improve a workflow, or add a feature.

If you are an end user (a listener), you do not need this repo. You want the [DescribeAT App](https://github.com/ShazaCin/describeat-app-public).

## Quick start (development preview only)

The published code builds and runs in dev mode against placeholder configuration. It will not talk to any backend without you setting one up.

```bash
# 1. Clone
git clone https://github.com/ShazaCin/describeat-admin-public.git
cd describeat-admin-public

# 2. Install dependencies
npm install

# 3. Configure placeholders (see .env.example)
cp .env.example .env
# Edit .env — fill in YOUR values, not Shazacin's

# 4. Run the dev server
npm run dev
```

For a real deployment, you need: a Cognito (or compatible) user pool with MFA enforced, an AppSync (or compatible) GraphQL endpoint, and S3 (or compatible) storage for posters and AD audio. Configuration placeholders only — never commit real values.

## Tech stack

This is a **React 19 + Vite 6 + TypeScript (strict)** single-page app.

- **React 19** — UI runtime
- **Vite 6** — dev server and bundler
- **TypeScript** (strict mode) — types
- **AWS Amplify v6** — auth, GraphQL client, storage client
- **TanStack Query** — server-state caching and mutation orchestration
- **Zustand** — client state stores (auth, UI, toasts)
- **TailwindCSS 4** — styling (utility-first, no custom design system)
- **Framer Motion** — page transitions and toast animations
- **Lucide React** — icon set
- **Workbox** (via `vite-plugin-pwa`, `injectManifest` strategy) — service worker for offline behaviour and update prompts
- **Dexie** — IndexedDB wrapper for offline caching of catalogue reads
- **Vitest** + Testing Library — unit and component tests

For a deep dive into the data model these components talk to, see [DescribeAT Backend & Ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem) — particularly `docs/03-data-model.md` for the four core entities (titles, AD tracks, notifications, feedback).

## Relationship to the listener app

The DescribeAT system has three open-source repositories, all under AGPLv3:

| Repository | What it is | Audience |
|---|---|---|
| [describeat-app-public](https://github.com/ShazaCin/describeat-app-public) | Listener-facing PWA. The app blind and VI users open on their phone. | End users |
| [describeat-admin-public](https://github.com/ShazaCin/describeat-admin-public) (this repo) | Admin-facing SPA. The console content managers use to operate the catalogue. | DescribeAT staff, self-hosters |
| [describeat-backend-ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem) | Documentation of the backend infrastructure, data model, deployment patterns, and operational knowledge. | Self-hosters, deployers |

The three repos share a data model and a deployment pattern. The listener app reads what the admin portal writes. The backend ecosystem docs describe how to run the layer underneath both.

## Contributing

We welcome:

- **Bug fixes** — especially anything that improves accessibility for admins using screen readers or keyboard-only navigation.
- **Workflow improvements** — better data tables, faster bulk operations, clearer empty states, accessible forms.
- **Documentation corrections** — if you deployed this against your own backend and found something the code or docs got wrong, tell us.
- **Localisation** — translations of the admin UI strings (the admin UI is English-only in this preview).
- **Schema improvements** — if you have a more general way to express the catalogue model, propose it via an issue first.

The admin portal has a **stricter governance tier** than the listener app because every change here has a **listener-side blast radius** — a bad title edit, a buggy AD track upload, or a misconfigured notification can affect every listener using DescribeAT. Read [GOVERNANCE.md](GOVERNANCE.md) before opening a PR. The short version: **all merged PRs require Maintainer approval**, including cosmetic changes. This is non-negotiable.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, the DCO sign-off, and the checklist.

## Security

The admin portal controls content visibility and access to user feedback. A vulnerability here is more severe than a vulnerability in the listener app — it can affect every listener using the service.

Please do not report security issues through public issues. See [SECURITY.md](SECURITY.md) for the dedicated reporting channel and the response SLA.

## Licence

- **Application code:** [AGPLv3](LICENSE) — see LICENSE file.
- **Sample data and example configurations:** CC-BY-4.0.
- **AD audio content, posters, fingerprint data:** **not** covered by the AGPLv3 licence and **not** redistributed from this repo. See [LICENSE.media](#) (placeholder — to be added before public launch). If you self-host, you are responsible for sourcing the AD content for your own region.

## Trademark

"DescribeAT" is a trademark of Shazacin. The open-source release grants you the right to use, modify, and distribute the code under AGPLv3 — it does not grant you the right to use the DescribeAT name or logo to brand a derivative product in a way that suggests Shazacin endorses it. See [TRADEMARK.md](TRADEMARK.md).

---

*This repository is a sanitised public preview of the DescribeAT Admin portal. Deploy it under your own conditions against your own backend. The Shazacin team is not responsible for the operation, security, or content of third-party deployments.*