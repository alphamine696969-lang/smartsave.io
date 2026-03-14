// ═══════════════════════════════════════════════════════════
// SmartSave.io — SPA Router
// ═══════════════════════════════════════════════════════════

export class Router {
  constructor(routes, appElement) {
    this.routes = routes;
    this.app = appElement;
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.navigate());
    window.addEventListener('load', () => this.navigate());
  }

  getPath() {
    return window.location.hash.slice(1) || '/';
  }

  async navigate() {
    const path = this.getPath();
    const route = this.routes[path] || this.routes['/404'] || this.routes['/'];

    // Show progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.classList.remove('active');
      void progressBar.offsetWidth;
      progressBar.classList.add('active');
    }

    // Fade out current page
    if (this.currentRoute) {
      this.app.style.opacity = '0';
      this.app.style.transform = 'translateY(10px)';
      await this.wait(200);
    }

    // Render new page
    const html = await route();
    this.app.innerHTML = `<div class="page">${html}</div>`;
    this.currentRoute = path;

    // Fade in
    this.app.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    this.app.style.opacity = '1';
    this.app.style.transform = 'translateY(0)';

    // Update active nav link
    document.querySelectorAll('.navbar__links a, .navbar__mobile-menu a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === `#${path}`);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Initialize scroll reveals
    this.initScrollReveal();

    // Remove progress bar
    setTimeout(() => {
      if (progressBar) {
        progressBar.classList.remove('active');
        progressBar.style.width = '0%';
      }
    }, 1000);

    // Dispatch event for page-specific JS
    window.dispatchEvent(new CustomEvent('page-loaded', { detail: { path } }));
  }

  initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Navigate programmatically
export function navigateTo(path) {
  window.location.hash = path;
}
