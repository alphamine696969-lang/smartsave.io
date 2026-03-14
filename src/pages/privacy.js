// ═══════════════════════════════════════════════════════════
// SmartSave.io — Privacy Policy Page
// ═══════════════════════════════════════════════════════════

export function renderPrivacy() {
  setTimeout(() => {
    const links = document.querySelectorAll('.privacy-sidebar__link');
    const sections = document.querySelectorAll('.privacy-content h2[id]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        }
      });
    }, { rootMargin: '-80px 0px -80% 0px' });

    sections.forEach(section => observer.observe(section));
  }, 200);

  return `
    <div class="container">
      <div class="privacy-layout">
        <nav class="privacy-sidebar reveal">
          <a href="#overview" class="privacy-sidebar__link active">Overview</a>
          <a href="#data-collection" class="privacy-sidebar__link">Data Collection</a>
          <a href="#data-usage" class="privacy-sidebar__link">How We Use Data</a>
          <a href="#data-storage" class="privacy-sidebar__link">Data Storage</a>
          <a href="#third-party" class="privacy-sidebar__link">Third Parties</a>
          <a href="#cookies" class="privacy-sidebar__link">Cookies</a>
          <a href="#security" class="privacy-sidebar__link">Security</a>
          <a href="#your-rights" class="privacy-sidebar__link">Your Rights</a>
          <a href="#changes" class="privacy-sidebar__link">Policy Changes</a>
          <a href="#contact-privacy" class="privacy-sidebar__link">Contact Us</a>
        </nav>
        <div class="privacy-content reveal reveal-delay-1">
          <h1>Privacy Policy</h1>
          <p class="privacy-updated">Last updated: March 3, 2026</p>
          <h2 id="overview">Overview</h2>
          <p>At SmartSave.io, your privacy is our top priority. This Privacy Policy outlines how we handle information when you use our media downloading service. We are committed to transparency and to protecting your personal data.</p>
          <p>SmartSave.io is designed to be a privacy-first platform. We do not require accounts, do not track users across sessions, and do not store downloaded content permanently.</p>
          <h2 id="data-collection">Data Collection</h2>
          <p>We collect minimal data necessary to provide our service:</p>
          <ul>
            <li>URLs submitted for processing (temporarily, during the active session only)</li>
            <li>Anonymous, aggregated usage statistics (page views, download counts)</li>
            <li>Technical information (browser type, device type) for optimisation purposes</li>
          </ul>
          <p>We do <strong>not</strong> collect:</p>
          <ul>
            <li>Personal identification information (names, emails) unless voluntarily provided via the contact form</li>
            <li>IP addresses for tracking purposes</li>
            <li>Browsing history or cross-site tracking data</li>
          </ul>
          <h2 id="data-usage">How We Use Data</h2>
          <p>The limited data we collect is used solely for the following purposes:</p>
          <ul>
            <li>Processing your download requests in real-time</li>
            <li>Improving service performance and reliability</li>
            <li>Understanding general usage patterns to enhance the user experience</li>
            <li>Preventing abuse and ensuring fair usage of our platform</li>
          </ul>
          <h2 id="data-storage">Data Storage</h2>
          <p>SmartSave.io operates on a zero-retention model for user content. URLs and media files processed through our service are handled entirely in-memory and are <strong>never stored permanently</strong>. Temporary data is automatically purged at the end of each session.</p>
          <p>Aggregated analytics data (which cannot be used to identify individual users) may be retained for up to 90 days for service improvement purposes.</p>
          <h2 id="third-party">Third Parties</h2>
          <p>We do not sell, trade, or otherwise transfer your data to third parties. We may use privacy-respecting analytics tools to understand aggregate usage patterns.</p>
          <h2 id="cookies">Cookies</h2>
          <p>SmartSave.io uses only essential cookies required for the proper functioning of the website. We do not use cookies for tracking, advertising, or profiling.</p>
          <h2 id="security">Security</h2>
          <p>We implement industry-standard security measures to protect your data during transmission and processing. All connections to SmartSave.io are encrypted via TLS/SSL.</p>
          <h2 id="your-rights">Your Rights</h2>
          <p>You have the following rights regarding your data:</p>
          <ul>
            <li>Right to know what data we collect (outlined in this policy)</li>
            <li>Right to request deletion of any data associated with your contact form submission</li>
            <li>Right to opt out of analytics data collection</li>
            <li>Right to lodge a complaint with a supervisory authority</li>
          </ul>
          <h2 id="changes">Policy Changes</h2>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
          <h2 id="contact-privacy">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:smartsave.io@hotmail.com" style="color:var(--accent-indigo);text-decoration:underline;">smartsave.io@hotmail.com</a> or visit our <a href="#/contact" style="color:var(--accent-indigo);text-decoration:underline;">Contact page</a>.</p>
        </div>
      </div>
    </div>
  `;
}
