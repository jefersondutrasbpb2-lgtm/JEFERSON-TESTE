/* Encaixe automático no GreatPages
   O GreatPages posiciona cada elemento de forma absoluta, com altura fixa, dentro de blocos de altura
   fixa, e calcula a altura da página a partir dessas alturas. Este trecho:
   - estica cada elemento com uma seção do Sertão Negócios para a largura da tela e a altura do conteúdo;
   - põe o bloco no fluxo normal da página, com a altura do conteúdo;
   - libera a altura das caixas em volta (a página cresce junto) e troca "overflow: hidden" por "clip"
     (corta igual, mas não quebra o efeito de "ficar parado" no scroll);
   - avisa o scroll suave (Lenis) e o ScrollTrigger quando a altura da página muda. */
var __snFit = (function () {
  var pending = false, lastDocH = 0;

  function imp(el, prop, val) { el.style.setProperty(prop, val, 'important'); }

  function absWrapper(root) {
    var el = root.parentElement, i = 0;
    while (el && el !== document.body && i++ < 10) {
      if (getComputedStyle(el).position === 'absolute') return el;
      el = el.parentElement;
    }
    return null;
  }

  function fit() {
    pending = false;
    var vw = document.documentElement.clientWidth;
    var done = [];
    document.querySelectorAll('.sn').forEach(function (root) {
      var el = absWrapper(root);
      if (!el || done.indexOf(el) > -1) return;
      done.push(el);
      var block = el.offsetParent;
      if (!block || block === document.body || block === document.documentElement) return;

      // Bloco no fluxo normal (o GreatPages pode posicioná-lo de forma absoluta)
      var bcs = getComputedStyle(block);
      if (bcs.position === 'absolute' || bcs.position === 'fixed') {
        imp(block, 'position', 'relative');
        imp(block, 'top', 'auto');
        imp(block, 'bottom', 'auto');
      }
      imp(block, 'overflow', 'visible');
      imp(block, 'max-height', 'none');

      // Elemento: altura do conteúdo, largura da tela
      imp(el, 'height', 'auto');
      imp(el, 'min-height', '0');
      imp(el, 'max-height', 'none');
      imp(el, 'overflow', 'visible');
      imp(el, 'top', '0');
      imp(el, 'bottom', 'auto');
      imp(el, 'left', (-block.getBoundingClientRect().left) + 'px');
      imp(el, 'width', vw + 'px');
      imp(el, 'max-width', 'none');

      // Bloco: altura do conteúdo
      var h = el.offsetHeight;
      imp(block, 'height', h + 'px');
      imp(block, 'min-height', h + 'px');

      // Caixas acima do bloco, até o body: no fluxo normal, com altura livre e corte sem quebrar o sticky
      var a = block.parentElement, i = 0;
      while (a && a !== document.body && a !== document.documentElement && i++ < 12) {
        var cs = getComputedStyle(a);
        if (cs.position === 'absolute' || cs.position === 'fixed') {
          imp(a, 'position', 'relative');
          imp(a, 'top', 'auto');
          imp(a, 'bottom', 'auto');
        }
        imp(a, 'height', 'auto');
        imp(a, 'max-height', 'none');
        if (cs.overflowX === 'hidden' || cs.overflowY === 'hidden') imp(a, 'overflow', 'clip');
        a = a.parentElement;
      }
    });

    // A página mudou de altura: atualiza o scroll suave e as animações de scroll
    var docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    if (docH !== lastDocH) {
      lastDocH = docH;
      clearTimeout(fit._t);
      fit._t = setTimeout(function () {
        if (window.__snLenis) window.__snLenis.resize();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }, 120);
    }
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(fit);
  }

  function start() {
    fit();
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(schedule);
      document.querySelectorAll('.sn').forEach(function (r) { ro.observe(r); });
    }
    // O GreatPages pode recalcular o layout depois de carregar: confere de novo nos primeiros segundos
    var n = 0, iv = setInterval(function () { schedule(); if (++n >= 12) clearInterval(iv); }, 500);
  }

  return start;
})();

