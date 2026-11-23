/**
 * Safe external URL validation and YouTube embed helpers.
 * Enforces 09_MEDIA_INTEGRATIONS.md and 05_SECURITY_AND_RLS.md:
 * - Rejects javascript:, data:, vbscript:, file:, and arbitrary unsafe schemes.
 * - Rejects protocol-relative (//evil.com) and slash-backslash (/\evil.com) bypasses.
 * - Rejects credentials in URLs (user:pass@host) and non-standard ports.
 * - Requires strict https:// for external links and itch.io game pages.
 * - Validates local root-relative assets against WHATWG resolution without path escapes.
 * - Uses privacy-enhanced youtube-nocookie.com embeds with no autoplay.
 */

/**
 * Validates whether a URL is a safe, root-relative local asset path (e.g. /sample.jpg, /assets/cover.png).
 * Strictly rejects protocol-relative paths (//evil.com), slash-backslash variants (/\evil.com),
 * backslashes, control characters, and path traversals that escape root.
 */
export function isLocalAssetUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  // Must begin with a single forward slash and NOT protocol-relative slashes or slash-backslash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return false;
  }

  // Reject backslashes anywhere in the path (browsers normalize \ to /)
  if (trimmed.includes('\\')) {
    return false;
  }

  // Reject control characters or whitespace
  if (/[\x00-\x1F\x7F\s]/.test(trimmed)) {
    return false;
  }

  try {
    const dummyBase = 'https://biscast-internal.invalid';
    const parsed = new URL(trimmed, dummyBase);

    // Must resolve strictly within the dummy origin
    if (parsed.origin !== dummyBase) return false;
    if (!parsed.pathname.startsWith('/')) return false;

    // Credentials or ports are invalid for local paths
    if (parsed.username || parsed.password || parsed.port) return false;

    // Ensure pathname doesn't have double-slash authority trick
    if (parsed.pathname.startsWith('//')) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates whether a URL is a strict external HTTPS URL.
 * Rejects non-https schemes (http, ftp, javascript, data, file), protocol-relative prefixes,
 * credentials in URLs (user:pass@host), and non-standard ports.
 */
export function isStrictHttpsUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  // Reject protocol-relative or backslash prefixes
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.startsWith('\\')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    if (!parsed.hostname || parsed.hostname.length === 0) return false;

    // Reject credentials in URL
    if (parsed.username || parsed.password) return false;

    // Reject non-standard ports (must be empty or 443)
    if (parsed.port && parsed.port !== '443') return false;

    // Reject hostnames with invalid characters or whitespace
    if (/\s/.test(parsed.hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates whether a URL is either a safe root-relative local asset or a strict HTTPS URL.
 * Rejects protocol-relative (//evil.com), slash-backslash (/\evil.com), plain http:, and unsafe schemes.
 */
export function isSafeHttpUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  if (isLocalAssetUrl(trimmed)) {
    return true;
  }

  return isStrictHttpsUrl(trimmed);
}

/**
 * Validates whether a URL is a legitimate HTTPS itch.io URL.
 * Accepts:
 *   - https://itch.io (or with path, e.g. https://itch.io/game)
 *   - https://<subdomain>.itch.io (or with path, e.g. https://creator.itch.io/game)
 * Rejects:
 *   - Arbitrary external domains (e.g. phishing sites)
 *   - Nested subdomains (e.g. evil.sub.itch.io)
 *   - Subdomain spoofing (e.g. itch.io.evil.com, evil-itch.io.com)
 *   - Credentials in URL (e.g. https://user:pass@itch.io)
 *   - Non-standard ports (e.g. https://itch.io:8080)
 *   - Non-HTTPS protocols (http, ftp, etc.)
 */
export function isItchIoUrl(rawUrl: string | null | undefined): boolean {
  if (!isStrictHttpsUrl(rawUrl)) return false;
  try {
    const parsed = new URL(rawUrl!.trim());
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    if (parsed.port && parsed.port !== '443') return false;

    const host = parsed.hostname.toLowerCase();
    if (host === 'itch.io') return true;

    if (host.endsWith('.itch.io')) {
      const subdomain = host.slice(0, -'.itch.io'.length);
      // Valid itch.io subdomain: 1-63 alphanumeric/hyphens/underscores, not starting/ending with hyphen
      return /^[a-z0-9](?:[a-z0-9-_]{0,61}[a-z0-9])?$/.test(subdomain);
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Validates an image URL (for cover artwork, screenshots, avatars).
 * Allows:
 *   - Safe local asset paths (e.g. /sample.jpg, /assets/cover.png)
 *   - Strict HTTPS URLs with no credentials or non-standard ports
 * Rejects:
 *   - Protocol-relative (//evil.com) and slash-backslash (/\evil.com) URLs
 *   - Plain http: or unsafe schemes (javascript:, data:, file:)
 *   - Credentials or non-standard ports
 *   - Localhost / private IP addresses
 */
export function isSafeImageUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  if (isLocalAssetUrl(trimmed)) {
    return true;
  }

  if (!isStrictHttpsUrl(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return false;
    }

    return true;
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
