// ═══════════════════════════════════════════════════════════
// SmartSave.io — About Page
// ═══════════════════════════════════════════════════════════

export function renderAbout() {
  return `
    <div class="container">
      <!-- Hero -->
      <div class="about-hero">
        <span class="section__label reveal">About Us</span>
        <h1 class="about-hero__title reveal reveal-delay-1">
          Built for the <span class="text-gradient">Modern Internet</span>
        </h1>
        <p class="about-hero__subtitle reveal reveal-delay-2">
          SmartSave.io was born from a simple frustration: downloading media from the internet shouldn't be complicated, slow, or unsafe.
        </p>
      </div>

      <!-- Mission -->
      <div class="about-section">
        <div class="about-section__content">
          <div class="about-section__text reveal">
            <span class="section__label">🎯 Our Mission</span>
            <h3>Making Downloads <span class="text-gradient">Effortless</span></h3>
            <p>
              We believe that content you've shared or created should be easily accessible. Our mission is to provide the fastest, safest, and most reliable way to download media from anywhere on the internet — completely free.
            </p>
            <p style="margin-top: var(--space-4);">
              With millions of downloads processed every day, SmartSave.io is trusted by creators, researchers, archivists, and everyday users around the globe.
            </p>
          </div>
          <div class="about-section__visual reveal reveal-delay-2">
            <svg class="about-section__visual-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Privacy -->
      <div class="about-section">
        <div class="about-section__content" style="direction: rtl;">
          <div class="about-section__text reveal" style="direction: ltr;">
            <span class="section__label">🔒 Privacy First</span>
            <h3>Your Privacy is <span class="text-gradient">Non-Negotiable</span></h3>
            <p>
              We don't track, store, or share your data. Every download session is completely ephemeral — files are processed in memory and deleted immediately after delivery.
            </p>
            <p style="margin-top: var(--space-4);">
              No accounts, no cookies for tracking, no personal data collection. We're built on the principle that downloading media should be as private as it is fast.
            </p>
          </div>
          <div class="about-section__visual reveal reveal-delay-2" style="direction: ltr;">
            <svg class="about-section__visual-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Technology -->
      <div class="about-section" style="border-bottom: 1px solid rgba(99, 102, 241, 0.08); padding-bottom: var(--space-24);">
        <div class="about-section__content">
          <div class="about-section__text reveal">
            <span class="section__label">⚡ Technology</span>
            <h3>Powered by <span class="text-gradient">Speed</span></h3>
            <p>
              SmartSave.io runs on a globally distributed edge network, ensuring lightning-fast processing no matter where you are. Our intelligent pipeline automatically detects the platform, retrieves available formats, and serves optimal download options.
            </p>
            <p style="margin-top: var(--space-4);">
              Built with modern web technologies and optimised for performance — every interaction feels instant, every page loads in under 200ms.
            </p>
          </div>
          <div class="about-section__visual reveal reveal-delay-2">
            <svg class="about-section__visual-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `;
}
