import type { GameSubmissionDraft } from '../types/models';
import { extractYouTubeVideoId, isSafeHttpUrl, isStrictHttpsUrl } from './urlSafety';

export interface ValidationErrors {
  title?: string;
  short_description?: string;
  description?: string;
  category_ids?: string;
  academic_year?: string;
  itch_url?: string;
  cover_image_url?: string;
  trailer_url?: string;
  team_members?: string;
  rights_confirmed?: string;
}

export function validateGameSubmission(draft: GameSubmissionDraft): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!draft.title.trim() || draft.title.trim().length < 3) {
    errors.title = 'Enter a game title of at least 3 characters.';
  } else if (draft.title.trim().length > 120) {
    errors.title = 'Game title must be 120 characters or fewer.';
  }

  if (!draft.short_description.trim() || draft.short_description.trim().length < 15) {
    errors.short_description = 'Provide a short summary (at least 15 characters).';
  } else if (draft.short_description.trim().length > 220) {
    errors.short_description = 'Short summary must be 220 characters or fewer.';
  }

  if (!draft.description.trim() || draft.description.trim().length < 40) {
    errors.description = 'Provide a full description (at least 40 characters) explaining gameplay and context.';
  }

  if (!draft.category_ids || draft.category_ids.length === 0) {
    errors.category_ids = 'Select at least one genre or category.';
  }

  if (!/^\d{4}-\d{4}$/.test(draft.academic_year.trim())) {
    errors.academic_year = 'Use the YYYY-YYYY academic year format (e.g., 2025-2026).';
  }

  if (!isStrictHttpsUrl(draft.itch_url)) {
    errors.itch_url = 'Provide a valid https:// itch.io or approved play/demo URL.';
  }

  if (draft.cover_image_url.trim().length > 0 && !isSafeHttpUrl(draft.cover_image_url)) {
    errors.cover_image_url = 'Cover image URL must use https:// (or leave blank to use a sample placeholder).';
  }

  if (draft.trailer_url.trim().length > 0 && !extractYouTubeVideoId(draft.trailer_url)) {
    errors.trailer_url = 'Trailer URL must be a valid https:// YouTube watch, share, or embed link.';
  }

  if (!draft.team_members || draft.team_members.length === 0) {
    errors.team_members = 'Attribute at least one primary developer or team member.';
  }

  if (!draft.rights_confirmed) {
    errors.rights_confirmed =
      'You must confirm you have rights and permission to share all submitted materials and credits.';
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
