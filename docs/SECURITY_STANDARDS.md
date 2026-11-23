# Security Standards — BISCAST Game Dev Central

**Status:** Project security baseline  
**Applies to:** React + TypeScript + Vite + Tailwind, Supabase Auth/PostgreSQL/RLS/Storage, GitHub Actions, Cloudflare Pages.

## 1. Purpose and security objectives
Protect student accounts, personal information, unpublished submissions, capstone materials, voting integrity, administrator privileges, and the availability and integrity of the archive.

Security is a release requirement, not a post-launch enhancement. Controls must be enforced by trusted backend/database services. Frontend checks are usability controls only.

## 2. Security principles
- Least privilege: users and services receive only required access.
- Deny by default: access is denied unless explicitly allowed.
- Defense in depth: authentication, authorization, validation, constraints, monitoring, and recovery complement each other.
- Secure defaults: private drafts and pending submissions are not public.
- Data minimization: collect and expose only necessary information.
- Separation of environments: development, staging, and production are isolated.
- Auditable administration: privileged actions are attributable and reviewable.
- Fail safely: errors must not disclose secrets or private data.

## 3. Identity and authentication
- Verify ownership of the user's email address.
- The permitted suffix `@astean.biscast.edu.ph` is an eligibility rule, not proof of identity by itself.
- Confirm whether BISCAST uses Google Workspace and whether domain-restricted OAuth is available before choosing the authentication flow.
- Enable email confirmation; configure reliable SMTP before opening registration broadly.
- Define secure password, recovery, email-change, session expiry, and account-revocation behavior using current Supabase capabilities.
- Require MFA for Super Admin accounts where supported; strongly consider it for moderators.
- Do not expose institutional email addresses on public profiles.
- Alumni recovery must not depend exclusively on continued access to a school mailbox.

## 4. Authorization and roles
Roles: `student`, `moderator`, `super_admin`; account status is separate from role.

- Never accept role or account status from an untrusted client.
- Users cannot grant themselves roles or approve their own submissions.
- Apply RLS to every exposed table and storage bucket.
- Test object-level access (IDOR/BOLA) for every user-owned record.
- A suspended account must lose application privileges even if an old session remains valid.
- Alumni retain only the privileges explicitly approved by policy.
- Moderator and Super Admin actions must be logged.

## 5. Database and API controls
- Enable RLS on every table exposed through Supabase APIs.
- Write explicit policies for SELECT, INSERT, UPDATE, and DELETE; do not assume one policy covers all operations.
- Use database constraints for uniqueness, foreign keys, required values, and voting rules.
- Use parameterized queries and Supabase client APIs safely; never concatenate untrusted SQL.
- Keep service-role credentials exclusively in trusted server-side environments.
- Do not place secrets in `VITE_*` variables or browser bundles.
- Restrict database network access where operationally feasible and supported by the selected plan.
- Enforce TLS/SSL for database connections.
- Use safe `SECURITY DEFINER` functions only when needed; set a safe `search_path` and validate authorization inside the function.

## 6. Input, output, and browser security
- Validate all input on the trusted side, including type, length, format, ownership, and allowed state transitions.
- Encode output and avoid rendering untrusted HTML.
- Use a safe Markdown renderer if rich text is required.
- Restrict URLs to approved protocols, normally HTTPS.
- Add a Content Security Policy appropriate to the actual embeds and integrations.
- Configure security headers, including frame, MIME-sniffing, referrer, and transport protections as appropriate.
- Configure CORS for the actual application origins; CORS is not an authorization mechanism.
- Apply rate limits to registration, recovery, submissions, reports, and voting.
- Use CSRF protections where cookie-based authentication or custom endpoints make them applicable.

## 7. File and media security
- Limit uploads to required formats and sizes.
- Verify file content/MIME type, not only the filename extension.
- Generate storage object paths; do not allow users to overwrite another user's object.
- Use storage policies consistent with record ownership and publication status.
- Avoid accepting executable files.
- Treat SVG and HTML as active content; do not render untrusted uploads inline without a safe sanitization strategy.
- Keep game builds and videos on itch.io and YouTube; do not turn Supabase Storage into a game binary or video host.
- Obtain contributor permission for artwork, screenshots, audio, and video.

## 8. Logging and privacy
- Log security-relevant events: authentication anomalies, permission denials where available, moderation actions, role changes, voting administration, and configuration changes.
- Never log passwords, access tokens, refresh tokens, service-role keys, or unnecessary personal data.
- Restrict log access and define retention with the institution.
- Publicly expose only approved profile and project fields.

## 9. Minimum release standard
Use OWASP ASVS 5.0.0 as a verification reference. Level 1 is a practical baseline; select stronger controls for authentication, authorization, sensitive student data, and administrative functions. This project is not ASVS-certified merely by using the checklist.

Release blockers:
- Any confirmed unauthorized access to another user's private data.
- Any privilege escalation or self-assigned admin role.
- Any bypass of submission approval.
- Any duplicate or ineligible vote accepted contrary to policy.
- Exposed secrets or service-role keys.
- Unresolved critical security findings.

## 10. Required evidence
Maintain:
- Threat model and risk register.
- RLS policy inventory.
- Automated authorization test results.
- Dependency and secret scan reports.
- Security review findings and remediation records.
- Production readiness sign-off.

## References
- OWASP ASVS: https://asvs.owasp.org/
- OWASP Top 10: https://owasp.org/Top10/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- Supabase Production Security Checklist: https://supabase.com/docs/guides/security/production-checklist
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
