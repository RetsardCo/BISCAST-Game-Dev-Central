import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Category, Game, GameMember, Profile } from '../../types/models';
import { PROJECT_TYPE_LABELS } from '../../lib/formatters';
import { MediaImage } from './MediaImage';

export interface GameCardProps {
  game: Game;
  members: GameMember[];
  profiles: Profile[];
  categories: Category[];
  featuredLayout?: boolean;
}

export function GameCard({
  game,
  members,
  profiles,
  categories,
  featuredLayout = false,
}: GameCardProps) {
  const creatorNames = members
    .filter((m) => m.game_id === game.id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((m) => profiles.find((p) => p.id === m.profile_id)?.display_name)
    .filter(Boolean)
    .slice(0, 2);

  const primaryGenre =
    categories.find((c) => c.id === game.category_ids[0])?.name ?? 'Uncategorized';

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#242433] bg-[#111118] transition-colors duration-200 hover:border-[#3A3459]">
      <Link to={`/games/${game.slug}`} className="block focus-visible:outline-offset-[-2px]">
        <MediaImage
          src={game.cover_image_url}
          alt={`${game.title} cover artwork`}
          fallbackTitle={game.title}
          aspectClass={featuredLayout ? 'aspect-[16/10]' : 'aspect-video'}
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8E8EA6]">
          <span className="text-[#C4B5FD]">{primaryGenre}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{game.academic_year}</span>
          <span aria-hidden="true">·</span>
          <span>{PROJECT_TYPE_LABELS[game.project_type]}</span>
        </div>

        <h3 className="mt-2 text-lg font-semibold leading-snug text-[#F8F8FA]">
          <Link
            to={`/games/${game.slug}`}
            className="transition-colors hover:text-[#C4B5FD]"
          >
            {game.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[#B8B8CA]">
          {game.short_description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#242433] pt-3.5 text-xs">
          <span className="truncate text-[#B8B8CA]">
            {creatorNames.length > 0 ? creatorNames.join(', ') : 'Sample Contributor'}
          </span>
          <Link
            to={`/games/${game.slug}`}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
