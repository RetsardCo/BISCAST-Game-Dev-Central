# Backup and Disaster Recovery — BISCAST Game Dev Central

## 1. Objectives
Preserve student contributions, capstone records, profiles, awards, competition records, and operational configuration.

A backup is not considered reliable until restoration has been tested.

## 2. Data inventory
Back up or make reproducible:
- PostgreSQL records.
- Schema migrations and database functions in Git.
- Storage objects and metadata, if used.
- Application source and build configuration.
- Environment configuration inventory (not secret values in Git).
- Operational and release documentation.
- Relevant audit records according to approved retention.

External itch.io and YouTube content is not controlled by this platform. Preserve canonical URLs and attribution; do not assume external media will remain available forever.

## 3. RPO and RTO
These values must be approved by the project owner and institution.

| Metric | Definition | Target |
|---|---|---|
| RPO | Maximum tolerable data loss measured in time | TBD |
| RTO | Maximum tolerable service restoration time | TBD |

Confirm what backup/export capabilities are included in the selected Supabase plan. Do not assume free-tier point-in-time recovery or paid-plan guarantees.

## 4. Backup strategy
- Keep schema migrations in Git.
- Export database data using provider-supported tools on an approved schedule.
- Store backups in a private, access-controlled location separate from the production project.
- Encrypt backup files at rest and in transit where supported.
- Restrict backup access to designated operators.
- Never commit production data dumps or credentials to a public repository.
- Include storage objects in the backup plan if Supabase Storage is used.
- Record backup time, source project, schema version, and integrity result.

## 5. Restore test
At an agreed interval:
1. Select a recent backup.
2. Restore to an isolated recovery project.
3. Apply or verify schema migrations.
4. Validate record counts and key relationships.
5. Verify profiles, games, teams, capstones, awards, and competition records.
6. Verify storage objects and links.
7. Run application smoke tests.
8. Record actual recovery duration and data gap.
9. Update RPO/RTO feasibility.

## 6. Disaster scenarios
- Accidental deletion or destructive migration.
- Compromised database credentials.
- Supabase project pause or service outage.
- Storage object loss.
- GitHub repository compromise.
- Cloudflare deployment failure.
- Loss of primary administrator access.

## 7. Recovery runbook
1. Declare incident and assign coordinator.
2. Stop or limit writes if data integrity is at risk.
3. Identify recovery point and affected services.
4. Restore to isolated environment.
5. Validate schema, records, relationships, RLS, and storage.
6. Obtain approval before production cutover.
7. Restore service and run smoke tests.
8. Rotate compromised credentials if relevant.
9. Document data loss, downtime, and follow-up actions.

## 8. Provider limitations
Check current Supabase pricing, backup, pause, and recovery documentation before launch and periodically thereafter. Free-tier behavior and entitlements can change. A paused project is not a substitute for a backup.

## References
- Supabase backups: https://supabase.com/docs/guides/platform/backups
- Supabase production checklist: https://supabase.com/docs/guides/security/production-checklist
