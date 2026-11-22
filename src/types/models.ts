/**
 * BISCAST Game Dev Central — Phase 0–2 Data Contracts
 *
 * Logical TypeScript interfaces aligned with `04_DATA_MODEL.md` so Antigravity
 * (Phases 3–8) can map these contracts directly onto PostgreSQL + Supabase RLS
 * tables and typed data-access repositories.
 *
 * IMPORTANT: All Phase 0–2 records are clearly marked `is_sample: true`.
 * No production backend, real student identities, or live persistence exist yet.
 */

export type AccountStatus =
  | 'active_student'
  | 'alumni'
  | 'suspended'
  | 'pending_verification';

export type ProfileVisibility = 'public' | 'community_only' | 'private';

export type UserRole = 'student' | 'moderator' | 'super_admin';

export type GameStatus =
  | 'draft'
  | 'pending_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'archived';

export type ProjectType =
  | 'class_project'
  | 'personal_project'
  | 'game_jam'
  | 'capstone'
  | 'other';

export type Semester = '1st Semester' | '2nd Semester' | 'Midyear' | 'Annual';

export type CreditRole =
  | 'developer'
  | 'designer'
  | 'artist'
  | 'audio'
  | 'writer'
  | 'producer'
  | 'researcher'
  | 'other';

export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type CompetitionEventType = 'game_jam' | 'showcase' | 'voting_event';

export type CompetitionStatus = 'upcoming' | 'open' | 'closed' | 'archived';

export type ResultsVisibility = 'hidden_during_voting' | 'published' | 'admin_only';

export type AwardCategory =
  | 'game_of_the_year'
  | 'game_of_the_semester'
  | 'game_jam_winner'
  | 'outstanding_developer'
  | 'best_capstone'
  | 'alumni_recognition'
  | 'community_choice';

export type RecognitionType = 'jury' | 'community_choice';

export type CapstoneProjectStatus = 'in_development' | 'completed' | 'archived';

export interface PortfolioLink {
  label: string;
  url: string;
}

export interface Profile {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  academic_batch: string;
  year_level: string | null;
  graduation_year: number | null;
  account_status: AccountStatus;
  profile_visibility: ProfileVisibility;
  skills: string[];
  portfolio_links: PortfolioLink[];
  /** Indicates clearly labeled sample dataset record for Phase 0–2 prototype. */
  is_sample: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  user_id: string;
  role: UserRole;
  granted_by: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export interface MediaScreenshot {
  url: string;
  alt: string;
  caption?: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category_ids: string[];
  project_type: ProjectType;
  academic_year: string;
  semester: Semester;
  engine: string;
  cover_image_url: string;
  screenshots: MediaScreenshot[];
  itch_url: string;
  trailer_url: string | null;
  content_warnings: string[];
  status: GameStatus;
  featured: boolean;
  submitted_by: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  /** Private/submitter-visible moderation feedback, never rendered on public game pages. */
  moderation_feedback: string | null;
  capstone_id: string | null;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface GameMember {
  game_id: string;
  profile_id: string;
  credit_role: CreditRole;
  display_order: number;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  category: 'General' | 'Submissions' | 'Game Jam' | 'Showcase' | 'Policy';
  summary: string;
  body: string;
  status: AnnouncementStatus;
  published_at: string | null;
  expires_at: string | null;
  created_by: string;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
}

export interface Competition {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_type: CompetitionEventType;
  organizer: string;
  theme: string | null;
  rules: string[];
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: CompetitionStatus;
  eligibility_policy: string;
  results_visibility: ResultsVisibility;
  external_registration_url: string | null;
  created_by: string;
  is_sample: boolean;
}

export interface CompetitionEntry {
  competition_id: string;
  game_id: string;
  entry_status: 'eligible' | 'disqualified' | 'withdrawn';
  /** Mock-only aggregate count used solely to demonstrate closed-event results UI. */
  mock_aggregate_votes: number;
}

export interface Vote {
  id: string;
  competition_id: string;
  game_id: string;
  voter_profile_id: string;
  created_at: string;
}

export interface Award {
  id: string;
  name: string;
  award_category: AwardCategory;
  recognition_type: RecognitionType;
  description: string;
  academic_year: string;
  semester: Semester;
  competition_id: string | null;
  game_id: string | null;
  profile_id: string | null;
  team_label: string | null;
  awarded_at: string;
  published: boolean;
  is_sample: boolean;
}

export interface CapstoneProject {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  description: string;
  academic_year: string;
  program_context: string;
  project_category: string;
  project_status: CapstoneProjectStatus;
  /** Displayed only if institutional/adviser publication consent is confirmed. */
  adviser_display: string | null;
  documentation_url: string | null;
  publication_url: string | null;
  demo_url: string | null;
  trailer_url: string | null;
  technology_stack: string[];
  cover_image_url: string;
  screenshots: MediaScreenshot[];
  linked_game_id: string | null;
  moderation_status: Exclude<GameStatus, 'draft' | 'approved'>;
  acknowledgements: string | null;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface CapstoneMember {
  capstone_id: string;
  profile_id: string;
  credit_role: CreditRole;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_label: string;
  action: string;
  entity_type: 'game' | 'capstone' | 'announcement' | 'competition' | 'role' | 'vote';
  entity_id: string;
  reason: string;
  created_at: string;
  is_mock_session: boolean;
}

export interface GameFilterQuery {
  search: string;
  academicYear: string;
  semester: string;
  categoryId: string;
  engine: string;
  projectType: string;
  sortBy: 'newest' | 'title_asc' | 'title_desc';
}

export interface GameSubmissionDraft {
  title: string;
  short_description: string;
  description: string;
  category_ids: string[];
  project_type: ProjectType;
  academic_year: string;
  semester: Semester;
  engine: string;
  itch_url: string;
  cover_image_url: string;
  trailer_url: string;
  content_warnings: string;
  team_members: Array<{
    profile_id: string;
    credit_role: CreditRole;
  }>;
  rights_confirmed: boolean;
}
