// ═══════════════════════════════════════════════════════════
// SmartSave.io — Navbar Component
// ═══════════════════════════════════════════════════════════

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
        <a href="#/about">About</a>
        <a href="#/contact">Contact</a>
        <a href="#/privacy">Privacy</a>
      </div>
      <a href="#/" class="navbar__cta">Start Downloading</a>
      <button class="navbar__hamburger" id="hamburger-btn" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="navbar__mobile-menu" id="mobile-menu">
      <a href="#/">Home</a>
      <a href="#/about">About</a>
      <a href="#/contact">Contact</a>
      <a href="#/privacy">Privacy</a>
    </div>
  `;

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // Scroll effect
  window.addEventListener('scroll', () => {
    const nav = navbar.querySelector('.navbar');
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}
