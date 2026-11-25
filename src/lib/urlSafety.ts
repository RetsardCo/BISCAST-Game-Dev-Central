/**
 * Safe external URL validation and YouTube embed helpers.
 * Enforces 09_MEDIA_INTEGRATIONS.md and 05_SECURITY_AND_RLS.md:
 * - Rejects javascript:, data:, vbscript:, file:, and arbitrary unsafe schemes.
 * - Rejects protocol-relative (//evil.com) and slash-backslash (/\evil.com) bypasses.
 * - Rejects credentials in URLs (user:pass@host) and non-standard ports.
 * - Requires strict https:// for external links and itch.io game pages.
 * - Restricts local assets to an explicit allowlist without path escapes or encoded traversal.
 * - Performs client-side Private Network Access / local-resource URL hygiene (note: true SSRF
 *   prevention requires DNS-resolved IP enforcement at any future server-side fetch boundary).
 * - Uses privacy-enhanced youtube-nocookie.com embeds with no autoplay.
 */

const SAFE_IMAGE_EXTENSION_REGEX = /\.(?:jpe?g|png|webp|svg|gif|avif|ico)$/i;
const SAFE_ROOT_SAMPLE_IMAGE_REGEX = /^\/sample[a-z0-9_-]*\.(?:jpe?g|png|webp|gif|avif|ico)$/i;
const ALLOWED_LOCAL_ASSET_PREFIXES = ['/assets/', '/brand/', '/src/assets/images/'] as const;
const LOCAL_DUMMY_BASE = 'https://biscast-internal.invalid';

function isPrivateOrReservedIpv4(o1: number, o2: number, o3: number, o4: number): boolean {
  if (
    o1 < 0 || o1 > 255 ||
    o2 < 0 || o2 > 255 ||
    o3 < 0 || o3 > 255 ||
    o4 < 0 || o4 > 255
  ) {
    return true;
  }

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
  // 240.0.0.0/4 (Reserved 240.0.0.0 - 255.255.255.255)
  if (o1 >= 240) return true;

  return false;
}

/**
 * Parses an unbracketed IPv6 literal (including :: compression and embedded dotted IPv4 tails)
 * into 8 big-endian 16-bit hextets. Returns null for scoped zone IDs or malformed syntax.
 */
function parseIpv6ToHextets(raw: string): number[] | null {
  if (!raw || raw.includes('%')) return null;

  let addr = raw;
  if (addr.includes('.')) {
    const lastColon = addr.lastIndexOf(':');
    if (lastColon === -1) return null;
    const ipv4Tail = addr.slice(lastColon + 1);
    const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ipv4Tail);
    if (!ipv4Match) return null;
    const [, o1, o2, o3, o4] = ipv4Match.map(Number);
    if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return null;
    const hHigh = (o1 << 8) | o2;
    const hLow = (o3 << 8) | o4;
    addr = `${addr.slice(0, lastColon + 1)}${hHigh.toString(16)}:${hLow.toString(16)}`;
  }

  const halves = addr.split('::');
  if (halves.length > 2) return null;

  const parseSegmentGroup = (group: string): number[] | null => {
    if (!group) return [];
    const parts = group.split(':');
    const nums: number[] = [];
    for (const part of parts) {
      if (!/^[0-9a-f]{1,4}$/i.test(part)) return null;
      nums.push(parseInt(part, 16));
    }
    return nums;
  };

  if (halves.length === 2) {
    const left = parseSegmentGroup(halves[0]);
    const right = parseSegmentGroup(halves[1]);
    if (!left || !right) return null;
    const missing = 8 - (left.length + right.length);
    if (missing < 1) return null;
    return [...left, ...new Array<number>(missing).fill(0), ...right];
  }

  const parts = parseSegmentGroup(addr);
  if (!parts || parts.length !== 8) return null;
  return parts;
}

/**
 * Checks whether an IPv4, IPv6, or hostname belongs to private, loopback, link-local,
 * multicast, carrier-grade NAT, or reserved network address spaces.
 * Enforces client-side Private Network Access / local-resource URL hygiene.
 * Server-side SSRF prevention must still validate DNS-resolved IPs at any future fetch boundary.
 */
