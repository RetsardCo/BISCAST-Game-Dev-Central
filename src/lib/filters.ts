import type {
  CapstoneProject,
  Category,
  Game,
  GameFilterQuery,
  GameMember,
  Profile,
} from '../types/models';

export const DEFAULT_GAME_FILTERS: GameFilterQuery = {
  search: '',
  academicYear: 'all',
  semester: 'all',
  categoryId: 'all',
  engine: 'all',
  projectType: 'all',
  sortBy: 'newest',
};

export function getPublicGames(games: Game[]): Game[] {
  return games.filter((game) => game.status === 'published');
}

export function filterAndSortGames(
  games: Game[],
  members: GameMember[],
  profiles: Profile[],
  categories: Category[],
  query: GameFilterQuery
): Game[] {
  const normalizedSearch = query.search.trim().toLowerCase();
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const filtered = games.filter((game) => {
    if (query.academicYear !== 'all' && game.academic_year !== query.academicYear) {
      return false;
    }
    if (query.semester !== 'all' && game.semester !== query.semester) {
      return false;
    }
    if (query.categoryId !== 'all' && !game.category_ids.includes(query.categoryId)) {
      return false;
    }
    if (query.engine !== 'all' && game.engine.toLowerCase() !== query.engine.toLowerCase()) {
      return false;
    }
    if (query.projectType !== 'all' && game.project_type !== query.projectType) {
      return false;
    }

    if (normalizedSearch.length > 0) {
      const memberNames = members
        .filter((m) => m.game_id === game.id)
        .map((m) => profileMap.get(m.profile_id)?.display_name ?? '')
        .join(' ');
      const categoryNames = game.category_ids
        .map((id) => categoryMap.get(id)?.name ?? '')
        .join(' ');

      const haystack = [
        game.title,
        game.short_description,
        game.description,
        game.academic_year,
        game.semester,
        game.engine,
        game.project_type.replace('_', ' '),
        memberNames,
        categoryNames,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (query.sortBy === 'title_asc') {
      return a.title.localeCompare(b.title);
    }
    if (query.sortBy === 'title_desc') {
      return b.title.localeCompare(a.title);
    }
    const dateA = new Date(a.published_at ?? a.created_at).getTime();
    const dateB = new Date(b.published_at ?? b.created_at).getTime();
    return dateB - dateA;
  });
}

export function groupGamesByAcademicPeriod(games: Game[]): Array<{
  academicYear: string;
  semesters: Array<{
    semester: string;
    games: Game[];
  }>;
}> {
  const yearMap = new Map<string, Map<string, Game[]>>();

  for (const game of games) {
    if (!yearMap.has(game.academic_year)) {
      yearMap.set(game.academic_year, new Map());
    }
    const semMap = yearMap.get(game.academic_year)!;
    if (!semMap.has(game.semester)) {
      semMap.set(game.semester, []);
    }
    semMap.get(game.semester)!.push(game);
  }

  return Array.from(yearMap.entries())
    .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
    .map(([academicYear, semMap]) => ({
      academicYear,
      semesters: Array.from(semMap.entries()).map(([semester, semesterGames]) => ({
        semester,
        games: semesterGames,
      })),
    }));
}

export function filterCapstones(
  capstones: CapstoneProject[],
  search: string,
  academicYear: string,
  status: string
): CapstoneProject[] {
  const q = search.trim().toLowerCase();
  return capstones.filter((c) => {
    if (c.moderation_status !== 'published') return false;
    if (academicYear !== 'all' && c.academic_year !== academicYear) return false;
    if (status !== 'all' && c.project_status !== status) return false;
    if (q) {
      const hay = [
        c.title,
        c.abstract,
        c.project_category,
        c.academic_year,
        c.technology_stack.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function slugifyTitle(title: string, fallbackId?: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  if (slug) return slug;
  if (fallbackId && fallbackId.trim()) {
    const cleanId = fallbackId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return cleanId ? `project-${cleanId}` : 'project-item';
  }
  return 'untitled-project';
}
