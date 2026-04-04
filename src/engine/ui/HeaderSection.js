// ═══════════════════════════════════════════════════════════
// SmartSave.io — HeaderSection UI Subcomponent
// Displays the platform badge + page title.
// Pure renderer — all props-driven, zero internal state.
// ═══════════════════════════════════════════════════════════

/**
 * Render the page header for the downloader.
 *
 * @param {{
 *   platformConfig: object|null,  // PlatformConfig from platform adapter
 *   showPlatformBadge: boolean,   // Show the detected-platform chip
 * }} props
 * @returns {string} HTML string
 */
export function HeaderSection({ platformConfig, showPlatformBadge = false }) {
  const badgeHtml = showPlatformBadge && platformConfig
    ? `<div class="engine__platform-badge" role="status" aria-live="polite">
        <span class="engine__platform-badge-icon" aria-hidden="true">${platformConfig.icon}</span>
        <span class="engine__platform-badge-name">${platformConfig.displayName} detected</span>
       </div>`
    : '';

  return `
    <div class="engine__header">
      <h1 class="engine__header-title">
        <span class="text-gradient">Your Download</span>
      </h1>
      <p class="engine__header-subtitle">
        Paste a link — we'll detect the platform and prepare your formats automatically.
      </p>
      ${badgeHtml}
    </div>
  `;
}
