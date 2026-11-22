# Design Tokens & Logo Guidelines — BISCAST Game Dev Central

## Brand Identity
- **Product Name:** BISCAST Game Dev Central
- **Descriptor:** BSEMC · Game Development Community
- **Direction:** Dark-first modern gaming/editorial showcase with restrained purple and crisp white accents.

## Logo Usage (`src/components/layout/BrandMark.tsx`)
No owner-supplied logo image file was included in the Phase 0–2 workspace. Per `06_UI_UX_SPECIFICATION.md`, no official BISCAST seal or institutional crest was invented.
- Current placeholder: Minimal `32px × 32px` neutral geometric monogram (`BG`) in `#18122B` with `#4C3585` hairline border.
- **To apply the owner-supplied logo:** Place the approved SVG/PNG asset in `/public/brand/` and replace the inner monogram inside `src/components/layout/BrandMark.tsx` while preserving `h-8 w-8 shrink-0` clear space and avoiding distortion or recoloring.

## Color Tokens (`src/index.css`)
Follows a strict **60-30-10** dark-first budget with WCAG AA contrast:

| Token | Hex / Value | Usage |
|---|---|---|
| `--color-canvas` | `#09090D` | 60% Primary page canvas |
| `--color-surface` | `#111118` | 30% Structural cards, headers, tables |
| `--color-surface-elevated` | `#181822` | Secondary buttons, interactive hover surfaces |
| `--color-border-hairline` | `#242433` | Subtle 1px structural dividers |
| `--color-border-strong` | `#34344A` | Input fields, secondary button borders |
| `--color-ink-primary` | `#F8F8FA` | Primary headings and body copy |
| `--color-ink-secondary` | `#B8B8CA` | Descriptions and secondary copy |
| `--color-ink-muted` | `#8E8EA6` | Quiet metadata, dates, captions |
| `--color-brand` | `#7C3AED` | 10% Primary CTA buttons, active tabs |
| `--color-brand-hover` | `#6D28D9` | Primary CTA hover |
| `--color-brand-text` | `#C4B5FD` | Accessible purple text on dark surfaces (>9.5:1 contrast on `#09090D`) |
| `--color-status-success` | `#34D399` | Published / Approved / Open text state |
| `--color-status-warning` | `#FBBF24` | Pending Review / Upcoming text state |
| `--color-status-danger` | `#FB7185` | Changes Requested / Rejected / Error text state |
| `--color-status-neutral` | `#94A3B8` | Archived / Draft text state |

## Typography (`index.html` + `src/index.css`)
- **Display / Headings:** `Bricolage Grotesque` (600, 700), `text-wrap: balance`
- **Body / UI:** `Plus Jakarta Sans` (400, 500, 600, 700)
- **Data / Dates / Metrics:** `JetBrains Mono` (400, 500) with `font-variant-numeric: tabular-nums`

## Accessibility & Motion
- Visible focus rings (`:focus-visible` 2px `#C4B5FD` outline, 2px offset).
- Skip-to-main-content link in `PageShell.tsx`.
- Semantic status communication always pairs explicit text labels with semantic colors (never color alone; zero pill-badge clutter on cards).
- Full `@media (prefers-reduced-motion: reduce)` support.
- All interactive controls meet minimum touch/click target height (`36px–48px`).
