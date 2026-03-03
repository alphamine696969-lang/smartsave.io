// ═══════════════════════════════════════════════════════════
// SmartSave.io — Download Process Page (Real API)
// ═══════════════════════════════════════════════════════════

import { navigateTo } from '../router.js';

// API base URL — loaded from Vite env vars (.env / .env.production)
const API_BASE = import.meta.env.VITE_API_URL || 'https://smartsave-io.onrender.com';

export function renderDownload() {
  const url = sessionStorage.getItem('downloadUrl') || '';

  if (!url) {
    setTimeout(() => navigateTo('/'), 100);
    return `<div class="container" style="padding: var(--space-16); text-align: center;">
      <p>No URL provided. Redirecting...</p>
    </div>`;
  }

  // Detect platform from URL
  function detectPlatform(url) {
    const lower = url.toLowerCase();
    if (lower.includes('youtube') || lower.includes('youtu.be')) return { name: 'YouTube', icon: '🎬' };
    if (lower.includes('instagram')) return { name: 'Instagram', icon: '📸' };
    if (lower.includes('twitter') || lower.includes('x.com')) return { name: 'Twitter / X', icon: '🐦' };
    if (lower.includes('facebook') || lower.includes('fb.')) return { name: 'Facebook', icon: '👤' };
    if (lower.includes('pinterest')) return { name: 'Pinterest', icon: '📌' };
    if (lower.includes('tiktok')) return { name: 'TikTok', icon: '🎵' };
    return { name: 'Media', icon: '🔗' };
  }

  const platform = detectPlatform(url);

  // Start real fetch after render
  setTimeout(() => fetchMediaInfo(url, platform), 300);

  return `
    <div class="download-process">
      <div class="container--narrow" style="padding: var(--space-16) var(--space-4);">

        <!-- Step 1: Validating -->
        <div id="process-step-1" class="process-step active">
          <div class="process-loading">
            <div class="circular-loader" id="circular-loader">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#6366F1"/>
                    <stop offset="100%" stop-color="#A855F7"/>
                  </linearGradient>
                </defs>
                <circle class="circular-loader__track" cx="60" cy="60" r="54"/>
                <circle class="circular-loader__progress" id="loader-progress" cx="60" cy="60" r="54"/>
              </svg>
              <div class="circular-loader__text" id="loader-percent">0%</div>
            </div>
            <div class="process-loading__bar">
              <div class="process-loading__fill" id="loading-fill"></div>
            </div>
            <p class="process-loading__text" id="loading-text">
              <span>Initializing</span><span class="process-loading__dots"></span>
            </p>
            <p style="margin-top: var(--space-4); font-size: var(--font-sm); color: var(--text-muted);">
              ${platform.icon} Detected: <strong style="color: var(--text-primary);">${platform.name}</strong>
            </p>
          </div>
        </div>

        <!-- Step 2: Processing (Skeleton) -->
        <div id="process-step-2" class="process-step">
          <div style="text-align: center; margin-bottom: var(--space-8);">
            <h2 style="font-size: var(--font-2xl); font-weight: 800; margin-bottom: var(--space-2);">Preparing Your Download</h2>
            <p style="color: var(--text-secondary);">Analysing media and generating options…</p>
          </div>
          <div class="skeleton-cards">
            <div class="skeleton-card">
              <div class="skeleton-thumb"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line" style="width: 40%;"></div>
            </div>
            <div class="skeleton-card" style="animation-delay: 0.3s;">
              <div class="skeleton-thumb"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line" style="width: 55%;"></div>
            </div>
          </div>
        </div>

        <!-- Step 3: Results -->
        <div id="process-step-3" class="process-step">
          <div id="results-container"></div>
        </div>

        <!-- Error Step -->
        <div id="process-step-error" class="process-step">
          <div style="text-align: center; padding: var(--space-16) 0;">
            <div style="width: 80px; height: 80px; margin: 0 auto var(--space-6); background: rgba(239,68,68,0.1); border: 2px solid var(--accent-red); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <h2 style="font-size: var(--font-2xl); font-weight: 800; margin-bottom: var(--space-2);">Something Went Wrong</h2>
            <p id="error-message" style="color: var(--text-secondary); margin-bottom: var(--space-8);">Could not process this URL.</p>
            <a href="#/" style="padding: var(--space-3) var(--space-6); background: var(--gradient-primary); color: white; border-radius: var(--radius-lg); font-weight: 600; display: inline-block;">
              ← Try Another Link
            </a>
          </div>
        </div>

      </div>
    </div>
  `;
}

