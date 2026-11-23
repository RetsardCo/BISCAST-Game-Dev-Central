# Threat Model — BISCAST Game Dev Central

## 1. Scope
Assets: student identity and profile data, game submissions, unpublished content, capstone records, developer/team credits, votes, awards, admin roles, uploaded media, database credentials, and operational availability.

Trust boundaries:
1. Browser to Cloudflare Pages frontend.
2. Browser to Supabase Auth and Data API.
3. Supabase API to PostgreSQL/RLS.
4. Trusted administrative/database functions.
5. GitHub repository and CI/CD secrets.
6. External media providers (itch.io, YouTube, image hosts).

## 2. Actors
- Anonymous visitor.
- Verified student.
- Alumni.
- Moderator.
- Super Admin.
- Malicious authenticated user.
- External attacker.
- Compromised dependency or CI credential.
- Accidental operator.

## 3. Threat scenarios and mitigations

| ID | Threat | Example | Required mitigation |
|---|---|---|---|
| T-01 | Account impersonation | Attacker registers with a forged Astean-looking address | Verify email ownership; verify institutional provider/domain controls |
| T-02 | Account takeover | Password reuse or phishing compromises a moderator | MFA for privileged accounts, recovery protections, alerts |
| T-03 | Broken object authorization | Student changes a game ID to read another student's draft | RLS ownership policies and IDOR tests |
| T-04 | Privilege escalation | Student edits profile role to `super_admin` | Protected role table and trusted role assignment |
| T-05 | Submission bypass | Student calls publish endpoint directly | Server/database state-transition authorization |
| T-06 | Duplicate voting | Client resends or alters vote request | Unique database constraint and trusted eligibility/time checks |
| T-07 | Vote manipulation | Client submits fake voter or event IDs | Derive identity from authenticated context; validate eligible entry |
| T-08 | XSS | Malicious project description contains script | Safe rendering, output encoding, no arbitrary HTML |
| T-09 | Malicious upload | Executable disguised as an image | MIME/content validation, size/type allowlist, safe storage |
| T-10 | Secret exposure | Service-role key committed or bundled | Secret scanning, environment separation, immediate rotation |
| T-11 | Supply-chain compromise | Vulnerable or malicious npm dependency | Lockfile, dependency review, automated alerts, controlled updates |
| T-12 | Data loss | Accidental destructive migration | Backups, migration review, restore rehearsal |
| T-13 | Abuse/DoS | Automated signup or submission flooding | Rate limits, abuse controls, monitoring |
| T-14 | Privacy exposure | Student email or moderation notes appear publicly | Data minimization, explicit public views, RLS |
| T-15 | External media compromise | Unsafe URL or misleading embedded content | HTTPS allowlist, safe iframe policy, clear external attribution |
| T-16 | Admin misuse | Moderator changes award or voting result without trace | Least privilege, audit logs, dual review for sensitive changes |

## 4. Abuse cases that must be tested
- Anonymous user requests a pending game by guessed UUID.
- Student A requests Student B's profile-private fields or draft.
- Student attempts to update their role, account status, approval state, or vote count.
- Student submits a vote for a game not entered in the competition.
- Student submits after event close using a modified client clock.
- Suspended user reuses a previously issued session.
- Moderator attempts to assign Super Admin.
- User uploads a renamed executable or oversized file.
- Untrusted content attempts script execution.
- CI workflow attempts to access production secrets from an untrusted pull request.

## 5. Risk rating
Rate likelihood and impact as Low / Medium / High / Critical. Prioritize critical/high risks. Record owner, evidence, mitigation, residual risk, and target date in the project risk register.

## 6. Assumptions requiring confirmation
- Astean email provider and institutional verification mechanism.
- Who can grant moderator and Super Admin roles.
- Voting eligibility and self-vote rules.
- Graduation verification and alumni recovery.
- Data retention, consent, and incident notification responsibilities.
- Whether capstone materials may be public.

## 7. Review cadence
Review the threat model:
- Before first production release.
- When authentication, roles, voting, uploads, or data schema materially change.
- After a security incident.
- At least during the project's scheduled security review.

## References
- OWASP Threat Modeling: https://owasp.org/www-community/Threat_Modeling
- OWASP ASVS: https://asvs.owasp.org/
- OWASP Top 10: https://owasp.org/Top10/
