import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeVideoId,
  getPrivacyEnhancedYouTubeEmbedUrl,
  isItchIoUrl,
  isLocalAssetUrl,
  isPrivateOrReservedHost,
  isSafeHttpUrl,
  isSafeImageUrl,
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
  // Scheme checks
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isStrictHttpsUrl('http://example.com'), false);
  assert.equal(isStrictHttpsUrl('https://sample-dev.itch.io/lantern-depths'), true);

  // DEF-08 Regression: Protocol-relative (//) and slash-backslash (/\) bypass prevention
  assert.equal(isSafeHttpUrl('//evil.com'), false);
  assert.equal(isSafeHttpUrl('//evil.com/phishing'), false);
  assert.equal(isSafeHttpUrl('/\\evil.com'), false);
  assert.equal(isSafeHttpUrl('/\\evil.com/path'), false);
  assert.equal(isSafeHttpUrl('/assets\\evil.com'), false);
  assert.equal(isSafeHttpUrl('\\evil.com'), false);
  assert.equal(isSafeHttpUrl('http://insecure.example.com'), false);
  assert.equal(isSafeHttpUrl('https://user:pass@evil.com'), false);
  assert.equal(isSafeHttpUrl('/sample.jpg'), true);
  assert.equal(isSafeHttpUrl('/assets/sample_game.jpg'), true);
  assert.equal(isSafeHttpUrl('https://example.com/demo'), true);

  // Local asset verification
  assert.equal(isLocalAssetUrl('/sample.jpg'), true);
  assert.equal(isLocalAssetUrl('/assets/images/sample.jpg'), true);
  assert.equal(isLocalAssetUrl('//evil.com'), false);
  assert.equal(isLocalAssetUrl('/\\evil.com'), false);
  assert.equal(isLocalAssetUrl('\\evil.com'), false);
  assert.equal(isLocalAssetUrl('/../etc/passwd'), false);
  assert.equal(isLocalAssetUrl('/assets/../../something'), false);
  assert.equal(isLocalAssetUrl('/./assets/sample.jpg'), false);
  assert.equal(isLocalAssetUrl('https://example.com/sample.jpg'), false);
  assert.equal(isLocalAssetUrl(''), false);
  assert.equal(isLocalAssetUrl(null), false);

  // DEF-07 Regression: itch.io URL validation & boundary checks
  assert.equal(isItchIoUrl('https://itch.io'), true);
  assert.equal(isItchIoUrl('https://itch.io/game-title'), true);
  assert.equal(isItchIoUrl('https://sample-dev.itch.io/lantern-depths'), true);
  assert.equal(isItchIoUrl('https://creator_team.itch.io/game'), true);
  assert.equal(isItchIoUrl('https://evil-phishing.com/login'), false);
  assert.equal(isItchIoUrl('https://evil-itch.io.example.com/game'), false);
  assert.equal(isItchIoUrl('https://itch.io.evil.com'), false);
  assert.equal(isItchIoUrl('https://notitch.io'), false);
  assert.equal(isItchIoUrl('https://nested.sub.itch.io/game'), false);
  assert.equal(isItchIoUrl('https://-leading-dash.itch.io/game'), false);
  assert.equal(isItchIoUrl('https://trailing-dash-.itch.io/game'), false);
  assert.equal(isItchIoUrl('https://sample.itch.io./game'), false);
  assert.equal(isItchIoUrl('https://user:password@sample.itch.io/game'), false);
  assert.equal(isItchIoUrl('https://sample.itch.io:8080/game'), false);
  assert.equal(isItchIoUrl('http://sample.itch.io/game'), false);
  assert.equal(isItchIoUrl('//sample.itch.io/game'), false);
  assert.equal(isItchIoUrl('/\\sample.itch.io/game'), false);

  // Safe image URL checks
  assert.equal(isSafeImageUrl('/sample.jpg'), true);
  assert.equal(isSafeImageUrl('/favicon.svg'), true);
  assert.equal(isSafeImageUrl('/assets/images/sample.jpg'), true);
  assert.equal(isSafeImageUrl('https://example.com/cover.jpg'), true);
  assert.equal(isSafeImageUrl('https://img.itch.zone/abc/cover.png'), true);
  assert.equal(isSafeImageUrl('//evil-tracker.com/pixel.png'), false);
  assert.equal(isSafeImageUrl('/\\evil-tracker.com/pixel.png'), false);
  assert.equal(isSafeImageUrl('http://insecure.example.com/cover.jpg'), false);
  assert.equal(isSafeImageUrl('https://localhost/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://127.0.0.1/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://127.0.0.2/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://[::1]/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://169.254.169.254/meta-data'), false);
  assert.equal(isSafeImageUrl('https://0.0.0.0/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://[fe80::1]/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://192.168.1.1/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://10.0.0.1/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://172.16.0.1/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://intranet/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://test.local/exploit.png'), false);
  assert.equal(isSafeImageUrl('https://user:pass@example.com/cover.jpg'), false);
  assert.equal(isSafeImageUrl('/'), false);
  assert.equal(isSafeImageUrl('/index.html'), false);
  assert.equal(isSafeImageUrl('/package.json'), false);
  assert.equal(isSafeImageUrl('/admin'), false);

  // YouTube checks
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(
    getPrivacyEnhancedYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
  );
  assert.equal(extractYouTubeVideoId('https://example.com/video'), null);
});