// ── Fetch from real API ──
async function fetchMediaInfo(url, platform) {
  const fill = document.getElementById('loading-fill');
  const text = document.getElementById('loading-text');
  const progress = document.getElementById('loader-progress');
  const percent = document.getElementById('loader-percent');
  const circumference = 2 * Math.PI * 54;

  const statusMessages = [
    { pct: 15, msg: 'Checking link' },
    { pct: 35, msg: 'Connecting to ' + platform.name },
    { pct: 55, msg: 'Fetching media info' },
    { pct: 70, msg: 'Analysing formats' },
  ];

  let step = 0;
  const statusInterval = setInterval(() => {
    if (step < statusMessages.length) {
      const s = statusMessages[step];
      updateProgress(s.pct, s.msg);
      step++;
    }
  }, 800);

  function updateProgress(pct, msg) {
    if (fill) fill.style.width = pct + '%';
    if (progress) progress.style.strokeDashoffset = circumference - (circumference * pct / 100);
    if (percent) percent.textContent = pct + '%';
    if (text) text.innerHTML = `<span>${msg}</span><span class="process-loading__dots"></span>`;
  }

  // Fetch with retry for Render cold starts
  async function fetchWithRetry(fetchUrl, options, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);
        const res = await fetch(fetchUrl, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return res;
      } catch (err) {
        if (attempt < retries && (err.name === 'AbortError' || err.message.includes('Failed to fetch') || err instanceof TypeError)) {
          console.warn(`Attempt ${attempt + 1} failed, retrying...`, err.message);
          updateProgress(45, 'Server is waking up, retrying');
          await wait(3000);
          continue;
        }
        throw err;
      }
    }
  }

  try {
    const response = await fetchWithRetry(`${API_BASE}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    clearInterval(statusInterval);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to process URL');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }

    updateProgress(90, 'Preparing download options');
    await wait(400);

    showStep(2);
    await wait(1200);

    updateProgress(100, 'Ready!');
    await wait(300);

    renderResults(result.data, url);
    showStep(3);

  } catch (err) {
    clearInterval(statusInterval);
    console.error('API error:', err);

    const errorMsg = document.getElementById('error-message');
    if (errorMsg) {
      errorMsg.textContent = err.message || 'Could not process this URL. Make sure the backend server is running.';
    }
    showStep('error');
  }
}

// ── Render Results ──
function renderResults(data, originalUrl) {
  const container = document.getElementById('results-container');
  if (!container) return;

  const formatDuration = (sec) => {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const thumbnailHtml = data.thumbnail
    ? `<img src="${data.thumbnail}" alt="${data.title}" style="width:100%; height:100%; object-fit:cover;" referrerpolicy="no-referrer" />`
    : `<div class="result-preview__play-btn">
        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
       </div>`;

  const makeCards = (formats, url) => formats.map((f, i) => {
    const isHD = f.height >= 1080;
    const badge = isHD ? '<span class="badge">HD</span>' : '';
    return `
      <div class="download-card" style="animation-delay: ${i * 100}ms;">
        <div class="download-card__info">
          <span class="download-card__quality">${f.label} ${badge}</span>
          <span class="download-card__size">${formatSize(f.filesize)}${f.note ? ' · ' + f.note : ''}</span>
        </div>
        <button class="download-card__btn" data-url="${url}" data-format="${f.format_id}" onclick="handleDownload(this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 5v14m0 0l-6-6m6 6l6-6"/></svg>
          Download
        </button>
      </div>
    `;
  }).join('');

  const videoCards = makeCards(data.videoFormats || [], originalUrl);
  const audioCards = makeCards(data.audioFormats || [], originalUrl);

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: var(--space-8);">
      <div class="success-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style="font-size: var(--font-2xl); font-weight: 800; margin-bottom: var(--space-2);">Ready to Download!</h2>
      <p style="color: var(--text-secondary);">Your media has been processed. Choose a format below.</p>
    </div>

    <div class="result-preview">
      <div class="result-preview__media">${thumbnailHtml}</div>
      <div class="result-preview__info">
        <div>
          <p class="result-preview__title">${data.title}</p>
          <div class="result-preview__meta">
            ${data.platform ? `<span>🌐 ${data.platform}</span>` : ''}
            ${data.width && data.height ? `<span>📐 ${data.width}×${data.height}</span>` : ''}
            ${data.duration ? `<span>⏱ ${formatDuration(data.duration)}</span>` : ''}
            ${data.uploader ? `<span>👤 ${data.uploader}</span>` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- VIDEO Section -->
    ${(data.videoFormats && data.videoFormats.length > 0) ? `
      <h3 style="font-size: var(--font-lg); font-weight: 700; margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
        <span style="font-size: 1.3em;">🎬</span> Video
        <span style="font-size: var(--font-xs); color: var(--text-muted); font-weight: 500; margin-left: var(--space-2);">Video + Audio</span>
      </h3>
      <div class="download-options">${videoCards}</div>
    ` : ''}

    <!-- AUDIO Section -->
    ${(data.audioFormats && data.audioFormats.length > 0) ? `
      <h3 style="font-size: var(--font-lg); font-weight: 700; margin-top: var(--space-10); margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
        <span style="font-size: 1.3em;">🎵</span> Audio Only
      </h3>
      <div class="download-options">${audioCards}</div>
    ` : ''}

    ${(!data.videoFormats?.length && !data.audioFormats?.length) ? `
      <div class="error-message" style="margin-top: var(--space-4);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        No downloadable formats found. The content may be protected or private.
      </div>
    ` : ''}

    <div style="text-align: center; margin-top: var(--space-10);">
      <a href="#/" style="color: var(--accent-indigo); font-weight: 600; font-size: var(--font-sm);">
        ← Download Another File
      </a>
    </div>
  `;
}

// ── Handle Download Click ──
window.handleDownload = async function (btn) {
  const originalUrl = btn.dataset.url;
  const formatId = btn.dataset.format;
  const originalHtml = btn.innerHTML;

  // Pop Under Ad Trigger
  try {
    const adWindow = window.open('https://google.com/search?q=Special+Advertisement', '_blank');
    if (adWindow) {
      adWindow.blur();
      window.focus();
    }
  } catch (e) {
    // Ad blockers might block this
  }

  // Processing State
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
    Preparing...
  `;
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.7';

  try {
    const prepRes = await fetch(`${API_BASE}/api/prepare-download?url=${encodeURIComponent(originalUrl)}&format_id=${encodeURIComponent(formatId)}`);
    const prepData = await prepRes.json();

    if (!prepRes.ok || !prepData.jobId) {
      throw new Error(prepData.error || 'Failed to start download');
    }

    const jobId = prepData.jobId;

    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await fetch(`${API_BASE}/api/download-status?jobId=${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'ready') {
          clearInterval(pollInterval);

          const downloadUrl = `${API_BASE}/api/download?jobId=${jobId}`;
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = '';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Done!
          `;
          btn.style.background = 'linear-gradient(135deg, #34D399, #10B981)';
          btn.style.opacity = '1';

          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = 'var(--gradient-primary)';
            btn.style.pointerEvents = 'auto';
          }, 5000);

        } else if (statusData.status === 'error') {
          clearInterval(pollInterval);
          throw new Error(statusData.error || 'Download failed during merging');
        } else {
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Processing...
          `;
        }
      } catch (err) {
        clearInterval(pollInterval);
        showErrorState(btn, originalHtml, err.message);
      }
    }, 2000);

  } catch (err) {
    showErrorState(btn, originalHtml, err.message);
  }
};

function showErrorState(btn, originalHtml, msg) {
  btn.innerHTML = `Error: ${msg}`;
  btn.style.background = '#EF4444';
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = 'var(--gradient-primary)';
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
  }, 4000);
}

// ── Helpers ──
function showStep(num) {
  document.querySelectorAll('.process-step').forEach(el => el.classList.remove('active'));
  const step = document.getElementById(`process-step-${num}`);
  if (step) step.classList.add('active');
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}