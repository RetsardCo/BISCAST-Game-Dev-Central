import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Award as AwardIcon } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import {
  AWARD_CATEGORY_LABELS,
  formatUtcDate,
  RECOGNITION_TYPE_LABELS,
} from '../lib/formatters';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/States';

type RecognitionFilter = 'all' | 'jury' | 'community_choice';

export function HallOfFamePage() {
  const { awards, games, profiles } = usePrototypeStore();
  const [recognitionType, setRecognitionType] = useState<RecognitionFilter>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const publishedAwards = useMemo(() => awards.filter((a) => a.published), [awards]);
  const years = useMemo(
    () =>
      Array.from(new Set(publishedAwards.map((a) => a.academic_year)))
        .sort()
        .reverse(),
    [publishedAwards]
  );

  const filteredAwards = publishedAwards.filter((award) => {
    if (recognitionType !== 'all' && award.recognition_type !== recognitionType) return false;
    if (yearFilter !== 'all' && award.academic_year !== yearFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#242433] pb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Hall of Fame &amp; Awards</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#B8B8CA]">
          Historical recognition for standout student games, capstone projects, game jam winners, and
          alumni contributions. Juried awards are explicitly distinguished from Community Choice
          popularity rankings (FR-VOTE-06).
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs<RecognitionFilter>
            ariaLabel="Filter awards by recognition type"
            activeId={recognitionType}
            onChange={setRecognitionType}
            items={[
              { id: 'all', label: 'All Recognition', count: publishedAwards.length },
              {
                id: 'jury',
                label: 'Juried Awards',
                count: publishedAwards.filter((a) => a.recognition_type === 'jury').length,
              },
              {
                id: 'community_choice',
                label: 'Community Choice',
                count: publishedAwards.filter((a) => a.recognition_type === 'community_choice')
                  .length,
              },
            ]}
          />

          <div className="flex items-center gap-2">
            <label htmlFor="hof-year" className="text-xs text-[#8E8EA6]">
              Academic Year
            </label>
            <select
              id="hof-year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="min-h-[38px] rounded-lg border border-[#2E2E42] bg-[#111118] px-3 text-xs text-white"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  AY {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredAwards.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No awards match the selected filter"
            description="Sample award records will appear here when matching the selected academic year and recognition type."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredAwards.map((award) => {
            const game = award.game_id ? games.find((g) => g.id === award.game_id) : null;
            const recipient = award.profile_id
              ? profiles.find((p) => p.id === award.profile_id)
              : null;

            return (
              <article
                key={award.id}
                className="flex flex-col justify-between rounded-xl border border-[#242433] bg-[#111118] p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#C4B5FD]">
                      <AwardIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {AWARD_CATEGORY_LABELS[award.award_category]}
                    </span>
                    <span className="font-mono tabular-nums text-[#8E8EA6]">
                      AY {award.academic_year} · {award.semester}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-white">{award.name}</h2>

                  <p className="mt-1 text-xs font-medium text-[#8E8EA6]">
                    {RECOGNITION_TYPE_LABELS[award.recognition_type]} · Awarded{' '}
                    <span className="tabular-nums">{formatUtcDate(award.awarded_at)}</span>
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-[#B8B8CA]">{award.description}</p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#242433] pt-4 text-xs">
                  <div className="text-[#D6D6E4]">
                    {award.team_label && <span>{award.team_label}</span>}
                    {recipient && (
                      <>
                        {award.team_label && <span aria-hidden="true"> · </span>}
                        <Link
                          to={`/developers/${recipient.username}`}
                          className="text-[#C4B5FD] hover:text-white"
                        >
                          {recipient.display_name}
                        </Link>
                      </>
                    )}
                  </div>

                  {game && (
                    <Link
                      to={`/games/${game.slug}`}
                      className="inline-flex items-center gap-1 font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
                    >
                      View Project
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
