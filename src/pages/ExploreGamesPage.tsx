import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { DEFAULT_GAME_FILTERS, filterAndSortGames, getPublicGames } from '../lib/filters';
import { PROJECT_TYPE_LABELS } from '../lib/formatters';
import type { GameFilterQuery, ProjectType } from '../types/models';
import { GameCard } from '../components/ui/GameCard';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, LoadingSkeletonGrid } from '../components/ui/States';

const PAGE_SIZE = 6;

export function ExploreGamesPage() {
  const { games, gameMembers, profiles, categories } = usePrototypeStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<GameFilterQuery>(() => ({
    ...DEFAULT_GAME_FILTERS,
    search: searchParams.get('search') ?? '',
    academicYear: searchParams.get('year') ?? 'all',
    categoryId: searchParams.get('category') ?? 'all',
    semester: searchParams.get('semester') ?? 'all',
    engine: searchParams.get('engine') ?? 'all',
    projectType: searchParams.get('type') ?? 'all',
  }));
  const [page, setPage] = useState(1);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Supports `?state=loading` or `?state=error` URL checks for QA / Phase 2 acceptance testing
  const forcedState = searchParams.get('state');

  useEffect(() => {
    const nextSearch = searchParams.get('search');
    const nextYear = searchParams.get('year');
    const nextCat = searchParams.get('category');
    if (nextSearch !== null || nextYear !== null || nextCat !== null) {
      setFilters((prev) => ({
        ...prev,
        search: nextSearch ?? prev.search,
        academicYear: nextYear ?? prev.academicYear,
        categoryId: nextCat ?? prev.categoryId,
      }));
    }
  }, [searchParams]);

  const publishedGames = useMemo(() => getPublicGames(games), [games]);

  const academicYears = useMemo(
    () => Array.from(new Set(publishedGames.map((g) => g.academic_year))).sort().reverse(),
    [publishedGames]
  );
  const semesters = useMemo(
    () => Array.from(new Set(publishedGames.map((g) => g.semester))),
    [publishedGames]
  );
  const engines = useMemo(
    () => Array.from(new Set(publishedGames.map((g) => g.engine))).sort(),
    [publishedGames]
  );

  const filteredGames = useMemo(
    () => filterAndSortGames(publishedGames, gameMembers, profiles, categories, filters),
    [publishedGames, gameMembers, profiles, categories, filters]
  );

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedGames = filteredGames.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const updateFilter = <K extends keyof GameFilterQuery>(key: K, value: GameFilterQuery[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.academicYear !== 'all' ||
    filters.semester !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.engine !== 'all' ||
    filters.projectType !== 'all';

  const clearFilters = () => {
    setFilters(DEFAULT_GAME_FILTERS);
    setPage(1);
    setSearchParams({});
  };

  const handleRefreshCatalog = () => {
    setIsLoadingPreview(true);
    window.setTimeout(() => setIsLoadingPreview(false), 350);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#242433] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Explore Games</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#B8B8CA]">
            Search and filter published student games across academic years, semesters, genres,
            engines, and project types. Pending submissions remain hidden until moderator approval.
          </p>
        </div>
        <p className="text-sm text-[#8E8EA6] tabular-nums">
          Showing <span className="font-medium text-white">{filteredGames.length}</span> of{' '}
          <span className="font-medium text-white">{publishedGames.length}</span> published sample
          games
        </p>
      </div>

      {/* Search & Multi-Facet Filter Controls */}
      <section
        aria-label="Search and filter games"
        className="mt-8 rounded-xl border border-[#242433] bg-[#111118] p-5"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7 lg:col-span-8">
            <label htmlFor="game-search" className="block text-xs font-medium text-[#B8B8CA]">
              Search catalog
            </label>
            <div className="relative mt-1.5">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8EA6]"
                aria-hidden="true"
              />
              <input
                id="game-search"
                type="search"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Title, developer, genre, engine, or academic year..."
                className="min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] pl-10 pr-4 text-sm text-white placeholder-[#8E8EA6] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-4">
            <label htmlFor="sort-games" className="block text-xs font-medium text-[#B8B8CA]">
              Sort by
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="relative flex-1">
                <SlidersHorizontal
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8EA6]"
                  aria-hidden="true"
                />
                <select
                  id="sort-games"
                  value={filters.sortBy}
                  onChange={(e) =>
                    updateFilter('sortBy', e.target.value as GameFilterQuery['sortBy'])
                  }
                  className="min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] pl-9 pr-3 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
                >
                  <option value="newest">Newest Published</option>
                  <option value="title_asc">Title (A–Z)</option>
                  <option value="title_desc">Title (Z–A)</option>
                </select>
              </div>
              <Button variant="secondary" size="sm" onClick={handleRefreshCatalog} className="min-h-[42px]">
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#242433] pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <label htmlFor="filter-year" className="block text-xs font-medium text-[#B8B8CA]">
              Academic Year
            </label>
            <select
              id="filter-year"
              value={filters.academicYear}
              onChange={(e) => updateFilter('academicYear', e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Years</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-semester" className="block text-xs font-medium text-[#B8B8CA]">
              Semester
            </label>
            <select
              id="filter-semester"
              value={filters.semester}
              onChange={(e) => updateFilter('semester', e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Semesters</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-genre" className="block text-xs font-medium text-[#B8B8CA]">
              Genre
            </label>
            <select
              id="filter-genre"
              value={filters.categoryId}
              onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Genres</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-engine" className="block text-xs font-medium text-[#B8B8CA]">
              Engine
            </label>
            <select
              id="filter-engine"
              value={filters.engine}
              onChange={(e) => updateFilter('engine', e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Engines</option>
              {engines.map((eng) => (
                <option key={eng} value={eng}>
                  {eng}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-type" className="block text-xs font-medium text-[#B8B8CA]">
              Project Type
            </label>
            <select
              id="filter-type"
              value={filters.projectType}
              onChange={(e) => updateFilter('projectType', e.target.value)}
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Types</option>
              {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((key) => (
                <option key={key} value={key}>
                  {PROJECT_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Catalog Results / Loading / Error / Empty States */}
      <section className="mt-8" aria-label="Game results">
        {forcedState === 'loading' || isLoadingPreview ? (
          <LoadingSkeletonGrid count={6} />
        ) : forcedState === 'error' ? (
          <ErrorState
            title="Could not load game catalog"
            description="Simulated Phase 2 error state preview. When Supabase is connected in Phase 3, retryable network or query failures will display here."
            onRetry={() => setSearchParams({})}
          />
        ) : paginatedGames.length === 0 ? (
          <EmptyState
            title="No matching games found"
            description="No published sample entries match your active search or filter criteria. Try broadening your filters or clearing the search query."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Reset All Filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  members={gameMembers}
                  profiles={profiles}
                  categories={categories}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Catalog pagination"
                className="mt-10 flex items-center justify-between border-t border-[#242433] pt-6"
              >
                <p className="text-xs text-[#8E8EA6] tabular-nums">
                  Page {safePage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
