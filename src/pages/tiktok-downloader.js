// ═══════════════════════════════════════════════════════════
// SmartSave.io — TikTok Downloader Page
// ═══════════════════════════════════════════════════════════

import { mount } from '../engine/DownloaderEngine.js';
import { updateSEO, buildPlatformJsonLd } from '../engine/core/seoManager.js';

export function renderTikTokDownloader() {
  const desc = 'Download TikTok videos without watermark for free. Paste any TikTok URL or vm.tiktok.com short link. Fast, HD quality, no login required.';

  updateSEO({
    title: 'TikTok Video Downloader — No Watermark, Free | SmartSave.io',
    description: desc,
    ogTitle: 'TikTok Downloader — Download TikTok Videos No Watermark Free',
    ogDescription: desc,
    canonicalPath: '/download/tiktok',
    jsonLd: buildPlatformJsonLd({ platformName: 'TikTok', description: desc, canonicalPath: '/download/tiktok' }),
  });

  const url = sessionStorage.getItem('downloadUrl') || '';
  sessionStorage.removeItem('downloadUrl');

  setTimeout(() => {
    const root = document.getElementById('engine-root');
    if (root) mount(root, url, { id: 'tiktok' });
  }, 0);

  return `
    <div class="platform-page platform-page--tiktok">
      <section class="platform-hero" aria-label="TikTok downloader hero">
        <div class="platform-hero__bg">
          <div class="platform-hero__blob platform-hero__blob--1"></div>
          <div class="platform-hero__blob platform-hero__blob--2"></div>
        </div>
        <div class="platform-hero__content">
          <div class="platform-hero__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="#010101" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z"/>
              <path fill="#EE1D52" d="M19.59 6.69A4.83 4.83 0 0115.82 2.44V2h-1.64v.44a4.83 4.83 0 003.77 4.25 4.85 4.85 0 001 .78V6.69z" opacity=".85"/>
              <path fill="#69C9D0" d="M9.49 16.22A2.89 2.89 0 0112.38 13.33V12a6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 002.89 5.35 2.89 2.89 0 01-.44-1.58 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.46a6.35 6.35 0 00-.79-.05" opacity=".85"/>
            </svg>
          </div>
          <span class="platform-hero__label">TikTok Downloader</span>
          <h1 class="platform-hero__title">
            Download TikTok Videos<br/>
            <span class="platform-hero__title-accent">No Watermark, Free</span>
          </h1>
          <p class="platform-hero__desc">
            Paste any TikTok video URL and download in full HD — no watermark, no account needed.<br/>
            Supports regular TikTok links and vm.tiktok.com short links.
          </p>
          <div class="platform-hero__tags" role="list">
            <span class="platform-hero__tag" role="listitem">✓ No Watermark</span>
            <span class="platform-hero__tag" role="listitem">✓ HD Quality</span>
            <span class="platform-hero__tag" role="listitem">✓ vm.tiktok.com Links</span>
            <span class="platform-hero__tag" role="listitem">✓ No Account Needed</span>
            <span class="platform-hero__tag" role="listitem">✓ MP4 Format</span>
          </div>
        </div>
      </section>

      <div id="engine-root" class="platform-engine-root"></div>

      <section class="platform-howto section section--center">
        <div class="container">
          <span class="section__label">📖 How To Use</span>
          <h2 class="section__title">Download TikTok Videos in 3 Steps</h2>
          <div class="platform-steps">
            <div class="platform-step">
              <div class="platform-step__num">1</div>
              <h3 class="platform-step__title">Copy TikTok Link</h3>
              <p class="platform-step__desc">Open TikTok, tap Share on the video then tap "Copy Link". On desktop, copy the URL from your browser.</p>
            </div>
            <div class="platform-step">
              <div class="platform-step__num">2</div>
              <h3 class="platform-step__title">Paste the URL</h3>
              <p class="platform-step__desc">Paste the TikTok link above. We detect and process the video immediately.</p>
            </div>
            <div class="platform-step">
              <div class="platform-step__num">3</div>
              <h3 class="platform-step__title">Download Watermark-Free</h3>
              <p class="platform-step__desc">Get the clean MP4 without the TikTok watermark overlay — perfect for reposting or personal use.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="platform-faq section">
        <div class="container container--narrow">
          <span class="section__label">❓ FAQ</span>
          <h2 class="section__title">TikTok Downloader FAQ</h2>
          <div class="platform-faq__list">
            <details class="platform-faq__item">
              <summary class="platform-faq__q">Is the downloaded TikTok video watermark-free?</summary>
              <p class="platform-faq__a">Yes — we extract the original video stream without the TikTok watermark overlay.</p>
            </details>
            <details class="platform-faq__item">
              <summary class="platform-faq__q">Do I need a TikTok account?</summary>
              <p class="platform-faq__a">No account needed. Only publicly visible TikTok videos can be downloaded.</p>
            </details>
            <details class="platform-faq__item">
              <summary class="platform-faq__q">Does it work with short vm.tiktok.com links?</summary>
              <p class="platform-faq__a">Yes — both full tiktok.com URLs and vm.tiktok.com short links are fully supported.</p>
            </details>
            <details class="platform-faq__item">
              <summary class="platform-faq__q">What format do TikTok videos download in?</summary>
              <p class="platform-faq__a">TikTok videos download as MP4 files, compatible with all devices and video editors.</p>
            </details>
          </div>
        </div>
      </section>

      <!-- Other platforms -->
      <section class="platform-others section">
        <div class="container">
          <h2 class="section__title section--center">Download From Other Platforms</h2>
          <div class="platform-others__grid">
            <a href="#/download/youtube" class="platform-others__card">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </a>
            <a href="#/download/instagram" class="platform-others__card">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="#E1306C" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
            <a href="#/download/twitter" class="platform-others__card">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="#1DA1F2" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter / X
            </a>
            <a href="#/download/pinterest" class="platform-others__card">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="#E60023" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>
              Pinterest
            </a>
            <a href="#/download/facebook" class="platform-others__card">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          </div>
        </div>
      </section>

    </div>
  `;
}
