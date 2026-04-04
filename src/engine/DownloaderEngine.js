// ═══════════════════════════════════════════════════════════
// SmartSave.io — DownloaderEngine (Orchestrator)
//
// Root component responsible for:
// 1. Reading the raw URL from sessionStorage
// 2. Detecting the platform via the registry
// 3. Mounting the correct platform handler
// 4. Composing UI subcomponents from current state
// 5. Re-rendering only the changed region on state updates
// 6. Handling all DOM event delegation in one place
//
// DESIGN PRINCIPLE: All child components are pure renderers
// (props → HTML string). The orchestrator holds the only mutable
// state and drives renders — no child component touches the DOM.
// ═══════════════════════════════════════════════════════════

import { States, isLoadingState } from './core/stateMachine.js';
import { parseUrl } from './core/urlParser.js';
import { registry } from './platforms/index.js';
import { detectAndRoute } from './core/smartRouter.js';

import { HeaderSection } from './ui/HeaderSection.js';
import { UrlInputSection } from './ui/UrlInputSection.js';
import { MediaPreviewSection } from './ui/MediaPreviewSection.js';
import { DownloadOptionsSection } from './ui/DownloadOptionsSection.js';
import { ActionSection } from './ui/ActionSection.js';
import { StatusSection } from './ui/StatusSection.js';

/**
 * Mount the DownloaderEngine into a given container element.
 *
 * @param {HTMLElement} container - the root DOM node to render into
 * @param {string}      initialUrl - raw URL from sessionStorage (may be '')
 */
/**
 * @param {HTMLElement} container
 * @param {string}      initialUrl
 * @param {{ id: string }|null} platformContext  — null = generic page
 */
