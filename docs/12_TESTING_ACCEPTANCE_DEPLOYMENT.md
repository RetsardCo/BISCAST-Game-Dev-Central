# Testing, Acceptance Criteria, and Deployment

## 1. Testing layers
- Unit tests for utilities, validation, and state logic.
- Component tests for forms, cards, filters, and dashboards.
- Integration tests for Supabase workflows.
- RLS tests using anonymous, student, moderator, and Super Admin identities.
- End-to-end tests for registration, submission, moderation, and voting.
- Responsive and accessibility checks.
- Build and deployment smoke tests.

## 2. Minimum acceptance criteria
### Phase 1–2 frontend
- All primary routes render.
- Navigation and filters work with mock data.
- Loading, empty, error, and not-found states exist.
- Mobile/tablet/desktop layouts are usable.
- No broken images or console errors in the agreed test path.
- Build succeeds.
- No real credentials or production backend dependency.

### Authentication
- Only verified eligible email accounts can obtain student permissions.
- Domain-only string validation is insufficient.
- Suspended accounts cannot perform student actions.
- Role escalation is impossible from client requests.

### Submissions
- New game is private/pending until approved.
- Submitter can view own status.
- Other students cannot edit it.
- Moderator decision is auditable.
- Only published records appear publicly.

### Voting
- Ineligible users cannot vote.
- Duplicate votes are rejected by the database.
- Closed events reject votes.
- Public cannot read voter identities.
- Results match stored valid votes.

### Archives
- Capstone entries have required metadata and moderation.
- Alumni transition preserves approved contributions.
- Student-only permissions are removed according to policy.
- Hall of Fame records retain historical award data.

## 3. Deployment
- GitHub main branch protected.
- Pull requests require build and tests.
- Cloudflare Pages connected to approved repository/branch.
- Preview deployments use safe environment configuration.
- Production environment variables set in Cloudflare dashboard.
- Supabase migrations applied through controlled release steps.
- RLS policies reviewed before production.
- Domain, HTTPS, redirects, and SPA fallback verified.

## 4. Launch checklist
- Institutional branding permission confirmed.
- Astean verification approach tested.
- Admin and moderator accounts established securely.
- Privacy/content policy approved.
- Backup and restore tested.
- Security/RLS test suite passes.
- Contact/report process available.
- No demo/mock records remain in production.
- Monitoring and incident owner assigned.
