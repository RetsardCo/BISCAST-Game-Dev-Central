# CI/CD Standards — BISCAST Game Dev Central

## 1. Objectives
Automate repeatable validation before code is merged and deployed. CI must fail visibly when required checks fail.

## 2. Branch strategy
- `main`: production-ready, protected.
- Feature branches: scoped implementation work.
- Pull requests: required review and automated checks.
- Use tags for releases and known-good baselines.

Enable branch protection/rulesets:
- Require pull requests.
- Require required status checks.
- Require review by an authorized maintainer.
- Block force pushes and deletion of protected branches.
- Require conversation resolution where appropriate.

## 3. Pull request checks
At minimum:
1. Install dependencies from the lockfile using `npm ci`.
2. TypeScript typecheck.
3. Lint.
4. Unit/component tests.
5. Production build.
6. Dependency vulnerability review.
7. Secret scanning.
8. SAST where configured.

Add integration/E2E and RLS tests in staging or controlled CI environments. Do not use production credentials for pull-request builds.

## 4. GitHub Actions security
- Pin third-party actions to full commit SHAs where practical.
- Set the minimum required `permissions` for each workflow.
- Avoid `pull_request_target` for workflows that execute untrusted PR code.
- Do not interpolate untrusted PR titles, branch names, or commit messages into shell commands.
- Use GitHub OIDC for supported cloud authentication instead of long-lived cloud secrets where feasible.
- Store secrets in the narrowest appropriate environment.
- Protect production environments with required reviewers.
- Separate build/test jobs from deployment jobs.
- Do not print secrets in logs.
- Review workflow changes as security-sensitive code.

## 5. Deployment pipeline
Suggested flow:
- Pull request: checks and preview build.
- Merge to main: production build and deployment approval.
- Production deploy: controlled Cloudflare Pages deployment using production environment variables.
- Database migrations: separate reviewed step; never run destructive production SQL automatically without explicit release approval.

## 6. Supabase migrations
- Keep migrations in version control.
- Test migrations against a disposable/staging project.
- Review RLS policies as part of schema changes.
- Back up before risky production migrations.
- Prefer backward-compatible changes and staged removal.
- Record migration version and outcome.

## 7. Required secrets
Use repository/environment secrets only where necessary. Frontend public Supabase URL and publishable/anon key are configuration values, not secrets; their exposure is expected and must be protected by RLS. Service-role keys, database passwords, SMTP credentials, and deployment tokens are secrets and must never enter frontend variables or repository files.

## 8. Failure policy
A failed required check blocks merge/deployment. Exceptions require documented approval, reason, compensating controls, and expiry date.

## 9. Workflow evidence
Keep logs and release records for:
- Commit SHA.
- Workflow run.
- Test/scanner results.
- Approver.
- Deployment target.
- Migration version.
- Rollback/forward-fix reference.

## References
- GitHub Actions security hardening: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- GitHub dependency review: https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review
- Cloudflare Pages: https://developers.cloudflare.com/pages/
