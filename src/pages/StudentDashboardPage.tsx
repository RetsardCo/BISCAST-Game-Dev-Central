import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Plus, RotateCcw } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import {
  ACCOUNT_STATUS_LABELS,
  formatUtcDate,
  GAME_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
} from '../lib/formatters';
import type { ProfileVisibility } from '../types/models';
import { Button, ButtonLink } from '../components/ui/Button';
import { StatusText, getGameStatusTone } from '../components/ui/StatusText';
import { PrototypeNotice, EmptyState } from '../components/ui/States';

export function StudentDashboardPage() {
  const {
    profiles,
    activeSampleProfileId,
    setActiveSampleProfileId,
    games,
    competitions,
    votes,
    updateMockProfile,
    resetPrototypeData,
  } = usePrototypeStore();

  const studentProfiles = profiles.filter((p) => p.account_status === 'active_student');
  const activeProfile =
    profiles.find((p) => p.id === activeSampleProfileId) ?? studentProfiles[0];

  const [displayName, setDisplayName] = useState(activeProfile?.display_name ?? '');
  const [bio, setBio] = useState(activeProfile?.bio ?? '');
  const [skillsText, setSkillsText] = useState(activeProfile?.skills.join(', ') ?? '');
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    activeProfile?.profile_visibility ?? 'public'
  );
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSwitchProfile = (nextId: string) => {
    setActiveSampleProfileId(nextId);
    const next = profiles.find((p) => p.id === nextId);
    if (next) {
      setDisplayName(next.display_name);
      setBio(next.bio);
      setSkillsText(next.skills.join(', '));
      setVisibility(next.profile_visibility);
      setProfileSaved(false);
    }
  };

  if (!activeProfile) return null;

  const mySubmissions = games.filter((g) => g.submitted_by === activeProfile.id);
  const openVotingEvents = competitions.filter(
    (c) => c.event_type === 'voting_event' && c.status === 'open'
  );

  const completionChecks = [
    Boolean(activeProfile.display_name.trim()),
    activeProfile.bio.trim().length >= 20,
    activeProfile.skills.length > 0,
    activeProfile.portfolio_links.length > 0,
  ];
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  );

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!displayName.trim()) return;
    updateMockProfile(activeProfile.id, {
      display_name: displayName.trim(),
      bio: bio.trim(),
      profile_visibility: visibility,
      skills: skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setProfileSaved(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#242433] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium text-[#C4B5FD]">Student Workspace Prototype</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">Student Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#B8B8CA]">
            Manage permitted profile fields, track moderation statuses and revision notes, and view
            eligible open voting events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink to="/submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Submission
          </ButtonLink>
          <Button variant="ghost" size="sm" onClick={resetPrototypeData}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset Sample Data
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <PrototypeNotice
          title="No Live Authentication Yet (Phase 3 Pending)"
          description="Real student access requires verified @astean.biscast.edu.ph ownership through Supabase Auth. Use the sample student selector below to preview the student experience locally."
          action={
            <div className="flex items-center gap-2">
              <label htmlFor="sample-student-select" className="text-xs text-[#B8B8CA]">
                Preview as
              </label>
              <select
                id="sample-student-select"
                value={activeProfile.id}
                onChange={(e) => handleSwitchProfile(e.target.value)}
                className="min-h-[36px] rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-xs text-white"
              >
                {studentProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name}
                  </option>
                ))}
              </select>
            </div>
          }
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Submissions & Eligible Voting Events */}
        <div className="space-y-8 lg:col-span-7">
          <section aria-labelledby="my-submissions-heading">
            <div className="flex items-center justify-between gap-4">
              <h2 id="my-submissions-heading" className="text-xl font-bold text-white">
                My Submissions ({mySubmissions.length})
              </h2>
              <Link
                to="/admin"
                className="text-xs font-medium text-[#C4B5FD] hover:text-white"
              >
                Review in Admin Prototype
              </Link>
            </div>

            {mySubmissions.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No submissions yet for this sample student"
                  description="Create a sample game submission to test the pending review workflow."
                  action={<ButtonLink to="/submit">Submit a Game</ButtonLink>}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {mySubmissions.map((game) => (
                  <article
                    key={game.id}
                    className="rounded-xl border border-[#242433] bg-[#111118] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#8E8EA6]">
                          <StatusText
                            label={GAME_STATUS_LABELS[game.status]}
                            tone={getGameStatusTone(game.status)}
                          />
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            AY {game.academic_year} ({game.semester})
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{PROJECT_TYPE_LABELS[game.project_type]}</span>
                        </div>
                        <h3 className="mt-1.5 text-lg font-semibold text-white">{game.title}</h3>
                        <p className="mt-1 text-xs text-[#8E8EA6] tabular-nums">
                          Updated {formatUtcDate(game.updated_at)}
                        </p>
                      </div>

                      <Link
                        to={`/games/${game.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
                      >
                        Preview Page
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>

                    {game.moderation_feedback && (
                      <div className="mt-4 rounded-lg border border-[#3B2E1E] bg-[#15120D] p-3.5">
                        <p className="text-xs font-semibold text-[#FBBF24]">
                          Moderation Feedback (Private to Submitter)
                        </p>
                        <p className="mt-1 text-sm text-[#D6D6E4]">{game.moderation_feedback}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Eligible Open Voting Events */}
          <section
            aria-labelledby="eligible-voting-heading"
            className="border-t border-[#242433] pt-8"
          >
            <h2 id="eligible-voting-heading" className="text-xl font-bold text-white">
              Open Voting Events ({openVotingEvents.length})
            </h2>
            <div className="mt-4 space-y-4">
              {openVotingEvents.map((comp) => {
                const alreadyVoted = votes.some(
                  (v) =>
                    v.competition_id === comp.id && v.voter_profile_id === activeProfile.id
                );
                return (
                  <div
                    key={comp.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-[#242433] bg-[#111118] p-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{comp.title}</p>
                      <p className="mt-1 text-xs text-[#8E8EA6] tabular-nums">
                        Closes {formatUtcDate(comp.ends_at)} · {comp.timezone}
                      </p>
                    </div>
                    {alreadyVoted ? (
                      <StatusText label="Local Vote Recorded" tone="success" />
                    ) : (
                      <ButtonLink to="/voting" size="sm">
                        Cast Sample Vote
                      </ButtonLink>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: Profile Completion & Permitted Field Editor */}
        <aside className="lg:col-span-5">
          <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Profile &amp; Visibility</h2>
              <span className="font-mono text-xs tabular-nums text-[#C4B5FD]">
                {completionPercent}% complete
              </span>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1C1C28]">
              <div
                className="h-full bg-[#7C3AED] transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-[#8E8EA6]">
              Status: {ACCOUNT_STATUS_LABELS[activeProfile.account_status]} ·{' '}
              <Link
                to={`/developers/${activeProfile.username}`}
                className="text-[#C4B5FD] hover:underline"
              >
                View Public Profile
              </Link>
            </p>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div>
                <label htmlFor="prof-name" className="block text-xs font-medium text-[#B8B8CA]">
                  Display Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setProfileSaved(false);
                  }}
                  className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="prof-bio" className="block text-xs font-medium text-[#B8B8CA]">
                  Biography
                </label>
                <textarea
                  id="prof-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setProfileSaved(false);
                  }}
                  className="mt-1.5 w-full rounded-lg border border-[#2E2E42] bg-[#09090D] p-3 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="prof-skills" className="block text-xs font-medium text-[#B8B8CA]">
                  Skills &amp; Interests (comma-separated)
                </label>
                <input
                  id="prof-skills"
                  type="text"
                  value={skillsText}
                  onChange={(e) => {
                    setSkillsText(e.target.value);
                    setProfileSaved(false);
                  }}
                  className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="prof-vis" className="block text-xs font-medium text-[#B8B8CA]">
                  Public Profile Visibility (Consent Control)
                </label>
                <select
                  id="prof-vis"
                  value={visibility}
                  onChange={(e) => {
                    setVisibility(e.target.value as ProfileVisibility);
                    setProfileSaved(false);
                  }}
                  className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                >
                  <option value="public">Public (Visible to visitors)</option>
                  <option value="community_only">Community Only (Phase 3 RLS)</option>
                  <option value="private">Private (Hidden from public directory)</option>
                </select>
              </div>

              <p className="text-[11px] leading-relaxed text-[#8E8EA6]">
                Security boundary: Account status, graduation transition, and moderator/admin roles
                cannot be edited by students and are protected by server-side controls in Phase 3.
              </p>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button type="submit">Save Prototype Profile</Button>
                {profileSaved && (
                  <span className="inline-flex items-center gap-1 text-xs text-[#34D399]">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Saved locally
                  </span>
                )}
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
