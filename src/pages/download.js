// ═══════════════════════════════════════════════════════════
// SmartSave.io — Download Page
// Thin wrapper: mounts the DownloaderEngine orchestrator.
// The renderDownload() signature is UNCHANGED — router.js is untouched.
// ═══════════════════════════════════════════════════════════

import { mount } from '../engine/DownloaderEngine.js';

/**
 * Called by the router when navigating to /download.
 * Returns an empty shell HTML synchronously (router requirement),
 * then mounts the engine into the shell on the next tick.
 */
export function renderDownload() {
  const url = sessionStorage.getItem('downloadUrl') || '';

  // Schedule engine mount after the router injects this HTML into the DOM
  setTimeout(() => {
    const root = document.getElementById('engine-root');
    if (root) {
      mount(root, url);
    }
  }, 0);

  // The router wraps this in <div class="page">…</div>
  return `<div id="engine-root"></div>`;
}