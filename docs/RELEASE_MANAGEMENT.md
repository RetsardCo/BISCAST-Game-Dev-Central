# Release Management — BISCAST Game Dev Central

## 1. Purpose
Control how code, database changes, and configuration move into production.

## 2. Versioning
Use Semantic Versioning where practical:
- MAJOR: incompatible changes.
- MINOR: backward-compatible functionality.
- PATCH: backward-compatible fixes.

For early development, use clearly labeled pre-release versions (for example `0.3.0-beta.1`). Do not imply a release is stable when it has not passed the production gate.

## 3. Release types
- Development snapshot.
- Staging candidate.
- Production release.
- Emergency security release.

## 4. Release prerequisites
- Approved pull requests.
- CI checks passing.
- Dependency and secret scans reviewed.
- Security findings triaged.
- Database migrations reviewed and staged.
- Backup/recovery plan confirmed for risky changes.
- Changelog prepared.
- Production readiness checklist approved.
- Institutional approvals obtained where required.

## 5. Change categories
Classify each change:
- Feature.
- Bug fix.
- Security fix.
- Database migration.
- Configuration/infrastructure.
- Content/policy change.

Identify affected routes, tables, RLS policies, storage buckets, and external integrations.

## 6. Release procedure
1. Freeze release scope.
2. Create release branch or tag according to repository policy.
3. Run full required CI checks.
4. Review security and dependency reports.
5. Test migrations in staging.
6. Obtain release approval.
7. Deploy using `DEPLOYMENT_RUNBOOK.md`.
8. Run smoke tests.
9. Monitor and record outcome.
10. Publish release notes if appropriate.

## 7. Emergency releases
For an active exploit or serious production defect:
- Contain exposure first where needed.
- Create a minimal patch.
- Run targeted and regression tests.
- Obtain expedited authorized review.
- Deploy and verify.
- Rotate credentials if compromised.
- Complete post-incident review.

## 8. Rollback policy
Frontend rollback may use the last known-good deployment. Database rollback requires separate analysis; destructive migrations may require a forward fix or restore. Never automatically reverse data-destructive changes without an approved recovery plan.

## 9. Changelog template
```md
## [Version] — YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Security
- ...

### Database
- Migration IDs:
- RLS/policy changes:

### Operations
- Deployment:
- Known issues:
```

## 10. Release record
Record version, commit SHA, approver, CI run, migration version, deployment timestamp, smoke test result, known issues, and rollback reference.

## 11. Release gate
A release is complete only when:
- Deployment succeeded.
- Smoke tests passed.
- Monitoring shows no unresolved release-related critical issue.
- Release record and changelog are updated.
