## What this PR does

A clear and concise description of the change.

## Why

What problem does this solve? Link to any related issues (e.g. `Closes #123`).

## Linked issue

- Issue: `#` — (required for non-trivial PRs; trivial one-line fixes may skip if the issue is the PR itself)
- Type: [ ] Bug fix  [ ] Feature  [ ] Refactor  [ ] Docs  [ ] Dependency  [ ] Other

---

## Blast radius assessment (required)

This repository controls content visibility for every DescribeAT listener. Every PR must include a blast radius assessment. Tick all that apply:

- [ ] **No listener-visible impact** — UI/workflow change only, no data or permission effect.
- [ ] **Affects listener-visible content** — metadata, AD track URL, title visibility, poster, category, notification copy. Describe what listeners could see differently.
- [ ] **Affects permissions** — adds, removes, or changes an authorisation check, role, or capability. Describe who can / cannot do what after the change.
- [ ] **Schema change** — adds, removes, or renames a field on Title, ADTrack, Notification, or Feedback. Schema migration plan attached or linked below.
- [ ] **GraphQL contract change** — adds, removes, or renames a query, mutation, or input type. Migration plan attached or linked below.
- [ ] **New third-party dependency** — new npm package, AWS service, or external integration. Justification in PR description.
- [ ] **Service worker change** — affects offline caching, update flow, or PWA behaviour.

If you ticked "schema change" or "GraphQL contract change", a **schema migration plan is required** as a comment in this PR or an attached document. PRs without a migration plan for schema/GraphQL changes will not be merged.

If you ticked "affects permissions", a **security note is required** in this PR description explaining what could go wrong and what the worst case is.

---

## Rollback plan (required for non-trivial changes)

Describe how to roll this change back if it ships and breaks something.

- [ ] Revert commit is sufficient (single commit, no schema change, no dependency change)
- [ ] Revert commit + manual data fix (describe the manual fix)
- [ ] Requires coordinated revert with the listener-app repo (schema or GraphQL change)
- [ ] Requires coordinated revert with the backend ecosystem (data model change)
- [ ] Other (describe)

---

## Type of change

- [ ] Bug fix (small, no listener-visible impact)
- [ ] Bug fix (with listener-visible impact or schema effect)
- [ ] New feature (UI / workflow only)
- [ ] New feature (with schema, GraphQL, or permission effect)
- [ ] Refactor (no behavioural change)
- [ ] Documentation improvement
- [ ] Dependency bump
- [ ] Translation

---

## Checklist

- [ ] I have read [CONTRIBUTING.md](../CONTRIBUTING.md) and [GOVERNANCE.md](../GOVERNANCE.md)
- [ ] I understand this PR requires **Maintainer approval** to merge (even if it is a typo)
- [ ] I have opened or linked an issue for non-trivial changes
- [ ] I have signed off my commits (`git commit -s`)
- [ ] My changes don't include any real production data, account IDs, secrets, or signer identifiers
- [ ] I have verified all links still resolve
- [ ] I have verified all example values are placeholders (e.g. `example.com`, `us-east-1_XXXXXXXXX`, `<your-cognito-pool-id>`)
- [ ] I have run `npm run lint` locally and it passes
- [ ] I have run `npm run test:run` locally and it passes
- [ ] I have run `npm run build` locally and it succeeds
- [ ] I have run accessibility checks (keyboard nav, screen reader) on any UI change
- [ ] I have not weakened any permission check, broadened any role, or added any new external dependency without an issue and Maintainer sign-off

---

## Testing

How did you test the change? Include:

- Local steps to verify (commands run, screens visited)
- Whether you tested with the offline / service-worker flow (if applicable)
- Whether you tested with screen reader / keyboard-only (for UI changes)
- Whether you tested against a local AppSync or only against placeholders

## Screenshots

If the change is visual, include before/after screenshots or screen-reader-output transcripts.

## Additional context

Anything else that might be relevant — links to mockups, related PRs in the listener-app or backend-ecosystem repos, deployment notes.