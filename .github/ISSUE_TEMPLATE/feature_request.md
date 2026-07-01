---
name: Feature request
about: Suggest a new workflow, page, or capability for the admin portal
title: "[Feature] "
labels: ["enhancement"]
assignees: []
---

> **Before opening this:** for non-trivial features, please open an issue first (use this template). Maintainers will respond within 5 business days with one of: "yes, open a PR", "yes, with this approach", "not in scope", or "needs more discussion". For trivial changes (a new field on an existing form, a new filter on the data table), you can skip this and go straight to a PR — but expect Maintainer review either way.

## What's the feature

A clear and concise description of the feature.

## Why is it valuable

What problem does it solve? Who benefits (content managers, operators, super-admins, self-hosters)?

## Proposed approach

How would you implement this? Where would the new code live?

## Blast radius assessment (admin-specific)

This is the most important section. The admin repo has stricter governance because admin-side changes have listener-side blast radius. Help us understand the impact:

- [ ] **Affects existing content** — does this change how existing titles, AD tracks, categories, notifications, or feedback are read or displayed? If yes, describe which entities and what the effect is.
- [ ] **Affects new permissions** — does this introduce a new role, capability, or permission check? If yes, describe the role hierarchy and what the new role can / cannot do.
- [ ] **Schema change** — does this add, remove, or rename a field on the title, AD track, notification, or feedback models? If yes, describe the migration plan and the listener-app impact.
- [ ] **GraphQL contract change** — does this add, remove, or rename a query, mutation, or input type? If yes, describe the migration plan.
- [ ] **New third-party dependency** — does this require a new npm package, AWS service, or external integration? If yes, justify why the dependency is needed.
- [ ] **Service worker change** — does this affect offline caching, the update flow, or PWA behaviour?
- [ ] **None of the above** — this is a UI/workflow change that does not touch data, permissions, or schema.

## Alternatives considered

What other approaches did you consider? Why is this one better?

## Out of scope (explicitly)

What does this feature NOT do? What follow-up work might be needed?

## Rollback plan

If this change ships and breaks something, how do we roll it back? (Schema changes especially need a documented rollback path.)

## Additional context

Anything else that might be relevant — screenshots, mockups, links to similar features in other admin tools, deployment context.