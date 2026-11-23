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
 * Checks whether an IPv4 or IPv6 host belongs to private, loopback, link-local,
 * multicast, carrier-grade NAT, or reserved network address spaces (SSRF protection).
 */
export function isPrivateOrReservedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  // Strip IPv6 brackets if present e.g. [::1] -> ::1
  const cleanHost = host.startsWith('[') && host.endsWith(']')
    ? host.slice(1, -1)
    : host;

  // Localhost names
  if (
    cleanHost === 'localhost' ||
    cleanHost.endsWith('.localhost') ||
    cleanHost === 'localhost.localdomain'
  ) {
    return true;
  }

  // Common internal TLDs or single-label hostnames
  if (!cleanHost.includes('.') && !cleanHost.includes(':')) {
    return true;
  }

  if (
    cleanHost.endsWith('.local') ||
    cleanHost.endsWith('.internal') ||
    cleanHost.endsWith('.lan') ||
    cleanHost.endsWith('.home') ||
    cleanHost.endsWith('.corp') ||
    cleanHost.endsWith('.test') ||
    cleanHost.endsWith('.example') ||
    cleanHost.endsWith('.invalid')
  ) {
    return true;
  }

  // IPv6 checks
  if (cleanHost.includes(':')) {
    // ::1 loopback
    if (cleanHost === '::1' || cleanHost === '0:0:0:0:0:0:0:1') return true;
    // :: unspecified
    if (cleanHost === '::' || cleanHost === '0:0:0:0:0:0:0:0') return true;
    // Link-local: fe80::/10 (fe80 to febf)
    if (/^fe[89ab][0-9a-f]:/i.test(cleanHost)) return true;
    // Unique local: fc00::/7 (fc00 to fdff)
    if (/^f[cd][0-9a-f]{2}:/i.test(cleanHost)) return true;
    // IPv4-mapped IPv6: ::ffff:x.x.x.x
    if (cleanHost.startsWith('::ffff:')) {
      const v4Part = cleanHost.slice('::ffff:'.length);
      return isPrivateOrReservedHost(v4Part);
    }
  }

  // IPv4 checks
  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(cleanHost);
  if (ipv4Match) {
    const [, o1, o2, o3, o4] = ipv4Match.map(Number);
    if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return true;

    // 0.0.0.0/8 (Current network / default route)
    if (o1 === 0) return true;
    // 10.0.0.0/8 (Private)
    if (o1 === 10) return true;
    // 100.64.0.0/10 (Shared address space / CGNAT)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) return true;
    // 169.254.0.0/16 (Link-local, cloud metadata)
    if (o1 === 169 && o2 === 254) return true;
    // 172.16.0.0/12 (Private 172.16.0.0 - 172.31.255.255)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (o1 === 192 && o2 === 0 && o3 === 0) return true;
    // 192.0.2.0/24 (Documentation - TEST-NET-1)
    if (o1 === 192 && o2 === 0 && o3 === 2) return true;
    // 192.168.0.0/16 (Private)
    if (o1 === 192 && o2 === 168) return true;
    // 198.18.0.0/15 (Benchmarking)
    if (o1 === 198 && (o2 === 18 || o2 === 19)) return true;
    // 198.51.100.0/24 (Documentation - TEST-NET-2)
    if (o1 === 198 && o2 === 51 && o3 === 100) return true;
    // 203.0.113.0/24 (Documentation - TEST-NET-3)
    if (o1 === 203 && o2 === 0 && o3 === 113) return true;
    // 224.0.0.0/4 (Multicast 224.0.0.0 - 239.255.255.255)
    if (o1 >= 224 && o1 <= 239) return true;
    // 240.0.0.0/4 (Reserved 240.0.0.0 - 255.255.255.254)
    if (o1 >= 240) return true;
  }

  return false;
}

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

  // Reject path traversal segments like /../ or /./
  if (
    trimmed === '/..' ||
    trimmed.startsWith('/../') ||
    trimmed.includes('/../') ||
    trimmed.endsWith('/..') ||
    trimmed.includes('/./')
  ) {
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
      // Reject nested subdomains e.g. sub.creator.itch.io
      if (subdomain.includes('.')) return false;
      // Valid itch.io subdomain: 1-63 alphanumeric/hyphens/underscores, not starting/ending with hyphen
      return /^[a-z0-9](?:[a-z0-9_-]{0,61}[a-z0-9])?$/.test(subdomain);
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Recognized image file extensions for local asset images.
 */
const SAFE_IMAGE_EXTENSION_REGEX = /\.(jpe?g|png|webp|svg|gif|avif|ico)(\?.*)?$/i;

/**
 * Validates an image URL (for cover artwork, screenshots, avatars).
 * Allows:
 *   - Safe local asset paths pointing to recognized image formats (e.g. /sample.jpg, /assets/cover.png)
 *   - Strict HTTPS URLs with no credentials, standard ports, and public, non-private hosts
 * Rejects:
 *   - Protocol-relative (//evil.com) and slash-backslash (/\evil.com) URLs
 *   - Plain http: or unsafe schemes (javascript:, data:, file:)
 *   - Credentials or non-standard ports
 *   - Localhost, link-local, loopback, private, and reserved IP addresses (SSRF defense)
 *   - Arbitrary non-image local paths (e.g. /, /index.html, /package.json)
 */
export function isSafeImageUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  if (isLocalAssetUrl(trimmed)) {
    // Local asset must have a recognized image file extension or reside under /assets/ or /brand/
    const pathWithoutQuery = trimmed.split('?')[0].split('#')[0];
    if (
      SAFE_IMAGE_EXTENSION_REGEX.test(pathWithoutQuery) ||
      pathWithoutQuery.startsWith('/assets/') ||
      pathWithoutQuery.startsWith('/brand/') ||
      pathWithoutQuery === '/favicon.svg'
    ) {
      return true;
    }
    return false;
  }

  if (!isStrictHttpsUrl(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (isPrivateOrReservedHost(parsed.hostname)) {
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
