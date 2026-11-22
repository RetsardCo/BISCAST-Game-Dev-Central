import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  SAMPLE_ANNOUNCEMENTS,
  SAMPLE_AUDIT_LOGS,
  SAMPLE_AWARDS,
  SAMPLE_CAPSTONE_MEMBERS,
  SAMPLE_CAPSTONES,
  SAMPLE_CATEGORIES,
  SAMPLE_COMPETITION_ENTRIES,
  SAMPLE_COMPETITIONS,
  SAMPLE_GAME_MEMBERS,
  SAMPLE_GAMES,
  SAMPLE_PROFILES,
  SAMPLE_USER_ROLES,
  SAMPLE_VOTES,
} from '../data/mockDataset';
import { SAMPLE_MEDIA } from '../data/media';
import { slugifyTitle } from '../lib/filters';
import { applyModerationDecision, evaluateMockVote, type ModerationAction } from '../lib/workflows';
import type {
  Announcement,
  AuditLog,
  Award,
  CapstoneMember,
  CapstoneProject,
  Category,
  Competition,
  CompetitionEntry,
  Game,
  GameMember,
  GameSubmissionDraft,
  Profile,
  ProfileVisibility,
  UserRoleRecord,
  Vote,
} from '../types/models';

export interface ContentReport {
  id: string;
  entity_type: 'game' | 'capstone';
  entity_id: string;
  reason: string;
  details: string;
  created_at: string;
}

interface PrototypeStoreValue {
  isPrototypeMode: true;
  /** Currently active sample student profile for the Phase 2 Student Dashboard / Submit / Voting prototypes. */
  activeSampleProfileId: string;
  setActiveSampleProfileId: (profileId: string) => void;
  profiles: Profile[];
  userRoles: UserRoleRecord[];
  categories: Category[];
  games: Game[];
  gameMembers: GameMember[];
  capstones: CapstoneProject[];
  capstoneMembers: CapstoneMember[];
  announcements: Announcement[];
  competitions: Competition[];
  competitionEntries: CompetitionEntry[];
  votes: Vote[];
  awards: Award[];
  auditLogs: AuditLog[];
  reports: ContentReport[];
  submitMockGame: (draft: GameSubmissionDraft) => { game: Game };
  moderateMockGame: (params: {
    gameId: string;
    action: ModerationAction;
    reason: string;
  }) => { ok: boolean; error?: string };
  castMockVote: (competitionId: string, gameId: string) => { ok: boolean; reason?: string };
  updateMockProfile: (
    profileId: string,
    patch: Partial<Pick<Profile, 'display_name' | 'bio' | 'profile_visibility' | 'skills'>>
  ) => void;
  createMockAnnouncement: (input: {
    title: string;
    category: Announcement['category'];
    summary: string;
    body: string;
    status: Announcement['status'];
  }) => void;
  toggleMockCompetitionResultsVisibility: (competitionId: string) => void;
  submitMockReport: (input: Omit<ContentReport, 'id' | 'created_at'>) => void;
  resetPrototypeData: () => void;
}

const PrototypeStoreContext = createContext<PrototypeStoreValue | null>(null);

