/* Md. Sakowat Hosen - Portfolio interactions
   All page content lives in index.html; this file only handles behaviour. */

(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var navLinks = document.querySelector('.nav-links');
  var menuToggle = document.querySelector('.menu-toggle');
  var themeToggle = document.querySelector('.theme-toggle');

  /* Icons ---------------------------------------------------------------- */

  function renderIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  renderIcons();

  /* Theme ---------------------------------------------------------------- */

  function paintThemeToggle() {
    if (!themeToggle) return;
    var isLight = root.dataset.theme === 'light';
    themeToggle.innerHTML = '<i data-lucide="' + (isLight ? 'moon' : 'sun') + '"></i>';
    themeToggle.setAttribute('aria-label', 'Switch to ' + (isLight ? 'dark' : 'light') + ' theme');
    renderIcons();
  }

  paintThemeToggle();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', root.dataset.theme);
      } catch (e) {
        /* storage blocked - the theme still applies for this visit */
      }
      paintThemeToggle();
    });
  }

  /* Header state --------------------------------------------------------- */

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu ---------------------------------------------------------- */

  function closeMenu() {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    menuToggle.innerHTML = '<i data-lucide="menu"></i>';
    renderIcons();
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      menuToggle.innerHTML = '<i data-lucide="' + (isOpen ? 'x' : 'menu') + '"></i>';
      renderIcons();
    });

    navLinks.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  /* Scroll reveal -------------------------------------------------------- */

  var revealItems = document.querySelectorAll('.reveal');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  /* Active nav link ------------------------------------------------------ */

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* Contact form --------------------------------------------------------- */

  var form = document.querySelector('#contact-form');
  var formNote = form && form.querySelector('.form-note');
  var mailLink = document.querySelector('.contact-details a[href^="mailto:"]');

  function setNote(message, state) {
    if (!formNote) return;
    formNote.textContent = message;
    formNote.dataset.state = state;
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        setNote('Please complete each field before sending.', 'error');
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var address = mailLink ? mailLink.getAttribute('href').replace('mailto:', '') : '';

      if (!address || address.indexOf('example.com') !== -1) {
        setNote('Thanks — the message is ready to send once an email address is connected.', 'ok');
        return;
      }

      var body = 'Name: ' + data.get('name') + '\nEmail: ' + data.get('email') + '\n\n' + data.get('message');
      window.location.href = 'mailto:' + address +
        '?subject=' + encodeURIComponent(data.get('subject')) +
        '&body=' + encodeURIComponent(body);

      setNote('Opening your email app — thanks for reaching out.', 'ok');
      form.reset();
    });
  }

  /* Footer year ---------------------------------------------------------- */

  var year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
