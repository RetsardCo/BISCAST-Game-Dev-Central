# Risk Register and Decision Log

## 1. Risk register

| ID | Risk | Impact | Mitigation / action |
|---|---|---|---|
| R1 | Astean email provider/domain restrictions unknown | Student verification may not work as planned | Verify provider and test OAuth/email verification before implementation |
| R2 | Supabase Free inactivity pause | Backend unavailable after inactivity | Monitor status, document recovery, evaluate paid tier if needed |
| R3 | Free-tier quotas or terms change | Unexpected limits/cost | Recheck current provider limits before launch; monitor usage |
| R4 | Email delivery limits | Registration/recovery failure | Configure suitable SMTP and test delivery |
| R5 | Weak RLS policies | Unauthorized data access or role escalation | Threat model and automated RLS tests |
| R6 | Duplicate/fraudulent voting | Unfair results | Database constraints, trusted validation, written voting policy |
| R7 | Copyright/consent issue | Takedown or reputational harm | Submission declaration, moderation, report/takedown process |
| R8 | Alumni account loses institutional email | Alumni cannot log in | Define verified alternate-email/account recovery before launch |
| R9 | External media links break | Incomplete game pages | Fallbacks and link-health review; preserve metadata |
| R10 | Scope expansion delays launch | Project becomes unmanageable | Phase gates and P0/P1/P2 prioritization |

## 2. Decision log

### Accepted
- Product name: **BISCAST Game Dev Central**.
- Audience: public showcase; authenticated eligible students submit and vote according to policy.
- Google AI Studio first for Phases 0–2.
- Antigravity second for Phases 3–8.
- Stack: React + TypeScript + Vite + Tailwind; Supabase; GitHub; Cloudflare Pages; itch.io; YouTube.
- Student submissions require moderation before publication.
- Game projects support multiple team members.
- Capstone Projects, Alumni Archive, and Hall of Fame are included in Phase 7.
- Avoid hosting game binaries and videos.

### Pending confirmation
- Astean email provider and supported authentication method.
- Institutional branding permission and official relationship/endorsement wording.
- Named administrators and moderator appointment process.
- Voting eligibility and election rules.
- Graduation verification and alumni recovery process.
- Privacy, consent, takedown, and retention policies.
- Whether public comments/ratings are wanted (not in initial scope).

## 3. Change control
Any change to stack, roles, authentication, database schema, voting rules, or privacy policy must:
1. Explain the reason.
2. Identify affected documents and phases.
3. Assess security, cost, and migration impact.
4. Obtain project-owner approval.
5. Update this decision log and related documents.