export function PrototypeStoreProvider({ children }: { children: React.ReactNode }) {
  const [activeSampleProfileId, setActiveSampleProfileId] = useState<string>('profile-sample-a');
  const [profiles, setProfiles] = useState<Profile[]>(SAMPLE_PROFILES);
  const [games, setGames] = useState<Game[]>(SAMPLE_GAMES);
  const [gameMembers, setGameMembers] = useState<GameMember[]>(SAMPLE_GAME_MEMBERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(SAMPLE_ANNOUNCEMENTS);
  const [competitions, setCompetitions] = useState<Competition[]>(SAMPLE_COMPETITIONS);
  const [votes, setVotes] = useState<Vote[]>(SAMPLE_VOTES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SAMPLE_AUDIT_LOGS);
  const [reports, setReports] = useState<ContentReport[]>([]);

  const value = useMemo<PrototypeStoreValue>(() => {
    const submitMockGame = (draft: GameSubmissionDraft) => {
      const now = new Date().toISOString();
      const baseSlug = slugifyTitle(draft.title) || 'sample-submission';
      const uniqueSlug = games.some((g) => g.slug === baseSlug)
        ? `${baseSlug}-${Date.now().toString().slice(-4)}`
        : baseSlug;
      const newId = `game-mock-${Date.now()}`;

      const newGame: Game = {
        id: newId,
        title: draft.title.trim(),
        slug: uniqueSlug,
        short_description: draft.short_description.trim(),
        description: draft.description.trim(),
        category_ids: draft.category_ids,
        project_type: draft.project_type,
        academic_year: draft.academic_year.trim(),
        semester: draft.semester,
        engine: draft.engine.trim() || 'Unspecified',
        cover_image_url: draft.cover_image_url.trim() || SAMPLE_MEDIA.lanternDepths,
        screenshots: [],
        itch_url: draft.itch_url.trim(),
        trailer_url: draft.trailer_url.trim() || null,
        content_warnings: draft.content_warnings
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        status: 'pending_review',
        featured: false,
        submitted_by: activeSampleProfileId,
        reviewed_by: null,
        reviewed_at: null,
        moderation_feedback: null,
        capstone_id: null,
        is_sample: true,
        created_at: now,
        updated_at: now,
        published_at: null,
      };

      const newMembers: GameMember[] = draft.team_members.map((member, index) => ({
        game_id: newId,
        profile_id: member.profile_id,
        credit_role: member.credit_role,
        display_order: index + 1,
      }));

      setGames((prev) => [newGame, ...prev]);
      setGameMembers((prev) => [...prev, ...newMembers]);
      setAuditLogs((prev) => [
        {
          id: `audit-submit-${Date.now()}`,
          actor_user_id: activeSampleProfileId,
          actor_label:
            profiles.find((p) => p.id === activeSampleProfileId)?.display_name ?? 'Sample Student',
          action: 'game.submitted_pending_review',
          entity_type: 'game',
          entity_id: newId,
          reason: `Submitted "${newGame.title}" into local prototype pending queue.`,
          created_at: now,
          is_mock_session: true,
        },
        ...prev,
      ]);

      return { game: newGame };
    };

    const moderateMockGame = ({
      gameId,
      action,
      reason,
    }: {
      gameId: string;
      action: ModerationAction;
      reason: string;
    }) => {
      const target = games.find((g) => g.id === gameId);
      if (!target) return { ok: false, error: 'Submission record not found.' };

      const result = applyModerationDecision({
        game: target,
        action,
        reason,
        actorId: 'profile-sample-b',
        actorLabel: 'Sample Moderator B (Prototype)',
        nowIso: new Date().toISOString(),
      });

      if (!result.ok || !result.updatedGame || !result.auditEntry) {
        return { ok: false, error: result.error };
      }

      setGames((prev) => prev.map((g) => (g.id === gameId ? result.updatedGame! : g)));
      setAuditLogs((prev) => [result.auditEntry!, ...prev]);
      return { ok: true };
    };

    const castMockVote = (competitionId: string, gameId: string) => {
      const competition = competitions.find((c) => c.id === competitionId);
      if (!competition) return { ok: false, reason: 'Voting event not found.' };

      const result = evaluateMockVote({
        competition,
        gameId,
        voterProfileId: activeSampleProfileId,
        existingVotes: votes,
        nowIso: new Date().toISOString(),
      });

      if (!result.ok || !result.vote) {
        return { ok: false, reason: result.reason };
      }

      setVotes((prev) => [...prev, result.vote!]);
      return { ok: true };
    };

    const updateMockProfile = (
      profileId: string,
      patch: Partial<Pick<Profile, 'display_name' | 'bio' | 'profile_visibility' | 'skills'>>
    ) => {
      const now = new Date().toISOString();
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileId
            ? {
                ...p,
                ...patch,
                profile_visibility: (patch.profile_visibility ?? p.profile_visibility) as ProfileVisibility,
                updated_at: now,
              }
            : p
        )
      );
    };

    const createMockAnnouncement = (input: {
      title: string;
      category: Announcement['category'];
      summary: string;
      body: string;
      status: Announcement['status'];
    }) => {
      const now = new Date().toISOString();
      const newAnn: Announcement = {
        id: `ann-mock-${Date.now()}`,
        title: input.title.trim(),
        slug: slugifyTitle(input.title) || `announcement-${Date.now()}`,
        category: input.category,
        summary: input.summary.trim(),
        body: input.body.trim(),
        status: input.status,
        published_at: input.status === 'published' ? now : null,
        expires_at: null,
        created_by: 'profile-sample-b',
        is_sample: true,
        created_at: now,
        updated_at: now,
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      setAuditLogs((prev) => [
        {
          id: `audit-ann-${Date.now()}`,
          actor_user_id: 'profile-sample-b',
          actor_label: 'Sample Moderator B (Prototype)',
          action: `announcement.create_${input.status}`,
          entity_type: 'announcement',
          entity_id: newAnn.id,
          reason: `Created local prototype announcement "${newAnn.title}".`,
          created_at: now,
          is_mock_session: true,
        },
        ...prev,
      ]);
    };

    const toggleMockCompetitionResultsVisibility = (competitionId: string) => {
      const now = new Date().toISOString();
      setCompetitions((prev) =>
        prev.map((comp) => {
          if (comp.id !== competitionId) return comp;
          const nextVis =
            comp.results_visibility === 'published' ? 'hidden_during_voting' : 'published';
          setAuditLogs((logs) => [
            {
              id: `audit-comp-${Date.now()}`,
              actor_user_id: 'profile-sample-b',
              actor_label: 'Sample Moderator B (Prototype)',
              action: `competition.results_${nextVis}`,
              entity_type: 'competition',
              entity_id: comp.id,
              reason: `Changed local prototype results visibility to ${nextVis}.`,
              created_at: now,
              is_mock_session: true,
            },
            ...logs,
          ]);
          return { ...comp, results_visibility: nextVis };
        })
      );
    };

    const submitMockReport = (input: Omit<ContentReport, 'id' | 'created_at'>) => {
      setReports((prev) => [
        {
          ...input,
          id: `report-mock-${Date.now()}`,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    };

    const resetPrototypeData = () => {
      setProfiles(SAMPLE_PROFILES);
      setGames(SAMPLE_GAMES);
      setGameMembers(SAMPLE_GAME_MEMBERS);
      setAnnouncements(SAMPLE_ANNOUNCEMENTS);
      setCompetitions(SAMPLE_COMPETITIONS);
      setVotes(SAMPLE_VOTES);
      setAuditLogs(SAMPLE_AUDIT_LOGS);
      setReports([]);
    };

    return {
      isPrototypeMode: true,
      activeSampleProfileId,
      setActiveSampleProfileId,
      profiles,
      userRoles: SAMPLE_USER_ROLES,
      categories: SAMPLE_CATEGORIES,
      games,
      gameMembers,
      capstones: SAMPLE_CAPSTONES,
      capstoneMembers: SAMPLE_CAPSTONE_MEMBERS,
      announcements,
      competitions,
      competitionEntries: SAMPLE_COMPETITION_ENTRIES,
      votes,
      awards: SAMPLE_AWARDS,
      auditLogs,
      reports,
      submitMockGame,
      moderateMockGame,
      castMockVote,
      updateMockProfile,
      createMockAnnouncement,
      toggleMockCompetitionResultsVisibility,
      submitMockReport,
      resetPrototypeData,
    };
  }, [
    activeSampleProfileId,
    profiles,
    games,
    gameMembers,
    announcements,
    competitions,
    votes,
    auditLogs,
    reports,
  ]);

  return (
    <PrototypeStoreContext.Provider value={value}>{children}</PrototypeStoreContext.Provider>
  );
}

export function usePrototypeStore(): PrototypeStoreValue {
  const ctx = useContext(PrototypeStoreContext);
  if (!ctx) {
    throw new Error('usePrototypeStore must be used inside PrototypeStoreProvider');
  }
  return ctx;
}
