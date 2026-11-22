import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { getPublicGames, groupGamesByAcademicPeriod } from '../lib/filters';
import { GameCard } from '../components/ui/GameCard';
import { EmptyState } from '../components/ui/States';

export function ArchivesPage() {
  const { games, gameMembers, profiles, categories } = usePrototypeStore();
  const published = useMemo(() => getPublicGames(games), [games]);
  const grouped = useMemo(() => groupGamesByAcademicPeriod(published), [published]);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const visibleGroups =
    selectedYear === 'all'
      ? grouped
      : grouped.filter((group) => group.academicYear === selectedYear);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#242433] pb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Academic Year &amp; Semester Archive
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#B8B8CA]">
          Browse published BSEMC Game Development projects chronologically across academic periods.
          Historical records remain preserved even after contributors graduate.
        </p>

        {/* Interactive Academic Year Selector */}
        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter archive by academic year">
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`min-h-[38px] rounded-lg px-4 text-xs font-medium transition-colors cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-[#7C3AED] text-white'
                : 'border border-[#242433] bg-[#111118] text-[#B8B8CA] hover:text-white'
            }`}
          >
            All Academic Years
          </button>
          {grouped.map((group) => {
            const count = group.semesters.reduce((acc, s) => acc + s.games.length, 0);
            return (
              <button
                key={group.academicYear}
                type="button"
                onClick={() => setSelectedYear(group.academicYear)}
                className={`min-h-[38px] rounded-lg px-4 text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                  selectedYear === group.academicYear
                    ? 'bg-[#7C3AED] text-white'
                    : 'border border-[#242433] bg-[#111118] text-[#B8B8CA] hover:text-white'
                }`}
              >
                AY {group.academicYear} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No archived projects for this period"
            description="Published sample entries will appear here once approved for the selected academic year."
          />
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          {visibleGroups.map((group) => (
            <section key={group.academicYear} aria-labelledby={`ay-${group.academicYear}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#242433] pb-3">
                <h2
                  id={`ay-${group.academicYear}`}
                  className="text-2xl font-bold tabular-nums text-white"
                >
                  Academic Year {group.academicYear}
                </h2>
                <Link
                  to={`/games?year=${encodeURIComponent(group.academicYear)}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#C4B5FD] hover:text-white"
                >
                  Open in Explore Games
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-6 space-y-10">
                {group.semesters.map((sem) => (
                  <div key={sem.semester}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-[#D6D6E4]">{sem.semester}</h3>
                      <span className="font-mono text-xs tabular-nums text-[#8E8EA6]">
                        {sem.games.length} sample {sem.games.length === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {sem.games.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          members={gameMembers}
                          profiles={profiles}
                          categories={categories}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
