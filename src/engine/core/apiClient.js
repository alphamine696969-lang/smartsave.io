// ═══════════════════════════════════════════════════════════
// SmartSave.io — API Client
// Thin wrapper over the existing backend API.
// Extracts and modularises the fetch logic from download.js.
// ═══════════════════════════════════════════════════════════

// Reads from Vite env var — same as the existing download.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://smartsave-io.onrender.com';

/**
 * Default timeout per request (ms).
 * The backend bounds /api/info to a 40s wall-clock budget, so this must sit
 * comfortably above it — otherwise we abort a request that was about to
 * succeed. Requests that exceed this are treated as failures, not retried.
 */
const DEFAULT_TIMEOUT = 50_000;

/** Max retries on network-level failures (TypeError / "Failed to fetch") */
const MAX_RETRIES = 1;

/** Delay between retries (ms) — gives Render cold-start time to wake up */
const RETRY_DELAY = 2_000;

/**
 * Internal fetch wrapper with timeout + retry logic.
 * Extracted verbatim from the existing download.js fetchWithRetry function
 * so existing retry behaviour is preserved.
 *
 * @param {string} url
 * @param {RequestInit} options
 * @param {function(string):void} [onRetry] - called with a status message on each retry
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, options, onRetry) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;

    } catch (err) {
      // An AbortError means *we* hit DEFAULT_TIMEOUT — retrying would just
      // double the user's wait. Only immediate network failures are retried
      // (those are typically Render cold-start hiccups).
      const isAbort = err.name === 'AbortError';
      const isRetryable = !isAbort && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Load failed') ||
        err instanceof TypeError
      );

      if (isAbort) {
        const timeoutErr = new Error(
          'The server took too long to respond. Please try again in a moment.'
        );
        timeoutErr.name = 'TimeoutError';
        throw timeoutErr;
      }

      if (attempt < MAX_RETRIES && isRetryable) {
        onRetry?.('Server is waking up, retrying…');
        await new Promise(r => setTimeout(r, RETRY_DELAY));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Fetch media info for a given URL.
 * Calls POST /api/info → returns the parsed data object.
 *
 * @param {string} mediaUrl - the original media URL
 * @param {function(string):void} [onStatusUpdate] - called with progress messages
 * @returns {Promise<{
 *   title: string,
 *   thumbnail: string|null,
 *   duration: number,
 *   uploader: string,
 *   platform: string,
 *   width: number|null,
 *   height: number|null,
 *   videoFormats: Array,
 *   audioFormats: Array
 * }>}
 */
export async function fetchMediaInfo(mediaUrl, onStatusUpdate) {
  onStatusUpdate?.('Connecting to server…');

  const response = await fetchWithRetry(
    `${API_BASE}/api/info`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: mediaUrl }),
    },
    onStatusUpdate
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new ApiError(
      errBody.error || `Server error (${response.status})`,
      response.status
    );
  }

  const result = await response.json();
  if (!result.success) {
    throw new ApiError(result.error || 'Unknown error from server', 500);
  }

  return result.data;
}

/**
 * Start a background download job.
 * Calls GET /api/prepare-download → returns jobId.
 *
 * @param {string} mediaUrl
 * @param {string} formatId
 * @param {string|null} [client] - player client reported by /api/info
 * @returns {Promise<string>} jobId
 */
export async function startDownloadJob(mediaUrl, formatId, client = null) {
  const params = {
    url: mediaUrl,
    format_id: formatId,
  };
  // Reuse the exact client that produced this format ID. Without it the
  // server can fall back to 360p-only clients and the picked quality fails.
  if (client && client !== 'default') params.client = client;

  const qs = new URLSearchParams(params);

  const response = await fetchWithRetry(
    `${API_BASE}/api/prepare-download?${qs}`,
    {},
    null
  );

  // The server may return an HTML error page (proxy/5xx), so never assume JSON.
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.jobId) {
    throw new ApiError(
      data.error || `Failed to start download job (${response.status})`,
      response.status
    );
  }

  return data.jobId;
}

/**
 * Poll job status until ready or error.
 * Returns a cleanup function — call it to stop polling manually.
 *
 * @param {string} jobId
 * @param {{
 *   onReady: function(string):void,   // called with download URL
 *   onError: function(string):void,   // called with error message
 *   onPending: function():void,       // called on each pending tick
 * }} callbacks
 * @param {number} [intervalMs=2000]
 * @returns {function} - call to cancel polling
 */
export function pollJobStatus(jobId, { onReady, onError, onPending }, intervalMs = 2000) {
  // Merging a 4K video + audio can legitimately take a while, so allow more
  // than five minutes before giving up.
  const MAX_POLL_TIME = 10 * 60 * 1000; // 10 minutes max
  const startTime = Date.now();
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearInterval(pollId);
  };

  const pollId = setInterval(async () => {
    if (stopped) return;

    if (Date.now() - startTime > MAX_POLL_TIME) {
      stop();
      onError('Download timed out. Please try again.');
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/download-status?jobId=${encodeURIComponent(jobId)}`,
        { cache: 'no-store' }
      );
      const data = await res.json().catch(() => ({}));

      // A 404 means the job is gone (server restart / expired). Anything else
      // that is not OK is transient, so keep polling.
      if (!res.ok) {
        if (res.status === 404) {
          stop();
          onError(data.error || 'This download session expired. Please start a new download.');
          return;
        }
        onPending?.();
        return;
      }

      if (data.status === 'ready') {
        stop();
        onReady(
          `${API_BASE}/api/download?jobId=${encodeURIComponent(jobId)}`,
          data.filename || null
        );
      } else if (data.status === 'error') {
        stop();
        onError(data.error || 'Download failed during processing.');
      } else {
        onPending?.();
      }
    } catch (err) {
      // One dropped request shouldn't kill the download — keep trying until
      // the overall timeout is reached.
      onPending?.();
    }
  }, intervalMs);

  return stop;
}

/**
 * Trigger a browser file download from a URL.
 * Creates and clicks a hidden <a> element.
 *
 * The backend sends a Content-Disposition header with the real filename.
 * We only set the `download` attribute when we actually know the name —
 * setting `download=""` makes same-origin browsers ignore the header and
 * save the file as "download" (no extension).
 *
 * @param {string} downloadUrl
 * @param {string|null} [filename]
 */
export function triggerBrowserDownload(downloadUrl, filename = null) {
  const a = document.createElement('a');
  a.href = downloadUrl;
  if (filename) a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Structured API error with HTTP status code.
 */
export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}
