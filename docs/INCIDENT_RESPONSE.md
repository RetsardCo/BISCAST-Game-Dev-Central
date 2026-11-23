# Incident Response Plan — BISCAST Game Dev Central

## 1. Purpose
Provide a repeatable response to security, privacy, availability, and data-integrity incidents.

## 2. Severity levels
- **SEV-1 Critical:** confirmed broad exposure, privileged account compromise, service-role key leak, destructive data loss, or active exploitation with serious impact.
- **SEV-2 High:** unauthorized access to private student data, voting integrity compromise, significant service outage, or exploitable high-impact vulnerability.
- **SEV-3 Medium:** limited security issue with containment available, repeated abuse, or partial feature outage.
- **SEV-4 Low:** minor defect, isolated suspicious activity, or low-impact operational issue.

Severity must be based on actual impact and reviewed as evidence develops.

## 3. Response roles
Assign named contacts before launch:
- Incident coordinator: TBD.
- Technical responder: TBD.
- Institutional/privacy contact or Data Protection Officer: TBD.
- Communications approver: TBD.
- Backup operator: TBD.

Do not publish sensitive incident details publicly without approval.

## 4. Response lifecycle
### Detect and record
- Record discovery time, reporter, affected system, symptoms, and evidence.
- Preserve relevant logs and timestamps.
- Avoid collecting unnecessary personal data.

### Triage
- Determine affected users, records, systems, and time window.
- Assign severity.
- Decide whether the issue is security, privacy, availability, or data integrity.

### Contain
- Disable affected feature or endpoint.
- Revoke compromised sessions/credentials.
- Rotate leaked secrets.
- Restrict affected accounts or storage objects.
- Preserve evidence before destructive cleanup where feasible.

### Investigate
- Identify root cause and attack path.
- Determine what data was accessed, changed, or exposed.
- Review audit logs and relevant provider logs.
- Record confidence and unknowns; do not speculate as fact.

### Eradicate and recover
- Patch vulnerability or configuration.
- Test fix in staging.
- Restore data if required.
- Verify RLS, auth, and critical workflows.
- Reopen functionality only after approval.

### Notify and document
- Escalate privacy incidents to the institution's designated privacy officer.
- Follow applicable Philippine Data Privacy Act/NPC requirements and institutional procedures. The responsible privacy officer/legal counsel must determine notification duties and deadlines; this document does not set legal deadlines.
- Notify affected users only through an approved communication process.
- Complete a post-incident review.

## 5. Special playbooks
### Exposed service-role key
1. Treat as compromised.
2. Revoke/rotate immediately using provider-supported process.
3. Search repository, CI logs, build artifacts, and deployment environment.
4. Review database/API activity during exposure window.
5. Remove secret from current code and history where appropriate.
6. Retest and document.

### Unauthorized data access
1. Restrict affected query/table/function.
2. Preserve logs.
3. Determine records and users affected.
4. Fix RLS/authorization.
5. Run negative authorization tests.
6. Escalate privacy assessment.

### Voting compromise
1. Pause voting event.
2. Preserve vote and audit data.
3. Determine whether votes were duplicated, forged, or altered.
4. Do not silently edit results.
5. Obtain authorized decision on recount, cancellation, or reopening.
6. Publish a transparent approved outcome.

### Data loss
1. Stop destructive operations.
2. Identify last known good backup.
3. Restore to an isolated environment.
4. Validate row counts, constraints, and critical records.
5. Obtain approval before replacing production data.

## 6. Post-incident review
Document timeline, root cause, impact, response effectiveness, corrective actions, owner, due date, and retest evidence.

## References
- Philippine National Privacy Commission: https://privacy.gov.ph/
- NPC breach management resources: https://privacy.gov.ph/
- NIST Incident Response: https://csrc.nist.gov/pubs/sp/800/61/r3/final
