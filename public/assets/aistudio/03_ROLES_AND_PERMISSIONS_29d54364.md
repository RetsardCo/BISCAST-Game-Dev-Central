# Roles and Permissions

## 1. Roles
### Visitor
- Browse public games, public profiles, announcements, capstones, alumni, awards, and Hall of Fame.
- Cannot submit, vote, or access private dashboards.

### Student
- Manage their own permitted profile fields.
- Submit games and capstone records.
- View their own submission statuses and moderation feedback.
- Vote in events for which they are eligible.
- Cannot approve their own submission or assign roles.

### Alumni
- Maintain permitted public profile and portfolio information.
- Retain access to their published contributions.
- Student-only submission/voting eligibility is disabled by default; policy may permit specific alumni events.

### Moderator
- Review assigned submissions.
- Approve, reject, or request revisions.
- Moderate announcements/events if granted.
- Cannot assign Super Admin privileges.
- Cannot alter voting records except through explicitly audited administrative procedures.

### Super Admin
- Manage roles and platform configuration.
- Manage moderators, content, competitions, awards, and exceptional moderation actions.
- Privileged actions must be auditable.

## 2. Permission matrix

| Action | Visitor | Student | Alumni | Moderator | Super Admin |
|---|---:|---:|---:|---:|---:|
| Read published games | Yes | Yes | Yes | Yes | Yes |
| Edit own profile | No | Yes | Yes | Yes | Yes |
| Submit game | No | Yes | Policy | Yes | Yes |
| Approve submission | No | No | No | Yes | Yes |
| Vote | No | Eligible | Policy | Policy | Policy |
| Publish announcement | No | No | No | If granted | Yes |
| Manage roles | No | No | No | No | Yes |
| View private moderation notes | No | Own feedback only | Own feedback only | Yes | Yes |

## 3. Security rules
- Role values must be controlled by trusted server-side logic or protected tables.
- Never trust a role value supplied by the browser.
- Users must not update their own role, approval status, vote count, or audit records.
- Use least privilege for moderators.
- Record actor, action, target, timestamp, and relevant reason for privileged actions.
- Define a recovery process for lost Super Admin access before launch.

## 4. Email eligibility
The allowed domain is intended to be `astean.biscast.edu.ph`. Confirm the real provider and institutional configuration. Domain suffix validation is not authentication. Require verified email ownership and, where possible, an institution-controlled OAuth/domain restriction.
