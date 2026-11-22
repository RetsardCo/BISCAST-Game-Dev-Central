# Data Model and Schema Plan

This is a logical schema proposal, not an executable migration. Antigravity must review relationships, constraints, indexes, and RLS before implementation.

## 1. Proposed tables

### `profiles`
- `id` UUID primary key referencing `auth.users.id`
- `display_name`
- `username` unique, normalized
- `bio`
- `avatar_path` or approved avatar URL
- `academic_batch`
- `year_level` (optional and time-sensitive; do not treat as permanent identity)
- `graduation_year` nullable
- `account_status` (`active_student`, `alumni`, `suspended`, `pending_verification`)
- `profile_visibility`
- `created_at`, `updated_at`

### `user_roles`
- `user_id`
- `role` (`student`, `moderator`, `super_admin`)
- `granted_by`
- `created_at`
- Only trusted admin operations can modify this table.

### `games`
- `id` UUID
- `title`, `slug`, `description`
- `genre/category` references
- `project_type` (class project, personal project, game jam, capstone, other)
- `academic_year`, `semester`
- `engine`
- `cover_image_url` or storage path
- `itch_url`, optional trailer URL
- `status` (`draft`, `pending_review`, `changes_requested`, `approved`, `published`, `rejected`, `archived`)
- `submitted_by`, `reviewed_by`, `reviewed_at`
- `created_at`, `updated_at`, `published_at`

### `game_members`
- `game_id`
- `profile_id`
- `credit_role` (developer, designer, artist, audio, writer, producer, other)
- `display_order`
- Unique `(game_id, profile_id, credit_role)` as appropriate.

### `categories`
- `id`, `name`, `slug`, `description`, `active`

### `announcements`
- `id`, `title`, `body`, `status`, `published_at`, `created_by`, timestamps.

### `competitions`
- `id`, `title`, `description`, `event_type` (game jam, showcase, voting event)
- `starts_at`, `ends_at`, `status`, `eligibility_policy`, `created_by`.

### `competition_entries`
- `competition_id`, `game_id`, eligibility/entry status.
- Unique `(competition_id, game_id)`.

### `votes`
- `id`, `competition_id`, `game_id`, `voter_profile_id`, `created_at`.
- Add a unique constraint matching the approved policy. For one vote per student per event: unique `(competition_id, voter_profile_id)`. If one vote per category is intended, include category in the key.
- Never rely on frontend button disabling as the duplicate-vote control.

### `awards`
- `id`, `name`, `description`, `academic_year`, `semester`, `competition_id` nullable, `game_id` nullable, `profile_id` nullable, `team_label` nullable, `awarded_at`, `published`.

### `capstone_projects`
- `id`, `title`, `slug`, `abstract`, `description`
- `academic_year`, `project_status`
- `adviser_display` (only if approved for publication)
- `documentation_url`, `publication_url`, `demo_url`
- `technology_stack`, media references, moderation status.
- Link team members through `capstone_members`.
- Optional relation to a `games` record.

### `capstone_members`
- `capstone_id`, `profile_id`, `credit_role`.

### `audit_logs`
- `id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `reason`, `created_at`.
- Append-only for application roles; no client update/delete.

### Optional `notifications`
Only add if an in-app notification feature is approved. Avoid building a complex notification system prematurely.

## 2. Important constraints
- Foreign keys and delete behavior must preserve published history.
- Prefer soft archival over cascading deletion for published content.
- Slugs must be unique.
- Validate URLs and text lengths.
- Index public filter columns and foreign keys.
- Store timestamps in UTC; render in the visitor's locale.
- Avoid duplicating game and capstone details; use relations where appropriate.
- Keep private moderation notes separate from public descriptions.

## 3. Data lifecycle
- Student graduation changes profile status; it does not delete profile or contributions.
- Account suspension should not automatically erase public historical credits.
- Account deletion requests require a documented privacy and attribution policy.
- Back up before destructive migrations.
