# AI Agent Rules and Coding Standards

These rules apply to Google AI Studio and Antigravity. Phase-specific instructions are in their respective master prompts.

## 1. Mandatory behavior
1. Read the project documentation before coding.
2. Follow the approved phase boundary.
3. Do not silently change the technology stack.
4. Do not invent institutional facts, email configuration, policies, or permissions.
5. Mark unresolved items as `TBD` and ask for confirmation when blocking.
6. Preserve existing working behavior unless a change is approved.
7. Make small, reviewable changes.
8. Run relevant checks after changes and report actual results.
9. Never claim tests passed unless they were run.
10. Never commit secrets, private data, or production credentials.

## 2. Code quality
- TypeScript strict mode where practical.
- Avoid `any`; use explicit types and validated unknown input.
- Keep components focused and reusable.
- Separate UI, data access, validation, and business logic.
- Avoid premature abstractions and unnecessary dependencies.
- Use semantic HTML and accessible form labels.
- Handle loading, empty, error, and success states.
- Keep user-facing errors understandable and avoid leaking internal details.

## 3. Security
- Frontend route guards are UX, not authorization.
- RLS and trusted server/database logic enforce access.
- Never expose service-role keys.
- Never trust client-supplied role, ownership, status, vote count, or timestamps.
- Validate all user input and external URLs.
- Audit privileged operations.

## 4. Git discipline
- Use descriptive branches and commits.
- Do not rewrite shared history without approval.
- Do not force-push.
- Keep generated files and dependencies intentional.
- Commit only after tests and build checks.
- Keep `.env` files out of Git; maintain `.env.example` with placeholders only.

## 5. Reporting format after each task
Report:
- What changed.
- Files created/modified.
- Tests/checks actually run and results.
- Known issues.
- Decisions needed.
- Next recommended task.

## 6. Phase discipline
AI Studio must stop after Phase 2 and prepare a handoff. Antigravity must audit the imported project before Phase 3. Neither agent may skip acceptance gates without explicit approval.
