// ═══════════════════════════════════════════════════════════
// SmartSave.io — DownloadOptionsSection UI Subcomponent
// Lists available video + audio format cards.
// Uses download-card, badge design system primitives.
// ═══════════════════════════════════════════════════════════

/**
 * @param {{
 *   mediaData: object|null,
 *   activeTab: 'video'|'audio',  // controlled by orchestrator
 * }} props
 * @returns {string} HTML string
 */
export function DownloadOptionsSection({ mediaData, activeTab = 'video' }) {
  if (!mediaData) return '';

  const videoFormats = mediaData.videoFormats || [];
  const audioFormats = mediaData.audioFormats || [];
  const hasVideo = videoFormats.length > 0;
  const hasAudio = audioFormats.length > 0;

  if (!hasVideo && !hasAudio) {
    return `
      <div class="engine__no-formats" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        No downloadable formats found. The content may be private or protected.
      </div>
    `;
  }

  const tabBar = (hasVideo && hasAudio)
    ? `<div class="engine__tab-bar" role="tablist" aria-label="Format type">
        <button
          class="engine__tab${activeTab === 'video' ? ' active' : ''}"
          role="tab"
          aria-selected="${activeTab === 'video'}"
          data-engine-tab="video"
          id="tab-video"
          aria-controls="panel-video"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          Video
        </button>
        <button
          class="engine__tab${activeTab === 'audio' ? ' active' : ''}"
          role="tab"
          aria-selected="${activeTab === 'audio'}"
          data-engine-tab="audio"
          id="tab-audio"
          aria-controls="panel-audio"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          Audio Only
        </button>
       </div>`
    : '';

  const videoPanel = hasVideo
    ? `<div
         id="panel-video"
         role="tabpanel"
         aria-labelledby="tab-video"
         class="download-options engine__format-panel"
         ${activeTab !== 'video' && hasAudio ? 'hidden' : ''}
       >
         ${videoFormats.map((f, i) => formatCard(f, i)).join('')}
       </div>`
    : '';

  const audioPanel = hasAudio
    ? `<div
         id="panel-audio"
         role="tabpanel"
         aria-labelledby="tab-audio"
         class="download-options engine__format-panel"
         ${activeTab !== 'audio' || !hasVideo ? '' : 'hidden'}
       >
         ${audioFormats.map((f, i) => formatCard(f, i)).join('')}
       </div>`
    : '';

  return `
    <div class="engine__options-wrapper">
      ${tabBar}
      ${videoPanel}
      ${audioPanel}
    </div>
  `;
}

function formatCard(f, index) {
  const sizeLabel = f.filesize ? formatBytes(f.filesize) : 'Size unknown';
  const isHD = (f.height || 0) >= 1080;
  const isBest = f.isBest;
  const badge = isBest
    ? '<span class="badge engine__best-badge">BEST</span>'
    : isHD
      ? '<span class="badge">HD</span>'
      : '';

  return `
    <div
      class="download-card engine__download-card"
      style="animation-delay: ${index * 80}ms;"
    >
      <div class="download-card__info">
        <span class="download-card__quality">
          ${escapeHtml(f.label)} ${badge}
        </span>
        <span class="download-card__size">
          ${sizeLabel}${f.note ? ` · ${escapeHtml(f.note)}` : ''}
        </span>
      </div>
      <button
        class="download-card__btn engine__dl-btn"
        data-engine-download
        data-format-id="${escapeAttr(f.format_id)}"
        aria-label="Download in ${escapeAttr(f.label)} format"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
          <path d="M12 5v14m0 0l-6-6m6 6l6-6"/>
        </svg>
        Download
      </button>
    </div>
  `;
}

function formatBytes(bytes) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
