import { useState } from 'react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { usePrototypeStore } from '../context/PrototypeStoreContext';
import {
  CREDIT_ROLE_LABELS,
  PROJECT_TYPE_LABELS,
} from '../lib/formatters';
import {
  hasValidationErrors,
  validateGameSubmission,
  type ValidationErrors,
} from '../lib/validation';
import type { CreditRole, GameSubmissionDraft, ProjectType, Semester } from '../types/models';
import { Button, ButtonLink } from '../components/ui/Button';
import { PrototypeNotice } from '../components/ui/States';

const SEMESTERS: Semester[] = ['1st Semester', '2nd Semester', 'Midyear', 'Annual'];

export function SubmitGamePage() {
  const { categories, profiles, activeSampleProfileId, submitMockGame } = usePrototypeStore();

  const [draft, setDraft] = useState<GameSubmissionDraft>({
    title: '',
    short_description: '',
    description: '',
    category_ids: [],
    project_type: 'class_project',
    academic_year: '2025-2026',
    semester: '1st Semester',
    engine: 'Godot 4',
    itch_url: '',
    cover_image_url: '',
    trailer_url: '',
    content_warnings: '',
    team_members: [{ profile_id: activeSampleProfileId, credit_role: 'developer' }],
    rights_confirmed: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);

  const toggleCategory = (catId: string) => {
    setDraft((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(catId)
        ? prev.category_ids.filter((id) => id !== catId)
        : [...prev.category_ids, catId],
    }));
  };

  const addTeamMember = () => {
    const unused = profiles.find(
      (p) => !draft.team_members.some((m) => m.profile_id === p.id)
    );
    const nextProfileId = unused?.id ?? profiles[0]?.id ?? '';
    setDraft((prev) => ({
      ...prev,
      team_members: [...prev.team_members, { profile_id: nextProfileId, credit_role: 'artist' }],
    }));
  };

  const updateTeamMember = (
    idx: number,
    patch: Partial<{ profile_id: string; credit_role: CreditRole }>
  ) => {
    setDraft((prev) => ({
      ...prev,
      team_members: prev.team_members.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    }));
  };

  const removeTeamMember = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateGameSubmission(draft);
    setErrors(validation);
    if (hasValidationErrors(validation)) return;

    const { game } = submitMockGame(draft);
    setSubmittedTitle(game.title);
    setErrors({});
  };

  if (submittedTitle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="rounded-xl border border-[#23483A] bg-[#101815] p-8">
          <CheckCircle2 className="h-8 w-8 text-[#34D399]" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-white">
            Submission Added to Local Pending Queue
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#D6D6E4]">
            <strong>{submittedTitle}</strong> has been created in local prototype memory with status{' '}
            <code className="font-mono text-xs text-[#FBBF24]">pending_review</code>. Per FR-GAME-04,
            it is NOT visible in Explore Games until approved by a moderator.
          </p>
          <p className="mt-2 text-xs text-[#8E8EA6]">
            Note: Because this is a Phase 2 frontend prototype, data is stored only in your current
            browser session and does not persist to a backend database.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to="/admin">Review in Admin Moderation Queue</ButtonLink>
            <ButtonLink to="/dashboard" variant="secondary">
              View in Student Dashboard
            </ButtonLink>
            <Button
              variant="ghost"
              onClick={() => {
                setSubmittedTitle(null);
                setDraft((prev) => ({
                  ...prev,
                  title: '',
                  short_description: '',
                  description: '',
                  itch_url: '',
                  trailer_url: '',
                  cover_image_url: '',
                  rights_confirmed: false,
                }));
              }}
            >
              Submit Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[#242433] pb-6">
        <p className="text-xs font-medium text-[#C4B5FD]">Student Submission Prototype</p>
        <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">Submit a Game</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#B8B8CA]">
          Submit coursework, game jam, personal, or capstone game metadata for moderator review.
          Playable builds must be hosted externally on itch.io; trailers must use YouTube URLs.
        </p>
      </div>

      <div className="mt-6">
        <PrototypeNotice
          title="Local Prototype Form — Does Not Persist to Production"
          description="Submitting validates all required fields and adds your entry to local browser state as pending_review so you can test the Student Dashboard and Admin Moderation Queue."
        />
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
        {/* Section 1: Core Project Details */}
        <section className="rounded-xl border border-[#242433] bg-[#111118] p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">01. Project Details</h2>

          <div>
            <label htmlFor="sub-title" className="block text-xs font-medium text-[#B8B8CA]">
              Game Title <span className="text-[#FB7185]">*</span>
            </label>
            <input
              id="sub-title"
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'err-title' : undefined}
              placeholder="e.g., Sample: Skyward Relay"
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3.5 text-sm text-white placeholder-[#8E8EA6]"
            />
            {errors.title && (
              <p id="err-title" className="mt-1.5 text-xs text-[#FB7185]">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sub-short" className="block text-xs font-medium text-[#B8B8CA]">
              Short Summary (15–220 characters) <span className="text-[#FB7185]">*</span>
            </label>
            <input
              id="sub-short"
              type="text"
              value={draft.short_description}
              onChange={(e) => setDraft({ ...draft, short_description: e.target.value })}
              aria-invalid={Boolean(errors.short_description)}
              aria-describedby={errors.short_description ? 'err-short' : undefined}
              placeholder="Concise one-sentence summary displayed on catalog cards."
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3.5 text-sm text-white placeholder-[#8E8EA6]"
            />
            {errors.short_description && (
              <p id="err-short" className="mt-1.5 text-xs text-[#FB7185]">
                {errors.short_description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sub-desc" className="block text-xs font-medium text-[#B8B8CA]">
              Full Description <span className="text-[#FB7185]">*</span>
            </label>
            <textarea
              id="sub-desc"
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'err-desc' : undefined}
              placeholder="Explain core gameplay mechanics, coursework or jam context, and design goals..."
              className="mt-1.5 w-full rounded-lg border border-[#2E2E42] bg-[#09090D] p-3.5 text-sm text-white placeholder-[#8E8EA6]"
            />
            {errors.description && (
              <p id="err-desc" className="mt-1.5 text-xs text-[#FB7185]">
                {errors.description}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="text-xs font-medium text-[#B8B8CA]">
              Genres / Categories <span className="text-[#FB7185]">*</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {categories.map((cat) => {
                const checked = draft.category_ids.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex min-h-[40px] cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-xs transition-colors ${
                      checked
                        ? 'border-[#7C3AED] bg-[#1A142E] text-white'
                        : 'border-[#242433] bg-[#09090D] text-[#B8B8CA]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat.id)}
                      className="accent-[#7C3AED]"
                    />
                    <span>{cat.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.category_ids && (
              <p className="mt-1.5 text-xs text-[#FB7185]">{errors.category_ids}</p>
            )}
          </fieldset>
        </section>

        {/* Section 2: Academic Metadata */}
        <section className="rounded-xl border border-[#242433] bg-[#111118] p-6">
          <h2 className="text-lg font-semibold text-white">02. Academic &amp; Technical Metadata</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="sub-year" className="block text-xs font-medium text-[#B8B8CA]">
                Academic Year <span className="text-[#FB7185]">*</span>
              </label>
              <input
                id="sub-year"
                type="text"
                value={draft.academic_year}
                onChange={(e) => setDraft({ ...draft, academic_year: e.target.value })}
                placeholder="2025-2026"
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 font-mono text-sm text-white"
              />
              {errors.academic_year && (
                <p className="mt-1 text-xs text-[#FB7185]">{errors.academic_year}</p>
              )}
            </div>

            <div>
              <label htmlFor="sub-sem" className="block text-xs font-medium text-[#B8B8CA]">
                Semester
              </label>
              <select
                id="sub-sem"
                value={draft.semester}
                onChange={(e) => setDraft({ ...draft, semester: e.target.value as Semester })}
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sub-type" className="block text-xs font-medium text-[#B8B8CA]">
                Project Type
              </label>
              <select
                id="sub-type"
                value={draft.project_type}
                onChange={(e) =>
                  setDraft({ ...draft, project_type: e.target.value as ProjectType })
                }
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
              >
                {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((key) => (
                  <option key={key} value={key}>
                    {PROJECT_TYPE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sub-engine" className="block text-xs font-medium text-[#B8B8CA]">
                Game Engine (Optional)
              </label>
              <input
                id="sub-engine"
                type="text"
                value={draft.engine}
                onChange={(e) => setDraft({ ...draft, engine: e.target.value })}
                placeholder="Godot 4, Unity, Unreal..."
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
              />
            </div>
          </div>
        </section>

        {/* Section 3: External Links & Media */}
        <section className="rounded-xl border border-[#242433] bg-[#111118] p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">03. External Links &amp; Media</h2>
          <p className="text-xs text-[#8E8EA6]">
            Only <code className="font-mono text-[#C4B5FD]">https://</code> links are accepted.
            Unsafe schemes are rejected automatically.
          </p>

          <div>
            <label htmlFor="sub-itch" className="block text-xs font-medium text-[#B8B8CA]">
              itch.io / Playable Demo URL <span className="text-[#FB7185]">*</span>
            </label>
            <input
              id="sub-itch"
              type="url"
              value={draft.itch_url}
              onChange={(e) => setDraft({ ...draft, itch_url: e.target.value })}
              aria-invalid={Boolean(errors.itch_url)}
              placeholder="https://your-team.itch.io/your-game"
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3.5 text-sm text-white placeholder-[#8E8EA6]"
            />
            {errors.itch_url && (
              <p className="mt-1.5 text-xs text-[#FB7185]">{errors.itch_url}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sub-trailer" className="block text-xs font-medium text-[#B8B8CA]">
                YouTube Trailer URL (Optional)
              </label>
              <input
                id="sub-trailer"
                type="url"
                value={draft.trailer_url}
                onChange={(e) => setDraft({ ...draft, trailer_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3.5 text-sm text-white placeholder-[#8E8EA6]"
              />
              {errors.trailer_url && (
                <p className="mt-1.5 text-xs text-[#FB7185]">{errors.trailer_url}</p>
              )}
            </div>

            <div>
              <label htmlFor="sub-cover" className="block text-xs font-medium text-[#B8B8CA]">
                Cover Image URL (Optional — uses sample artwork if blank)
              </label>
              <input
                id="sub-cover"
                type="url"
                value={draft.cover_image_url}
                onChange={(e) => setDraft({ ...draft, cover_image_url: e.target.value })}
                placeholder="https://..."
                className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3.5 text-sm text-white placeholder-[#8E8EA6]"
              />
              {errors.cover_image_url && (
                <p className="mt-1.5 text-xs text-[#FB7185]">{errors.cover_image_url}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="sub-warnings" className="block text-xs font-medium text-[#B8B8CA]">
              Content Warnings (Optional, comma-separated)
            </label>
            <input
              id="sub-warnings"
              type="text"
              value={draft.content_warnings}
              onChange={(e) => setDraft({ ...draft, content_warnings: e.target.value })}
              placeholder="e.g., Flashing lights, Loud audio cues"
              className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3.5 text-sm text-white placeholder-[#8E8EA6]"
            />
          </div>
        </section>

        {/* Section 4: Team Attribution */}
        <section className="rounded-xl border border-[#242433] bg-[#111118] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">04. Team Credits</h2>
              <p className="mt-1 text-xs text-[#8E8EA6]">
                Attribute every team member and their primary role.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={addTeamMember}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Member
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {draft.team_members.map((member, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end"
              >
                <div className="sm:col-span-6">
                  <label
                    htmlFor={`member-prof-${idx}`}
                    className="block text-xs text-[#8E8EA6]"
                  >
                    Contributor
                  </label>
                  <select
                    id={`member-prof-${idx}`}
                    value={member.profile_id}
                    onChange={(e) => updateTeamMember(idx, { profile_id: e.target.value })}
                    className="mt-1 min-h-[40px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.display_name} ({p.academic_batch})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor={`member-role-${idx}`}
                    className="block text-xs text-[#8E8EA6]"
                  >
                    Credit Role
                  </label>
                  <select
                    id={`member-role-${idx}`}
                    value={member.credit_role}
                    onChange={(e) =>
                      updateTeamMember(idx, { credit_role: e.target.value as CreditRole })
                    }
                    className="mt-1 min-h-[40px] w-full rounded-lg border border-[#2E2E42] bg-[#09090D] px-3 text-sm text-white"
                  >
                    {(Object.keys(CREDIT_ROLE_LABELS) as CreditRole[]).map((role) => (
                      <option key={role} value={role}>
                        {CREDIT_ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={draft.team_members.length <= 1}
                    onClick={() => removeTeamMember(idx)}
                    aria-label={`Remove team member ${idx + 1}`}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {errors.team_members && (
            <p className="mt-2 text-xs text-[#FB7185]">{errors.team_members}</p>
          )}
        </section>

        {/* Section 5: Rights & Consent Confirmation */}
        <section className="rounded-xl border border-[#242433] bg-[#111118] p-6">
          <label htmlFor="sub-rights" className="flex cursor-pointer items-start gap-3">
            <input
              id="sub-rights"
              type="checkbox"
              checked={draft.rights_confirmed}
              onChange={(e) => setDraft({ ...draft, rights_confirmed: e.target.checked })}
              className="mt-1 h-4 w-4 accent-[#7C3AED]"
            />
            <span className="text-sm leading-relaxed text-[#D6D6E4]">
              I confirm that I have permission from all credited team members to share this game
              description, cover artwork, screenshots, trailer link, and external itch.io URL, and
              that no confidential or restricted academic material is included.
            </span>
          </label>
          {errors.rights_confirmed && (
            <p className="mt-2 text-xs text-[#FB7185]">{errors.rights_confirmed}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#242433] pt-5">
            <ButtonLink to="/dashboard" variant="ghost">
              Cancel
            </ButtonLink>
            <Button type="submit">Submit for Moderation Review</Button>
          </div>
        </section>
      </form>
    </div>
  );
}
