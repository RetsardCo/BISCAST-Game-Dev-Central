# Deployment Runbook — BISCAST Game Dev Central

## 1. Purpose
Provide a controlled, repeatable procedure for staging and production releases.

## 2. Environments
- Local development: developer machines; synthetic data.
- Staging: isolated Supabase project and Cloudflare preview/staging target.
- Production: real users and approved data.

Never point ordinary development tests at production.

## 3. Pre-deployment
- Confirm release is approved in `PRODUCTION_READINESS.md`.
- Confirm commit SHA and release tag.
- Confirm CI checks pass.
- Review dependency and secret scan findings.
- Review database migrations and rollback/forward-fix plan.
- Confirm backups and restore readiness for risky changes.
- Confirm environment variables are set in the correct environment.
- Confirm no secrets are embedded in `VITE_*` variables.
- Notify administrators of planned maintenance if needed.

## 4. Database migration
1. Inspect migration diff.
2. Apply to staging.
3. Run migration tests and RLS tests.
4. Verify application compatibility.
5. Confirm production backup/recovery point.
6. Apply approved migration to production using the controlled release process.
7. Verify schema version and critical queries.
8. Record migration ID, actor, timestamp, and result.

Do not assume every migration can be safely reversed. For destructive changes, use a tested restore or forward-fix plan.

## 5. Frontend deployment
1. Merge approved code to protected release branch.
2. Run production build in CI.
3. Deploy to Cloudflare Pages production environment.
4. Verify deployed commit/build identifier.
5. Confirm HTTPS and routing.
6. Run smoke tests.

## 6. Smoke tests
- Home and game library load.
- Published game detail loads.
- Search and filters work.
- Login/logout works.
- Verified student can access dashboard.
- Unauthorized user cannot access admin functions.
- Submission enters pending state.
- Moderator can review according to policy.
- Public cannot see pending submissions.
- Voting rules are enforced if voting is enabled.
- Capstone/alumni pages show only approved public content.
- No secrets or sensitive data appear in browser responses.

## 7. Rollback / recovery
Frontend:
- Redeploy the last known-good build or use the provider's supported rollback mechanism.
- Verify route and asset availability.

Database:
- Stop further writes if integrity is at risk.
- Determine whether a forward-fix or backup restore is safer.
- Obtain approval for destructive recovery.
- Restore to an isolated target first where feasible.
- Validate data integrity before reopening traffic.

Authentication/configuration:
- Revert only to a known-good configuration.
- Rotate compromised credentials; do not simply restore a leaked secret.

## 8. Post-deployment
- Monitor logs, errors, authentication, database, and quota usage.
- Review smoke-test results.
- Record deployment outcome.
- Record incidents and follow-up tasks.
- Confirm backups and alerts remain operational.

## 9. Deployment record
- Version/tag:
- Commit SHA:
- Deployer/approver:
- Deployment time:
- Migration version:
- CI run:
- Smoke test result:
- Issues:
- Rollback/forward-fix required:
