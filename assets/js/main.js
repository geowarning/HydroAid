/* ============================================================
   AquaSentry — site interactions
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Sticky navigation ---------- */
  const nav = $('.nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $('.nav__toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      const open = nav.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__links a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  /* ---------- Scroll reveal ---------- */
  const revealables = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Active section highlight ---------- */
  const links = $$('.nav__links a[href^="#"]');
  const sections = links
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) =>
              l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id)
            );
          }
        });
      },
      { threshold: 0, rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      el.textContent =
        decimals > 0
          ? value.toFixed(decimals)
          : Math.round(value).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count));
  }

  /* ---------- Promotional film ---------- */
  const frame = $('.film__frame');
  const video = $('#promo-video');
  const overlay = $('.film__overlay');

  if (frame && video && overlay) {
    const play = () => {
      video.muted = false;
      video.volume = 1;
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    const pause = () => video.pause();

    overlay.addEventListener('click', play);
    video.addEventListener('click', () => (video.paused ? play() : pause()));
    video.addEventListener('play', () => frame.classList.add('is-playing'));
    video.addEventListener('pause', () => frame.classList.remove('is-playing'));
    video.addEventListener('ended', () => frame.classList.remove('is-playing'));

    // Pause the film when it scrolls out of sight.
    if ('IntersectionObserver' in window) {
      const vo = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting && !video.paused) video.pause();
          });
        },
        { threshold: 0.15 }
      );
      vo.observe(video);
    }
  }

  /* ---------- Product clips: load and play only while on screen ---------- */
  const clips = $$('.clip video');
  if (clips.length && 'IntersectionObserver' in window) {
    clips.forEach((v) => {
      v.addEventListener('pointerdown', () => {
        v.dataset.manual = '1';
      });
    });
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target;
          if (v.dataset.manual === '1') return;
          if (v.dataset.autoplay === 'off') return;
          if (e.isIntersecting) {
            const p = v.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } else if (!v.paused) {
            v.pause();
          }
        });
      },
      { threshold: 0.4 }
    );
    clips.forEach((v) => co.observe(v));
  }

  /* ---------- Smooth anchor scrolling with nav offset ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      const offset = 84;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
