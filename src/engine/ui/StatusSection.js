// ═══════════════════════════════════════════════════════════
// SmartSave.io — StatusSection UI Subcomponent
// Progress loader, success, and error state displays.
// Reuses: circular-loader, process-loading, success-check primitives.
// ═══════════════════════════════════════════════════════════

import { States, isLoadingState } from '../core/stateMachine.js';
import { escapeHtml } from './htmlUtils.js';

const CIRCUMFERENCE = 2 * Math.PI * 54; // matches circular-loader r=54

/**
 * @param {{
 *   state: string,
 *   progress: { message: string, percent: number|null } | null,
 *   error: string | null,
 * }} props
 * @returns {string} HTML string — empty when nothing to show
 */
export function StatusSection({ state, progress, error }) {
  if (isLoadingState(state)) {
    return renderLoading(progress, state);
  }

  if (state === States.SUCCESS) {
    return renderSuccess();
  }

  if (state === States.ERROR) {
    return renderError(error);
  }

  if (state === States.READY) {
    return renderReadyBanner();
  }

  return '';
}

function renderLoading(progress, state) {
  const pct = progress?.percent ?? 0;
  const msg = progress?.message ?? 'Working…';
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * pct / 100);

  // Distinguish between info-fetching and file-downloading visually
  const isPreparing = state === States.DOWNLOADING;

  return `
    <div class="process-loading engine__status-loading" role="status" aria-live="polite" aria-busy="true">
      <div class="circular-loader" aria-hidden="true">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--accent-indigo)"/>
              <stop offset="100%" stop-color="var(--accent-purple)"/>
            </linearGradient>
          </defs>
          <circle class="circular-loader__track" cx="60" cy="60" r="54"/>
          <circle
            class="circular-loader__progress"
            cx="60" cy="60" r="54"
            style="stroke-dashoffset: ${offset};"
          />
        </svg>
        <div class="circular-loader__text">${pct > 0 ? pct + '%' : '…'}</div>
      </div>

      ${isPreparing
        ? `<p class="process-loading__text engine__status-msg">
             <span>${escapeHtml(msg)}</span>
             <span class="process-loading__dots"></span>
           </p>
           <p class="engine__status-hint">Large files may take a moment — please keep this tab open.</p>`
        : `<div class="process-loading__bar">
             <div class="process-loading__fill" style="width:${pct}%;"></div>
           </div>
           <p class="process-loading__text engine__status-msg">
             <span>${escapeHtml(msg)}</span>
             <span class="process-loading__dots"></span>
           </p>`
      }
    </div>
  `;
}

function renderReadyBanner() {
  return `
    <div class="engine__ready-banner" role="status">
      <div class="success-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 class="engine__ready-title">Ready to Download!</h2>
      <p class="engine__ready-sub">Choose a format below.</p>
    </div>
  `;
}

function renderSuccess() {
  return `
    <div class="engine__success" role="status" aria-live="polite">
      <div class="success-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 class="engine__success-title">Download Started!</h2>
      <p class="engine__success-sub">Your file is downloading. You can close this tab once it's complete.</p>
    </div>
  `;
}

function renderError(error) {
  return `
    <div class="engine__error-state" role="alert">
      <div class="engine__error-icon" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
             stroke="var(--accent-red)" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 class="engine__error-title">Something Went Wrong</h2>
      <p class="engine__error-msg">${escapeHtml(error || 'Could not process this URL.')}</p>
    </div>
  `;
}
