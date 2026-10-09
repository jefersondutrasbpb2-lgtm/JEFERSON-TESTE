/* =========================================================
   Sertão Negócios 2026 · interações e animações
   Lenis (scroll suave) + GSAP / ScrollTrigger / SplitText / DrawSVG
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const CFG = window.SN_CONFIG || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGSAP && !reduceMotion;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  if (!motion) root.classList.add('no-motion');

  /* ---------- Mensuração ---------- */
  const track = (event, params = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
    if (typeof window.gtag === 'function') window.gtag('event', event, params);
  };

  /* ---------- Lenis + ScrollTrigger ---------- */
  let lenis = null;
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);

    if (window.Lenis) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  const navHeight = () => ($('[data-nav]')?.offsetHeight || 72);

  const scrollToTarget = (target, onDone) => {
    if (lenis) {
      lenis.scrollTo(target, { offset: target.id === 'inicio' ? 0 : -navHeight() + 1, duration: 1.5, onComplete: onDone });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (onDone) setTimeout(onDone, reduceMotion ? 0 : 700);
    }
  };

  /* ---------- Âncoras, CTAs e pré-seleção de interesse ---------- */
  const setInterest = (value) => {
    const radio = $(`input[name="interesse"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
      radio.closest('.field')?.classList.remove('is-invalid');
      const err = $('#e-interesse'); if (err) err.textContent = '';
    }
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();

    if (link.dataset.interest) setInterest(link.dataset.interest);
    if (link.dataset.cta) track('cta_click', { cta_location: link.dataset.cta, cta_text: link.textContent.trim() });

    scrollToTarget(target, () => {
      // Move o foco para o destino sem rolar de novo (navegação por teclado / leitores de tela).
      const focusEl = id === 'inscricao' ? $('#signup-title') : target;
      if (!focusEl.hasAttribute('tabindex')) focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
    });
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
  });

  /* ---------- Navegação: tema por seção, esconder ao rolar, dock mobile ---------- */
  const nav = $('[data-nav]');
  const dock = $('[data-dock]');
  const hero = $('.hero');
  const signup = $('#inscricao');
  const themed = $$('[data-theme]');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const probe = navHeight() / 2;

    nav.classList.toggle('is-scrolled', y > 40);
    const goingDown = y > lastY;
    nav.classList.toggle('is-hidden', goingDown && y > window.innerHeight * .9 && !nav.matches(':focus-within'));
    lastY = y;

    for (const sec of themed) {
      const r = sec.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { nav.classList.toggle('is-light', sec.dataset.theme === 'light'); break; }
    }

    if (dock && hero && signup) {
      const pastHero = hero.getBoundingClientRect().bottom < window.innerHeight * .25;
      const s = signup.getBoundingClientRect();
      const formInView = s.top < window.innerHeight && s.bottom > 0;
      dock.classList.toggle('is-visible', pastHero && !formInView);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Brilho que segue o cursor nos botões ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', (e) => {
      const btn = e.target.closest?.('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    }, { passive: true });
  }

  /* ---------- Friso regional: completa a faixa para o loop ---------- */
  $$('.frieze__track').forEach((track) => {
    const set = $('.frieze__set', track);
    if (!set) return;
    const copies = Math.max(2, Math.ceil((window.innerWidth * 2) / Math.max(set.scrollWidth, 1)) + 1);
    for (let i = 1; i < copies; i++) track.appendChild(set.cloneNode(true));
  });

  /* ---------- Formulário ---------- */
  initForm();
  initPrivacy();

  if (!motion) return;

  /* =========================================================
     ANIMAÇÕES (somente com GSAP e movimento permitido)
     ========================================================= */
  const mm = gsap.matchMedia();

  /* ---------- Hero: coreografia de entrada ---------- */
  $$('[data-hero]').forEach((el) => { el.style.animation = 'none'; });
  const topoPaths = $$('[data-topo] path');
  const intro = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.4 }, delay: .1 });
  intro
    .fromTo('[data-hero="logo"]', { opacity: 0, y: 70, scale: .94, rotateX: 18, transformPerspective: 900 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.8 }, 0)
    .fromTo('[data-hero="kicker"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0 }, .25)
    .fromTo('[data-hero="meta"]', { opacity: 0, x: 30 }, { opacity: 1, x: 0 }, .55)
    .fromTo(['[data-hero="lead"]', '[data-hero="sub"]', '[data-hero="cta"]', '[data-hero="note"]'],
      { opacity: 0, y: 26 }, { opacity: 1, y: 0, stagger: .09 }, .6)
    .from('.hero__frieze', { opacity: 0, y: 24, duration: 1.2 }, .9)
    .from('.hero__horizon', { opacity: 0, y: 40, duration: 2 }, 0);
  if (window.DrawSVGPlugin && topoPaths.length) {
    intro.fromTo(topoPaths, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 2.4, ease: 'power2.inOut', stagger: { each: .05, from: 'end' } }, 0);
  }

  // Hero → manifesto: profundidade em camadas
  gsap.set('.hero__topo', { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero__inner', { yPercent: -14, opacity: .15, ease: 'none' }, 0)
    .to('.hero__horizon', { yPercent: 28, ease: 'none' }, 0)
    .to('.hero__topo', { scale: 1.25, rotate: 6, ease: 'none' }, 0)
    .fromTo('.hero__frieze', { yPercent: 0, opacity: 1 }, { yPercent: 120, opacity: 0, ease: 'none', immediateRender: false }, 0);

  /* ---------- Títulos: revelação por linhas com máscara ---------- */
  if (window.SplitText) {
    $$('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 110, duration: 1.25, ease: 'expo.out', stagger: .09,
          scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none none' }
        })
      });
    });

    // Manifesto: palavras acendem conforme a leitura avança
    const manifesto = $('[data-words]');
    if (manifesto) {
      SplitText.create(manifesto, {
        type: 'words', wordsClass: 'w', autoSplit: true,
        onSplit: (self) => gsap.fromTo(self.words, { opacity: .14 }, {
          opacity: 1, ease: 'none', stagger: .1,
          scrollTrigger: { trigger: manifesto, start: 'top 78%', end: 'bottom 42%', scrub: .6 }
        })
      });
    }

    // Nomes dos palestrantes
    $$('.speaker__name').forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: .1,
          scrollTrigger: { trigger: el, start: 'top 92%' }
        })
      });
    });
  }

  /* ---------- Revelação genérica ---------- */
  gsap.set('[data-reveal]', { opacity: 0, y: 40 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, y: 0, duration: 1.15, ease: 'expo.out', stagger: .08, clearProps: 'transform,opacity'
    })
  });

  /* ---------- Revelação de imagens com máscara ---------- */
  $$('[data-img-reveal]').forEach((wrap) => {
    const img = $('img', wrap);
    gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 85%' } })
      .fromTo(wrap, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0)
      .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 2, ease: 'expo.out' }, .1);
  });

  /* ---------- Desenho de linhas SVG ---------- */
  if (window.DrawSVGPlugin) {
    $$('.vis .draw, .benefit__icon .draw').forEach((g) => {
      const paths = g.matches('path') ? [g] : $$('path, rect, circle', g);
      gsap.fromTo(paths, { drawSVG: '0%' }, {
        drawSVG: '100%', duration: 2, ease: 'power2.inOut', stagger: .15,
        scrollTrigger: { trigger: g.closest('.chapter, .benefit') || g, start: 'top 70%' }
      });
    });
  }

  /* ---------- História: sticky storytelling ---------- */
  const rail = $$('.story__rail li');
  $$('.chapter').forEach((ch, i) => {
    ScrollTrigger.create({
      trigger: ch, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) rail.forEach((li, j) => li.classList.toggle('is-active', j === i)); }
    });
  });

  mm.add('(min-width: 900px)', () => {
    $$('.chapter').forEach((ch) => {
      const vis = $('.vis', ch);
      const text = $('.chapter__text', ch);
      gsap.fromTo(vis, { scale: .82, borderRadius: '48px', opacity: .4 }, {
        scale: 1, borderRadius: '20px', opacity: 1, ease: 'none',
        scrollTrigger: { trigger: ch, start: 'top bottom', end: 'top 25%', scrub: true }
      });
      gsap.fromTo(vis, { scale: 1, opacity: 1 }, {
        scale: .9, opacity: .25, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: ch, start: 'bottom 95%', end: 'bottom 35%', scrub: true }
      });
      gsap.fromTo(text, { y: 60 }, { y: -60, ease: 'none', scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    const sun = $('.vis__sun');
    if (sun) gsap.to(sun, { rotate: 120, ease: 'none', scrollTrigger: { trigger: sun.closest('.chapter'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  gsap.from('.stands .mod', {
    opacity: 0, y: 30, scale: .8, transformOrigin: '50% 100%', duration: .9, ease: 'back.out(1.7)', stagger: { each: .05, from: 'random' },
    scrollTrigger: { trigger: '.stands', start: 'top 80%' }
  });
  gsap.from('.boiada', { opacity: 0, duration: 1.2, scrollTrigger: { trigger: '.vis--rios', start: 'top 60%' } });

  gsap.from('.sectors li', {
    opacity: 0, y: 24, scale: .9, duration: .9, ease: 'back.out(1.6)', stagger: .07,
    scrollTrigger: { trigger: '.vis--setores', start: 'top 70%' }
  });

  /* ---------- Mapa: rede que se desenha ---------- */
  const mapTl = gsap.timeline({ paused: true });
  if (window.DrawSVGPlugin) {
    mapTl.fromTo('.map__br', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' }, 0)
      .fromTo('.map__links path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, stagger: .12, ease: 'power2.out' }, .5);
  }
  mapTl
    .from('.city--hub > circle:not(.hub-pulse)', { scale: 0, transformOrigin: '50% 50%', duration: .8, ease: 'back.out(2)' }, .2)
    .from('.city:not(.city--hub) circle', { scale: 0, transformOrigin: '50% 50%', duration: .6, ease: 'back.out(2.4)', stagger: .12 }, .7)
    .from('.city text, .map__br-label', { opacity: 0, y: 8, duration: .6, stagger: .08 }, .8)
    .from('.map__states text', { opacity: 0, duration: 1 }, 1.2);

  mm.add('(min-width: 1024px)', () => {
    mapTl.progress(0);
    ScrollTrigger.create({
      trigger: '.map__pin', start: 'top top', end: '+=110%', pin: true, scrub: .8, animation: mapTl, anticipatePin: 1
    });
    gsap.to('.map__topo', { rotate: 10, scale: 1.08, transformOrigin: '50% 50%', ease: 'none', scrollTrigger: { trigger: '.map', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  mm.add('(max-width: 1023px)', () => {
    ScrollTrigger.create({ trigger: '.map__fig', start: 'top 75%', once: true, onEnter: () => mapTl.play() });
  });

  /* ---------- Contadores ---------- */
  $$('[data-count]').forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    const pad = end < 10 ? 2 : String(end).length;
    const obj = { v: 0 };
    el.textContent = String(0).padStart(pad, '0');
    gsap.to(obj, {
      v: end, duration: end > 50 ? 2.2 : 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: () => { el.textContent = String(Math.round(obj.v)).padStart(pad, '0'); }
    });
  });

  /* ---------- Palestrantes ---------- */
  $$('[data-speaker]').forEach((card, i) => {
    const frame = $('.speaker__frame', card);
    const img = $('img', frame);
    gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%' } })
      .fromTo(card, { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', delay: i * .08 }, 0)
      .fromTo(img, { scale: 1.18, yPercent: 8 }, { scale: 1, yPercent: 0, duration: 1.8, ease: 'expo.out' }, 0);
  });
  mm.add('(min-width: 640px)', () => {
    $$('[data-speed]').forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0;
      if (el.classList.contains('hero__horizon')) return;
      gsap.fromTo(el, { y: () => -speed * window.innerHeight }, {
        y: () => speed * window.innerHeight, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
    });
  });

  /* ---------- Programação: linha do tempo ---------- */
  $$('.timeline').forEach((tl) => {
    gsap.fromTo(tl, { '--p': 0 }, {
      '--p': 1, ease: 'none',
      scrollTrigger: { trigger: tl, start: 'top 75%', end: 'bottom 55%', scrub: true }
    });
    gsap.from($$('li', tl), {
      opacity: 0, x: -20, duration: 1, ease: 'expo.out', stagger: .12,
      scrollTrigger: { trigger: tl, start: 'top 80%' }
    });
  });
  $$('[data-day]').forEach((day) => {
    ScrollTrigger.create({ trigger: day, start: 'top 65%', end: 'bottom 35%', toggleClass: { targets: day, className: 'is-active' } });
  });

  /* ---------- Final: título com escala ---------- */
  gsap.fromTo('.finale__title', { scale: .9 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'center center', scrub: true } });

  /* ---------- Friso: loop contínuo que reage à velocidade do scroll ---------- */
  $$('.frieze__track').forEach((track) => {
    const sets = $$('.frieze__set', track);
    const loop = gsap.to(track, { x: () => -sets[0].offsetWidth, duration: 30, ease: 'none', repeat: -1 });
    let boost;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 400, 5);
        loop.timeScale(1 + v);
        if (boost) boost.kill();
        boost = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out', delay: .1 });
      }
    });
  });

  /* ---------- Ajustes finais ---------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // Abre direto na âncora (ex.: link de campanha para #inscricao)
  if (location.hash) {
    const t = document.getElementById(location.hash.slice(1));
    if (t) setTimeout(() => scrollToTarget(t), 300);
  }

  /* =========================================================
     FORMULÁRIO
     ========================================================= */
  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const success = $('[data-success]');
    const status = $('.form__status', form);
    const params = new URLSearchParams(location.search);

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
      if (form.elements[k] && params.get(k)) form.elements[k].value = params.get(k);
    });
    if (form.elements.pagina) form.elements.pagina.value = location.href.split('#')[0];
    const pre = params.get('interesse');
    if (pre && ['smart', 'vip', 'expositor'].includes(pre)) setInterest(pre);

    // Máscara de telefone: (00) 00000-0000
    const phone = form.elements.whatsapp;
    phone.addEventListener('input', () => {
      const d = phone.value.replace(/\D/g, '').slice(0, 11);
      let out = d;
      if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      phone.value = out;
    });

    let started = false;
    form.addEventListener('focusin', () => {
      if (!started) { started = true; track('form_start', { form_id: 'lead-form' }); }
    });

    const rules = {
      nome: (v) => v.trim().length >= 3 && /\s/.test(v.trim()) ? '' : 'Informe seu nome completo.',
      whatsapp: (v) => { const d = v.replace(/\D/g, ''); return d.length >= 10 && d.length <= 11 ? '' : 'Informe um WhatsApp válido com DDD.'; },
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Informe um e-mail válido.',
      interesse: () => form.querySelector('input[name="interesse"]:checked') ? '' : 'Escolha uma opção.',
      consentimento: () => form.elements.consentimento.checked ? '' : 'É preciso autorizar o contato para continuar.'
    };

    const validate = (name) => {
      const msg = rules[name](form.elements[name].value ?? '');
      const field = (name === 'interesse' ? $('.field--choices', form) : form.elements[name].closest('.field'));
      const err = $(`#e-${name}`);
      field.classList.toggle('is-invalid', !!msg);
      if (name !== 'interesse' && name !== 'consentimento') field.classList.toggle('is-valid', !msg);
      if (err) err.textContent = msg;
      const input = name === 'interesse' ? null : form.elements[name];
      if (input) {
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (err) input.setAttribute('aria-describedby', err.id);
      }
      return !msg;
    };

    ['nome', 'whatsapp', 'email'].forEach((n) => {
      form.elements[n].addEventListener('blur', () => { if (form.elements[n].value) validate(n); });
      form.elements[n].addEventListener('input', () => { if (form.elements[n].closest('.field').classList.contains('is-invalid')) validate(n); });
    });
    $$('input[name="interesse"]', form).forEach((r) => r.addEventListener('change', () => validate('interesse')));
    form.elements.consentimento.addEventListener('change', () => validate('consentimento'));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      const ok = Object.keys(rules).map(validate).every(Boolean);
      if (!ok) {
        const first = $('.is-invalid input', form);
        if (first) first.focus();
        track('form_error', { form_id: 'lead-form' });
        return;
      }
      if (form.elements.empresa_site.value) return; // honeypot

      const data = Object.fromEntries(new FormData(form).entries());
      delete data.empresa_site;
      data.whatsapp = data.whatsapp.replace(/\D/g, '');
      data.enviado_em = new Date().toISOString();

      form.classList.add('is-loading');
      form.setAttribute('aria-busy', 'true');
      try {
        await sendLead(data);
        track('generate_lead', { form_id: 'lead-form', interesse: data.interesse });
        if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: `Sertão Negócios · ${data.interesse}` });
        showSuccess(data.nome);
      } catch (err) {
        console.error(err);
        status.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.';
        track('form_submit_error', { form_id: 'lead-form' });
      } finally {
        form.classList.remove('is-loading');
        form.removeAttribute('aria-busy');
      }
    });

    async function sendLead(data) {
      if (!CFG.leadEndpoint) {
        console.warn('[Sertão Negócios] leadEndpoint não configurado em assets/js/config.js. Envio simulado:', data);
        await new Promise((r) => setTimeout(r, 900));
        return;
      }
      const isForm = CFG.payloadFormat === 'form';
      const res = await fetch(CFG.leadEndpoint, {
        method: 'POST',
        mode: CFG.requestMode || 'cors',
        headers: { 'Content-Type': isForm ? 'application/x-www-form-urlencoded;charset=UTF-8' : 'application/json' },
        body: isForm ? new URLSearchParams(data).toString() : JSON.stringify(data)
      });
      // Em modo no-cors a resposta é opaca: considera enviado se não houve erro de rede.
      if (res.type !== 'opaque' && !res.ok) throw new Error(`HTTP ${res.status}`);
    }

    function showSuccess(nome) {
      const first = (nome || '').trim().split(/\s+/)[0];
      $('[data-success-name]').textContent = first ? `, ${first}` : '';
      form.hidden = true;
      success.hidden = false;
      success.focus();
      if (window.gsap && !reduceMotion) {
        gsap.from(success.children, { opacity: 0, y: 24, duration: .9, ease: 'expo.out', stagger: .08 });
      }
      if (CFG.redirectUrl) setTimeout(() => { location.href = CFG.redirectUrl; }, CFG.redirectDelayMs || 2000);
    }
  }

  /* =========================================================
     POLÍTICA DE PRIVACIDADE (dialog)
     ========================================================= */
  function initPrivacy() {
    const dlg = $('#privacy');
    if (!dlg || typeof dlg.showModal !== 'function') return;
    $$('[data-open-privacy]').forEach((b) => b.addEventListener('click', () => {
      dlg.showModal();
      if (lenis) lenis.stop();
    }));
    $('[data-close-privacy]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { if (lenis) lenis.start(); });
  }
})();
