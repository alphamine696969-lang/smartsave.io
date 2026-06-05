// ═══════════════════════════════════════════════════════════
// SmartSave.io — SEO Manager
// Centralized dynamic meta tag injection.
// Replaces per-page updateMeta() with a single reusable utility.
// ═══════════════════════════════════════════════════════════

/**
 * Update all SEO-relevant meta tags for the current page.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   ogTitle?: string,
 *   ogDescription?: string,
 *   canonicalPath?: string,
 *   jsonLd?: object
 * }} config
 */
export function updateSEO({
  title,
  description,
  ogTitle,
  ogDescription,
  canonicalPath,
  jsonLd,
}) {
  // ── Document title ──
  document.title = title;

  // ── Standard meta ──
  setMeta('name', 'description', description);

  // ── Open Graph ──
  setMeta('property', 'og:title', ogTitle || title);
  setMeta('property', 'og:description', ogDescription || description);

  // ── Twitter Card ──
  setMeta('name', 'twitter:title', ogTitle || title);
  setMeta('name', 'twitter:description', ogDescription || description);

  // ── Canonical URL + og:url + twitter:url ──
  if (canonicalPath) {
    const fullUrl = `https://smartsave.io${canonicalPath}`;

    // Canonical link tag
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = fullUrl;

    // og:url — tells social crawlers the true page URL
    setMeta('property', 'og:url', fullUrl);

    // twitter:url
    setMeta('name', 'twitter:url', fullUrl);
  }

  // ── JSON-LD Structured Data ──
  if (jsonLd) {
    // Remove previous dynamic LD
    const prev = document.getElementById('seo-jsonld');
    if (prev) prev.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'seo-jsonld';
    script.textContent = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
    document.head.appendChild(script);
  }
}

// ── Helper: set or create a meta tag ──
function setMeta(attr, value, content) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Build a WebApplication JSON-LD object for a platform page.
 *
 * @param {{ platformName: string, description: string, canonicalPath?: string }} opts
 * @returns {object}
 */
export function buildPlatformJsonLd({ platformName, description, canonicalPath }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `SmartSave.io ${platformName} Downloader`,
    url: canonicalPath ? `https://smartsave.io${canonicalPath}` : 'https://smartsave.io',
    description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}
