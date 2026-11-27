import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Lock } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { getPublicGames } from '../lib/filters';
import {
  ACCOUNT_STATUS_LABELS,
  AWARD_CATEGORY_LABELS,
  CREDIT_ROLE_LABELS,
} from '../lib/formatters';
import { isStrictHttpsUrl } from '../lib/urlSafety';
import { ButtonLink } from '../components/ui/Button';
import { GameCard } from '../components/ui/GameCard';
import { EmptyState } from '../components/ui/States';

export function DeveloperProfilePage() {
  const { username } = useParams<{ username: string }>();
  const {
    profiles,
    games,
    gameMembers,
    categories,
    capstones,
    capstoneMembers,
    awards,
  } = usePrototypeStore();

  const profile = profiles.find((p) => p.username === username);

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Developer profile not found"
          description="No sample developer or alumni profile matches this username."
          action={<ButtonLink to="/games">Browse Explore Games</ButtonLink>}
        />
      </div>
    );
  }

  if (profile.profile_visibility === 'private') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-[#242433] bg-[#111118] p-8 text-center">
          <Lock className="mx-auto h-7 w-7 text-[#8E8EA6]" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-white">Profile set to Private</h1>
          <p className="mt-2 text-sm text-[#B8B8CA]">
            Per consent and privacy controls (FR-AUTH-05), this contributor has restricted public
            profile visibility. In Phase 3+, Supabase RLS enforces this rule at the database layer.
          </p>
          <div className="mt-6">
            <ButtonLink to="/games" variant="secondary">
              Return to Explore Games
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const publishedGames = getPublicGames(games);
  const creditedGames = publishedGames.filter((g) =>
    gameMembers.some((m) => m.game_id === g.id && m.profile_id === profile.id)
  );
  const creditedCapstones = capstones.filter(
    (c) =>
      c.moderation_status === 'published' &&
      capstoneMembers.some((m) => m.capstone_id === c.id && m.profile_id === profile.id)
  );
  const profileAwards = awards.filter((a) => a.published && a.profile_id === profile.id);

  const initials = profile.display_name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to={profile.account_status === 'alumni' ? '/alumni' : '/games'}
          className="inline-flex items-center gap-1.5 text-sm text-[#B8B8CA] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {profile.account_status === 'alumni' ? 'Back to Alumni Archive' : 'Back to Explore Games'}
        </Link>
      </nav>

      {/* Profile Header */}
      <section className="rounded-xl border border-[#242433] bg-[#111118] p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <div
              aria-hidden="true"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-[#34344A] bg-[#181822] font-display text-2xl font-bold text-[#C4B5FD]"
            >
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#8E8EA6]">
                <span className="font-medium text-[#C4B5FD]">
                  {ACCOUNT_STATUS_LABELS[profile.account_status]}
                </span>
                <span aria-hidden="true">·</span>
                <span>{profile.academic_batch}</span>
                {profile.graduation_year && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Graduated {profile.graduation_year}</span>
                  </>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-white">{profile.display_name}</h1>
              <p className="mt-1 font-mono text-xs text-[#8E8EA6]">@{profile.username}</p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#B8B8CA]">{profile.bio}</p>

              {profile.skills.length > 0 && (
                <p className="mt-4 text-xs text-[#D6D6E4]">
                  <span className="text-[#8E8EA6]">Skills &amp; Focus: </span>
                  {profile.skills.join(' · ')}
                </p>
              )}
            </div>
          </div>

          {profile.portfolio_links.length > 0 && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {profile.portfolio_links
                .filter((link) => isStrictHttpsUrl(link.url))
                .map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#2E2E42] bg-[#181822] px-3.5 text-xs font-medium text-white hover:bg-[#222230]"
                  >
                    {link.label}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ))}
            </div>
          )}
        </div>
        <p className="mt-6 border-t border-[#242433] pt-4 text-xs text-[#8E8EA6]">
          Privacy boundary: Institutional email addresses and private moderation notes are never
          exposed on public developer profiles.
        </p>
      </section>

      {/* Credited Games */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-white">Published Games ({creditedGames.length})</h2>
        {creditedGames.length === 0 ? (
          <p className="mt-3 text-sm text-[#8E8EA6]">No published sample games credited yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creditedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                members={gameMembers}
                profiles={profiles}
                categories={categories}
              />
            ))}
          </div>
        )}
      </section>

      {/* Capstones & Awards */}
      <div className="mt-12 grid grid-cols-1 gap-8 border-t border-[#242433] pt-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold text-white">
            Capstone Projects ({creditedCapstones.length})
          </h2>
          {creditedCapstones.length === 0 ? (
            <p className="mt-3 text-sm text-[#8E8EA6]">No published capstones credited.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {creditedCapstones.map((cap) => {
                const role = capstoneMembers.find(
                  (m) => m.capstone_id === cap.id && m.profile_id === profile.id
                )?.credit_role;
                return (
                  <article
                    key={cap.id}
                    className="rounded-xl border border-[#242433] bg-[#111118] p-5"
                  >
                    <p className="text-xs text-[#C4B5FD]">
                      AY {cap.academic_year}
                      {role ? ` · ${CREDIT_ROLE_LABELS[role]}` : ''}
                    </p>
                    <h3 className="mt-1.5 text-base font-semibold text-white">
                      <Link to={`/capstones/${cap.slug}`} className="hover:text-[#C4B5FD]">
                        {cap.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[#B8B8CA]">{cap.abstract}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-white">Awards &amp; Honors ({profileAwards.length})</h2>
          {profileAwards.length === 0 ? (
            <p className="mt-3 text-sm text-[#8E8EA6]">No individual awards recorded in sample data.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {profileAwards.map((award) => (
                <article
                  key={award.id}
                  className="rounded-xl border border-[#242433] bg-[#111118] p-5"
                >
                  <p className="text-xs text-[#C4B5FD]">
                    {AWARD_CATEGORY_LABELS[award.award_category]} · AY {award.academic_year}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold text-white">{award.name}</h3>
                  <p className="mt-2 text-sm text-[#B8B8CA]">{award.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
