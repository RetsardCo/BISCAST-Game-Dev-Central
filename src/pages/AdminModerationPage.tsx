import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import {
  COMPETITION_STATUS_LABELS,
  formatUtcDateTime,
  GAME_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
} from '../lib/formatters';
import type { ModerationAction } from '../lib/workflows';
import type { Announcement } from '../types/models';
import { Button } from '../components/ui/Button';
import { StatusText, getGameStatusTone } from '../components/ui/StatusText';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState, PrototypeNotice } from '../components/ui/States';

type AdminTab = 'queue' | 'catalog' | 'announcements' | 'roles' | 'audit';

const MODERATION_CHECKLIST = [
  'Submitter eligibility verified (Phase 3 Astean check)',
  'External itch.io / demo link accessible and safe',
  'All team members and roles credited accurately',
  'Rights & permission confirmed for artwork, audio, and video',
  'No unconsented personal data or confidential capstone files',
];

export function AdminModerationPage() {
  const {
    games,
    profiles,
    userRoles,
    announcements,
    competitions,
    auditLogs,
    reports,
    moderateMockGame,
    createMockAnnouncement,
    toggleMockCompetitionResultsVisibility,
    resetPrototypeData,
  } = usePrototypeStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('queue');
  const [notesByGame, setNotesByGame] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Announcement creation prototype form
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('General');
  const [annSummary, setAnnSummary] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annStatus, setAnnStatus] = useState<Announcement['status']>('published');

  const pendingGames = games.filter(
    (g) => g.status === 'pending_review' || g.status === 'changes_requested'
  );

  const handleDecision = (gameId: string, action: ModerationAction) => {
    setActionError(null);
    setActionSuccess(null);
    const reason = notesByGame[gameId] ?? '';
    const result = moderateMockGame({ gameId, action, reason });
    if (!result.ok) {
      setActionError(result.error ?? 'Unable to apply decision.');
      return;
    }
    setActionSuccess(`Local moderation action (${action}) recorded and logged to Audit History.`);
    setNotesByGame((prev) => ({ ...prev, [gameId]: '' }));
  };

  const handleCreateAnnouncement = (event: React.FormEvent) => {
    event.preventDefault();
    if (!annTitle.trim() || !annSummary.trim() || !annBody.trim()) return;
    createMockAnnouncement({
      title: annTitle,
      category: annCategory,
      summary: annSummary,
      body: annBody,
      status: annStatus,
    });
    setAnnTitle('');
    setAnnSummary('');
    setAnnBody('');
    setActionSuccess('Sample announcement created locally and added to Audit History.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#242433] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium text-[#C4B5FD]">Moderation &amp; Governance Prototype</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            Admin Moderation Console
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#B8B8CA]">
            Review pending student submissions, manage announcements and voting result visibility,
            and inspect append-only audit logs.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={resetPrototypeData}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset Sample Queue
        </Button>
      </div>

      <div className="mt-6">
        <PrototypeNotice
          title="UI Prototype Only — Real Access Enforced by Supabase RLS (Phases 3–4)"
          description="Frontend route visibility is UX only. In production, moderator review transitions, role assignment, and append-only audit logs run exclusively through privileged PostgreSQL functions."
        />
      </div>

      <div className="mt-6">
        <Tabs<AdminTab>
          ariaLabel="Admin moderation console sections"
          activeId={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setActionError(null);
            setActionSuccess(null);
          }}
          items={[
            { id: 'queue', label: 'Pending Queue', count: pendingGames.length },
            { id: 'catalog', label: 'All Submissions', count: games.length },
            { id: 'announcements', label: 'Events & Notices', count: announcements.length },
            { id: 'roles', label: 'Roles Matrix' },
            { id: 'audit', label: 'Audit Log', count: auditLogs.length },
          ]}
        />
      </div>

      {actionError && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[#4C1D2E] bg-[#161018] p-4 text-sm text-[#FB7185]"
        >
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-[#1E4738] bg-[#0E1815] p-4 text-sm text-[#34D399]"
        >
          {actionSuccess}
        </div>
      )}

      {/* TAB 1: Pending Queue */}
      {activeTab === 'queue' && (
        <section className="mt-8 space-y-6" aria-label="Pending submissions review queue">
          {pendingGames.length === 0 ? (
            <EmptyState
              title="Moderation queue is clear"
              description="All sample pending submissions have been reviewed. Submit a new prototype game or reset sample data to test again."
            />
          ) : (
            pendingGames.map((game) => {
              const submitter = profiles.find((p) => p.id === game.submitted_by);
              return (
                <article
                  key={game.id}
                  className="rounded-xl border border-[#242433] bg-[#111118] p-6"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-[#242433] pb-5 lg:flex-row lg:items-start">
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
                        <span aria-hidden="true">·</span>
                        <span>Submitted by {submitter?.display_name ?? 'Sample Student'}</span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-white">{game.title}</h2>
                      <p className="mt-1.5 max-w-3xl text-sm text-[#B8B8CA]">
                        {game.short_description}
                      </p>
                    </div>

                    <Link
                      to={`/games/${game.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#C4B5FD] hover:text-white whitespace-nowrap"
                    >
                      Inspect Full Detail
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <p className="text-xs font-semibold text-white">Moderation Checklist</p>
                      <ul className="mt-2.5 space-y-2 text-xs text-[#B8B8CA]">
                        {MODERATION_CHECKLIST.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Check
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C4B5FD]"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="lg:col-span-7">
                      <label
                        htmlFor={`mod-note-${game.id}`}
                        className="block text-xs font-medium text-[#B8B8CA]"
                      >
                        Review Note / Revision Reason (required when requesting changes or rejecting)
                      </label>
                      <textarea
                        id={`mod-note-${game.id}`}
                        rows={3}
                        value={notesByGame[game.id] ?? ''}
                        onChange={(e) =>
                          setNotesByGame((prev) => ({ ...prev, [game.id]: e.target.value }))
                        }
                        placeholder="Provide actionable feedback for the submitter and audit log..."
                        className="mt-1.5 w-full rounded-lg border border-[#2E2E42] bg-[#09090D] p-3 text-sm text-white placeholder-[#8E8EA6]"
                      />
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <Button
                          size="sm"
                          onClick={() => handleDecision(game.id, 'approve_publish')}
                        >
                          Approve &amp; Publish
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDecision(game.id, 'request_changes')}
                        >
                          Request Changes
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDecision(game.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {reports.length > 0 && (
            <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
              <h2 className="text-lg font-semibold text-white">
                Local Content Reports ({reports.length})
              </h2>
              <ul className="mt-3 divide-y divide-[#242433] text-sm">
                {reports.map((rep) => (
                  <li key={rep.id} className="py-3">
                    <p className="font-medium text-white">
                      {rep.reason} · <span className="font-mono text-xs text-[#8E8EA6]">{rep.entity_id}</span>
                    </p>
                    <p className="mt-1 text-xs text-[#B8B8CA]">{rep.details}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: All Submissions Table */}
      {activeTab === 'catalog' && (
        <section className="mt-8 overflow-x-auto rounded-xl border border-[#242433] bg-[#111118]">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#242433] text-xs text-[#8E8EA6]">
                <th className="px-5 py-3.5 font-medium">Title</th>
                <th className="px-5 py-3.5 font-medium">Academic Period</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242433]">
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="px-5 py-4 font-medium text-white">
                    <Link to={`/games/${game.slug}`} className="hover:text-[#C4B5FD]">
                      {game.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#B8B8CA]">
                    {game.academic_year} · {game.semester}
                  </td>
                  <td className="px-5 py-4">
                    <StatusText
                      label={GAME_STATUS_LABELS[game.status]}
                      tone={getGameStatusTone(game.status)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    {game.status === 'published' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDecision(game.id, 'archive')}
                      >
                        Archive
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDecision(game.id, 'approve_publish')}
                      >
                        Publish
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* TAB 3: Announcements & Voting Controls */}
      {activeTab === 'announcements' && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="rounded-xl border border-[#242433] bg-[#111118] p-6 lg:col-span-6">
            <h2 className="text-lg font-semibold text-white">Create Sample Announcement</h2>
            <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-4">
              <div>
                <label htmlFor="ann-title" className="block text-xs text-[#B8B8CA]">
                  Title
                </label>
                <input
                  id="ann-title"
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Sample Notice Title"
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ann-cat" className="block text-xs text-[#B8B8CA]">
                    Category
                  </label>
                  <select
                    id="ann-cat"
                    value={annCategory}
                    onChange={(e) =>
                      setAnnCategory(e.target.value as Announcement['category'])
                    }
                    className="mt-1 min-h-[40px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                  >
                    <option value="General">General</option>
                    <option value="Submissions">Submissions</option>
                    <option value="Game Jam">Game Jam</option>
                    <option value="Showcase">Showcase</option>
                    <option value="Policy">Policy</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ann-status" className="block text-xs text-[#B8B8CA]">
                    Status
                  </label>
                  <select
                    id="ann-status"
                    value={annStatus}
                    onChange={(e) =>
                      setAnnStatus(e.target.value as Announcement['status'])
                    }
                    className="mt-1 min-h-[40px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                  >
                    <option value="published">Published (Public)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="ann-summary" className="block text-xs text-[#B8B8CA]">
                  Summary
                </label>
                <input
                  id="ann-summary"
                  type="text"
                  required
                  value={annSummary}
                  onChange={(e) => setAnnSummary(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                />
              </div>
              <div>
                <label htmlFor="ann-body" className="block text-xs text-[#B8B8CA]">
                  Body
                </label>
                <textarea
                  id="ann-body"
                  rows={3}
                  required
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2E2E42] bg-[#09090D] p-3 text-sm text-white"
                />
              </div>
              <Button type="submit" size="sm">
                Save Prototype Announcement
              </Button>
            </form>
          </section>

          <section className="rounded-xl border border-[#242433] bg-[#111118] p-6 lg:col-span-6">
            <h2 className="text-lg font-semibold text-white">Voting Event Result Visibility</h2>
            <p className="mt-1 text-xs text-[#8E8EA6]">
              Results stay hidden during active voting by default (FR-VOTE-05). Changes are logged
              to Audit History.
            </p>
            <div className="mt-4 space-y-4">
              {competitions
                .filter((c) => c.event_type === 'voting_event')
                .map((comp) => (
                  <div
                    key={comp.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-[#242433] bg-[#0D0D14] p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{comp.title}</p>
                      <p className="mt-1 text-xs text-[#8E8EA6]">
                        {COMPETITION_STATUS_LABELS[comp.status]} · Results:{' '}
                        <span className="text-[#C4B5FD]">
                          {comp.results_visibility === 'published'
                            ? 'Published'
                            : 'Hidden during voting'}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleMockCompetitionResultsVisibility(comp.id)}
                    >
                      Toggle Visibility
                    </Button>
                  </div>
                ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: Roles Matrix */}
      {activeTab === 'roles' && (
        <section className="mt-8 space-y-6">
          <div className="rounded-xl border border-[#242433] bg-[#111118] p-6">
            <h2 className="text-lg font-semibold text-white">
              Sample Role Assignments (Super Admin Restricted)
            </h2>
            <p className="mt-1 text-xs text-[#8E8EA6]">
              Per 03_ROLES_AND_PERMISSIONS.md, role updates require Super Admin authorization via
              audited server-side operations. Role editing is intentionally read-only in Phase 2.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#242433] text-xs text-[#8E8EA6]">
                    <th className="py-3 font-medium">Sample Account</th>
                    <th className="py-3 font-medium">Assigned Role</th>
                    <th className="py-3 font-medium">Granted By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242433]">
                  {userRoles.map((r) => {
                    const prof = profiles.find((p) => p.id === r.user_id);
                    return (
                      <tr key={r.user_id}>
                        <td className="py-3 text-white">{prof?.display_name ?? r.user_id}</td>
                        <td className="py-3 font-mono text-xs text-[#C4B5FD]">{r.role}</td>
                        <td className="py-3 font-mono text-xs text-[#8E8EA6]">{r.granted_by}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: Audit Log */}
      {activeTab === 'audit' && (
        <section className="mt-8 overflow-x-auto rounded-xl border border-[#242433] bg-[#111118]">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#242433] text-xs text-[#8E8EA6]">
                <th className="px-5 py-3.5 font-medium">Timestamp (Local)</th>
                <th className="px-5 py-3.5 font-medium">Actor</th>
                <th className="px-5 py-3.5 font-medium">Action</th>
                <th className="px-5 py-3.5 font-medium">Reason / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242433]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="align-top">
                  <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#8E8EA6] whitespace-nowrap">
                    {formatUtcDateTime(log.created_at)}
                  </td>
                  <td className="px-5 py-4 text-white whitespace-nowrap">{log.actor_label}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#C4B5FD] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-5 py-4 text-[#B8B8CA]">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
