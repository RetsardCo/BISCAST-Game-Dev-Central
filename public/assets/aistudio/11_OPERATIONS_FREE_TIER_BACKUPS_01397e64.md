# Operations, Free-Tier Limits, and Backups

## 1. Free-tier strategy
Use Supabase Free initially, but treat quotas, limits, and terms as changeable. Confirm current pricing and limits at implementation and before launch.

Likely cost drivers:
- Database size and egress.
- Storage usage and image delivery.
- Monthly active users.
- Email authentication volume.
- Build/deployment usage.
- Third-party provider changes.

Keep videos and game builds on YouTube and itch.io. Optimize images and avoid unnecessary storage.

## 2. Supabase inactivity pause
Supabase Free projects may be paused after a period of inactivity (commonly described as seven days). Confirm current official policy at setup because terms can change.

A paused backend can make authentication and database-backed features unavailable while the static frontend remains hosted. Data is not necessarily deleted merely because a project is paused, but recovery behavior and retention must be checked against current Supabase documentation.

Do not promise uninterrupted availability on the Free plan.

## 3. Monitoring
- Check Supabase project status and usage.
- Monitor Cloudflare deployment status.
- Monitor authentication and database errors.
- Review quota warnings.
- Test restore/recovery periodically.
- Keep an administrator contact for provider alerts.

Do not rely on artificial scheduled traffic as a guaranteed way to prevent pausing or as a workaround for provider policy. If availability becomes important, evaluate a paid plan or a documented compliant operating approach.

## 4. Backups
- Keep SQL migrations in Git.
- Export database data on a defined schedule using approved tools.
- Store backups in a private, access-controlled location.
- Never commit personal data dumps or secrets to a public repository.
- Document restore steps and test them before launch.
- Back up storage metadata and ensure media can be recovered or relinked.

## 5. Recovery runbook
1. Confirm provider status and whether the project is paused or degraded.
2. Notify administrators.
3. Restore/resume using current provider-supported procedures.
4. Verify authentication, public reads, submissions, moderation, and voting.
5. Review logs for failed operations during the outage.
6. Record incident and prevention actions.

## 6. Cost escalation triggers
Reassess paid hosting when:
- Free quotas are repeatedly approached.
- Pause behavior harms expected service.
- Email limits prevent reliable onboarding.
- Backup/recovery guarantees are insufficient.
- Storage or egress requirements grow.
