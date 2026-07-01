# Governance

This document describes how decisions are made in `describeat-admin-public` and who has the authority to make them.

> **TL;DR — this repo has the stricter governance tier.** All merged PRs require Maintainer approval, including cosmetic changes and documentation fixes. The reason is **blast radius**: the listener app only affects one user at a time, but the admin portal controls what every listener on the platform sees.

---

## The three-tier contributor model

Like the other DescribeAT repositories, this project uses a three-tier contributor ladder. Every person who touches the code operates at one of these levels. Advancement is based on demonstrated quality, not popularity.

| Tier | What they can do | How they get there |
|---|---|---|
| **Contributor** | Open issues. Open pull requests. Comment on PRs. | Anyone with a GitHub account. |
| **Committer** | Review PRs. Approve non-architectural PRs in lower-stakes repos. Triage issues. | Invited by Maintainers after sustained, high-quality contributions. |
| **Maintainer** | Approve and merge PRs. Approve schema changes. Cut releases. Make architectural decisions. | Invited by existing Maintainers. Rare. |

In the listener-app and backend-ecosystem repos, **Committers can merge most PRs** without Maintainer involvement — Maintainer approval is reserved for architectural changes. **That is not the case in this repo.**

## The admin repo's stricter model

In `describeat-admin-public`, **Maintainer approval is required for every merged PR**, with no exceptions for size, scope, or cosmetic-only changes.

This includes:

- **Bug fixes** — even one-line typo fixes in the README require Maintainer review and merge.
- **Documentation changes** — README, CONTRIBUTING, SECURITY, comments in code.
- **Cosmetic changes** — renaming a button label, moving a sidebar item, changing a colour.
- **Refactors** — extracting a function, splitting a component, renaming a file.
- **Dependency bumps** — bumping any dependency, including dev dependencies, requires Maintainer approval because dependency changes can pull in transitive code that runs in the admin context.

The reason is blast radius:

- The **listener app** affects one user at a time. A bug in the listener app is annoying; a fix is local.
- The **admin portal** affects every listener on the platform. A bug here — a misconfigured permission, a bad default, a confusing UI that causes a content manager to publish the wrong metadata — propagates to the entire user base before it can be caught.

The cost of a strict review process is friction. The cost of an uncaught bad admin change is content visibility errors for every DescribeAT listener. We have decided that the second cost is higher.

## The review process

1. **A Contributor forks the repo (or creates a branch) and opens a PR.**

2. **CI runs automatically** — TypeScript compile, lint, unit tests, accessibility checks, build, secret scan. Any PR that fails CI is automatically blocked; a human cannot merge it until CI is green.

3. **A Committer or Maintainer reviews the PR** for correctness, accessibility, security, and consistency. They may request changes, which loops back to the Contributor.

4. **A Maintainer provides the merge approval.** This is required for every PR in this repo, including those that have already received Committer approval. The Maintainer may:
   - Approve and merge.
   - Approve with minor changes (the Maintainer fixes and merges, or asks the Contributor to fix).
   - Request changes (the Contributor fixes and re-requests review).
   - Reject with a clear explanation.

5. **The Maintainer merges the PR.** Schema-affecting changes are scheduled for the next release.

All of this happens transparently on GitHub. Every review comment, every CI result, every decision is public.

## Architectural changes — additional gate

Beyond the standard Maintainer gate, certain changes require additional review because of their blast radius:

- **GraphQL schema changes** (add/remove/rename fields, change types): requires an issue with a written migration plan, Maintainer approval, and a release note.
- **Authentication or authorisation changes**: requires Maintainer approval and a security note in the PR description.
- **Data model changes** (adding fields to titles, tracks, notifications, feedback): requires an issue, Maintainer approval, and confirmation that the listener app is compatible.
- **Permission model changes**: requires Maintainer approval and a security note. Loosening permissions is a particularly high bar; tightening is welcome but still requires review.
- **New third-party dependency additions**: requires an issue, a justification of why the dependency is needed, and Maintainer approval. We prefer first-party code for the admin portal because the dependency surface is small.
- **Service worker changes** (Workbox config, caching strategies): requires Maintainer approval because a bad SW update can break the admin app for all staff simultaneously.

For these changes, the Maintainer may call for broader review from other Maintainers, the Shazacin team, or BGC before approving.

## The Shazacin veto

No architectural change, no new feature that affects the public-facing listener experience, no third-party dependency addition, and no schema change can proceed without explicit approval from the **Shazacin team**. Maintainers flag these decisions to Shazacin (via BGC) before merging.

The governance model is designed so that the community drives improvements — but Shazacin retains the keys to the castle, because the admin portal ultimately controls what content reaches DescribeAT listeners.

## What "approval" means

Approval means: a Maintainer with merge rights has looked at the change, run the CI mentally or for real, assessed the blast radius, and decided the change is safe to ship. Approval is not a rubber stamp. A Maintainer who approves a bad change bears some responsibility for the consequences.

If you are a Maintainer and you are not sure, request another Maintainer's review. The default action on uncertainty is to ask.

## Disagreement and conflict resolution

When Maintainers disagree on a change:

1. **Discussion in the PR thread.** Try to reach consensus. Most disagreements are scope disagreements, not principle disagreements.
2. **Escalate to a larger Maintainer group.** If two Maintainers cannot agree, the decision escalates to all Maintainers. Majority wins.
3. **Escalate to Shazacin.** If Maintainers cannot agree and the change affects the public-facing listener experience, the Shazacin team has the final say. This is the veto clause above.

When Contributors disagree with a Maintainer decision:

1. **Ask for the reasoning.** Maintainers are expected to explain their decisions, especially rejections.
2. **Escalate.** If you believe a decision is wrong, open an issue and tag other Maintainers.
3. **Accept.** If the decision is final, accept it. You are always free to maintain your own fork under the AGPLv3 terms.

## Becoming a Maintainer

Maintainer status is granted by existing Maintainers. It is **not automatic**, not based on volume of contributions, and not based on tenure.

Criteria:

- **Sustained, high-quality contributions** over a meaningful period of time.
- **Demonstrated understanding** of the admin portal's blast radius model.
- **Trust** that the candidate will use the merge authority appropriately.

The admin portal's Maintainer list is expected to remain small — on the order of a handful of people — because the merge authority carries real responsibility.

Maintainer status can be revoked by the existing Maintainer group if the holder abuses the role, becomes inactive without notice, or acts against the project's interests.

## Releases

The admin portal does not have a fixed release cadence. Changes are merged to `main` as they are approved. Periodic tagged releases may be cut when the listener-app repo or the backend ecosystem requires an admin-portal change.

Schema-affecting changes are batched and coordinated with the listener-app release schedule.

## Contact

- **Code and PR questions:** open an issue or comment on a PR.
- **Governance questions:** open an issue with the `governance` label.
- **Security issues:** see [SECURITY.md](SECURITY.md) — do not open a public issue.
- **Conduct issues:** see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — contact the maintainers via the channel in [SECURITY.md](SECURITY.md).

---

*This governance model is designed for a small, high-stakes admin repository. It will evolve as the project grows. Changes to this document itself require Maintainer approval, like everything else in this repo.*