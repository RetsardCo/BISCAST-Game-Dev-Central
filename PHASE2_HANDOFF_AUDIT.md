# BISCAST Game Dev Central — Phase 2 Handoff Technical Audit

**Audit Date:** November 23, 2026  
**Auditor:** Antigravity (Implementation & Production-Hardening Agent)  
**Outgoing Contributor:** Google AI Studio (Phases 0–2)  
**Repository:** `https://github.com/RetsardCo/BISCAST-Game-Dev-Central`  
**Current Baseline Commit:** `df751e02a129e70a3712ad3dfa995322ed064891` (`main`)  
**Workspace Path:** `d:\_Projects_\Websites\BISCAST Game Dev Central`  
**Operating Environment:** Windows 11 · PowerShell · Node.js v26.13.0 · npm 11.20.0  

---

## 1. Executive Summary

This technical audit represents an exhaustive, code-level inspection of the Phase 0–2 frontend showcase prototype of **BISCAST Game Dev Central** (`BSEMC · Game Development Community`) delivered by Google AI Studio. The audit was conducted in strict accordance with the project roadmap (`Docs/13_ROADMAP_AND_TODO.md`), agent rules (`Docs/14_AGENT_RULES_AND_CODING_STANDARDS.md`), the Antigravity Master Prompt (`Docs/ANTIGRAVITY_MASTER_PROMPT.md`), and the core engineering runbooks.

### 1.1 Scope of the Audit
1. **Repository & Version Control:** Git history, branch topology, baseline tag verification, and working tree cleanliness.
2. **Build & Automated Verification:** Independent local execution of TypeScript compilation (`tsc --noEmit`), unit test runner (`node:test` via `tsx`), and Vite production bundler (`vite build`).
3. **Architecture & Routing:** Review of all 16 application routes plus 404 wildcard, component architecture, state management, and edge-case handling.
4. **Security & Secrets Hygiene:** Verification of zero Firebase/Firestore dependencies, scan for exposed production credentials or service-role keys, environment variable evaluation (`.env.example`), URL validation logic, and media embed protections.
5. **Data Contract & Separation:** Parity between frontend TypeScript models (`src/types/models.ts`) and database schema specifications (`Docs/04_DATA_MODEL.md`), as well as prototype mock delineation.
6. **Deep Forensic Findings & Defect Register:** Comprehensive catalog of technical debt, latent bugs, accessibility gaps, deployment configuration oversights, and governance blockers.

### 1.2 Summary of Key Findings
- **Strengths:**
  - **Type Safety & Build Cleanliness:** The application compiles with zero TypeScript errors (`tsc --noEmit`). The production bundle succeeds in 9.35s without syntax or bundling errors.
  - **Stack Discipline:** The project adheres strictly to the locked stack: React 19.1.0, Vite 6.3.5/6.4.6, Tailwind CSS v4.1.7, React Router v7.6.1, and Lucide React. **Zero Firebase or Firestore packages exist.**
  - **No Credential Leaks:** Thorough pattern analysis confirmed **zero production credentials, private keys, or Supabase service-role keys** are present in code or git history.
  - **Strict Mock Boundary:** All sample data is explicitly marked with `is_sample: true` and managed through `PrototypeStoreContext` with `isPrototypeMode: true`. Mutations are in-memory and clearly prefixed with `Mock`.
  - **Comprehensive Route Coverage:** All 16 planned routes are fully functional with appropriate loading, empty, and populated UI states.

- **Forensic Vulnerabilities & Architectural Deficiencies Discovered:**
  1. **Dead Code in URL Validation / Domain Bypass (DEF-07 - High):** `isItchIoUrl` in `src/lib/urlSafety.ts:35` correctly validates `itch.io` hosts, but is **never invoked** by `validateGameSubmission` in `src/lib/validation.ts:44`. The submission form only checks `isStrictHttpsUrl`, allowing any arbitrary domain (e.g., phishing links) to be submitted as an itch.io link. Furthermore, `AdminModerationPage.tsx:22` lists checking the itch link in its review checklist, but the moderation queue never renders or links `game.itch_url`. Unit tests passed because they only asserted against an invalid `javascript:` scheme, masking this gap.
  2. **Protocol-Relative & Slash-Backslash URL Bypass (DEF-08 - High):** `isSafeHttpUrl` in `src/lib/urlSafety.ts:14` checks `if (trimmed.startsWith('/')) return true;`. This matches protocol-relative URLs (`//evil.com/phishing`) and forward-slash backslash paths (`/\evil.com`), both normalized by browsers and the WHATWG URL standard to `https://evil.com/`. This allows attacker-controlled URLs to bypass HTTPS and hostname validation across navigation links and enables arbitrary external image injection via `draft.cover_image_url` in `src/lib/validation.ts:48`.
  3. **33 Untracked Documentation & Operational Runbooks (DEF-09 - Medium):** While Google AI Studio committed 19 documentation files with content hashes under `public/assets/aistudio/`, the entire canonical `Docs/` directory (containing 19 clean-named specifications and 14 critical production runbooks covering CI/CD, disaster recovery, threat modeling, incident response, privacy governance, and Antigravity instructions) was never committed to Git.
  4. **Information Disclosure via Public Static Assets (DEF-10 - Medium):** 19 internal markdown specification files and AI prompts in `public/assets/aistudio/` are automatically copied by Vite into `dist/assets/aistudio/`, publicly exposing system prompts, architectural plans, and internal risk registers over HTTP.
  5. **Missing Cloudflare Pages SPA Rewrite (DEF-11 - Medium):** `public/_redirects` is missing. Direct navigation or refreshing any route other than `/` (e.g., `/games`, `/admin`) on Cloudflare Pages will return an HTTP 404 error.
  6. **Modal Dialog Accessibility Violations (DEF-12 - Medium):** `src/components/ui/Dialog.tsx` lacks focus trapping, initial focus placement, focus restoration on close, and background body scroll locking.
  7. **Missing Favicon & Vite Host Header Bypass (DEF-13 - Low):** No favicon is declared or provided, causing 404 console errors. `vite.config.ts:10,16` specifies `allowedHosts: true`, disabling Vite's Host Header validation / DNS rebinding protection.
  8. **Missing Baseline Tag (DEF-01 - High):** Git tag `phase-2-baseline` was not created or pushed to `origin/main`.
  9. **Uncommitted Lockfile (DEF-02 - Medium):** `package-lock.json` was omitted from version control.
  10. **Institutional Email Provider Unconfirmed (TBD-01 - Governance Blocker):** The institutional verification provider for `@astean.biscast.edu.ph` remains unconfirmed by BISCAST IT.

