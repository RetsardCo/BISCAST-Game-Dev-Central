# Product Requirements Document (PRD)

## 1. Product goals
Deliver a low-cost, maintainable, public showcase for BISCAST BSEMC Game Development work, with authenticated student contribution workflows and administrative moderation.

## 2. Functional requirements

### 2.1 Public experience
- **FR-PUB-01:** Visitors can browse published games without signing in.
- **FR-PUB-02:** Visitors can search by title, developer/team, genre, academic year, and project type.
- **FR-PUB-03:** Visitors can filter by academic year, semester, genre, engine, and project type where data exists.
- **FR-PUB-04:** Each published game has a detail page with description, credits, cover, media links, and play/view links.
- **FR-PUB-05:** Visitors can browse announcements, competitions, game jams, awards, capstones, alumni, and Hall of Fame entries.
- **FR-PUB-06:** External links open safely; use appropriate `rel` attributes for new tabs.

### 2.2 Accounts and profiles
- **FR-AUTH-01:** Student registration must verify control of an eligible `@astean.biscast.edu.ph` email address.
- **FR-AUTH-02:** Domain matching alone is not proof of email ownership.
- **FR-AUTH-03:** Users can manage permitted profile fields.
- **FR-AUTH-04:** Profiles support a display name, biography, batch/academic information, skills/interests, avatar, and portfolio links.
- **FR-AUTH-05:** Public profile visibility is configurable and consent-based.
- **FR-AUTH-06:** Alumni status does not erase published contributions.
- **FR-AUTH-07:** Role assignment is privileged and cannot be self-selected.

### 2.3 Game submissions
- **FR-GAME-01:** Authenticated eligible students can submit a game.
- **FR-GAME-02:** A game supports one or more developers/team members.
- **FR-GAME-03:** Submission fields include title, description, genre, project type, academic year, semester, engine, cover URL or approved upload, itch.io URL, optional trailer URL, screenshots, and credits.
- **FR-GAME-04:** New submissions enter `pending_review` and are not publicly visible.
- **FR-GAME-05:** Moderators can approve, reject, or request changes with an internal reason.
- **FR-GAME-06:** Students can view their own submission status.
- **FR-GAME-07:** Changes to published content may require re-review according to moderation policy.
- **FR-GAME-08:** Only approved/published records appear in public queries.

### 2.4 Announcements and events
- **FR-COM-01:** Authorized staff can create, edit, publish, schedule (if implemented), and archive announcements.
- **FR-COM-02:** Competitions and game jams have descriptions, dates, eligibility, rules, and status.
- **FR-COM-03:** Event pages can link to external registration or submission resources.

### 2.5 Voting and awards
- **FR-VOTE-01:** Admins define a voting event, eligible entries, opening/closing timestamps, and eligibility policy.
- **FR-VOTE-02:** Only authenticated eligible users may vote.
- **FR-VOTE-03:** Duplicate votes are prevented by database constraints and trusted server-side logic.
- **FR-VOTE-04:** Voting cannot be submitted after the close time.
- **FR-VOTE-05:** Results visibility is configurable (hidden during voting; published after closure by default).
- **FR-VOTE-06:** Popularity rankings are distinct from juried awards.
- **FR-VOTE-07:** Admin actions affecting results are auditable.

### 2.6 Capstone showcase
- **FR-CAP-01:** Capstones have a dedicated section and detail pages.
- **FR-CAP-02:** Fields include title, abstract, team/researchers, adviser (if approved for publication), academic year, project status, technologies, demo/game link, documentation/publication link, cover/media, and acknowledgements.
- **FR-CAP-03:** Capstone records are moderated before publication.
- **FR-CAP-04:** A capstone may also link to a game record; do not duplicate the same project unnecessarily.
- **FR-CAP-05:** Sensitive, unpublished, confidential, or restricted research material must not be uploaded.

### 2.7 Alumni archive and Hall of Fame
- **FR-ALUM-01:** Admins can mark a profile as alumni after a defined verification process.
- **FR-ALUM-02:** Alumni profiles and published contributions remain accessible according to visibility and retention policy.
- **FR-ALUM-03:** Alumni status removes student-only privileges unless a policy explicitly grants otherwise.
- **FR-HOF-01:** Hall of Fame entries recognize developers, teams, games, and achievements.
- **FR-HOF-02:** Award records preserve category, year/semester, recipient, project, and citation/description.

## 3. Non-functional requirements
- **NFR-01 Performance:** optimize images; lazy-load noncritical media; avoid loading all records at once.
- **NFR-02 Accessibility:** semantic HTML, keyboard navigation, visible focus, adequate contrast, alt text, and reduced-motion support.
- **NFR-03 Responsive:** usable on mobile, tablet, and desktop.
- **NFR-04 Security:** RLS on every exposed table; validate privileged actions server-side.
- **NFR-05 Privacy:** collect only necessary personal data; provide clear visibility controls.
- **NFR-06 Maintainability:** typed models, documented migrations, modular components, and automated tests.
- **NFR-07 Reliability:** backups and restore procedures documented; free-tier limitations disclosed.
- **NFR-08 Portability:** keep content exportable and avoid unnecessary provider-specific coupling.

## 4. Release priorities
- P0: public library, game details, profiles, verified login, submissions, moderation, admin roles, basic archives.
- P1: announcements, game jams, capstones, alumni archive, Hall of Fame.
- P2: voting, rankings, awards automation, advanced analytics, scheduled publishing.
- Final release gate: security, privacy, accessibility, backup/restore, and deployment checks.
