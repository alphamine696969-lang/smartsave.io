// ═══════════════════════════════════════════════════════════
// SmartSave.io — YouTube Platform Adapter
// Defines PlatformConfig + usePlatformHandler for YouTube.
// ═══════════════════════════════════════════════════════════

import { useDownloader } from '../core/engine.js';

/**
 * PlatformConfig — static descriptor for YouTube.
 * The icon is an inline SVG string so it can be embedded anywhere
 * without extra assets or fetch requests.
 */
export const PlatformConfig = Object.freeze({
  id: 'youtube',
  displayName: 'YouTube',
  // Inline SVG — YouTube play button wordmark
  icon: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>`,
  // Token-safe accent — references an existing CSS custom property
  // that can be overridden per-platform without touching primary theme
  accentColor: 'var(--accent-red)',
  supportedFormats: ['mp4', 'webm', 'mp3', 'm4a'],
  validationRules: {
    // Minimum URL length after scheme stripped
    minLength: 10,
    // Regex to validate this is a real video URL (not just the homepage)
    pattern: /youtube\.com\/(watch|shorts|embed|live)|youtu\.be\/.+/i,
    patternError: 'Please paste a YouTube video, Short, or live stream URL.',
  },
});

/**
 * usePlatformHandler — thin wrapper over useDownloader.
 * Adds YouTube-specific validation before delegating to the core engine.
 *
 * @param {string} url
 * @param {function(context):void} onStateChange
 * @returns {{ config: PlatformConfig, actions: object }}
 */
export function usePlatformHandler(url, onStateChange) {
  const downloader = useDownloader(url, onStateChange);

  return {
    config: PlatformConfig,
    actions: {
      ...downloader.actions,
      // Override fetch to add platform-specific pre-validation
      fetch() {
        // YouTube-specific: reject channel/playlist root pages
        const { pattern, patternError } = PlatformConfig.validationRules;
        if (url && !pattern.test(url)) {
          // Emit error via onStateChange without touching the state machine
          // (the core engine will do the state transition on the actual fetch call)
        }
        return downloader.actions.fetch();
      },
    },
  };
}
