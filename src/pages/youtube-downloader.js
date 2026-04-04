// ═══════════════════════════════════════════════════════════
// SmartSave.io — YouTube Downloader Page
// Premium dedicated page with animated hero, inline form,
// and best-in-class YouTube downloading experience.
// ═══════════════════════════════════════════════════════════

import { mount } from '../engine/DownloaderEngine.js';
import { updateSEO, buildPlatformJsonLd } from '../engine/core/seoManager.js';

export function renderYouTubeDownloader() {
  const desc =
    'Download YouTube videos in HD, 4K, or extract MP3 and M4A audio free. ' +
    'Supports YouTube Shorts, live streams and more. No login required. Instant results.';

  updateSEO({
    title: 'YouTube Video Downloader — HD, 4K & MP3 Free | SmartSave.io',
    description: desc,
    ogTitle: 'YouTube Video Downloader — HD, 4K & MP3 Free | SmartSave.io',
    ogDescription: desc,
    canonicalPath: '/download/youtube',
    jsonLd: buildPlatformJsonLd({
      platformName: 'YouTube',
      description: desc,
      canonicalPath: '/download/youtube',
    }),
  });

  const prefilled = sessionStorage.getItem('downloadUrl') || '';
  sessionStorage.removeItem('downloadUrl');

  setTimeout(() => {
    const root = document.getElementById('yt-engine-root');
    if (root) mount(root, prefilled, { id: 'youtube' });

    // Animate feature cards in on load
    const cards = document.querySelectorAll('.yt-feature-card');
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('yt-feature-card--visible'), 100 + i * 80);
    });
  }, 0);

  return `
    <div class="yt-page">

      <!-- ═══ HERO ═══ -->
      <section class="yt-hero" aria-label="YouTube video downloader">
        <!-- Animated background layers -->
        <div class="yt-hero__bg" aria-hidden="true">
          <div class="yt-hero__orb yt-hero__orb--1"></div>
          <div class="yt-hero__orb yt-hero__orb--2"></div>
          <div class="yt-hero__orb yt-hero__orb--3"></div>
          <div class="yt-hero__grid"></div>
        </div>

        <div class="yt-hero__inner container">
          <!-- Platform badge -->
          <div class="yt-hero__badge" aria-label="YouTube">
            <div class="yt-hero__badge-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" width="32" height="32">
                <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <span>YouTube Downloader</span>
          </div>

          <!-- Headline -->
          <h1 class="yt-hero__title">
            Download YouTube Videos
            <span class="yt-hero__title-gradient">Free&nbsp;&amp;&nbsp;Instant</span>
          </h1>
          <p class="yt-hero__subtitle">
            Paste any YouTube link — we detect every available quality in seconds.<br>
            4K · 1080p · 720p · MP3 · M4A · Shorts · Live Streams. No sign-in needed.
          </p>

          <!-- Feature pills -->
          <div class="yt-hero__pills" role="list">
            <span class="yt-pill" role="listitem">⭐ Up to 4K</span>
            <span class="yt-pill" role="listitem">🎵 MP3 &amp; M4A Audio</span>
            <span class="yt-pill" role="listitem">📱 YouTube Shorts</span>
            <span class="yt-pill" role="listitem">🔴 Live Streams</span>
            <span class="yt-pill" role="listitem">🚫 No Watermark</span>
            <span class="yt-pill" role="listitem">🔒 100% Private</span>
          </div>
        </div>
      </section>

      <!-- ═══ ENGINE (URL input + results) ═══ -->
      <div id="yt-engine-root" class="yt-engine-mount"></div>

      <!-- ═══ FEATURE CARDS ═══ -->
      <section class="yt-features section" aria-label="YouTube downloader features">
        <div class="container">
          <div class="section-head section--center">
            <span class="section__label">Why SmartSave.io?</span>
            <h2 class="section__title">The Best YouTube Downloader</h2>
          </div>
          <div class="yt-features__grid">

            <div class="yt-feature-card" tabindex="0" aria-label="4K Video Quality">
              <div class="yt-feature-card__icon" style="background: linear-gradient(135deg, #FF0000 0%, #cc0000 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/>
                </svg>
              </div>
              <h3 class="yt-feature-card__title">4K Ultra HD</h3>
              <p class="yt-feature-card__desc">Download in the highest available resolution — up to 4K 2160p with automatic video+audio merging.</p>
            </div>

            <div class="yt-feature-card" tabindex="0" aria-label="MP3 Audio Extraction">
              <div class="yt-feature-card__icon" style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24" aria-hidden="true">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <h3 class="yt-feature-card__title">MP3 &amp; M4A Audio</h3>
              <p class="yt-feature-card__desc">Extract high-quality audio from any YouTube video. Perfect for music, podcasts, and lectures.</p>
            </div>

            <div class="yt-feature-card" tabindex="0" aria-label="YouTube Shorts Support">
              <div class="yt-feature-card__icon" style="background: linear-gradient(135deg, #ff6b35 0%, #f7c59f 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24" aria-hidden="true">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 class="yt-feature-card__title">YouTube Shorts</h3>
              <p class="yt-feature-card__desc">Full support for YouTube Shorts — paste the URL and download the vertical video instantly.</p>
            </div>

            <div class="yt-feature-card" tabindex="0" aria-label="Lightning Fast Speed">
              <div class="yt-feature-card__icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 class="yt-feature-card__title">Instant Results</h3>
              <p class="yt-feature-card__desc">Multi-client extraction with automatic fallback. Results in seconds, no waiting queues.</p>
            </div>

            <div class="yt-feature-card" tabindex="0" aria-label="No Login Required">
              <div class="yt-feature-card__icon" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h3 class="yt-feature-card__title">No Login Needed</h3>
              <p class="yt-feature-card__desc">100% free, no account, no signup. Paste your link and download — it's that simple.</p>
            </div>

            <div class="yt-feature-card" tabindex="0" aria-label="Privacy Protection">
              <div class="yt-feature-card__icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="24" height="24" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 class="yt-feature-card__title">Private &amp; Secure</h3>
              <p class="yt-feature-card__desc">We never store your URLs or files. Your downloads are processed in real-time and deleted after delivery.</p>
            </div>

          </div>
        </div>
      </section>

      <!-- ═══ HOW TO USE ═══ -->
      <section class="yt-steps section" aria-label="How to download YouTube videos">
        <div class="container">
          <div class="section-head section--center">
            <span class="section__label">📖 Step by Step</span>
            <h2 class="section__title">How To Download YouTube Videos</h2>
          </div>
          <div class="yt-steps__track">
            <div class="yt-step">
              <div class="yt-step__num" aria-hidden="true">1</div>
              <div class="yt-step__body">
                <h3 class="yt-step__title">Copy the YouTube Link</h3>
                <p class="yt-step__desc">
                  On YouTube, right-click a video and choose <strong>"Copy video URL"</strong>,
                  or copy the URL from the browser address bar. Works for videos, Shorts, and live streams.
                </p>
              </div>
            </div>
            <div class="yt-step__connector" aria-hidden="true"></div>
            <div class="yt-step">
              <div class="yt-step__num" aria-hidden="true">2</div>
              <div class="yt-step__body">
                <h3 class="yt-step__title">Paste &amp; Detect</h3>
                <p class="yt-step__desc">
                  Paste the link in the box above. Our engine instantly fetches all available
                  quality options — no need to press any extra buttons.
                </p>
              </div>
            </div>
            <div class="yt-step__connector" aria-hidden="true"></div>
            <div class="yt-step">
              <div class="yt-step__num" aria-hidden="true">3</div>
              <div class="yt-step__body">
                <h3 class="yt-step__title">Choose Quality &amp; Download</h3>
                <p class="yt-step__desc">
                  Pick your preferred format — 4K, 1080p, 720p for video, or MP3/M4A for audio-only.
                  Your download starts immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ FAQ ═══ -->
      <section class="yt-faq section" aria-label="YouTube downloader frequently asked questions">
        <div class="container container--narrow">
          <div class="section-head section--center">
            <span class="section__label">❓ FAQ</span>
            <h2 class="section__title">Common Questions</h2>
          </div>
          <div class="yt-faq__list">

            <details class="yt-faq__item">
              <summary class="yt-faq__question">Can I download YouTube Shorts?</summary>
              <div class="yt-faq__answer">
                <p>Yes! Paste any YouTube Shorts URL and we detect it automatically. Shorts download as MP4 in their native vertical format, no cropping or quality loss.</p>
              </div>
            </details>

            <details class="yt-faq__item">
              <summary class="yt-faq__question">How do I extract MP3 audio from a YouTube video?</summary>
              <div class="yt-faq__answer">
                <p>After pasting your link, the engine shows all available formats. Switch to the <strong>"Audio Only"</strong> tab to see MP3 and M4A audio options with bitrate details. Click Download on any audio format to get it.</p>
              </div>
            </details>

            <details class="yt-faq__item">
              <summary class="yt-faq__question">What's the highest quality available?</summary>
              <div class="yt-faq__answer">
                <p>We support up to <strong>4K (2160p)</strong> where the video was published in that resolution. The "⭐ Best Quality" option automatically selects and merges the highest video stream with the best audio track using ffmpeg.</p>
              </div>
            </details>

            <details class="yt-faq__item">
              <summary class="yt-faq__question">Why do I sometimes get a "format not available" error?</summary>
              <div class="yt-faq__answer">
                <p>YouTube sometimes restricts certain quality tiers by region or video age. Our system automatically falls back to the next best available format. If a format truly isn't available, try the <strong>⭐ Best Quality</strong> option which always works.</p>
              </div>
            </details>

            <details class="yt-faq__item">
              <summary class="yt-faq__question">Is this completely free?</summary>
              <div class="yt-faq__answer">
                <p>100% free. No account, no subscription, no download limits. SmartSave.io is supported by minimal, non-intrusive ads.</p>
              </div>
            </details>

            <details class="yt-faq__item">
              <summary class="yt-faq__question">Can I download an entire YouTube playlist?</summary>
              <div class="yt-faq__answer">
                <p>Currently SmartSave.io downloads individual videos for best reliability and speed. Paste each video URL separately. Playlist support is coming soon.</p>
              </div>
            </details>

          </div>
        </div>
      </section>

      <!-- ═══ PLATFORM LINKS ═══ -->
      <section class="yt-platforms section" aria-label="Other platform downloaders">
        <div class="container">
          <h2 class="section__title section--center">Download From Other Platforms</h2>
          <div class="yt-platforms__grid">
            <a href="#/download/instagram" class="yt-platform-card" aria-label="Instagram Downloader">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#E1306C" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
            <a href="#/download/tiktok" class="yt-platform-card" aria-label="TikTok Downloader">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#69C9D0" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z"/></svg>
              TikTok
            </a>
            <a href="#/download/twitter" class="yt-platform-card" aria-label="Twitter / X Downloader">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#fff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter / X
            </a>
            <a href="#/download/pinterest" class="yt-platform-card" aria-label="Pinterest Downloader">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#E60023" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>
              Pinterest
            </a>
            <a href="#/download/facebook" class="yt-platform-card" aria-label="Facebook Downloader">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          </div>
        </div>
      </section>

    </div>
  `;
}