test('NEW-01 regression: IPv4-mapped IPv6, NAT64, 6to4, and reserved IPv6 hosts are blocked', () => {
  const blockedUrls = [
    'https://[::ffff:127.0.0.1]/exploit.png',
    'https://[::ffff:169.254.169.254]/meta',
    'https://[0:0:0:0:0:ffff:10.0.0.1]/x.png',
    'https://[::ffff:7f00:1]/x.png',
    'https://[0000:0000:0000:0000:0000:ffff:c0a8:0101]/x.png',
    'https://[::ffff:172.16.0.1]/x.png',
    'https://[::ffff:0.0.0.0]/x.png',
    'https://[::ffff:100.64.0.1]/x.png',
    'https://[64:ff9b::127.0.0.1]/x.png',
    'https://[2002:7f00:1::]/x.png',
    'https://[fc00::1]/x.png',
    'https://[fd12:3456::1]/x.png',
    'https://[ff02::1]/x.png',
    'https://localhost./x.png',
    'https://test.local./x.png',
  ];

  for (const url of blockedUrls) {
    assert.equal(isSafeImageUrl(url), false, `isSafeImageUrl should reject ${url}`);
    assert.equal(isStrictHttpsUrl(url), false, `isStrictHttpsUrl should reject ${url}`);
  }

  // Direct host helper checks
  assert.equal(isPrivateOrReservedHost('::ffff:127.0.0.1'), true);
  assert.equal(isPrivateOrReservedHost('[::ffff:7f00:1]'), true);
  assert.equal(isPrivateOrReservedHost('0:0:0:0:0:ffff:10.0.0.1'), true);
  assert.equal(isPrivateOrReservedHost('fe80::1%eth0'), true);
  assert.equal(isPrivateOrReservedHost('::1::2'), true);

  // Public IPv6 and public IPv4-mapped IPv6 remain allowed
  assert.equal(isPrivateOrReservedHost('[2606:2800:220:1:248:1893:25c8:1946]'), false);
  assert.equal(isPrivateOrReservedHost('[::ffff:93.184.216.34]'), false);
  assert.equal(isSafeImageUrl('https://[2606:2800:220:1:248:1893:25c8:1946]/cover.png'), true);
});