export function mount(container, initialUrl, platformContext = null) {
  // ── Internal mutable state ─────────────────────────────
  let ctx = {
    state: States.IDLE,
    url: initialUrl || '',
    parseResult: null,
    mediaData: null,
    progress: null,
    error: null,
    activeTab: 'video',    // controlled tab for DownloadOptionsSection
    platformConfig: null,  // resolved after PARSE_OK
    handler: null,         // platform handler { actions }
  };

  // ── Initial render ─────────────────────────────────────
  render();

  // On mount: if we already have a URL, kick off the fetch immediately
  // (mirrors legacy download.js behaviour — no user action needed)
  if (ctx.url) {
    resolveAndFetch(ctx.url);
  }

  // ── Rendering ──────────────────────────────────────────

  function render() {
    const html = compose(ctx);
    container.innerHTML = html;
    bindEvents();
  }

  /**
   * Compose all subcomponents into final HTML.
   * Subcomponents are pure — only this function touches the DOM structure.
   */
  function compose(c) {
    const showLoading  = isLoadingState(c.state);
    const showPreview  = c.mediaData && [States.READY, States.DOWNLOADING, States.SUCCESS].includes(c.state);
    const showOptions  = c.state === States.READY;
    const showStatus   = c.state !== States.IDLE && c.state !== States.INVALID;
    const showUrlInput = [States.IDLE, States.INVALID, States.READY, States.SUCCESS, States.ERROR].includes(c.state);

    return `
      <div class="download-process engine__download-section" role="main">
        <div class="container--narrow" style="padding: var(--space-16) var(--space-4);">

          ${HeaderSection({
            platformConfig: c.platformConfig,
            showPlatformBadge: !!(c.platformConfig && !isLoadingState(c.state) && c.state !== States.IDLE),
          })}

          ${showUrlInput ? UrlInputSection({ url: c.url, state: c.state, error: c.state === States.INVALID ? c.error : null }) : ''}

          ${showStatus ? StatusSection({ state: c.state, progress: c.progress, error: c.error }) : ''}

          ${showPreview ? MediaPreviewSection({ state: c.state, mediaData: c.mediaData }) : ''}
          ${showLoading && !c.mediaData ? MediaPreviewSection({ state: c.state, mediaData: null }) : ''}

          ${showOptions ? DownloadOptionsSection({ mediaData: c.mediaData, activeTab: c.activeTab }) : ''}

          ${ActionSection({ state: c.state })}

        </div>
      </div>
    `;
  }

  // ── Event delegation ───────────────────────────────────
  // Single listener on the container — no per-element listeners on dynamic HTML.
  // All registered listeners use stable function references, so re-calling
  // bindEvents() on every render does NOT stack up duplicates.

  let _pasteTimer = null;

  function bindEvents() {
    container.addEventListener('submit', onFormSubmit, { once: true });
    container.addEventListener('click', onContainerClick);
    container.addEventListener('paste', onPaste);
  }

  function onFormSubmit(e) {
    if (e.target.id !== 'engine-url-form') return;
    e.preventDefault();
    const input = container.querySelector('#engine-url-input');
    const rawUrl = input?.value?.trim() || '';
    if (!rawUrl) return;

    // Smart route: if platform locked and URL belongs elsewhere, redirect
    if (platformContext) {
      const { shouldRedirect } = detectAndRoute(rawUrl, platformContext.id);
      if (shouldRedirect) return; // redirect is in flight
    }

    ctx.url = rawUrl;
    resolveAndFetch(rawUrl);
  }

  function onContainerClick(e) {
    // Tab switching
    const tab = e.target.closest('[data-engine-tab]');
    if (tab) {
      ctx.activeTab = tab.dataset.engineTab;
      render();
      return;
    }

    // Download button
    const dlBtn = e.target.closest('[data-engine-download]');
    if (dlBtn && ctx.state === States.READY && ctx.handler) {
      ctx.handler.actions.download(dlBtn.dataset.formatId);
      return;
    }

    // Reset button
    const resetBtn = e.target.closest('[data-engine-reset]');
    if (resetBtn && ctx.handler) {
      ctx.handler.actions.reset();
      ctx.url = '';
      ctx.platformConfig = null;
      ctx.handler = null;
      ctx.parseResult = null;
      updateCtx({ state: States.IDLE, mediaData: null, progress: null, error: null });
      return;
    }
  }

  // ── Paste auto-detection ───────────────────────────────

  function onPaste(e) {
    if (!e.target.closest('#engine-url-input')) return;
    const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    if (!pasted.trim()) return;

    clearTimeout(_pasteTimer);
    _pasteTimer = setTimeout(() => {
      const result = parseUrl(pasted);
      if (!result.platformId) return;

      if (platformContext && result.platformId !== platformContext.id) {
        // Wrong platform — let smartRouter handle redirect
        detectAndRoute(pasted, platformContext.id);
        return;
      }

      // Correct platform: pre-show platform badge immediately
      const adapterModule = registry.get(result.platformId);
      if (adapterModule && !ctx.platformConfig) {
        ctx.platformConfig = adapterModule.PlatformConfig;
        render();
      }
    }, 280);
  }

  // ── Core orchestration ─────────────────────────────────

  /**
   * Parse URL → resolve platform adapter → kick off fetch.
   * If platform is unsupported, render the INVALID state immediately.
   */
  function resolveAndFetch(rawUrl) {
    const parseResult = parseUrl(rawUrl);
    ctx.parseResult = parseResult;

    if (!parseResult.isValid) {
      updateCtx({ state: States.INVALID, error: parseResult.error });
      return;
    }

    if (!parseResult.platformId) {
      updateCtx({
        state: States.INVALID,
        error: 'This platform isn\'t supported yet. Try YouTube, Instagram, Twitter/X, Pinterest, or TikTok.',
      });
      return;
    }

    const adapterModule = registry.get(parseResult.platformId);
    if (!adapterModule) {
      // Registry has no entry for this platform ID — should not happen but be defensive
      updateCtx({
        state: States.INVALID,
        error: `Platform "${parseResult.platformId}" is not yet available.`,
      });
      return;
    }

    // Resolve the platform config for UI display
    ctx.platformConfig = adapterModule.PlatformConfig;

    // Create a handler bound to the resolved URL and the state-change callback
    const handler = adapterModule.usePlatformHandler(
      parseResult.normalizedUrl,
      (engineCtx) => updateCtx(engineCtx)
    );
    ctx.handler = handler;

    // Kick off the info fetch immediately
    handler.actions.fetch();
  }

  /**
   * Merge new context from engine hook and re-render.
   * The engine hook returns its entire internal state — we merge selectively
   * so orchestrator-managed fields (activeTab, platformConfig) are preserved.
   */
  function updateCtx(patch) {
    // Preserve orchestrator-owned fields not managed by the engine hook
    const preserved = {
      activeTab:      ctx.activeTab,
      platformConfig: ctx.platformConfig,
      handler:        ctx.handler,
      url:            ctx.url,
      parseResult:    ctx.parseResult,
    };
    Object.assign(ctx, preserved, patch);
    render();
  }
}
