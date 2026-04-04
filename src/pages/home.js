// ═══════════════════════════════════════════════════════════
// SmartSave.io — Homepage
// Shows each platform as a dedicated, clickable card.
// ═══════════════════════════════════════════════════════════

import { navigateTo } from '../router.js';

const PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    route: '/download/youtube',
    color: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    glow: 'rgba(255,0,0,0.25)',
    tags: ['HD & 4K', 'MP3 Audio', 'Shorts', 'Playlists'],
    desc: 'Download any YouTube video in up to 4K, extract MP3 audio, save Shorts and full playlists — no account needed.',
    icon: `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    route: '/download/instagram',
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    glow: 'rgba(225,48,108,0.25)',
    tags: ['Reels', 'Stories', 'Posts', 'IGTV'],
    desc: 'Save Instagram Reels, Stories, photos and IGTV videos in HD — no login, no watermark.',
    icon: `<svg viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    route: '/download/tiktok',
    color: '#69C9D0',
    gradient: 'linear-gradient(135deg, #010101 0%, #EE1D52 50%, #69C9D0 100%)',
    glow: 'rgba(105,201,208,0.25)',
    tags: ['No Watermark', 'HD MP4', 'Short Links', 'Free'],
    desc: 'Download TikTok videos without the watermark in full HD. Supports vm.tiktok.com short links.',
    icon: `<svg viewBox="0 0 24 24"><path fill="#EE1D52" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z"/><path fill="#69C9D0" d="M19.59 6.69A4.83 4.83 0 0115.82 2.44V2h1.64v.44a4.83 4.83 0 003.77 4.25z" opacity=".6"/></svg>`,
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    route: '/download/twitter',
    color: '#1DA1F2',
    gradient: 'linear-gradient(135deg, #1DA1F2 0%, #0d7abf 100%)',
    glow: 'rgba(29,161,242,0.25)',
    tags: ['Tweet Videos', 'GIFs', 'Spaces', 'HD'],
    desc: 'Download Twitter / X videos and animated GIFs instantly. Paste any tweet URL — done in seconds.',
    icon: `<svg viewBox="0 0 24 24" fill="#1DA1F2"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    route: '/download/pinterest',
    color: '#E60023',
    gradient: 'linear-gradient(135deg, #E60023 0%, #ad081b 100%)',
    glow: 'rgba(230,0,35,0.25)',
    tags: ['Videos', 'GIFs', 'HD Photos', 'pin.it Links'],
    desc: 'Save Pinterest pins — videos, GIFs, or images — directly to your device in high resolution.',
    icon: `<svg viewBox="0 0 24 24" fill="#E60023"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    route: '/download/facebook',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0d5dbf 100%)',
    glow: 'rgba(24,119,242,0.25)',
    tags: ['Videos', 'Reels', 'Watch', 'fb.watch'],
    desc: 'Download Facebook videos, Reels and Watch content in HD. Supports fb.watch short links.',
    icon: `<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
];

export function renderHome() {
  setTimeout(() => {
    // Hero form submit — smart routing
    const form = document.getElementById('hero-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('hero-url-input');
        const url = (input?.value || '').trim();
        if (!url) {
          input?.focus();
          input?.classList.add('hero__input--error');
          setTimeout(() => input?.classList.remove('hero__input--error'), 1200);
          return;
        }
        sessionStorage.setItem('downloadUrl', url);
        navigateTo('/download');
      });
    }

    // Platform card click + keyboard navigation
    document.querySelectorAll('[data-platform-route]').forEach(card => {
      card.addEventListener('click', () => {
        navigateTo(card.dataset.platformRoute);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateTo(card.dataset.platformRoute);
        }
      });
    });
  }, 60);

  const platformCardsHtml = PLATFORMS.map(p => `
    <article
      class="platform-hub-card"
      data-platform-route="${p.route}"
      role="button"
      tabindex="0"
      aria-label="Open ${p.name} downloader"
      style="--card-color:${p.color}; --card-gradient:${p.gradient}; --card-glow:${p.glow};"
    >
      <div class="platform-hub-card__glow"></div>
      <div class="platform-hub-card__header">
        <div class="platform-hub-card__icon">${p.icon}</div>
        <div class="platform-hub-card__name-wrap">
          <h3 class="platform-hub-card__name">${p.name}</h3>
          <span class="platform-hub-card__cta">Download Free →</span>
        </div>
      </div>
      <p class="platform-hub-card__desc">${p.desc}</p>
      <div class="platform-hub-card__tags">
        ${p.tags.map(t => `<span class="platform-hub-card__tag">${t}</span>`).join('')}
      </div>
    </article>
  `).join('');

  return `
    <!-- ═══ HERO ═══ -->
    <section class="hero">
      <div class="hero__bg">
        <div class="hero__shape hero__shape--1"></div>
        <div class="hero__shape hero__shape--2"></div>
        <div class="hero__shape hero__shape--3"></div>
      </div>
      <div class="hero__content">
        <div class="hero__badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Free &middot; No Login Required &middot; 6 Platforms
        </div>
        <h1 class="hero__title">
          <span class="hero__title-gradient">Download Anything.</span><br />
          Instantly.
        </h1>
        <p class="hero__desc">
          Paste any link from YouTube, Instagram, TikTok, Twitter, Pinterest or Facebook.<br/>
          We detect the platform automatically and deliver your file in seconds.
        </p>
        <form id="hero-form" class="hero__input-group" novalidate>
          <input
            type="url"
            id="hero-url-input"
            class="hero__input"
            placeholder="Paste your link here — https://..."
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit" class="hero__btn hero__btn--pulse">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m0 0l-6-6m6 6l6-6"/></svg>
            Download
          </button>
        </form>
        <div class="hero__trust">
          <span class="hero__trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            100% Free
          </span>
          <span class="hero__trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Private &amp; Secure
          </span>
          <span class="hero__trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Ultra Fast
          </span>
        </div>
      </div>
    </section>

    <!-- ═══ PLATFORM HUB ═══ -->
    <section class="section platform-hub" id="platforms">
      <div class="container">
        <span class="section__label reveal">🌐 Supported Platforms</span>
        <h2 class="section__title reveal reveal-delay-1">Choose Your Platform</h2>
        <p class="section__subtitle reveal reveal-delay-2">
          Each platform has its own dedicated downloader — click any card to get started.
        </p>
        <div class="platform-hub__grid reveal reveal-delay-1">
          ${platformCardsHtml}
        </div>
      </div>
    </section>

    <!-- ═══ FEATURES ═══ -->
    <section class="section section--center">
      <div class="container">
        <span class="section__label reveal">✦ Features</span>
        <h2 class="section__title reveal reveal-delay-1">Why Choose SmartSave.io?</h2>
        <p class="section__subtitle reveal reveal-delay-2">Built for speed, privacy, and simplicity — everything you need, nothing you don't.</p>
        <div class="features-grid">
          <div class="feature-card reveal reveal-delay-1">
            <div class="feature-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h3 class="feature-card__title">Lightning Fast</h3>
            <p class="feature-card__desc">Downloads begin instantly. Our optimized pipeline delivers files in seconds, not minutes.</p>
          </div>
          <div class="feature-card reveal reveal-delay-2">
            <div class="feature-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 class="feature-card__title">Secure Downloads</h3>
            <p class="feature-card__desc">End-to-end privacy, no data stored. Your files are processed and deleted immediately.</p>
          </div>
          <div class="feature-card reveal reveal-delay-3">
            <div class="feature-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <h3 class="feature-card__title">No Login Needed</h3>
            <p class="feature-card__desc">Start downloading right away — no account, no signup, no personal data required.</p>
          </div>
          <div class="feature-card reveal reveal-delay-4">
            <div class="feature-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <h3 class="feature-card__title">HD Quality</h3>
            <p class="feature-card__desc">Download in the highest available quality — 4K, 1080p, 720p, or choose what suits you best.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ HOW IT WORKS ═══ -->
    <section class="section section--center">
      <div class="container">
        <span class="section__label reveal">🔄 Process</span>
        <h2 class="section__title reveal reveal-delay-1">How It Works</h2>
        <p class="section__subtitle reveal reveal-delay-2">Three simple steps to download any media. No complexity, no waiting.</p>
        <div class="timeline reveal">
          <div class="timeline-step">
            <div class="timeline-step__number"><span>1</span></div>
            <h3 class="timeline-step__title">Pick a Platform</h3>
            <p class="timeline-step__desc">Select your platform above, or just paste a link directly — we auto-detect the source.</p>
          </div>
          <div class="timeline-step">
            <div class="timeline-step__number"><span>2</span></div>
            <h3 class="timeline-step__title">Paste the URL</h3>
            <p class="timeline-step__desc">Copy the link from your app or browser and paste it into the input field. Done in one click.</p>
          </div>
          <div class="timeline-step">
            <div class="timeline-step__number"><span>3</span></div>
            <h3 class="timeline-step__title">Download</h3>
            <p class="timeline-step__desc">Choose your preferred quality and format, then download instantly to your device.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="section">
      <div class="container">
        <div class="cta-banner reveal">
          <div class="cta-banner__content">
            <h2 class="cta-banner__title">Ready to Download?</h2>
            <p class="cta-banner__desc">Join millions of users who trust SmartSave.io for fast, free, and secure media downloads.</p>
            <a href="#/" class="cta-banner__btn" onclick="document.getElementById('hero-url-input')?.focus()">
              Start Now — It's Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}
