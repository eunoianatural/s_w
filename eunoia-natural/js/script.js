/* ==========================================================
   EUNOIA NATURAL · Comportamiento del sitio
   ========================================================== */
(function () {
  'use strict';
  var CFG = window.EUNOIA_CONFIG || {};
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  var IG_USER = (CFG.instagramUsuario || 'eunoia_natural_2').replace(/^@/, '');
  var IG_URL = CFG.instagramUrl || ('https://www.instagram.com/' + IG_USER + '/');
  var FB_URL = CFG.facebookUrl || 'https://www.facebook.com/search/top?q=Eunoia%20Natural';
  var WA_NUM = (CFG.whatsapp || '').replace(/\D/g, '');

  function waLink(msg) {
    if (!WA_NUM) return IG_URL;            // alternativa mientras no haya número
    return 'https://wa.me/' + WA_NUM + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }

  /* ---------- Datos de contacto desde config.js ---------- */
  function markPending(el, text) {
    el.textContent = text;
    el.classList.add('is-pending');
    el.setAttribute('data-pendiente', 'true');
  }

  function fillContacts() {
    // WhatsApp
    var wa = $('#cWhatsapp');
    if (wa) wa.href = waLink('Hola Eunoia Natural, quisiera hacer un pedido.');
    var fWa = $('#fWhatsapp'); if (fWa) fWa.href = waLink('Hola Eunoia Natural, quisiera hacer un pedido.');
    $$('[data-fill="whatsapp-text"]').forEach(function (el) {
      if (WA_NUM) { el.textContent = CFG.telefono || ('+' + WA_NUM); el.classList.remove('is-pending'); }
      else if (el.closest('.c-card')) markPending(el, 'Número por completar');
      else el.textContent = 'WhatsApp por completar';
    });

    // Teléfono
    var tel = $('#cPhone');
    var telDigits = (CFG.telefonoLink || '').replace(/\D/g, '');
    $$('[data-fill="telefono"]').forEach(function (el) {
      if (CFG.telefono && telDigits) { el.textContent = CFG.telefono; el.classList.remove('is-pending'); tel.href = 'tel:+' + telDigits; }
      else { markPending(el, 'Número por completar'); }
    });
    if (!(CFG.telefono && telDigits) && tel) {
      tel.addEventListener('click', function (e) { e.preventDefault(); });
      tel.setAttribute('aria-disabled', 'true');
      tel.classList.add('c-static');
      var go = $('.c-go', tel); if (go) { go.textContent = 'Disponible próximamente'; go.className = 'c-go c-note'; }
    }

    // Correo
    var mail = $('#cMail');
    $$('[data-fill="correo"]').forEach(function (el) {
      if (CFG.correo) { el.textContent = CFG.correo; el.classList.remove('is-pending'); if (mail) mail.href = 'mailto:' + CFG.correo; }
      else if (el.closest('.c-card')) markPending(el, 'Correo por completar');
      else el.textContent = 'Correo por completar';
    });
    if (!CFG.correo && mail) {
      mail.addEventListener('click', function (e) { e.preventDefault(); });
      mail.setAttribute('aria-disabled', 'true');
      mail.classList.add('c-static');
      var g2 = $('.c-go', mail); if (g2) { g2.textContent = 'Disponible próximamente'; g2.className = 'c-go c-note'; }
    }

    // Redes
    var ig = $('#cInstagram'); if (ig) ig.href = IG_URL;
    var fIg = $('#fInstagram'); if (fIg) fIg.href = IG_URL;
    $$('[data-fill="instagram"]').forEach(function (el) { el.textContent = '@' + IG_USER; });
    var fb = $('#cFacebook'); if (fb) fb.href = FB_URL;
    var fFb = $('#fFacebook'); if (fFb) fFb.href = FB_URL;
    if (!CFG.facebookUrl && fb) {
      var g3 = $('.c-go', fb);
      if (g3) g3.innerHTML = 'Buscar en Facebook ' + g3.querySelector('svg').outerHTML;
    }

    // Ubicación
    $$('[data-fill="ubicacion"]').forEach(function (el) {
      el.textContent = (CFG.ubicacion || 'Costa Rica') + (CFG.direccionExacta && el.closest('.c-card') ? ' · ' + CFG.direccionExacta : '');
    });

    // Precios pendientes de la producción limitada
    $$('[data-price]').forEach(function (el) {
      var v = CFG[el.getAttribute('data-price')];
      if (v) el.innerHTML = '<span class="cur">₡</span>' + String(v).replace(/\s/g, '&nbsp;');
    });
  }

  /* ---------- Botones "Pedir" ---------- */
  function setupOrderButtons() {
    $$('.order-btn').forEach(function (btn) {
      var card = btn.closest('[data-product]');
      var name = card ? card.getAttribute('data-product') : '';
      var msg = 'Hola Eunoia Natural, quisiera pedir: ' + name + '.';
      btn.href = waLink(msg);
      { btn.target = '_blank'; btn.rel = 'noopener noreferrer'; }
      btn.setAttribute('aria-label', 'Pedir ' + name);
    });
  }

  /* ---------- Producción limitada: ¿hoy hay? (hora de Costa Rica) ---------- */
  function markToday() {
    var dow;
    try {
      var wd = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Costa_Rica' }).format(new Date());
      dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd];
    } catch (e) { dow = new Date().getDay(); }
    $$('.limited[data-day]').forEach(function (c) {
      if (parseInt(c.getAttribute('data-day'), 10) === dow) {
        c.classList.add('is-today');
        var t = $('.today', c); if (t) t.hidden = false;
      }
    });
  }

  /* ---------- Navbar ---------- */
  var header = $('.site-header');
  var toggle = $('#navToggle');
  var menu = $('#navMenu');

  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('nav-open');
  }
  toggle.addEventListener('click', function () {
    var open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('nav-open', open);
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('nav-open') && !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', closeMenu);

  // Enlace activo según la sección visible
  var links = $$('.nav-link');
  var sections = links.map(function (l) { return $(l.getAttribute('href')); }).filter(Boolean);
  function updateActive() {
    var y = window.scrollY + 140, current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections[sections.length - 1];
    links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current.id); });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- Animaciones al hacer scroll ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Galería / Lightbox ---------- */
  var items = $$('.g-item');
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var idx = 0, lastFocus = null;

  function show(i) {
    idx = (i + items.length) % items.length;
    var it = items[idx];
    lbImg.src = it.getAttribute('data-full');
    lbImg.alt = $('img', it).alt;
    lbCap.textContent = it.getAttribute('data-cap') || '';
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (it, i) { it.addEventListener('click', function () { openLb(i); }); });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function () { show(idx - 1); });
  $('#lbNext').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'Tab') {            // mantener el foco dentro del visor
      var f = $$('.lb-btn', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var tx = null;                           // deslizar en celular
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    tx = null;
  });

  /* ---------- Año actual ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  fillContacts();
  setupOrderButtons();
  markToday();
})();
