# System Architecture

## 1. Approved high-level architecture

```text
Public / Student / Admin Browser
             |
             v
React + TypeScript + Vite + Tailwind
             |
      Supabase client SDK
             |
   +---------+------------------+
   |                            |
   v                            v
Supabase Auth              PostgreSQL
                              |
                         RLS policies
                              |
                    Trusted database functions
                              |
                    Supabase Storage (optional)

External media:
- itch.io: game pages / supported embeds
- YouTube: trailer and gameplay embeds

Source control: GitHub
Frontend hosting: Cloudflare Pages
```

## 2. Technology decisions
- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Backend: Supabase Auth and PostgreSQL.
- File storage: Supabase Storage only for selected, optimized images when external URLs are unsuitable.
- Hosting: Cloudflare Pages for the frontend.
- Source control: GitHub.
- Game distribution: itch.io.
- Video: YouTube.

**Prohibited without an approved decision:** replacing Supabase with Firebase/Firestore; adding a second backend; storing game binaries or video files in the database; embedding service-role secrets in frontend code.

## 3. Environment separation
Use separate development and production Supabase projects when feasible. Never use production data for local tests. Store public configuration in environment variables. Store service-role keys and SMTP credentials only in protected server-side secrets.

Suggested variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (or publishable key supported by current Supabase guidance)

The frontend key is not a secret; security depends on RLS. Never expose the Supabase service-role key in any `VITE_` variable or browser bundle.

## 4. Data flow
1. Public page requests published content.
2. Supabase RLS limits public reads to published records and intentionally public profile fields.
3. Student signs in through Supabase Auth.
4. Student creates a submission; database assigns ownership and pending status.
5. Moderator reviews using privileged, auditable operations.
6. Approval changes publication status; public query can then display the record.
7. Voting uses database-enforced uniqueness and trusted time/status checks.

## 5. Static frontend and deployment
Build with Vite. Deploy the generated static output to Cloudflare Pages. Configure SPA fallback/routing correctly. Preview deployments must not point to production secrets or data unless explicitly approved.

## 6. Scale and cost strategy
Start with the Supabase Free plan and monitor usage. Store structured metadata in PostgreSQL; use external hosting for game builds and videos. Optimize cover images and avoid large uploads. Do not assume free-tier quotas or policies are permanent.
