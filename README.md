# BISCAST Game Dev Central

**Descriptor:** BSEMC · Game Development Community  
**Current Milestone:** Phases 0–2 Frontend Showcase Prototype (Google AI Studio handoff baseline for Antigravity Phases 3–8)

BISCAST Game Dev Central is a public-facing digital showcase and long-term archive for student-developed games, capstone projects, competitions, alumni portfolios, and community recognition produced by BISCAST BSEMC Game Development students and alumni.

> **Prototype Boundary Notice:** Phases 0–2 run entirely on clearly labeled local sample JSON data (`is_sample: true`) with no production backend, no live authentication, no database persistence, and no secrets. Supabase Auth, PostgreSQL schema migrations, Row Level Security (RLS), and Cloudflare Pages production deployment are assigned to Antigravity (Phases 3–8).

---

## Locked Technology Stack

- **Frontend:** React 19 + TypeScript (strict) + Vite 6 + Tailwind CSS v4
- **Routing:** `react-router-dom` v7
- **Icons:** `lucide-react`
- **External Media Contracts:** itch.io (playable builds/pages), YouTube (lazy-loaded `youtube-nocookie.com` trailer embeds)
- **Future Backend (Phases 3–8):** Supabase Auth + PostgreSQL + RLS (no Firebase/Firestore)
- **Future Hosting:** Cloudflare Pages (static Vite SPA build)

---

## Local Setup & Commands

### Prerequisites
- Node.js 20+ (verified on Node v22)
- npm 10+

### Install & Run
```bash
npm install
npm run dev
```
The development server runs at `http://localhost:3000`.

### Quality Checks & Build
```bash
# TypeScript strict type-check
npm run lint

# Pure logic unit tests (URL safety, filters, validation, moderation, voting)
npm test

# Production static build (output in dist/)
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables
See `.env.example` for placeholder frontend variables prepared for Phase 3 Supabase integration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). **Never** place a Supabase `service_role` key in any `VITE_` variable or browser bundle.

---

## Route Inventory

| Route | Screen | Scope |
|---|---|---|
| `/` | Home | Public showcase, hero spotlight, featured/latest sample games, events, Hall of Fame preview |
| `/games` | Explore Games | Live search, multi-facet filters (year, semester, genre, engine, type), sort, pagination, `?state=loading\|error` QA hooks |
| `/games/:slug` | Game Detail | Cover art, synopsis, safe itch.io link, lazy YouTube embed, screenshot lightbox, team credits, capstone link, report modal |
| `/archives` | Academic Year Archive | Published games grouped chronologically by Academic Year & Semester |
| `/categories` | Categories | Active genres with sample counts and deep links to Explore filters |
| `/events` | Announcements & Events | Published community notices + competitions/game jams with schedules and rules |
| `/capstones` | Capstone Projects | Dedicated searchable/filterable capstone archive |
| `/capstones/:slug` | Capstone Detail | Abstract, team credits, consent-gated adviser field, tech stack, public docs, linked playable game |
| `/alumni` | Alumni Archive | Graduated cohorts filtered by batch with preserved credits |
| `/hall-of-fame` | Hall of Fame | Historical awards separating Juried Awards from Community Choice popularity |
| `/developers/:username` | Developer Profile | Public/private visibility-aware developer portfolio, credited games, capstones, awards |
| `/dashboard` | Student Dashboard *(Prototype)* | Local sample student switcher, profile/visibility editor, submission status & moderator notes, open voting links |
| `/submit` | Submit a Game *(Prototype)* | Validated submission form with multi-member credits, URL checks, rights confirmation (`pending_review`) |
| `/admin` | Admin Moderation *(Prototype)* | Pending review queue, moderation checklist, approve/request changes/reject, notices, voting visibility toggle, role matrix, audit log |
| `/voting` | Voting Interface *(Prototype)* | Open ballot casting (local single-vote check), hidden-during-voting policy, archived aggregate results |
| `/about` | About & Policy | Platform principles, Phase 0–2 boundaries, QA state preview links, unresolved `TBD` decisions log |
| `*` | 404 Not Found | Accessible fallback route |

---

## Component & Module Architecture

- `src/types/models.ts` — Typed data contracts mapped 1:1 to `04_DATA_MODEL.md` (`Profile`, `UserRoleRecord`, `Category`, `Game`, `GameMember`, `Announcement`, `Competition`, `CompetitionEntry`, `Vote`, `Award`, `CapstoneProject`, `CapstoneMember`, `AuditLog`).
- `src/lib/` — Pure, framework-free logic covered by `node:test` unit tests:
  - `urlSafety.ts` — Rejects unsafe URL schemes (`javascript:`, `data:`), enforces `https://`, validates itch.io and privacy-enhanced YouTube URLs.
  - `filters.ts` — Public-only publication filter, search/multi-facet filter/sort, academic-period archive grouping, capstone filtering, slug generator.
  - `validation.ts` — Submission form validation matching `07_SUBMISSIONS_MODERATION_VOTING.md`.
  - `workflows.ts` — Pure moderation state transitions (`applyModerationDecision`) and prototype voting rules (`evaluateMockVote`).
  - `formatters.ts` — Human-readable status/category/role labels and locale-safe UTC date formatting.
- `src/data/` — `media.ts` (bundled sample artwork imports) and `mockDataset.ts` (clearly labeled sample dataset + `UNRESOLVED_DECISIONS_TBD`).
- `src/context/PrototypeStoreContext.tsx` — Local browser-session state store connecting submissions, moderation, profile edits, announcements, reports, and voting prototypes end-to-end.
- `src/components/layout/` — `BrandMark.tsx`, `Header.tsx` (3-zone responsive nav + mobile drawer), `Footer.tsx`, `PageShell.tsx`.
- `src/components/ui/` — `Button.tsx`, `Dialog.tsx`, `GameCard.tsx`, `MediaImage.tsx` (resilient fallback artwork), `States.tsx` (loading/empty/error/prototype notices), `StatusText.tsx`, `Tabs.tsx`, `YouTubeLazyEmbed.tsx`.

---

## Documentation & Handoff

- Design tokens and logo swap instructions: `docs/DESIGN_TOKENS.md`
- Phase 2 Antigravity handoff report: `HANDOFF_REPORT.md`
- Project specification package and engineering runbooks: `docs/*.md`
