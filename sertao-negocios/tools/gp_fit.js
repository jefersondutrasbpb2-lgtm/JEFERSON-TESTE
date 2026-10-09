/* Encaixe automático no GreatPages
   O GreatPages posiciona cada elemento de forma absoluta, com altura fixa, dentro de blocos de altura fixa.
   Este trecho faz cada bloco que contém uma seção do Sertão Negócios ocupar a largura da tela e
   a altura real do conteúdo, e troca "overflow: hidden" das caixas em volta por "clip"
   (que corta igual, mas não quebra o efeito de "ficar parado" no scroll). */
var __snFit = (function () {
  var pending = false;

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
    var done = [], changed = false;
    document.querySelectorAll('.sn').forEach(function (root) {
      var el = absWrapper(root);
      if (!el || done.indexOf(el) > -1) return;
      done.push(el);
      var block = el.offsetParent;
      if (!block || block === document.body) return;

      // Elemento: altura do conteúdo, largura da tela
      el.style.setProperty('height', 'auto', 'important');
      el.style.setProperty('min-height', '0', 'important');
      el.style.setProperty('overflow', 'visible', 'important');
      el.style.setProperty('top', '0', 'important');
      var bl = block.getBoundingClientRect().left;
      el.style.setProperty('left', (-bl) + 'px', 'important');
      el.style.setProperty('width', vw + 'px', 'important');
      el.style.setProperty('max-width', 'none', 'important');

      // Bloco: altura do conteúdo
      var h = el.offsetHeight;
      if (block.offsetHeight !== h) changed = true;
      block.style.setProperty('height', h + 'px', 'important');
      block.style.setProperty('min-height', h + 'px', 'important');
      block.style.setProperty('overflow', 'visible', 'important');

      // Caixas em volta: hidden -> clip (mantém o corte, libera o position: sticky)
      var a = el.parentElement, i = 0;
      while (a && a !== document.body && a !== document.documentElement && i++ < 12) {
        var cs = getComputedStyle(a);
        if (cs.overflowX === 'hidden' || cs.overflowY === 'hidden') a.style.setProperty('overflow', 'clip', 'important');
        a = a.parentElement;
      }
    });
    if (changed && window.ScrollTrigger) {
      clearTimeout(fit._t);
      fit._t = setTimeout(function () { ScrollTrigger.refresh(); }, 120);
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
  }

  return start;
})();
