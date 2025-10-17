(function () {
  const html = document.documentElement;
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu');
  const themeToggle = document.getElementById('theme-toggle');
  const links = document.querySelectorAll('.nav-link');
  const yearEl = document.getElementById('year');
  const form = document.getElementById('contact-form');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    links.forEach((l) => l.addEventListener('click', () => {
      menu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const THEME_KEY = 'preferred-theme';
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark') html.classList.add('theme-dark');
  if (savedTheme === 'light') html.classList.remove('theme-dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = html.classList.toggle('theme-dark');
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
    const isDark = html.classList.contains('theme-dark');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  }

  function smoothScrollTo(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      smoothScrollTo(href.slice(1));
    });
  });

  const sectionIds = Array.from(links)
    .map((a) => a.getAttribute('href'))
    .filter((h) => h && h.startsWith('#'))
    .map((h) => h.slice(1));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
        window.history.replaceState(null, '', `#${id}`);
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0.01 });

  sections.forEach((s) => observer.observe(s));

  if (form) {
    if (window.location.protocol === 'file:') {
      const statusEl = document.getElementById('form-status');
      if (statusEl) statusEl.textContent = 'Open this page via a web server (e.g., http://localhost:8080) to submit the form.';
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    const nextInput = form.querySelector('input[name="_next"]');
    if (nextInput) {
      const url = new URL(window.location.href);
      const successUrl = `${url.origin}${url.pathname.replace(/index\.html?$/, '')}success.html`;
      nextInput.value = successUrl;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('form-status');
      const formData = new FormData(form);

      const fields = ['name', 'email', 'message'];
      let valid = true;
      fields.forEach((f) => {
        const input = form.querySelector(`[name="${f}"]`);
        const err = form.querySelector(`[data-error-for="${f}"]`);
        if (!input || !err) return;
        if (!String(formData.get(f) || '').trim()) {
          valid = false;
          err.textContent = 'This field is required.';
        } else if (f === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.get(f)))) {
          valid = false;
          err.textContent = 'Enter a valid email.';
        } else {
          err.textContent = '';
        }
      });

      if (!valid) return;

      if (statusEl) statusEl.textContent = 'Sending…';
      form.submit();
    });
  }
})();


