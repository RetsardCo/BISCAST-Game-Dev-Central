import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Calendar, Award as AwardIcon } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { getPublicGames } from '../lib/filters';
import {
  AWARD_CATEGORY_LABELS,
  COMPETITION_STATUS_LABELS,
  formatUtcDate,
  PROJECT_TYPE_LABELS,
  RECOGNITION_TYPE_LABELS,
} from '../lib/formatters';
import { ButtonLink } from '../components/ui/Button';
import { GameCard } from '../components/ui/GameCard';
import { MediaImage } from '../components/ui/MediaImage';
import { StatusText, getGameStatusTone } from '../components/ui/StatusText';
import { PrototypeNotice } from '../components/ui/States';

export function HomePage() {
  const {
    games,
    gameMembers,
    profiles,
    categories,
    announcements,
    competitions,
    awards,
    capstones,
  } = usePrototypeStore();

  const publishedGames = getPublicGames(games);
  const featuredGames = publishedGames.filter((g) => g.featured);
  const heroSpotlight = featuredGames[0] ?? publishedGames[0];
  const latestGames = [...publishedGames]
    .sort(
      (a, b) =>
        new Date(b.published_at ?? b.created_at).getTime() -
        new Date(a.published_at ?? a.created_at).getTime()
    )
    .slice(0, 6);

  const publicAnnouncements = announcements
    .filter((a) => a.status === 'published')
    .slice(0, 3);
  const spotlightAwards = awards.filter((a) => a.published).slice(0, 3);
  const activeEvents = competitions.filter((c) => c.status === 'open' || c.status === 'upcoming');
  const academicYearsRepresented = new Set(publishedGames.map((g) => g.academic_year)).size;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      {/* Phase 2 Transparent Prototype Disclosure */}
      <div className="mb-10">
        <PrototypeNotice
          title="Phase 0–2 Frontend Prototype — Sample Dataset Active"
          description="All games, developer profiles, capstones, events, and awards shown here are clearly labeled sample entries. Live Astean authentication, Supabase database persistence, and RLS will be integrated in Phases 3–8."
          action={
            <Link
              to="/about"
              className="text-xs font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
            >
              View scope &amp; TBD log
            </Link>
          }
        />
      </div>

      {/* Split-Screen Editorial Hero */}
      <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-xl border border-[#242433] bg-[#111118] p-7 sm:p-10 lg:col-span-6">
          <div>
            <p className="text-sm font-medium text-[#C4B5FD]">
              BSEMC · Game Development Community
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Discover student-built games and capstone archives.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#B8B8CA]">
              BISCAST Game Dev Central curates playable student coursework, game jam entries,
              research capstones, and alumni portfolios across academic years—giving creators clear
              attribution and long-term preservation.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink to="/games" size="lg">
              Explore Games
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <Link
              to="/submit"
              className="inline-flex min-h-[44px] items-center px-2 text-sm font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
            >
              Submit a student project
            </Link>
          </div>
        </div>

        {/* Hero Visual Anchor: Featured Sample Game */}
        {heroSpotlight && (
          <Link
            to={`/games/${heroSpotlight.slug}`}
            className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-xl border border-[#242433] bg-[#111118] lg:col-span-6"
          >
            <div className="absolute inset-0">
              <MediaImage
                src={heroSpotlight.cover_image_url}
                alt={`${heroSpotlight.title} featured cover artwork`}
                fallbackTitle={heroSpotlight.title}
                aspectClass="h-full w-full"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090D] via-[#09090D]/55 to-transparent" />
            </div>

            <div className="relative z-10 p-7 sm:p-8">
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#D6D6E4]">
                <span className="font-medium text-[#C4B5FD]">Featured Sample</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{heroSpotlight.academic_year}</span>
                <span aria-hidden="true">·</span>
                <span>{PROJECT_TYPE_LABELS[heroSpotlight.project_type]}</span>
                <span aria-hidden="true">·</span>
                <span>{heroSpotlight.engine}</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white transition-colors group-hover:text-[#C4B5FD] sm:text-3xl">
                {heroSpotlight.title}
              </h2>
              <p className="mt-2 line-clamp-2 max-w-lg text-sm text-[#D6D6E4]">
                {heroSpotlight.short_description}
              </p>
            </div>
          </Link>
        )}
      </section>

      {/* Full-Width Sample Catalog Summary Strip (Clearly Labeled Sample Counts) */}
      <section
        aria-label="Sample catalog overview"
        className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#242433] bg-[#242433] lg:grid-cols-4"
      >
        <div className="bg-[#111118] p-5">
          <p className="text-xs text-[#8E8EA6]">Published Sample Games</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-white">
            {publishedGames.length}
          </p>
        </div>
        <div className="bg-[#111118] p-5">
          <p className="text-xs text-[#8E8EA6]">Sample Capstone Entries</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-white">
            {capstones.filter((c) => c.moderation_status === 'published').length}
          </p>
        </div>
        <div className="bg-[#111118] p-5">
          <p className="text-xs text-[#8E8EA6]">Sample Academic Years</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-white">
            {academicYearsRepresented}
          </p>
        </div>
        <div className="bg-[#111118] p-5">
          <p className="text-xs text-[#8E8EA6]">Open / Upcoming Sample Events</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-white">
            {activeEvents.length}
          </p>
        </div>
      </section>

      {/* Featured Sample Showcase */}
      {featuredGames.length > 0 && (
        <section className="mt-16" aria-labelledby="featured-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="featured-heading" className="text-2xl font-bold text-white sm:text-3xl">
                Featured Projects
              </h2>
              <p className="mt-1 text-sm text-[#B8B8CA]">
                Curated coursework, jam highlights, and capstone playable links from the sample catalog.
              </p>
            </div>
            <Link
              to="/games"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
            >
              Browse full library
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                members={gameMembers}
                profiles={profiles}
                categories={categories}
                featuredLayout
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest Published Games */}
      <section className="mt-16 border-t border-[#242433] pt-14" aria-labelledby="latest-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="latest-heading" className="text-2xl font-bold text-white sm:text-3xl">
              Latest Published Games
            </h2>
            <p className="mt-1 text-sm text-[#B8B8CA]">
              Only moderator-approved entries appear in public catalog views.
            </p>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link to="/archives" className="text-[#B8B8CA] hover:text-white whitespace-nowrap">
              By Academic Year
            </Link>
            <Link to="/categories" className="text-[#C4B5FD] hover:text-white whitespace-nowrap">
              By Category
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              members={gameMembers}
              profiles={profiles}
              categories={categories}
            />
          ))}
        </div>
      </section>

      {/* Announcements, Events & Hall of Fame Spotlight */}
      <section className="mt-16 grid grid-cols-1 gap-10 border-t border-[#242433] pt-14 lg:grid-cols-12">
        {/* Announcements & Events */}
        <div className="lg:col-span-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Announcements &amp; Events</h2>
              <p className="mt-1 text-sm text-[#B8B8CA]">
                Submission windows, community game jams, and voting schedules.
              </p>
            </div>
            <Link
              to="/events"
              className="text-sm font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
            >
              All events
            </Link>
          </div>

          <div className="mt-6 divide-y divide-[#242433] border-y border-[#242433]">
            {publicAnnouncements.map((item) => (
              <article key={item.id} className="py-5">
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#8E8EA6]">
                  <span className="font-medium text-[#C4B5FD]">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <time className="tabular-nums">{formatUtcDate(item.published_at)}</time>
                </div>
                <h3 className="mt-1.5 text-base font-semibold text-white">
                  <Link to="/events" className="hover:text-[#C4B5FD]">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#B8B8CA]">{item.summary}</p>
              </article>
            ))}
          </div>

          {activeEvents.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs font-medium text-[#8E8EA6]">Active &amp; Upcoming Events</p>
              {activeEvents.map((comp) => (
                <div
                  key={comp.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-[#242433] bg-[#111118] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <StatusText
                        label={COMPETITION_STATUS_LABELS[comp.status]}
                        tone={getGameStatusTone(comp.status)}
                      />
                      <span aria-hidden="true" className="text-[#8E8EA6]">·</span>
                      <span className="inline-flex items-center gap-1 text-[#8E8EA6] tabular-nums">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatUtcDate(comp.starts_at)} – {formatUtcDate(comp.ends_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-white">{comp.title}</p>
                  </div>
                  <ButtonLink
                    to={comp.event_type === 'voting_event' ? '/voting' : '/events'}
                    variant="secondary"
                    size="sm"
                  >
                    {comp.event_type === 'voting_event' ? 'Open Ballot' : 'View Event'}
                  </ButtonLink>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hall of Fame Spotlight */}
        <div className="lg:col-span-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Hall of Fame</h2>
              <p className="mt-1 text-sm text-[#B8B8CA]">
                Preserved juried awards and community honors.
              </p>
            </div>
            <Link
              to="/hall-of-fame"
              className="text-sm font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
            >
              View archive
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {spotlightAwards.map((award) => {
              const linkedGame = games.find((g) => g.id === award.game_id);
              return (
                <article
                  key={award.id}
                  className="rounded-xl border border-[#242433] bg-[#111118] p-5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[#8E8EA6]">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#C4B5FD]">
                      <AwardIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {AWARD_CATEGORY_LABELS[award.award_category]}
                    </span>
                    <span className="tabular-nums">{award.academic_year}</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-white">{award.name}</h3>
                  <p className="mt-1 text-xs text-[#8E8EA6]">
                    {RECOGNITION_TYPE_LABELS[award.recognition_type]}
                    {award.team_label ? ` · ${award.team_label}` : ''}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#B8B8CA]">
                    {award.description}
                  </p>
                  {linkedGame && (
                    <Link
                      to={`/games/${linkedGame.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#C4B5FD] hover:text-white"
                    >
                      Inspect {linkedGame.title}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Student Submission CTA */}
      <section className="mt-16 rounded-xl border border-[#2E2A45] bg-[#111118] p-8 sm:p-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Built a game or capstone this semester?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#B8B8CA]">
              Students submit metadata, team credits, and external itch.io or YouTube links for
              moderator review. Try the Phase 2 submission form and review queue locally to preview
              the complete workflow before Supabase integration.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <ButtonLink to="/submit">Submit a Game</ButtonLink>
            <ButtonLink to="/dashboard" variant="secondary">
              Student Dashboard
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
