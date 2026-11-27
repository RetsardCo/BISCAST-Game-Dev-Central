import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ExternalLink, Gamepad2 } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { CAPSTONE_STATUS_LABELS, CREDIT_ROLE_LABELS, formatUtcDate } from '../lib/formatters';
import { isStrictHttpsUrl } from '../lib/urlSafety';
import { ButtonLink } from '../components/ui/Button';
import { MediaImage } from '../components/ui/MediaImage';
import { StatusText, getGameStatusTone } from '../components/ui/StatusText';
import { YouTubeLazyEmbed } from '../components/ui/YouTubeLazyEmbed';
import { EmptyState } from '../components/ui/States';

export function CapstoneDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { capstones, capstoneMembers, profiles, games } = usePrototypeStore();

  const capstone = capstones.find((c) => c.slug === slug);

  if (!capstone) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Capstone record not found"
          description="No published sample capstone matches this URL."
          action={<ButtonLink to="/capstones">Back to Capstone Projects</ButtonLink>}
        />
      </div>
    );
  }

  const members = capstoneMembers
    .filter((m) => m.capstone_id === capstone.id)
    .map((m) => ({
      member: m,
      profile: profiles.find((p) => p.id === m.profile_id),
    }));

  const linkedGame = capstone.linked_game_id
    ? games.find((g) => g.id === capstone.linked_game_id && g.status === 'published')
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to="/capstones"
          className="inline-flex items-center gap-1.5 text-sm text-[#B8B8CA] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Capstone Projects
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-[#242433] bg-[#111118]">
            <MediaImage
              src={capstone.cover_image_url}
              alt={`${capstone.title} cover image`}
              fallbackTitle={capstone.title}
              aspectClass="aspect-video"
              priority
            />
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#8E8EA6]">
              <StatusText
                label={CAPSTONE_STATUS_LABELS[capstone.project_status]}
                tone={getGameStatusTone(capstone.project_status)}
              />
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">AY {capstone.academic_year}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#C4B5FD]">{capstone.project_category}</span>
            </div>

            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{capstone.title}</h1>
            <p className="mt-2 text-xs text-[#8E8EA6]">{capstone.program_context}</p>
          </div>

          <section className="mt-8 border-t border-[#242433] pt-8">
            <h2 className="text-xl font-semibold text-white">Abstract</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#D6D6E4]">{capstone.abstract}</p>

            <h2 className="mt-8 text-xl font-semibold text-white">Project Overview</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#B8B8CA]">
              {capstone.description}
            </p>

            {capstone.acknowledgements && (
              <div className="mt-8 border-t border-[#242433] pt-6">
                <h2 className="text-base font-semibold text-white">Acknowledgements</h2>
                <p className="mt-2 text-sm text-[#B8B8CA]">{capstone.acknowledgements}</p>
              </div>
            )}
          </section>

          {linkedGame && (
            <section className="mt-8 rounded-xl border border-[#2E2A45] bg-[#12111D] p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C4B5FD]">
                    <Gamepad2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Linked Playable Game Record
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">{linkedGame.title}</p>
                </div>
                <ButtonLink to={`/games/${linkedGame.slug}`} size="sm">
                  Open Game Page
                </ButtonLink>
              </div>
            </section>
          )}

          {capstone.trailer_url && (
            <section className="mt-10 border-t border-[#242433] pt-8">
              <h2 className="mb-4 text-xl font-semibold text-white">Demo Video</h2>
              <YouTubeLazyEmbed
                trailerUrl={capstone.trailer_url}
                posterUrl={capstone.cover_image_url}
                title={capstone.title}
              />
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
            <h2 className="text-sm font-semibold text-white">Archive Metadata &amp; Links</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#8E8EA6]">Academic Year</dt>
                <dd className="font-mono text-xs tabular-nums text-white">
                  {capstone.academic_year}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#8E8EA6]">Published</dt>
                <dd className="tabular-nums text-white">
                  {formatUtcDate(capstone.published_at)}
                </dd>
              </div>
              {capstone.adviser_display && (
                <div className="border-t border-[#242433] pt-3">
                  <dt className="text-xs text-[#8E8EA6]">Adviser (Consent-Gated)</dt>
                  <dd className="mt-1 text-sm text-white">{capstone.adviser_display}</dd>
                </div>
              )}
              <div className="border-t border-[#242433] pt-3">
                <dt className="text-xs text-[#8E8EA6]">Technologies &amp; Tools</dt>
                <dd className="mt-1 text-sm text-[#D6D6E4]">
                  {capstone.technology_stack.join(' · ')}
                </dd>
              </div>
            </dl>

            <div className="mt-6 space-y-2.5 border-t border-[#242433] pt-5">
              {isStrictHttpsUrl(capstone.demo_url) && (
                <a
                  href={capstone.demo_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 text-sm font-medium text-white hover:bg-[#6D28D9]"
                >
                  Open Playable Demo
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {isStrictHttpsUrl(capstone.documentation_url) && (
                <a
                  href={capstone.documentation_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-[#2E2E42] bg-[#181822] px-4 text-sm font-medium text-white hover:bg-[#222230]"
                >
                  Public Documentation
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <p className="text-[11px] leading-relaxed text-[#8E8EA6]">
                Only approved public documentation links are permitted; confidential thesis files
                are excluded by policy.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
            <h2 className="text-sm font-semibold text-white">Researchers &amp; Team</h2>
            <ul className="mt-4 divide-y divide-[#242433]">
              {members.map(({ member, profile }) => (
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
                      <span className="text-sm text-white">Sample Researcher</span>
                    )}
                    <p className="text-xs text-[#8E8EA6]">
                      {CREDIT_ROLE_LABELS[member.credit_role]}
                    </p>
                  </div>
                  {profile && (
                    <Link
                      to={`/developers/${profile.username}`}
                      aria-label={`View ${profile.display_name}`}
                      className="text-[#C4B5FD] hover:text-white"
                    >
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
