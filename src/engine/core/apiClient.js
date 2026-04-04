// ═══════════════════════════════════════════════════════════
// SmartSave.io — API Client
// Thin wrapper over the existing backend API.
// Extracts and modularises the fetch logic from download.js.
// ═══════════════════════════════════════════════════════════

// Reads from Vite env var — same as the existing download.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://smartsave-io.onrender.com';

/** Default timeout per request (ms) — matches legacy behaviour */
const DEFAULT_TIMEOUT = 120_000;

/** Max retries on network-level failures (AbortError / TypeError) */
const MAX_RETRIES = 2;

/** Delay between retries (ms) — gives Render cold-start time to wake up */
const RETRY_DELAY = 3_000;

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
      const isRetryable =
        err.name === 'AbortError' ||
        err.message.includes('Failed to fetch') ||
        err instanceof TypeError;

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
 * @returns {Promise<string>} jobId
 */
export async function startDownloadJob(mediaUrl, formatId) {
  const qs = new URLSearchParams({
    url: mediaUrl,
    format_id: formatId,
  });

  const response = await fetch(`${API_BASE}/api/prepare-download?${qs}`);
  const data = await response.json();

  if (!response.ok || !data.jobId) {
    throw new ApiError(data.error || 'Failed to start download job', response.status);
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
  const pollId = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/download-status?jobId=${jobId}`);
      const data = await res.json();

      if (data.status === 'ready') {
        clearInterval(pollId);
        onReady(`${API_BASE}/api/download?jobId=${jobId}`);
      } else if (data.status === 'error') {
        clearInterval(pollId);
        onError(data.error || 'Download failed during processing.');
      } else {
        onPending?.();
      }
    } catch (err) {
      clearInterval(pollId);
      onError(err.message || 'Lost connection while monitoring download.');
    }
  }, intervalMs);

  // Return cancel function
  return () => clearInterval(pollId);
}

/**
 * Trigger a browser file download from a URL.
 * Creates and clicks a hidden <a> element — same technique as legacy download.js.
 *
 * @param {string} downloadUrl
 */
export function triggerBrowserDownload(downloadUrl) {
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = '';
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
