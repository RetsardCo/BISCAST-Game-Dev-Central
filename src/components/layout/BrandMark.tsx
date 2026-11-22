/**
 * BrandMark — Neutral monogram placeholder for the project owner's supplied logo asset.
 * Per 06_UI_UX_SPECIFICATION.md: Do not invent an official BISCAST seal or institutional crest.
 * Antigravity / project owner can swap in `/public/brand/logo.svg` or `.png` here.
 */
export function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#4C3585] bg-[#18122B] font-display text-xs font-bold tracking-tight text-white"
    >
      BG
    </span>
  );
}
