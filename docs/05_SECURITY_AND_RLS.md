# Security, Authentication, and RLS Plan

## 1. Core rule
Every table exposed through Supabase APIs must have Row Level Security enabled and explicit policies. Do not rely on frontend route guards for data security.

## 2. Authentication
- Verify ownership of an Astean email.
- Confirm whether BISCAST email is Google Workspace or another provider before choosing OAuth.
- If OAuth is used, validate verified email claims and allowed domain on a trusted path.
- If email OTP/magic link is used, configure a suitable SMTP provider and rate limits.
- Provide recovery and email-change procedures.
- Do not claim institutional verification merely because an address ends in the expected suffix.

## 3. RLS policy intent
### Profiles
- Public can read only profiles marked public and only fields intended for public display.
- A user can update their own permitted fields.
- Users cannot update account status, role, verification state, or moderation flags.
- Admin access is separately authorized.

### Games and capstones
- Public can read published/approved records.
- Submitters can read their own pending records.
- Submitters can edit permitted fields of their own records.
- Submitters cannot set `published`, `approved`, `reviewed_by`, or review timestamps.
- Moderators can review through privileged, validated operations.

### Votes
- Only eligible authenticated users can insert votes while the event is open.
- Unique constraints prevent duplicates.
- Voters cannot read other users' private vote identities.
- Results can be exposed through aggregate views/functions according to event policy.
- Clients cannot update/delete votes after submission unless a documented correction process exists.

### Roles and audit logs
- Users cannot write their own roles.
- Role changes require Super Admin authorization and audit logging.
- Audit logs are append-only to ordinary application users.

## 4. Trusted operations
Use database functions or a protected server-side function for operations requiring authorization beyond simple row ownership, including:
- Moderation transitions.
- Vote validation.
- Role assignment.
- Sensitive status transitions.
- Aggregated result publication.

Never place a service-role key in frontend code. Review function `SECURITY DEFINER` usage carefully, set a safe `search_path`, and validate caller authorization.

## 5. Abuse prevention
- Rate-limit sign-up, submission, and voting endpoints where supported.
- Validate and normalize user input.
- Restrict upload MIME types, size, and object paths.
- Prevent arbitrary external URL schemes.
- Sanitize rendered rich text; prefer Markdown with a safe renderer or plain text.
- Add spam/reporting and moderation procedures before opening public submissions.

## 6. Security acceptance tests
- Anonymous user cannot read pending submissions or private profiles.
- Student A cannot edit Student B's profile or submission.
- Student cannot approve their own game.
- Student cannot grant themselves moderator/admin roles.
- Duplicate vote is rejected at database level.
- Closed event rejects new votes even if API is called directly.
- Public cannot read voter identity data.
- Service-role secret is absent from built assets, source maps, and client environment.