### 1.3 Defect Register Summary
| Severity | Count | Defect Identifiers |
|---|---|---|
| **Critical** | 0 | None (no active secret leaks, remote code execution, or unauthenticated backend exposure). |
| **High** | 3 | **DEF-01** (Missing Git baseline tag), **DEF-07** (Dead code in URL validation / itch.io check), **DEF-08** (Protocol-relative URL bypass). |
| **Medium** | 6 | **DEF-02** (Uncommitted lockfile), **DEF-03** (Bundled sample assets 4.34 MB), **DEF-09** (14 untracked runbooks), **DEF-10** (Public disclosure of AI prompts in `dist/`), **DEF-11** (Missing Cloudflare Pages `_redirects`), **DEF-12** (Dialog a11y focus gaps). |
| **Low** | 3 | **DEF-04** (Monogram placeholder brandmark), **DEF-05** (Fragile `slugifyTitle`), **DEF-13** (Missing favicon & `allowedHosts: true`). |
| **Informational** | 1 | **DEF-06** (Documentation duplication & naming fragmentation). |
| **Total** | **13** | |

---

## 2. Repository & Git Status

### 2.1 Commit History & Branch Inspection
```text
* df751e0 (HEAD -> main, origin/main, origin/HEAD) docs: update project documentation and README
* b103d84 Initial commit
```

- **Remote URL:** `https://github.com/RetsardCo/BISCAST-Game-Dev-Central`
- **Active Branch:** `main` (cleanly tracking `origin/main`).
- **Commit History Breakdown:**
  - `b103d84` (*Initial commit*): Introduced repository license (Apache 2.0) and initial skeleton README.
  - `df751e0` (*docs: update project documentation and README*): Injected 76 files (+9,289 lines). Despite the commit message suggesting documentation updates only, this commit delivered the entirety of Phase 0–2 implementation (React components, Vite configurations, mock stores, unit tests, and assets).
- **Git Tags:**
  - Command: `git tag -l`
  - Output: `(empty)`
  - **Finding (DEF-01):** The handoff checklist specifically mandates tagging `phase-2-baseline` upon Phase 2 completion. This tag was never created or pushed to remote.

### 2.2 File Inventory: Tracked vs. Untracked
The repository contains 76 tracked files on `origin/main`. However, inspecting the working tree revealed significant anomalies:
1. **Lockfile Omission (DEF-02):** `package-lock.json` was generated locally during `npm install` but was never committed.
2. **Complete `Docs/` Directory Omission (DEF-06 & DEF-09):**
   - The remote repository tracked 19 hashed documentation files in `public/assets/aistudio/` (e.g., `00_PROJECT_OVERVIEW_81fd0d00.md`) and only `docs/DESIGN_TOKENS.md` under `docs/`.
   - The local working tree contains an uppercase `Docs/` directory with 33 files. **None of the 33 files in `Docs/` are tracked in Git**. 19 are clean-named canonical specifications, and **14 are critical operational and engineering runbooks**. If cloned on a clean system, `Docs/` does not exist.

### 2.3 Forensic Inventory of the 14 Untracked Engineering Runbooks
The following 14 operational runbooks exist locally in `Docs/` and are completely absent from Git history:
1. `Docs/ANTIGRAVITY_MASTER_PROMPT.md` — Core implementation guidelines for the handover agent.
2. `Docs/BACKUP_DISASTER_RECOVERY.md` — RPO/RTO targets, automated Supabase pg_dump workflows, and restore verification runbooks.
3. `Docs/CI_CD_STANDARDS.md` — GitHub Actions automated build, lint, typecheck, and test pipeline specifications.
4. `Docs/DEPENDENCY_MANAGEMENT.md` — Dependabot policies, zero-bloat standards, and vulnerability SLA tiers.
5. `Docs/DEPLOYMENT_RUNBOOK.md` — Cloudflare Pages staging/production deployment checklists and rollback protocols.
6. `Docs/INCIDENT_RESPONSE.md` — Severity classifications (P1–P4), on-call communication trees, and post-mortem templates.
7. `Docs/MONITORING_OPERATIONS.md` — Free-tier Supabase telemetry, Cloudflare web analytics, and quota alerts.
8. `Docs/PRIVACY_DATA_GOVERNANCE.md` — Philippine Data Privacy Act (RA 10173) compliance, adviser consent, and takedown procedures.
9. `Docs/PRODUCTION_READINESS.md` — Production go-live gating criteria and architecture verification matrix.
10. `Docs/README_ENGINEERING_DOCS.md` — Master navigation index for engineering documentation.
11. `Docs/RELEASE_MANAGEMENT.md` — Semantic versioning (SemVer), Git tag conventions, and changelog maintenance.
12. `Docs/SECURITY_STANDARDS.md` — OWASP Top 10 mitigations, Content Security Policy (CSP), and RLS auditing rules.
13. `Docs/SECURITY_TEST_PLAN.md` — Automated security test cases for injection, auth bypass, and broken access controls.
14. `Docs/THREAT_MODEL.md` — STRIDE threat analysis covering student data tampering, rogue moderation, and asset defacement.

---

## 3. Build & Automated Verification Results

All build and verification commands were executed independently in PowerShell under Node.js `v26.13.0` and npm `11.20.0`.

