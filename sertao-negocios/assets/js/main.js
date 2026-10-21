/* =========================================================
   Sertão Negócios 2026 · interações e animações
   Lenis (scroll suave) + GSAP / ScrollTrigger / SplitText / DrawSVG
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const CFG = window.SN_CONFIG || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Celular: sem rolagem suave e sem animações de entrada; todo texto aparece na hora
  const lite = root.classList.contains('lite');
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGSAP && !reduceMotion && !lite;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  if (!motion) root.classList.add('no-motion');

  /* ---------- Frase principal do topo: versões para teste ----------
     A versão A está no HTML. Para abrir outra, acrescente ?titulo=b ou ?titulo=c ao link
     (ex.: anúncios para tráfego frio com a A, mensagens para a base do Moisés com a C). */
  const HEADLINES = {
    b: 'Gestão de verdade com <em>Moisés Ramos</em>, em Patos.',
    c: 'O lote 0 abre primeiro <em>na comunidade.</em>'
  };
  const headlineVariant = (new URLSearchParams(location.search).get('titulo') || 'a').toLowerCase();
  const headline = $('[data-headline]');
  if (headline && HEADLINES[headlineVariant]) headline.innerHTML = HEADLINES[headlineVariant];

  /* ---------- Mensuração ---------- */
  const track = (event, params = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, titulo: headlineVariant, ...params });
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
  // Guarda o último interesse clicado (Smart, VIP ou estande) num campo oculto do formulário
  const setInterest = (value) => {
    $$('[data-form] input[name="interesse"]').forEach((field) => { field.value = value; });
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
      const focusEl = id === 'inscricao' ? $('#signup-title') : (id === 'cadastro' ? ($('[data-form] input[name="nome"]', target) || target) : target);
      if (!focusEl.hasAttribute('tabindex')) focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
    });
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
  });

  /* ---------- Navegação: tema por seção, esconder ao rolar, dock mobile ---------- */
  const nav = $('[data-nav]');
  const dock = $('[data-dock]');
  const hero = $('.hero');
  const signup = $('[data-dock-hide]') || $('#inscricao');
  const topForm = $('[data-dock-after]') || $('#cadastro');
  const waFloat = $('[data-wa]');
  // Só as seções da página: quem hospeda o site pode marcar o <html> com data-theme e escurecer o menu no topo
  const themed = $$('section[data-theme], footer[data-theme]');
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

    // Barra fixa do celular: aparece depois do card do topo e some quando o formulário do fim (ou os ingressos) está na tela
    if (dock && topForm && signup) {
      const pastTopForm = topForm.getBoundingClientRect().bottom < 0;
      const s = signup.getBoundingClientRect();
      const formInView = s.top < window.innerHeight && s.bottom > 0;
      dock.classList.toggle('is-visible', pastTopForm && !formInView);
      // WhatsApp de dúvidas: no celular só aparece junto com a barra, logo acima dela
      if (waFloat) waFloat.classList.toggle('is-up', pastTopForm && !formInView);
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

  /* ---------- WhatsApp flutuante ---------- */
  initWhatsApp();

  /* ---------- Formulário e checkout ---------- */
  initForm();
  initCheckout();
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
    .fromTo(['[data-hero="lead"]', '[data-hero="sub"]', '[data-hero="cta"]'],
      { opacity: 0, y: 26 }, { opacity: 1, y: 0, stagger: .09 }, .6)
    .from('.hero__frieze', { opacity: 0, y: 24, duration: 1.2 }, .9)
    .from('.hero__horizon', { opacity: 0, y: 40, duration: 2 }, 0);
  if (window.DrawSVGPlugin && topoPaths.length) {
    intro.fromTo(topoPaths, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 2.4, ease: 'power2.inOut', stagger: { each: .05, from: 'end' } }, 0);
  }

  // Hero → próxima seção: profundidade em camadas
  gsap.set('.hero__topo', { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero__inner', { yPercent: -14, opacity: .15, ease: 'none' }, 0)
    .to('.hero__horizon', { yPercent: 12, ease: 'none' }, 0)
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
    $$('.benefit__icon .draw').forEach((g) => {
      const paths = g.matches('path') ? [g] : $$('path, rect, circle', g);
      gsap.fromTo(paths, { drawSVG: '0%' }, {
        drawSVG: '100%', duration: 2, ease: 'power2.inOut', stagger: .15,
        scrollTrigger: { trigger: g.closest('.benefit') || g, start: 'top 70%' }
      });
    });
  }

  gsap.from('.stands .mod', {
    opacity: 0, y: 30, scale: .8, transformOrigin: '50% 100%', duration: .9, ease: 'back.out(1.7)', stagger: { each: .05, from: 'random' },
    scrollTrigger: { trigger: '.stands', start: 'top 80%' }
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

  /* ---------- Perguntas frequentes: recalcula as posições quando uma resposta abre ---------- */
  $$('.qa').forEach((qa) => qa.addEventListener('toggle', () => {
    clearTimeout(qa._t);
    qa._t = setTimeout(() => ScrollTrigger.refresh(), 60);
  }));

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
    const forms = $$('[data-form]');
    if (!forms.length) return;
    const params = new URLSearchParams(location.search);
    const pre = params.get('interesse');

    // Grupo da comunidade: abre o link e mede quem foi para o grupo (Pixel e GA4)
    const goToGroup = (metodo, formId) => {
      track('EntrouNoGrupo', { metodo, form_id: formId });
      if (typeof window.fbq === 'function') window.fbq('trackCustom', 'EntrouNoGrupo', { metodo });
      if (CFG.communityUrl) location.href = CFG.communityUrl;
    };

    const rules = {
      nome: (v) => v.trim().length >= 3 && /\s/.test(v.trim()) ? '' : 'Informe seu nome completo.',
      whatsapp: (v) => { const d = v.replace(/\D/g, ''); return d.length >= 10 && d.length <= 11 ? '' : 'Informe um WhatsApp válido com DDD.'; }
    };

    forms.forEach((form) => {
      const formId = form.id || 'lead-form';
      const card = form.closest('[data-form-card]') || form.parentElement;
      const success = $('[data-success]', card);
      const status = $('.form__status', form);

      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
        if (form.elements[k] && params.get(k)) form.elements[k].value = params.get(k);
      });
      if (form.elements.pagina) form.elements.pagina.value = location.href.split('#')[0];
      if (pre && ['expositor'].includes(pre) && form.elements.interesse) form.elements.interesse.value = pre;

      // Botão "Entrar no grupo agora" da tela de sucesso
      const community = success && $('[data-community]', success);
      if (community) {
        if (CFG.communityUrl) community.href = CFG.communityUrl;
        community.addEventListener('click', (e) => { e.preventDefault(); goToGroup('botao', formId); });
      }

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
        if (!started) { started = true; track('form_start', { form_id: formId }); }
      });

      const validate = (name) => {
        const input = form.elements[name];
        const msg = rules[name](input.value ?? '');
        const field = input.closest('.field');
        const err = $('.field__error', field);
        field.classList.toggle('is-invalid', !!msg);
        field.classList.toggle('is-valid', !msg);
        if (err) err.textContent = msg;
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (err) input.setAttribute('aria-describedby', err.id);
        return !msg;
      };

      Object.keys(rules).forEach((n) => {
        form.elements[n].addEventListener('blur', () => { if (form.elements[n].value) validate(n); });
        form.elements[n].addEventListener('input', () => { if (form.elements[n].closest('.field').classList.contains('is-invalid')) validate(n); });
      });

      form.addEventListener('submit', async (e) => {
        status.textContent = '';
        const ok = Object.keys(rules).map(validate).every(Boolean);
        if (!ok) {
          e.preventDefault();
          e.stopImmediatePropagation();
          const first = $('.is-invalid input', form);
          if (first) first.focus();
          track('form_error', { form_id: formId });
          return;
        }
        if (form.elements.__empresa_site.value) { e.preventDefault(); e.stopImmediatePropagation(); return; } // honeypot

        e.preventDefault();
        const nome = form.elements.nome.value;
        const interesse = (form.elements.interesse && form.elements.interesse.value) || 'geral';

        // Página HTML do GreatPages: com o envio já interrompido aqui, o script do GreatPages grava o lead
        // em segundo plano (sendBeacon); a página mostra o botão do grupo e já leva a pessoa para lá.
        if (CFG.formMode === 'greatpages') {
          track('generate_lead', { form_id: formId, interesse });
          if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: `Sertão Negócios · ${interesse}` });
          setTimeout(() => showSuccess(nome, true), 50);
          return;
        }

        const data = Object.fromEntries(new FormData(form).entries());
        delete data.__empresa_site;
        data.whatsapp = data.whatsapp.replace(/\D/g, '');
        data.enviado_em = new Date().toISOString();

        form.classList.add('is-loading');
        form.setAttribute('aria-busy', 'true');
        try {
          await sendLead(data);
          track('generate_lead', { form_id: formId, interesse });
          if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: `Sertão Negócios · ${interesse}` });
          showSuccess(data.nome, !!CFG.redirectUrl);
        } catch (err) {
          console.error(err);
          status.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.';
          track('form_submit_error', { form_id: formId });
        } finally {
          form.classList.remove('is-loading');
          form.removeAttribute('aria-busy');
        }
      });

      function showSuccess(nomeCompleto, redirect) {
        const first = (nomeCompleto || '').trim().split(/\s+/)[0];
        const name = $('[data-success-name]', success);
        if (name) name.textContent = first ? `, ${first}` : '';
        form.hidden = true;
        success.hidden = false;
        success.focus({ preventScroll: true });
        // Sem tela de espera: vai direto para o grupo. O botão fica como garantia se o navegador bloquear.
        if (redirect && CFG.communityUrl) setTimeout(() => goToGroup('automatico', formId), CFG.redirectDelayMs ?? 150);
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
  }

  /* =========================================================
     WHATSAPP FLUTUANTE (dúvidas, patrocínio e estandes)
     ========================================================= */
  function initWhatsApp() {
    const wa = $('[data-wa]');
    if (!wa) return;
    const btn = $('.wa__btn', wa);
    const menu = $('.wa__menu', wa);
    const number = (wa.dataset.waNumber || '').replace(/\D/g, '');
    $$('[data-wa-msg]', wa).forEach((a) => {
      a.href = `https://wa.me/${number}?text=${encodeURIComponent(a.dataset.waMsg)}`;
      a.addEventListener('click', () => {
        track('whatsapp_click', { assunto: a.dataset.waTopic });
        if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: a.dataset.waTopic });
        setOpen(false);
      });
    });
    const setOpen = (open) => {
      menu.hidden = !open;
      wa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) track('whatsapp_open', {});
    };
    btn.addEventListener('click', () => setOpen(menu.hidden));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); } });
    document.addEventListener('click', (e) => { if (!menu.hidden && !wa.contains(e.target)) setOpen(false); });
  }
  // Links diretos para o WhatsApp comercial (ex.: "Quero expor minha empresa")
  $$('[data-wa-direct]').forEach((a) => a.addEventListener('click', () => {
    track('whatsapp_click', { assunto: a.dataset.waDirect });
    if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: a.dataset.waDirect });
  }));

  /* =========================================================
     CHECKOUT (página de vendas)
     ========================================================= */
  function initCheckout() {
    const links = $$('a[data-checkout]');
    if (!links.length) return;
    const params = new URLSearchParams(location.search);
    links.forEach((a) => {
      // Repassa as UTMs da visita para o checkout: a venda fica atribuída à campanha de origem
      try {
        const url = new URL(a.href);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
          const v = params.get(k);
          if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
        });
        a.href = url.toString();
      } catch (_) { /* link inválido: segue como está */ }

      a.addEventListener('click', (e) => {
        const ingresso = a.dataset.checkout;
        const value = Number(a.dataset.price) || undefined;
        track('begin_checkout', { ingresso, cta_location: a.dataset.cta, value, currency: 'BRL' });
        if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout', { content_name: `Ingresso ${ingresso}`, value, currency: 'BRL' });
        // Pequena espera para o Pixel e o GA4 saírem antes de trocar de página (exceto ao abrir em outra aba)
        if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
        e.preventDefault();
        setTimeout(() => { location.href = a.href; }, 250);
      });
    });
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
