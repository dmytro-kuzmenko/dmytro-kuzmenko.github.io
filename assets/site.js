/* Shared behaviour for all pages. Every block no-ops if its elements are absent. */

/* Theme toggle: light <-> dark.
   No stored preference means "follow the OS", which the CSS handles on its own;
   the first click resolves that into an explicit choice. */
(function() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    const t = localStorage.getItem('theme');
    return (t === 'light' || t === 'dark') ? t : null;
  }

  function effective() {
    return stored() || (media.matches ? 'dark' : 'light');
  }

  function paintButton() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const theme = effective();
    const next = theme === 'dark' ? 'light' : 'dark';
    btn.querySelector('i').className = 'fa-solid ' + (theme === 'dark' ? 'fa-moon' : 'fa-sun');
    btn.title = 'Switch to ' + next + ' theme';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  document.addEventListener('DOMContentLoaded', function() {
    paintButton();

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function() {
        const next = effective() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        paintButton();
      });
    }

    // While the visitor has made no explicit choice, follow the OS live.
    media.addEventListener('change', function() {
      if (!stored()) paintButton();
    });
  });
})();

/* Mobile nav */
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function() {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
});

/* Active nav on scroll (only meaningful on pages with in-page section links).
   Active = the lowest row of sections whose top has passed a line 20% down the
   viewport. Sections side by side share a top, so they light up together.
   At the page bottom the last visible row wins, even if it never reached the line. */
document.addEventListener('DOMContentLoaded', function() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = document.querySelectorAll('.nav-right a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  function update() {
    const vh = window.innerHeight;
    const line = vh * 0.2;
    const atBottom = vh + window.scrollY >= document.documentElement.scrollHeight - 2;
    const tops = sections.map(function(s) { return s.getBoundingClientRect().top; });

    let rowTop = -Infinity;
    tops.forEach(function(top) {
      if ((top <= line || (atBottom && top < vh)) && top > rowTop) rowTop = top;
    });

    const active = new Set();
    tops.forEach(function(top, i) {
      if (Math.abs(top - rowTop) < 2) active.add('#' + sections[i].id);
    });
    navLinks.forEach(function(link) {
      link.classList.toggle('active', active.has(link.getAttribute('href')));
    });
  }

  let ticking = false;
  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() { ticking = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
});

/* BibTeX toggles — one open at a time */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.bib-toggle');
  if (!btn) return;

  const box = document.getElementById(btn.dataset.bibId);
  if (!box) return;

  const willOpen = !box.classList.contains('open');

  document.querySelectorAll('.bib-box.open').forEach(function(b) { b.classList.remove('open'); });
  document.querySelectorAll('.bib-toggle').forEach(function(b) { b.setAttribute('aria-expanded', 'false'); });

  if (willOpen) {
    box.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
});

/* Email reveal */
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.email-toggle');
  const reveal = document.getElementById('email-reveal');
  if (!toggle || !reveal) return;

  toggle.addEventListener('click', function() {
    if (reveal.hasAttribute('hidden')) {
      const user = toggle.dataset.user || '';
      const domain = toggle.dataset.domain || '';
      reveal.textContent = user + ' at ' + domain;
      reveal.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    } else {
      reveal.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});
