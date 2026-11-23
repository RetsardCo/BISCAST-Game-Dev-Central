# Production Readiness Review — BISCAST Game Dev Central

**Release:** TBD  
**Commit:** TBD  
**Review date:** TBD  
**Review owner:** TBD  
**Decision:** NOT REVIEWED

This checklist is a release gate. Mark each item PASS, FAIL, NOT APPLICABLE with reason, or NOT VERIFIED. Do not mark items complete without evidence.

## 1. Governance and approvals
- [ ] Institutional permission for BISCAST branding confirmed.
- [ ] Privacy notice and content policy reviewed by responsible institutional personnel.
- [ ] Astean email verification method confirmed and tested.
- [ ] Moderator/Super Admin appointment process approved.
- [ ] Voting eligibility and election rules approved.
- [ ] Capstone publication permission and confidentiality checks defined.
- [ ] Alumni transition and account recovery process approved.
- [ ] Data retention and incident response responsibilities confirmed.

## 2. Security
- [ ] Threat model reviewed and current.
- [ ] OWASP ASVS verification scope documented.
- [ ] RLS enabled and tested on all exposed tables.
- [ ] Storage policies tested.
- [ ] No role escalation or self-approval path.
- [ ] Authentication, recovery, and privileged MFA checked.
- [ ] Voting uniqueness and eligibility enforced in database.
- [ ] XSS, injection, IDOR/BOLA, upload, and URL tests pass.
- [ ] Security headers and CSP reviewed.
- [ ] CORS origins are restricted to intended origins.
- [ ] Secret scan and dependency scan reviewed.
- [ ] No unresolved critical/high security finding.
- [ ] Service-role key absent from frontend assets and repository.

## 3. Application quality
- [ ] Typecheck, lint, unit, integration, and E2E tests pass.
- [ ] All critical user journeys pass.
- [ ] Loading, empty, error, and not-found states work.
- [ ] Responsive tests pass.
- [ ] Accessibility review completed.
- [ ] Performance reviewed on representative devices/networks.
- [ ] External links and embeds have fallbacks.
- [ ] No sample/demo records remain in production.

## 4. Database and data
- [ ] Production schema matches reviewed migrations.
- [ ] Constraints and indexes reviewed.
- [ ] Migration tested in staging.
- [ ] Backup exists and restore has been tested.
- [ ] RPO/RTO targets approved and achievable.
- [ ] No unnecessary personal data is collected.
- [ ] Public/private field separation verified.

## 5. Infrastructure
- [ ] Production Supabase project settings reviewed.
- [ ] Email provider and templates tested.
- [ ] SSL/TLS configuration checked.
- [ ] Network restrictions evaluated and applied where feasible.
- [ ] Cloudflare Pages production environment configured.
- [ ] HTTPS, DNS, SPA fallback, and redirects tested.
- [ ] Production and staging secrets are separate.
- [ ] Monitoring and alerts are active.

## 6. Operations
- [ ] Deployment runbook approved.
- [ ] Rollback/forward-fix plan documented.
- [ ] Incident response contacts and escalation path known.
- [ ] Backup/restore runbook tested.
- [ ] Provider free-tier limitations and pause behavior reviewed.
- [ ] Operational owner assigned.
- [ ] Post-launch review scheduled.

## 7. Sign-off
| Role | Name | Decision | Date |
|---|---|---|---|
| Project owner | TBD | Pending | TBD |
| Technical reviewer | TBD | Pending | TBD |
| Institutional/privacy reviewer | TBD | Pending | TBD |

## Release decision
- [ ] APPROVED FOR PRODUCTION
- [ ] NOT APPROVED FOR PRODUCTION

Any critical/high unresolved security issue, untested RLS policy, unverified backup, or missing required institutional approval blocks release.
