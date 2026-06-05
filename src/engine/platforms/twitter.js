// ═══════════════════════════════════════════════════════════
// SmartSave.io — Twitter / X Platform Adapter
// ═══════════════════════════════════════════════════════════

import { useDownloader } from '../core/engine.js';

export const PlatformConfig = Object.freeze({
  id: 'twitter',
  displayName: 'Twitter / X',
  icon: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#1DA1F2" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>`,
  accentColor: 'var(--accent-blue)',
  supportedFormats: ['mp4', 'gif'],
  validationRules: {
    minLength: 10,
    pattern: /(twitter\.com|x\.com)\/\w+\/status\/\d+/i,
    patternError: 'Please paste a Twitter/X post URL (must include a status ID).',
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
            state: 'INVALID',
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
