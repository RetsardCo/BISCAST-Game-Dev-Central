# Dependency Management — BISCAST Game Dev Central

## 1. Objectives
Reduce risks from vulnerable, abandoned, compromised, or unnecessary packages.

## 2. Package policy
- Use dependencies only when they provide clear value.
- Prefer maintained packages with active security response.
- Review package ownership, maintenance activity, license, and transitive dependencies.
- Avoid unpinned wildcard versions in application dependencies.
- Commit the package lockfile.
- Use `npm ci` in CI for reproducible installation.
- Remove unused dependencies.
- Do not install packages suggested by an AI agent without reviewing purpose and risk.

## 3. Automated checks
Run:
- `npm audit` (review severity and exploitability; do not blindly apply breaking fixes).
- GitHub Dependabot alerts and security updates where enabled.
- Dependency review on pull requests where available.
- Secret scanning.
- SAST/code scanning where supported.

## 4. Update process
1. Review alert and affected dependency path.
2. Determine whether package is direct or transitive.
3. Check fixed version and release notes.
4. Update in a dedicated branch.
5. Run typecheck, lint, unit, integration, E2E, and build.
6. Review lockfile changes.
7. Merge through protected PR process.
8. Deploy and monitor.

## 5. Severity handling
- Critical/high exploitable vulnerability in a reachable production path: prioritize immediate mitigation and release.
- Medium/low: schedule based on exploitability, exposure, and maintenance window.
- If no fix exists, document exposure, compensating control, owner, and review date.

Do not equate every audit warning with an exploitable vulnerability; investigate reachability and context. Do not dismiss advisories without evidence.

## 6. Supply-chain safeguards
- Use trusted registries.
- Review install scripts and unexpected package behavior.
- Pin GitHub Actions to full commit SHAs where practical.
- Limit CI token permissions.
- Do not execute untrusted pull-request code with production secrets.
- Review generated lockfile changes.
- Rotate credentials if a compromised dependency may have accessed them.

## 7. License review
Track direct dependencies and licenses. Confirm compatibility with project distribution and institutional policy. Escalate unclear or restrictive licenses before release.

## 8. Evidence
Maintain dependency scan reports, update PRs, exceptions, and remediation records.

## References
- GitHub Dependabot: https://docs.github.com/en/code-security/dependabot
- GitHub dependency review: https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review
- npm audit: https://docs.npmjs.com/cli/commands/npm-audit