export function isPrivateOrReservedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  // Strip IPv6 brackets if present e.g. [::1] -> ::1, and trailing FQDN dots
  const unbracketed = host.startsWith('[') && host.endsWith(']')
    ? host.slice(1, -1)
    : host;
  const cleanHost = unbracketed.replace(/\.+$/, '');

  if (!cleanHost) return true;

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

  // IPv6 checks (including hex-normalized IPv4-mapped, NAT64, 6to4, and malformed/scoped addresses)
  if (cleanHost.includes(':')) {
    const h = parseIpv6ToHextets(cleanHost);
    if (!h) return true;

    // ::/96 (Unspecified ::, loopback ::1, deprecated IPv4-compatible ::x.x.x.x)
    if (h[0] === 0 && h[1] === 0 && h[2] === 0 && h[3] === 0 && h[4] === 0 && h[5] === 0) {
      return true;
    }

    // ::ffff:0:0/96 (IPv4-mapped IPv6 e.g. [::ffff:7f00:1], [0:0:0:0:0:ffff:10.0.0.1])
    if (h[0] === 0 && h[1] === 0 && h[2] === 0 && h[3] === 0 && h[4] === 0 && h[5] === 0xffff) {
      return isPrivateOrReservedIpv4(h[6] >> 8, h[6] & 0xff, h[7] >> 8, h[7] & 0xff);
    }

    // ::ffff:0:0:0/96 (IPv4-translated IPv6)
    if (h[0] === 0 && h[1] === 0 && h[2] === 0 && h[3] === 0 && h[4] === 0xffff && h[5] === 0) {
      return isPrivateOrReservedIpv4(h[6] >> 8, h[6] & 0xff, h[7] >> 8, h[7] & 0xff);
    }

    // 64:ff9b::/96 (NAT64 well-known prefix)
    if (h[0] === 0x0064 && h[1] === 0xff9b && h[2] === 0 && h[3] === 0 && h[4] === 0 && h[5] === 0) {
      return isPrivateOrReservedIpv4(h[6] >> 8, h[6] & 0xff, h[7] >> 8, h[7] & 0xff);
    }

    // 2002::/16 (6to4 embeds IPv4 in hextets 1 and 2)
    if (h[0] === 0x2002) {
      return isPrivateOrReservedIpv4(h[1] >> 8, h[1] & 0xff, h[2] >> 8, h[2] & 0xff);
    }

    // Link-local fe80::/10
    if ((h[0] & 0xffc0) === 0xfe80) return true;
    // Unique local fc00::/7 (fc00:: - fdff::)
    if ((h[0] & 0xfe00) === 0xfc00) return true;
    // Multicast ff00::/8
    if ((h[0] & 0xff00) === 0xff00) return true;
    // Documentation 2001:db8::/32
    if (h[0] === 0x2001 && h[1] === 0x0db8) return true;
    // Discard-only 100::/64
    if (h[0] === 0x0100 && h[1] === 0 && h[2] === 0 && h[3] === 0) return true;

    return false;
  }

  // IPv4 checks
  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(cleanHost);
  if (ipv4Match) {
    const [, o1, o2, o3, o4] = ipv4Match.map(Number);
    return isPrivateOrReservedIpv4(o1, o2, o3, o4);
  }

  return false;
}

/**
 * Validates whether a URL is an explicitly allowlisted, root-relative local static asset
 * (e.g. /favicon.svg, /sample.jpg, /assets/sample.jpg, /brand/logo.svg, /src/assets/images/*.jpg).
 * Rejects SPA routes (/admin), protocol-relative paths (//evil.com), slash-backslash (/\evil.com),
 * backslashes, control characters, percent-encoded escapes, and dot segments.
 */
