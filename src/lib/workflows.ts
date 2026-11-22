import type { AuditLog, Competition, Game, GameStatus, Vote } from '../types/models';

export type ModerationAction = 'approve_publish' | 'request_changes' | 'reject' | 'archive';

export interface ModerationTransitionResult {
  ok: boolean;
  error?: string;
  updatedGame?: Game;
  auditEntry?: AuditLog;
}

/**
 * Pure state-transition helper for the Phase 2 Admin Moderation prototype.
 * In Phase 4 (Antigravity), this transition is enforced server-side via
 * privileged PostgreSQL functions + RLS + append-only audit_logs.
 */
export function applyModerationDecision(params: {
  game: Game;
  action: ModerationAction;
  reason: string;
  actorId: string;
  actorLabel: string;
  nowIso: string;
}): ModerationTransitionResult {
  const { game, action, reason, actorId, actorLabel, nowIso } = params;
  const trimmedReason = reason.trim();

  if ((action === 'request_changes' || action === 'reject') && trimmedReason.length < 8) {
    return {
      ok: false,
      error: 'Provide a clear moderation note (at least 8 characters) when requesting changes or rejecting.',
    };
  }

  const nextStatusMap: Record<ModerationAction, GameStatus> = {
    approve_publish: 'published',
    request_changes: 'changes_requested',
    reject: 'rejected',
    archive: 'archived',
  };

  const nextStatus = nextStatusMap[action];
  const updatedGame: Game = {
    ...game,
    status: nextStatus,
    reviewed_by: actorId,
    reviewed_at: nowIso,
    updated_at: nowIso,
    published_at: action === 'approve_publish' ? game.published_at ?? nowIso : game.published_at,
    moderation_feedback: trimmedReason || (action === 'approve_publish' ? 'Approved in Phase 2 prototype review.' : game.moderation_feedback),
  };

  const auditEntry: AuditLog = {
    id: `audit-mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actor_user_id: actorId,
    actor_label: actorLabel,
    action: `game.${action}`,
    entity_type: 'game',
    entity_id: game.id,
    reason: trimmedReason || `Transitioned "${game.title}" to ${nextStatus} (local prototype).`,
    created_at: nowIso,
    is_mock_session: true,
  };

  return { ok: true, updatedGame, auditEntry };
}

export interface VoteAttemptResult {
  ok: boolean;
  reason?: string;
  vote?: Vote;
}

/**
 * Pure prototype vote validation helper.
 * Mirrors Phase 6 business rules (event must be open, within timestamp window,
 * one vote per voter per competition). Clearly non-authoritative until Phase 6
 * enforces unique (competition_id, voter_profile_id) in PostgreSQL.
 */
export function evaluateMockVote(params: {
  competition: Competition;
  gameId: string;
  voterProfileId: string;
  existingVotes: Vote[];
  nowIso: string;
}): VoteAttemptResult {
  const { competition, gameId, voterProfileId, existingVotes, nowIso } = params;

  if (competition.status !== 'open') {
    return {
      ok: false,
      reason: `Voting is not open for "${competition.title}" (current status: ${competition.status}).`,
    };
  }

  const nowMs = new Date(nowIso).getTime();
  const startMs = new Date(competition.starts_at).getTime();
  const endMs = new Date(competition.ends_at).getTime();

  if (nowMs < startMs) {
    return { ok: false, reason: 'This voting window has not opened yet.' };
  }
  if (nowMs > endMs) {
    return { ok: false, reason: 'This voting window has already closed.' };
  }

  const duplicate = existingVotes.find(
    (v) => v.competition_id === competition.id && v.voter_profile_id === voterProfileId
  );
  if (duplicate) {
    return {
      ok: false,
      reason: 'A local prototype vote has already been recorded for this event (1 vote per eligible account policy).',
    };
  }

  const vote: Vote = {
    id: `vote-mock-${Date.now()}`,
    competition_id: competition.id,
    game_id: gameId,
    voter_profile_id: voterProfileId,
    created_at: nowIso,
  };

  return { ok: true, vote };
}
