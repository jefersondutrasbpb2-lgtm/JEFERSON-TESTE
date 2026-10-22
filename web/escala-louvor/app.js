/*
 * Interface da Escala do Louvor.
 *
 * Telas: Início (visão geral), Escala, Agenda, Disponibilidade, Músicas e Equipe.
 * No celular, barra inferior; no computador, menu lateral. Ajustes não aparece
 * no menu, mas continua no endereço #ajustes. Toda edição abre num painel (que sobe da base no celular);
 * exclusões e mudanças grandes podem ser desfeitas pelo aviso no rodapé. O estado inteiro mora em `state`; cada
 * alteração passa por `mudou()`, que salva no navegador e, quando a página roda
 * no site da igreja (com servidor.js e api.php), também no servidor. A lógica
 * fica em engine.js.
 */
(function () {
  "use strict";

  const E = window.EscalaEngine;
  const D = window.EscalaDados;
  const TELAS = [
    { id: "inicio", nome: "Início", icone: "inicio" },
    { id: "escala", nome: "Escala", icone: "escala" },
    { id: "agenda", nome: "Agenda", icone: "agenda" },
    { id: "disponibilidade", nome: "Disponibilidade", icone: "certo" },
    { id: "musicas", nome: "Músicas", icone: "musica" },
    { id: "equipe", nome: "Equipe", icone: "pessoas" },
    { id: "ajustes", nome: "Ajustes", icone: "ajustes" },
  ];
  const NAV_LATERAL = ["inicio", "escala", "agenda", "disponibilidade", "musicas", "equipe"];
  const NAV_CELULAR = ["inicio", "escala", "agenda", "musicas", "equipe"]; // disponibilidade: botões no Início e na Agenda
  const MOBILE = "(max-width: 759px)";

  let state = null;
  const ui = {
    tela: "inicio", ultimaTela: null, escalaId: null, ordemDe: {}, busca: "", filtro: "todas", coordena: true, resposta: null,
    agendaMes: null, agendaDia: null, agendaModo: "mes", somenteLeitura: false, instalar: null,
  };

  /* ------------------------------------------------------------ util */

  function h(tag, attrs, ...filhos) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "class") el.className = v;
      else if (k === "value") el.value = v;
      else if (k === "checked") el.checked = !!v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const f of filhos.flat(Infinity)) {
      if (f === null || f === undefined || f === false || f === "") continue;
      el.append(f instanceof Node ? f : document.createTextNode(String(f)));
    }
    return el;
  }

  // Ícones Lucide (lucide.dev, licença ISC), só os traços.
  const ICONES = {
    inicio: "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />",
    escala: "<path d=\"M8 2v4\" /><path d=\"M16 2v4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /><path d=\"M3 10h18\" /><path d=\"m9 16 2 2 4-4\" />",
    agenda: "<path d=\"M8 2v4\" /><path d=\"M16 2v4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /><path d=\"M3 10h18\" /><path d=\"M8 14h.01\" /><path d=\"M12 14h.01\" /><path d=\"M16 14h.01\" /><path d=\"M8 18h.01\" /><path d=\"M12 18h.01\" /><path d=\"M16 18h.01\" />",
    musica: "<path d=\"M9 18V5l12-2v13\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><circle cx=\"18\" cy=\"16\" r=\"3\" />",
    pessoas: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /><path d=\"M16 3.13a4 4 0 0 1 0 7.75\" />",
    ajustes: "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />",
    menu: "<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"19\" cy=\"12\" r=\"1\" /><circle cx=\"5\" cy=\"12\" r=\"1\" />",
    mais: "<path d=\"M5 12h14\" /><path d=\"M12 5v14\" />",
    opcoes: "<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"12\" cy=\"5\" r=\"1\" /><circle cx=\"12\" cy=\"19\" r=\"1\" />",
    enviar: "<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\" /><path d=\"m21.854 2.147-10.94 10.939\" />",
    sortear: "<path d=\"m18 14 4 4-4 4\" /><path d=\"m18 2 4 4-4 4\" /><path d=\"M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22\" /><path d=\"M2 6h1.972a4 4 0 0 1 3.6 2.2\" /><path d=\"M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45\" />",
    pino: "<path d=\"M12 17v5\" /><path d=\"M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z\" />",
    fechar: "<path d=\"M18 6 6 18\" /><path d=\"m6 6 12 12\" />",
    cima: "<path d=\"m18 15-6-6-6 6\" />",
    baixo: "<path d=\"m6 9 6 6 6-6\" />",
    esq: "<path d=\"m15 18-6-6 6-6\" />",
    dir: "<path d=\"m9 18 6-6-6-6\" />",
    busca: "<circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" />",
    play: "<circle cx=\"12\" cy=\"12\" r=\"10\" /><polygon points=\"10 8 16 12 10 16 10 8\" />",
    lixo: "<path d=\"M3 6h18\" /><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\" /><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\" /><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\" /><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\" />",
    copiar: "<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />",
    baixar: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /><polyline points=\"7 10 12 15 17 10\" /><line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\" />",
    imprimir: "<path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\" /><path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\" /><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\" />",
    importar: "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" /><path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /><path d=\"M12 12v6\" /><path d=\"m15 15-3-3-3 3\" />",
    ok: "<path d=\"M20 6 9 17l-5-5\" />",
    nota2: "<path d=\"M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z\" /><path d=\"M15 3v4a2 2 0 0 0 2 2h4\" />",
    colar: "<path d=\"M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z\" /><path d=\"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10\" /><path d=\"m17 10 4 4-4 4\" />",
    alerta: "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /><path d=\"M12 9v4\" /><path d=\"M12 17h.01\" />",
    erro: "<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />",
    certo: "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m9 12 2 2 4-4\" />",
    compartilhar: "<circle cx=\"18\" cy=\"5\" r=\"3\" /><circle cx=\"6\" cy=\"12\" r=\"3\" /><circle cx=\"18\" cy=\"19\" r=\"3\" /><line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\" /><line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\" />",
    whatsapp: "<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\" />",
    lista: "<path d=\"M3 12h.01\" /><path d=\"M3 18h.01\" /><path d=\"M3 6h.01\" /><path d=\"M8 12h13\" /><path d=\"M8 18h13\" /><path d=\"M8 6h13\" />",
    grade: "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" /><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />",
    relogio: "<circle cx=\"12\" cy=\"12\" r=\"10\" /><polyline points=\"12 6 12 12 16 14\" />",
    offline: "<path d=\"M12 20h.01\" /><path d=\"M8.5 16.429a5 5 0 0 1 7 0\" /><path d=\"M5 12.859a10 10 0 0 1 5.17-2.69\" /><path d=\"M19 12.859a10 10 0 0 0-2.007-1.523\" /><path d=\"M2 8.82a15 15 0 0 1 4.177-2.643\" /><path d=\"M22 8.82a15 15 0 0 0-11.288-3.764\" /><path d=\"m2 2 20 20\" />",
    nuvem: "<path d=\"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z\" />",
    atualizar: "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /><path d=\"M21 3v5h-5\" /><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /><path d=\"M8 16H3v5\" />",
    sol: "<circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M12 2v2\" /><path d=\"M12 20v2\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"m17.66 17.66 1.41 1.41\" /><path d=\"M2 12h2\" /><path d=\"M20 12h2\" /><path d=\"m6.34 17.66-1.41 1.41\" /><path d=\"m19.07 4.93-1.41 1.41\" />",
    lua: "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\" />",
    auto: "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" />",
    instalar: "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /><path d=\"M12 18h.01\" />",
    igreja: "<path d=\"M10 9h4\" /><path d=\"M12 7v5\" /><path d=\"M14 22v-4a2 2 0 0 0-4 0v4\" /><path d=\"M18 22V5.618a1 1 0 0 0-.553-.894l-4.553-2.277a2 2 0 0 0-1.788 0L6.553 4.724A1 1 0 0 0 6 5.618V22\" /><path d=\"m18 7 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.618a1 1 0 0 1 .553-.894L6 7\" />",
    editar: "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /><path d=\"m15 5 4 4\" />",
    seta: "<path d=\"M5 12h14\" /><path d=\"m12 5 7 7-7 7\" />",
    info: "<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 16v-4\" /><path d=\"M12 8h.01\" />",
    link: "<path d=\"M15 3h6v6\" /><path d=\"M10 14 21 3\" /><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\" />",
    filtro: "<line x1=\"21\" x2=\"14\" y1=\"4\" y2=\"4\" /><line x1=\"10\" x2=\"3\" y1=\"4\" y2=\"4\" /><line x1=\"21\" x2=\"12\" y1=\"12\" y2=\"12\" /><line x1=\"8\" x2=\"3\" y1=\"12\" y2=\"12\" /><line x1=\"21\" x2=\"16\" y1=\"20\" y2=\"20\" /><line x1=\"12\" x2=\"3\" y1=\"20\" y2=\"20\" /><line x1=\"14\" x2=\"14\" y1=\"2\" y2=\"6\" /><line x1=\"8\" x2=\"8\" y1=\"10\" y2=\"14\" /><line x1=\"16\" x2=\"16\" y1=\"18\" y2=\"22\" />",
    livro: "<path d=\"M12 7v14\" /><path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\" />",
    pessoa: "<circle cx=\"12\" cy=\"8\" r=\"5\" /><path d=\"M20 21a8 8 0 0 0-16 0\" />",
    pessoaMais: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\" /><line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\" />",
    calendarioMais: "<path d=\"M8 2v4\" /><path d=\"M16 2v4\" /><path d=\"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8\" /><path d=\"M3 10h18\" /><path d=\"M16 19h6\" /><path d=\"M19 16v6\" />",
    sino: "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" />",
    lixeira: "<path d=\"M3 6h18\" /><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\" /><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\" /><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\" /><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\" />",
    calendario: "<path d=\"M8 2v4\" /><path d=\"M16 2v4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /><path d=\"M3 10h18\" /><path d=\"M8 14h.01\" /><path d=\"M12 14h.01\" /><path d=\"M16 14h.01\" /><path d=\"M8 18h.01\" /><path d=\"M12 18h.01\" /><path d=\"M16 18h.01\" />",
    nota: "<path d=\"M9 18V5l12-2v13\" /><circle cx=\"6\" cy=\"18\" r=\"3\" /><circle cx=\"18\" cy=\"16\" r=\"3\" />",
  };
  function icone(nome) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("class", "i");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = ICONES[nome] || "";
    return s;
  }

  const porId = E.porId;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const hoje = () => E.isoData(new Date());
  const servidor = window.EscalaServidor || null;
  const celular = () => matchMedia(MOBILE).matches;
  const nomeTela = (id) => (TELAS.find((t) => t.id === id) || { nome: "Sua disponibilidade" }).nome;

  function iniciais(nome) {
    const partes = String(nome || "?").trim().split(/\s+/).filter(Boolean);
    return ((partes[0] || "?")[0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
  }
  /** Avatar com iniciais; a cor sai do id, sempre a mesma para a mesma pessoa. */
  function avatar(p, extra) {
    const id = String((p && p.id) || "");
    let n = 0;
    for (const c of id) n = (n * 31 + c.charCodeAt(0)) % 997;
    return h("span", { class: `avatar${extra ? ` ${extra}` : ""}`, "data-cor": String((n % 6) + 1), "aria-hidden": "true" }, iniciais(p && p.nome));
  }

  /* --------------------------------------------------------- tema */

  const CHAVE_TEMA = "escala-louvor:tema";
  function temaSalvo() {
    try { return localStorage.getItem(CHAVE_TEMA) || "auto"; } catch (e) { return "auto"; }
  }
  function aplicarTema(tema) {
    if (tema === "light" || tema === "dark") document.documentElement.dataset.theme = tema;
    else delete document.documentElement.dataset.theme;
    const escuro = tema === "dark" || (tema !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = escuro ? "#0a1626" : "#0B2345";
  }
  aplicarTema(temaSalvo());

  function proximoDomingo() {
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    return E.isoData(d);
  }
  function proximoMes() {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    return E.isoData(d).slice(0, 7);
  }

  /** Aviso no rodapé, com ação opcional (ex.: Desfazer). */
  function avisar(msg, acao) {
    // Sem conexão, a alteração foi recusada: não mostra o "salvo" que a tela pediria logo depois.
    if (ui.somenteLeitura && !(acao && acao.semConexao) && Date.now() - (ui.bloqueouEm || 0) < 100) return;
    const area = document.getElementById("avisos-rodape");
    const el = h("div", { class: "aviso-rodape", role: "status" }, h("span", {}, msg),
      acao ? h("button", { onclick: () => { el.remove(); acao.fazer(); } }, acao.rotulo) : null);
    area.replaceChildren(el);
    setTimeout(() => el.remove(), acao ? 7000 : 3200);
  }

  /** Faz uma alteração que pode ser desfeita pelo aviso do rodapé. */
  function comDesfazer(msg, fn) {
    if (ui.somenteLeitura) return avisarSemConexao();
    const antes = JSON.stringify(state);
    mudou(fn);
    avisar(msg, { rotulo: "Desfazer", fazer: () => { state = JSON.parse(antes); garantirEscalaAtual(); mudou(); } });
  }

  async function copiar(texto, alvo) {
    try {
      await navigator.clipboard.writeText(texto);
      avisar("Copiado. É só colar no WhatsApp.");
    } catch (e) {
      if (alvo) {
        const r = document.createRange();
        r.selectNodeContents(alvo);
        getSelection().removeAllRanges();
        getSelection().addRange(r);
      }
      avisar("Não deu para copiar sozinho. O texto ficou selecionado: use Copiar do aparelho.");
    }
  }

  /* --------------------------------------------------- armazenamento */

  const CHAVE_LOCAL = "escala-louvor:v1";
  const SECOES = ["config", "pessoas", "musicas", "cultos"];
  const ANTIGAS = ["liturgias", "oficiais"]; // de versões anteriores; apagadas depois de migrar
  const armazem = { db: null, user: null, ultimo: {}, antigas: new Set(), timer: null, salvando: false, pendente: false, sujo: false };

  function secao(nome) {
    if (nome === "config") return { versao: state.versao, igreja: state.igreja, funcoes: state.funcoes, tags: state.tags, regras: state.regras, pedido: state.pedido || null };
    return { itens: state[nome] };
  }

  function lerLocal() {
    try {
      const bruto = localStorage.getItem(CHAVE_LOCAL);
      return bruto ? JSON.parse(bruto) : null;
    } catch (e) {
      return null;
    }
  }

  function gravarLocal() {
    try {
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify(state));
    } catch (e) {
      /* navegador sem armazenamento: segue na memória (ou no servidor) */
    }
  }

  async function lerNuvem(db) {
    const s = {};
    const nomes = SECOES.concat(ANTIGAS);
    const docs = await Promise.all(nomes.map((n) => db.doc(`dados/${n}`).get()));
    let achou = false;
    docs.forEach((snap, i) => {
      if (!snap.exists) return;
      achou = true;
      const nome = nomes[i];
      const dados = clone(snap.data());
      if (ANTIGAS.includes(nome)) armazem.antigas.add(nome);
      else armazem.ultimo[nome] = JSON.stringify(snap.data());
      if (nome === "config") Object.assign(s, dados);
      else s[nome] = dados.itens || [];
    });
    const escalas = await db.collection("escalas").get();
    s.escalas = escalas.docs.map((d) => {
      armazem.ultimo[`escala:${d.id}`] = JSON.stringify(d.data());
      return clone(d.data());
    });
    if (escalas.size) achou = true;
    const respostas = await db.collection("respostas").get();
    s.respostas = respostas.docs.map((d) => {
      armazem.ultimo[`resp:${d.id}`] = JSON.stringify(d.data());
      return clone(d.data());
    });
    return achou ? s : null;
  }

  /** Respostas chegam ao vivo: quem responde pelo link aparece na Agenda sem recarregar. */
  function acompanharRespostas() {
    armazem.db.collection("respostas").onSnapshot((snap) => {
      const vindas = snap.docs.map((d) => clone(d.data()));
      for (const d of snap.docs) armazem.ultimo[`resp:${d.id}`] = JSON.stringify(d.data());
      for (const chave of Object.keys(armazem.ultimo)) if (chave.startsWith("resp:") && !snap.docs.some((d) => `resp:${d.id}` === chave)) delete armazem.ultimo[chave];
      if (JSON.stringify(vindas) === JSON.stringify(state.respostas)) return;
      state.respostas = vindas;
      gravarLocal();
      if (!fecharAtual && (ui.tela === "agenda" || ui.tela === "escala")) render();
    }, () => { /* sem atualização ao vivo: as respostas aparecem ao recarregar */ });
  }

  /** Indicador de salvamento: salvando, salvo, sem conexão ou falha. "Salvo" só depois da confirmação do servidor. */
  function mostrarSalvo(estado, texto) {
    const el = document.getElementById("salvo");
    el.dataset.estado = estado;
    el.lastChild.textContent = texto;
    el.title = { ok: "Tudo salvo", salvando: "Enviando as alterações", offline: "Sem conexão: as alterações ficam guardadas neste aparelho e vão quando a internet voltar", erro: "O servidor não confirmou a gravação" }[estado] || "";
  }

  function avisarSemConexao() {
    ui.bloqueouEm = Date.now();
    avisar("Sem conexão com o servidor: não dá para alterar agora.", { rotulo: "Tentar de novo", fazer: () => location.reload(), semConexao: true });
  }

  function salvar() {
    gravarLocal();
    if (!armazem.db) return mostrarSalvo("ok", "Salvo neste aparelho");
    armazem.sujo = true;
    if (!navigator.onLine) return mostrarSalvo("offline", "Sem conexão");
    mostrarSalvo("salvando", "Salvando…");
    clearTimeout(armazem.timer);
    armazem.timer = setTimeout(salvarNuvem, 600);
  }

  async function salvarNuvem() {
    if (armazem.salvando) {
      armazem.pendente = true;
      return;
    }
    armazem.salvando = true;
    try {
      for (const nome of SECOES) {
        const json = JSON.stringify(secao(nome));
        if (armazem.ultimo[nome] === json) continue;
        await armazem.db.doc(`dados/${nome}`).set(JSON.parse(json));
        armazem.ultimo[nome] = json;
      }
      const vivas = new Set();
      for (const esc of state.escalas) {
        vivas.add(esc.id);
        const json = JSON.stringify(esc);
        if (armazem.ultimo[`escala:${esc.id}`] === json) continue;
        await armazem.db.collection("escalas").doc(esc.id).set(JSON.parse(json));
        armazem.ultimo[`escala:${esc.id}`] = json;
      }
      for (const chave of Object.keys(armazem.ultimo)) {
        if (!chave.startsWith("escala:") || vivas.has(chave.slice(7))) continue;
        await armazem.db.collection("escalas").doc(chave.slice(7)).delete();
        delete armazem.ultimo[chave];
      }
      const respostasVivas = new Set();
      for (const r of state.respostas || []) {
        respostasVivas.add(r.id);
        const json = JSON.stringify(r);
        if (armazem.ultimo[`resp:${r.id}`] === json) continue;
        await armazem.db.collection("respostas").doc(r.id).set(JSON.parse(json));
        armazem.ultimo[`resp:${r.id}`] = json;
      }
      for (const chave of Object.keys(armazem.ultimo)) {
        if (!chave.startsWith("resp:") || respostasVivas.has(chave.slice(5))) continue;
        await armazem.db.collection("respostas").doc(chave.slice(5)).delete();
        delete armazem.ultimo[chave];
      }
      for (const nome of [...armazem.antigas]) {
        await armazem.db.doc(`dados/${nome}`).delete();
        armazem.antigas.delete(nome);
      }
      armazem.sujo = armazem.pendente;
      mostrarSalvo("ok", "Salvo");
    } catch (e) {
      armazem.sujo = true;
      const semRede = !navigator.onLine || e instanceof TypeError;
      if (semRede) {
        mostrarSalvo("offline", "Sem conexão");
        return;
      }
      const msg = {
        quota_exceeded: "O espaço de dados acabou. Exclua escalas antigas.",
        invalid_argument: "Uma parte dos dados ficou grande demais para salvar.",
        origem: "O servidor recusou a gravação. Recarregue a página e tente de novo.",
      }[e && e.code] || "Não consegui salvar no servidor agora. Tento de novo na próxima alteração.";
      mostrarSalvo("erro", "Falha ao salvar");
      avisar(msg);
    } finally {
      armazem.salvando = false;
      if (armazem.pendente) {
        armazem.pendente = false;
        salvarNuvem();
      }
    }
  }

  /** Aplica uma alteração, mantém os cultos ligados em dia, salva e redesenha. */
  function mudou(fn, redesenhar) {
    if (ui.somenteLeitura && fn) return avisarSemConexao();
    if (fn) fn();
    for (const e of state.escalas) E.sincronizarEscala(e);
    salvar();
    if (redesenhar !== false) render();
  }

  async function iniciar() {
    const salvoLocal = lerLocal();
    if (servidor) {
      armazem.db = servidor.db;
      armazem.user = servidor.user;
    }
    let remoto = null;
    if (armazem.db) {
      try {
        remoto = await lerNuvem(armazem.db);
      } catch (e) {
        // Sem o servidor, mostra a última cópia deste aparelho, mas não deixa editar:
        // assim nada salvo aqui some quando o servidor voltar.
        armazem.db = null;
        ui.somenteLeitura = !!salvoLocal;
        if (!salvoLocal) avisar("Não consegui abrir os dados do servidor.");
      }
    }
    const base = D.configuracaoBase();
    if (remoto) state = E.migrar(remoto, base, D.repertorio());
    else if (salvoLocal) state = E.migrar(salvoLocal, base, D.repertorio());
    else state = estadoInicial();
    // Sem permissão de editar, a pessoa só vê a tela de disponibilidade (no site, todos editam).
    if (armazem.db && armazem.user) {
      try { ui.coordena = await armazem.user.canEdit(); } catch (e) { ui.coordena = false; }
    }
    const hash = location.hash.slice(1);
    if (TELAS.some((t) => t.id === hash)) ui.tela = hash;
    if (!ui.coordena || hash === "disponibilidade") ui.tela = "disponibilidade";
    garantirEscalaAtual();
    if (ui.somenteLeitura) mostrarSalvo("offline", "Sem conexão");
    else if (ui.coordena) salvar(); // grava a migração (ou os dados iniciais) e leva para o servidor o que estava só no aparelho
    else mostrarSalvo("ok", armazem.db ? "Conectado" : "Neste aparelho");
    if (armazem.db) acompanharRespostas();
    vigiarConexao();
    render();
    registrarApp();
  }

  /** Sem internet: avisa no indicador; quando volta, envia o que ficou pendente. */
  function vigiarConexao() {
    const topo = document.getElementById("topo");
    addEventListener("scroll", () => topo.classList.toggle("rolou", window.scrollY > 4), { passive: true });
    // Links internos (#escala, logo → #inicio) e voltar do navegador trocam de tela.
    addEventListener("hashchange", () => {
      const alvo = location.hash.slice(1);
      if (alvo !== ui.tela && (TELAS.some((t) => t.id === alvo) || alvo === "disponibilidade")) {
        if (fecharAtual) fecharAtual(true);
        ui.tela = alvo;
        render();
      }
    });
    addEventListener("offline", () => { if (armazem.db) mostrarSalvo("offline", "Sem conexão"); });
    addEventListener("online", () => {
      if (ui.somenteLeitura) return avisar("A conexão voltou.", { rotulo: "Recarregar", fazer: () => location.reload() });
      if (armazem.db && armazem.sujo) { mostrarSalvo("salvando", "Salvando…"); salvarNuvem(); }
      else if (armazem.db) mostrarSalvo("ok", "Salvo");
    });
    addEventListener("beforeunload", (e) => {
      if (armazem.db && armazem.sujo) { e.preventDefault(); e.returnValue = ""; }
    });
  }

  /** PWA: service worker (só no site) e convite de instalação. */
  function registrarApp() {
    addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); ui.instalar = e; if (ui.tela === "ajustes") render(); });
    if (!servidor || !("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    let pediuAtualizar = false;
    navigator.serviceWorker.register("sw.js").then((reg) => {
      const oferecer = (sw) => avisar("Há uma versão nova do app.", { rotulo: "Atualizar", fazer: () => { pediuAtualizar = true; sw.postMessage("ativar"); } });
      if (reg.waiting && navigator.serviceWorker.controller) oferecer(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const novo = reg.installing;
        if (!novo) return;
        novo.addEventListener("statechange", () => { if (novo.state === "installed" && navigator.serviceWorker.controller) oferecer(novo); });
      });
    }).catch(() => { /* sem service worker: o app funciona igual, só não instala */ });
    // Só recarrega quando a pessoa pediu a versão nova (na primeira visita o service worker assume sem recarregar).
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (pediuAtualizar) { pediuAtualizar = false; location.reload(); } });
  }

  function estadoInicial() {
    const s = D.estadoInicial();
    const inicio = proximoDomingo();
    s.escalas.push(E.gerarEscala(s, { inicio, fim: E.somarDias(inicio, 13), tipo: "quinzenal", seed: 1 }));
    return s;
  }

  function escalasOrdenadas() {
    return [...state.escalas].sort((a, b) => b.inicio.localeCompare(a.inicio));
  }

  const CHAVE_ABERTA = "escala-louvor:aberta";

  /** Lembra, só neste aparelho, qual escala estava aberta. */
  function lembrarAberta() {
    try { localStorage.setItem(CHAVE_ABERTA, ui.escalaId || ""); } catch (e) { /* sem armazenamento */ }
  }

  function garantirEscalaAtual() {
    if (!ui.escalaId) {
      try { ui.escalaId = localStorage.getItem(CHAVE_ABERTA) || null; } catch (e) { /* sem armazenamento */ }
    }
    if (porId(state.escalas, ui.escalaId)) return;
    // Mostra a escala em vigor (ou a próxima); se não houver, a mais recente.
    const lista = [...state.escalas].sort((a, b) => a.inicio.localeCompare(b.inicio));
    const atual = lista.find((e) => e.fim >= hoje()) || lista[lista.length - 1];
    ui.escalaId = atual ? atual.id : null;
  }

  /* ---------------------------------------------------------- moldura */

  function irPara(tela) {
    ui.tela = tela;
    try { history.replaceState(null, "", `#${tela}`); } catch (e) { /* sem histórico */ }
    render();
  }

  function render() {
    const semNav = ui.tela === "disponibilidade";
    document.body.classList.toggle("sem-nav", semNav);
    const inferior = document.getElementById("nav-inferior");
    inferior.hidden = semNav;
    const atual = (id) => (ui.tela === id ? "page" : null);
    const tela = (id) => TELAS.find((t) => t.id === id);
    document.getElementById("nav-lateral").replaceChildren(...NAV_LATERAL.map(tela).map((t) => h("button", { "aria-current": atual(t.id), onclick: () => irPara(t.id) }, icone(t.icone), t.nome)));
    inferior.replaceChildren(...NAV_CELULAR.map(tela).map((t) => h("button", { "aria-current": atual(t.id), onclick: () => irPara(t.id) }, h("span", { class: "pilula" }, icone(t.icone)), t.nome)));
    const igreja = (state.igreja && state.igreja.nome) || "";
    document.getElementById("nome-igreja").textContent = igreja;
    document.getElementById("nome-igreja-lateral").textContent = igreja;
    document.getElementById("hoje-lateral").textContent = E.formatarData(hoje(), "longa");
    document.getElementById("topo-titulo").replaceChildren(h("b", {}, nomeTela(ui.tela)), igreja ? ` · ${igreja}` : "");
    document.title = `${nomeTela(ui.tela)} · Escala do Louvor`;
    const telas = { inicio: telaInicio, escala: telaEscala, agenda: telaAgenda, disponibilidade: telaDisponibilidade, musicas: telaMusicas, equipe: telaEquipe, ajustes: telaAjustes };
    lembrarAberta();
    const novaTela = ui.ultimaTela !== ui.tela;
    ui.ultimaTela = ui.tela;
    const y = window.scrollY;
    const conteudo = telas[ui.tela]();
    if (novaTela) conteudo.classList.add("entra");
    if (ui.somenteLeitura && !semNav) conteudo.prepend(h("div", { class: "faixa alerta", role: "status" }, icone("offline"),
      h("span", {}, "Sem conexão com o servidor. Você está vendo a última cópia salva neste aparelho; as alterações ficam bloqueadas até a conexão voltar."),
      h("button", { class: "btn", onclick: () => location.reload() }, icone("atualizar"), "Tentar de novo")));
    document.getElementById("app").replaceChildren(conteudo);
    window.scrollTo({ top: novaTela ? 0 : y });
  }

  /* ----------------------------------------------------------- painel */

  let fecharAtual = null;

  /** Painel modal: sobe da base no celular, centralizado no computador. */
  function painel({ titulo, sub, corpo, rodape, foco }) {
    if (fecharAtual) fecharAtual(true);
    const camada = document.getElementById("camada");
    const anterior = document.activeElement;
    const fechar = (semFoco) => {
      camada.replaceChildren();
      document.removeEventListener("keydown", tecla);
      fecharAtual = null;
      if (!semFoco && anterior && anterior.isConnected) anterior.focus();
    };
    const tecla = (e) => { if (e.key === "Escape") fechar(); };
    document.addEventListener("keydown", tecla);
    const caixa = h("section", { class: "painel", role: "dialog", "aria-modal": "true", "aria-labelledby": "painel-titulo" },
      h("div", {},
        h("div", { class: "alca", "aria-hidden": "true" }),
        h("header", {},
          h("div", {}, h("h2", { id: "painel-titulo" }, titulo), sub ? h("p", {}, sub) : null),
          h("button", { class: "btn icone", "aria-label": "Fechar", onclick: () => fechar() }, icone("fechar")))),
      h("div", { class: "corpo" }, corpo),
      rodape ? h("footer", {}, rodape(fechar)) : null);
    const veu = h("div", { class: "veu", onclick: (e) => { if (e.target === veu) fechar(); } }, caixa);
    camada.replaceChildren(veu);
    fecharAtual = fechar;
    // No celular, não abre o teclado sozinho: o foco vai para um botão.
    const alvo = foco ? caixa.querySelector(foco) : null;
    const usar = alvo && !(celular() && /^(INPUT|TEXTAREA)$/.test(alvo.tagName));
    (usar ? alvo : caixa.querySelector("header .btn")).focus();
    return fechar;
  }

  /** Lista de escolha com busca. Cada opção: { id, rotulo, direita, meta, busca }. */
  function escolher({ titulo, sub, topo, grupos, atual, vazio, aoEscolher, buscar }) {
    const campo = h("input", { type: "search", id: "busca-opcao", placeholder: "Buscar", "aria-label": "Buscar" });
    const lista = h("div", { class: "opcoes", role: "listbox", "aria-label": titulo });
    let fechar = null;
    const desenhar = () => {
      const q = E.normalizar(campo.value);
      const blocos = [];
      for (const g of grupos) {
        const itens = g.itens.filter((o) => !q || E.normalizar(o.busca || o.rotulo).includes(q));
        if (!itens.length) continue;
        if (g.titulo) blocos.push(h("div", { class: "grupo" }, g.titulo));
        for (const o of itens) {
          blocos.push(h("button", { class: "opcao", role: "option", "aria-selected": String(o.id === atual), "aria-current": String(o.id === atual), onclick: () => { fechar(); aoEscolher(o.id); } },
            h("b", {}, o.rotulo), h("span", { class: "small muted" }, o.direita || ""), o.meta ? h("span", { class: "meta" }, o.meta) : null));
        }
      }
      if (vazio) blocos.push(h("button", { class: "opcao", onclick: () => { fechar(); aoEscolher(null); } }, h("b", { class: "muted" }, vazio), h("span")));
      if (!blocos.length) blocos.push(h("p", { class: "muted small", style: "padding:12px" }, "Nada encontrado."));
      lista.replaceChildren(...blocos);
    };
    campo.addEventListener("input", desenhar);
    desenhar();
    fechar = painel({ titulo, sub, corpo: [topo, buscar ? h("div", { class: "busca" }, icone("busca"), campo) : null, lista], foco: buscar ? "#busca-opcao" : ".opcao" });
  }

  /* ---------------------------------------------------------- início */

  /** Cultos de hoje em diante, de todas as escalas, em ordem. */
  function proximosCultos() {
    const lista = [];
    for (const e of state.escalas) for (const c of e.cultos) if (c.data >= hoje()) lista.push({ escala: e, culto: c });
    return lista.sort((a, b) => `${a.culto.data}${a.culto.hora || ""}`.localeCompare(`${b.culto.data}${b.culto.hora || ""}`));
  }

  function integrantesDe(escala) {
    const ids = new Set();
    for (const c of escala.cultos) for (const v of c.equipe || []) if (v.pessoaId) ids.add(v.pessoaId);
    return [...ids].map((id) => porId(state.pessoas, id)).filter(Boolean);
  }

  function vigencia(escala) {
    if (escala.inicio <= hoje() && escala.fim >= hoje()) return "Em vigor";
    return escala.inicio > hoje() ? "Próxima escala" : "Encerrada";
  }

  function abrirCulto(escala, cultoId) {
    ui.escalaId = escala.id;
    irPara("escala");
    setTimeout(() => irParaCulto(cultoId), 80);
  }

  function quandoFalta(iso) {
    const dias = Math.round((E.parseData(iso) - E.parseData(hoje())) / 86400000);
    return dias === 0 ? "Hoje" : dias === 1 ? "Amanhã" : `Em ${dias} dias`;
  }

  function telaInicio() {
    const escala = porId(state.escalas, ui.escalaId);
    const igreja = (state.igreja && state.igreja.nome) || "";
    const cab = h("div", { class: "cabecalho" },
      h("div", {}, h("h1", {}, "Visão geral"), h("p", { class: "muted" }, `${E.formatarData(hoje(), "longa")}${igreja ? ` · ${igreja}` : ""}`)),
      h("div", { class: "acoes" },
        h("button", { class: "btn tonal", onclick: () => irPara("disponibilidade") }, icone("certo"), "Minha disponibilidade"),
        h("button", { class: "btn", onclick: novaEscala }, icone("calendarioMais"), "Nova escala")));
    if (!escala) {
      return h("div", { class: "tela" }, cab,
        h("div", { class: "vazio" }, h("span", { class: "icone-vazio" }, icone("escala")),
          h("h2", {}, "Nenhuma escala ainda"),
          h("p", {}, "Escolha o período e o app distribui a equipe e as músicas de cada culto, seguindo a orientação do pastor para os cultos solenes."),
          h("button", { class: "btn primario", onclick: novaEscala }, icone("mais"), "Criar a primeira escala")));
    }
    const avisos = E.validarEscala(state, escala).sort((a, b) => (a.nivel === "erro" ? 0 : 1) - (b.nivel === "erro" ? 0 : 1));
    const erros = avisos.filter((a) => a.nivel === "erro").length;
    const integrantes = integrantesDe(escala);
    const cards = [cartaoProximo(), cartaoVigente(escala, erros, integrantes), cartaoPendencias(escala, avisos), cartaoDisponibilidade(), cartaoRepertorio()];
    return h("div", { class: "tela" }, cab, h("div", { class: "painel-inicio" }, cards));
  }

  function cartaoProximo() {
    const prox = proximosCultos()[0];
    if (!prox) {
      return h("section", { class: "cartao largo-2" }, h("div", { class: "cartao-cab" }, h("h2", {}, icone("relogio"), "Próximo culto")),
        h("div", { class: "secao" }, h("p", { class: "muted" }, "Nenhum culto programado nas escalas. Crie a escala do próximo período."),
          h("button", { class: "btn primario", style: "justify-self:start", onclick: novaEscala }, icone("mais"), "Nova escala")));
    }
    const { escala } = prox;
    const base = E.liderDe(escala, prox.culto) || prox.culto;
    const grupo = [base, ...escala.cultos.filter((c) => E.liderDe(escala, c) === base)];
    const d = E.parseData(base.data);
    const equipe = E.equipePorFuncao(base).map((g) => h("div", { class: "funcao" },
      h("span", {}, E.nomeFuncao(state, g.funcao)),
      h("div", { class: "chips" }, g.vagas.map((v) => {
        const p = porId(state.pessoas, v.pessoaId);
        return h("span", { class: `pessoa leitura${p ? "" : " vazia"}` }, p ? [avatar(p), p.nome] : "a definir");
      }))));
    const musicas = base.musicas.map((v) => {
      const m = porId(state.musicas, v.id);
      return h("li", { class: "item" }, h("span", { class: `marcador ${v.tipo === "hino" ? "hino" : "louvor"}`, style: "min-width:40px;height:32px" }, v.tipo === "hino" ? (m && m.numero ? m.numero : "SH") : icone("musica")),
        h("span", {}, h("span", { class: "t" }, m ? (m.titulo || `Salmos e Hinos nº ${m.numero}`) : `${E.nomeTipo(v.tipo)} a definir`), m && m.tom ? h("span", { class: "s" }, ` · tom ${m.tom}`) : null), h("span"));
    });
    return h("section", { class: "cartao largo-2" },
      h("div", { class: "destaque-culto" },
        h("div", { class: "data-grande" },
          h("div", { class: "calendario-mini", "aria-hidden": "true" }, h("span", {}, E.MESES[d.getMonth()].slice(0, 3)), h("b", {}, String(d.getDate()))),
          h("div", { style: "min-width:0" },
            h("span", { class: "rotulo" }, `Próximo culto · ${quandoFalta(base.data)}`),
            h("h2", {}, grupo.map((x) => x.nome).filter((n, i, a) => a.indexOf(n) === i).join(" · ")),
            h("p", { class: "quando" }, `${E.DIAS[d.getDay()]} · `, grupo.flatMap((x, i) => [i ? " e " : "", h("b", {}, x.hora)])))),
        base.solene ? h("div", { class: "selos" }, h("span", { class: "selo solene" }, "Culto solene")) : null,
        h("div", { class: "destaque-corpo" },
          equipe.length ? h("div", { style: "display:grid;gap:8px" }, h("span", { class: "rotulo" }, "Equipe"), h("div", { class: "funcoes" }, equipe)) : null,
          musicas.length ? h("div", { style: "display:grid;gap:4px" }, h("span", { class: "rotulo" }, "Repertório"), h("ul", { class: "lista-compacta", style: "padding:0" }, musicas)) : null)),
      h("div", { class: "rodape-cartao" },
        h("button", { class: "btn primario", onclick: () => abrirCulto(escala, base.id) }, "Abrir na escala", icone("seta"))));
  }

  function cartaoVigente(escala, erros, integrantes) {
    return h("section", { class: "cartao" },
      h("div", { class: "cartao-cab" }, h("h2", {}, icone("escala"), vigencia(escala)),
        h("span", { class: `selo ${escala.status === "confirmada" ? "ok" : "neutro"}` }, escala.status === "confirmada" ? "Confirmada" : "Rascunho")),
      h("div", { class: "secao", style: "gap:6px" },
        h("b", { style: "font-family:var(--f-titulo);font-size:var(--t-xl);letter-spacing:-0.02em" }, E.formatarPeriodo(escala.inicio, escala.fim)),
        integrantes.length ? h("div", { class: "avatares", "aria-label": `${integrantes.length} integrantes` }, integrantes.slice(0, 8).map((p) => avatar(p)),
          integrantes.length > 8 ? h("span", { class: "small muted", style: "margin-left:8px" }, `+${integrantes.length - 8}`) : null) : null),
      h("div", { class: "dados", style: "border-radius:0" },
        h("div", {}, h("b", {}, String(escala.cultos.length)), h("span", {}, escala.cultos.length === 1 ? "culto" : "cultos")),
        h("div", {}, h("b", {}, String(integrantes.length)), h("span", {}, "integrantes")),
        h("div", { class: erros ? "erro" : "ok" }, h("b", {}, String(erros)), h("span", {}, erros === 1 ? "pendência" : "pendências"))),
      h("div", { class: "rodape-cartao" },
        h("button", { class: "btn zap", style: "flex:1 1 auto", onclick: () => enviarWhatsApp(escala) }, icone("whatsapp"), "Enviar no WhatsApp"),
        h("button", { class: "btn", onclick: () => irPara("escala") }, "Ver escala")));
  }

  function cartaoPendencias(escala, avisos) {
    const itens = avisos.slice(0, 5).map((a) => {
      const c = escala.cultos[a.ci];
      return h("li", {}, h("button", { onclick: () => abrirCulto(escala, (E.liderDe(escala, c) || c).id) },
        h("span", { class: `ponto ${a.nivel}`, "aria-hidden": "true" }),
        h("span", {}, h("span", { class: "t" }, a.msg), h("br"), h("span", { class: "s" }, `${E.formatarData(c.data, "dia")} · ${c.nome}`)),
        icone("dir")));
    });
    return h("section", { class: "cartao" },
      h("div", { class: "cartao-cab" }, h("h2", {}, icone("alerta"), "Pendências"), avisos.length ? h("span", { class: `selo ${avisos.some((a) => a.nivel === "erro") ? "erro" : "alerta"}` }, String(avisos.length)) : null),
      avisos.length
        ? [h("ul", { class: "lista-compacta", style: "padding-top:8px" }, itens), avisos.length > 5 ? h("div", { class: "rodape-cartao" }, h("button", { class: "btn texto", onclick: () => verAvisos(escala, avisos) }, `Ver todas (${avisos.length})`)) : null]
        : h("div", { class: "secao" }, h("p", { style: "display:flex;gap:8px;align-items:center;color:var(--ok);font-weight:600" }, icone("certo"), "Tudo certo nesta escala."), h("p", { class: "small muted" }, "Todas as funções e músicas estão definidas e seguem as regras.")));
  }

  function cartaoDisponibilidade() {
    const periodo = pedidoAtual();
    const dias = E.diasDeCulto(state, periodo.inicio, periodo.fim);
    const ativas = state.pessoas.filter((p) => p.ativo !== false);
    const resp = ativas.filter((p) => (state.respostas || []).some((r) => r.id === E.idResposta(p.id, periodo.inicio))).length;
    const pct = ativas.length ? Math.round((resp / ativas.length) * 100) : 0;
    return h("section", { class: "cartao" },
      h("div", { class: "cartao-cab" }, h("h2", {}, icone("agenda"), "Disponibilidade")),
      h("div", { class: "secao" },
        h("p", { class: "small muted" }, `Pedido de ${E.formatarPeriodo(periodo.inicio, periodo.fim)}`),
        h("div", { class: "progresso", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": ativas.length, "aria-valuenow": resp, "aria-label": "Respostas" },
          h("div", { class: "barra" }, h("span", { style: `width:${pct}%` })),
          h("span", { class: "small" }, h("b", {}, `${resp} de ${ativas.length}`), " responderam"))),
      h("div", { class: "rodape-cartao" },
        h("button", { class: "btn primario", onclick: () => irPara("disponibilidade") }, icone("certo"), "Marcar minha disponibilidade"),
        h("button", { class: "btn tonal", onclick: () => pedirNoWhatsApp(periodo, dias) }, icone("enviar"), "Pedir no WhatsApp"),
        h("button", { class: "btn texto", onclick: () => irPara("agenda") }, "Ver agenda")));
  }

  function cartaoRepertorio() {
    const ativas = state.musicas.filter((m) => m.ativo !== false);
    const ir = (filtro) => { ui.filtro = filtro; ui.busca = ""; irPara("musicas"); };
    const campo = h("input", { type: "search", placeholder: "Buscar música", "aria-label": "Buscar música no repertório",
      onkeydown: (e) => { if (e.key === "Enter") { ui.busca = e.target.value; ui.filtro = "todas"; irPara("musicas"); } } });
    return h("section", { class: "cartao" },
      h("div", { class: "cartao-cab" }, h("h2", {}, icone("musica"), "Repertório")),
      h("div", { class: "numeros" },
        h("button", { onclick: () => ir("hino") }, h("b", {}, String(ativas.filter((m) => m.tipo === "hino").length)), h("span", {}, "Salmos e Hinos")),
        h("button", { onclick: () => ir("louvor") }, h("b", {}, String(ativas.filter((m) => m.tipo === "louvor").length)), h("span", {}, "Louvores")),
        h("button", { onclick: () => ir("solene") }, h("b", {}, String(ativas.filter((m) => E.aptaSolene(state, m)).length)), h("span", {}, "Aptas ao solene"))),
      h("div", { style: "padding:0 var(--e-4) var(--e-4)" }, h("div", { class: "busca" }, icone("busca"), campo)));
  }

  /* ---------------------------------------------------------- escala */

  function telaEscala() {
    const escala = porId(state.escalas, ui.escalaId);
    if (!escala) {
      return h("div", { class: "tela" },
        h("div", { class: "cabecalho" }, h("div", {}, h("h1", {}, "Escala"))),
        h("div", { class: "vazio" }, h("span", { class: "icone-vazio" }, icone("escala")),
          h("h2", {}, "Nenhuma escala ainda"),
          h("p", {}, "Escolha o período e a ferramenta distribui a equipe e as músicas de cada culto, seguindo a orientação do pastor para os cultos solenes."),
          h("button", { class: "btn primario", onclick: novaEscala }, icone("mais"), "Criar escala")));
    }
    const avisos = E.validarEscala(state, escala);
    const porCampo = {};
    for (const a of avisos) {
      const k = `${a.ci}|${a.campo}`;
      if (!porCampo[k] || a.nivel === "erro") porCampo[k] = a;
    }
    const erros = avisos.filter((a) => a.nivel === "erro").length;
    const alertas = avisos.length - erros;
    const estado = erros
      ? h("button", { class: "btn", onclick: () => verAvisos(escala, avisos) }, h("span", { class: "selo erro" }, String(erros)), erros > 1 ? "pendências" : "pendência")
      : alertas
        ? h("button", { class: "btn", onclick: () => verAvisos(escala, avisos) }, h("span", { class: "selo alerta" }, String(alertas)), alertas > 1 ? "alertas" : "alerta")
        : h("span", { class: "selo ok", style: "min-height:32px;padding:0 12px" }, icone("certo"), "Tudo certo");
    const ordem = [...state.escalas].sort((a, b) => a.inicio.localeCompare(b.inicio));
    const pos = ordem.indexOf(escala);
    const vizinha = (passo) => ordem[pos + passo];
    const seta = (passo, nomeIcone, texto) => {
      const v = vizinha(passo);
      return h("button", { class: "btn icone", disabled: !v || null, "aria-label": v ? `${texto}: ${E.formatarPeriodo(v.inicio, v.fim)}` : `Sem ${texto.toLowerCase()}`, onclick: () => { ui.escalaId = v.id; render(); } }, icone(nomeIcone));
    };
    const integrantes = integrantesDe(escala);

    // Um cartão por culto; cultos ligados (ex.: domingo 9h e 18h) dividem o mesmo cartão.
    const dias = [];
    escala.cultos.forEach((c, ci) => {
      if (E.liderDe(escala, c)) return;
      let d = dias.find((x) => x.data === c.data);
      if (!d) dias.push((d = { data: c.data, cultos: [] }));
      d.cultos.push(ci);
    });

    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" }, h("div", {}, h("h1", {}, "Escala"), h("p", { class: "muted" }, "Toque numa pessoa ou música para trocar; use + Pessoa e + Música para acrescentar.")),
        h("button", { class: "btn", onclick: novaEscala }, icone("calendarioMais"), "Nova escala")),
      h("section", { class: "cartao" },
        h("div", { class: "seletor-escala" },
          seta(-1, "esq", "Escala anterior"),
          h("button", { class: "periodo", onclick: trocarEscala, "aria-label": `Escala de ${E.formatarPeriodo(escala.inicio, escala.fim)}. Trocar ou criar outra` },
            h("span", { class: "linha-status" }, h("span", { class: "rotulo" }, vigencia(escala)),
              h("span", { class: `selo ${escala.status === "confirmada" ? "ok" : "neutro"}` }, escala.status === "confirmada" ? "Confirmada" : "Rascunho")),
            h("b", {}, E.formatarPeriodo(escala.inicio, escala.fim), icone("baixo")),
            h("span", { class: "small muted num" }, `${escala.cultos.length} ${escala.cultos.length === 1 ? "culto" : "cultos"} · ${dias.length} ${dias.length === 1 ? "dia" : "dias"} · ${integrantes.length} integrantes`)),
          seta(1, "dir", "Próxima escala"),
          h("button", { class: "btn icone", "aria-label": "Mais opções da escala", onclick: () => opcoesEscala(escala) }, icone("opcoes"))),
        h("div", { class: "resumo" },
          h("button", { class: "btn zap", onclick: () => enviarWhatsApp(escala) }, icone("whatsapp"), "Enviar no WhatsApp"),
          estado)),
      h("div", { class: "dias" }, dias.map((d) => {
        const [semana, resto] = E.formatarData(d.data, "longa").split(", ");
        return h("section", { class: "dia", "aria-label": E.formatarData(d.data, "longa") },
          h("h2", {}, h("span", {}, h("b", {}, semana), resto ? `, ${resto}` : ""), d.data === hoje() ? h("span", { class: "selo azul" }, "Hoje") : null),
          h("div", { class: `cultos-do-dia${d.cultos.length > 1 ? " dois" : ""}` }, d.cultos.map((ci) => cartaoCulto(escala, ci, porCampo))));
      })));
  }

  function cartaoCulto(escala, ci, porCampo) {
    const culto = escala.cultos[ci];
    const seguidores = escala.cultos.filter((c) => E.liderDe(escala, c) === culto);
    const grupo = [culto, ...seguidores];
    const aviso = (campo) => porCampo[`${ci}|${campo}`];
    const fixo = new Set(culto.travados || []);

    // Qual lista de músicas está à mostra (num cartão com dois horários).
    const mostrado = porId(grupo, ui.ordemDe[culto.id]) || culto;
    const ehSeguidor = mostrado !== culto;
    const mci = escala.cultos.indexOf(mostrado);

    const equipe = E.equipePorFuncao(culto).map((g) => h("div", { class: "funcao" },
      h("span", {}, E.nomeFuncao(state, g.funcao)),
      h("div", { class: "chips" }, g.vagas.map((v) => {
        const p = porId(state.pessoas, v.pessoaId);
        const a = aviso(`e:${v.si}`);
        return h("button", {
          class: `pessoa${p ? "" : " vazia"}`, "data-nivel": a ? a.nivel : null, title: a ? a.msg : null,
          "aria-label": `${E.nomeFuncao(state, g.funcao)}: ${p ? p.nome : "a definir"}${a ? `. ${a.msg}` : ""}`,
          onclick: () => escolherPessoa(escala, ci, v.si),
        }, p ? avatar(p) : null, p ? p.nome : "a definir", fixo.has(`e:${v.si}`) ? icone("pino") : null);
      }))));

    const musicas = mostrado.musicas.map((vaga, k) => {
      const m = porId(state.musicas, vaga.id);
      const a = ehSeguidor ? null : aviso(`m:${k}`);
      const tags = m ? (m.tags || []).filter((t) => ["trinitario", "cristocentrico", "doutrinario"].includes(t)).map((t) => E.nomeTag(state, t)).join(" · ") : "";
      const nome = m ? E.rotuloMusica(m) : "música";
      return h("li", {},
        h("button", {
          class: `musica${m ? "" : " vazia"}`, "data-nivel": a ? a.nivel : null, title: a ? a.msg : null,
          onclick: () => (ehSeguidor ? escolherOrdem(escala, mci, k, culto) : escolherMusica(escala, ci, k)),
        },
          h("b", {}, m ? E.rotuloMusica(m) : `${E.nomeTipo(vaga.tipo)} a definir`),
          h("span", { class: "fixa" }, !ehSeguidor && fixo.has(`m:${k}`) ? icone("pino") : null),
          h("span", { class: "sub" }, [E.nomeTipo(vaga.tipo), m && m.tom ? `tom ${m.tom}` : "", tags, a ? a.msg : ""].filter(Boolean).join(" · "))),
        h("span", { class: "ordem" },
          h("button", { class: "btn icone", "aria-label": `Subir ${nome}`, disabled: k === 0 || null, onclick: () => mudou(() => E.moverMusica(mostrado, k, -1)) }, icone("cima")),
          h("button", { class: "btn icone", "aria-label": `Descer ${nome}`, disabled: k === mostrado.musicas.length - 1 || null, onclick: () => mudou(() => E.moverMusica(mostrado, k, 1)) }, icone("baixo"))));
    });

    const notas = grupo.filter((x) => x.obs);
    return h("article", { class: "cartao culto", id: `culto-${culto.id}`, "aria-label": `${grupo.map((x) => `${x.nome} às ${x.hora}`).join(" e ")}` },
      h("header", { class: "culto-cab" },
        h("div", { class: "horarios" },
          grupo.map((x) => h("div", { class: "horario" }, x.hora ? h("span", { class: "hora" }, x.hora) : null, h("h3", {}, x.nome))),
          culto.solene || culto.avulso ? h("div", { class: "selos" },
            culto.solene ? h("span", { class: "selo solene" }, "Culto solene") : null,
            culto.avulso ? h("span", { class: "selo neutro" }, "Extra") : null) : null),
        h("button", { class: "btn icone", "aria-label": `Opções do culto ${culto.nome}`, onclick: () => opcoesCulto(escala, ci) }, icone("opcoes"))),
      h("div", { class: "bloco" },
        h("div", { class: "bloco-cab" }, h("span", { class: "rotulo" }, "Equipe"),
          h("button", { class: "btn texto mini", "aria-label": `Acrescentar pessoa em ${culto.nome}`, onclick: () => novaVagaPessoa(escala, ci) }, icone("mais"), "Pessoa")),
        equipe.length ? h("div", { class: "funcoes" }, equipe) : h("p", { class: "small muted" }, "Ninguém neste culto ainda.")),
      h("div", { class: "bloco" },
        h("div", { class: "bloco-cab" },
          h("span", { class: "rotulo" }, "Músicas"),
          h("div", { class: "acoes", style: "gap:6px" },
            seguidores.length ? h("div", { class: "segmentado", role: "group", "aria-label": "Ver a ordem das músicas de qual culto" }, grupo.map((x) => h("button", {
              "aria-pressed": String(x === mostrado), onclick: () => { ui.ordemDe[culto.id] = x.id; render(); },
            }, x.hora || x.nome))) : null,
            ehSeguidor ? null : h("button", { class: "btn texto mini", "aria-label": `Acrescentar música em ${culto.nome}`, onclick: () => novaVagaMusica(escala, ci) }, icone("mais"), "Música"))),
        ehSeguidor ? h("p", { class: "small muted" }, `Mesmas músicas do culto das ${culto.hora}. Aqui você muda só a ordem.`) : null,
        musicas.length ? h("ol", { class: "musicas" }, musicas) : h("p", { class: "small muted" }, "Nenhuma música neste culto ainda.")),
      notas.length ? h("div", { class: "bloco" }, notas.map((x) => h("p", { class: "nota" }, grupo.length > 1 ? `${x.hora}: ${x.obs}` : x.obs))) : null);
  }

  function irParaCulto(id) {
    const el = document.getElementById(`culto-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.classList.add("destaque");
    setTimeout(() => el.classList.remove("destaque"), 1600);
  }

  function verAvisos(escala, avisos) {
    painel({
      titulo: "O que precisa de atenção",
      sub: "Toque num item para ir até o culto.",
      corpo: h("ul", { class: "avisos" }, avisos.map((a) => {
        const c = escala.cultos[a.ci];
        return h("li", { class: a.nivel }, h("button", { onclick: () => { fecharAtual(true); setTimeout(() => irParaCulto(c.id), 60); } },
          h("span", { class: "ponto", "aria-hidden": "true" }),
          h("span", {}, h("b", {}, `${E.formatarData(c.data, "dia")} · ${c.nome}`), h("br"), h("span", { class: "small muted" }, a.msg))));
      })),
      foco: ".avisos button",
    });
  }

  /** Fixar: o campo não muda quando a escala ou o culto são sorteados de novo. */
  function interruptorFixo(culto, campo) {
    const fixo = (culto.travados || []).includes(campo);
    return h("label", { class: "interruptor" },
      h("span", {}, "Manter esta escolha", h("small", {}, "Não muda ao sortear de novo")),
      h("input", { type: "checkbox", role: "switch", checked: fixo, onchange: (e) => {
        mudou(() => { culto.travados = e.target.checked ? [...(culto.travados || []), campo] : (culto.travados || []).filter((t) => t !== campo); });
      } }));
  }

  function fixar(culto, campo) {
    if (!(culto.travados || []).includes(campo)) culto.travados = [...(culto.travados || []), campo];
  }

  function escolherPessoa(escala, ci, si) {
    const culto = escala.cultos[ci];
    const vaga = culto.equipe[si];
    const cands = E.candidatosPessoa(state, escala, ci, si);
    const op = (c) => ({
      id: c.pessoa.id, rotulo: c.pessoa.nome,
      direita: c.vezes ? `${c.vezes}× nesta escala` : "ainda não escalado",
      meta: c.bloqueio ? h("span", { class: "ruim" }, c.bloqueio)
        : [c.disp === "sim" ? h("span", { style: "color:var(--ok);font-weight:700" }, "confirmou que pode") : c.semResposta ? "não respondeu a disponibilidade" : "", c.apoio ? "só apoio nesta função" : ""].filter(Boolean).flatMap((x, i) => (i ? [" · ", x] : [x])),
    });
    escolher({
      titulo: E.nomeFuncao(state, vaga.funcao),
      sub: `${E.formatarData(culto.data, "longa")} · ${culto.nome}`,
      topo: h("div", { style: "display:grid;gap:8px" },
        h("div", { class: "barra-painel" },
          h("button", { class: "btn tonal", onclick: () => { fecharAtual(); mudou(() => E.sortearCampo(state, escala, ci, `e:${si}`)); } }, icone("sortear"), "Sortear outra pessoa"),
          h("button", { class: "btn perigo", onclick: () => { fecharAtual(); comDesfazer(`Vaga de ${E.nomeFuncao(state, vaga.funcao).toLowerCase()} tirada do culto.`, () => E.removerVaga(culto, si)); } }, icone("lixo"), "Tirar esta vaga")),
        interruptorFixo(culto, `e:${si}`)),
      atual: vaga.pessoaId,
      grupos: [
        { titulo: "Disponíveis · quem serviu menos primeiro", itens: cands.filter((c) => !c.bloqueio && !c.apoio).map(op) },
        { titulo: "Só apoio", itens: cands.filter((c) => !c.bloqueio && c.apoio).map(op) },
        { titulo: "Com restrição", itens: cands.filter((c) => c.bloqueio).map(op) },
      ],
      vazio: "Deixar sem ninguém",
      aoEscolher: (id) => mudou(() => { vaga.pessoaId = id; if (id) fixar(culto, `e:${si}`); }),
    });
  }

  function metaMusica(c) {
    const partes = [c.ultima ? `última vez ${E.formatarData(c.ultima, "curta")}` : "sem registro recente"];
    if (c.bloqueio) partes.push(h("span", { class: "ruim" }, ` · ${c.bloqueio}`));
    if (!c.atende) partes.push(h("span", { class: "ruim" }, ` · falta: ${c.faltam.map((t) => E.nomeTag(state, t)).join(", ")}`));
    return partes;
  }

  function escolherMusica(escala, ci, k) {
    const culto = escala.cultos[ci];
    const vaga = culto.musicas[k];
    const cands = E.candidatosMusica(state, escala, ci, k);
    const exigidas = E.tagsExigidas(state, vaga.tipo, culto.solene);
    const op = (c) => ({ id: c.musica.id, rotulo: E.rotuloMusica(c.musica), busca: `${c.musica.numero} ${c.musica.titulo} ${c.musica.autor}`, direita: c.musica.tom ? `tom ${c.musica.tom}` : "", meta: metaMusica(c) });
    escolher({
      titulo: E.nomeTipo(vaga.tipo),
      sub: `${E.formatarData(culto.data, "longa")} · ${culto.nome}${exigidas.length ? ` · precisa ser ${exigidas.map((t) => E.nomeTag(state, t)).join(" e ")}` : ""}`,
      topo: h("div", { style: "display:grid;gap:8px" },
        h("div", { class: "barra-painel" },
          h("button", { class: "btn tonal", onclick: () => { fecharAtual(); mudou(() => E.sortearCampo(state, escala, ci, `m:${k}`)); } }, icone("sortear"), "Sortear outra música"),
          h("button", { class: "btn perigo", onclick: () => { fecharAtual(); comDesfazer("Música tirada do culto.", () => E.removerMusica(culto, k)); } }, icone("lixo"), "Tirar esta música")),
        interruptorFixo(culto, `m:${k}`)),
      buscar: true,
      atual: vaga.id,
      grupos: [
        { titulo: exigidas.length ? "Seguem a orientação e não foram cantadas há pouco" : "Não foram cantadas há pouco", itens: cands.filter((c) => c.atende && !c.bloqueio).map(op) },
        { titulo: "Cantadas há pouco ou já neste culto", itens: cands.filter((c) => c.atende && c.bloqueio).map(op) },
        { titulo: "Fora da orientação do culto solene", itens: cands.filter((c) => !c.atende).map(op) },
      ],
      vazio: "Deixar a definir",
      aoEscolher: (id) => mudou(() => { E.colocarMusica(culto, k, id); if (id) fixar(culto, `m:${k}`); }),
    });
  }

  /** Acrescenta uma vaga (ex.: mais um vocal) e já abre a lista para escolher quem. */
  function novaVagaPessoa(escala, ci) {
    const culto = escala.cultos[ci];
    escolher({
      titulo: "Acrescentar pessoa",
      sub: `${E.formatarData(culto.data, "longa")} · ${culto.nome} · escolha a função`,
      grupos: [{ itens: state.funcoes.map((f) => {
        const n = culto.equipe.filter((v) => v.funcao === f.id).length;
        return { id: f.id, rotulo: f.nome, direita: n ? `${n} no culto` : "ninguém ainda" };
      }) }],
      aoEscolher: (funcao) => {
        if (!funcao) return;
        let si = -1;
        mudou(() => { si = E.adicionarVaga(culto, funcao); });
        if (si >= 0) setTimeout(() => escolherPessoa(escala, ci, si), 60);
      },
    });
  }

  /** Acrescenta uma música no fim da lista do culto e já abre o repertório. */
  function novaVagaMusica(escala, ci) {
    const culto = escala.cultos[ci];
    escolher({
      titulo: "Acrescentar música",
      sub: `${E.formatarData(culto.data, "longa")} · ${culto.nome}`,
      grupos: [{ itens: E.TIPOS_MUSICA.map((t) => ({ id: t.id, rotulo: t.nome, direita: `${culto.musicas.filter((m) => m.tipo === t.id).length} no culto` })) }],
      aoEscolher: (tipo) => {
        if (!tipo) return;
        let k = -1;
        mudou(() => { k = E.adicionarMusica(culto, tipo); });
        if (k >= 0) setTimeout(() => escolherMusica(escala, ci, k), 60);
      },
    });
  }

  /** No culto que repete outro, a escolha é só entre as músicas do dia: muda a ordem. */
  function escolherOrdem(escala, ci, k, lider) {
    const culto = escala.cultos[ci];
    const posicao = (id) => culto.musicas.findIndex((m) => m.id === id) + 1;
    escolher({
      titulo: `${k + 1}ª música às ${culto.hora}`,
      sub: "A música escolhida troca de lugar com a que está aqui.",
      atual: culto.musicas[k].id,
      grupos: [{ itens: lider.musicas.filter((m) => m.id).map((m) => ({ id: m.id, rotulo: E.rotuloMusica(porId(state.musicas, m.id)), direita: `agora é a ${posicao(m.id)}ª` })) }],
      aoEscolher: (id) => mudou(() => { if (id) E.colocarMusica(culto, k, id); }),
    });
  }

  function opcoesCulto(escala, ci) {
    const culto = escala.cultos[ci];
    const seguidores = escala.cultos.filter((c) => E.liderDe(escala, c) === culto);
    const obs = [culto, ...seguidores].map((x) => ({ x, campo: h("textarea", { id: `obs-${x.id}`, rows: 2, placeholder: "Ensaio, roupa, avisos para a equipe…", value: x.obs || "" }) }));
    painel({
      titulo: culto.nome,
      sub: `${E.formatarData(culto.data, "longa")}${culto.hora ? ` · ${culto.hora}` : ""}`,
      corpo: [
        h("button", { class: "btn tonal largo", onclick: () => { fecharAtual(); mudou(() => E.sortearCulto(state, escala, ci)); avisar("Culto sorteado de novo. O que estava fixado foi mantido."); } }, icone("sortear"), "Sortear este culto de novo"),
        obs.map(({ x, campo }) => h("label", { class: "campo" }, obs.length > 1 ? `Observação · ${x.hora}` : "Observação para a equipe", campo)),
        culto.avulso ? h("button", { class: "btn perigo largo", onclick: () => { fecharAtual(); comDesfazer("Culto extra removido.", () => { escala.cultos.splice(ci, 1); }); } }, icone("lixo"), "Remover este culto extra") : null,
      ],
      rodape: (fechar) => [h("button", { class: "btn primario", onclick: () => { fechar(); mudou(() => obs.forEach(({ x, campo }) => { x.obs = campo.value.trim(); })); } }, "Salvar")],
      foco: ".btn.tonal",
    });
  }

  function opcoesEscala(escala) {
    const itens = [
      h("div", { class: "campo" }, "Situação",
        h("div", { class: "segmentado", role: "group", "aria-label": "Situação da escala", style: "display:grid" },
          h("button", { "aria-pressed": String(escala.status !== "confirmada"), onclick: () => { fecharAtual(); mudou(() => { escala.status = "rascunho"; }); } }, "Rascunho"),
          h("button", { "aria-pressed": String(escala.status === "confirmada"), onclick: () => { fecharAtual(); mudou(() => { escala.status = "confirmada"; }); avisar("Escala confirmada."); } }, "Confirmada"))),
      h("button", {
        class: "btn tonal largo", onclick: () => {
          fecharAtual();
          comDesfazer("Escala sorteada de novo. O que estava fixado foi mantido.", () => {
            state.escalas[state.escalas.indexOf(escala)] = E.gerarEscala(state, { inicio: escala.inicio, fim: escala.fim }, escala);
          });
        },
      }, icone("sortear"), "Sortear a escala de novo"),
      h("button", {
        class: "btn largo", onclick: () => {
          fecharAtual();
          comDesfazer("Escala esvaziada. Toque em cada vaga para escolher.", () => E.esvaziarEscala(escala));
        },
      }, icone("editar"), "Esvaziar para montar à mão"),
      h("button", { class: "btn largo", onclick: () => cultoExtra(escala) }, icone("mais"), "Adicionar culto extra"),
      h("button", { class: "btn largo", onclick: () => quantasVezes(escala) }, icone("pessoas"), "Quantas vezes cada um serve"),
      h("button", { class: "btn largo", onclick: () => { fecharAtual(); setTimeout(() => window.print(), 50); } }, icone("imprimir"), "Imprimir"),
      h("button", {
        class: "btn perigo largo", onclick: () => {
          fecharAtual();
          comDesfazer("Escala excluída.", () => { state.escalas = state.escalas.filter((e) => e !== escala); ui.escalaId = null; garantirEscalaAtual(); });
        },
      }, icone("lixo"), "Excluir esta escala"),
    ];
    painel({ titulo: "Opções da escala", sub: E.formatarPeriodo(escala.inicio, escala.fim), corpo: h("div", { style: "display:grid;gap:10px" }, itens), foco: ".btn.tonal" });
  }

  function trocarEscala() {
    painel({
      titulo: "Escalas",
      corpo: [
        h("button", { class: "btn primario largo", onclick: novaEscala }, icone("mais"), "Nova escala"),
        h("ul", { class: "lista cartao" }, escalasOrdenadas().map((e) => {
          const erros = E.validarEscala(state, e).filter((a) => a.nivel === "erro").length;
          return h("li", {}, h("button", { class: "linha", "aria-current": String(e.id === ui.escalaId), onclick: () => { fecharAtual(true); ui.escalaId = e.id; render(); window.scrollTo({ top: 0 }); } },
            h("span", { class: "avatar", "aria-hidden": "true" }, icone("calendario")),
            h("span", {}, h("span", { class: "titulo" }, E.formatarPeriodo(e.inicio, e.fim)), h("br"),
              h("span", { class: "sub" }, `${e.status === "confirmada" ? "Confirmada" : "Rascunho"}${erros ? ` · ${erros} pendência${erros > 1 ? "s" : ""}` : ""}`)),
            e.id === ui.escalaId ? h("span", { class: "selo ok" }, "Aberta") : h("span")));
        })),
      ],
      foco: ".btn.primario",
    });
  }

  function novaEscala() {
    const f = { tipo: "quinzenal", inicio: proximoDomingo(), mes: proximoMes(), fim: "", modo: "sortear" };
    const corpo = h("div", { style: "display:grid;gap:16px" });
    const periodo = () => {
      if (f.tipo === "mensal") return { inicio: `${f.mes}-01`, fim: E.fimDoMes(f.mes) };
      if (f.tipo === "quinzenal") return { inicio: f.inicio, fim: E.somarDias(f.inicio, 13) };
      return { inicio: f.inicio, fim: f.fim && f.fim >= f.inicio ? f.fim : E.somarDias(f.inicio, 13) };
    };
    let botao = null;
    const desenhar = () => {
      const p = periodo();
      const qtd = E.listarOcorrencias(state.cultos, p.inicio, p.fim).length;
      const tipo = (id, nome) => h("button", { "aria-pressed": String(f.tipo === id), onclick: () => { f.tipo = id; desenhar(); } }, nome);
      const modo = (id, nome, ic) => h("button", { "aria-pressed": String(f.modo === id), onclick: () => { f.modo = id; desenhar(); } }, icone(ic), nome);
      corpo.replaceChildren(
        h("div", { class: "campo" }, "Como montar",
          h("div", { class: "segmentado", role: "group", "aria-label": "Como montar", style: "display:grid" }, modo("sortear", "Sortear", "sortear"), modo("zero", "Do zero", "editar")),
          h("span", { class: "ajuda" }, f.modo === "zero" ? "Os cultos vêm com as vagas vazias; você escolhe cada pessoa e cada música." : "O app distribui a equipe e as músicas; depois dá para trocar qualquer uma.")),
        h("div", { class: "segmentado", role: "group", "aria-label": "Período", style: "display:grid" }, tipo("quinzenal", "Quinzenal"), tipo("mensal", "Mensal"), tipo("personalizado", "Outro")),
        f.tipo === "mensal"
          ? h("label", { class: "campo" }, "Mês", h("input", { type: "month", id: "nova-mes", value: f.mes, onchange: (e) => { f.mes = e.target.value || f.mes; desenhar(); } }))
          : h("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px" },
              h("label", { class: "campo" }, f.tipo === "quinzenal" ? "Começa em" : "De", h("input", { type: "date", id: "nova-inicio", value: f.inicio, onchange: (e) => { f.inicio = e.target.value || f.inicio; desenhar(); } })),
              f.tipo === "personalizado" ? h("label", { class: "campo" }, "Até", h("input", { type: "date", id: "nova-fim", value: p.fim, min: f.inicio, onchange: (e) => { f.fim = e.target.value; desenhar(); } })) : null),
        h("p", { class: "muted" }, `${E.formatarPeriodo(p.inicio, p.fim)} · ${qtd} ${qtd === 1 ? "culto" : "cultos"}`));
      if (botao) { botao.disabled = qtd === 0; botao.textContent = f.modo === "zero" ? "Criar escala vazia" : "Gerar escala"; }
    };
    desenhar();
    painel({
      titulo: "Nova escala",
      sub: "A equipe e as músicas são distribuídas automaticamente; depois é só ajustar.",
      corpo,
      rodape: (fechar) => [botao = h("button", {
        class: "btn primario", onclick: () => {
          const p = periodo();
          const esc = E.gerarEscala(state, { inicio: p.inicio, fim: p.fim, tipo: f.tipo, vazia: f.modo === "zero" });
          fechar(true);
          ui.tela = "escala";
          mudou(() => { state.escalas.push(esc); ui.escalaId = esc.id; });
          window.scrollTo({ top: 0 });
          avisar(f.modo === "zero" ? `Escala criada com ${esc.cultos.length} cultos vazios. Toque em cada vaga para escolher.` : `Escala criada com ${esc.cultos.length} cultos.`);
        },
      }, "Gerar escala")],
      foco: ".segmentado button",
    });
    desenhar();
  }

  function cultoExtra(escala) {
    const modelos = state.cultos;
    const f = { data: escala.inicio, cultoId: (modelos[0] || {}).id, nome: "", hora: "19:00", solene: false, sortear: true };
    const doModelo = () => { const m = porId(modelos, f.cultoId); if (m) { f.hora = m.hora; f.solene = !!m.solene; } };
    doModelo();
    const corpo = h("div", { style: "display:grid;gap:16px" });
    const desenhar = () => corpo.replaceChildren(
      h("label", { class: "campo" }, "Nome", h("input", { type: "text", id: "ex-nome", placeholder: "Ex.: Culto de Natal", value: f.nome, oninput: (e) => { f.nome = e.target.value; } })),
      h("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px" },
        h("label", { class: "campo" }, "Data", h("input", { type: "date", id: "ex-data", value: f.data, onchange: (e) => { f.data = e.target.value; } })),
        h("label", { class: "campo" }, "Hora", h("input", { type: "time", id: "ex-hora", value: f.hora, onchange: (e) => { f.hora = e.target.value; } }))),
      h("label", { class: "campo" }, "Equipe e músicas como no culto", h("select", { id: "ex-modelo", onchange: (e) => { f.cultoId = e.target.value; doModelo(); desenhar(); } },
        modelos.map((m) => h("option", { value: m.id, selected: m.id === f.cultoId || null }, `${m.nome} (${E.DIAS_CURTOS[m.diaSemana]} ${m.hora})`)))),
      h("label", { class: "interruptor" }, h("span", {}, "Culto solene", h("small", {}, "Aplica a orientação do pastor às músicas")), h("input", { type: "checkbox", role: "switch", checked: f.solene, onchange: (e) => { f.solene = e.target.checked; } })),
      h("label", { class: "interruptor" }, h("span", {}, "Já sortear equipe e músicas", h("small", {}, "Desligado: o culto vem vazio para escolher à mão")), h("input", { type: "checkbox", role: "switch", checked: f.sortear, onchange: (e) => { f.sortear = e.target.checked; } })));
    desenhar();
    painel({
      titulo: "Culto extra",
      sub: "Para datas especiais: Natal, aniversário da igreja, ação de graças…",
      corpo,
      rodape: (fechar) => [h("button", {
        class: "btn primario", onclick: () => {
          if (!f.nome.trim()) return avisar("Dê um nome ao culto.");
          if (!f.data) return avisar("Escolha a data.");
          fechar(true);
          let ci = 0;
          mudou(() => { ci = E.adicionarCultoExtra(state, escala, { ...f, nome: f.nome.trim(), vazia: !f.sortear }); });
          const c = escala.cultos[ci];
          if (c) setTimeout(() => irParaCulto(c.id), 60);
        },
      }, "Adicionar")],
      foco: "#ex-nome",
    });
  }

  function quantasVezes(escala) {
    painel({
      titulo: "Quantas vezes cada um serve",
      sub: `${E.formatarPeriodo(escala.inicio, escala.fim)} · domingo de manhã e à noite contam como uma vez`,
      corpo: h("table", {},
        h("thead", {}, h("tr", {}, h("th", {}, "Pessoa"), h("th", {}, "Vezes"), h("th", {}, "Funções"))),
        h("tbody", {}, E.resumoPessoas(state, escala).map((l) => h("tr", {},
          h("td", {}, h("b", {}, l.pessoa.nome)),
          h("td", { class: "num" }, String(l.total)),
          h("td", { class: "small muted" }, Object.entries(l.funcoes).map(([f, n]) => `${E.nomeFuncao(state, f)} ${n}×`).join(", ") || "—"))))),
    });
  }

  /** Prévia editável do texto da escala; nada é enviado sem o toque em Copiar ou Abrir no WhatsApp. */
  function enviarWhatsApp(escala) {
    let links = false;
    let editado = false;
    const erros = E.validarEscala(state, escala).filter((a) => a.nivel === "erro").length;
    const area = h("textarea", { class: "texto", id: "texto-whatsapp", "aria-label": "Texto da escala para enviar", spellcheck: "false", oninput: () => { editado = true; } });
    const atualizar = () => { area.value = E.textoWhatsApp(state, escala, { links }); editado = false; };
    atualizar();
    const abrir = async () => {
      const texto = area.value.trim();
      if (!texto) return avisar("O texto está vazio.");
      if (navigator.share && celular()) {
        try { await navigator.share({ text: texto }); } catch (e) { if (e && e.name !== "AbortError") copiar(texto, area); }
        return;
      }
      const janela = window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
      if (!janela) copiar(texto, area);
    };
    painel({
      titulo: "Compartilhar a escala",
      sub: `${E.formatarPeriodo(escala.inicio, escala.fim)} · confira e, se quiser, edite antes de enviar.`,
      corpo: [
        erros ? h("div", { class: "faixa alerta" }, icone("alerta"), h("span", {}, `${erros} ${erros === 1 ? "item ainda está" : "itens ainda estão"} a definir e ${erros === 1 ? "vai" : "vão"} assim no texto.`),
          h("button", { class: "btn mini", onclick: () => { fecharAtual(true); verAvisos(escala, E.validarEscala(state, escala)); } }, "Ver")) : null,
        h("label", { class: "interruptor" }, h("span", {}, "Incluir links do YouTube", h("small", {}, "Para a equipe ensaiar")),
          h("input", { type: "checkbox", role: "switch", id: "com-links", onchange: (e) => {
            links = e.target.checked;
            if (editado) avisar("O texto foi refeito com a nova opção; suas edições saíram.");
            atualizar();
          } })),
        area,
      ],
      rodape: () => [
        h("button", { class: "btn", onclick: () => copiar(area.value, area) }, icone("copiar"), "Copiar"),
        h("button", { class: "btn zap", onclick: abrir }, icone(navigator.share && celular() ? "compartilhar" : "whatsapp"), navigator.share && celular() ? "Compartilhar" : "Abrir no WhatsApp"),
      ],
      foco: "footer .btn.zap",
    });
  }

  /* --------------------------------------------------- disponibilidade */

  const CHAVE_PESSOA = "escala-louvor:eu";

  /** Período em que a equipe responde a disponibilidade (padrão: as próximas duas semanas). */
  function pedidoAtual() {
    if (state.pedido && state.pedido.inicio && state.pedido.fim) return state.pedido;
    const inicio = proximoDomingo();
    return { inicio, fim: E.somarDias(inicio, 13) };
  }

  const horaCurta = (hora) => String(hora || "").replace(/^0/, "").replace(":00", "h").replace(":", "h");

  /** Calendário do mês: os dias com culto no período são botões (pode / não pode). */
  function calendario(periodo, selecionadas, aoMudar) {
    const dias = E.diasDeCulto(state, periodo.inicio, periodo.fim);
    const caixa = h("div", { class: "calendario" });
    const desenhar = () => {
      const meses = [];
      const d = E.parseData(periodo.inicio);
      d.setDate(1);
      const ultimo = E.parseData(periodo.fim);
      while (d <= ultimo) {
        meses.push([d.getFullYear(), d.getMonth()]);
        d.setMonth(d.getMonth() + 1);
      }
      caixa.replaceChildren(...meses.map(([ano, mes]) => {
        const celulas = [];
        const primeiro = new Date(ano, mes, 1, 12).getDay();
        const total = new Date(ano, mes + 1, 0, 12).getDate();
        for (let i = 0; i < primeiro; i++) celulas.push(h("span", { "aria-hidden": "true" }));
        for (let n = 1; n <= total; n++) {
          const iso = E.isoData(new Date(ano, mes, n, 12));
          const dc = dias.find((x) => x.data === iso);
          if (!dc) {
            celulas.push(h("span", { class: "dia-fora", "aria-hidden": "true" }, String(n)));
            continue;
          }
          const pode = selecionadas.has(iso);
          celulas.push(h("button", {
            type: "button", class: "dia-culto", "aria-pressed": String(pode),
            "aria-label": `${E.formatarData(iso, "longa")}, ${dc.cultos.map((c) => `${c.nome} às ${c.hora}`).join(" e ")}: ${pode ? "posso" : "não posso"}`,
            onclick: () => {
              if (pode) selecionadas.delete(iso);
              else selecionadas.add(iso);
              desenhar();
              if (aoMudar) aoMudar();
            },
          }, h("b", {}, String(n)), h("small", {}, dc.cultos.map((c) => horaCurta(c.hora)).join(" ")), pode ? icone("ok") : null));
        }
        return h("div", { class: "mes" },
          h("h3", {}, `${E.MESES[mes][0].toUpperCase()}${E.MESES[mes].slice(1)} de ${ano}`),
          h("div", { class: "semana", "aria-hidden": "true" }, ["D", "S", "T", "Q", "Q", "S", "S"].map((x) => h("span", {}, x))),
          h("div", { class: "grade-dias" }, celulas));
      }));
    };
    desenhar();
    return { el: caixa, dias, redesenhar: desenhar };
  }

  function guardarResposta(r) {
    state.respostas = (state.respostas || []).filter((x) => x.id !== r.id).concat(r);
  }

  /** Tela de quem responde a disponibilidade (a equipe, pelo link compartilhado). */
  function telaDisponibilidade() {
    const periodo = pedidoAtual();
    let pessoaId = ui.respostaPessoa;
    if (!pessoaId) { try { pessoaId = localStorage.getItem(CHAVE_PESSOA); } catch (e) { /* sem armazenamento */ } }
    const pessoa = porId(state.pessoas, pessoaId);
    const voltar = ui.coordena ? h("button", { class: "btn texto", onclick: () => irPara("agenda") }, "Voltar ao app") : null;
    if (!pessoa) {
      const ativas = state.pessoas.filter((p) => p.ativo !== false).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      return h("div", { class: "tela" },
        h("div", { class: "cabecalho" }, h("div", {}, h("h1", {}, "Sua disponibilidade"), h("p", { class: "muted" }, `Cultos de ${E.formatarPeriodo(periodo.inicio, periodo.fim)}`)), voltar),
        h("section", { class: "cartao secao" },
          h("h2", { style: "font-size:1.15rem" }, "Quem é você?"),
          h("div", { class: "nomes" }, ativas.map((p) => h("button", { class: "btn", "aria-label": p.nome, onclick: () => {
            ui.respostaPessoa = p.id;
            ui.resposta = null;
            try { localStorage.setItem(CHAVE_PESSOA, p.id); } catch (e) { /* sem armazenamento */ }
            render();
          } }, avatar(p), p.nome)))));
    }
    const id = E.idResposta(pessoa.id, periodo.inicio);
    const existente = (state.respostas || []).find((r) => r.id === id);
    if (!ui.resposta || ui.resposta.id !== id) ui.resposta = { id, dias: new Set(existente ? existente.dias : []), obs: existente ? existente.obs || "" : "" };
    const rascunho = ui.resposta;
    const contagem = h("span", {});
    const cal = calendario(periodo, rascunho.dias, () => atualizar());
    const atualizar = () => { contagem.textContent = `Enviar · ${rascunho.dias.size} ${rascunho.dias.size === 1 ? "dia" : "dias"}`; };
    atualizar();
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" },
        h("div", {}, h("h1", {}, `Olá, ${pessoa.nome}`), h("p", { class: "muted" }, `Cultos de ${E.formatarPeriodo(periodo.inicio, periodo.fim)}`)),
        h("div", { class: "acoes" }, h("button", { class: "btn texto", onclick: () => { ui.respostaPessoa = null; ui.resposta = null; try { localStorage.removeItem(CHAVE_PESSOA); } catch (e) { /* */ } render(); } }, "Não sou eu"), voltar)),
      existente ? h("p", { class: "selo ok", style: "justify-self:start;min-height:32px;padding:0 12px" }, `Você respondeu em ${E.formatarData(existente.em.slice(0, 10), "curta")}. Pode mudar e enviar de novo.`) : null,
      h("section", { class: "cartao secao" },
        h("p", {}, "Toque nos dias em que você ", h("b", {}, "pode"), " servir; toque de novo para desmarcar. Só os dias com culto aparecem para marcar."),
        h("p", { class: "small muted", style: "display:flex;gap:14px;flex-wrap:wrap" },
          h("span", { style: "display:inline-flex;gap:6px;align-items:center" }, h("i", { style: "width:12px;height:12px;border-radius:4px;background:var(--ok);display:inline-block" }), "Posso"),
          h("span", { style: "display:inline-flex;gap:6px;align-items:center" }, h("i", { style: "width:12px;height:12px;border-radius:4px;border:1.5px solid var(--azul-linha);display:inline-block" }), "Não posso")),
        cal.el,
        h("div", { class: "acoes" },
          h("button", { class: "btn tonal", onclick: () => { cal.dias.forEach((d) => rascunho.dias.add(d.data)); cal.redesenhar(); atualizar(); } }, "Posso em todos"),
          h("button", { class: "btn texto", onclick: () => { rascunho.dias.clear(); cal.redesenhar(); atualizar(); } }, "Limpar")),
        h("label", { class: "campo" }, "Recado para o coordenador (opcional)", h("textarea", { id: "disp-obs", rows: 2, value: rascunho.obs, placeholder: "Ex.: no dia 01/11 só posso à noite", oninput: (e) => { rascunho.obs = e.target.value; } }))),
      h("div", { class: "barra-envio" }, h("button", { class: "btn primario largo", onclick: () => enviarResposta(pessoa, periodo, rascunho) }, icone("enviar"), contagem)));
  }

  async function enviarResposta(pessoa, periodo, rascunho) {
    const r = {
      id: E.idResposta(pessoa.id, periodo.inicio), pessoaId: pessoa.id, inicio: periodo.inicio, fim: periodo.fim,
      dias: [...rascunho.dias].sort(), obs: rascunho.obs.trim(), em: new Date().toISOString(),
    };
    if (ui.coordena) {
      mudou(() => guardarResposta(r));
      return avisar("Disponibilidade salva.");
    }
    try {
      if (!armazem.db) throw new Error("sem servidor");
      await armazem.db.collection("respostas").doc(r.id).set(r);
      guardarResposta(r);
      render();
      painel({ titulo: "Recebido, obrigado!", sub: `${r.dias.length} ${r.dias.length === 1 ? "dia marcado" : "dias marcados"}. Se mudar algo, é só abrir o link de novo.`, corpo: h("p", { class: "muted" }, "A escala sai assim que todos responderem."), foco: "header .btn" });
    } catch (e) {
      // Sem permissão para gravar: a pessoa manda o código pelo WhatsApp.
      const texto = E.textoResposta(state, r);
      const pre = h("pre", { class: "texto" }, texto);
      painel({
        titulo: "Mande pelo WhatsApp",
        sub: "Não deu para salvar direto daqui. Copie e mande para quem faz a escala.",
        corpo: pre,
        rodape: () => [h("button", { class: "btn primario", onclick: () => copiar(texto, pre) }, icone("copiar"), "Copiar")],
        foco: "footer .btn",
      });
    }
  }

  /** Cultos de um mês, por data: os das escalas (com equipe) e, onde não há escala, os da semana configurada. */
  function cultosDoMes(ano, mes) {
    const inicio = E.isoData(new Date(ano, mes, 1, 12));
    const fim = E.isoData(new Date(ano, mes + 1, 0, 12));
    const porData = {};
    const por = (d) => (porData[d] = porData[d] || []);
    for (const e of state.escalas) {
      for (const c of e.cultos) if (c.data >= inicio && c.data <= fim) por(c.data).push({ hora: c.hora, nome: c.nome, solene: !!c.solene, escala: e, culto: c });
    }
    const coberto = (d) => state.escalas.some((e) => e.inicio <= d && e.fim >= d);
    for (const o of E.listarOcorrencias(state.cultos, inicio, fim)) {
      if (coberto(o.data)) continue;
      const c = porId(state.cultos, o.cultoId);
      if (c) por(o.data).push({ hora: c.hora, nome: c.nome, solene: !!c.solene, escala: null, culto: null });
    }
    for (const lista of Object.values(porData)) lista.sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));
    return porData;
  }

  function compromisso(item) {
    const lider = item.escala ? E.liderDe(item.escala, item.culto) || item.culto : null;
    const pessoas = lider ? lider.equipe.map((v) => porId(state.pessoas, v.pessoaId)).filter(Boolean) : [];
    const sub = item.escala ? `${pessoas.length} ${pessoas.length === 1 ? "pessoa" : "pessoas"} · ${lider.musicas.filter((m) => m.id).length} músicas` : "Ainda sem escala";
    const conteudo = [h("span", { class: "h" }, item.hora || "—"),
      h("span", { style: "min-width:0" }, h("span", { class: "t" }, item.nome), h("br"), h("span", { class: "s" }, sub)),
      h("span", { class: "selos", style: "display:flex;gap:6px;align-items:center" }, item.solene ? h("span", { class: "selo solene" }, "Solene") : null, item.escala ? icone("dir") : null)];
    return item.escala
      ? h("button", { class: "compromisso", onclick: () => abrirCulto(item.escala, lider.id) }, conteudo)
      : h("div", { class: "compromisso" }, conteudo);
  }

  function calendarioCultos() {
    if (!ui.agendaMes) ui.agendaMes = hoje().slice(0, 7);
    const [ano, mes] = ui.agendaMes.split("-").map(Number);
    const porData = cultosDoMes(ano, mes - 1);
    const datas = Object.keys(porData).sort();
    if (!ui.agendaDia || ui.agendaDia.slice(0, 7) !== ui.agendaMes) ui.agendaDia = datas.find((d) => d >= hoje()) || datas[0] || `${ui.agendaMes}-01`;
    const trocarMes = (delta) => {
      const d = new Date(ano, mes - 1 + delta, 1, 12);
      ui.agendaMes = E.isoData(d).slice(0, 7);
      ui.agendaDia = null;
      render();
    };
    const titulo = `${E.MESES[mes - 1][0].toUpperCase()}${E.MESES[mes - 1].slice(1)} de ${ano}`;
    const cab = h("div", { class: "mes-cab" },
      h("h2", { "aria-live": "polite" }, titulo),
      h("button", { class: "btn texto mini", onclick: () => { ui.agendaMes = hoje().slice(0, 7); ui.agendaDia = hoje(); render(); } }, "Hoje"),
      h("button", { class: "btn icone", "aria-label": "Mês anterior", onclick: () => trocarMes(-1) }, icone("esq")),
      h("button", { class: "btn icone", "aria-label": "Próximo mês", onclick: () => trocarMes(1) }, icone("dir")));
    if (ui.agendaModo === "lista") {
      return [h("section", { class: "cartao" }, cab,
        datas.length ? h("div", { class: "lista-dias" }, datas.map((d) => h("div", {}, h("h3", {}, E.formatarData(d, "longa"), d === hoje() ? " · hoje" : ""), h("div", { class: "compromissos", style: "padding:0" }, porData[d].map(compromisso)))))
          : h("div", { class: "secao" }, h("p", { class: "muted" }, "Nenhum culto neste mês.")))];
    }
    const celulas = [];
    const primeiro = new Date(ano, mes - 1, 1, 12).getDay();
    const total = new Date(ano, mes, 0, 12).getDate();
    for (let i = 0; i < primeiro; i++) celulas.push(h("span", { "aria-hidden": "true" }));
    for (let n = 1; n <= total; n++) {
      const iso = E.isoData(new Date(ano, mes - 1, n, 12));
      const itens = porData[iso] || [];
      celulas.push(h("button", {
        type: "button", class: `${itens.length ? "tem" : ""}${iso === hoje() ? " hoje" : ""}`, "aria-pressed": String(iso === ui.agendaDia),
        "aria-label": `${E.formatarData(iso, "longa")}${itens.length ? `: ${itens.map((x) => `${x.nome} às ${x.hora}`).join(", ")}` : ", sem culto"}`,
        onclick: () => { ui.agendaDia = iso; render(); },
      }, String(n), h("span", { class: "pontos", "aria-hidden": "true" }, itens.slice(0, 3).map((x) => h("i", { class: !x.escala ? "sem" : x.solene ? "solene" : null })))));
    }
    const doDia = porData[ui.agendaDia] || [];
    const semEscala = doDia.some((x) => !x.escala);
    return [
      h("section", { class: "cartao" }, cab,
        h("div", { class: "cal" }, h("div", { class: "semana", "aria-hidden": "true" }, E.DIAS_CURTOS.map((d) => h("span", {}, d))), h("div", { class: "grade" }, celulas)),
        h("div", { class: "legenda" }, h("span", {}, h("i"), "Culto com escala"), h("span", {}, h("i", { class: "solene" }), "Culto solene"), h("span", {}, h("i", { class: "sem" }), "Sem escala"))),
      h("section", { class: "cartao" },
        h("div", { class: "cartao-cab", style: "padding-bottom:var(--e-3)" }, h("h2", {}, icone("relogio"), E.formatarData(ui.agendaDia, "longa"))),
        doDia.length ? h("div", { class: "compromissos" }, doDia.map(compromisso)) : h("div", { class: "secao", style: "padding-top:0" }, h("p", { class: "muted" }, "Nenhum culto neste dia.")),
        semEscala ? h("div", { class: "rodape-cartao" }, h("button", { class: "btn tonal", onclick: novaEscala }, icone("calendarioMais"), "Criar escala")) : null),
    ];
  }

  /** Agenda: calendário dos cultos e, abaixo, o pedido e a grade de disponibilidade. */
  function telaAgenda() {
    const periodo = pedidoAtual();
    const dias = E.diasDeCulto(state, periodo.inicio, periodo.fim);
    const ativas = state.pessoas.filter((p) => p.ativo !== false).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    const respostaDa = (p) => (state.respostas || []).find((r) => r.id === E.idResposta(p.id, periodo.inicio));
    const responderam = ativas.filter(respostaDa);
    const existente = state.escalas.find((e) => e.inicio === periodo.inicio && e.fim === periodo.fim);
    const pct = ativas.length ? Math.round((responderam.length / ativas.length) * 100) : 0;

    const tabela = h("table", { class: "grade-disp" },
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Pessoa"), dias.map((d) => h("th", { scope: "col", class: "num" }, E.DIAS_CURTOS[E.diaSemana(d.data)], h("br"), E.formatarData(d.data, "curta"))))),
      h("tbody", {}, ativas.map((p) => {
        const r = respostaDa(p);
        return h("tr", {},
          h("th", { scope: "row" }, h("button", { class: "btn texto", style: "padding:0 6px", onclick: () => editarDisponibilidade(p) }, p.nome, r && r.obs ? icone("nota2") : null)),
          dias.map((d) => {
            const v = r ? (r.dias.includes(d.data) ? "sim" : "nao") : null;
            return h("td", { class: `disp ${v || "sem"}`, "aria-label": `${p.nome}, ${E.formatarData(d.data, "dia")}: ${v === "sim" ? "pode" : v === "nao" ? "não pode" : "não respondeu"}` }, v === "sim" ? "✓" : v === "nao" ? "✕" : "·");
          }));
      })),
      h("tfoot", {}, h("tr", {}, h("th", { scope: "row" }, "Podem"), dias.map((d) => h("td", { class: "num" }, String(ativas.filter((p) => { const r = respostaDa(p); return r && r.dias.includes(d.data); }).length))))));

    const recados = responderam.filter((p) => respostaDa(p).obs);
    const modo = (id, nome, ic) => h("button", { "aria-pressed": String(ui.agendaModo === id), onclick: () => { ui.agendaModo = id; render(); } }, icone(ic), nome);
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" },
        h("div", {}, h("h1", {}, "Agenda"), h("p", { class: "muted" }, "Os cultos do mês e a disponibilidade da equipe.")),
        h("div", { class: "segmentado", role: "group", "aria-label": "Ver como" }, modo("mes", "Mês", "grade"), modo("lista", "Lista", "lista"))),
      h("div", { class: "agenda-grade" }, calendarioCultos()),
      h("div", { class: "cabecalho", style: "padding-top:var(--e-4)" },
        h("div", {}, h("h2", { style: "font-size:var(--t-xl)" }, "Disponibilidade da equipe"), h("p", { class: "small muted" }, "Cada pessoa marca os dias em que pode servir; a escala é montada com essas respostas.")),
        h("button", { class: "btn primario", onclick: () => irPara("disponibilidade") }, icone("certo"), "Marcar minha disponibilidade")),
      h("section", { class: "cartao" },
        h("div", { class: "seletor-escala" },
          h("button", { class: "periodo", onclick: mudarPeriodo, "aria-label": `Período do pedido: ${E.formatarPeriodo(periodo.inicio, periodo.fim)}. Mudar` },
            h("span", { class: "rotulo" }, "Pedido de disponibilidade"),
            h("b", {}, E.formatarPeriodo(periodo.inicio, periodo.fim), icone("baixo")),
            h("span", { class: "small muted" }, `${dias.length} dias de culto · toque para mudar o período`))),
        h("div", { class: "resumo", style: "display:grid;gap:12px;border-top:0;padding-top:0" },
          h("div", { class: "progresso", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": ativas.length, "aria-valuenow": responderam.length, "aria-label": "Respostas" },
            h("div", { class: "barra" }, h("span", { style: `width:${pct}%` })),
            h("span", { class: "small" }, h("b", {}, `${responderam.length} de ${ativas.length}`), " responderam")),
          h("div", { class: "barra-painel" },
            h("button", { class: "btn tonal", onclick: () => pedirNoWhatsApp(periodo, dias) }, icone("enviar"), "Pedir no WhatsApp"),
            h("button", { class: "btn", onclick: colarRespostas }, icone("colar"), "Colar respostas")),
          h("button", { class: "btn primario largo", onclick: () => gerarComRespostas(periodo, existente) }, icone("sortear"), existente ? "Atualizar a escala com as respostas" : "Gerar a escala com as respostas"))),

      dias.length ? h("section", { class: "cartao", style: "overflow:hidden" }, h("div", { class: "rolagem-tabela" }, tabela)) : h("div", { class: "vazio" }, h("p", {}, "Nenhum culto ativo neste período.")),
      recados.length ? h("section", { class: "cartao secao" }, h("span", { class: "rotulo" }, "Recados"), recados.map((p) => h("p", { class: "nota" }, h("b", {}, `${p.nome}: `), respostaDa(p).obs))) : null,
      h("p", { class: "small muted" }, "Toque no nome de alguém para marcar os dias por essa pessoa (por exemplo, quando ela responde por mensagem)."));
  }

  function mudarPeriodo() {
    const atual = pedidoAtual();
    const f = { inicio: atual.inicio, fim: atual.fim };
    const inicioEl = h("input", { type: "date", id: "ped-inicio", value: f.inicio, onchange: (e) => { f.inicio = e.target.value || f.inicio; } });
    const fimEl = h("input", { type: "date", id: "ped-fim", value: f.fim, onchange: (e) => { f.fim = e.target.value || f.fim; } });
    const rapido = (nome, ini, fim) => h("button", { class: "btn", onclick: () => { f.inicio = ini; f.fim = fim; inicioEl.value = ini; fimEl.value = fim; } }, nome);
    const dom = proximoDomingo();
    const mes = proximoMes();
    painel({
      titulo: "Período do pedido",
      sub: "A equipe marca a disponibilidade para estes dias.",
      corpo: [
        h("div", { class: "acoes" }, rapido("Próximas 2 semanas", dom, E.somarDias(dom, 13)), rapido("Próximo mês", `${mes}-01`, E.fimDoMes(mes))),
        h("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px" }, h("label", { class: "campo" }, "De", inicioEl), h("label", { class: "campo" }, "Até", fimEl)),
      ],
      rodape: (fechar) => [h("button", { class: "btn primario", onclick: () => {
        if (f.fim < f.inicio) return avisar("A data final vem antes da inicial.");
        fechar(true);
        mudou(() => { state.pedido = { inicio: f.inicio, fim: f.fim }; });
      } }, "Salvar")],
      foco: ".acoes .btn",
    });
  }

  function pedirNoWhatsApp(periodo, dias) {
    const igreja = (state.igreja && state.igreja.nome) || "";
    const link = (state.igreja && state.igreja.link) || "";
    const texto = [
      `*Disponibilidade do louvor*${igreja ? ` · ${igreja}` : ""}`,
      `_${E.formatarPeriodo(periodo.inicio, periodo.fim)}_`,
      "",
      link ? "Marque no link os dias em que você pode servir:" : "Responda com os dias em que você pode servir:",
      link ? `${link}#disponibilidade` : "",
      "",
      "Dias de culto:",
      ...dias.map((d) => `• ${E.formatarData(d.data, "dia")} · ${d.cultos.map((c) => horaCurta(c.hora)).join(" e ")}`),
      "",
      link ? "Se o link não abrir, responda aqui com os dias em que pode." : "",
    ].filter((l, i, a) => l || (i > 0 && a[i - 1])).join("\n").trim();
    const pre = h("pre", { class: "texto" }, texto);
    painel({
      titulo: "Pedir disponibilidade",
      sub: link ? "Cole no grupo do louvor. Quem abrir o link marca os dias num calendário." : "Quem receber responde com os dias em que pode.",
      corpo: pre,
      rodape: () => [h("button", { class: "btn primario", onclick: () => copiar(texto, pre) }, icone("copiar"), "Copiar texto")],
      foco: "footer .btn",
    });
  }

  function colarRespostas() {
    const area = h("textarea", { id: "colar-respostas", rows: 6, placeholder: "Cole aqui as mensagens com o código #disp que a equipe mandou" });
    const previa = h("p", { class: "small muted" }, "Cole uma ou várias mensagens de uma vez.");
    let lidas = [];
    area.addEventListener("input", () => {
      lidas = E.lerRespostas(state, area.value);
      previa.textContent = lidas.length ? lidas.map((r) => `${(porId(state.pessoas, r.pessoaId) || {}).nome}: ${r.dias.length} ${r.dias.length === 1 ? "dia" : "dias"}`).join(" · ") : "Nenhum código #disp encontrado ainda.";
    });
    painel({
      titulo: "Colar respostas",
      sub: "Para quem mandou a disponibilidade pelo WhatsApp.",
      corpo: [area, previa],
      rodape: (fechar) => [h("button", { class: "btn primario", onclick: () => {
        if (!lidas.length) return avisar("Nenhuma resposta para salvar.");
        fechar(true);
        const lote = lidas;
        comDesfazer(`${lote.length} ${lote.length === 1 ? "resposta salva" : "respostas salvas"}.`, () => lote.forEach(guardarResposta));
      } }, "Salvar respostas")],
      foco: "#colar-respostas",
    });
  }

  function editarDisponibilidade(pessoa) {
    const periodo = pedidoAtual();
    const id = E.idResposta(pessoa.id, periodo.inicio);
    const existente = (state.respostas || []).find((r) => r.id === id);
    const dias = new Set(existente ? existente.dias : []);
    let obs = existente ? existente.obs || "" : "";
    const cal = calendario(periodo, dias);
    painel({
      titulo: `Disponibilidade de ${pessoa.nome}`,
      sub: existente ? `Respondida em ${E.formatarData(existente.em.slice(0, 10), "curta")}` : "Ainda não respondeu. Marque os dias em que a pessoa pode.",
      corpo: [
        cal.el,
        h("div", { class: "acoes" },
          h("button", { class: "btn tonal", onclick: () => { cal.dias.forEach((d) => dias.add(d.data)); cal.redesenhar(); } }, "Pode em todos"),
          h("button", { class: "btn texto", onclick: () => { dias.clear(); cal.redesenhar(); } }, "Limpar")),
        h("label", { class: "campo" }, "Recado", h("textarea", { rows: 2, value: obs, oninput: (e) => { obs = e.target.value; } })),
      ],
      rodape: (fechar) => [
        existente ? h("button", { class: "btn perigo", style: "margin-right:auto", onclick: () => { fechar(true); comDesfazer("Resposta apagada.", () => { state.respostas = state.respostas.filter((r) => r.id !== id); }); } }, icone("lixo"), "Apagar") : null,
        h("button", { class: "btn primario", onclick: () => {
          fechar(true);
          mudou(() => guardarResposta({ id, pessoaId: pessoa.id, inicio: periodo.inicio, fim: periodo.fim, dias: [...dias].sort(), obs: obs.trim(), em: new Date().toISOString() }));
          avisar(`Disponibilidade de ${pessoa.nome} salva.`);
        } }, "Salvar"),
      ],
      foco: ".dia-culto",
    });
  }

  function gerarComRespostas(periodo, existente) {
    const faltam = state.pessoas.filter((p) => p.ativo !== false && !(state.respostas || []).some((r) => r.id === E.idResposta(p.id, periodo.inicio))).length;
    const gerar = () => {
      if (existente) {
        comDesfazer("Escala atualizada com as respostas. O que estava fixado foi mantido.", () => {
          state.escalas[state.escalas.indexOf(existente)] = E.gerarEscala(state, { inicio: periodo.inicio, fim: periodo.fim }, existente);
          ui.escalaId = existente.id;
        });
      } else {
        const esc = E.gerarEscala(state, { inicio: periodo.inicio, fim: periodo.fim, tipo: "personalizado" });
        mudou(() => { state.escalas.push(esc); ui.escalaId = esc.id; });
        avisar(`Escala criada com ${esc.cultos.length} cultos.`);
      }
      irPara("escala");
    };
    if (!faltam) return gerar();
    painel({
      titulo: `${faltam} ${faltam === 1 ? "pessoa ainda não respondeu" : "pessoas ainda não responderam"}`,
      sub: state.regras.soQuemRespondeu ? "Pelos ajustes, quem não respondeu não entra na escala." : "Quem não respondeu pode entrar, mas só depois de quem confirmou que pode.",
      corpo: h("p", { class: "muted" }, "Dá para gerar agora e atualizar depois, quando chegarem as outras respostas. O que você fixar à mão é mantido."),
      rodape: (fechar) => [h("button", { class: "btn" , onclick: () => fechar() }, "Esperar"), h("button", { class: "btn primario", onclick: () => { fechar(true); gerar(); } }, "Gerar agora")],
      foco: "footer .btn.primario",
    });
  }

  /* ---------------------------------------------------------- músicas */

  function usosMusicas() {
    const mapa = {};
    const marcar = (id, data) => {
      const u = (mapa[id] = mapa[id] || { ultima: null, proxima: null });
      if (data <= hoje()) { if (!u.ultima || data > u.ultima) u.ultima = data; }
      else if (!u.proxima || data < u.proxima) u.proxima = data;
    };
    for (const m of state.musicas) if (m.ultimaVez) marcar(m.id, m.ultimaVez);
    for (const e of state.escalas) for (const c of e.cultos) if (!E.liderDe(e, c)) for (const v of c.musicas) if (v.id) marcar(v.id, c.data);
    return mapa;
  }

  function telaMusicas() {
    const FILTROS = [
      { id: "todas", nome: "Todas", fn: () => true },
      { id: "hino", nome: "Salmos e Hinos", fn: (m) => m.tipo === "hino" },
      { id: "louvor", nome: "Louvores", fn: (m) => m.tipo === "louvor" },
      { id: "solene", nome: "Aptas ao solene", fn: (m) => E.aptaSolene(state, m) && m.ativo !== false },
      { id: "fora", nome: "Fora do rodízio", fn: (m) => m.ativo === false },
    ];
    const usos = usosMusicas();
    const lista = h("div", { class: "cartao", style: "overflow:hidden" });
    const PRINCIPAIS = ["trinitario", "cristocentrico", "doutrinario"];
    const contagem = h("p", { class: "small muted", "aria-live": "polite" });
    const desenhar = () => {
      const f = FILTROS.find((x) => x.id === ui.filtro) || FILTROS[0];
      const q = E.normalizar(ui.busca);
      const itens = state.musicas
        .filter((m) => f.fn(m) && (!q || E.normalizar(`${m.numero} ${m.titulo} ${m.autor}`).includes(q)))
        .sort((a, b) => a.tipo.localeCompare(b.tipo) || String(a.numero).localeCompare(String(b.numero), "pt-BR", { numeric: true }) || a.titulo.localeCompare(b.titulo, "pt-BR"));
      contagem.textContent = `${itens.length} de ${state.musicas.length} músicas`;
      lista.replaceChildren(itens.length ? h("ul", { class: "lista" }, itens.map((m) => {
        const u = usos[m.id] || {};
        const temas = (m.tags || []).map((t) => (porId(state.tags, t) || { nome: t }).nome).join(", ");
        const quando = [u.ultima ? `cantada em ${E.formatarData(u.ultima, "curta")}` : "", u.proxima ? `próxima: ${E.formatarData(u.proxima, "curta")}` : ""].filter(Boolean).join(" · ");
        const destaques = (m.tags || []).filter((t) => PRINCIPAIS.includes(t));
        const outras = (m.tags || []).filter((t) => !PRINCIPAIS.includes(t)).map((t) => (porId(state.tags, t) || { nome: t }).nome).join(", ");
        return h("li", { class: "musica-linha" },
          h("button", { class: "linha", onclick: () => editarMusica(m), "aria-label": `${E.rotuloMusica(m)}. Editar` },
            h("span", { class: `marcador ${m.tipo === "louvor" ? "louvor" : "hino"}`, "aria-hidden": "true" }, m.tipo === "louvor" ? icone("musica") : m.numero ? `SH ${m.numero}` : "SH"),
            h("span", {},
              h("span", { class: "titulo" }, m.titulo || `Salmos e Hinos nº ${m.numero}`), m.ativo === false ? h("span", { class: "selo neutro", style: "margin-left:6px" }, "Fora do rodízio") : null, h("br"),
              h("span", { class: "sub" }, [m.autor, m.tom ? `tom ${m.tom}` : "", outras || (destaques.length ? "" : temas || "sem etiquetas"), quando].filter(Boolean).join(" · ")),
              destaques.length ? h("span", { class: "etiquetas" }, destaques.map((t) => h("span", { class: "selo azul" }, E.nomeTag(state, t)))) : null),
            E.aptaSolene(state, m) ? h("span", { class: "selo solene", title: "Segue a orientação do culto solene" }, "Solene") : h("span")),
          m.link ? h("a", { class: "btn icone", href: m.link, target: "_blank", rel: "noopener", "aria-label": `Ouvir ${m.titulo} no YouTube`, style: "margin-right:8px" }, icone("play")) : h("span"));
      })) : h("div", { class: "vazio", style: "border:0" }, h("span", { class: "icone-vazio" }, icone("busca")), h("p", {}, state.musicas.length ? "Nenhuma música com essa busca ou filtro." : "Repertório vazio. Importe a lista de Salmos e Hinos e a de louvores.")));
    };
    desenhar();
    const r = state.regras;
    const nomes = (ts) => (ts || []).map((t) => E.nomeTag(state, t)).join(" e ") || "qualquer etiqueta";
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" },
        h("div", {}, h("h1", {}, "Músicas"), h("p", { class: "muted", style: "max-width:70ch" }, `No culto solene entram Salmos e Hinos marcados como ${nomes(r.soleneTagsHinario)} e louvores marcados como ${nomes(r.soleneTagsLouvor)}.`)),
        h("div", { class: "acoes" },
          h("button", { class: "btn", onclick: importarMusicas }, icone("importar"), "Importar"),
          h("button", { class: "btn primario", onclick: () => editarMusica(null) }, icone("mais"), "Música"))),
      h("div", { class: "busca" }, icone("busca"), h("input", { type: "search", id: "busca-musicas", placeholder: "Buscar por título ou número", "aria-label": "Buscar músicas", value: ui.busca, oninput: (e) => { ui.busca = e.target.value; desenhar(); } })),
      h("div", { class: "rolagem-x", role: "group", "aria-label": "Filtrar" }, FILTROS.map((f) => h("button", { class: "chip", "aria-pressed": String(ui.filtro === f.id), onclick: () => { ui.filtro = f.id; render(); } }, f.nome, h("span", { class: "conta" }, String(state.musicas.filter(f.fn).length))))),
      contagem,
      lista);
  }

  function seletorTags(selecionadas) {
    const caixa = h("div", { class: "chips" });
    const desenhar = () => caixa.replaceChildren(...state.tags.map((t) => h("button", {
      type: "button", class: "chip", "aria-pressed": String(selecionadas.includes(t.id)),
      onclick: () => {
        const i = selecionadas.indexOf(t.id);
        if (i >= 0) selecionadas.splice(i, 1);
        else selecionadas.push(t.id);
        desenhar();
      },
    }, t.nome)));
    desenhar();
    return caixa;
  }

  function segmentado(rotulo, opcoes, atual, aoMudar) {
    const caixa = h("div", { class: "segmentado", role: "group", "aria-label": rotulo, style: "display:grid" });
    caixa.append(...opcoes.map((o) => h("button", {
      type: "button", "aria-pressed": String(o.id === atual),
      onclick: (e) => { [...caixa.children].forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget))); aoMudar(o.id); },
    }, o.nome)));
    return caixa;
  }

  function editarMusica(original) {
    const m = original ? clone(original) : { id: E.novoId("m"), tipo: "louvor", numero: "", titulo: "", autor: "", link: "", tags: [], tom: "", ativo: true, obs: "", ultimaVez: "" };
    const set = (k) => (e) => { m[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; };
    const numero = h("label", { class: "campo", hidden: m.tipo !== "hino" || null }, "Número no hinário", h("input", { type: "text", id: "mus-numero", inputmode: "numeric", value: m.numero, oninput: set("numero") }));
    painel({
      titulo: original ? "Editar música" : "Nova música",
      corpo: [
        segmentado("Tipo", E.TIPOS_MUSICA, m.tipo, (id) => { m.tipo = id; numero.hidden = id !== "hino"; }),
        numero,
        h("label", { class: "campo" }, "Título", h("input", { type: "text", id: "mus-titulo", value: m.titulo, oninput: set("titulo") })),
        h("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px" },
          h("label", { class: "campo" }, "Autor ou ministério", h("input", { type: "text", id: "mus-autor", value: m.autor, oninput: set("autor") })),
          h("label", { class: "campo" }, "Tom", h("input", { type: "text", id: "mus-tom", value: m.tom, placeholder: "Ex.: Ré", oninput: set("tom") }))),
        h("label", { class: "campo" }, "Link para ouvir", h("input", { type: "url", id: "mus-link", value: m.link || "", placeholder: "https://youtu.be/…", oninput: set("link") })),
        h("div", { class: "campo" }, "Etiquetas", h("span", { class: "ajuda" }, "Trinitário, cristocêntrico e doutrinário decidem se a música entra nos cultos solenes."), seletorTags(m.tags)),
        h("label", { class: "campo" }, "Última vez que foi cantada", h("span", { class: "ajuda" }, "Só se foi antes das escalas feitas aqui."), h("input", { type: "date", id: "mus-ultima", value: m.ultimaVez || "", onchange: set("ultimaVez") })),
        h("label", { class: "campo" }, "Observações", h("textarea", { id: "mus-obs", rows: 2, value: m.obs, oninput: set("obs") })),
        h("label", { class: "interruptor" }, h("span", {}, "No rodízio", h("small", {}, "Desligue para não entrar nas próximas escalas")), h("input", { type: "checkbox", role: "switch", checked: m.ativo !== false, onchange: set("ativo") })),
      ],
      rodape: (fechar) => [
        original ? h("button", { class: "btn perigo", style: "margin-right:auto", onclick: () => { fechar(true); comDesfazer("Música excluída.", () => { state.musicas = state.musicas.filter((x) => x.id !== original.id); }); } }, icone("lixo"), "Excluir") : null,
        h("button", {
          class: "btn primario", onclick: () => {
            if (!m.titulo.trim() && !String(m.numero).trim()) return avisar("Escreva o título ou o número.");
            if (m.tipo === "louvor") m.numero = "";
            m.titulo = m.titulo.trim();
            fechar(true);
            mudou(() => { if (original) Object.assign(original, m); else state.musicas.push(m); });
            avisar(original ? "Música atualizada." : "Música adicionada.");
          },
        }, "Salvar"),
      ],
      foco: "#mus-titulo",
    });
  }

  function importarMusicas() {
    const padrao = { tipo: "hino", tags: [] };
    const area = h("textarea", { id: "imp-texto", rows: 7, placeholder: "Uma música por linha. Exemplos:\n245\n12 - Santo! Santo! Santo!\nLouvor; Porque Ele vive; cristocêntrico, doutrinário" });
    const previa = h("p", { class: "small muted" });
    const chave = (m) => `${m.tipo}|${m.numero}|${E.normalizar(m.titulo)}`;
    const existentes = new Set(state.musicas.map(chave));
    let novas = [];
    const atualizar = () => {
      const lidas = E.lerListaMusicas(state, area.value, padrao);
      novas = lidas.filter((m) => !existentes.has(chave(m)));
      previa.textContent = lidas.length
        ? `${novas.length} nova${novas.length === 1 ? "" : "s"}${lidas.length > novas.length ? ` · ${lidas.length - novas.length} já no repertório` : ""}${novas.length ? `: ${novas.slice(0, 4).map(E.rotuloMusica).join(", ")}${novas.length > 4 ? "…" : ""}` : ""}`
        : "Cole a lista acima.";
    };
    area.addEventListener("input", atualizar);
    atualizar();
    painel({
      titulo: "Importar músicas",
      sub: "Copie do Word, Excel, PDF ou WhatsApp e cole aqui.",
      corpo: [h("div", { class: "campo" }, "Tipo, quando a linha não disser", segmentado("Tipo das músicas", E.TIPOS_MUSICA, padrao.tipo, (id) => { padrao.tipo = id; atualizar(); })), area, previa],
      rodape: (fechar) => [h("button", {
        class: "btn primario", onclick: () => {
          if (!novas.length) return avisar("Nenhuma música nova para importar.");
          fechar(true);
          const lote = novas;
          comDesfazer(`${lote.length} músicas importadas.`, () => { state.musicas.push(...lote); });
        },
      }, "Importar")],
      foco: "#imp-texto",
    });
  }

  /* ----------------------------------------------------------- equipe */

  function descreverPessoa(p) {
    const f = (p.funcoes || []).map((x) => E.nomeFuncao(state, x)).join(", ");
    const a = (p.apoio || []).map((x) => E.nomeFuncao(state, x).toLowerCase()).join(", ");
    return [f || "sem função", a ? `apoio: ${a}` : ""].filter(Boolean).join(" · ");
  }

  function telaEquipe() {
    const ativas = state.pessoas.filter((p) => p.ativo !== false);
    const pessoas = [...state.pessoas].sort((a, b) => (a.ativo === false) - (b.ativo === false) || a.nome.localeCompare(b.nome, "pt-BR"));
    const escala = porId(state.escalas, ui.escalaId);
    const vezes = {};
    if (escala) for (const l of E.resumoPessoas(state, escala)) vezes[l.pessoa.id] = l.total;
    const periodo = pedidoAtual();
    const respondeu = (p) => (state.respostas || []).some((r) => r.id === E.idResposta(p.id, periodo.inicio));
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" },
        h("div", {}, h("h1", {}, "Equipe"), h("p", { class: "muted" }, `${ativas.length} pessoas no rodízio`)),
        h("button", { class: "btn primario", onclick: () => editarPessoa(null) }, icone("pessoaMais"), "Pessoa")),
      h("section", { "aria-label": "Titulares por função" }, h("div", { class: "cobertura" }, state.funcoes.map((f) => {
        const n = ativas.filter((p) => (p.funcoes || []).includes(f.id)).length;
        const a = ativas.filter((p) => (p.apoio || []).includes(f.id)).length;
        return h("div", { class: n ? null : "falta" }, h("b", {}, String(n)), h("span", {}, `${f.nome}${a ? ` · +${a} apoio` : ""}${n ? "" : " · sem titular"}`));
      }))),
      pessoas.length ? h("div", { class: "equipe-grade" }, pessoas.map((p) => {
        const datas = (p.indisponivel || []).filter((x) => (x.split("..")[1] || x) >= hoje()).length;
        const cultos = (p.cultos || []).map((id) => porId(state.cultos, id)).filter(Boolean);
        return h("button", { class: `pessoa-cartao${p.ativo === false ? " pausado" : ""}`, onclick: () => editarPessoa(p), "aria-label": `${p.nome}. ${descreverPessoa(p)}. Editar` },
          h("div", { class: "cab" }, avatar(p),
            h("div", { style: "min-width:0;flex:1" }, h("b", {}, p.nome || "Sem nome"), h("span", {}, cultos.length ? cultos.map((c) => `${E.DIAS_CURTOS[c.diaSemana]} ${c.hora}`).join(" · ") : "Serve em todos os cultos")),
            p.ativo === false ? h("span", { class: "selo neutro" }, "Pausado") : datas ? h("span", { class: "selo alerta" }, `${datas} ${datas === 1 ? "data" : "datas"} fora`) : null),
          h("div", { class: "funcoes-p" },
            (p.funcoes || []).map((f) => h("span", { class: "selo azul" }, E.nomeFuncao(state, f))),
            (p.apoio || []).map((f) => h("span", { class: "selo neutro" }, `${E.nomeFuncao(state, f)} · apoio`)),
            !(p.funcoes || []).length && !(p.apoio || []).length ? h("span", { class: "small muted" }, "Sem função") : null),
          h("div", { class: "pe" },
            escala ? h("span", {}, icone("escala"), `${vezes[p.id] || 0}× nesta escala`) : null,
            h("span", { style: respondeu(p) ? "color:var(--ok)" : null }, icone(respondeu(p) ? "certo" : "agenda"), respondeu(p) ? "Disponibilidade enviada" : "Não respondeu")));
      })) : h("div", { class: "vazio" }, h("span", { class: "icone-vazio" }, icone("pessoas")), h("p", {}, "Ninguém cadastrado ainda.")));
  }

  function editorDatas(lista) {
    const caixa = h("div", { style: "display:grid;gap:10px" });
    const desenhar = () => {
      const de = h("input", { type: "date", min: hoje() });
      const ate = h("input", { type: "date" });
      const futuras = lista.filter((x) => (x.split("..")[1] || x) >= hoje()).sort();
      caixa.replaceChildren(
        futuras.length ? h("div", { class: "chips" }, futuras.map((x) => {
          const [a, b] = x.split("..");
          return h("span", { class: "chip", style: "padding-right:4px" }, b ? `${E.formatarData(a, "curta")} a ${E.formatarData(b, "curta")}` : E.formatarData(a, "dia"),
            h("button", { class: "btn icone", style: "width:32px;min-height:32px", "aria-label": "Tirar esta data", onclick: () => { lista.splice(lista.indexOf(x), 1); desenhar(); } }, icone("fechar")));
        })) : h("p", { class: "small muted" }, "Nenhuma data marcada."),
        h("div", { style: "display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:end" },
          h("label", { class: "campo" }, "De", de), h("label", { class: "campo" }, "Até (opcional)", ate),
          h("button", { class: "btn tonal", onclick: () => {
            if (!de.value) return avisar("Escolha a data.");
            lista.push(ate.value && ate.value > de.value ? `${de.value}..${ate.value}` : de.value);
            desenhar();
          } }, "Marcar")));
    };
    desenhar();
    return caixa;
  }

  function editarPessoa(original) {
    const p = original ? clone(original) : { id: E.novoId("p"), nome: "", funcoes: [], apoio: [], cultos: [], indisponivel: [], ativo: true, obs: "" };
    const funcoes = h("div", { class: "chips" });
    const desenharFuncoes = () => funcoes.replaceChildren(...state.funcoes.map((f) => {
      const nivel = E.nivelFuncao(p, f.id);
      return h("button", {
        type: "button", class: `chip${nivel === "apoio" ? " apoio" : ""}`, "aria-pressed": String(nivel === "principal"),
        "aria-label": `${f.nome}: ${nivel === "principal" ? "titular" : nivel === "apoio" ? "só apoio" : "não faz"}`,
        onclick: () => {
          // não faz → titular → só apoio → não faz
          p.funcoes = p.funcoes.filter((x) => x !== f.id);
          p.apoio = p.apoio.filter((x) => x !== f.id);
          if (!nivel) p.funcoes.push(f.id);
          else if (nivel === "principal") p.apoio.push(f.id);
          desenharFuncoes();
        },
      }, nivel === "apoio" ? `${f.nome} · apoio` : f.nome);
    }));
    desenharFuncoes();
    const cultos = h("div", { class: "chips" });
    const desenharCultos = () => cultos.replaceChildren(...state.cultos.map((c) => h("button", {
      type: "button", class: "chip", "aria-pressed": String(p.cultos.includes(c.id)),
      onclick: () => { p.cultos = p.cultos.includes(c.id) ? p.cultos.filter((x) => x !== c.id) : [...p.cultos, c.id]; desenharCultos(); },
    }, `${E.DIAS_CURTOS[c.diaSemana]} ${c.hora} · ${c.nome}`)));
    desenharCultos();
    painel({
      titulo: original ? p.nome || "Pessoa" : "Nova pessoa",
      corpo: [
        h("label", { class: "campo" }, "Nome", h("input", { type: "text", id: "pes-nome", value: p.nome, autocomplete: "off", oninput: (e) => { p.nome = e.target.value; } })),
        h("div", { class: "campo" }, "O que faz no louvor", h("span", { class: "ajuda" }, "Toque uma vez: titular. Duas: só apoio (entra quando falta titular). Três: tira."), funcoes),
        h("div", { class: "campo" }, "Em quais cultos serve", h("span", { class: "ajuda" }, "Nenhum marcado: serve em todos."), cultos),
        h("div", { class: "campo" }, "Datas em que não pode", editorDatas(p.indisponivel)),
        h("label", { class: "campo" }, "Observações", h("textarea", { id: "pes-obs", rows: 2, value: p.obs || "", oninput: (e) => { p.obs = e.target.value; } })),
        h("label", { class: "interruptor" }, h("span", {}, "No rodízio", h("small", {}, "Desligue para pausar sem apagar")), h("input", { type: "checkbox", role: "switch", checked: p.ativo !== false, onchange: (e) => { p.ativo = e.target.checked; } })),
      ],
      rodape: (fechar) => [
        original ? h("button", { class: "btn perigo", style: "margin-right:auto", onclick: () => { fechar(true); comDesfazer(`${original.nome || "Pessoa"} saiu da equipe.`, () => { state.pessoas = state.pessoas.filter((x) => x.id !== original.id); }); } }, icone("lixo"), "Excluir") : null,
        h("button", {
          class: "btn primario", onclick: () => {
            if (!p.nome.trim()) return avisar("Escreva o nome.");
            p.nome = p.nome.trim();
            fechar(true);
            mudou(() => { if (original) Object.assign(original, p); else state.pessoas.push(p); });
            avisar(original ? "Dados atualizados." : `${p.nome} entrou na equipe.`);
          },
        }, "Salvar"),
      ],
      foco: original ? ".chips .chip" : "#pes-nome",
    });
  }

  /* ---------------------------------------------------------- ajustes */

  function passo(valor, min, max, aoMudar, rotulo) {
    const out = h("output", {}, String(valor));
    const menos = h("button", { type: "button", "aria-label": `Menos ${rotulo}` }, "−");
    const mais = h("button", { type: "button", "aria-label": `Mais ${rotulo}` }, "+");
    const atualizar = () => { out.textContent = String(valor); menos.disabled = valor <= min; mais.disabled = valor >= max; };
    menos.addEventListener("click", () => { valor = Math.max(min, valor - 1); atualizar(); aoMudar(valor); });
    mais.addEventListener("click", () => { valor = Math.min(max, valor + 1); atualizar(); aoMudar(valor); });
    atualizar();
    return h("span", { class: "passo", role: "group", "aria-label": rotulo }, menos, out, mais);
  }

  function telaAjustes() {
    const r = state.regras;
    const cultos = [...state.cultos].sort((a, b) => Number(a.diaSemana) - Number(b.diaSemana) || (a.hora || "").localeCompare(b.hora || ""));
    const linha = (titulo, sub, onclick, ic, direita) => h("li", {}, h("button", { class: "linha", onclick },
      h("span", { class: "icone-linha", "aria-hidden": "true" }, icone(ic || "ajustes")), h("span", {}, h("span", { class: "titulo" }, titulo), h("br"), h("span", { class: "sub" }, sub)), direita || icone("dir")));
    const grupo = (titulo, acao, ...conteudo) => h("section", { class: "grupo-ajustes" },
      h("div", { class: "cabecalho", style: "padding:0 4px;align-items:center;min-height:34px" }, h("h2", { style: "font-size:var(--t-md)" }, titulo), acao || null), ...conteudo);
    const tagsTexto = (ts) => (ts || []).map((t) => E.nomeTag(state, t)).join(", ") || "livre";
    const tema = temaSalvo();
    const opcaoTema = (id, nome, ic) => h("button", { "aria-pressed": String(tema === id), onclick: () => { try { localStorage.setItem(CHAVE_TEMA, id); } catch (e) { /* sem armazenamento */ } aplicarTema(id); render(); } }, icone(ic), nome);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const instalado = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" }, h("div", {}, h("h1", {}, "Ajustes"), h("p", { class: "muted" }, "Cultos, regras de escolha das músicas, equipe e preferências do app."))),
      h("div", { class: "ajustes-grade" },
        h("div", { style: "display:grid;gap:var(--e-6)" },
          grupo("Cultos da semana", h("button", { class: "btn texto mini", onclick: () => editarCulto(null) }, icone("mais"), "Culto"),
            h("ul", { class: "lista cartao" }, cultos.map((c) => {
              const lider = porId(state.cultos, c.acompanha);
              const m = c.musicas || {};
              const pessoas = (c.equipe || []).reduce((n, q) => n + (Number(q.qtd) || 0), 0);
              const sub = lider ? `Mesma equipe e músicas do ${lider.nome}` : `${pessoas} pessoas · ${m.hino || 0} de Salmos e Hinos · ${m.louvor || 0} louvores`;
              return h("li", {}, h("button", { class: "linha", onclick: () => editarCulto(c) },
                h("span", { class: "marcador", "aria-hidden": "true" }, E.DIAS_CURTOS[c.diaSemana]),
                h("span", {}, h("span", { class: "titulo" }, `${c.hora} · ${c.nome}`), h("br"), h("span", { class: "sub" }, sub)),
                c.ativo === false ? h("span", { class: "selo neutro" }, "Desligado") : c.solene ? h("span", { class: "selo solene" }, "Solene") : icone("dir")));
            }))),
          grupo("Escolha das músicas", null,
            h("ul", { class: "lista cartao" },
              linha("Orientação pastoral", `Culto solene · Salmos e Hinos: ${tagsTexto(r.soleneTagsHinario)} · Louvores: ${tagsTexto(r.soleneTagsLouvor)}`, editarRegras, "livro"),
              linha("Repetição", `Uma música só volta depois de ${r.intervaloMusicaSemanas || 0} semana${r.intervaloMusicaSemanas === 1 ? "" : "s"}`, editarRegras, "atualizar"),
              linha("Etiquetas", `${state.tags.length} etiquetas para marcar as músicas`, () => editarLista("Etiquetas das músicas", state.tags, "Nova etiqueta", (id) => state.musicas.some((m) => (m.tags || []).includes(id)) || (r.soleneTagsHinario || []).includes(id) || (r.soleneTagsLouvor || []).includes(id)), "filtro")))),
        h("div", { style: "display:grid;gap:var(--e-6)" },
          grupo("Igreja e equipe", null,
            h("ul", { class: "lista cartao" },
              linha("Igreja e link da escala", `${state.igreja.nome || "—"}${state.igreja.link ? " · link cadastrado" : " · sem link"}`, editarIgreja, "igreja"),
              linha("Funções do louvor", state.funcoes.map((f) => f.nome).join(", "), () => editarLista("Funções do louvor", state.funcoes, "Nova função", (id) => state.pessoas.some((p) => (p.funcoes || []).concat(p.apoio || []).includes(id)) || state.cultos.some((c) => (c.equipe || []).some((q) => q.funcao === id))), "pessoas"),
              linha("Duas funções no mesmo culto", r.permitirAcumular ? "Permitido" : "Não permitido", editarRegras, "pessoa"))),
          grupo("Aparência", null,
            h("div", { class: "cartao secao" },
              h("div", { class: "segmentado", role: "group", "aria-label": "Tema", style: "display:grid" }, opcaoTema("auto", "Automático", "auto"), opcaoTema("light", "Claro", "sol"), opcaoTema("dark", "Escuro", "lua")),
              h("p", { class: "small muted" }, "Automático segue o tema do aparelho. Vale só neste aparelho."))),
          grupo("Dados e aplicativo", null,
            h("ul", { class: "lista cartao" },
              linha("Backup", armazem.db ? "Salvo no servidor. Baixe uma cópia de vez em quando." : "Salvo neste aparelho. Baixe uma cópia de vez em quando.", telaBackup, "baixar"),
              instalado ? null
                : ui.instalar ? linha("Instalar o app", "Abre como aplicativo, com ícone na tela inicial", async () => { const e = ui.instalar; ui.instalar = null; e.prompt(); try { await e.userChoice; } catch (x) { /* */ } render(); }, "instalar")
                  : linha("Instalar o app", ios ? "No Safari: Compartilhar › Adicionar à Tela de Início" : "No menu do navegador: Instalar app ou Adicionar à tela inicial", () => avisar(ios ? "No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início." : "Abra o menu do navegador e escolha Instalar app (ou Adicionar à tela inicial)."), "instalar"))))));
  }

  function editarCulto(original) {
    const c = original ? clone(original) : { id: E.novoId("cul"), nome: "", diaSemana: 0, hora: "19:00", semanas: [], solene: false, ativo: true, equipe: [{ funcao: (state.funcoes[0] || {}).id, qtd: 1 }], musicas: { hino: 1, louvor: 2 }, acompanha: "" };
    c.musicas = Object.assign({ hino: 0, louvor: 0 }, c.musicas);
    c.equipe = c.equipe || [];
    const SEMANAS = [[1, "1ª"], [2, "2ª"], [3, "3ª"], [4, "4ª"], [5, "5ª"], ["ultima", "Última"]];
    const equipe = h("div", { style: "display:grid;gap:8px" });
    const desenharEquipe = () => equipe.replaceChildren(
      ...c.equipe.map((q, i) => h("div", { style: "display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center" },
        h("select", { "aria-label": "Função", onchange: (e) => { q.funcao = e.target.value; } }, state.funcoes.map((f) => h("option", { value: f.id, selected: f.id === q.funcao || null }, f.nome))),
        passo(Number(q.qtd) || 1, 1, 8, (v) => { q.qtd = v; }, `Quantidade de ${E.nomeFuncao(state, q.funcao)}`),
        h("button", { class: "btn icone", "aria-label": "Tirar função", onclick: () => { c.equipe.splice(i, 1); desenharEquipe(); } }, icone("fechar")))),
      h("button", { class: "btn texto", style: "justify-self:start", onclick: () => { c.equipe.push({ funcao: (state.funcoes.find((f) => !c.equipe.some((q) => q.funcao === f.id)) || state.funcoes[0] || {}).id, qtd: 1 }); desenharEquipe(); } }, icone("mais"), "Função"));
    desenharEquipe();
    const semanas = h("div", { class: "chips" });
    const desenharSemanas = () => semanas.replaceChildren(...SEMANAS.map(([v, n]) => h("button", {
      type: "button", class: "chip", "aria-pressed": String((c.semanas || []).includes(v)),
      onclick: () => { c.semanas = (c.semanas || []).includes(v) ? c.semanas.filter((x) => x !== v) : [...(c.semanas || []), v]; desenharSemanas(); },
    }, n)));
    desenharSemanas();
    const lideres = state.cultos.filter((x) => x.id !== c.id && !x.acompanha);
    const proprio = h("div", { style: "display:grid;gap:16px", hidden: c.acompanha || null },
      h("div", { class: "campo" }, "Equipe", equipe),
      h("div", { class: "campo" }, "Músicas",
        h("div", { class: "interruptor" }, h("span", {}, "Salmos e Hinos"), passo(c.musicas.hino, 0, 6, (v) => { c.musicas.hino = v; }, "Salmos e Hinos")),
        h("div", { class: "interruptor" }, h("span", {}, "Louvores"), passo(c.musicas.louvor, 0, 8, (v) => { c.musicas.louvor = v; }, "Louvores"))));
    painel({
      titulo: original ? c.nome || "Culto" : "Novo culto",
      sub: "Mudanças valem para as próximas escalas geradas.",
      corpo: [
        h("label", { class: "campo" }, "Nome", h("input", { type: "text", id: "cul-nome", value: c.nome, placeholder: "Ex.: Culto solene", oninput: (e) => { c.nome = e.target.value; } })),
        h("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px" },
          h("label", { class: "campo" }, "Dia", h("select", { id: "cul-dia", onchange: (e) => { c.diaSemana = Number(e.target.value); } }, E.DIAS.map((d, i) => h("option", { value: i, selected: Number(c.diaSemana) === i || null }, d)))),
          h("label", { class: "campo" }, "Hora", h("input", { type: "time", id: "cul-hora", value: c.hora || "", onchange: (e) => { c.hora = e.target.value; } }))),
        h("label", { class: "interruptor" }, h("span", {}, "Culto solene", h("small", {}, "Músicas seguem a orientação do pastor")), h("input", { type: "checkbox", role: "switch", checked: !!c.solene, onchange: (e) => { c.solene = e.target.checked; } })),
        lideres.length ? h("label", { class: "campo" }, "Mesma equipe e músicas de outro culto",
          h("span", { class: "ajuda" }, "Ex.: domingo à noite repete o culto da manhã; muda só a ordem das músicas."),
          h("select", { id: "cul-acomp", onchange: (e) => { c.acompanha = e.target.value; proprio.hidden = !!c.acompanha; } },
            h("option", { value: "" }, "Não, escala própria"),
            lideres.map((x) => h("option", { value: x.id, selected: c.acompanha === x.id || null }, `${x.nome} (${E.DIAS_CURTOS[x.diaSemana]} ${x.hora})`)))) : null,
        proprio,
        h("div", { class: "campo" }, "Semanas do mês", h("span", { class: "ajuda" }, "Nenhuma marcada: toda semana."), semanas),
        h("label", { class: "interruptor" }, h("span", {}, "Culto ativo", h("small", {}, "Desligue para não entrar nas escalas")), h("input", { type: "checkbox", role: "switch", checked: c.ativo !== false, onchange: (e) => { c.ativo = e.target.checked; } })),
      ],
      rodape: (fechar) => [
        original ? h("button", { class: "btn perigo", style: "margin-right:auto", onclick: () => {
          fechar(true);
          comDesfazer("Culto excluído. As escalas já feitas não mudam.", () => {
            state.cultos = state.cultos.filter((x) => x.id !== original.id);
            state.cultos.forEach((x) => { if (x.acompanha === original.id) x.acompanha = ""; });
          });
        } }, icone("lixo"), "Excluir") : null,
        h("button", {
          class: "btn primario", onclick: () => {
            if (!c.nome.trim()) return avisar("Escreva o nome do culto.");
            c.nome = c.nome.trim();
            const lider = porId(state.cultos, c.acompanha);
            if (lider && Number(lider.diaSemana) !== Number(c.diaSemana)) return avisar("Para repetir outro culto, os dois precisam ser no mesmo dia da semana.");
            fechar(true);
            mudou(() => { if (original) Object.assign(original, c); else state.cultos.push(c); });
            avisar("Culto salvo. Vale para as próximas escalas.");
          },
        }, "Salvar"),
      ],
      foco: original ? "#cul-dia" : "#cul-nome",
    });
  }

  function editarRegras() {
    const r = clone(state.regras);
    r.soleneTagsHinario = r.soleneTagsHinario || [];
    r.soleneTagsLouvor = r.soleneTagsLouvor || [];
    painel({
      titulo: "Escolha das músicas",
      corpo: [
        h("p", { class: "small muted" }, "Nos cultos solenes, só entram músicas com estas etiquetas. Se faltar música apta, a escala avisa em vez de colocar uma fora da orientação."),
        h("div", { class: "campo" }, "Salmos e Hinos precisam ser", seletorTags(r.soleneTagsHinario)),
        h("div", { class: "campo" }, "Louvores precisam ser", seletorTags(r.soleneTagsLouvor)),
        h("div", { class: "interruptor" }, h("span", {}, "Semanas antes de repetir uma música", h("small", {}, "Com repertório curto, ela repete a mais antiga e avisa")), passo(r.intervaloMusicaSemanas || 0, 0, 12, (v) => { r.intervaloMusicaSemanas = v; }, "Semanas antes de repetir")),
        h("label", { class: "interruptor" }, h("span", {}, "Duas funções no mesmo culto", h("small", {}, "Ex.: tocar e cantar ao mesmo tempo")), h("input", { type: "checkbox", role: "switch", checked: !!r.permitirAcumular, onchange: (e) => { r.permitirAcumular = e.target.checked; } })),
        h("label", { class: "interruptor" }, h("span", {}, "Só escalar quem respondeu a disponibilidade", h("small", {}, "Desligado: quem não respondeu entra depois de quem confirmou")), h("input", { type: "checkbox", role: "switch", checked: !!r.soQuemRespondeu, onchange: (e) => { r.soQuemRespondeu = e.target.checked; } })),
      ],
      rodape: (fechar) => [h("button", { class: "btn primario", onclick: () => { fechar(true); mudou(() => { state.regras = r; }); avisar("Ajustes salvos."); } }, "Salvar")],
      foco: ".chip",
    });
  }

  function editarLista(titulo, lista, novoNome, emUso) {
    const copia = clone(lista);
    const caixa = h("div", { style: "display:grid;gap:8px" });
    const desenhar = () => caixa.replaceChildren(
      ...copia.map((x, i) => h("div", { style: "display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px" },
        h("input", { type: "text", value: x.nome, "aria-label": titulo, oninput: (e) => { x.nome = e.target.value; } }),
        h("button", { class: "btn icone", "aria-label": `Tirar ${x.nome}`, onclick: () => {
          if (lista.some((y) => y.id === x.id) && emUso(x.id)) return avisar(`"${x.nome}" está em uso e não pode sair.`);
          copia.splice(i, 1);
          desenhar();
        } }, icone("fechar")))),
      h("button", { class: "btn texto", style: "justify-self:start", onclick: () => {
        const base = E.normalizar(novoNome).replace(/\s+/g, "-");
        let id = base;
        let n = 2;
        while (porId(copia, id)) id = `${base}-${n++}`;
        copia.push({ id, nome: "" });
        desenhar();
        const campos = caixa.querySelectorAll("input");
        campos[campos.length - 1].focus();
      } }, icone("mais"), novoNome));
    desenhar();
    painel({
      titulo,
      corpo: caixa,
      rodape: (fechar) => [h("button", { class: "btn primario", onclick: () => {
        const limpos = copia.filter((x) => x.nome.trim()).map((x) => ({ ...x, nome: x.nome.trim() }));
        fechar(true);
        mudou(() => { lista.splice(0, lista.length, ...limpos); });
        avisar("Lista salva.");
      } }, "Salvar")],
      foco: "footer .btn",
    });
  }

  function editarIgreja() {
    let nome = state.igreja.nome || "";
    let link = state.igreja.link || "";
    painel({
      titulo: "Igreja e link da escala",
      corpo: [
        h("label", { class: "campo" }, "Nome da igreja", h("span", { class: "ajuda" }, "Aparece no topo e no texto do WhatsApp."), h("input", { type: "text", id: "igreja-nome", value: nome, oninput: (e) => { nome = e.target.value; } })),
        h("label", { class: "campo" }, "Link da escala para a equipe", h("span", { class: "ajuda" }, "Vai no pedido de disponibilidade."), h("input", { type: "url", id: "igreja-link", value: link, placeholder: "https://escalas.igrejacongregacionalpombal.com.br", oninput: (e) => { link = e.target.value; } })),
      ],
      rodape: (fechar) => [h("button", { class: "btn primario", onclick: () => { fechar(true); mudou(() => { state.igreja.nome = nome.trim(); state.igreja.link = link.trim(); }); } }, "Salvar")],
      foco: "#igreja-nome",
    });
  }

  async function baixarBackup() {
    const dados = JSON.stringify(state, null, 2);
    const nome = `escala-louvor-${hoje()}.json`;
    const url = URL.createObjectURL(new Blob([dados], { type: "application/json" }));
    const a = h("a", { href: url, download: nome });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function restaurar(texto) {
    let dados;
    try {
      dados = JSON.parse(texto);
    } catch (e) {
      return avisar("Esse texto não é um backup da Escala do Louvor.");
    }
    if (!dados || typeof dados !== "object" || !(dados.cultos || dados.pessoas || dados.musicas)) return avisar("Esse arquivo não parece um backup da Escala do Louvor.");
    if (fecharAtual) fecharAtual(true);
    comDesfazer("Backup restaurado.", () => { state = E.migrar(dados, D.configuracaoBase()); ui.escalaId = null; garantirEscalaAtual(); });
  }

  function telaBackup() {
    const area = h("textarea", { id: "backup-texto", rows: 4, placeholder: "Ou cole aqui o conteúdo de um backup" });
    const arquivo = h("input", { type: "file", id: "backup-arquivo", accept: ".json,application/json", onchange: (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const leitor = new FileReader();
      leitor.onload = () => restaurar(String(leitor.result));
      leitor.readAsText(f);
    } });
    const n = (k) => state[k].length;
    painel({
      titulo: "Backup",
      sub: armazem.db ? "Os dados ficam no servidor da igreja, iguais no celular e no computador." : "Os dados ficam neste aparelho. Se limpar o navegador, eles somem: guarde uma cópia.",
      corpo: [
        h("p", { class: "small muted num" }, `${n("pessoas")} pessoas · ${n("musicas")} músicas · ${n("cultos")} cultos · ${n("escalas")} escalas`),
        h("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:8px" },
          h("button", { class: "btn tonal", onclick: baixarBackup }, icone("baixar"), "Baixar"),
          h("button", { class: "btn", onclick: () => copiar(JSON.stringify(state)) }, icone("copiar"), "Copiar dados")),
        h("div", { class: "campo" }, "Restaurar um backup", h("span", { class: "ajuda" }, "Substitui tudo; dá para desfazer logo em seguida."), arquivo, area,
          h("button", { class: "btn", style: "justify-self:start", onclick: () => (area.value.trim() ? restaurar(area.value) : avisar("Cole o backup no campo.")) }, "Restaurar do texto")),
        h("div", { class: "campo" }, "Recomeçar",
          h("button", { class: "btn perigo", style: "justify-self:start", onclick: () => { fecharAtual(true); comDesfazer("Dados voltaram ao início.", () => { state = estadoInicial(); ui.escalaId = null; garantirEscalaAtual(); }); } }, "Voltar aos dados iniciais")),
      ],
      foco: ".btn.tonal",
    });
  }

  iniciar();
})();
