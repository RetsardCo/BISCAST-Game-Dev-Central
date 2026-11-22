import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeVideoId,
  getPrivacyEnhancedYouTubeEmbedUrl,
  isItchIoUrl,
  isSafeHttpUrl,
  isStrictHttpsUrl,
} from './urlSafety';
import {
  DEFAULT_GAME_FILTERS,
  filterAndSortGames,
  getPublicGames,
  groupGamesByAcademicPeriod,
  slugifyTitle,
} from './filters';
import { hasValidationErrors, validateGameSubmission } from './validation';
import { applyModerationDecision, evaluateMockVote } from './workflows';
import type { Category, Competition, Game, GameMember, Profile } from '../types/models';

test('urlSafety rejects unsafe schemes and validates https / itch.io / YouTube URLs', () => {
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isStrictHttpsUrl('http://example.com'), false);
  assert.equal(isStrictHttpsUrl('https://sample-dev.itch.io/lantern-depths'), true);
  assert.equal(isItchIoUrl('https://sample-dev.itch.io/lantern-depths'), true);
  assert.equal(isItchIoUrl('https://evil-itch.io.example.com/game'), false);
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(
    getPrivacyEnhancedYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
  );
  assert.equal(extractYouTubeVideoId('https://example.com/video'), null);
});

const sampleCategories: Category[] = [
  { id: 'cat-1', name: 'Action RPG', slug: 'action-rpg', description: 'Action RPGs', active: true },
  { id: 'cat-2', name: 'Puzzle', slug: 'puzzle', description: 'Puzzles', active: true },
];

const sampleProfiles: Profile[] = [
  {
    id: 'prof-1',
    display_name: 'Sample Developer A',
    username: 'sample-dev-a',
    bio: 'Sample bio',
    avatar_url: null,
    academic_batch: 'Batch 2026',
    year_level: '4th Year',
    graduation_year: null,
    account_status: 'active_student',
    profile_visibility: 'public',
    skills: ['Godot'],
    portfolio_links: [],
    is_sample: true,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z',
  },
];

const sampleGames: Game[] = [
  {
    id: 'g-1',
    title: 'Sample: Lantern Depths',
    slug: 'sample-lantern-depths',
    short_description: 'Sample 2D exploration game.',
    description: 'Full description for sample 2D exploration game in bioluminescent ruins.',
    category_ids: ['cat-1'],
    project_type: 'class_project',
    academic_year: '2025-2026',
    semester: '1st Semester',
    engine: 'Godot 4',
    cover_image_url: '/sample.jpg',
    screenshots: [],
    itch_url: 'https://sample.itch.io/lantern-depths',
    trailer_url: null,
    content_warnings: [],
    status: 'published',
    featured: true,
    submitted_by: 'prof-1',
    reviewed_by: 'mod-1',
    reviewed_at: '2025-11-01T00:00:00Z',
    moderation_feedback: null,
    capstone_id: null,
    is_sample: true,
    created_at: '2025-10-20T00:00:00Z',
    updated_at: '2025-11-01T00:00:00Z',
    published_at: '2025-11-01T00:00:00Z',
  },
  {
    id: 'g-2',
    title: 'Sample: Pending Prototype',
    slug: 'sample-pending-prototype',
    short_description: 'Unpublished pending submission.',
    description: 'Pending submission that must stay hidden from public catalog queries.',
    category_ids: ['cat-2'],
    project_type: 'game_jam',
    academic_year: '2024-2025',
    semester: '2nd Semester',
    engine: 'Unity',
    cover_image_url: '/sample2.jpg',
    screenshots: [],
    itch_url: 'https://sample.itch.io/pending',
    trailer_url: null,
    content_warnings: [],
    status: 'pending_review',
    featured: false,
    submitted_by: 'prof-1',
    reviewed_by: null,
    reviewed_at: null,
    moderation_feedback: null,
    capstone_id: null,
    is_sample: true,
    created_at: '2025-11-10T00:00:00Z',
    updated_at: '2025-11-10T00:00:00Z',
    published_at: null,
  },
];

const sampleMembers: GameMember[] = [
  { game_id: 'g-1', profile_id: 'prof-1', credit_role: 'developer', display_order: 1 },
];

