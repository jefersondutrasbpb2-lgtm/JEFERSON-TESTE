/*
 * Interface da Escala do Louvor.
 *
 * Quatro telas (Escala, Músicas, Equipe, Ajustes). Toda edição abre num painel
 * (que sobe da base no celular); exclusões e mudanças grandes podem ser
 * desfeitas pelo aviso no rodapé. O estado inteiro mora em `state`; cada
 * alteração passa por `mudou()`, que salva no navegador e, quando a página roda
 * no site da igreja (com servidor.js e api.php), também no servidor. A lógica
 * fica em engine.js.
 */
(function () {
  "use strict";

  const E = window.EscalaEngine;
  const D = window.EscalaDados;
  const TELAS = [
    { id: "escala", nome: "Escala", icone: "calendario" },
    { id: "agenda", nome: "Agenda", icone: "agenda" },
    { id: "musicas", nome: "Músicas", icone: "nota" },
    { id: "equipe", nome: "Equipe", icone: "pessoas" },
    { id: "ajustes", nome: "Ajustes", icone: "ajustes" },
  ];
  const MOBILE = "(max-width: 759px)";

  let state = null;
  const ui = { tela: "escala", escalaId: null, ordemDe: {}, busca: "", filtro: "todas", coordena: true, resposta: null };

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

  const ICONES = {
    calendario: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    agenda: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8.5 15l2.5 2.5 4.5-5"/>',
    colar: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>',
    nota: '<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    ajustes: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    opcoes: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
    enviar: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z"/>',
    sortear: '<path d="M4 4v6h6M20 20v-6h-6"/><path d="M5.5 15a7 7 0 0 0 12.3 2.5M18.5 9A7 7 0 0 0 6.2 6.5"/>',
    pino: '<path d="M9 4h6l-1 6 4 4H6l4-4-1-6ZM12 14v7"/>',
    fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
    cima: '<path d="m6 15 6-6 6 6"/>',
    baixo: '<path d="m6 9 6 6 6-6"/>',
    busca: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5Z"/>',
    lixo: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    baixar: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    imprimir: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
    importar: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    ok: '<path d="m5 12 4.5 4.5L19 7"/>',
    nota2: '<path d="M5 4h10l4 4v12H5Z"/><path d="M9 12h6M9 16h4"/>',
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
    const area = document.getElementById("avisos-rodape");
    const el = h("div", { class: "aviso-rodape", role: "status" }, h("span", {}, msg),
      acao ? h("button", { onclick: () => { el.remove(); acao.fazer(); } }, acao.rotulo) : null);
    area.replaceChildren(el);
    setTimeout(() => el.remove(), acao ? 7000 : 3200);
  }

  /** Faz uma alteração que pode ser desfeita pelo aviso do rodapé. */
  function comDesfazer(msg, fn) {
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
  const armazem = { db: null, user: null, ultimo: {}, antigas: new Set(), timer: null, salvando: false, pendente: false };

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

  function mostrarSalvo(estado, texto) {
    const el = document.getElementById("salvo");
    el.dataset.estado = estado;
    el.lastChild.textContent = texto;
  }

  function salvar() {
    gravarLocal();
    if (!armazem.db) return mostrarSalvo("ok", "Salvo neste aparelho");
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
      mostrarSalvo("ok", "Salvo");
    } catch (e) {
      const msg = {
        quota_exceeded: "O espaço de dados acabou. Exclua escalas antigas.",
        invalid_argument: "Uma parte dos dados ficou grande demais para salvar. Baixe um backup em Ajustes.",
        revoked: "Sua sessão de coordenador terminou. Entre de novo para salvar.",
      }[e && e.code] || "Não consegui salvar no servidor agora. Tento de novo na próxima alteração.";
      mostrarSalvo("erro", "Não salvo");
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
        armazem.db = null;
        avisar("Não consegui abrir os dados do servidor. Por enquanto, as alterações ficam só neste aparelho.");
      }
    }
    const base = D.configuracaoBase();
    if (remoto) state = E.migrar(remoto, base, D.repertorio());
    else if (salvoLocal) state = E.migrar(salvoLocal, base, D.repertorio());
    else state = estadoInicial();
    // Quem não entrou como coordenador (a equipe, pelo link) só vê a tela de disponibilidade.
    if (armazem.db && armazem.user) {
      try { ui.coordena = await armazem.user.canEdit(); } catch (e) { ui.coordena = false; }
    }
    const hash = location.hash.slice(1);
    if (TELAS.some((t) => t.id === hash)) ui.tela = hash;
    if (!ui.coordena || hash === "disponibilidade") ui.tela = "disponibilidade";
    garantirEscalaAtual();
    if (ui.coordena) salvar(); // grava a migração (ou os dados iniciais) e leva para o servidor o que estava só no aparelho
    else mostrarSalvo("ok", armazem.db ? "Conectado" : "Neste aparelho");
    if (armazem.db) acompanharRespostas();
    render();
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
    window.scrollTo({ top: 0 });
  }

  function render() {
    const nav = document.getElementById("nav");
    nav.hidden = ui.tela === "disponibilidade";
    document.body.classList.toggle("sem-nav", nav.hidden);
    nav.replaceChildren(...TELAS.map((t) => h("button", {
      "aria-current": ui.tela === t.id ? "page" : null, onclick: () => irPara(t.id),
    }, h("span", { class: "pilula" }, icone(t.icone)), t.nome)));
    document.getElementById("nome-igreja").textContent = (state.igreja && state.igreja.nome) || "";
    const telas = { escala: telaEscala, agenda: telaAgenda, disponibilidade: telaDisponibilidade, musicas: telaMusicas, equipe: telaEquipe, ajustes: telaAjustes };
    lembrarAberta();
    const y = window.scrollY;
    document.getElementById("app").replaceChildren(telas[ui.tela]());
    window.scrollTo({ top: y });
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

  /* ---------------------------------------------------------- escala */

  function telaEscala() {
    const escala = porId(state.escalas, ui.escalaId);
    if (!escala) {
      return h("div", { class: "tela" },
        h("div", { class: "vazio" },
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
      ? h("button", { class: "btn tonal", onclick: () => verAvisos(escala, avisos) }, h("span", { class: "selo erro" }, String(erros)), erros > 1 ? "pendências" : "pendência")
      : alertas
        ? h("button", { class: "btn tonal", onclick: () => verAvisos(escala, avisos) }, h("span", { class: "selo alerta" }, String(alertas)), alertas > 1 ? "alertas" : "alerta")
        : h("span", { class: "selo ok", style: "min-height:32px;padding:0 12px" }, "Tudo certo");

    // Um cartão por culto; cultos ligados (ex.: domingo 9h e 18h) dividem o mesmo cartão.
    const dias = [];
    escala.cultos.forEach((c, ci) => {
      if (E.liderDe(escala, c)) return;
      let d = dias.find((x) => x.data === c.data);
      if (!d) dias.push((d = { data: c.data, cultos: [] }));
      d.cultos.push(ci);
    });

    return h("div", { class: "tela" },
      h("section", { class: "cartao" },
        h("div", { class: "seletor-escala" },
          h("button", { class: "periodo", onclick: trocarEscala, "aria-label": `Escala de ${E.formatarPeriodo(escala.inicio, escala.fim)}. Trocar ou criar outra` },
            h("span", { class: "rotulo" }, escala.status === "confirmada" ? "Escala confirmada" : "Rascunho da escala"),
            h("b", {}, E.formatarPeriodo(escala.inicio, escala.fim), icone("baixo")),
            h("span", { class: "small muted" }, `${dias.length} ${dias.length === 1 ? "dia" : "dias"} de culto · toque para trocar ou criar outra`)),
          h("button", { class: "btn icone", "aria-label": "Mais opções da escala", onclick: () => opcoesEscala(escala) }, icone("opcoes"))),
        h("div", { class: "resumo" },
          h("button", { class: "btn primario", onclick: () => enviarWhatsApp(escala) }, icone("enviar"), "Enviar no WhatsApp"),
          estado)),
      dias.map((d) => h("section", { class: "dia", "aria-label": E.formatarData(d.data, "longa") },
        h("h2", {}, E.formatarData(d.data, "longa")),
        d.cultos.map((ci) => cartaoCulto(escala, ci, porCampo)))));
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
        }, fixo.has(`e:${v.si}`) ? icone("pino") : null, p ? p.nome : "a definir");
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
    return h("article", { class: "cartao culto", id: `culto-${culto.id}` },
      h("header", { class: "culto-cab" },
        h("div", { class: "horarios" },
          grupo.map((x) => h("div", { class: "horario" }, x.hora ? h("span", { class: "hora" }, x.hora) : null, h("h3", {}, x.nome))),
          culto.solene || culto.avulso ? h("div", { class: "selos" },
            culto.solene ? h("span", { class: "selo solene" }, "Solene") : null,
            culto.avulso ? h("span", { class: "selo neutro" }, "Extra") : null) : null),
        h("button", { class: "btn icone", "aria-label": `Opções do culto ${culto.nome}`, onclick: () => opcoesCulto(escala, ci) }, icone("opcoes"))),
      equipe.length ? h("div", { class: "bloco" }, h("div", { class: "bloco-cab" }, h("span", { class: "rotulo" }, "Equipe")), h("div", { class: "funcoes" }, equipe)) : null,
      h("div", { class: "bloco" },
        h("div", { class: "bloco-cab" },
          h("span", { class: "rotulo" }, "Músicas"),
          seguidores.length ? h("div", { class: "segmentado", role: "group", "aria-label": "Ver a ordem das músicas de qual culto" }, grupo.map((x) => h("button", {
            "aria-pressed": String(x === mostrado), onclick: () => { ui.ordemDe[culto.id] = x.id; render(); },
          }, x.hora || x.nome))) : null),
        ehSeguidor ? h("p", { class: "small muted" }, `Mesmas músicas do culto das ${culto.hora}. Aqui você muda só a ordem.`) : null,
        musicas.length ? h("ol", { class: "musicas" }, musicas) : h("p", { class: "small muted" }, "Este culto não tem músicas configuradas.")),
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
        h("button", { class: "btn tonal largo", onclick: () => { fecharAtual(); mudou(() => E.sortearCampo(state, escala, ci, `e:${si}`)); } }, icone("sortear"), "Sortear outra pessoa"),
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
        h("button", { class: "btn tonal largo", onclick: () => { fecharAtual(); mudou(() => E.sortearCampo(state, escala, ci, `m:${k}`)); } }, icone("sortear"), "Sortear outra música"),
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
    const f = { tipo: "quinzenal", inicio: proximoDomingo(), mes: proximoMes(), fim: "" };
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
      corpo.replaceChildren(
        h("div", { class: "segmentado", role: "group", "aria-label": "Período", style: "display:grid" }, tipo("quinzenal", "Quinzenal"), tipo("mensal", "Mensal"), tipo("personalizado", "Outro")),
        f.tipo === "mensal"
          ? h("label", { class: "campo" }, "Mês", h("input", { type: "month", id: "nova-mes", value: f.mes, onchange: (e) => { f.mes = e.target.value || f.mes; desenhar(); } }))
          : h("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px" },
              h("label", { class: "campo" }, f.tipo === "quinzenal" ? "Começa em" : "De", h("input", { type: "date", id: "nova-inicio", value: f.inicio, onchange: (e) => { f.inicio = e.target.value || f.inicio; desenhar(); } })),
              f.tipo === "personalizado" ? h("label", { class: "campo" }, "Até", h("input", { type: "date", id: "nova-fim", value: p.fim, min: f.inicio, onchange: (e) => { f.fim = e.target.value; desenhar(); } })) : null),
        h("p", { class: "muted" }, `${E.formatarPeriodo(p.inicio, p.fim)} · ${qtd} ${qtd === 1 ? "culto" : "cultos"}`));
      if (botao) botao.disabled = qtd === 0;
    };
    desenhar();
    painel({
      titulo: "Nova escala",
      sub: "A equipe e as músicas são distribuídas automaticamente; depois é só ajustar.",
      corpo,
      rodape: (fechar) => [botao = h("button", {
        class: "btn primario", onclick: () => {
          const p = periodo();
          const esc = E.gerarEscala(state, { inicio: p.inicio, fim: p.fim, tipo: f.tipo });
          fechar(true);
          ui.tela = "escala";
          mudou(() => { state.escalas.push(esc); ui.escalaId = esc.id; });
          window.scrollTo({ top: 0 });
          avisar(`Escala criada com ${esc.cultos.length} cultos.`);
        },
      }, "Gerar escala")],
      foco: ".segmentado button",
    });
    desenhar();
  }

  function cultoExtra(escala) {
    const modelos = state.cultos;
    const f = { data: escala.inicio, cultoId: (modelos[0] || {}).id, nome: "", hora: "19:00", solene: false };
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
      h("label", { class: "interruptor" }, h("span", {}, "Culto solene", h("small", {}, "Aplica a orientação do pastor às músicas")), h("input", { type: "checkbox", role: "switch", checked: f.solene, onchange: (e) => { f.solene = e.target.checked; } })));
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
          mudou(() => { ci = E.adicionarCultoExtra(state, escala, { ...f, nome: f.nome.trim() }); });
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

  function enviarWhatsApp(escala) {
    let links = false;
    const pre = h("pre", { class: "texto", id: "texto-whatsapp" });
    const atualizar = () => { pre.textContent = E.textoWhatsApp(state, escala, { links }); };
    atualizar();
    painel({
      titulo: "Enviar no WhatsApp",
      sub: "Copie e cole no grupo. Negrito e itálico aparecem formatados.",
      corpo: [
        h("label", { class: "interruptor" }, h("span", {}, "Incluir links do YouTube", h("small", {}, "Para a equipe ensaiar")),
          h("input", { type: "checkbox", role: "switch", id: "com-links", onchange: (e) => { links = e.target.checked; atualizar(); } })),
        pre,
      ],
      rodape: () => [h("button", { class: "btn primario", onclick: () => copiar(pre.textContent, pre) }, icone("copiar"), "Copiar texto")],
      foco: "footer .btn",
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

  /** Senha do coordenador (definida na publicação do site). */
  async function entrarCoordenador() {
    if (!(await servidor.senhaDefinida())) return avisar("A senha do coordenador ainda não foi configurada no site.");
    let senha = "";
    painel({
      titulo: "Entrar como coordenador",
      sub: "Com a senha, este aparelho passa a montar e editar as escalas.",
      corpo: h("label", { class: "campo" }, "Senha", h("input", { type: "password", id: "senha-coord", autocomplete: "current-password", oninput: (e) => { senha = e.target.value; }, onkeydown: (e) => { if (e.key === "Enter") e.target.closest(".painel").querySelector("footer .btn.primario").click(); } })),
      rodape: () => [h("button", { class: "btn primario", onclick: async () => {
        if (!senha) return avisar("Digite a senha.");
        try {
          await servidor.entrar(senha);
          location.hash = "";
          location.reload();
        } catch (e) {
          avisar(e.message || "Não deu para entrar agora.");
        }
      } }, "Entrar")],
      foco: "#senha-coord",
    });
  }

  async function sair() {
    try {
      await servidor.sair();
    } finally {
      location.hash = "disponibilidade";
      location.reload();
    }
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
    const voltar = ui.coordena ? h("button", { class: "btn texto", onclick: () => irPara("agenda") }, "Voltar ao app")
      : servidor ? h("button", { class: "btn texto", onclick: entrarCoordenador }, "Sou o coordenador") : null;
    if (!pessoa) {
      const ativas = state.pessoas.filter((p) => p.ativo !== false).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      return h("div", { class: "tela" },
        h("div", { class: "cabecalho" }, h("div", {}, h("h1", {}, "Sua disponibilidade"), h("p", { class: "muted" }, `Cultos de ${E.formatarPeriodo(periodo.inicio, periodo.fim)}`)), voltar),
        h("section", { class: "cartao secao" },
          h("h2", { style: "font-size:1.15rem" }, "Quem é você?"),
          h("div", { class: "nomes" }, ativas.map((p) => h("button", { class: "btn", onclick: () => {
            ui.respostaPessoa = p.id;
            ui.resposta = null;
            try { localStorage.setItem(CHAVE_PESSOA, p.id); } catch (e) { /* sem armazenamento */ }
            render();
          } }, p.nome)))));
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
        h("p", {}, "Toque nos dias em que você ", h("b", {}, "pode"), " servir. Só os dias com culto podem ser marcados."),
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

  /** Agenda do coordenador: pedido, quem respondeu e a grade de disponibilidade. */
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
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" },
        h("div", {}, h("h1", {}, "Agenda"), h("p", { class: "small muted" }, "Cada pessoa marca os dias em que pode servir; a escala é montada com essas respostas."))),
      h("section", { class: "cartao" },
        h("div", { class: "seletor-escala" },
          h("button", { class: "periodo", onclick: mudarPeriodo, "aria-label": `Período do pedido: ${E.formatarPeriodo(periodo.inicio, periodo.fim)}. Mudar` },
            h("span", { class: "rotulo" }, "Pedido de disponibilidade"),
            h("b", {}, E.formatarPeriodo(periodo.inicio, periodo.fim), icone("baixo")),
            h("span", { class: "small muted" }, `${dias.length} dias de culto · toque para mudar o período`))),
        h("div", { class: "resumo", style: "display:grid;gap:12px" },
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
      sub: link ? "Cole no grupo do louvor. Quem abrir o link marca os dias num calendário." : "Dica: cadastre o link da escala em Ajustes › Igreja para mandar junto.",
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
    const lista = h("div", { class: "cartao" });
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
        return h("li", { style: "display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center" },
          h("button", { class: "linha", onclick: () => editarMusica(m) },
            h("span", { class: `marcador${m.tipo === "louvor" ? " louvor" : ""}`, "aria-hidden": "true" }, m.tipo === "louvor" ? icone("nota") : m.numero ? `SH ${m.numero}` : "SH"),
            h("span", {},
              h("span", { class: "titulo" }, m.titulo || `Salmos e Hinos nº ${m.numero}`), m.ativo === false ? h("span", { class: "selo neutro", style: "margin-left:6px" }, "Fora do rodízio") : null, h("br"),
              h("span", { class: "sub" }, [temas || "sem etiquetas", quando].filter(Boolean).join(" · "))),
            E.aptaSolene(state, m) ? h("span", { class: "selo ok", title: "Segue a orientação do culto solene" }, "Solene") : h("span")),
          m.link ? h("a", { class: "btn icone", href: m.link, target: "_blank", rel: "noopener", "aria-label": `Ouvir ${m.titulo} no YouTube`, style: "margin-right:8px" }, icone("play")) : h("span"));
      })) : h("div", { class: "vazio", style: "border:0" }, h("p", {}, state.musicas.length ? "Nenhuma música com esse filtro." : "Repertório vazio. Importe a lista de Salmos e Hinos e a de louvores.")));
    };
    desenhar();
    const r = state.regras;
    const nomes = (ts) => (ts || []).map((t) => E.nomeTag(state, t)).join(" e ") || "qualquer etiqueta";
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" },
        h("div", {}, h("h1", {}, "Músicas"), h("p", { class: "small muted" }, `No culto solene entram Salmos e Hinos marcados como ${nomes(r.soleneTagsHinario)} e louvores marcados como ${nomes(r.soleneTagsLouvor)}.`)),
        h("div", { class: "acoes" },
          h("button", { class: "btn", onclick: importarMusicas }, icone("importar"), "Importar"),
          h("button", { class: "btn primario", onclick: () => editarMusica(null) }, icone("mais"), "Música"))),
      h("div", { class: "busca" }, icone("busca"), h("input", { type: "search", id: "busca-musicas", placeholder: "Buscar por título ou número", "aria-label": "Buscar músicas", value: ui.busca, oninput: (e) => { ui.busca = e.target.value; desenhar(); } })),
      h("div", { class: "rolagem-x", role: "group", "aria-label": "Filtrar" }, FILTROS.map((f) => h("button", { class: "chip", "aria-pressed": String(ui.filtro === f.id), onclick: () => { ui.filtro = f.id; render(); } }, f.nome))),
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
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" },
        h("div", {}, h("h1", {}, "Equipe"), h("p", { class: "small muted" }, `${ativas.length} pessoas no rodízio`)),
        h("button", { class: "btn primario", onclick: () => editarPessoa(null) }, icone("mais"), "Pessoa")),
      h("div", { class: "rolagem-x", role: "list", "aria-label": "Titulares por função" }, state.funcoes.map((f) => {
        const n = ativas.filter((p) => (p.funcoes || []).includes(f.id)).length;
        const a = ativas.filter((p) => (p.apoio || []).includes(f.id)).length;
        return h("span", { class: "chip", role: "listitem", style: n ? null : "border-color:var(--err);color:var(--err)" }, `${f.nome} ${n}${a ? ` + ${a} apoio` : ""}`);
      })),
      pessoas.length ? h("ul", { class: "lista cartao" }, pessoas.map((p) => {
        const datas = (p.indisponivel || []).filter((x) => (x.split("..")[1] || x) >= hoje()).length;
        return h("li", {}, h("button", { class: "linha", onclick: () => editarPessoa(p) },
          h("span", { class: "avatar", "aria-hidden": "true" }, (p.nome || "?").trim().charAt(0).toUpperCase()),
          h("span", {}, h("span", { class: "titulo" }, p.nome || "Sem nome"), h("br"), h("span", { class: "sub" }, descreverPessoa(p))),
          p.ativo === false ? h("span", { class: "selo neutro" }, "Pausado") : datas ? h("span", { class: "selo alerta" }, `${datas} ${datas === 1 ? "data" : "datas"} fora`) : h("span")));
      })) : h("div", { class: "vazio" }, h("p", {}, "Ninguém cadastrado ainda.")));
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
    const linha = (titulo, sub, onclick, direita) => h("li", {}, h("button", { class: "linha", onclick },
      h("span", { class: "avatar", "aria-hidden": "true" }, icone("ajustes")), h("span", {}, h("span", { class: "titulo" }, titulo), h("br"), h("span", { class: "sub" }, sub)), direita || h("span")));
    const secao = (titulo, ...conteudo) => h("section", { style: "display:grid;gap:10px" }, ...conteudo.length > 1 ? [h("div", { class: "cabecalho" }, h("h2", { style: "font-size:1.15rem" }, titulo), conteudo[0]), conteudo[1]] : [h("h2", { style: "font-size:1.15rem" }, titulo), conteudo[0]]);
    const tagsTexto = (ts) => (ts || []).map((t) => E.nomeTag(state, t)).join(", ") || "livre";
    return h("div", { class: "tela" },
      h("div", { class: "cabecalho" }, h("h1", {}, "Ajustes")),
      secao("Cultos da semana",
        h("button", { class: "btn texto", onclick: () => editarCulto(null) }, icone("mais"), "Culto"),
        h("ul", { class: "lista cartao" }, cultos.map((c) => {
          const lider = porId(state.cultos, c.acompanha);
          const m = c.musicas || {};
          const pessoas = (c.equipe || []).reduce((n, q) => n + (Number(q.qtd) || 0), 0);
          const sub = lider ? `Mesma equipe e músicas do ${lider.nome}` : `${pessoas} pessoas · ${m.hino || 0} de Salmos e Hinos · ${m.louvor || 0} louvores`;
          return h("li", {}, h("button", { class: "linha", onclick: () => editarCulto(c) },
            h("span", { class: "marcador", "aria-hidden": "true" }, E.DIAS_CURTOS[c.diaSemana]),
            h("span", {}, h("span", { class: "titulo" }, `${c.hora} · ${c.nome}`), h("br"), h("span", { class: "sub" }, sub)),
            c.ativo === false ? h("span", { class: "selo neutro" }, "Desligado") : c.solene ? h("span", { class: "selo solene" }, "Solene") : h("span")));
        }))),
      secao("Escolha das músicas",
        h("ul", { class: "lista cartao" },
          linha("Orientação pastoral", `Culto solene · Salmos e Hinos: ${tagsTexto(r.soleneTagsHinario)} · Louvores: ${tagsTexto(r.soleneTagsLouvor)}`, editarRegras),
          linha("Repetição", `Uma música só volta depois de ${r.intervaloMusicaSemanas || 0} semana${r.intervaloMusicaSemanas === 1 ? "" : "s"}`, editarRegras),
          linha("Etiquetas", `${state.tags.length} etiquetas para marcar as músicas`, () => editarLista("Etiquetas das músicas", state.tags, "Nova etiqueta", (id) => state.musicas.some((m) => (m.tags || []).includes(id)) || (r.soleneTagsHinario || []).includes(id) || (r.soleneTagsLouvor || []).includes(id))))),
      secao("Equipe",
        h("ul", { class: "lista cartao" },
          linha("Funções do louvor", state.funcoes.map((f) => f.nome).join(", "), () => editarLista("Funções do louvor", state.funcoes, "Nova função", (id) => state.pessoas.some((p) => (p.funcoes || []).concat(p.apoio || []).includes(id)) || state.cultos.some((c) => (c.equipe || []).some((q) => q.funcao === id)))),
          linha("Duas funções no mesmo culto", r.permitirAcumular ? "Permitido" : "Não permitido", editarRegras))),
      secao("Dados",
        h("ul", { class: "lista cartao" },
          linha("Igreja e link da escala", `${state.igreja.nome || "—"}${state.igreja.link ? " · link cadastrado" : " · sem link"}`, editarIgreja),
          linha("Backup", armazem.db ? "Salvo no servidor. Baixe uma cópia de vez em quando." : "Salvo neste aparelho. Baixe uma cópia de vez em quando.", telaBackup),
          servidor ? linha("Sair do modo coordenador", "Neste aparelho, volta a mostrar só a tela de disponibilidade", sair) : null)));
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
