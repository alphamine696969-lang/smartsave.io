// ═══════════════════════════════════════════════════════════
// SmartSave.io — TikTok Platform Adapter
// ═══════════════════════════════════════════════════════════

import { useDownloader } from '../core/engine.js';

export const PlatformConfig = Object.freeze({
  id: 'tiktok',
  displayName: 'TikTok',
  icon: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#010101" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z"/>
    <path fill="#EE1D52" d="M19.59 6.69A4.83 4.83 0 0115.82 2.44V2h-1.64v.44a4.83 4.83 0 003.77 4.25 4.85 4.85 0 001 .78V6.69z" opacity=".7"/>
    <path fill="#69C9D0" d="M9.49 16.22A2.89 2.89 0 0112.38 13.33V12a6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 002.89 5.35 2.89 2.89 0 01-.44-1.58 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.46a6.35 6.35 0 00-.79-.05" opacity=".7"/>
  </svg>`,
  accentColor: 'var(--accent-indigo)',
  supportedFormats: ['mp4'],
  validationRules: {
    minLength: 10,
    pattern: /(tiktok\.com\/@.+\/video\/|vm\.tiktok\.com\/)/i,
    patternError: 'Please paste a TikTok video URL.',
  },
});

export function usePlatformHandler(url, onStateChange) {
  const downloader = useDownloader(url, onStateChange);
  return {
    config: PlatformConfig,
    actions: {
      ...downloader.actions,
      fetch() {
        const { pattern, patternError } = PlatformConfig.validationRules;
        if (url && !pattern.test(url)) {
          onStateChange({
            state: 'invalid',
            error: patternError,
            mediaData: null,
            progress: null,
          });
          return;
        }
        return downloader.actions.fetch();
      },
    },
  };
}