test('NEW-02 regression: explicit local asset allowlist and strict external link separation', () => {
  const disallowedLocalPaths = [
    '/admin',
    '/',
    '/.',
    '/..',
    '/assets/.',
    '/assets/..',
    '/assets/./sample.jpg',
    '/assets/../admin',
    '/%2e%2e/etc/passwd',
    '/%2e',
    '/assets/%2e%2e/index.html',
    '/assets/%252e%252e/sample.jpg',
    '/assets/not-an-image.html',
    '/assets/not-an-image.html?x=.png',
    '/assets/app.js',
    '/anything/random.svg',
    '/index.html',
    '/package.json',
    '/src/App.tsx',
    '/assets/.hidden.png',
    '/assets//sample.jpg',
    '/assets/%E0%A4%A.jpg',
  ];

  for (const path of disallowedLocalPaths) {
    assert.equal(isLocalAssetUrl(path), false, `isLocalAssetUrl should reject ${path}`);
    assert.equal(isSafeHttpUrl(path), false, `isSafeHttpUrl should reject ${path}`);
    assert.equal(isSafeImageUrl(path), false, `isSafeImageUrl should reject ${path}`);
  }

  const allowedLocalPaths = [
    '/favicon.svg',
    '/sample.jpg',
    '/sample2.jpg',
    '/assets/sample_game.jpg',
    '/assets/images/sample.jpg',
    '/assets/sample_game_lantern_depths_1795358242269-BL50w9OM.jpg',
    '/brand/biscast-logo.svg',
    '/src/assets/images/sample_game_lantern_depths_1795358242269.jpg',
    '/assets/cover.png?v=2',
  ];

  for (const path of allowedLocalPaths) {
    assert.equal(isLocalAssetUrl(path), true, `isLocalAssetUrl should allow ${path}`);
    assert.equal(isSafeImageUrl(path), true, `isSafeImageUrl should allow ${path}`);
  }

  assert.equal(isSafeImageUrl('/brand/logo.png'), true);

  // Strict external HTTPS separation (must reject local paths/routes)
  assert.equal(isStrictHttpsUrl('/admin'), false);
  assert.equal(isStrictHttpsUrl('/sample.jpg'), false);
  assert.equal(isStrictHttpsUrl('/assets/sample.jpg'), false);
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
  assert.equal(slugifyTitle('!!!'), 'untitled-project');
  assert.equal(slugifyTitle('???', 'g-123'), 'project-g-123');
  assert.equal(slugifyTitle('', 'alpha'), 'project-alpha');
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

  const validSubmissionDraft = {
    title: 'Sample: Skyward Relay',
    short_description: 'A short atmospheric puzzle prototype built for class.',
    description:
      'Players connect wind-powered relay beacons across floating islands in this sample coursework game prototype.',
    category_ids: ['cat-2'],
    project_type: 'class_project' as const,
    academic_year: '2025-2026',
    semester: '1st Semester' as const,
    engine: 'Godot 4',
    itch_url: 'https://sample-team.itch.io/skyward-relay',
    cover_image_url: '',
    trailer_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content_warnings: '',
    team_members: [{ profile_id: 'prof-1', credit_role: 'developer' as const }],
    rights_confirmed: true,
  };

  const validErrors = validateGameSubmission(validSubmissionDraft);
  assert.equal(hasValidationErrors(validErrors), false);

  // DEF-07 Regression: Phishing / arbitrary external HTTPS URL rejected as itch_url
  const nonItchSubmission = validateGameSubmission({
    ...validSubmissionDraft,
    itch_url: 'https://attacker-credential-harvest.com/login',
  });
  assert.equal(hasValidationErrors(nonItchSubmission), true);
  assert.ok(nonItchSubmission.itch_url);

  // DEF-08 Regression: Protocol-relative (//) cover image rejected
  const protoRelativeCover = validateGameSubmission({
    ...validSubmissionDraft,
    cover_image_url: '//evil-tracker.com/pixel.png',
  });
  assert.equal(hasValidationErrors(protoRelativeCover), true);
  assert.ok(protoRelativeCover.cover_image_url);

  // DEF-08 Regression: Slash-backslash (/\) cover image rejected
  const slashBackslashCover = validateGameSubmission({
    ...validSubmissionDraft,
    cover_image_url: '/\\evil-tracker.com/pixel.png',
  });
  assert.equal(hasValidationErrors(slashBackslashCover), true);
  assert.ok(slashBackslashCover.cover_image_url);

  // Valid external https cover image accepted
  const validHttpsCover = validateGameSubmission({
    ...validSubmissionDraft,
    cover_image_url: 'https://example.com/cover.jpg',
  });
  assert.equal(hasValidationErrors(validHttpsCover), false);

  // NEW-01 Regression: IPv4-mapped IPv6 local/metadata addresses rejected as cover_image_url
  const ipv4MappedLoopbackCover = validateGameSubmission({
    ...validSubmissionDraft,
    cover_image_url: 'https://[::ffff:127.0.0.1]/exploit.png',
  });
  assert.equal(hasValidationErrors(ipv4MappedLoopbackCover), true);
  assert.ok(ipv4MappedLoopbackCover.cover_image_url);

  const ipv4MappedMetadataCover = validateGameSubmission({
    ...validSubmissionDraft,
    cover_image_url: 'https://[::ffff:169.254.169.254]/meta',
  });
  assert.equal(hasValidationErrors(ipv4MappedMetadataCover), true);
  assert.ok(ipv4MappedMetadataCover.cover_image_url);

  // NEW-02 Regression: Non-image local assets and encoded traversal paths rejected
  const nonImageAssetCover = validateGameSubmission({
    ...validSubmissionDraft,
    cover_image_url: '/assets/not-an-image.html',
  });
  assert.equal(hasValidationErrors(nonImageAssetCover), true);
  assert.ok(nonImageAssetCover.cover_image_url);

  const encodedTraversalCover = validateGameSubmission({
    ...validSubmissionDraft,
    cover_image_url: '/%2e%2e/etc/passwd',
  });
  assert.equal(hasValidationErrors(encodedTraversalCover), true);
  assert.ok(encodedTraversalCover.cover_image_url);
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
