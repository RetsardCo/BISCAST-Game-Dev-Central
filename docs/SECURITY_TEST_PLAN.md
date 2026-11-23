# Security Test Plan — BISCAST Game Dev Central

## 1. Purpose
Verify that security controls work through direct tests of the application and Supabase policies. A passing UI test alone is not evidence of authorization.

## 2. Test environments
- Use isolated development/staging projects and synthetic test accounts.
- Do not run destructive tests against production.
- Never use real student personal data in ordinary test fixtures.
- Record build, commit, migration version, test identity/role, and results.

## 3. Test identities
Create controlled fixtures for:
- Anonymous visitor.
- Verified student A.
- Verified student B.
- Alumni.
- Suspended user.
- Moderator.
- Super Admin.

## 4. Authentication tests
- Unverified email cannot gain student privileges.
- Non-allowlisted email cannot register as an eligible student.
- Astean-looking address without verified ownership is rejected.
- Password recovery does not disclose whether an account exists unnecessarily.
- Expired/used confirmation and recovery links are rejected.
- Logout and session revocation behave as designed.
- Suspended account cannot perform protected actions.
- MFA is enforced for privileged roles where configured.

## 5. Authorization/RLS tests
For each table and storage bucket, test allowed and denied SELECT/INSERT/UPDATE/DELETE:
- Anonymous can read published public records only.
- Student can read/update only their own permitted records.
- Student cannot read another user's private profile fields or pending submission.
- Student cannot change role, account status, moderation status, reviewer, vote totals, or audit logs.
- Moderator can perform only authorized moderation operations.
- Moderator cannot grant Super Admin.
- Super Admin operations are audited.
- Alumni cannot use student-only actions unless policy explicitly allows them.

## 6. Submission tests
- Required fields and URL validation run on trusted side.
- New submission is pending and not public.
- Student cannot self-approve.
- Student A cannot edit Student B's submission.
- Invalid state transitions are rejected.
- Team membership changes require authorization.
- Published edits trigger the configured review process.
- Rejected and changes-requested states expose only intended feedback.

## 7. Voting tests
- Only eligible authenticated profiles can vote.
- Event must be open according to trusted database time.
- Game must be an eligible competition entry.
- Voter identity is derived from authenticated context, not request payload.
- Unique constraint rejects duplicate votes under concurrent requests.
- Client clock manipulation does not bypass event closure.
- Public users cannot read individual voter identities.
- Aggregate results follow event visibility rules.
- Administrative corrections are auditable.

## 8. Input and file tests
- XSS payloads are rendered inert.
- SQL injection strings do not alter query behavior.
- Unsafe URL schemes are rejected.
- Oversized and disallowed file types are rejected.
- Renamed executable files are rejected.
- Storage object path traversal/overwrite attempts fail.
- Malicious SVG/HTML is not rendered unsafely.

## 9. CI/CD and secret tests
- Secret scanner detects a test canary secret.
- Production service-role key is absent from browser bundles and source maps.
- Pull request from an untrusted fork cannot access production secrets.
- Dependency scanner reports are reviewed.
- Build and tests fail when a required check fails.

## 10. Execution and evidence
For each test record:
- Test ID.
- Preconditions and test account.
- Steps or automated test name.
- Expected result.
- Actual result.
- Pass/fail.
- Evidence/log reference.
- Defect ID and remediation.

## 11. Exit criteria
- All critical tests pass.
- No unresolved critical/high authorization defect.
- Duplicate-vote and closed-event tests pass at database level.
- No service-role secret exposure.
- RLS coverage is inventoried and reviewed.
- Failed tests have documented remediation and retest evidence.

## References
- OWASP Web Security Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- OWASP ASVS: https://asvs.owasp.org/
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
