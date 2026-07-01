---
name: Bug report
about: Report a bug in the admin portal (UI, workflow, or accessibility)
title: "[Bug] "
labels: ["bug"]
assignees: []
---

## What happened

A clear and concise description of what the bug is.

## Where

- File: `path/to/file.tsx` (or `path/to/doc.md`)
- Component / page: the affected page or component (e.g. `TrackEditor.tsx`, `UserFeedback.tsx`)
- Line (if known): the line number

## What I expected

What you expected to see or happen.

## What I saw

What you actually saw. Include a screenshot if relevant.

## How to reproduce

Steps to reproduce the bug. For admin-specific bugs, include the role of the admin user you were testing as (e.g. content manager, operator, super-admin) and the data state (e.g. "editing a title with no existing AD tracks").

## Blast radius (admin-specific)

This repository controls content visibility for every DescribeAT listener. Help us triage by indicating:

- [ ] Bug affects only the local admin user (UI glitch, broken button on one screen)
- [ ] Bug could affect multiple admin users (shared state, cached data, permission check)
- [ ] Bug could affect listener-visible content (metadata, AD track URL, title visibility, notification copy)
- [ ] Bug could expose data the affected admin should not see (other admins' actions, listener feedback, audit log)
- [ ] Unknown / need Maintainer assessment

## Suggested fix

If you have a suggestion for how to fix the bug, describe it.

## Accessibility notes

If the bug is accessibility-related, describe what assistive technology you were using (screen reader, keyboard-only, high-contrast, zoom) and what the expected behaviour was.

## Additional context

Anything else that might be relevant (browser, OS, screen reader, role being used, deployment self-hosted vs reference).