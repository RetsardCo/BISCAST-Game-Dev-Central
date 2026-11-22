import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  Flag,
} from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { getPublicGames } from '../lib/filters';
import {
  CREDIT_ROLE_LABELS,
  formatUtcDate,
  GAME_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
} from '../lib/formatters';
import { isSafeHttpUrl } from '../lib/urlSafety';
import { Button, ButtonLink } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { GameCard } from '../components/ui/GameCard';
import { MediaImage } from '../components/ui/MediaImage';
import { StatusText, getGameStatusTone } from '../components/ui/StatusText';
import { YouTubeLazyEmbed } from '../components/ui/YouTubeLazyEmbed';
import { EmptyState } from '../components/ui/States';

export function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { games, gameMembers, profiles, categories, capstones, submitMockReport } =
    usePrototypeStore();

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Broken external link');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const game = games.find((g) => g.slug === slug);

  if (!game) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Game record not found"
          description="This project slug does not match any sample entry in the catalog, or the project has not been published."
          action={<ButtonLink to="/games">Back to Explore Games</ButtonLink>}
        />
      </div>
    );
  }

  const credits = gameMembers
    .filter((m) => m.game_id === game.id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((m) => ({
      member: m,
      profile: profiles.find((p) => p.id === m.profile_id),
    }));

  const gameCategories = game.category_ids
    .map((id) => categories.find((c) => c.id === id))
    .filter(Boolean);

  const linkedCapstone = game.capstone_id
    ? capstones.find((c) => c.id === game.capstone_id)
    : null;

  const relatedGames = getPublicGames(games)
    .filter(
      (candidate) =>
        candidate.id !== game.id &&
        (candidate.category_ids.some((id) => game.category_ids.includes(id)) ||
          candidate.academic_year === game.academic_year)
    )
    .slice(0, 3);

  const safeItchUrl = isSafeHttpUrl(game.itch_url) ? game.itch_url : null;

  const handleReportSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitMockReport({
      entity_type: 'game',
      entity_id: game.id,
      reason: reportReason,
      details: reportDetails.trim(),
    });
    setReportSubmitted(true);
    setReportDetails('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to="/games"
          className="inline-flex items-center gap-1.5 text-sm text-[#B8B8CA] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Explore Games
        </Link>
      </nav>

      {/* Non-Published Preview Warning if accessed directly from Student/Admin Prototype */}
      {game.status !== 'published' && (
        <div className="mb-6 rounded-xl border border-[#4C3C1D] bg-[#18150E] p-4 text-sm text-[#FBBF24]">
          Prototype Preview: This submission is currently{' '}
          <strong>{GAME_STATUS_LABELS[game.status]}</strong> and is hidden from public catalog
          queries.
        </div>
      )}

      {/* Header & Artwork Split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-[#242433] bg-[#111118]">
            <MediaImage
              src={game.cover_image_url}
              alt={`${game.title} cover artwork`}
              fallbackTitle={game.title}
              aspectClass="aspect-video"
              priority
            />
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#8E8EA6]">
              <StatusText
                label={GAME_STATUS_LABELS[game.status]}
                tone={getGameStatusTone(game.status)}
              />
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {game.academic_year} ({game.semester})
              </span>
              <span aria-hidden="true">·</span>
              <span>{PROJECT_TYPE_LABELS[game.project_type]}</span>
              <span aria-hidden="true">·</span>
              <span>{game.engine}</span>
            </div>

            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{game.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-[#D6D6E4]">
              {game.short_description}
            </p>
          </div>

          {/* Full Description */}
          <section className="mt-8 border-t border-[#242433] pt-8">
            <h2 className="text-xl font-semibold text-white">About this Project</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#B8B8CA] whitespace-pre-line">
              {game.description}
            </p>

            {game.content_warnings.length > 0 && (
              <div className="mt-6 rounded-xl border border-[#3B2E1E] bg-[#14110C] p-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#FBBF24]">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Content Notes
                </p>
                <p className="mt-1.5 text-sm text-[#D6D6E4]">
                  {game.content_warnings.join(' · ')}
                </p>
              </div>
            )}
          </section>

          {/* Linked Capstone Record */}
          {linkedCapstone && (
            <section className="mt-8 rounded-xl border border-[#2E2A45] bg-[#12111D] p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C4B5FD]">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    Linked Capstone Research Archive
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {linkedCapstone.title}
                  </p>
                </div>
                <ButtonLink to={`/capstones/${linkedCapstone.slug}`} variant="secondary" size="sm">
                  View Capstone
                </ButtonLink>
              </div>
            </section>
          )}

          {/* Trailer Embed (Lazy-Loaded) */}
          {game.trailer_url && (
            <section className="mt-10 border-t border-[#242433] pt-8">
              <h2 className="mb-4 text-xl font-semibold text-white">Trailer &amp; Gameplay</h2>
              <YouTubeLazyEmbed
                trailerUrl={game.trailer_url}
                posterUrl={game.cover_image_url}
                title={game.title}
              />
            </section>
          )}

          {/* Screenshots Gallery */}
          {game.screenshots.length > 0 && (
            <section className="mt-10 border-t border-[#242433] pt-8">
              <h2 className="text-xl font-semibold text-white">Screenshots &amp; Media</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {game.screenshots.map((shot, idx) => (
                  <button
                    key={shot.alt + idx}
                    type="button"
                    onClick={() => setLightboxIdx(idx)}
                    className="group overflow-hidden rounded-xl border border-[#242433] bg-[#111118] text-left cursor-pointer"
                  >
                    <MediaImage
                      src={shot.url}
                      alt={shot.alt}
                      fallbackTitle={shot.caption ?? game.title}
                      aspectClass="aspect-video"
                    />
                    {shot.caption && (
                      <p className="px-4 py-2.5 text-xs text-[#B8B8CA]">{shot.caption}</p>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Metadata & Action Sidebar */}
        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
            <h2 className="text-sm font-semibold text-white">Play &amp; External Hosting</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#8E8EA6]">
              Game builds are hosted externally on itch.io. BISCAST Game Dev Central does not host
              downloadable binaries.
            </p>
            <div className="mt-4">
              {safeItchUrl ? (
                <a
                  href={safeItchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9]"
                >
                  Open on itch.io
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : (
                <p className="text-xs text-[#FB7185]">External play link unavailable.</p>
              )}
            </div>

            <dl className="mt-6 space-y-3 border-t border-[#242433] pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#8E8EA6]">Academic Year</dt>
                <dd className="font-mono text-xs tabular-nums text-white">{game.academic_year}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8E8EA6]">Semester</dt>
                <dd className="text-white">{game.semester}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8E8EA6]">Project Type</dt>
                <dd className="text-white">{PROJECT_TYPE_LABELS[game.project_type]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8E8EA6]">Engine / Tools</dt>
                <dd className="text-white">{game.engine}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8E8EA6]">Genres</dt>
                <dd className="text-right text-white">
                  {gameCategories.map((c) => c!.name).join(', ')}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8E8EA6]">Published</dt>
                <dd className="tabular-nums text-white">{formatUtcDate(game.published_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Team Credits */}
          <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
            <h2 className="text-sm font-semibold text-white">Credits &amp; Team</h2>
            <ul className="mt-4 divide-y divide-[#242433]">
              {credits.map(({ member, profile }) => (
                <li
                  key={`${member.profile_id}-${member.credit_role}`}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    {profile ? (
                      <Link
                        to={`/developers/${profile.username}`}
                        className="text-sm font-medium text-white hover:text-[#C4B5FD]"
                      >
                        {profile.display_name}
                      </Link>
                    ) : (
                      <span className="text-sm text-white">Sample Contributor</span>
                    )}
                    <p className="text-xs text-[#8E8EA6]">
                      {CREDIT_ROLE_LABELS[member.credit_role]}
                    </p>
                  </div>
                  {profile && (
                    <Link
                      to={`/developers/${profile.username}`}
                      aria-label={`View ${profile.display_name} profile`}
                      className="text-xs text-[#C4B5FD] hover:text-white"
                    >
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Report Content Action (Privacy & Takedown Policy) */}
          <div className="rounded-xl border border-[#242433] bg-[#111118] p-5">
            <p className="text-xs leading-relaxed text-[#8E8EA6]">
              Notice a broken link, attribution error, or rights/privacy concern?
            </p>
            <button
              type="button"
              onClick={() => {
                setReportSubmitted(false);
                setReportOpen(true);
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#B8B8CA] hover:text-white cursor-pointer"
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              Report an issue (Prototype)
            </button>
          </div>
        </aside>
      </div>

      {/* Related Projects */}
      {relatedGames.length > 0 && (
        <section className="mt-16 border-t border-[#242433] pt-12">
          <h2 className="text-2xl font-bold text-white">Related Published Projects</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedGames.map((rel) => (
              <GameCard
                key={rel.id}
                game={rel}
                members={gameMembers}
                profiles={profiles}
                categories={categories}
              />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal for Screenshots */}
      <Dialog
        open={lightboxIdx !== null}
        onClose={() => setLightboxIdx(null)}
        title={
          lightboxIdx !== null
            ? game.screenshots[lightboxIdx]?.caption ?? `${game.title} Screenshot`
            : ''
        }
      >
        {lightboxIdx !== null && game.screenshots[lightboxIdx] && (
          <div className="space-y-3">
            <MediaImage
              src={game.screenshots[lightboxIdx].url}
              alt={game.screenshots[lightboxIdx].alt}
              fallbackTitle={game.title}
              aspectClass="aspect-video"
            />
            <p className="text-xs text-[#B8B8CA]">{game.screenshots[lightboxIdx].alt}</p>
          </div>
        )}
      </Dialog>

      {/* Report Content Modal */}
      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report Content or Attribution Issue"
        description="Prototype workflow per 10_PRIVACY_RETENTION_AND_CONTENT_POLICY.md. Reports remain in local browser memory only."
      >
        {reportSubmitted ? (
          <div className="space-y-4">
            <p className="text-sm text-[#34D399]">
              Sample report logged locally for moderation review. No backend notification was sent.
            </p>
            <Button onClick={() => setReportOpen(false)}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label htmlFor="report-reason" className="block text-xs font-medium text-[#B8B8CA]">
                Issue Category
              </label>
              <select
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
              >
                <option value="Broken external link">Broken external link</option>
                <option value="Incorrect team attribution">Incorrect team attribution</option>
                <option value="Rights or consent concern">Rights or consent concern</option>
                <option value="Confidential academic material">Confidential academic material</option>
              </select>
            </div>
            <div>
              <label htmlFor="report-details" className="block text-xs font-medium text-[#B8B8CA]">
                Details
              </label>
              <textarea
                id="report-details"
                rows={3}
                required
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe what needs moderator review..."
                className="mt-1.5 w-full rounded-lg border border-[#2E2E42] bg-[#09090D] p-3 text-sm text-white placeholder-[#8E8EA6]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Prototype Report</Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
