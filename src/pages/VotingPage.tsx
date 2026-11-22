import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, Vote as VoteIcon } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import { COMPETITION_STATUS_LABELS, formatUtcDate } from '../lib/formatters';
import { Button } from '../components/ui/Button';
import { MediaImage } from '../components/ui/MediaImage';
import { StatusText, getGameStatusTone } from '../components/ui/StatusText';
import { PrototypeNotice } from '../components/ui/States';

export function VotingPage() {
  const {
    competitions,
    competitionEntries,
    games,
    votes,
    activeSampleProfileId,
    profiles,
    castMockVote,
  } = usePrototypeStore();

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const votingEvents = competitions.filter((c) => c.event_type === 'voting_event');
  const activeProfile = profiles.find((p) => p.id === activeSampleProfileId);

  const handleVote = (competitionId: string, gameId: string, gameTitle: string) => {
    const result = castMockVote(competitionId, gameId);
    if (!result.ok) {
      setFeedback({ type: 'error', message: result.reason ?? 'Vote could not be recorded.' });
      return;
    }
    setFeedback({
      type: 'success',
      message: `Prototype ballot recorded locally for "${gameTitle}". No database write occurred.`,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#242433] pb-8">
        <p className="text-xs font-medium text-[#C4B5FD]">Voting Interface Prototype</p>
        <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
          Community Showcase Voting
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#B8B8CA]">
          Preview open ballots and archived Community Choice rankings. Popularity rankings are kept
          separate from juried technical awards, and individual voter identities are never exposed
          publicly.
        </p>
      </div>

      <div className="mt-6">
        <PrototypeNotice
          title="Non-Persistent Prototype — Database Enforcement Arrives in Phase 6"
          description={`Currently previewing as ${activeProfile?.display_name ?? 'Sample Student'}. Real vote integrity will enforce verified eligibility, server-side open/close timestamps, and PostgreSQL unique (competition_id, voter_profile_id) constraints.`}
        />
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`mt-6 rounded-xl border p-4 text-sm ${
            feedback.type === 'success'
              ? 'border-[#1E4738] bg-[#0E1815] text-[#34D399]'
              : 'border-[#4C1D2E] bg-[#161018] text-[#FB7185]'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="mt-8 space-y-10">
        {votingEvents.map((comp) => {
          const entries = competitionEntries
            .filter((e) => e.competition_id === comp.id && e.entry_status === 'eligible')
            .map((entry) => ({
              entry,
              game: games.find((g) => g.id === entry.game_id),
            }))
            .filter((item) => Boolean(item.game));

          const userVote = votes.find(
            (v) =>
              v.competition_id === comp.id && v.voter_profile_id === activeSampleProfileId
          );

          const totalAggregateVotes = entries.reduce((sum, item) => {
            const localAdditions = votes.filter(
              (v) => v.competition_id === comp.id && v.game_id === item.entry.game_id
            ).length;
            return sum + item.entry.mock_aggregate_votes + localAdditions;
          }, 0);

          return (
            <section
              key={comp.id}
              aria-labelledby={`vote-${comp.id}`}
              className="rounded-xl border border-[#242433] bg-[#111118] p-6 sm:p-8"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-[#242433] pb-6 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-[#8E8EA6]">
                    <StatusText
                      label={COMPETITION_STATUS_LABELS[comp.status]}
                      tone={getGameStatusTone(comp.status)}
                    />
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {formatUtcDate(comp.starts_at)} – {formatUtcDate(comp.ends_at)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{comp.timezone}</span>
                  </div>
                  <h2 id={`vote-${comp.id}`} className="mt-2 text-2xl font-bold text-white">
                    {comp.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm text-[#B8B8CA]">{comp.description}</p>
                </div>

                <div className="text-xs text-[#8E8EA6] md:text-right">
                  <p>Eligibility: {comp.eligibility_policy}</p>
                  <p className="mt-1">
                    Results visibility:{' '}
                    <span className="text-[#C4B5FD]">
                      {comp.results_visibility === 'published'
                        ? 'Published Aggregate Counts'
                        : 'Hidden Until Close'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Entries */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {entries.map(({ entry, game }) => {
                  if (!game) return null;
                  const localAdditions = votes.filter(
                    (v) => v.competition_id === comp.id && v.game_id === game.id
                  ).length;
                  const displayVotes = entry.mock_aggregate_votes + localAdditions;
                  const percentage =
                    totalAggregateVotes > 0
                      ? Math.round((displayVotes / totalAggregateVotes) * 100)
                      : 0;
                  const votedForThis = userVote?.game_id === game.id;

                  return (
                    <article
                      key={game.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-[#242433] bg-[#0D0D14]"
                    >
                      <MediaImage
                        src={game.cover_image_url}
                        alt={`${game.title} voting entry cover`}
                        fallbackTitle={game.title}
                        aspectClass="aspect-video"
                      />
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <p className="text-xs text-[#8E8EA6] tabular-nums">
                            AY {game.academic_year} · {game.engine}
                          </p>
                          <h3 className="mt-1.5 text-lg font-semibold text-white">
                            <Link to={`/games/${game.slug}`} className="hover:text-[#C4B5FD]">
                              {game.title}
                            </Link>
                          </h3>
                          <p className="mt-1.5 text-sm text-[#B8B8CA]">{game.short_description}</p>
                        </div>

                        <div className="mt-5 border-t border-[#242433] pt-4">
                          {comp.results_visibility === 'published' ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#B8B8CA]">
                                  Sample Aggregate Votes (Community Choice)
                                </span>
                                <span className="font-mono tabular-nums text-white">
                                  {displayVotes} ({percentage}%)
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1C1C28]">
                                <div
                                  className="h-full bg-[#7C3AED]"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-3">
                              {comp.status === 'open' ? (
                                votedForThis ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#34D399]">
                                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                    Your Local Prototype Vote
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled={Boolean(userVote)}
                                    onClick={() => handleVote(comp.id, game.id, game.title)}
                                  >
                                    <VoteIcon className="h-4 w-4" aria-hidden="true" />
                                    {userVote ? 'Ballot Used for Event' : `Vote for ${game.title}`}
                                  </Button>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs text-[#8E8EA6]">
                                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                  Voting Closed
                                </span>
                              )}

                              <span className="text-xs text-[#8E8EA6]">
                                Tally hidden until close
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