### 3.1 Strict TypeScript Compilation (`npm run lint`)
- **Command:** `tsc --noEmit`
- **Exit Code:** `0`
- **Output:** Clean. Zero diagnostic errors or warnings across all 76 TypeScript files. `tsconfig.json` enforces `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, and `noFallthroughCasesInSwitch: true`.

### 3.2 Unit Test Execution (`npm test`)
- **Command:** `tsx --test src/lib/*.test.ts`
- **Test Runner:** Node.js native test runner (`node:test`, `node:assert/strict`)
- **Execution Log:**
```text
✔ urlSafety rejects unsafe schemes and validates https / itch.io / YouTube URLs (1.4364ms)
✔ public filter excludes pending games and matches developer search (0.8259ms)
✔ submission validation enforces required fields, safe URLs, and rights confirmation (0.5799ms)
✔ moderation transition requires feedback on reject and logs audit entry on approve (0.3656ms)
✔ voting logic prevents duplicate votes and blocks closed competitions (2.39ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 409.0132
```
- **Forensic Test Analysis:** While all 5 suites pass, the test suite suffers from a **false sense of security**:
  - In `src/lib/core.test.ts:152`, `validateGameSubmission` is tested with `itch_url: 'javascript:alert(1)'`. Because `javascript:` fails `isStrictHttpsUrl`, the validation triggers an error and passes the test.
  - The test **never supplies an external HTTPS domain** (e.g., `https://evil-phishing.com/login`). Had the test provided this, it would have revealed that `validateGameSubmission` accepts non-itch.io URLs because `isItchIoUrl` is never called in `src/lib/validation.ts`.

### 3.3 Production Build (`npm run build`)
- **Command:** `vite build`
- **Exit Code:** `0`
- **Build Duration:** `9.35 seconds`
- **Generated Artifacts (`dist/`):**
  ```text
  dist/index.html                                                  1.52 kB │ gzip:   0.69 kB
  dist/assets/index--RleUmUJ.css                                  37.52 kB │ gzip:   7.63 kB
  dist/assets/index-D4Ouhmu9.js                                  448.89 kB │ gzip: 124.81 kB
  dist/assets/sample_game_signal_grid_1795358254488-Cv1YT71u.jpg 692.62 kB
  dist/assets/sample_capstone_echo_loom_1795358226210-23dZgweH.jpg 777.74 kB
  dist/assets/sample_game_coastal_courier_1795358228364-CnGmUr0N.jpg 784.46 kB
  dist/assets/sample_game_lantern_depths_1795358242269-BL50w9OM.jpg 926.58 kB
  dist/assets/sample_game_clockwork_hearth_1795358229904-CjQB8lvr.jpg 1,157.59 kB
  dist/assets/aistudio/*.md (19 documentation files)               56.34 kB
  ```
- **Bundle Evaluation:**
  - Total distribution payload is **4.82 MB**.
  - **90.0% of the build size (4.34 MB) is consumed by 5 uncompressed sample JPEG images** bundled in `src/assets/images/` (DEF-03).
  - The compiled JavaScript chunk (`448.89 kB` / `124.81 kB` gzip) is well within reasonable boundaries for an SPA containing 16 views and bundled mock data.

---

## 4. Frontend Architecture & Route Assessment

### 4.1 Technology Stack Conformance Matrix
| Component / Library | Required in Specification | Implemented in Codebase | Compliance Status |
|---|---|---|---|
| **Core Framework** | React 19.x | `react@19.1.0`, `react-dom@19.1.0` | **Fully Compliant** |
| **Language** | TypeScript 5.x (Strict) | `typescript@5.8.3` (`strict: true`) | **Fully Compliant** |
| **Bundler & Tooling** | Vite 6.x | `vite@6.3.5` (resolving `6.4.6`) | **Fully Compliant** |
| **CSS Framework** | Tailwind CSS v4.x | `@tailwindcss/vite@4.1.7`, `tailwindcss@4.1.7` | **Fully Compliant** |
| **Client Routing** | React Router v7.x | `react-router-dom@7.6.1` | **Fully Compliant** |
| **Iconography** | Lucide React | `lucide-react@0.511.0` | **Fully Compliant** |
| **Backend Integration** | Supabase SDK (deferred to Phase 3) | None currently present | **Fully Compliant** |
| **Prohibited Dependencies**| Zero Firebase / Firestore | Zero references in dependencies | **Fully Compliant** |

### 4.2 Component Architecture & Modularity
The codebase exhibits a clean design pattern separating layout frames, presentation atoms, domain contexts, and page views:

```text
src/
├── components/
│   ├── layout/
│   │   ├── BrandMark.tsx        # Placeholder monogram "BG" (DEF-04)
│   │   ├── Header.tsx           # 3-zone desktop navigation + mobile drawer with ARIA controls
│   │   ├── Footer.tsx           # 4-column footer with prototype disclosures
│   │   └── PageShell.tsx        # Skip-to-content a11y link + scroll restoration
│   └── ui/
│       ├── Button.tsx           # Standardized button variants (primary, secondary, ghost, danger)
│       ├── Dialog.tsx           # Modal dialog with Escape key listener (DEF-12)
│       ├── GameCard.tsx         # Semantic card article with metadata badges & fallback images
│       ├── MediaImage.tsx       # Resilient image with onError fallback state
│       ├── States.tsx           # LoadingSkeletonGrid, EmptyState, ErrorState, PrototypeNotice
│       ├── StatusText.tsx       # Standardized moderation status badges
│       ├── Tabs.tsx             # Accessible ARIA-compliant tablist component
│       └── YouTubeLazyEmbed.tsx # Click-to-load privacy-enhanced YouTube embed
```

### 4.3 Modal Dialog Accessibility Deep-Dive (`src/components/ui/Dialog.tsx`)
While `Dialog.tsx` implements `role="dialog"`, `aria-modal="true"`, and listens for the `Escape` key, forensic inspection revealed five accessibility and focus management deficiencies (DEF-12):
1. **No Focus Trapping:** When the modal is open, pressing `Tab` allows the focus to escape the dialog and navigate through hidden links and buttons in the background DOM.
2. **No Initial Focus Placement:** Focus is not automatically moved to the dialog heading, close button, or first interactive element upon mount.
3. **No Focus Restoration:** When the dialog unmounts, focus drops to `document.body` instead of returning to the element that triggered the modal.
4. **No Background Body Scroll Lock:** The background page can still be scrolled with mouse wheel or touch swipes while the modal is open.
5. **Missing `aria-describedby` Wiring:** When `description` is provided (line 42), it lacks an `id` attribute and is not associated with the dialog container via `aria-describedby`.

### 4.4 Route Inventory (16 Routes + 404 Fallback)
Every route declared in `src/App.tsx` was verified for layout structure, interactive features, loading/empty/error states, and specification compliance:

| # | Route Path | Component | Scope & Verified Functionality | Status |
|---|---|---|---|---|
| 1 | `/` | `HomePage.tsx` | Split editorial hero, sample catalog metrics, featured showcase, latest games, community announcements, Hall of Fame spotlight, prototype notice banner. | **Verified** |
| 2 | `/games` | `ExploreGamesPage.tsx` | Multi-facet live filters (academic year, semester, genre, engine, project type), full-text search, sorting, client pagination (`PAGE_SIZE=6`), QA state hooks (`?state=loading`, `?state=error`). | **Verified** |
| 3 | `/games/:slug` | `GameDetailPage.tsx` | Dynamic slug lookup, cover artwork, safe itch.io launch button, click-to-load YouTube trailer, screenshot lightbox modal, team attribution credits, linked capstone banner, report modal. | **Verified** |
| 4 | `/archives` | `ArchivesPage.tsx` | Chronological grouping by Academic Year and Semester, project counts, deep-link to pre-filtered explore view. | **Verified** |
| 5 | `/categories` | `CategoriesPage.tsx` | Genre listing with project counts, recent project lists, deep-links to `/games?category=...`. | **Verified** |
| 6 | `/events` | `EventsPage.tsx` | Tabbed interface for Announcements and Competitions/Game Jams, category filtering, schedule timelines, external registration links. | **Verified** |
| 7 | `/capstones` | `CapstonesPage.tsx` | Capstone search, academic year and project status filters, student team member credits. | **Verified** |
| 8 | `/capstones/:slug` | `CapstoneDetailPage.tsx` | Abstract, project overview, consent-gated adviser attribution, technology stack, demo/documentation links, linked playable game banner. | **Verified** |
| 9 | `/alumni` | `AlumniArchivePage.tsx` | Filter by graduation batch, public profile list with credited games and awards, privacy exclusion for private profiles. | **Verified** |
| 10 | `/hall-of-fame` | `HallOfFamePage.tsx` | Explicit separation between Juried Awards and Community Choice popularity rankings (FR-VOTE-06), academic year filter, recipient links. | **Verified** |
| 11 | `/developers/:username` | `DeveloperProfilePage.tsx` | Visibility-aware portfolio (`public` vs `private` guard), credited games, capstones, awards, external portfolio links. | **Verified** |
| 12 | `/dashboard` | `StudentDashboardPage.tsx` | Sample student switcher, permitted profile field editor, submission status tracking with moderator revision notes, open voting events. | **Verified** |
| 13 | `/submit` | `SubmitGamePage.tsx` | Full submission form, multi-member team credit builder, client-side validation, rights confirmation checkbox, automatic `pending_review` assignment. | **Verified** |
| 14 | `/admin` | `AdminModerationPage.tsx` | Pending review queue, moderation checklist, approve/request changes/reject transitions with mandatory review notes, announcement manager, voting visibility toggle, append-only audit log. | **Verified** |
| 15 | `/voting` | `VotingPage.tsx` | Open ballot casting with duplicate vote blocking, closed event prevention, hidden-during-voting policy, prototype notice. | **Verified** |
| 16 | `/about` | `AboutPage.tsx` | Guiding principles, Phase 0–2 prototype boundary notice, QA preview links, tabular log of Unresolved Institutional Decisions (`TBD-01` to `TBD-06`). | **Verified** |
| 17 | `*` | `NotFoundPage.tsx` | Accessible 404 fallback page with navigation actions. | **Verified** |

### 4.5 Cloudflare Pages SPA Routing Analysis (DEF-11)
The project documentation identifies Cloudflare Pages as the target static hosting provider.
- **The Problem:** In an SPA using HTML5 pushState routing (`react-router-dom`), route paths like `/games`, `/capstones/echo-loom`, `/admin`, and `/submit` are purely client-side virtual routes.
- **The Failure:** When a user refreshes their browser or visits a deep link directly, Cloudflare Pages attempts to find a static file at `/games/index.html` or `/games`. Because no such file exists, Cloudflare returns an HTTP 404 Not Found error.
- **Remediation:** Cloudflare Pages requires a `public/_redirects` file specifying a 200 rewrite rule:
  ```text
  /* /index.html 200
  ```
- **Status:** Currently, `public/_redirects` is **missing** from the repository.

---

## 5. Security & Safety Assessment

### 5.1 Verification of Prohibited Dependencies & Secrets
- **Firebase / Firestore Audit:**
  - `package.json` was examined line-by-line: no `firebase`, `@firebase/*`, or `firestore` packages exist.
  - Global codebase regex search: Exactly 1 textual match in `src/pages/AboutPage.tsx:53`, explicitly disclosing to users that no Firebase/Firestore dependencies exist.
- **Credentials & Private Keys Audit:**
  - Codebase scanned for Supabase service-role keys, private keys (`-----BEGIN PRIVATE KEY-----`), and hardcoded JWT tokens.
  - **Result: Clean.** Zero production credentials or secrets exist in the repository.
- **Environment Variables (`.env.example`):**
  - Contains strictly dummy placeholder values:
    ```bash
    VITE_SUPABASE_URL=https://your-dev-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
    VITE_APP_ENV=prototype
    ```
  - Global scan of `src/` revealed **zero calls to `import.meta.env`**, confirming that the frontend prototype runs completely self-contained without crashing if environment variables are omitted.

### 5.2 Deep Forensic Analysis: URL Handling & Validation Flaws

#### Vulnerability 1: Dead Code in URL Validation & itch.io Domain Check (DEF-07 - High)
In `src/lib/urlSafety.ts`, lines 35–44 implement a robust domain validation helper:
```typescript
export function isItchIoUrl(rawUrl: string | null | undefined): boolean {
  if (!isStrictHttpsUrl(rawUrl)) return false;
  try {
    const parsed = new URL(rawUrl!.trim());
    const host = parsed.hostname.toLowerCase();
    return host === 'itch.io' || host.endsWith('.itch.io');
  } catch {
    return false;
  }
}
```
However, inspecting `src/lib/validation.ts` (lines 44–46):
```typescript
// src/lib/validation.ts:44
if (!isStrictHttpsUrl(draft.itch_url)) {
  errors.itch_url = 'Provide a valid https:// itch.io or approved play/demo URL.';
}
```
- **Forensic Finding:** `isItchIoUrl` is **never imported or called** in `validation.ts` or anywhere in the application views. It exists only in `urlSafety.ts` and `core.test.ts`. Furthermore:
  - In `src/pages/AdminModerationPage.tsx:22`, the moderation checklist instructs reviewers: `'External itch.io / demo link accessible and safe'`. However, `game.itch_url` is **never rendered or linked anywhere in the moderation queue card**, preventing moderators from reviewing submitted links without manually navigating to the game's detail page.
  - In `src/pages/GameDetailPage.tsx:78`, `safeItchUrl` uses generic `isSafeHttpUrl(game.itch_url)` instead of `isItchIoUrl`, despite rendering the button text "Open on itch.io" (lines 231-244).
- **Security Impact:** A user can submit `https://attacker-credential-harvesting.com/login` into the `itch_url` field, and the form will accept it without error.
- **Test Blind Spot:** `core.test.ts:152` tested `itch_url: 'javascript:alert(1)'`, which was rejected by `isStrictHttpsUrl`. The test author never tested an external non-itch HTTPS URL, leaving this dead code undetected.

#### Vulnerability 2: Protocol-Relative & Slash-Backslash URL Bypass in `isSafeHttpUrl` (DEF-08 - High)
In `src/lib/urlSafety.ts`, lines 9–21 implement `isSafeHttpUrl`:
```typescript
// src/lib/urlSafety.ts:9-21
export function isSafeHttpUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  // Allow relative local assets bundled with Vite
  if (trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
```
- **Forensic Finding:** Line 14 checks `if (trimmed.startsWith('/')) return true;` under the assumption that all strings starting with `/` are local relative assets (such as `/sample.jpg`).
- **Security Impact & Attack Vectors:**
  1. **Protocol-Relative URLs (`//evil.com`):** In RFC 3986 and web browsers, strings starting with `//` are network-path references. When passed to `<a href={url}>` or `<img src={url}>`, browsers resolve them relative to the current scheme (`https:`), navigating directly to `https://evil.com`.
  2. **Slash-Backslash Normalization (`/\evil.com`):** Under WHATWG URL standards and modern browsers, `/\` is normalized directly to `//` (e.g., `new URL('/\\evil.com', 'https://example.com').href` outputs `https://evil.com/`). A naive fix checking only `!trimmed.startsWith('//')` is **trivially bypassed** by `/\evil.com`.
  3. **Cover Image Injection:** In `src/lib/validation.ts:48`, `draft.cover_image_url` is validated with `isSafeHttpUrl`. A malicious submitter supplying `//evil-tracker.com/pixel.png` or `/\evil-tracker.com/pixel.png` passes validation. When rendered in `<MediaImage src={game.cover_image_url} />` across `HomePage`, `ExploreGamesPage`, and `GameDetailPage`, the browser automatically loads the external asset without user interaction, enabling third-party tracking and resource injection.
  4. **Plaintext HTTP Scheme Allowed:** Line 17 permits `parsed.protocol === 'http:'`. This directly contradicts `Docs/05_SECURITY_AND_RLS.md` and `Docs/09_MEDIA_INTEGRATIONS.md`, which mandate strict HTTPS for all external links to prevent mixed-content warnings and man-in-the-middle attacks.
- **Exact Call Sites vs. Rendering Locations:**
  - `src/pages/GameDetailPage.tsx:78` (invoked to compute `safeItchUrl`; rendered at line 238)
  - `src/pages/CapstoneDetailPage.tsx:159,170` (invoked on `demo_url` and `documentation_url`; rendered at lines 160, 171)
  - `src/pages/DeveloperProfilePage.tsx:131` (invoked in `.filter((link) => isSafeHttpUrl(link.url))`; rendered at line 135)
  - `src/pages/EventsPage.tsx:122` (invoked to compute `safeRegUrl`; rendered at line 157)
  - `src/lib/validation.ts:48` (invoked to validate `draft.cover_image_url`)
- **Robust Remediation:**
  Line 14 must reject both protocol-relative slashes and backslashes, or resolve relative URLs against a trusted base:
  ```typescript
  // Reject protocol-relative '//' and slash-backslash '/\' normalizations
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return true;
  }
  ```
  Alternatively, use WHATWG base origin resolution:
  ```typescript
  try {
    const base = 'https://trusted.internal';
    const parsed = new URL(trimmed, base);
    if (parsed.origin === base) return true; // Safe root-relative asset
    return parsed.protocol === 'https:';    // Strict HTTPS for external URLs
  } catch {
    return false;
  }
  ```

### 5.3 Information Disclosure via `public/assets/aistudio/` (DEF-10 - Medium)
In Vite, all files residing in the `public/` directory are copied verbatim into the root of `dist/` during `vite build`.
- In `public/assets/aistudio/`, 19 markdown files were committed, including:
  - `AI_STUDIO_MASTER_PROMPT_b2f8d46e.md` (System prompts and agent behavior rules).
  - `05_SECURITY_AND_RLS_318c9e58.md` (Internal security design and database table policies).
  - `15_RISK_REGISTER_AND_DECISIONS_96f9a7e7.md` (Internal threat registers and vulnerability assessments).
- **Forensic Finding:** Upon running `npm run build`, these 19 files are copied directly to `dist/assets/aistudio/*.md`. Anyone visiting `https://<site>/assets/aistudio/AI_STUDIO_MASTER_PROMPT_b2f8d46e.md` can read internal prompts and security architecture details.
- **Remediation:** Remove `public/assets/aistudio/` and store engineering documentation exclusively in a root-level `docs/` folder outside of `public/`.

### 5.4 External Link Safety & Media Embeds
- **Anchor Tag Hardening:** Verified that all external links across the codebase (`YouTubeLazyEmbed.tsx:64`, `CapstoneDetailPage.tsx:162`, `CapstoneDetailPage.tsx:173`, `DeveloperProfilePage.tsx:136`, `EventsPage.tsx:159`, `GameDetailPage.tsx:240`) strictly include:
  ```tsx
  target="_blank"
  rel="noopener noreferrer"
  ```
  This mitigates `window.opener` tabnabbing and prevents leakage of HTTP Referer headers.
- **YouTube Embed Privacy:** `YouTubeLazyEmbed.tsx` exclusively constructs embed URLs via `getPrivacyEnhancedYouTubeEmbedUrl`:
  ```text
  https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1
  ```
  Autoplay is explicitly disabled (`autoplay=0`), preventing unwanted background tracking and bandwidth consumption.

### 5.5 Development Server Security (`vite.config.ts` - DEF-13)
In `vite.config.ts`, lines 10 and 16 set:
```typescript
allowedHosts: true
```
This disables Vite's Host Header validation. While convenient for local network tunneling, it disables Vite 6's DNS rebinding protection. In production configuration, this should not be enabled. Additionally, `index.html` lacks a `<link rel="icon">` favicon reference.

---

## 6. Data Contract Assessment

### 6.1 Logical Model vs. Database Schema Alignment
The TypeScript data contracts declared in `src/types/models.ts` map cleanly to the PostgreSQL physical schema outlined in `Docs/04_DATA_MODEL.md`:

| TypeScript Model (`src/types/models.ts`) | Target Database Table | Primary Key | Foreign Key Relationships |
|---|---|---|---|
| `Profile` | `profiles` | `id` (UUID references `auth.users.id`) | None |
| `UserRoleRecord` | `user_roles` | Composite `(user_id, role)` | References `profiles.id` |
| `Category` | `categories` | `id` (TEXT) | None |
| `Game` | `games` | `id` (UUID) | `submitted_by` -> `profiles.id`, `reviewed_by` -> `profiles.id`, `capstone_id` -> `capstone_projects.id` |
| `GameMember` | `game_members` | Composite `(game_id, profile_id, credit_role)` | References `games.id`, `profiles.id` |
| `Announcement` | `announcements` | `id` (TEXT) | `created_by` -> `profiles.id` |
| `Competition` | `competitions` | `id` (TEXT) | `created_by` -> `profiles.id` |
| `CompetitionEntry` | `competition_entries` | Composite `(competition_id, game_id)` | References `competitions.id`, `games.id` |
| `Vote` | `votes` | `id` (UUID) | `competition_id` -> `competitions.id`, `game_id` -> `games.id`, `voter_profile_id` -> `profiles.id` |
| `Award` | `awards` | `id` (TEXT) | Optional refs to `games.id`, `profiles.id`, `competitions.id` |
| `CapstoneProject` | `capstone_projects` | `id` (UUID) | `linked_game_id` -> `games.id` |
| `CapstoneMember` | `capstone_members` | Composite `(capstone_id, profile_id, credit_role)` | References `capstone_projects.id`, `profiles.id` |
| `AuditLog` | `audit_logs` | `id` (UUID) | `actor_user_id` -> `profiles.id` |

### 6.2 Prototype Store Delineation & Isolation
- **Sample Attribution:** In `src/data/mockDataset.ts`, every mock entity is flagged with `is_sample: true`.
- **In-Memory Store:** `src/context/PrototypeStoreContext.tsx` operates entirely in React state with `isPrototypeMode: true`.
- **Mutation Isolation:** All state mutations (`submitMockGame`, `moderateMockGame`, `castMockVote`, `updateMockProfile`, `createMockAnnouncement`, `submitMockReport`) are clearly prefixed with `Mock`.
- **Persistence Boundary:** State changes reset upon page reload; no mock records are written to `localStorage` or `sessionStorage`.

---

## 7. Supabase Integration Readiness (Phases 3–8)

To transition from the Phase 2 in-memory mock store to Phase 3–8 Supabase persistence, Antigravity must execute the following database-level mappings:

### 7.1 Schema Migrations Required in Phase 3
1. **`profiles` Table & Trigger:**
   - Create `profiles` table matching `src/types/models.ts`.
   - Implement PostgreSQL trigger `on_auth_user_created` listening to `auth.users` to automatically insert a corresponding `profiles` record.
   - Enforce RLS policies:
     - Public `SELECT` allowed only when `profile_visibility = 'public'`.
     - Authenticated users can `UPDATE` only permitted profile fields (`display_name`, `bio`, `skills`, `portfolio_links`, `avatar_url`, `profile_visibility`).
     - Column-level protection or RLS preventing users from updating `account_status` or escalating roles.
2. **`user_roles` Table & Security Definer Functions:**
   - Table `user_roles (user_id UUID, role app_role, granted_by UUID, created_at TIMESTAMPTZ)`.
   - Prevent direct client `INSERT`/`UPDATE`/`DELETE`.
   - Implement `is_moderator(user_id)` and `has_role(user_id, role)` `SECURITY DEFINER` SQL helper functions.

### 7.2 Database Stored Procedures Required in Phase 4
- **Atomic Moderation Transition:**
  The pure TypeScript function `applyModerationDecision` in `src/lib/workflows.ts` must be ported to a PostgreSQL `SECURITY DEFINER` function `moderate_game(game_id, action, feedback)`:
  - Validates caller possesses `moderator` or `super_admin` role.
  - Updates `games.status`, `games.reviewed_by = auth.uid()`, `games.reviewed_at = now()`, and `games.moderation_feedback`.
  - Atomically inserts an audit entry into `audit_logs` in the same transaction.

### 7.3 Database Constraints for Voting in Phase 6
- **Uniqueness & Window Enforcement:**
  The pure TypeScript function `evaluateMockVote` in `src/lib/workflows.ts` must be replaced by a composite uniqueness constraint:
  ```sql
  ALTER TABLE votes ADD CONSTRAINT unique_vote_per_competition UNIQUE (competition_id, voter_profile_id);
  ```
  A stored procedure `cast_vote(p_competition_id, p_game_id)` must verify that `now()` falls strictly within `starts_at` and `ends_at`, and that the competition status is `open`.

---

## 8. Defects & Technical Debt Register

### 8.1 Master Defect Matrix
| ID | Severity | File Location | Defect Description | Potential Impact | Remediation Required |
|---|---|---|---|---|---|
| **DEF-01** | **High** | Git Repository | Git tag `phase-2-baseline` missing. | Handoff gate failure; inability to pin exact Phase 2 baseline commit. | Run `git tag -a phase-2-baseline -m "Phase 2 baseline"` and push to `origin`. |
| **DEF-02** | **Medium** | Root Directory | `package-lock.json` uncommitted. | Non-deterministic dependency installation across environments. | Commit `package-lock.json` generated by npm 11. |
| **DEF-03** | **Medium** | `src/assets/images/` | 5 sample JPEGs (~4.34 MB) bundled into build. | Inflates build artifact size (90% of total payload); slows initial asset load. | Move sample images to external CDN or Supabase Storage in Phase 3. |
| **DEF-04** | **Low** | `BrandMark.tsx` | Placeholder monogram `"BG"`. | Non-official visual branding displayed. | Replace with approved BISCAST SVG/PNG logo upon resolution of TBD-02. |
| **DEF-05** | **Low** | `src/lib/filters.ts:154` | `slugifyTitle` returns `""` on symbol-only input. | Malformed routes (`/games/`) or slug collisions for non-Latin titles. | Add fallback ID suffix: `slug || ('project-' + id)`. |
| **DEF-06** | **Informational** | Repository Root | Redundant docs in `public/assets/aistudio/` vs `Docs/`. | Fragmented documentation architecture. | Consolidate canonical documentation into a single `docs/` tree. |
| **DEF-07** | **High** | `src/lib/validation.ts:44` | Dead code: `isItchIoUrl` is never called in `validateGameSubmission`. | Any arbitrary HTTPS URL is accepted as an itch.io game link (phishing risk). | Call `isItchIoUrl(draft.itch_url)` in `validateGameSubmission`. |
| **DEF-08** | **High** | `src/lib/urlSafety.ts:14` | Protocol-relative (`//`) & slash-backslash (`/\`) URL bypass in `isSafeHttpUrl`. | `//evil.com` and `/\evil.com` bypass HTTPS validation; enables link tabnabbing and unauthenticated image tracking injection. | Update check: `trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')`. |
| **DEF-09** | **Medium** | `Docs/` Directory | Entire `Docs/` directory (33 specifications & runbooks) untracked in Git. | Loss of critical operational, security, and disaster recovery specifications on clean clones. | Track and commit all 33 files in `Docs/` to version control. |
| **DEF-10** | **Medium** | `public/assets/aistudio/` | AI prompts and internal specs copied to `dist/`. | Information disclosure of internal prompts, table schemas, and threat vectors. | Move internal documentation outside of `public/`. |
| **DEF-11** | **Medium** | `public/_redirects` | Missing Cloudflare Pages client-side routing rewrite. | Direct visits or page refreshes on non-root routes return HTTP 404 errors. | Create `public/_redirects` containing `/* /index.html 200`. |
| **DEF-12** | **Medium** | `Dialog.tsx` | Accessibility (a11y) defects (no focus trap, no return focus, no scroll lock). | Keyboard and screen reader navigation traps and usability degradation. | Implement focus trapping, auto-focus, focus restoration, and body scroll lock. |
| **DEF-13** | **Low** | `index.html` & `vite.config.ts` | Missing favicon and `allowedHosts: true` in Vite config. | Browser 404 console errors on favicon; DNS rebinding protection disabled. | Add favicon asset; restrict or remove `allowedHosts: true` in production. |

---

## 9. Unresolved Institutional Decisions (TBD Log)

The project requirements (`Docs/00_PROJECT_OVERVIEW.md`, `Docs/15_RISK_REGISTER_AND_DECISIONS.md`, and `src/pages/AboutPage.tsx`) document six unresolved institutional decisions. These are not technical software bugs, but policy dependencies requiring BISCAST project-owner resolution:

### TBD-01: Astean Email Verification Provider (**BLOCKER FOR PHASE 3 AUTH**)
- **Description:** Whether `@astean.biscast.edu.ph` email accounts support Google Workspace OAuth (with domain restriction `hd: "astean.biscast.edu.ph"`) or require standard Supabase email OTP / magic link via institutional SMTP.
- **Architectural Impact:** Blocks Phase 3 authentication architecture. Supabase Auth cannot be finalized until the identity provider mechanism is officially confirmed.
- **Resolution Path:** Project owner must confirm with BISCAST IT whether student Google Workspace OAuth is available.

### TBD-02: Institutional Name, Logo & Official Branding Permission
- **Description:** Official written clearance from BISCAST administration for the use of institutional names, emblems, and logos.
- **Impact:** `BrandMark.tsx` currently renders a neutral placeholder monogram `"BG"`.
- **Resolution Path:** Project owner must supply approved vector/raster assets and written approval.

### TBD-03: Moderator & Super Admin Appointment Workflow
- **Description:** Governance criteria and institutional appointment process for designated faculty or student moderators.
- **Impact:** Dictates initial role provisioning during Phase 3 database seeding.

### TBD-04: Voting Policy & Competition Rules
- **Description:** Formalization of voting constraints: 1 vote per student per competition vs. 1 vote per category; alumni voting eligibility; tie-breaking rules.
- **Impact:** Must be formalized before locking Phase 6 PostgreSQL constraints.

### TBD-05: Graduation Verification & Alumni Account Transition
- **Description:** Procedure for transitioning active student accounts to alumni status when institutional email access expires after graduation.
- **Impact:** Governs Phase 7 alumni account claiming workflows.

### TBD-06: Privacy Retention, Consent & Takedown SLA
- **Description:** Maximum retention schedules, faculty consent for adviser credit, and formal response SLAs for DMCA/takedown requests under RA 10173.
- **Impact:** Governs Phase 7–8 privacy policy disclosures.

---

## 10. Recommended Remediation Plan

To bring the project to an approved, production-ready baseline before Phase 3 backend implementation begins, Antigravity recommends the following phased remediation:

### Step 1: Governance & Baseline Pinning (Immediate)
1. **Create and Push Git Baseline Tag (DEF-01):**
   ```bash
   git tag -a phase-2-baseline -m "Phase 0-2 Frontend Showcase Prototype Baseline (Google AI Studio)"
   git push origin phase-2-baseline
   ```
2. **Commit Lockfile (DEF-02):**
   ```bash
   git add package-lock.json
   git commit -m "chore: commit package-lock.json for deterministic builds"
   git push origin main
   ```
3. **Track Canonical Specifications and Engineering Runbooks (DEF-09):**
   Commit all 33 files in `Docs/` (19 canonical project specifications and 14 operational runbooks) to ensure production standards and institutional memory are preserved in Git.

### Step 2: Critical Code Hardening (Pre-Phase 3)
1. **Fix Dead Code in URL Validation (DEF-07):**
   Update `src/lib/validation.ts:44` to call `isItchIoUrl(draft.itch_url)`:
   ```typescript
   if (!isItchIoUrl(draft.itch_url)) {
     errors.itch_url = 'Provide a valid https:// itch.io game URL (e.g., https://username.itch.io/game).';
   }
   ```
2. **Remediate Protocol-Relative & Slash-Backslash URL Bypass (DEF-08):**
   Update `src/lib/urlSafety.ts:14`:
   ```typescript
   // Reject protocol-relative '//' and slash-backslash '/\' normalizations
   if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) return true;
   ```
   Add corresponding negative unit tests in `src/lib/core.test.ts` asserting:
   - `isSafeHttpUrl('//evil.com') === false`
   - `isSafeHttpUrl('/\\evil.com') === false`
3. **Add Cloudflare Pages Routing Rewrite (DEF-11):**
   Create `public/_redirects` containing:
   ```text
   /* /index.html 200
   ```
4. **Remediate Information Disclosure (DEF-10):**
   Remove `public/assets/aistudio/` from `public/` so internal markdown prompts are not bundled into `dist/`.

### Step 3: UI & Accessibility Hardening
1. **Hardening `Dialog.tsx` (DEF-12):**
   Add focus trapping, initial focus management, focus restoration to the active trigger element upon unmount, and `overflow: hidden` body scroll locking.
2. **Add Favicon & Tighten Vite Config (DEF-13):**
   Provide a standard SVG/ICO favicon and remove `allowedHosts: true` for hardened builds.

### Step 4: Institutional Unblocker
1. **Obtain Project-Owner Sign-off on TBD-01:**
   Confirm whether BISCAST uses Google Workspace OAuth or standard email OTP for `@astean.biscast.edu.ph`.

---

## 11. Phase 3 Readiness Verdict

### Technical Deliverable Assessment
The Phase 0–2 Frontend Showcase Prototype delivered by Google AI Studio satisfies the core functional requirements outlined in the roadmap. The architecture is modular, type-safe, cleanly separated from future backend layers, completely free of Firebase/Firestore dependencies, and builds without errors.

### Architectural Gate Assessment
However, per the strict governance rules outlined in `HANDOFF_CHECKLIST.md` (*"Stop Conditions: The email verification assumptions are unverified and block implementation"*) and `ANTIGRAVITY_MASTER_PROMPT.md` (*"Do not start backend implementation until the project owner approves blocking institutional decisions"*), the project **cannot be approved for Phase 3 implementation until blocking issues are cleared**.

```text
================================================================================
VERDICT: NOT APPROVED FOR PHASE 3
================================================================================
REASONS FOR HOLD:
  1. DEF-01 (High): Git tag 'phase-2-baseline' has not been created or pushed
     to GitHub to lock the Phase 2 deliverable baseline.
  2. DEF-07 (High) & DEF-08 (High): Critical URL validation defects (dead itch.io
     domain check and protocol-relative URL bypass) must be patched before
     introducing live submission APIs.
  3. TBD-01 (Institutional Blocker): The institutional email verification
     provider (@astean.biscast.edu.ph OAuth vs OTP/SMTP) remains unconfirmed
     by BISCAST IT, blocking Phase 3 Supabase Auth architecture.
================================================================================
```

### Path to Approval
Once:
1. `phase-2-baseline` tag is pushed to GitHub,
2. DEF-07 and DEF-08 URL validation fixes are staged, and
3. The project owner confirms **TBD-01** (email provider) and approves this audit report,

The project may immediately transition to:

```text
APPROVED FOR PHASE 3
```
