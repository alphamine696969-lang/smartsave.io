// ═══════════════════════════════════════════════════════════
// SmartSave.io — MediaPreviewSection UI Subcomponent
// Shows the thumbnail, title, and metadata for the fetched media.
// Handles: loading skeleton / empty / error / ready states.
// ═══════════════════════════════════════════════════════════

import { States } from '../core/stateMachine.js';

/**
 * @param {{
 *   state: string,
 *   mediaData: object|null,  // from fetchMediaInfo()
 * }} props
 * @returns {string} HTML string
 */
export function MediaPreviewSection({ state, mediaData }) {
  if (state === States.FETCHING || state === States.PARSING) {
    return renderSkeleton();
  }

  if (!mediaData) return '';

  return renderPreview(mediaData);
}

function renderSkeleton() {
  return `
    <div class="engine__preview-skeleton" aria-busy="true" aria-label="Loading media information">
      <div class="skeleton-card" style="display:flex; gap: var(--space-5); align-items: flex-start;">
        <div class="skeleton-thumb engine__skeleton-thumb" style="flex-shrink:0;"></div>
        <div style="flex:1;">
          <div class="skeleton-line"></div>
          <div class="skeleton-line" style="width:70%;"></div>
          <div class="skeleton-line" style="width:45%;"></div>
        </div>
      </div>
    </div>
  `;
}

function renderPreview(data) {
  const thumbnailHtml = data.thumbnail
    ? `<img
         src="${escapeAttr(data.thumbnail)}"
         alt="Thumbnail for ${escapeAttr(data.title)}"
         class="engine__preview-thumb-img"
         referrerpolicy="no-referrer"
         loading="lazy"
       />`
    : `<div class="result-preview__play-btn" aria-hidden="true">
         <svg viewBox="0 0 24 24" fill="currentColor">
           <polygon points="5 3 19 12 5 21 5 3"/>
         </svg>
       </div>`;

  const metaItems = [
    data.platform   && `<span class="engine__meta-item">🌐 ${escapeHtml(data.platform)}</span>`,
    data.duration   && `<span class="engine__meta-item">⏱ ${formatDuration(data.duration)}</span>`,
    data.width && data.height && `<span class="engine__meta-item">📐 ${data.width}×${data.height}</span>`,
    data.uploader   && `<span class="engine__meta-item">👤 ${escapeHtml(data.uploader)}</span>`,
  ].filter(Boolean).join('');

  return `
    <div class="result-preview engine__preview" aria-label="Media preview">
      <div class="result-preview__media engine__preview-thumb">
        ${thumbnailHtml}
      </div>
      <div class="result-preview__info">
        <div>
          <p class="result-preview__title">${escapeHtml(data.title)}</p>
          <div class="result-preview__meta engine__meta">
            ${metaItems}
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatDuration(sec) {
  if (!sec) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
