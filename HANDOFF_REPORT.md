# Handoff Report — Google AI Studio (Phases 0–2) → Antigravity (Phases 3–8)

## Repository
- **Project:** BISCAST Game Dev Central (`BSEMC · Game Development Community`)
- **Milestone:** Phase 0–2 Frontend Showcase Prototype Baseline
- **GitHub Sync / Tag:** Prepared in workspace; verify GitHub sync and tag `phase-2-baseline` via AI Studio GitHub integration before Antigravity begins Phase 3.

## Build & Automated Checks
- **Typecheck (`npm run lint` / `tsc --noEmit`):** Passed (0 errors)
- **Unit Tests (`npm test` / `tsx --test src/lib/core.test.ts`):** Passed (5/5 tests covering URL safety, public publication filtering & search, submission validation, moderation transitions & audit logging, and voting eligibility/duplicate/closed rules)
- **Production Build (`npm run build` / `vite build`):** Passed cleanly
- **Browser QA (Headless Chromium via `playwright-cli`):** Verified desktop (`1440×900`) and mobile (`390×844`) layouts with 0 horizontal overflow, 0 broken images, and 0 console errors across all primary routes and interactive journeys.

## Completed Screens (Phase 2)
- `/` — Home (split editorial hero, sample catalog summary, featured & latest published games, announcements/events, Hall of Fame spotlight, submission CTA)
- `/games` — Explore Games (live search, academic year/semester/genre/engine/project-type filters, sort, pagination, loading/empty/error states)
- `/games/:slug` — Game Detail (cover artwork, synopsis, safe itch.io link, lazy-loaded `youtube-nocookie.com` trailer embed, screenshot lightbox, team credits, linked capstone, report-content dialog)
- `/archives` — Academic Year & Semester Archive
- `/categories` — Categories & Genre Explorer
- `/events` — Announcements, Competitions & Game Jams
- `/capstones` & `/capstones/:slug` — Capstone Projects Archive & Detail
- `/alumni` — Alumni Archive by graduation batch
- `/hall-of-fame` — Hall of Fame & Award History (Juried Awards vs Community Choice distinction)
- `/developers/:username` — Developer Profile (visibility-aware public/private separation)
- `/dashboard` — Student Dashboard Prototype
- `/submit` — Submit a Game Form Prototype
- `/admin` — Admin Moderation Dashboard Prototype (queue, checklist, approve/request changes/reject, catalog overview, announcements/voting controls, role matrix, audit log)
- `/voting` — Voting Interface Prototype (open ballot + hidden-during-voting policy + closed aggregate results)
- `/about` — About, Scope, QA state preview links & `TBD` decision log
- `*` — 404 Not Found

## Components & Data Contracts
- **Layout:** `BrandMark`, `Header`, `Footer`, `PageShell`
- **UI Primitives:** `Button` / `ButtonLink`, `Dialog`, `GameCard`, `MediaImage`, `StatusText`, `Tabs`, `YouTubeLazyEmbed`, `LoadingSkeletonGrid`, `EmptyState`, `ErrorState`, `PrototypeNotice`
- **Data Contracts (`src/types/models.ts`):** Typed models aligned with `04_DATA_MODEL.md` (`Profile`, `UserRoleRecord`, `Category`, `Game`, `GameMember`, `Announcement`, `Competition`, `CompetitionEntry`, `Vote`, `Award`, `CapstoneProject`, `CapstoneMember`, `AuditLog`, `GameFilterQuery`, `GameSubmissionDraft`).
- **Mock Store (`src/context/PrototypeStoreContext.tsx`):** Clearly labeled local browser-memory prototype layer (`isPrototypeMode: true`) to be replaced with typed Supabase repositories in Phases 3–7.

## Known Issues & Prototype Limitations
1. **No persistence across page refreshes:** Submissions, moderation decisions, profile edits, reports, and prototype votes live in React memory (`PrototypeStoreContext`) and reset on full page reload. This is intentional for Phase 2.
2. **Owner-supplied logo asset pending:** `BrandMark.tsx` uses a neutral `BG` monogram placeholder until the project owner supplies the approved logo file (`docs/DESIGN_TOKENS.md`).
3. **Sample artwork:** Five locally bundled sample key-art images (`src/assets/images/sample_*.jpg`) are used solely for clearly labeled sample entries and must be removed/replaced before production launch.
4. **No live authentication or authorization:** Student Dashboard, Submit Game, Admin Moderation, and Voting routes are navigable for prototype inspection; UI visibility is not security.

## Security Notes for Antigravity
- Zero Firebase/Firestore dependencies or configuration exist in this project.
- Zero production secrets, API keys, or service-role keys exist in source or `.env.example`.
- All user-supplied external links are validated against `https://` (`src/lib/urlSafety.ts`), rejecting `javascript:` and `data:` schemes; external links render with `target="_blank" rel="noopener noreferrer"`.
- YouTube embeds use `https://www.youtube-nocookie.com/embed/...` and load only upon user click (zero autoplay).
- No raw `dangerouslySetInnerHTML` or arbitrary HTML rendering is used anywhere.
- **Required in Phases 3–6:** Enable PostgreSQL RLS on every exposed table, enforce `pending_review` defaults and moderation transitions in trusted DB functions, prevent client-supplied role/status escalation, and enforce `UNIQUE (competition_id, voter_profile_id)` plus server-side timestamp checks for voting.

## Unresolved Decisions (`TBD` — Confirm Before Production)
- **TBD-01:** Confirm `@astean.biscast.edu.ph` email provider (Google Workspace domain-restricted OAuth vs verified email OTP/SMTP).
- **TBD-02:** Confirm institutional permission for BISCAST name/logo usage and supply official logo asset.
- **TBD-03:** Define authorized moderators, Super Admin appointment workflow, and Super Admin recovery process.
- **TBD-04:** Approve written voting policy (eligibility, alumni/moderator voting, self-voting, one-vote scope, tie/dispute handling).
- **TBD-05:** Define graduation verification evidence and alumni alternate-email account recovery flow.
- **TBD-06:** Approve privacy policy, data retention periods, consent declarations, and takedown SLA.

## Recommended Next Steps (Antigravity — Phase 3 Audit & Implementation)
1. Audit dependencies, `src/types/models.ts`, `src/lib/urlSafety.ts`, and `PrototypeStoreContext.tsx`.
2. Confirm `TBD-01` (Astean email provider) before provisioning development Supabase Auth.
3. Map `src/types/models.ts` to versioned SQL migrations (`profiles`, `user_roles`, `games`, `game_members`, `categories`, `announcements`, `competitions`, `competition_entries`, `votes`, `awards`, `capstone_projects`, `capstone_members`, `audit_logs`) with strict RLS and automated policy tests.
4. Replace `PrototypeStoreContext` hooks with typed Supabase data-access services phase-by-phase (Phases 3–8), removing all `is_sample` mock fixtures before production deployment to Cloudflare Pages.
