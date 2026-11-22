import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { getPublicGames } from '../lib/filters';
import { EmptyState, PrototypeNotice } from '../components/ui/States';

export function AlumniArchivePage() {
  const { profiles, games, gameMembers, capstones, capstoneMembers, awards } =
    usePrototypeStore();
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  const alumniProfiles = useMemo(
    () =>
      profiles.filter(
        (p) => p.account_status === 'alumni' && p.profile_visibility !== 'private'
      ),
    [profiles]
  );

  const batches = useMemo(
    () =>
      Array.from(
        new Set(
          alumniProfiles.map((p) => (p.graduation_year ? String(p.graduation_year) : p.academic_batch))
        )
      )
        .sort()
        .reverse(),
    [alumniProfiles]
  );

  const visibleAlumni =
    selectedBatch === 'all'
      ? alumniProfiles
      : alumniProfiles.filter(
          (p) =>
            String(p.graduation_year ?? '') === selectedBatch || p.academic_batch === selectedBatch
        );

  const publishedGames = getPublicGames(games);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#242433] pb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Alumni Archive</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#B8B8CA]">
          Preserving the public portfolios, game credits, capstone research, and honors of graduated
          BSEMC Game Development contributors. Transitioning to alumni status removes student-only
          privileges by default while keeping published history intact.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter alumni by graduation batch">
          <button
            type="button"
            onClick={() => setSelectedBatch('all')}
            className={`min-h-[38px] rounded-lg px-4 text-xs font-medium cursor-pointer ${
              selectedBatch === 'all'
                ? 'bg-[#7C3AED] text-white'
                : 'border border-[#242433] bg-[#111118] text-[#B8B8CA] hover:text-white'
            }`}
          >
            All Batches
          </button>
          {batches.map((batch) => (
            <button
              key={batch}
              type="button"
              onClick={() => setSelectedBatch(batch)}
              className={`min-h-[38px] rounded-lg px-4 text-xs font-medium tabular-nums cursor-pointer ${
                selectedBatch === batch
                  ? 'bg-[#7C3AED] text-white'
                  : 'border border-[#242433] bg-[#111118] text-[#B8B8CA] hover:text-white'
              }`}
            >
              Class of {batch}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <PrototypeNotice
          title="Graduation Verification Policy: TBD (Phase 7)"
          description="Graduating accounts are transitioned manually by authorized administrators once institutional verification rules and alternate-email recovery procedures are approved."
        />
      </div>

      {visibleAlumni.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No alumni profiles in this batch"
            description="Sample alumni entries appear here once verified and opted into public visibility."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleAlumni.map((alumnus) => {
            const gameCount = gameMembers.filter(
              (m) =>
                m.profile_id === alumnus.id &&
                publishedGames.some((g) => g.id === m.game_id)
            ).length;
            const capstoneCount = capstoneMembers.filter(
              (m) =>
                m.profile_id === alumnus.id &&
                capstones.some((c) => c.id === m.capstone_id && c.moderation_status === 'published')
            ).length;
            const awardCount = awards.filter(
              (a) => a.published && a.profile_id === alumnus.id
            ).length;

            const initials = alumnus.display_name
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <article
                key={alumnus.id}
                className="flex flex-col justify-between rounded-xl border border-[#242433] bg-[#111118] p-6 transition-colors hover:border-[#3A3459]"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#34344A] bg-[#181822] font-display text-lg font-bold text-[#C4B5FD]"
                    >
                      {initials}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        <Link
                          to={`/developers/${alumnus.username}`}
                          className="hover:text-[#C4B5FD]"
                        >
                          {alumnus.display_name}
                        </Link>
                      </h2>
                      <p className="text-xs text-[#8E8EA6] tabular-nums">
                        {alumnus.academic_batch}
                        {alumnus.graduation_year ? ` · Graduated ${alumnus.graduation_year}` : ''}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#B8B8CA]">{alumnus.bio}</p>

                  <p className="mt-4 text-xs text-[#8E8EA6]">
                    {alumnus.skills.join(' · ')}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#242433] pt-4 text-xs">
                  <span className="font-mono tabular-nums text-[#B8B8CA]">
                    {gameCount} games · {capstoneCount} capstones · {awardCount} awards
                  </span>
                  <Link
                    to={`/developers/${alumnus.username}`}
                    className="inline-flex items-center gap-1 font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
                  >
                    Portfolio
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
