# Contributing to DescribeAT Admin

Thank you for your interest in making the DescribeAT Admin portal better. The project is open-sourced under **AGPLv3 + DCO** to ensure improvements flow back to the community.

---

## Read this first — the admin repo is special

> **This repository is admin-facing. Every change here can affect what listeners see, what metadata they read, and what audio description tracks are available to them.**
>
> All pull requests — including documentation fixes, typo corrections, and cosmetic changes — require **Maintainer review and approval** before merge. This is stricter than the listener-app repo, where small fixes can be merged by Committers. The reason is **blast radius**: the listener app only affects one user at a time, but a bad change here can affect every listener on the platform.
>
> **Open an issue before opening a PR** for non-trivial changes. The Maintainers will tell you whether the change is in scope and how to approach it. This saves everyone time.

Read [GOVERNANCE.md](GOVERNANCE.md) for the full model. The short version: this repo has the **stricter governance tier**. Plan accordingly.

---

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold it. Report unacceptable behaviour to the maintainers via the contact methods in [SECURITY.md](SECURITY.md).

## What we welcome

- **Bug fixes** — anything broken, from a broken button to a permission check that lets the wrong role into the wrong screen. Admin bugs are higher stakes than app bugs because they affect content visibility.
- **Accessibility improvements** — better keyboard navigation, screen reader support, focus management, contrast, ARIA labels. The admin portal is used by content managers; if it is hard to use for someone with a disability, that is a bug.
- **Workflow improvements** — faster bulk operations, clearer empty states, better error messages, better loading states, better data table affordances.
- **Documentation corrections** — if you deployed this against your own backend and found something the code, the README, or the runbooks got wrong, tell us.
- **Localisation** — translations of admin UI strings. The admin UI is English-only in this preview.
- **Test coverage** — additional unit tests, integration tests, accessibility tests. The admin portal has fewer tests than it should; we welcome them.
- **Schema improvements** — if you have a more general way to express the catalogue model (titles, tracks, notifications, feedback), propose it via an issue first.
- **Self-hosting recipes** — example configurations, alternative deployment patterns, non-AWS setups.

## What we do NOT accept

- **Real production data, even anonymised.** Sample data must be obviously synthetic. No real title names, no real user emails, no real narrator names, no real feedback messages.
- **Code that depends on closed-source libraries we don't have rights to.** If you want to integrate a new library, the integration code is welcome; the library itself must be open-source or documented as an external dependency.
- **Code that commits production identifiers.** Use placeholders like `<your-account-id>`, `<your-domain>`, `us-east-1_XXXXXXXXX`, `<your-cognito-pool-id>`, `<your-bucket-name>`. Never commit real AWS account IDs, Cognito pool IDs, API keys, signing keys, or S3 bucket names.
- **Permission model changes that loosen access.** This is an admin portal; tightening access is welcome, loosening it is not. If you think access should be loosened, open an issue first and let the Maintainers discuss.
- **Marketing material for specific products or services.** This is technical code, not a platform for promotion.
- **Cosmetic-only changes that touch many files.** A reformat of the whole repo is hard to review and gives the admin team a noisy diff. Targeted, well-scoped PRs only.

## The contribution workflow

### 1. Open an issue first (for non-trivial changes)

For anything beyond a typo, a broken link, or a one-line bug fix, open an issue first. Describe what you want to change and why. The Maintainers will respond within 5 business days with one of:

- "Yes, please open a PR" — go ahead.
- "Yes, but with this approach" — guidance on how to scope the change.
- "Not in scope right now" — explanation of why.
- "Needs more discussion" — the issue becomes a discussion thread.

This applies especially to: new features, schema changes, permission model changes, anything that touches the GraphQL contract, anything that changes the data model.

### 2. Fork or branch

If you have write access, create a branch. If not, fork the repository.

Branch names should be descriptive:

- `fix/track-upload-broken-mime-type`
- `a11y/keyboard-trap-in-modal`
- `docs/clarify-blank-rating-feedback`
- `feat/bulk-notify-with-preview`

### 3. Make your changes

Follow the existing style:

- **TypeScript:** strict mode, no `any`, functional components with hooks, named exports preferred.
- **React:** React 19 patterns only — no deprecated lifecycle methods, no class components.
- **Styling:** TailwindCSS 4 utility classes only — no custom CSS files except `index.css`. No inline styles except for dynamic values that must come from props.
- **Accessibility:** every interactive component must be keyboard-navigable, screen-reader-friendly, and have visible focus indicators. Modal components must trap focus and restore it on close. Forms must have proper labels and `aria-describedby` for errors.
- **Markdown:** sentence case headings, two-space indent, no trailing whitespace.
- **Examples:** use placeholders like `<your-account-id>`, `example.com`, `us-east-1_XXXXXXXXX`. Never use real values.

### 4. Sign off (DCO)

This project uses the [Developer Certificate of Origin](https://developercertificate.org/). Every commit must be signed off:

```bash
git commit -s -m "fix: handle missing track audio URL gracefully"
```

The `-s` flag adds a `Signed-off-by:` line to your commit message, certifying that you have the right to submit the contribution under the project's licence.

### 5. Open a pull request

PRs must include:

- A descriptive title (e.g. `fix: track upload rejects non-mp3 with clear error` not `Fix bug`)
- A description of **what changed and why**
- A reference to the issue it resolves (e.g. `Closes #123`)
- A **blast radius assessment** — does this change affect what listeners see? Does it touch permissions? Does it change the data model? See `.github/PULL_REQUEST_TEMPLATE.md` for the full checklist.
- For any change that adds, removes, or renames GraphQL fields: a **schema migration plan** as a comment or attached document.
- For any change that affects authentication or authorisation: a **security note** describing what could go wrong.

### 6. CI checks

CI runs on every PR:

- **TypeScript compile** — strict mode, must pass
- **Lint** — ESLint, must pass
- **Unit tests** — Vitest, must pass
- **Accessibility checks** — axe-core on key pages, must pass
- **Build verification** — `npm run build` must succeed
- **Secret scan** — verifies no real AWS IDs, API keys, etc. are present

If CI fails, fix the issues. If CI is wrong, open an issue explaining.

### 7. Review

A Maintainer will review your PR within 5 business days. They may:

- Approve and merge
- Approve with minor changes (they'll fix and merge)
- Request changes (you'll fix and re-request review)
- Reject (with a clear explanation)

Reviews are about correctness, accessibility, security, and consistency with the existing codebase. They are not about personal preference.

### 8. Merge

Once approved by a Maintainer, the PR will be merged. Your contribution is now part of the project.

---

## The DCO sign-off explained

The DCO is a lightweight alternative to a Contributor License Agreement (CLA). It certifies that:

1. You created the contribution, OR
2. You have the right to submit it under the project's licence, OR
3. You understand that the contribution may be publicly available under the project's licence

The full DCO text: https://developercertificate.org/

To sign off, add `-s` to your commit:

```bash
git commit -s -m "Your commit message"
```

This adds:

```
Signed-off-by: Your Name <your.email@example.com>
```

You can configure git to do this automatically:

```bash
git config --global format.signOff true
```

---

## What happens to your contribution

Your contribution is published under the AGPLv3 licence. The full text is in [LICENSE](LICENSE). By signing off, you agree to this.

Your contribution is publicly available on GitHub. The commit history is preserved. The contribution may be redistributed as part of the project.

You retain copyright on your contribution. The AGPLv3 licence grants others the right to use it under the project's terms; it does not transfer ownership.

---

## Reporting issues

If you find a bug, have a question, or want to discuss a change before making it:

1. **Search existing issues** to see if it's already reported
2. **Open a new issue** with a clear title and description
3. **Tag appropriately** (bug, enhancement, documentation, question)

For security issues, do **not** open a public issue. See [SECURITY.md](SECURITY.md).

---

## Becoming a maintainer

Maintainer status is **not** automatic and is granted sparingly for this repo because of the higher stakes. Maintainers:

- Review and merge PRs (after Maintainer approval — see [GOVERNANCE.md](GOVERNANCE.md))
- Triage issues
- Cut releases
- Make architectural decisions
- Approve schema changes

Maintainer status is granted by the existing Maintainers based on sustained, high-quality contributions over time. It is not granted based on volume of contributions, popularity, or tenure.

---

## Questions?

If you have a question that's not answered here:

- Check the [DescribeAT Backend & Ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem) docs for data model and deployment questions
- Check existing issues
- Open a new issue with the `question` label

We'll do our best to help.

Thank you for contributing. The project is better because of people like you — and the admin portal in particular benefits from careful, considered improvements.