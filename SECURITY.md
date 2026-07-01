# Security Policy

## Why this repository's security policy is stricter

The **DescribeAT Admin** portal controls content visibility for the entire DescribeAT listener base. A vulnerability here can affect every listener on the platform — a misconfigured permission check can leak feedback, a bad upload handler can corrupt the catalogue, a buggy notification sender can broadcast to all devices. Compare that to the listener app, where a vulnerability typically only affects the local user.

That is why the security response for this repo is faster, the reporting channel is separate, and the patch window for critical issues is shorter than for the listener-app or backend-ecosystem repos.

---

## Supported versions

| Version | Supported |
|---|---|
| Latest (main branch) | ✅ Yes |
| Older versions | ❌ No |

This is an active codebase, not a long-running release. Security updates are applied to the main branch. We do not maintain back-ported security branches.

If you are running a forked or modified version of this admin portal, you are responsible for applying patches to your fork.

---

## Reporting a vulnerability — admin portal channel

> **Please do not report security vulnerabilities through public GitHub issues.** Public disclosure of an admin-side vulnerability can be exploited before a patch is available.

Report privately via one of these channels:

1. **Email:** `[email protected]` — placeholder, to be replaced before public launch. **Do not send to a generic `shazacin.com` address.**
2. **GitHub private vulnerability disclosure:** If the repository is hosted on GitHub.com, use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) feature on this repo.

The admin portal has a **separate security contact** from the listener app and the backend ecosystem. This is intentional — the admin portal's vulnerabilities are higher stakes, and the triage workflow is different.

### What to include in your report

- A description of the vulnerability and its impact, particularly the **blast radius** (does this affect one admin user, or every listener?)
- Steps to reproduce, including any proof-of-concept code
- The affected version(s) (e.g. main branch, specific commit)
- Your name/handle if you'd like to be credited in the fix

### Response SLA — admin portal

| Stage | Target |
|---|---|
| **Initial acknowledgement** | Within **48 hours** of your report |
| **Severity assessment** | Within **3 business days** |
| **Patch window — critical** (auth bypass, data exposure, RCE, permission model bypass) | **Within 7 days** |
| **Patch window — high** (XSS in admin context, CSRF, data corruption path) | **Within 30 days** |
| **Patch window — medium / low** | Next regular release |
| **Public disclosure** | After the patch is available and downstream deployers have had reasonable time to update |

The 48-hour acknowledgement and 7-day critical-patch SLA are **shorter than the listener app's** because of the higher blast radius. If we miss an SLA, follow up via the same channel.

---

## What we will do

When you report a vulnerability:

1. **Acknowledge** your report within 48 hours.
2. **Investigate** the issue and assess its severity, paying particular attention to blast radius (how many listeners could be affected, what content could be exposed).
3. **Develop a fix** if the issue is in our code. Coordinate with you on disclosure timing if you reported in good faith.
4. **Release the fix** to the main branch, with a clear security note in the release.
5. **Credit you** in the fix's commit message (if you want to be credited).
6. **Disclose** the issue publicly after the fix is released. For critical issues, this is after downstream deployers have had time to update — typically 14-30 days for critical, 30-90 days for lower severity.

## What we will NOT do

- We will not threaten legal action against you for reporting a vulnerability in good faith.
- We will not require you to sign an NDA before reporting (unless your organisation requires one).
- We will not pay bounties for vulnerability reports (this project is open-source and unmaintained financially).
- We will not fix issues in third-party dependencies — file those with the upstream project and tell us so we can pin, replace, or document.
- We will not disclose the vulnerability publicly before a fix is available, except by mutual agreement with the reporter.

---

## Security considerations for self-hosters

This is the admin portal. Self-hosters are running their own catalogue and their own listener base. You are responsible for your own security. The most common admin-portal-specific pitfalls:

### 1. Forgetting the admin domain allowlist

The admin user pool **must** have a hard allowlist of email domains. Without it, anyone with a Google or Facebook account can sign in as admin.

**Fix:** Configure the `PreSignUp` Lambda to reject emails from non-allowlisted domains. For Cognito, see the [DescribeAT Backend & Ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem) repo's `examples/cognito-app-client.example.json.md` for the configuration shape.

