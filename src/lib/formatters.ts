import type {
  AccountStatus,
  AwardCategory,
  CapstoneProjectStatus,
  CompetitionEventType,
  CompetitionStatus,
  CreditRole,
  GameStatus,
  ProjectType,
  RecognitionType,
} from '../types/models';

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  class_project: 'Class Project',
  personal_project: 'Personal Project',
  game_jam: 'Game Jam',
  capstone: 'Capstone',
  other: 'Other',
};

export const CREDIT_ROLE_LABELS: Record<CreditRole, string> = {
  developer: 'Developer',
  designer: 'Game Designer',
  artist: 'Artist',
  audio: 'Audio & Music',
  writer: 'Narrative Writer',
  producer: 'Producer',
  researcher: 'Researcher',
  other: 'Contributor',
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active_student: 'Active Student (Sample)',
  alumni: 'Alumni (Sample)',
  suspended: 'Suspended',
  pending_verification: 'Pending Verification',
};

export const COMPETITION_STATUS_LABELS: Record<CompetitionStatus, string> = {
  upcoming: 'Upcoming',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
};

export const COMPETITION_TYPE_LABELS: Record<CompetitionEventType, string> = {
  game_jam: 'Game Jam',
  showcase: 'Showcase',
  voting_event: 'Voting Event',
};

export const CAPSTONE_STATUS_LABELS: Record<CapstoneProjectStatus, string> = {
  in_development: 'In Development',
  completed: 'Completed',
  archived: 'Archived',
};

export const AWARD_CATEGORY_LABELS: Record<AwardCategory, string> = {
  game_of_the_year: 'Game of the Year',
  game_of_the_semester: 'Game of the Semester',
  game_jam_winner: 'Game Jam Winner',
  outstanding_developer: 'Outstanding Developer',
  best_capstone: 'Best Capstone Project',
  alumni_recognition: 'Alumni Recognition',
  community_choice: 'Community Choice',
};

export const RECOGNITION_TYPE_LABELS: Record<RecognitionType, string> = {
  jury: 'Juried Award',
  community_choice: 'Community Choice (Popularity)',
};

export function formatUtcDate(isoString: string | null | undefined): string {
  if (!isoString) return 'TBD';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatUtcDateTime(isoString: string | null | undefined): string {
  if (!isoString) return 'TBD';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
