// ═══════════════════════════════════════════════════════════
// SmartSave.io — Contact Page
// ═══════════════════════════════════════════════════════════

export function renderContact() {
  setTimeout(() => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      const submitBtn = form.querySelector('.form-submit');
      if (!name || !email || !message) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Sending...';

      try {
        const response = await fetch('https://formsubmit.co/ajax/smartsave.io@hotmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email, message, _subject: `SmartSave.io — New message from ${name}`, _template: 'table' })
        });
        const result = await response.json();
        if (result.success) {
          form.innerHTML = '<div class="form-success"><div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><h3 class="form-success__title">Message Sent!</h3><p class="form-success__desc">Thank you for reaching out. We\'ll get back to you within 24 hours.</p></div>';
        } else { throw new Error('Failed'); }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        let errorEl = form.querySelector('.form-error');
        if (!errorEl) { errorEl = document.createElement('p'); errorEl.className = 'form-error'; errorEl.style.cssText = 'color:#EF4444;text-align:center;margin-top:var(--space-3);font-size:var(--font-sm);'; submitBtn.parentElement.appendChild(errorEl); }
        errorEl.textContent = 'Failed to send. Please try again or email us directly.';
      }
    });
  }, 100);

  return `
    <div class="container">
      <div class="contact-section">
        <div style="text-align:center;margin-bottom:var(--space-16);">
          <span class="section__label reveal">💬 Contact</span>
          <h1 class="section__title reveal reveal-delay-1" style="font-size:var(--font-5xl);">Get in Touch</h1>
          <p class="section__subtitle reveal reveal-delay-2" style="margin:0 auto;">Have a question, suggestion, or just want to say hello? We'd love to hear from you.</p>
        </div>
        <div class="contact-grid">
          <div class="contact-info reveal">
            <h2 class="contact-info__title">Let's <span class="text-gradient">Connect</span></h2>
            <p class="contact-info__desc">Whether you've found a bug, have a feature request, or need support — our team is here to help.</p>
            <div class="contact-info__items">
              <div class="contact-info__item">
                <div class="contact-info__item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                <div class="contact-info__item-text"><strong>Email</strong><span>smartsave.io@hotmail.com</span></div>
              </div>
              <div class="contact-info__item">
                <div class="contact-info__item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <div class="contact-info__item-text"><strong>Location</strong><span>India</span></div>
              </div>
              <div class="contact-info__item">
                <div class="contact-info__item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div class="contact-info__item-text"><strong>Response Time</strong><span>Within 24 hours</span></div>
              </div>
            </div>
          </div>
          <form id="contact-form" class="contact-form reveal reveal-delay-2">
            <div class="form-group"><input type="text" class="form-group__input" id="contact-name" placeholder=" " required /><label for="contact-name" class="form-group__label">Your Name</label></div>
            <div class="form-group"><input type="email" class="form-group__input" id="contact-email" placeholder=" " required /><label for="contact-email" class="form-group__label">Email Address</label></div>
            <div class="form-group form-group--textarea"><textarea class="form-group__textarea" id="contact-message" placeholder=" " rows="5" required></textarea><label for="contact-message" class="form-group__label">Your Message</label></div>
            <button type="submit" class="form-submit">Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          </form>
        </div>
      </div>
    </div>
  `;
}
