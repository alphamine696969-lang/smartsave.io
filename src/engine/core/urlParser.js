// ═══════════════════════════════════════════════════════════
// SmartSave.io — URL Parser + Platform Detector
// Single source of truth for URL → platform mapping.
// Centralizes logic previously duplicated in download.js + server.js.
// ═══════════════════════════════════════════════════════════

/**
 * Platform IDs — match keys in the platform registry (platforms/index.js).
 * Adding a new platform: add an ID here + a matcher below + a registry entry.
 */
export const PlatformIds = Object.freeze({
  YOUTUBE:   'youtube',
  INSTAGRAM: 'instagram',
  TWITTER:   'twitter',
  PINTEREST: 'pinterest',
  TIKTOK:    'tiktok',
  FACEBOOK:  'facebook',
});

/**
 * Ordered list of matchers — first match wins.
 * Each matcher is a function (hostname, pathname, fullUrl) → platformId | null.
 *
 * Using hostname checks first (fast, unambiguous) before falling back
 * to full-URL substring checks for edge cases like youtu.be short links.
 */
const MATCHERS = [
  // YouTube — standard and short link
  (host) =>
    host === 'www.youtube.com' || host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com'
      ? PlatformIds.YOUTUBE
      : null,

  // Instagram — handles /p/, /reel/, /stories/ paths
  (host) =>
    host === 'www.instagram.com' || host === 'instagram.com'
      ? PlatformIds.INSTAGRAM
      : null,

  // Twitter / X — both legacy and new domains
  (host) =>
    host === 'twitter.com' || host === 'www.twitter.com' ||
    host === 'x.com' || host === 'www.x.com'
      ? PlatformIds.TWITTER
      : null,

  // Pinterest — standard and short link (pin.it)
  (host) =>
    host === 'www.pinterest.com' || host === 'pinterest.com' ||
    host === 'pin.it' || host.endsWith('.pinterest.com')
      ? PlatformIds.PINTEREST
      : null,

  // TikTok — standard and short link (vm.tiktok.com)
  (host) =>
    host === 'www.tiktok.com' || host === 'tiktok.com' ||
    host === 'vm.tiktok.com' || host === 'm.tiktok.com'
      ? PlatformIds.TIKTOK
      : null,

  // Facebook — standard, mobile, and short link (fb.watch)
  (host) =>
    host === 'www.facebook.com' || host === 'facebook.com' ||
    host === 'm.facebook.com' || host === 'fb.watch' ||
    host === 'fb.com' || host === 'www.fb.com' ||
    host === 'web.facebook.com'
      ? PlatformIds.FACEBOOK
      : null,
];

/**
 * Parse and validate a raw URL string.
 *
 * @param {string} raw - raw input from the user
 * @returns {{
 *   isValid: boolean,
 *   platformId: string|null,
 *   normalizedUrl: string|null,
 *   confidenceScore: number,
 *   error: string|null
 * }}
 */
export function parseUrl(raw) {
  const trimmed = (raw || '').trim();

  if (!trimmed) {
    return { isValid: false, platformId: null, normalizedUrl: null, confidenceScore: 0, error: 'Please enter a URL.' };
  }

  let parsed;
  try {
    // Prepend https:// if user omitted the scheme (common UX affordance)
    const toTry = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(toTry);
  } catch {
    return { isValid: false, platformId: null, normalizedUrl: null, confidenceScore: 0, error: 'This doesn\'t look like a valid URL.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { isValid: false, platformId: null, normalizedUrl: null, confidenceScore: 0, error: 'Only HTTP and HTTPS URLs are supported.' };
  }

  const host = parsed.hostname.toLowerCase();
  let platformId = null;

  for (const matcher of MATCHERS) {
    platformId = matcher(host, parsed.pathname, trimmed);
    if (platformId) break;
  }

  // Confidence: 1.0 = hostname matched + has non-trivial path, 0.8 = hostname only, 0 = unknown
  let confidenceScore = 0;
  if (platformId) {
    confidenceScore = parsed.pathname.length > 1 ? 1.0 : 0.8;
  }

  return {
    isValid: true,    // URL is structurally valid even if platform unsupported
    platformId,       // null = platform not in registry (unsupported state)
    normalizedUrl: parsed.href,
    confidenceScore,
    error: null,
  };
}
