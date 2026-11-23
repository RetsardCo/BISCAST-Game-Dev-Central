# UI/UX Specification

## 1. Brand
**Name:** BISCAST Game Dev Central  
**Descriptor:** BSEMC · Game Development Community  
**Brand direction:** modern gaming/editorial platform; dark-first visual system with purple and white accents based on the approved logo.

Use the supplied logo asset provided by the project owner. Do not recreate, distort, recolor, or invent institutional marks. Keep logo placement and clear space consistent.

## 2. Visual principles
- Strong game artwork and readable typography.
- Dark background with restrained purple accents.
- Avoid excessive glow, gradients, glass effects, and visual clutter.
- Cards should prioritize title, creator, genre, academic year, and a clear action.
- Keep contrast accessible; purple text must remain readable against its background.
- Support reduced motion and keyboard interaction.
- Use consistent spacing, radii, typography, and iconography.

## 3. Public navigation
- Home
- Explore Games
- Academic Years
- Game Jams / Competitions
- Capstone Projects
- Awards / Hall of Fame
- Alumni
- Announcements
- About
- Sign In / Submit a Game

## 4. Key screens
### Home
- Hero statement and Explore Games CTA.
- Featured games.
- Latest published games.
- Current announcements/events.
- Recent awards or Hall of Fame spotlight.
- Clear student submission CTA.

### Explore Games
- Search field.
- Filters: academic year, semester, genre, engine, project type.
- Sort: newest, title; popularity only when a valid metric exists.
- Pagination or incremental loading.
- Empty, loading, and error states.

### Game detail
- Cover artwork.
- Title, synopsis, credits, academic period, genres, engine.
- Trailer embed if supplied and valid.
- itch.io link or supported embed.
- Screenshots with alt text.
- Related projects and developer links.
- Report-content action if approved.

### Developer profile
- Display name, biography, batch, skills, portfolio links.
- Published games and capstones.
- Awards and contributions.
- Visibility controls and public/private field separation.

### Student dashboard
- Profile completion.
- My submissions and statuses.
- Create submission.
- Feedback/revision requests.
- Eligible voting events.

### Admin dashboard
- Pending submissions queue.
- Review detail with approve/reject/request changes.
- Announcements and event management.
- Voting event setup and result controls.
- User/role management restricted to Super Admin.
- Audit history.

### Capstone archive
- Search/filter by academic year and status.
- Detail page with abstract, team, adviser where approved, documentation and demo links.

### Alumni archive / Hall of Fame
- Browse by graduation year/batch.
- Preserve public contributions.
- Awards and recognition history.

## 5. Responsive requirements
- Mobile-first layouts.
- No horizontal overflow at common phone widths.
- Navigation collapses accessibly.
- Cards reflow without clipping.
- Forms have labels, validation messages, and clear error states.
- Admin tables become usable stacked lists or horizontally scrollable regions on small screens.

## 6. Content and media
- Use optimized thumbnails.
- Lazy-load YouTube embeds and noncritical images.
- Do not autoplay audio/video.
- Provide poster images for video.
- Use explicit fallback when an external image fails.
- Never imply an external image is owned by the platform.
