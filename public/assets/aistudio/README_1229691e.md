# BISCAST Game Dev Central — Documentation Package

**Project identity:** BISCAST Game Dev Central  
**Community:** BISCAST BSEMC Game Development  
**Purpose:** A curated public showcase and long-term archive for games, capstone projects, developers, competitions, and community achievements.

## Start here
1. `00_PROJECT_OVERVIEW.md` — vision, goals, scope, assumptions.
2. `01_PRODUCT_REQUIREMENTS.md` — functional and non-functional requirements.
3. `02_ARCHITECTURE.md` — system architecture and technology decisions.
4. `03_ROADMAP_AND_TODO.md` — phases, owners, tasks, and acceptance gates.
5. `AI_STUDIO_MASTER_PROMPT.md` — instructions for Google AI Studio, Phases 0–2.
6. `ANTIGRAVITY_MASTER_PROMPT.md` — instructions for Antigravity, Phases 3–8.
7. `HANDOFF_CHECKLIST.md` — required transfer from AI Studio to Antigravity.

## Agreed development sequence
- **Google AI Studio first:** Phases 0–2. Build the design system and frontend prototype using mock data. Do not create the production backend.
- **Antigravity second:** Phases 3–8. Audit the imported project, then implement Supabase, security, workflows, testing, and deployment.

## Locked technology direction
- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth + PostgreSQL; Supabase Storage only where justified
- GitHub for source control
- Cloudflare Pages for static frontend hosting
- itch.io for game hosting and supported embeds
- YouTube for trailers and gameplay videos

Do not replace Supabase with Firebase/Firestore or introduce another backend without an approved architecture decision.

## Document conventions
- `MUST` means a release requirement.
- `SHOULD` means strongly recommended; deviations need a recorded reason.
- `MAY` means optional.
- Items marked **TBD / VERIFY** require confirmation; do not invent institutional policies or configuration.
- These documents are the project baseline. Update the decision log when an approved decision changes.
