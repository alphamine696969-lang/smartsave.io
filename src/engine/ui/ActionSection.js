// ═══════════════════════════════════════════════════════════
// SmartSave.io — ActionSection UI Subcomponent
// Reset / "Download Another" secondary action.
// ═══════════════════════════════════════════════════════════

import { States } from '../core/stateMachine.js';

/**
 * @param {{
 *   state: string,
 * }} props
 * @returns {string} HTML string — empty string when no action needed
 */
export function ActionSection({ state }) {
  const showReset = [States.READY, States.SUCCESS, States.ERROR, States.INVALID].includes(state);
  if (!showReset) return '';

  return `
    <div class="engine__action-row">
      <button
        id="engine-reset-btn"
        class="engine__reset-btn"
        data-engine-reset
        aria-label="Start over with a new link"
      >
        ← Download Another File
      </button>
    </div>
  `;
}
