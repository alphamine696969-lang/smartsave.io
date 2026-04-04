// ═══════════════════════════════════════════════════════════
// SmartSave.io — Navbar Component
// Includes "Downloaders" dropdown with all 6 platform pages.
// ═══════════════════════════════════════════════════════════

const PLATFORMS_NAV = [
  {
    name: 'YouTube',
    href: '#/download/youtube',
    color: '#FF0000',
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
  {
    name: 'Instagram',
    href: '#/download/instagram',
    color: '#E1306C',
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#E1306C" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  },
  {
    name: 'TikTok',
    href: '#/download/tiktok',
    color: '#69C9D0',
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#EE1D52" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.47a4.85 4.85 0 01-1-.78z"/></svg>`,
  },
  {
    name: 'Twitter / X',
    href: '#/download/twitter',
    color: '#1DA1F2',
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#1DA1F2" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  {
    name: 'Pinterest',
    href: '#/download/pinterest',
    color: '#E60023',
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#E60023" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>`,
  },
  {
    name: 'Facebook',
    href: '#/download/facebook',
    color: '#1877F2',
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
];

const dropdownItemsHtml = PLATFORMS_NAV.map(p => `
  <a href="${p.href}" class="navbar__dropdown-item" style="--item-color:${p.color}">
    <span class="navbar__dropdown-item-icon">${p.icon}</span>
    <span>${p.name}</span>
  </a>
`).join('');

const mobileDownloaderLinksHtml = PLATFORMS_NAV.map(p => `
  <a href="${p.href}" class="navbar__mobile-sub-link" style="--item-color:${p.color}">
    <span class="navbar__dropdown-item-icon">${p.icon}</span>
    ${p.name}
  </a>
`).join('');

export function renderNavbar() {
  const navbar = document.getElementById('navbar');
  navbar.innerHTML = `
    <div class="navbar">
      <a href="#/" class="navbar__logo">
        <div class="navbar__logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v10m0 0l-4-4m4 4l4-4M6 17h12"/>
          </svg>
        </div>
        <span>SmartSave.io</span>
      </a>

      <div class="navbar__links">
        <a href="#/">Home</a>

        <!-- Downloaders Dropdown -->
        <div class="navbar__dropdown" id="downloaders-dropdown">
          <button class="navbar__dropdown-trigger" id="dropdown-btn" aria-haspopup="true" aria-expanded="false">
            Downloaders
            <svg class="navbar__dropdown-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div class="navbar__dropdown-menu" id="dropdown-menu" role="menu">
            <div class="navbar__dropdown-header">Choose Platform</div>
            ${dropdownItemsHtml}
          </div>
        </div>

        <a href="#/about">About</a>
        <a href="#/contact">Contact</a>
      </div>

      <a href="#/" class="navbar__cta" id="navbar-cta">Start Downloading</a>

      <button class="navbar__hamburger" id="hamburger-btn" aria-label="Open menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div class="navbar__mobile-menu" id="mobile-menu" role="navigation" aria-label="Mobile navigation">
      <a href="#/">Home</a>
      <div class="navbar__mobile-section">
        <span class="navbar__mobile-section-label">Downloaders</span>
        <div class="navbar__mobile-downloaders">
          ${mobileDownloaderLinksHtml}
        </div>
      </div>
      <a href="#/about">About</a>
      <a href="#/contact">Contact</a>
      <a href="#/privacy">Privacy</a>
    </div>
  `;

  // ── Hamburger menu toggle ──
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Dropdown toggle ──
  const dropdownBtn = document.getElementById('dropdown-btn');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const dropdown = document.getElementById('downloaders-dropdown');

  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    dropdownBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close dropdown when a platform item is clicked
  dropdownMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      dropdown.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Scroll effect ──
  window.addEventListener('scroll', () => {
    const nav = navbar.querySelector('.navbar');
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}
