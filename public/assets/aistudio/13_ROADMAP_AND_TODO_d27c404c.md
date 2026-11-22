# Roadmap and Master To-Do

## Phase 0 — Requirements and project foundation (Google AI Studio)
- [ ] Read all project documents.
- [ ] Confirm app structure and routing.
- [ ] Establish design tokens and component conventions.
- [ ] Create mock data contracts.
- [ ] Record unresolved decisions; do not invent institutional policy.
- [ ] Create README and development instructions.

**Gate:** architecture and scope are understood; no backend implementation.

## Phase 1 — Design system and website foundation (Google AI Studio)
- [ ] Implement brand colors, typography, spacing, buttons, forms, cards.
- [ ] Add responsive navigation and footer.
- [ ] Add public page shell and route structure.
- [ ] Use supplied logo asset.
- [ ] Check mobile, tablet, desktop.
- [ ] Add accessible states and keyboard behavior.

**Gate:** responsive foundation and reusable components accepted.

## Phase 2 — Frontend showcase prototype (Google AI Studio)
- [ ] Home page and featured games.
- [ ] Game library with search/filter/sort using mock data.
- [ ] Game detail pages.
- [ ] Academic year/semester archives.
- [ ] Category pages.
- [ ] Announcement and event pages.
- [ ] Prototype developer profile and dashboard.
- [ ] Prototype submission form and moderation queue.
- [ ] Prototype voting, capstone, alumni, Hall of Fame screens.
- [ ] Create mock JSON datasets and document data contracts.
- [ ] Run build and basic UI tests.
- [ ] Commit and prepare handoff report.

**Gate:** working frontend prototype, no production backend, no secrets. Handoff to Antigravity.

## Handoff — AI Studio to Antigravity
- [ ] Push/sync to GitHub.
- [ ] Tag Phase 2 baseline.
- [ ] Ensure clean working tree.
- [ ] Document routes, components, design tokens, mock data.
- [ ] List known defects and unresolved decisions.
- [ ] Verify build instructions.
- [ ] Antigravity audits before modifying architecture.

## Phase 3 — Supabase foundation, authentication, profiles (Antigravity)
- [ ] Create development Supabase project.
- [ ] Confirm Astean provider and verification approach.
- [ ] Implement migrations and typed data access.
- [ ] Implement profiles and roles.
- [ ] Implement RLS and automated policy tests.
- [ ] Implement sign-in, sign-up, recovery, sign-out.
- [ ] Implement developer profile editing and visibility.
- [ ] Test role escalation and account recovery.

**Gate:** authentication and RLS tests pass.

## Phase 4 — Game submissions and moderation (Antigravity)
- [ ] Implement game and team schema.
- [ ] Implement student submission workflow.
- [ ] Implement upload/URL validation.
- [ ] Implement moderation queue and review actions.
- [ ] Implement status history/audit logs.
- [ ] Ensure public reads expose published games only.
- [ ] Test ownership and authorization.

**Gate:** end-to-end submit/review/publish tests pass.

## Phase 5 — Announcements, competitions, game jams (Antigravity)
- [ ] Implement announcement CRUD and publishing.
- [ ] Implement event/competition records.
- [ ] Implement game jam rules, dates, entries, and archive.
- [ ] Implement public pages and admin controls.
- [ ] Test date/timezone behavior and permissions.

## Phase 6 — Voting, rankings, awards (Antigravity)
- [ ] Approve written voting policy.
- [ ] Implement event eligibility and entry list.
- [ ] Implement trusted vote submission.
- [ ] Add database uniqueness and closed-event enforcement.
- [ ] Implement aggregate results and visibility settings.
- [ ] Implement awards and historical records.
- [ ] Test duplicate, ineligible, late, and tampered requests.

**Gate:** voting security tests pass before real election.

## Phase 7 — Capstone archive, Alumni Archive, Hall of Fame (Antigravity)
- [ ] Implement capstone schema and team credits.
- [ ] Implement capstone submission/moderation.
- [ ] Implement capstone search and detail pages.
- [ ] Define and implement graduation verification workflow.
- [ ] Implement alumni account transition.
- [ ] Preserve public profiles and project credits according to consent.
- [ ] Disable student-only privileges on alumni transition.
- [ ] Implement Hall of Fame and award history.
- [ ] Test archival and retention behavior.

**Gate:** archive, privacy, and role-transition tests pass.

## Phase 8 — Security, QA, optimization, deployment (Antigravity)
- [ ] Full RLS/security review.
- [ ] Accessibility audit.
- [ ] Responsive and browser testing.
- [ ] Performance and image optimization.
- [ ] Backup/restore rehearsal.
- [ ] Production Supabase setup and migrations.
- [ ] Cloudflare Pages production deployment.
- [ ] Domain/HTTPS configuration.
- [ ] Monitoring and incident runbook.
- [ ] Remove test accounts and demo content.
- [ ] Launch approval.

**Gate:** all release criteria in `12_TESTING_ACCEPTANCE_DEPLOYMENT.md` pass.
