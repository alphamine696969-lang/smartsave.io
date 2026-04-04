// ═══════════════════════════════════════════════════════════
// SmartSave.io — Toast Notification System
// Self-contained, scoped under #ss-toast-root.
// Uses ONLY existing CSS custom properties — zero global conflicts.
// ═══════════════════════════════════════════════════════════

const ROOT_ID = 'ss-toast-root';
let _timer   = null;
let _counter = 0;

const SVG = {
  info:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  success:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  redirect: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>`,
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'info'|'success'|'error'|'redirect'} type
 * @param {number} duration — ms before auto-dismiss
 */
export function showToast(message, type = 'info', duration = 4200) {
  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;
    document.body.appendChild(root);
  }

  clearTimeout(_timer);
  const id = ++_counter;

  root.innerHTML = `
    <div class="ss-toast ss-toast--${type}" id="ss-toast-${id}" role="alert" aria-live="assertive">
      <span class="ss-toast__icon">${SVG[type] || SVG.info}</span>
      <span class="ss-toast__msg">${esc(message)}</span>
      <button
        class="ss-toast__close"
        aria-label="Dismiss notification"
        onclick="
          var t=document.getElementById('ss-toast-${id}');
          if(t){t.classList.add('ss-toast--exit');}
        "
      >✕</button>
    </div>
  `;

  // Trigger enter animation on next paint
  requestAnimationFrame(() => {
    const el = document.getElementById(`ss-toast-${id}`);
    if (el) el.classList.add('ss-toast--visible');
  });

  _timer = setTimeout(() => dismissToast(id), duration);
}

function dismissToast(id) {
  const el = document.getElementById(`ss-toast-${id}`);
  if (!el) return;
  el.classList.add('ss-toast--exit');
  setTimeout(() => {
    const root = document.getElementById(ROOT_ID);
    if (root) root.innerHTML = '';
  }, 380);
}

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