/* Modo diagnóstico: abra a página publicada com ?sn-debug=1 no fim do link */
(function () {
  if (!/[?&]sn-debug/.test(location.search)) return;
  function desc(n) {
    if (!n || n === document) return '-';
    var c = (typeof n.className === 'string' && n.className.trim()) ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return n.tagName.toLowerCase() + (n.id ? '#' + n.id.slice(0, 24) : '') + c;
  }
  function report() {
    var L = [], se = document.scrollingElement || document.documentElement;
    var hs = getComputedStyle(document.documentElement), bs = getComputedStyle(document.body);
    L.push('SN debug · ' + location.hostname + location.pathname);
    L.push('tela ' + innerWidth + 'x' + innerHeight + ' · dpr ' + devicePixelRatio + ' · ' + navigator.userAgent.slice(0, 60));
    L.push('pagina: scrollHeight ' + se.scrollHeight + ' · scrollY ' + Math.round(scrollY) + ' · lenis ' + (window.__snLenis ? 'sim (limite ' + Math.round(window.__snLenis.limit) + ')' : 'nao'));
    L.push('html: overflow ' + hs.overflowY + ' altura ' + document.documentElement.offsetHeight + ' · body: overflow ' + bs.overflowY + ' altura ' + document.body.offsetHeight + ' classe "' + document.body.className + '"');
    var ids = {};
    document.querySelectorAll('.sn').forEach(function (r) { if (r.id) ids[r.id] = (ids[r.id] || 0) + 1; });
    var dup = Object.keys(ids).filter(function (k) { return ids[k] > 1; });
    L.push('secoes repetidas: ' + (dup.length ? dup.join(', ') : 'nenhuma'));
    L.push('secoes na ordem do codigo (topo na pagina / altura / visivel):');
    document.querySelectorAll('section.sn, footer.sn').forEach(function (r) {
      var rect = r.getBoundingClientRect(), vis = r.offsetParent !== null && rect.height > 0;
      var el = r.parentElement, chain = [], i = 0;
      while (el && el !== document.body && i++ < 4) { var cs = getComputedStyle(el); chain.push(desc(el) + '[' + cs.position[0] + (cs.display === 'none' ? ',oculto' : '') + ',' + el.offsetHeight + ']'); el = el.parentElement; }
      L.push(' - ' + (r.id || desc(r)) + ': ' + Math.round(rect.top + scrollY) + ' / ' + Math.round(rect.height) + ' / ' + (vis ? 'sim' : 'NAO') + ' | ' + chain.join(' < '));
    });
    return L.join('\n');
  }
  function show() {
    var box = document.getElementById('sn-debug');
    if (!box) {
      box = document.createElement('div');
      box.id = 'sn-debug';
      box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;max-height:55vh;overflow:auto;background:#090c3a;color:#fff;border:2px solid #e02b1b;border-radius:12px;padding:10px;font:11px/1.45 ui-monospace,monospace;white-space:pre-wrap;word-break:break-word';
      var btn = document.createElement('button');
      btn.textContent = 'Copiar diagnostico';
      btn.style.cssText = 'display:block;margin:0 0 8px;padding:8px 12px;border:0;border-radius:999px;background:#e02b1b;color:#fff;font:700 13px system-ui,sans-serif';
      var pre = document.createElement('div');
      box.appendChild(btn); box.appendChild(pre); document.body.appendChild(box);
      btn.addEventListener('click', function () {
        var t = report(); pre.textContent = t;
        try { navigator.clipboard.writeText(t).then(function () { btn.textContent = 'Copiado!'; }, sel); } catch (e) { sel(); }
        function sel() { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Texto selecionado: copie'; }
      });
    }
    box.lastChild.textContent = report();
  }
  window.addEventListener('load', function () { setTimeout(show, 3000); });
  setTimeout(show, 6000);
})();
