/* Casa Lumen
   Motion language: paper and print. Pieces are laid down, stamped and slid like cut paper on a
   table. Most moments are triggered (they play once with a settle), shadows drift as if the sun
   moved, and only the hero and the postcard stack follow the scroll directly. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = root.classList.contains('reduced');
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ smooth scroll (lighter, quicker than Austral) */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  window.__site = { lenis: lenis, ScrollTrigger: ScrollTrigger, gsap: gsap };

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -20, duration: 1.4 });
      else el.scrollIntoView();
    });
  });

  /* ------------------------------------------------------------ nav */
  var nav = $('[data-nav]');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      nav.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > window.innerHeight * 1.2);
    }
  });
  nav.addEventListener('focusin', function () { nav.classList.remove('is-hidden'); });

  /* ------------------------------------------------------------ reservation form */
  var form = $('[data-form]');
  if (form) {
    var arrive = $('#r-in');
    var leave = $('#r-out');
    var today = new Date();
    var iso = function (d) { return d.toISOString().slice(0, 10); };
    arrive.min = iso(today);
    leave.min = iso(new Date(today.getTime() + 864e5));
    arrive.addEventListener('change', function () {
      if (!arrive.value) return;
      var next = new Date(arrive.value + 'T12:00:00');
      next.setDate(next.getDate() + 1);
      leave.min = iso(next);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var rules = [
        ['r-in', function () { return !!arrive.value; }],
        ['r-out', function () { return !!leave.value && (!arrive.value || leave.value > arrive.value); }],
        ['r-email', function () { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#r-email').value.trim()); }]
      ];
      var firstBad = null;
      rules.forEach(function (r) {
        var input = document.getElementById(r[0]);
        var ok = r[1]();
        input.closest('.field').classList.toggle('is-invalid', !ok);
        input.setAttribute('aria-invalid', String(!ok));
        document.getElementById(r[0] + '-err').hidden = ok;
        if (!ok && !firstBad) firstBad = input;
      });
      var status = $('[data-status]');
      if (firstBad) { firstBad.focus(); status.textContent = 'Revisa los campos marcados.'; status.classList.remove('is-ok'); return; }
      status.textContent = 'Solicitud enviada. Te confirmaremos las fechas por correo.';
      status.classList.add('is-ok');
      form.querySelector('button').disabled = true;
    });
  }

  /* ------------------------------------------------------------ the leaf-light loop only runs on screen */
  var video = $('[data-video]');
  if (video) {
    if (reduced) { video.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } else video.pause(); });
      }, { rootMargin: '20% 0px' }).observe(video);
    }
  }

  if (reduced) return;

  function start() {
    hero();
    house();
    rooms();
    days();
    voice();
    reserve();
    footer();
    lineReveals();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ------------------------------------------------------------ 1. hero: the paper theatre is assembled, then you walk out of the portico */
  function hero() {
    var casa = $('[data-word="casa"]');
    var lumen = $('[data-word="lumen"]');
    var chars = new SplitText([casa, lumen], { type: 'chars', charsClass: 'char' }).chars;
    gsap.set([casa, lumen], { opacity: 1 });
    var L = function (k) { return '[data-l="' + k + '"]'; };
    var shadows = [L('oliveSh'), L('figSh'), L('agaveSh')];

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from(L('city') + ' img', { scale: 1.08, opacity: 0, duration: 1.4, ease: 'power2.out' }, 0)
      .from(L('facade'), { yPercent: 9, rotation: -1.4, duration: 1.3, ease: 'back.out(1.3)' }, 0.15)
      .from(L('facadeSh'), { opacity: 0, duration: 1 }, 0.6)
      .from(L('arcade'), { scale: 1.08, yPercent: -2, opacity: 0, duration: 1.2 }, 0.35)
      .from(L('arcadeSh'), { opacity: 0, duration: 1 }, 0.8)
      .from(chars, {
        yPercent: -55, opacity: 0, duration: 0.9, ease: 'back.out(2.2)', stagger: 0.07,
        rotation: function () { return gsap.utils.random(-14, 14); }
      }, 0.85)
      .from(L('olive'), { rotation: -16, xPercent: -12, duration: 1.8, ease: 'elastic.out(1, 0.55)' }, 1.0)
      .from(L('fig'), { rotation: 14, xPercent: 12, duration: 1.8, ease: 'elastic.out(1, 0.55)' }, 1.1)
      .from(L('agave'), { yPercent: 26, duration: 1.1, ease: 'back.out(1.5)' }, 1.0)
      .from(shadows, { opacity: 0, duration: 1 }, 1.5)
      .fromTo('[data-hero-label]', { y: 40, rotation: 4, opacity: 0 }, { y: 0, rotation: -1.2, opacity: 1, duration: 1, ease: 'back.out(1.6)' }, 1.6)
      .to(nav, { opacity: 1, duration: 0.8 }, 1.7);

    // Scroll: the portico grows past you, the words cross each other through the layers,
    // and every cast shadow slides a little further than its object, as if the sun moved.
    var tl = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      // pinSpacing is off: .hero reserves its own height in CSS (stage + 140% pin - 45vh overlap),
      // so the house slides over the last part of the pin like a sheet of paper, with zero layout shift.
      scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: '+=140%', scrub: 0.7, pin: true, pinSpacing: false }
    });
    tl.to(L('city'), { scale: 1.06, yPercent: -2 }, 0)
      .to(L('facade'), { scale: 1.14, yPercent: -3 }, 0)
      .to(L('facadeSh'), { scale: 1.14, yPercent: -3, xPercent: 2.5 }, 0)
      .to(L('arcade'), { scale: 1.55, yPercent: 5 }, 0)
      .to(L('arcadeSh'), { scale: 1.55, yPercent: 5, xPercent: 4 }, 0)
      .to(casa, { xPercent: 38, yPercent: -36 }, 0)
      .to(lumen, { xPercent: -34, yPercent: 26 }, 0)
      .to(L('olive'), { xPercent: -42, yPercent: -30, rotation: -8 }, 0)
      .to(L('oliveSh'), { xPercent: -30, yPercent: -22, rotation: -8 }, 0)
      .to(L('fig'), { xPercent: 42, yPercent: -30, rotation: 8 }, 0)
      .to(L('figSh'), { xPercent: 52, yPercent: -18, rotation: 8 }, 0)
      .to(L('agave'), { xPercent: 26, yPercent: 38 }, 0)
      .to(L('agaveSh'), { xPercent: 40, yPercent: 40 }, 0)
      .to('[data-hero-label]', { y: -70, opacity: 0, duration: 0.3 }, 0);
  }

  /* ------------------------------------------------------------ 2. the house: words are printed line by line, photos are tipped in */
  function house() {
    var el = $('[data-print]');
    var split = new SplitText(el, { type: 'lines,words', mask: 'lines', linesClass: 'line', wordsClass: 'word' });
    gsap.from(split.words, {
      yPercent: 115, rotation: 7, transformOrigin: '0% 100%', duration: 1.1, ease: 'power4.out', stagger: 0.028,
      scrollTrigger: { trigger: el, start: 'top 72%' }
    });
    gsap.from($$('.inline-img', el), {
      scale: 0, rotation: -12, duration: 1.1, ease: 'back.out(2)', stagger: 0.25, delay: 0.5,
      scrollTrigger: { trigger: el, start: 'top 72%' }
    });
    gsap.from('[data-sign]', { opacity: 0, x: -20, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '[data-sign]', start: 'top 90%' } });
    gsap.fromTo('.house__video', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.house', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ------------------------------------------------------------ 3. rooms: postcards are dealt onto the pile */
  function rooms() {
    var list = $$('[data-room]');
    list.forEach(function (room, i) {
      var card = $('.room__card', room);
      var r = parseFloat(getComputedStyle(room).getPropertyValue('--r')) || 0;
      gsap.from(card, {
        y: 120, rotation: r * 4, ease: 'none',
        scrollTrigger: { trigger: room, start: 'top bottom', end: 'top 35%', scrub: 0.6 }
      });
      if (i === list.length - 1) return;
      var next = list[i + 1];
      gsap.to(room, {
        scale: 0.9, rotation: i % 2 ? 2.2 : -2.2, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true }
      });
      gsap.to(card, {
        '--dim': 0.22, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true }
      });
    });
  }

  /* ------------------------------------------------------------ 4. days: arch windows open, each plate drifts at its own speed */
  function days() {
    $$('.day').forEach(function (day) {
      var speed = parseFloat(day.getAttribute('data-speed')) || 1;
      var d = (speed - 1) * 320;
      gsap.fromTo(day, { y: d }, { y: -d, ease: 'none', scrollTrigger: { trigger: day, start: 'top bottom', end: 'bottom top', scrub: true } });
      var arch = $('[data-arch]', day);
      var img = $('img', arch);
      var st = { trigger: arch, start: 'top 86%' };
      gsap.fromTo(arch, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.out', scrollTrigger: st });
      gsap.fromTo(img, { scale: 1.3, yPercent: 8 }, { scale: 1, yPercent: 0, duration: 1.9, ease: 'power3.out', scrollTrigger: { trigger: arch, start: 'top 86%' } });
      gsap.from([$('.day__name', day), $('.day__text', day)], {
        y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: arch, start: 'top 60%' }
      });
    });
  }

  /* ------------------------------------------------------------ 5. testimonial: a terracotta sheet slides over, a branch drifts across */
  function voice() {
    gsap.fromTo('[data-branch]', { xPercent: 14, rotation: -5 }, {
      xPercent: -14, rotation: 4, ease: 'none',
      scrollTrigger: { trigger: '.voice', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.from('.voice__cite', { opacity: 0, y: 14, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.voice__cite', start: 'top 90%' } });
  }

  /* ------------------------------------------------------------ 6. reserve: the ticket is placed on the table */
  function reserve() {
    gsap.from('.ticket', {
      y: 90, rotation: 6, opacity: 0, duration: 1.3, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.ticket', start: 'top 85%' }
    });
    gsap.from('.ticket > *', {
      y: 16, opacity: 0, duration: 0.8, stagger: 0.05, delay: 0.35, ease: 'power3.out',
      scrollTrigger: { trigger: '.ticket', start: 'top 85%' }
    });
    gsap.fromTo('[data-reserve-agave]', { yPercent: 20, rotation: 3 }, {
      yPercent: -10, rotation: -2, ease: 'none',
      scrollTrigger: { trigger: '.reserve', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  function footer() {
    var chars = new SplitText('.footer__word', { type: 'words,chars', wordsClass: 'word', charsClass: 'char', mask: 'chars' }).chars;
    gsap.from(chars, {
      yPercent: 100, rotation: 10, duration: 0.9, stagger: 0.05, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: '.footer', start: 'top 85%' }
    });
  }

  function lineReveals() {
    $$('[data-lines]').forEach(function (el) {
      var lines = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'line' }).lines;
      gsap.from(lines, {
        yPercent: 108, rotation: 3, transformOrigin: '0% 100%', duration: 1.1, stagger: 0.09, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 84%' }
      });
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else window.addEventListener('load', start);
})();