export function isLocalAssetUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  // Must begin with a single forward slash and NOT protocol-relative slashes or slash-backslash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return false;
  }

  // Reject backslashes, control characters, or whitespace anywhere in the raw URL
  if (trimmed.includes('\\') || /[\x00-\x1F\x7F\s]/.test(trimmed)) {
    return false;
  }

  const rawPath = trimmed.split(/[?#]/)[0];

  // Iteratively decode percent-encoded paths (up to 3 passes) to reject hidden traversals/slashes
  let decodedPath = rawPath;
  for (let pass = 0; pass < 3; pass++) {
    if (!decodedPath.includes('%')) break;
    try {
      const next = decodeURIComponent(decodedPath);
      if (next.includes('\\') || /[\x00-\x1F\x7F\s]/.test(next) || next.includes('//')) {
        return false;
      }
      if (next === decodedPath) break;
      decodedPath = next;
    } catch {
      return false;
    }
  }

  // Reject residual percent-encoding or unsafe characters after bounded decoding
  if (
    decodedPath.includes('%') ||
    decodedPath.includes('\\') ||
    /[\x00-\x1F\x7F\s]/.test(decodedPath) ||
    decodedPath.includes('//')
  ) {
    return false;
  }

  if (!/^\/[A-Za-z0-9/_.-]+$/.test(decodedPath)) {
    return false;
  }

  const segments = decodedPath.slice(1).split('/');
  if (segments.length === 0) return false;
  for (const segment of segments) {
    if (
      !segment ||
      segment === '.' ||
      segment === '..' ||
      segment.startsWith('.') ||
      segment.endsWith('.')
    ) {
      return false;
    }
  }

  try {
    const parsed = new URL(trimmed, LOCAL_DUMMY_BASE);

    // Must resolve strictly within the dummy origin and preserve the decoded pathname
    if (parsed.origin !== LOCAL_DUMMY_BASE) return false;
    if (parsed.username || parsed.password || parsed.port) return false;
    if (parsed.pathname !== decodedPath || parsed.pathname.startsWith('//')) return false;

    if (parsed.pathname === '/favicon.svg') return true;
    if (SAFE_ROOT_SAMPLE_IMAGE_REGEX.test(parsed.pathname)) return true;

    return (
      ALLOWED_LOCAL_ASSET_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix)) &&
      SAFE_IMAGE_EXTENSION_REGEX.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

/**
 * Validates whether a URL is a strict external HTTPS URL targeting a public host.
 * Rejects non-https schemes (http, ftp, javascript, data, file), protocol-relative prefixes,
 * local paths, credentials in URLs (user:pass@host), non-standard ports, and private/reserved hosts.
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

    // Reject hostnames with whitespace or private/reserved network targets
    if (/\s/.test(parsed.hostname)) return false;
    if (isPrivateOrReservedHost(parsed.hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates whether a URL is either an allowlisted local static asset or a strict external HTTPS URL.
 * Rejects arbitrary local routes (/admin), protocol-relative (//evil.com), slash-backslash (/\evil.com),
 * plain http:, and unsafe schemes.
 * External link renderers should use isStrictHttpsUrl() directly so local paths are not accepted.
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
 * Validates an image URL (for cover artwork, screenshots, avatars).
 * Allows:
 *   - Explicitly allowlisted local static image assets with recognized image extensions
 *   - Strict external HTTPS URLs on public, non-private hosts (rendered via <img referrerPolicy="no-referrer">;
 *     per docs/SECURITY_STANDARDS.md §7, Phase 4+ user uploads must enforce MIME sniffing / SVG sanitization)
 * Rejects:
 *   - Protocol-relative (//evil.com) and slash-backslash (/\evil.com) URLs
 *   - Plain http: or unsafe schemes (javascript:, data:, file:)
 *   - Credentials or non-standard ports
 *   - Localhost, link-local, loopback, IPv4-mapped IPv6, NAT64, 6to4, private, and reserved addresses
 *     (client-side Private Network Access / local-resource hygiene)
 *   - Arbitrary local routes or non-image local files (e.g. /, /admin, /assets/not-an-image.html)
 */
export function isSafeImageUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  if (isLocalAssetUrl(trimmed)) {
    try {
      const parsed = new URL(trimmed, LOCAL_DUMMY_BASE);
      return SAFE_IMAGE_EXTENSION_REGEX.test(parsed.pathname);
    } catch {
      return false;
    }
  }

  return isStrictHttpsUrl(trimmed);
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
