import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { getPublicGames } from '../lib/filters';

export function CategoriesPage() {
  const { categories, games } = usePrototypeStore();
  const publishedGames = getPublicGames(games);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#242433] pb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Categories &amp; Genres</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#B8B8CA]">
          Browse sample student projects organized by gameplay genre and creative discipline.
          Selecting a category opens the Explore Games library pre-filtered to that genre.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories
          .filter((c) => c.active)
          .map((category) => {
            const matching = publishedGames.filter((g) => g.category_ids.includes(category.id));
            return (
              <article
                key={category.id}
                className="flex flex-col justify-between rounded-xl border border-[#242433] bg-[#111118] p-6 transition-colors hover:border-[#3A3459]"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                    <span className="font-mono text-xs tabular-nums text-[#C4B5FD]">
                      {matching.length} {matching.length === 1 ? 'sample' : 'samples'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#B8B8CA]">
                    {category.description}
                  </p>

                  {matching.length > 0 && (
                    <ul className="mt-4 space-y-1.5 border-t border-[#242433] pt-4 text-xs text-[#B8B8CA]">
                      {matching.slice(0, 3).map((game) => (
                        <li key={game.id} className="truncate">
                          <Link
                            to={`/games/${game.slug}`}
                            className="hover:text-white"
                          >
                            {game.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6 border-t border-[#242433] pt-4">
                  <Link
                    to={`/games?category=${encodeURIComponent(category.id)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C4B5FD] hover:text-white"
                  >
                    Filter in Explore Games
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
