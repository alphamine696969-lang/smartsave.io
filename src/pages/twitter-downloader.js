// ═══════════════════════════════════════════════════════════
// SmartSave.io — Twitter / X Downloader Page
// ═══════════════════════════════════════════════════════════

import { mount } from '../engine/DownloaderEngine.js';
import { updateSEO, buildPlatformJsonLd } from '../engine/core/seoManager.js';

export function renderTwitterDownloader() {
  const desc = 'Download Twitter / X videos, GIFs and clips instantly. Free, no login required. Paste any tweet URL to save the video in HD quality.';

  updateSEO({
    title: 'Twitter / X Video Downloader — Download Tweets & GIFs Free | SmartSave.io',
    description: desc,
    ogTitle: 'Twitter / X Video Downloader — Save Tweet Videos & GIFs Free',
    ogDescription: desc,
    canonicalPath: '/download/twitter',
    jsonLd: buildPlatformJsonLd({ platformName: 'Twitter / X', description: desc, canonicalPath: '/download/twitter' }),
  });

  const url = sessionStorage.getItem('downloadUrl') || '';
  sessionStorage.removeItem('downloadUrl');

  setTimeout(() => {
    const root = document.getElementById('engine-root');
    if (root) mount(root, url, { id: 'twitter' });
  }, 0);

  return `
    <div class="platform-page platform-page--twitter">

      <!-- Platform Hero -->
      <section class="platform-hero" aria-label="Twitter X downloader hero">
        <div class="platform-hero__bg">
          <div class="platform-hero__blob platform-hero__blob--1"></div>
          <div class="platform-hero__blob platform-hero__blob--2"></div>
        </div>
        <div class="platform-hero__content">
          <div class="platform-hero__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="#1DA1F2" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <span class="platform-hero__label">Twitter / X Downloader</span>
          <h1 class="platform-hero__title">
            Download Twitter &amp; X Videos<br/>
            <span class="platform-hero__title-accent">GIFs, Clips &amp; More</span>
          </h1>
          <p class="platform-hero__desc">
            Paste any tweet URL to save the video or GIF directly to your device.<br/>
            No Twitter account needed — just paste, pick quality, and download.
          </p>
          <div class="platform-hero__tags" role="list">
            <span class="platform-hero__tag" role="listitem">✓ Tweet Videos</span>
            <span class="platform-hero__tag" role="listitem">✓ GIF Downloads</span>
            <span class="platform-hero__tag" role="listitem">✓ HD Quality</span>
            <span class="platform-hero__tag" role="listitem">✓ No Login</span>
            <span class="platform-hero__tag" role="listitem">✓ X (New Twitter) Support</span>
          </div>
        </div>
      </section>

      <!-- Engine Mount -->
      <div id="engine-root" class="platform-engine-root"></div>

      <!-- How To -->
      <section class="platform-howto section section--center">
        <div class="container">
          <span class="section__label">📖 How To Use</span>
          <h2 class="section__title">3 Simple Steps to Download Twitter Videos</h2>
          <div class="platform-steps">
            <div class="platform-step">
              <div class="platform-step__num">1</div>
              <h3 class="platform-step__title">Find Your Tweet</h3>
              <p class="platform-step__desc">Open Twitter / X, find the tweet with the video, tap the share icon and select "Copy link to Tweet".</p>
            </div>
            <div class="platform-step">
              <div class="platform-step__num">2</div>
              <h3 class="platform-step__title">Paste the URL</h3>
              <p class="platform-step__desc">Paste the tweet URL (x.com/... or twitter.com/...) in the field above and hit Download.</p>
            </div>
            <div class="platform-step">
              <div class="platform-step__num">3</div>
              <h3 class="platform-step__title">Save the File</h3>
              <p class="platform-step__desc">Choose your preferred quality (HD recommended) and the file downloads directly to your device.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="platform-faq section">
        <div class="container container--narrow">
          <span class="section__label">❓ FAQ</span>
          <h2 class="section__title">Twitter / X Downloader FAQ</h2>
          <div class="platform-faq__list">
            <details class="platform-faq__item">
              <summary class="platform-faq__q">Can I download Twitter GIFs?</summary>
              <p class="platform-faq__a">Yes! Twitter GIFs are technically MP4 files. We download them in full quality so they loop perfectly on your device.</p>
            </details>
            <details class="platform-faq__item">
              <summary class="platform-faq__q">Does it work with X (new Twitter)?</summary>
              <p class="platform-faq__a">Yes — both twitter.com and x.com URLs are fully supported. Just paste whichever format you have.</p>
            </details>
            <details class="platform-faq__item">
              <summary class="platform-faq__q">Do I need a Twitter account?</summary>
              <p class="platform-faq__a">No account needed on our site. Only publicly visible tweets with media can be downloaded.</p>
            </details>
            <details class="platform-faq__item">
              <summary class="platform-faq__q">What video qualities are available?</summary>
              <p class="platform-faq__a">Twitter videos are served in up to 1280×720 (720p). Where available, we'll show all quality options including lower resolutions.</p>
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
            <a href="#/download/tiktok" class="platform-others__card">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="#69C9D0" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z"/></svg>
              TikTok
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