### 2. Committing secrets to source control

The `.env`, `aws-exports.ts`, and any `*amplify-meta*.json` files contain secrets. Never commit them. Never check in real Cognito pool IDs, API keys, signing keys, S3 bucket names, or AppSync API keys.

**Fix:** Use AWS Secrets Manager or a similar service. Add `.env`, `.env.local`, `aws-exports.ts`, `amplify-meta.local.json`, and any `*.local.json` to `.gitignore`. The published `.gitignore` covers these, but verify after every clone.

### 3. Skipping MFA on the admin pool

Admins should have MFA **required**, not optional. Without it, a stolen password gives full admin access — and admin access is content visibility for the whole platform.

**Fix:** Set `MFAConfiguration: "ON"` on the admin user pool. Enforce it for every admin user.

### 4. Not rotating credentials when admins leave

When an admin leaves the team, their access must be revoked **immediately**. Admin access does not expire gracefully.

**Fix:** Have an off-boarding checklist. Disable the user in the auth provider within 1 hour of departure. Rotate any signing keys the departing admin had access to.

### 5. Exposing AppSync directly to the public internet

The AppSync endpoint should be private or behind an auth-aware CDN. Direct public access bypasses your permission model.

**Fix:** Use Cognito user-pool auth on the AppSync API. Configure API keys only for local development — never in production.

### 6. Letting signed S3 URLs outlive their intent

The admin portal uses signed S3 URLs for poster and audio previews. If a signed URL is generated with a TTL longer than necessary, an exfiltrated URL remains valid.

**Fix:** Use the shortest TTL that still allows the admin workflow to complete. 5 minutes is usually enough.

### 7. Uploading unvalidated files to S3

If the admin portal uploads posters and audio files to S3, an attacker (or a compromised admin account) can upload content with embedded malware, oversized files, or content that breaks the listener app.

**Fix:** Validate file types and sizes client-side and server-side. Scan uploaded files where the deployment can afford it. Use S3 bucket policies to restrict content types.

### 8. Using the same user pool for admin and listener

If the admin user pool and the listener user pool are the same, a compromised listener account can attempt to access admin endpoints (and a compromised admin account is also a listener account with potentially privileged data).

**Fix:** Use separate Cognito user pools. The backend ecosystem docs describe the two-pool pattern.

---

## Security considerations for content contributors

If you contribute AD content, posters, or metadata to a DescribeAT deployment, you are responsible for the licensing and provenance of the content. The DescribeAT project does not verify or warrant the licensing of contributed content.

**Do not contribute:**

- Content you do not have the right to licence
- Content that contains personal information of third parties without their consent
- Content that infringes on the intellectual property rights of others
- Content that is malicious, harmful, or misleading

---

## Cryptography

The admin portal does not implement its own cryptography. It relies on:

- **TLS** for transport security (handled by the CDN and auth provider)
- **JWT signatures** for auth tokens (handled by Cognito or your auth provider)
- **Pre-signed S3 URLs** for storage access (handled by AWS S3)
- **Service worker integrity** for offline behaviour (handled by Workbox)

Self-hosters should not implement their own cryptography. Use the managed services.

---

## Reporting a security issue in someone else's deployment

If you find a security issue in someone else's deployment of DescribeAT Admin, report it to the deployment owner directly. Do not report it to the DescribeAT project — we don't operate the deployments.

---

## Disclosures

This section lists publicly disclosed security issues that have been fixed in this repo.

_No security disclosures yet. This section will be updated as issues are reported and fixed._

---

## Contact

- **Admin portal security issues:** the email and GitHub private disclosure link at the top of this document.
- **Listener-app security issues:** see the [DescribeAT App](https://github.com/ShazaCin/describeat-app-public) `SECURITY.md` (separate channel).
- **Backend ecosystem security issues:** see the [DescribeAT Backend & Ecosystem](https://github.com/ShazaCin/describeat-backend-ecosystem) `SECURITY.md` (separate channel).
- **Non-security issues:** open a public issue.

The three repositories have separate security channels on purpose. Do not cross-report.