// ═══════════════════════════════════════════════════════════
// SmartSave.io — useDownloader() Engine Hook
// Orchestrates state transitions and API calls.
// Returns a plain object — no framework coupling.
// ═══════════════════════════════════════════════════════════

import { States, Events, transition } from './stateMachine.js';
import { parseUrl } from './urlParser.js';
import { fetchMediaInfo, startDownloadJob, pollJobStatus, triggerBrowserDownload } from './apiClient.js';

/**
 * Creates a downloader controller for a given URL.
 * Manages the full state machine lifecycle — from URL parsing
 * through API fetching to file delivery.
 *
 * Usage:
 *   const dl = useDownloader(url, onStateChange);
 *   dl.actions.fetch();           // Start the info fetch
 *   dl.actions.download(formatId) // Trigger download
 *   dl.actions.reset()            // Return to idle
 *
 * @param {string} initialUrl - raw URL string from the user
 * @param {function(context):void} onStateChange - called whenever state or data changes
 *        context = { state, mediaData, parseResult, progress, error }
 * @returns {{
 *   actions: {
 *     fetch: function():void,
 *     download: function(formatId:string):void,
 *     reset: function():void,
 *   }
 * }}
 */
export function useDownloader(initialUrl, onStateChange) {
  // Internal mutable context — only mutated via dispatch()
  const ctx = {
    state: States.IDLE,
    url: initialUrl,
    parseResult: null,   // result of parseUrl()
    mediaData: null,     // result of fetchMediaInfo()
    progress: null,      // { message: string, percent: number|null }
    error: null,         // string | null
    cancelPoll: null,    // cleanup function for pollJobStatus()
  };

  /** Emit the current context to the subscriber */
  function emit() {
    onStateChange({ ...ctx });
  }

  /** Apply a state transition and emit */
  function dispatch(event, patch = {}) {
    const nextState = transition(ctx.state, event);
    Object.assign(ctx, patch, { state: nextState });
    emit();
  }

  /** Update progress message without changing state */
  function setProgress(message, percent = null) {
    ctx.progress = { message, percent };
    emit();
  }

  // ── Actions ────────────────────────────────────────────────

  /**
   * Validate the URL, detect the platform, then fetch media info.
   * Drives the machine: IDLE → PARSING → FETCHING → READY | ERROR
   */
  async function fetch() {
    // Prevent double-execution
    if (ctx.state === States.FETCHING || ctx.state === States.DOWNLOADING) return;

    // Cancel any in-flight polling
    ctx.cancelPoll?.();

    dispatch(Events.SUBMIT, { error: null, mediaData: null, progress: null });
    setProgress('Validating URL…', 10);

    // — PARSING phase —
    const parseResult = parseUrl(ctx.url);
    ctx.parseResult = parseResult;

    if (!parseResult.isValid) {
      dispatch(Events.PARSE_FAIL, { error: parseResult.error });
      return;
    }

    if (!parseResult.platformId) {
      // Structurally valid URL but platform not supported — stay in INVALID
      dispatch(Events.PARSE_FAIL, {
        error: 'This platform isn\'t supported yet. Try YouTube, Instagram, Twitter/X, Pinterest, or TikTok.',
      });
      return;
    }

    // URL valid + platform detected → start fetching
    dispatch(Events.PARSE_OK, { error: null });
    setProgress('Connecting to platform…', 25);

    // — FETCHING phase —
    try {
      dispatch(Events.FETCH_START);

      const milestones = [
        { at: 1500,  message: 'Fetching media metadata…', percent: 45 },
        { at: 3000,  message: 'Analysing available formats…', percent: 65 },
        { at: 5000,  message: 'Preparing download options…', percent: 80 },
      ];

      // Simulate progress milestones while the real API request is in flight
      const timers = milestones.map(m =>
        setTimeout(() => {
          if (ctx.state === States.FETCHING) setProgress(m.message, m.percent);
        }, m.at)
      );

      const mediaData = await fetchMediaInfo(
        parseResult.normalizedUrl,
        (msg) => {
          if (ctx.state === States.FETCHING) setProgress(msg, 35);
        }
      );

      timers.forEach(clearTimeout);
      dispatch(Events.FETCH_OK, { mediaData, error: null });
      setProgress('Ready!', 100);

    } catch (err) {
      dispatch(Events.FETCH_FAIL, { error: err.message });
    }
  }

  /**
   * Trigger a download for the given format ID.
   * Drives: READY → DOWNLOADING → SUCCESS | ERROR
   *
   * @param {string} formatId
   */
  async function download(formatId) {
    if (ctx.state !== States.READY) return;

    dispatch(Events.DOWNLOAD_START, { error: null });
    setProgress('Starting download job…', null);

    // Open a pop-under ad (matches existing behaviour from download.js)
    try {
      const adWindow = window.open('https://google.com/search?q=Special+Advertisement', '_blank');
      if (adWindow) { adWindow.blur(); window.focus(); }
    } catch { /* Ad blocker present — proceed silently */ }

    try {
      const jobId = await startDownloadJob(ctx.parseResult.normalizedUrl, formatId);

      setProgress('Processing your download…', null);

      // Poll until job completes
      const cancelFn = pollJobStatus(
        jobId,
        {
          onReady: (downloadUrl) => {
            triggerBrowserDownload(downloadUrl);
            dispatch(Events.DOWNLOAD_OK, { error: null });
            setProgress('Downloaded!', 100);
          },
          onError: (message) => {
            dispatch(Events.DOWNLOAD_FAIL, { error: message });
          },
          onPending: () => {
            setProgress('Processing your download…', null);
          },
        }
      );

      ctx.cancelPoll = cancelFn;

    } catch (err) {
      dispatch(Events.DOWNLOAD_FAIL, { error: err.message });
    }
  }

  /**
   * Reset the machine back to IDLE.
   * Cancels any in-flight polling.
   */
  function reset() {
    ctx.cancelPoll?.();
    dispatch(Events.RESET, {
      url: '',
      parseResult: null,
      mediaData: null,
      progress: null,
      error: null,
      cancelPoll: null,
    });
  }

  return {
    actions: { fetch, download, reset },
  };
}
