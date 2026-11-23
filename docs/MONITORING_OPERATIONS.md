# Monitoring and Operations — BISCAST Game Dev Central

## 1. Purpose
Maintain availability, security, performance, and data integrity after production launch.

## 2. Monitoring areas
### Frontend / Cloudflare Pages
- Deployment failures.
- HTTP error rates.
- Client-side JavaScript errors.
- Core page performance.
- Certificate, DNS, and routing issues.

### Supabase
- Authentication failures and unusual signup patterns.
- Database errors and slow queries.
- API error rates.
- Storage usage and upload failures.
- Database size, egress, and plan quotas.
- Security Advisor findings.
- Project status and inactivity/pause notices.

### Application events
- Submission creation and review transitions.
- Role changes.
- Voting event open/close.
- Failed authorization attempts where safely observable.
- Administrative changes.

## 3. Logging rules
- Never log passwords, tokens, service-role keys, or full authentication payloads.
- Avoid logging student email addresses unless strictly necessary.
- Use correlation/request IDs where available.
- Restrict log access.
- Define log retention with the institution.
- Ensure errors do not reveal private record contents.

## 4. Alerting
Create alerts or review procedures for:
- Production availability failure.
- Repeated authentication abuse.
- Unexpected administrator/role changes.
- Database/storage quota approaching limits.
- Backup failure.
- Security Advisor critical finding.
- Abnormal voting activity.
- Repeated failed deployments.

Set thresholds based on measured baseline and provider capabilities; do not invent guaranteed alert coverage.

## 5. Operations schedule
### Daily / routine
- Review availability and critical error alerts.
- Check active incidents.

### Weekly
- Review security alerts and quota usage.
- Review failed deployments and unusual authentication activity.

### Monthly
- Update dependencies through reviewed pull requests.
- Review user/admin access.
- Review database performance and storage growth.
- Confirm backup completion.

### Quarterly
- Restore-test backups.
- Review threat model and RLS coverage.
- Conduct vulnerability assessment.
- Review incident contacts and recovery procedures.

### Every release
- Run CI and security checks.
- Review migrations.
- Deploy with approval.
- Run smoke tests.
- Monitor post-release errors.

## 6. Supabase Free plan considerations
Free projects may pause after inactivity under provider policy. Check current official terms and project notifications. Do not rely on artificial traffic as a guaranteed prevention mechanism. Decide whether the expected availability requirement is compatible with the selected plan.

## 7. Operational dashboard
Maintain a simple internal status record:
- Current production version.
- Last successful deployment.
- Last successful backup.
- Last restore test.
- Open security findings.
- Current quota/usage status.
- Active incidents.
- Next maintenance date.

## References
- Supabase production checklist: https://supabase.com/docs/guides/security/production-checklist
- Cloudflare Pages: https://developers.cloudflare.com/pages/
