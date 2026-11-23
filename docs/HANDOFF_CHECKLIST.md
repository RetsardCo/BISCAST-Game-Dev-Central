# AI Studio → Antigravity Handoff Checklist

## Before handoff (Google AI Studio)
- [ ] Phase 0–2 scope completed.
- [ ] Project builds successfully.
- [ ] GitHub synchronization is active.
- [ ] Phase 2 baseline commit/tag created.
- [ ] No production backend or credentials included.
- [ ] No Firebase-specific dependencies or configuration.
- [ ] Routes and components documented.
- [ ] Mock data contracts documented.
- [ ] Design tokens and logo usage documented.
- [ ] Responsive checks completed.
- [ ] Known issues listed.
- [ ] Unresolved institutional decisions listed.
- [ ] Setup/build instructions verified.

## On receipt (Antigravity)
- [ ] Clone/import the correct repository.
- [ ] Inspect branch, commit, and working tree.
- [ ] Install dependencies using the committed lockfile.
- [ ] Run build and tests.
- [ ] Review dependencies and scripts.
- [ ] Review routing, form validation, URL handling, and unsafe rendering.
- [ ] Review accessibility and responsive behavior.
- [ ] Map mock models to proposed database schema.
- [ ] Identify code that assumes mock-only behavior.
- [ ] Produce an audit report.
- [ ] Obtain approval before Phase 3.

## Handoff report template
```md
# Handoff Report

## Repository
- URL:
- Branch:
- Commit/tag:

## Build
- Command:
- Result:

## Completed screens
- ...

## Components and routes
- ...

## Mock data contracts
- ...

## Known issues
- ...

## Security notes
- ...

## Unresolved decisions
- ...

## Recommended next steps
- ...
```

## Stop conditions
Do not proceed if:
- The app does not build.
- GitHub source is incomplete or inconsistent.
- Secrets are present.
- The email verification assumptions are unverified and block implementation.
- There are unresolved schema/role decisions that materially affect security.