test('public filter excludes pending games and matches developer search', () => {
  const pub = getPublicGames(sampleGames);
  assert.equal(pub.length, 1);
  assert.equal(pub[0].id, 'g-1');

  const searchRes = filterAndSortGames(pub, sampleMembers, sampleProfiles, sampleCategories, {
    ...DEFAULT_GAME_FILTERS,
    search: 'Sample Developer A',
  });
  assert.equal(searchRes.length, 1);

  const grouped = groupGamesByAcademicPeriod(pub);
  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].academicYear, '2025-2026');
  assert.equal(slugifyTitle('Sample: Lantern Depths!'), 'sample-lantern-depths');
});

test('submission validation enforces required fields, safe URLs, and rights confirmation', () => {
  const emptyErrors = validateGameSubmission({
    title: '',
    short_description: '',
    description: '',
    category_ids: [],
    project_type: 'class_project',
    academic_year: '25-26',
    semester: '1st Semester',
    engine: 'Godot 4',
    itch_url: 'javascript:alert(1)',
    cover_image_url: '',
    trailer_url: 'https://example.com/not-youtube',
    content_warnings: '',
    team_members: [],
    rights_confirmed: false,
  });

  assert.equal(hasValidationErrors(emptyErrors), true);
  assert.ok(emptyErrors.title);
  assert.ok(emptyErrors.itch_url);
  assert.ok(emptyErrors.trailer_url);
  assert.ok(emptyErrors.rights_confirmed);

  const validErrors = validateGameSubmission({
    title: 'Sample: Skyward Relay',
    short_description: 'A short atmospheric puzzle prototype built for class.',
    description:
      'Players connect wind-powered relay beacons across floating islands in this sample coursework game prototype.',
    category_ids: ['cat-2'],
    project_type: 'class_project',
    academic_year: '2025-2026',
    semester: '1st Semester',
    engine: 'Godot 4',
    itch_url: 'https://sample-team.itch.io/skyward-relay',
    cover_image_url: '',
    trailer_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content_warnings: '',
    team_members: [{ profile_id: 'prof-1', credit_role: 'developer' }],
    rights_confirmed: true,
  });

  assert.equal(hasValidationErrors(validErrors), false);
});

test('moderation transition requires feedback on reject and logs audit entry on approve', () => {
  const rejectNoReason = applyModerationDecision({
    game: sampleGames[1],
    action: 'reject',
    reason: 'no',
    actorId: 'mod-1',
    actorLabel: 'Sample Moderator',
    nowIso: '2026-11-22T06:00:00Z',
  });
  assert.equal(rejectNoReason.ok, false);

  const approved = applyModerationDecision({
    game: sampleGames[1],
    action: 'approve_publish',
    reason: 'Verified links and sample attribution checklist.',
    actorId: 'mod-1',
    actorLabel: 'Sample Moderator',
    nowIso: '2026-11-22T06:00:00Z',
  });
  assert.equal(approved.ok, true);
  assert.equal(approved.updatedGame?.status, 'published');
  assert.equal(approved.auditEntry?.action, 'game.approve_publish');
});

test('voting logic prevents duplicate votes and blocks closed competitions', () => {
  const openEvent: Competition = {
    id: 'comp-open',
    title: 'Sample Showcase Vote',
    slug: 'sample-showcase-vote',
    description: 'Sample voting event',
    event_type: 'voting_event',
    organizer: 'BSEMC Community (Sample)',
    theme: null,
    rules: ['One vote per eligible student (TBD policy)'],
    starts_at: '2026-11-01T00:00:00Z',
    ends_at: '2026-12-31T23:59:59Z',
    timezone: 'Asia/Manila',
    status: 'open',
    eligibility_policy: 'Active students only (TBD confirmation)',
    results_visibility: 'hidden_during_voting',
    external_registration_url: null,
    created_by: 'admin-1',
    is_sample: true,
  };

  const first = evaluateMockVote({
    competition: openEvent,
    gameId: 'g-1',
    voterProfileId: 'prof-1',
    existingVotes: [],
    nowIso: '2026-11-22T06:00:00Z',
  });
  assert.equal(first.ok, true);
  assert.ok(first.vote);

  const dup = evaluateMockVote({
    competition: openEvent,
    gameId: 'g-1',
    voterProfileId: 'prof-1',
    existingVotes: [first.vote!],
    nowIso: '2026-11-22T06:05:00Z',
  });
  assert.equal(dup.ok, false);

  const closedAttempt = evaluateMockVote({
    competition: { ...openEvent, status: 'closed' },
    gameId: 'g-1',
    voterProfileId: 'prof-2',
    existingVotes: [],
    nowIso: '2026-11-22T06:05:00Z',
  });
  assert.equal(closedAttempt.ok, false);
});
