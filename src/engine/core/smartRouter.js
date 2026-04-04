// ═══════════════════════════════════════════════════════════
// SmartSave.io — Smart Router Engine
//
// Intercepts pasted/submitted URLs, detects platform,
// and redirects to the correct dedicated downloader page
// if there is a mismatch with the current section.
//
// DESIGN: Works alongside router.js — does NOT replace it.
// ═══════════════════════════════════════════════════════════

import { parseUrl }       from './urlParser.js';
import { navigateTo }     from '../../router.js';
import { showToast }      from '../ui/ToastNotification.js';
import { downloaderStore } from './downloaderStore.js';

/** Maps platformId → dedicated SPA hash route */
export const PLATFORM_ROUTES = Object.freeze({
  youtube:   '/download/youtube',
  instagram: '/download/instagram',
  twitter:   '/download/twitter',
  pinterest: '/download/pinterest',
  tiktok:    '/download/tiktok',
  facebook:  '/download/facebook',
});

/** Human-readable platform display names */
export const PLATFORM_NAMES = Object.freeze({
  youtube:   'YouTube',
  instagram: 'Instagram',
  twitter:   'Twitter / X',
  pinterest: 'Pinterest',
  tiktok:    'TikTok',
  facebook:  'Facebook',
});

/** Platform brand colors — used only in toast chrome */
export const PLATFORM_COLORS = Object.freeze({
  youtube:   '#FF0000',
  instagram: '#E1306C',
  twitter:   '#1DA1F2',
  pinterest: '#E60023',
  tiktok:    '#69C9D0',
  facebook:  '#1877F2',
});

/**
 * Detect the platform of a raw URL and navigate to the correct
 * dedicated downloader page if the current page is for a different platform.
 *
 * @param {string}      rawUrl            — pasted/submitted URL
 * @param {string|null} currentPlatformId — null = generic /download page
 * @returns {{ shouldRedirect: boolean, platformId: string|null }}
 */
export function detectAndRoute(rawUrl, currentPlatformId = null) {
  const { isValid, platformId } = parseUrl(rawUrl);

  // Update the store so other components know what was detected
  downloaderStore.set({ inputUrl: rawUrl, detectedPlatform: platformId });

  if (!isValid || !platformId) {
    return { shouldRedirect: false, platformId: null };
  }

  // No mismatch — correct page or generic page
  if (!currentPlatformId || platformId === currentPlatformId) {
    return { shouldRedirect: false, platformId };
  }

  // ── Mismatch — redirect to the correct dedicated page ──
  const targetRoute  = PLATFORM_ROUTES[platformId] || '/download';
  const platformName = PLATFORM_NAMES[platformId]  || 'correct';

  // Persist URL so the engine on the target page auto-fetches
  sessionStorage.setItem('downloadUrl', rawUrl);
  downloaderStore.set({ currentPlatform: platformId });

  showToast(
    `↗ ${platformName} link detected — switching downloader`,
    'redirect',
    3800
  );

  // Short delay so the toast is visible before navigation
  setTimeout(() => navigateTo(targetRoute), 720);

  return { shouldRedirect: true, platformId };
}

/**
 * Programmatically navigate to a platform's dedicated page,
 * optionally setting a URL that the engine will auto-fetch.
 *
 * @param {string} platformId
 * @param {string} [url]
 */
export function navigateToPlatform(platformId, url = '') {
  const route = PLATFORM_ROUTES[platformId];
  if (!route) return;
  if (url) sessionStorage.setItem('downloadUrl', url);
  navigateTo(route);
}
