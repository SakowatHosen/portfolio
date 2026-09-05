/* Md. Sakowat Hosen - Portfolio interactions
   All page content lives in index.html; this file only handles behaviour. */

(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var navLinks = document.querySelector('.nav-links');
  var menuToggle = document.querySelector('.menu-toggle');
  var themeToggle = document.querySelector('.theme-toggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;

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

  /* Header state + scroll progress --------------------------------------- */

  var ticking = false;

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);

    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    root.style.setProperty('--progress', Math.min(1, Math.max(0, progress)).toFixed(4));

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });

  onScroll();

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

  /* Stagger the line-by-line heading wipes ------------------------------- */

  document.querySelectorAll('.lines').forEach(function (heading) {
    heading.querySelectorAll('.line').forEach(function (line, index) {
      line.style.setProperty('--line-i', String(index));
    });
  });

  /* Scroll reveal -------------------------------------------------------- */

  var revealItems = document.querySelectorAll('.reveal');

  if (reduceMotion || !canObserve) {
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
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  /* Counting stats ------------------------------------------------------- */

  var counters = document.querySelectorAll('.counter');

  function pad(value, width) {
    var text = String(value);
    while (text.length < width) text = '0' + text;
    return text;
  }

  function runCounter(el) {
    var target = Number(el.dataset.count) || 0;
    var width = Number(el.dataset.pad) || 1;

    if (reduceMotion) {
      el.textContent = pad(target, width);
      return;
    }

    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var elapsed = timestamp - start;
      var t = Math.min(1, elapsed / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = pad(Math.round(target * eased), width);
      if (t < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!canObserve) {
      counters.forEach(runCounter);
    } else {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      }, { threshold: 0.6 });

      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }
  }

  /* Portrait slideshow --------------------------------------------------- */

  var slides = document.querySelectorAll('.portrait-stack img');
  var dots = document.querySelectorAll('.portrait-dots i');
  var frameLabel = document.querySelector('.frame-label');
  var slideIndex = 0;

  function showSlide(next) {
    slides.forEach(function (img, i) {
      img.classList.toggle('is-active', i === next);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === next);
    });
    if (frameLabel) {
      frameLabel.textContent = 'MD. SAKOWAT HOSEN / ' + (next < 9 ? '0' : '') + (next + 1);
    }
  }

  if (slides.length > 1 && !reduceMotion) {
    window.setInterval(function () {
      if (document.hidden) return;
      slideIndex = (slideIndex + 1) % slides.length;
      showSlide(slideIndex);
    }, 4500);
  }

  /* Cursor spotlight on cards -------------------------------------------- */

  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.spotlight').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
      });
    });
  }

  /* Active nav link ------------------------------------------------------ */

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && canObserve) {
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
