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

// ── Platform-specific downloader pages ──
import { renderYouTubeDownloader }   from './pages/youtube-downloader.js';
import { renderInstagramDownloader } from './pages/instagram-downloader.js';
import { renderTwitterDownloader }   from './pages/twitter-downloader.js';
import { renderPinterestDownloader } from './pages/pinterest-downloader.js';
import { renderTikTokDownloader }    from './pages/tiktok-downloader.js';
import { renderFacebookDownloader }  from './pages/facebook-downloader.js';

// ── Initialize Global Components ──
renderNavbar();
renderFooter();

// ── Route Definitions ──
const routes = {
  // Generic pages
  '/':        () => renderHome(),
  '/download': () => renderDownload(),
  '/about':   () => renderAbout(),
  '/contact': () => renderContact(),
  '/privacy': () => renderPrivacy(),

  // Platform-specific downloader pages (own SEO + theme)
  '/download/youtube':   () => renderYouTubeDownloader(),
  '/download/instagram': () => renderInstagramDownloader(),
  '/download/twitter':   () => renderTwitterDownloader(),
  '/download/pinterest': () => renderPinterestDownloader(),
  '/download/tiktok':    () => renderTikTokDownloader(),
  '/download/facebook':  () => renderFacebookDownloader(),

  // 404 fallback
  '/404': () => renderHome(),
};

// ── Start Router ──
const app = document.getElementById('app');
const router = new Router(routes, app);
