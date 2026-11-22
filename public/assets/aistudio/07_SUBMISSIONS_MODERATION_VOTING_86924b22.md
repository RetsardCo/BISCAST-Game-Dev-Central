# Submissions, Moderation, Competitions, and Voting

## 1. Submission workflow
`draft -> pending_review -> approved/published`  
Alternative outcomes: `changes_requested`, `rejected`, `archived`.

1. Student authenticates.
2. Student completes required metadata and credits.
3. System validates required fields and links.
4. Submission is stored as pending.
5. Moderator reviews quality, eligibility, rights/consent, links, and attribution.
6. Moderator approves, requests changes, or rejects with a reason.
7. Approved record becomes publicly queryable.
8. Significant edits to published content may return it to review.

## 2. Required submission fields
- Game title.
- Short description and full description.
- Primary developer and all team members.
- Academic year and semester.
- Project type (class project, capstone, personal, game jam, other).
- Genre/category.
- Engine (optional if unknown).
- itch.io URL or other approved play/demo URL.
- Cover image URL or approved upload.
- Optional trailer and screenshots.
- Content warnings where relevant.
- Confirmation that submitter has permission to share all materials.

## 3. Moderation checklist
- Is the submitter eligible?
- Is the game link accessible and correctly attributed?
- Are team members credited accurately?
- Does the submitter have rights/permission for artwork, music, screenshots, and video?
- Does the page contain personal data that should not be public?
- Are descriptions and links safe and appropriate?
- Is the academic year/project type accurate?
- Are any capstone materials confidential or unpublished?

## 4. Competitions and game jams
Each event should define:
- Name and type.
- Organizer.
- Start/end dates and timezone.
- Eligibility.
- Theme/rules.
- Submission deadline and required links.
- Judging criteria or voting policy.
- Results publication date.
- Archived event page after completion.

## 5. Voting policy
Before enabling voting, administrators must approve:
- Who is eligible (active students only by default; define exceptions).
- Whether one vote per event, per category, or per entry is allowed.
- Whether voters may vote for their own project.
- Whether results are hidden during voting.
- How ties and disputes are resolved.
- Whether moderators/admins can vote.
- How fraudulent activity is investigated.

### Technical enforcement
- Enforce uniqueness with database constraints.
- Validate event open/close timestamps in trusted database logic.
- Do not trust client clocks or hidden buttons.
- Avoid exposing individual voter identities publicly.
- Keep a tamper-evident audit trail for administrative corrections.
- Publish aggregate results only according to event settings.

### Ranking distinction
- **Community Choice / popularity:** based on eligible votes.
- **Jury awards:** based on documented judging criteria and authorized judges.
- Do not equate vote count with technical or artistic merit.

## 6. Announcements
Announcements need title, body, author, status, publication date, optional expiry, and category. Drafts and scheduled posts are not public. Provide a clear archive.
