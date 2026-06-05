// ═══════════════════════════════════════════════════════════
// SmartSave.io — UrlInputSection UI Subcomponent
// The main URL input field + submit button.
// ═══════════════════════════════════════════════════════════

import { isInputEnabled } from '../core/stateMachine.js';
import { escapeHtml, escapeAttr } from './htmlUtils.js';

/**
 * @param {{
 *   url: string,
 *   state: string,        // current machine state
 *   error: string|null,   // validation error message
 * }} props
 * @returns {string} HTML string
 */
export function UrlInputSection({ url, state, error }) {
  const disabled = !isInputEnabled(state);
  const hasError = !!error;
  const inputClass = `hero__input engine__url-input${hasError ? ' engine__url-input--error' : ''}`;

  return `
    <form
      id="engine-url-form"
      class="hero__input-group engine__url-form"
      novalidate
      aria-label="Media URL input form"
    >
      <div class="engine__input-wrapper">
        <input
          id="engine-url-input"
          type="url"
          class="${inputClass}"
          placeholder="Paste your link here — https://..."
          value="${escapeAttr(url)}"
          autocomplete="off"
          spellcheck="false"
          aria-label="Media URL"
          aria-required="true"
          aria-invalid="${hasError}"
          aria-describedby="${hasError ? 'engine-url-error' : ''}"
          ${disabled ? 'disabled' : ''}
        />
        ${hasError
          ? `<p id="engine-url-error" class="engine__input-error" role="alert">${escapeHtml(error)}</p>`
          : ''}
      </div>
      <button
        type="submit"
        id="engine-submit-btn"
        class="hero__btn engine__submit-btn"
        aria-label="Fetch download options"
        ${disabled ? 'disabled aria-busy="true"' : ''}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 5v14m0 0l-6-6m6 6l6-6"/>
        </svg>
        ${disabled ? 'Fetching…' : 'Download'}
      </button>
    </form>
  `;
}
