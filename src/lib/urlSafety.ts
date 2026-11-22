/**
 * Safe external URL validation and YouTube embed helpers.
 * Enforces 09_MEDIA_INTEGRATIONS.md and 05_SECURITY_AND_RLS.md:
 * - Rejects javascript:, data:, vbscript:, file:, and arbitrary unsafe schemes.
 * - Prefers https:// URLs for itch.io, YouTube, documentation, and external covers.
 * - Uses privacy-enhanced youtube-nocookie.com embeds with no autoplay.
 */

export function isSafeHttpUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  // Allow relative local assets bundled with Vite
  if (trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isStrictHttpsUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function isItchIoUrl(rawUrl: string | null | undefined): boolean {
  if (!isStrictHttpsUrl(rawUrl)) return false;
  try {
    const parsed = new URL(rawUrl!.trim());
    const host = parsed.hostname.toLowerCase();
    return host === 'itch.io' || host.endsWith('.itch.io');
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(rawUrl: string | null | undefined): string | null {
  if (!isStrictHttpsUrl(rawUrl)) return null;
  try {
    const parsed = new URL(rawUrl!.trim());
    const host = parsed.hostname.toLowerCase();
    let candidate: string | null = null;

    if (host === 'youtu.be') {
      candidate = parsed.pathname.slice(1).split('/')[0] || null;
    } else if (
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'www.youtube-nocookie.com'
    ) {
      if (parsed.pathname === '/watch') {
        candidate = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        candidate = parsed.pathname.split('/embed/')[1]?.split('/')[0] || null;
      } else if (parsed.pathname.startsWith('/shorts/')) {
        candidate = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || null;
      }
    }

    if (candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate)) {
      return candidate;
    }
    return null;
  } catch {
    return null;
  }
}

export function getPrivacyEnhancedYouTubeEmbedUrl(rawUrl: string | null | undefined): string | null {
  const id = extractYouTubeVideoId(rawUrl);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}
