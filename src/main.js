// ═══════════════════════════════════════════════════════════
// SmartSave.io — Main Entry Point
// ═══════════════════════════════════════════════════════════

import './style.css';
import { Router } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderHome } from './pages/home.js';
import { renderDownload } from './pages/download.js';
import { renderAbout } from './pages/about.js';
import { renderContact } from './pages/contact.js';
import { renderPrivacy } from './pages/privacy.js';

// ── Initialize Global Components ──
renderNavbar();
renderFooter();

// ── Route Definitions ──
const routes = {
  '/': () => renderHome(),
  '/download': () => renderDownload(),
  '/about': () => renderAbout(),
  '/contact': () => renderContact(),
  '/privacy': () => renderPrivacy(),
};

// ── Start Router ──
const app = document.getElementById('app');
const router = new Router(routes, app);
