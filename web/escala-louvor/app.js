/*
 * Interface da Escala do Louvor.
 *
 * O estado inteiro mora em `state`; cada alteração chama `mudou()`, que salva
 * (no navegador e, quando aberto como Artifact no Claude, também na nuvem) e
 * redesenha a aba atual. A lógica de escala fica em engine.js.
 */
(function () {
  "use strict";

  const E = window.EscalaEngine;
  const X = window.EscalaDados;
  const CARGOS = ["Pastor", "Presbítero", "Diácono", "Evangelista", "Missionário", "Outro"];
  const ABAS = [
    { id: "escalas", nome: "Escalas" },
    { id: "repertorio", nome: "Repertório" },
    { id: "equipe", nome: "Equipe do louvor" },
    { id: "oficiais", nome: "Oficiais" },
    { id: "liturgias", nome: "Liturgias" },
    { id: "cultos", nome: "Cultos e regras" },
    { id: "backup", nome: "Backup" },
  ];

  let state = null;
  const ui = {
    aba: "escalas",
    escalaId: null,
    liturgiaId: null,
    nova: { tipo: "quinzenal", inicio: "", mes: "", fim: "", titulo: "" },
    rep: { busca: "", tipo: "", tag: "", solene: false },
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
      else if (k === "html") el.innerHTML = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const f of filhos.flat(Infinity)) {
      if (f === null || f === undefined || f === false) continue;
      el.append(f instanceof Node ? f : document.createTextNode(String(f)));
    }
    return el;
  }

  const ICONES = {
    lock: '<rect x="4" y="9" width="12" height="9" rx="1.5"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" stroke-width="2"/>',
    unlock: '<rect x="4" y="9" width="12" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 9V6.5a3 3 0 0 1 5.8-1.1" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    refresh: '<path d="M10 3a7 7 0 0 1 6.3 4H18V2l-2 2.1A9 9 0 0 0 1 10h2a7 7 0 0 1 7-7Zm7 7a7 7 0 0 1-13.3 3H6v-2H1v5l1.9-1.9A9 9 0 0 0 19 10h-2Z"/>',
    plus: '<path d="M9 3h2v6h6v2h-6v6H9v-6H3V9h6z"/>',
    trash: '<path d="M7 2h6l1 2h4v2H2V4h4l1-2Zm-3 5h12l-1 11H5L4 7Z"/>',
    copy: '<path d="M6 2h10v12h-2V4H6V2ZM3 6h10v12H3V6Z"/>',
    up: '<path d="m10 5 6 7h-4v4H8v-4H4z"/>',
    down: '<path d="m10 15-6-7h4V4h4v4h4z"/>',
    x: '<path d="m5.4 4 4.6 4.6L14.6 4 16 5.4 11.4 10l4.6 4.6-1.4 1.4-4.6-4.6L5.4 16 4 14.6 8.6 10 4 5.4z"/>',
    print: '<path d="M5 2h10v4H5V2ZM2 7h16v8h-3v3H5v-3H2V7Zm5 6v3h6v-3H7Z"/>',
    download: '<path d="M9 2h2v8l3-3 1.4 1.4L10 13.8 4.6 8.4 6 7l3 3V2ZM3 15h14v3H3z"/>',
  };
  function icone(nome) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 20 20");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = ICONES[nome];
    return s;
  }

  const porId = E.porId;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const hoje = () => E.isoData(new Date());

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

  function toast(msg) {
    const t = h("div", { class: "toast", role: "status" }, msg);
    document.body.append(t);
    setTimeout(() => t.remove(), 2800);
  }

  async function copiar(texto, alvo) {
    try {
      await navigator.clipboard.writeText(texto);
      toast("Copiado. É só colar no WhatsApp.");
    } catch (e) {
      if (alvo) {
        const r = document.createRange();
        r.selectNodeContents(alvo);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
      toast("Não consegui copiar sozinho. O texto ficou selecionado: use Copiar do seu aparelho.");
    }
  }

  /* --------------------------------------------------- armazenamento */

  const CHAVE_LOCAL = "escala-louvor:v1";
  const SECOES = ["config", "pessoas", "oficiais", "musicas", "liturgias", "cultos"];
  const armazem = { db: null, downloads: null, ultimo: {}, timer: null, salvando: false, pendente: false };

  function secao(nome) {
    if (nome === "config") {
      return { versao: state.versao, igreja: state.igreja, funcoes: state.funcoes, tags: state.tags, regras: state.regras, exemplo: !!state.exemplo };
    }
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
      /* navegador sem armazenamento: segue só na memória (ou na nuvem) */
    }
  }

  async function lerNuvem(db) {
    const s = {};
    const docs = await Promise.all(SECOES.map((n) => db.doc(`dados/${n}`).get()));
    let achou = false;
    docs.forEach((snap, i) => {
      if (!snap.exists) return;
      achou = true;
      const dados = snap.data();
      armazem.ultimo[SECOES[i]] = JSON.stringify(dados);
      if (SECOES[i] === "config") Object.assign(s, clone(dados));
      else s[SECOES[i]] = clone(dados.itens || []);
    });
    const escalas = await db.collection("escalas").get();
    s.escalas = escalas.docs.map((d) => {
      armazem.ultimo[`escala:${d.id}`] = JSON.stringify(d.data());
      return clone(d.data());
    });
    if (escalas.size) achou = true;
    return achou ? s : null;
  }

  function mostrarSalvo(estado, texto) {
    const el = document.getElementById("salvo");
    el.dataset.estado = estado;
    el.lastChild.textContent = texto;
  }

  function salvar() {
    gravarLocal();
    if (!armazem.db) {
      mostrarSalvo("ok", "Salvo neste navegador");
      return;
    }
    mostrarSalvo("salvando", "Salvando…");
    clearTimeout(armazem.timer);
    armazem.timer = setTimeout(salvarNuvem, 700);
  }

  async function salvarNuvem() {
    if (armazem.salvando) {
      armazem.pendente = true;
      return;
    }
    armazem.salvando = true;
    try {
      for (const nome of SECOES) {
        const corpo = secao(nome);
        const json = JSON.stringify(corpo);
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
      mostrarSalvo("ok", "Salvo na nuvem");
    } catch (e) {
      const msg = {
        quota_exceeded: "O espaço de dados acabou. Exclua escalas antigas na aba Escalas.",
        invalid_argument: "Uma parte dos dados ficou grande demais para salvar. Baixe um backup e fale com quem cuida da ferramenta.",
        revoked: "Você não tem mais permissão para salvar aqui.",
      }[e && e.code] || "Não consegui salvar na nuvem agora. Tento de novo na próxima alteração.";
      mostrarSalvo("erro", "Não salvo na nuvem");
      toast(msg);
    } finally {
      armazem.salvando = false;
      if (armazem.pendente) {
        armazem.pendente = false;
        salvarNuvem();
      }
    }
  }

  /** Aplica uma alteração, salva e redesenha. */
  function mudou(fn, redesenhar) {
    if (fn) fn();
    salvar();
    if (redesenhar !== false) render();
  }

  async function iniciar() {
    let local = lerLocal();
    const temClaude = !!(window.claude && typeof window.claude.use === "function");
    if (temClaude) {
      try {
        armazem.db = await window.claude.use("db");
        armazem.downloads = await window.claude.use("downloads");
      } catch (e) {
        armazem.db = null;
      }
    }
    let remoto = null;
    if (armazem.db) {
      try {
        remoto = await lerNuvem(armazem.db);
      } catch (e) {
        armazem.db = null;
        toast("Não consegui abrir os dados da nuvem. Por enquanto, as alterações ficam só neste navegador.");
      }
    }
    if (remoto) state = E.migrar(remoto, X.configuracaoBase());
    else if (local) state = E.migrar(local, X.configuracaoBase());
    else state = novoInicial();
    if (armazem.db && !remoto && local && !local.exemplo) salvar(); // leva para a nuvem o que já estava no navegador
    else mostrarSalvo("ok", armazem.db ? "Salvo na nuvem" : "Salvo neste navegador");
    if (!armazem.db) gravarLocal();
    const hash = location.hash.slice(1);
    if (ABAS.some((a) => a.id === hash)) ui.aba = hash;
    ui.escalaId = escalasOrdenadas()[0] ? escalasOrdenadas()[0].id : null;
    renderAbas();
    render();
  }

  function novoInicial() {
    const s = X.estadoInicial();
    const inicio = proximoDomingo();
    s.escalas.push(E.gerarEscala(s, { inicio, fim: E.somarDias(inicio, 13), tipo: "quinzenal", seed: 1 }));
    return s;
  }

  /* ---------------------------------------------------------- moldura */

  function renderAbas() {
    const nav = document.getElementById("abas");
    nav.replaceChildren(
      ...ABAS.map((a) =>
        h("button", {
          class: "aba", role: "tab", id: `aba-${a.id}`, "aria-selected": String(ui.aba === a.id),
          onclick: () => { ui.aba = a.id; try { history.replaceState(null, "", `#${a.id}`); } catch (e) { /* sem histórico */ } renderAbas(); render(); window.scrollTo({ top: 0 }); },
        }, a.nome)
      )
    );
    document.getElementById("nome-igreja").textContent = (state.igreja && state.igreja.nome) || "";
  }

  function render() {
    const app = document.getElementById("app");
    const telas = { escalas: telaEscalas, repertorio: telaRepertorio, equipe: telaEquipe, oficiais: telaOficiais, liturgias: telaLiturgias, cultos: telaCultos, backup: telaBackup };
    const y = window.scrollY;
    app.replaceChildren(avisoExemplo(), telas[ui.aba]());
    window.scrollTo({ top: y });
  }

  function avisoExemplo() {
    if (!state.exemplo) return null;
    return h("div", { class: "aviso-exemplo", role: "note" },
      h("p", {}, h("strong", {}, "Equipe de exemplo. "), "Liturgias e repertório já são os da igreja, mas as pessoas do louvor e os oficiais (menos o pastor) são fictícios, só para mostrar a ferramenta funcionando. Cadastre a equipe e os oficiais e depois apague os exemplos."),
      h("div", { class: "acoes" },
        h("button", { class: "btn primario", onclick: () => confirmar("Apagar os dados de exemplo?", "As pessoas e os oficiais de exemplo saem, junto com as escalas feitas com eles. Repertório, liturgias, cultos e regras continuam.", "Apagar exemplos", limparExemplos) }, "Apagar exemplos"),
        h("button", { class: "btn", onclick: () => mudou(() => { state.exemplo = false; }) }, "Já são meus dados")
      )
    );
  }

  function limparExemplos() {
    mudou(() => {
      state.pessoas = state.pessoas.filter((p) => !p.exemplo);
      state.oficiais = state.oficiais.filter((o) => !o.exemplo);
      state.musicas = state.musicas.filter((m) => !m.exemplo);
      state.escalas = [];
      state.exemplo = false;
      ui.escalaId = null;
    });
    toast("Exemplos apagados.");
  }

  /* ---------------------------------------------------------- janelas */

  function abrirJanela({ titulo, sub, corpo, rodape, larga, aoAbrir }) {
    const camada = document.getElementById("camada");
    const anterior = document.activeElement;
    const fechar = () => {
      camada.replaceChildren();
      document.removeEventListener("keydown", esc);
      if (anterior && anterior.focus) anterior.focus();
    };
    const esc = (e) => { if (e.key === "Escape") fechar(); };
    document.addEventListener("keydown", esc);
    const janela = h("div", { class: `janela${larga ? " larga" : ""}`, role: "dialog", "aria-modal": "true", "aria-labelledby": "janela-titulo" },
      h("header", {}, h("h2", { id: "janela-titulo" }, titulo), sub ? h("p", { class: "muted small" }, sub) : null),
      h("div", { class: "corpo" }, corpo),
      h("footer", {}, rodape ? rodape(fechar) : h("button", { class: "btn", onclick: fechar }, "Fechar"))
    );
    const veu = h("div", { class: "veu", onclick: (e) => { if (e.target === veu) fechar(); } }, janela);
    camada.replaceChildren(veu);
    if (aoAbrir) aoAbrir(janela);
    else {
      const foco = janela.querySelector("input, select, textarea, .corpo button");
      if (foco) foco.focus();
    }
    return fechar;
  }

  function confirmar(titulo, texto, rotulo, acao) {
    abrirJanela({
      titulo,
      corpo: h("p", {}, texto),
      rodape: (fechar) => [
        h("button", { class: "btn", onclick: fechar }, "Cancelar"),
        h("button", { class: "btn perigo cheio", onclick: () => { fechar(); acao(); } }, rotulo),
      ],
    });
  }

  /** Lista pesquisável de opções (pessoas, oficiais ou músicas). */
  function escolherDe({ titulo, sub, grupos, atual, aoEscolher, vazio }) {
    const busca = h("input", { type: "search", id: "busca-opcao", placeholder: "Buscar…", "aria-label": "Buscar" });
    const lista = h("div", { class: "opcoes", role: "listbox" });
    let fecharJanela = null;
    const desenhar = () => {
      const q = E.normalizar(busca.value);
      const blocos = [];
      for (const g of grupos) {
        const itens = g.itens.filter((o) => !q || E.normalizar(o.busca || o.rotulo).includes(q));
        if (!itens.length) continue;
        if (g.titulo) blocos.push(h("div", { class: "grupo-titulo" }, g.titulo));
        for (const o of itens) {
          blocos.push(h("button", {
            class: "opcao", role: "option", "aria-current": String(o.id === atual),
            onclick: () => { fecharJanela(); aoEscolher(o.id); },
          }, h("b", {}, o.rotulo), o.direita ? h("span", { class: "small muted" }, o.direita) : h("span"), o.meta ? h("span", { class: "meta" }, o.meta) : null));
        }
      }
      if (vazio) blocos.push(h("button", { class: "opcao", onclick: () => { fecharJanela(); aoEscolher(null); } }, h("b", { class: "muted" }, vazio), h("span")));
      if (!blocos.length) blocos.push(h("p", { class: "muted small" }, "Nada encontrado."));
      lista.replaceChildren(...blocos);
    };
    busca.addEventListener("input", desenhar);
    desenhar();
    fecharJanela = abrirJanela({ titulo, sub, corpo: [busca, lista], aoAbrir: () => busca.focus() });
  }

  /* ---------------------------------------------------------- escalas */

  function escalasOrdenadas() {
    return [...state.escalas].sort((a, b) => b.inicio.localeCompare(a.inicio));
  }

  function telaEscalas() {
    const escala = porId(state.escalas, ui.escalaId);
    return h("div", { class: "escalas" },
      h("aside", { class: "lado" }, painelNovaEscala(), painelListaEscalas()),
      h("div", { style: "min-width:0" }, escala ? editorEscala(escala) : h("div", { class: "vazio-estado" },
        h("h2", {}, "Nenhuma escala ainda"),
        h("p", {}, "Escolha quinzenal ou mensal ao lado e toque em Gerar escala. A ferramenta distribui a equipe, os oficiais e as músicas de cada liturgia; depois você ajusta o que quiser.")
      ))
    );
  }

  function periodoNova() {
    const n = ui.nova;
    if (n.tipo === "quinzenal") {
      const inicio = n.inicio || proximoDomingo();
      return { inicio, fim: E.somarDias(inicio, 13) };
    }
    if (n.tipo === "mensal") {
      const mes = n.mes || proximoMes();
      return { inicio: `${mes}-01`, fim: E.fimDoMes(mes) };
    }
    const inicio = n.inicio || proximoDomingo();
    return { inicio, fim: n.fim && n.fim >= inicio ? n.fim : E.somarDias(inicio, 13) };
  }

  function painelNovaEscala() {
    const n = ui.nova;
    const p = periodoNova();
    const qtd = E.listarOcorrencias(state.cultos, p.inicio, p.fim).length;
    const tipoBtn = (id, nome) => h("button", { "aria-pressed": String(n.tipo === id), onclick: () => { n.tipo = id; render(); } }, nome);
    const campos = [];
    if (n.tipo === "mensal") {
      campos.push(h("label", { class: "campo" }, "Mês", h("input", { type: "month", id: "nova-mes", value: n.mes || proximoMes(), onchange: (e) => { n.mes = e.target.value; render(); } })));
    } else {
      campos.push(h("label", { class: "campo" }, n.tipo === "quinzenal" ? "Começa em" : "De", h("input", { type: "date", id: "nova-inicio", value: p.inicio, onchange: (e) => { n.inicio = e.target.value; render(); } })));
      if (n.tipo === "personalizado") campos.push(h("label", { class: "campo" }, "Até", h("input", { type: "date", id: "nova-fim", value: p.fim, min: p.inicio, onchange: (e) => { n.fim = e.target.value; render(); } })));
    }
    return h("section", { class: "painel" },
      h("header", {}, h("h2", {}, "Nova escala")),
      h("div", { class: "segmentado", role: "group", "aria-label": "Período" }, tipoBtn("quinzenal", "Quinzenal"), tipoBtn("mensal", "Mensal"), tipoBtn("personalizado", "Outro")),
      campos,
      h("p", { class: "small muted" }, `${E.formatarPeriodo(p.inicio, p.fim)} · ${qtd} ${qtd === 1 ? "culto" : "cultos"}`),
      h("button", {
        class: "btn primario", disabled: qtd === 0 || null,
        onclick: () => {
          const esc = E.gerarEscala(state, { inicio: p.inicio, fim: p.fim, tipo: n.tipo });
          mudou(() => { state.escalas.push(esc); ui.escalaId = esc.id; });
          toast(`Escala gerada com ${esc.cultos.length} cultos.`);
        },
      }, "Gerar escala"),
      qtd === 0 ? h("p", { class: "small muted" }, "Nenhum culto ativo neste período. Confira a aba Cultos e regras.") : null
    );
  }

  function painelListaEscalas() {
    const lista = escalasOrdenadas();
    if (!lista.length) return null;
    return h("section", { class: "painel" },
      h("header", {}, h("h2", {}, "Escalas salvas"), h("span", { class: "small muted" }, String(lista.length))),
      h("div", { class: "lista-escalas" }, lista.map((esc) => {
        const avisos = E.validarEscala(state, esc);
        const erros = avisos.filter((a) => a.nivel === "erro").length;
        return h("button", { class: "item-escala", "aria-current": String(esc.id === ui.escalaId), onclick: () => { ui.escalaId = esc.id; render(); } },
          h("strong", {}, E.formatarPeriodo(esc.inicio, esc.fim)),
          h("span", { class: "linha small muted" },
            esc.status === "confirmada" ? h("span", { class: "selo ok" }, "Confirmada") : h("span", { class: "selo neutro" }, "Rascunho"),
            erros ? h("span", { class: "selo erro" }, `${erros} pendente${erros > 1 ? "s" : ""}`) : null,
            `${esc.cultos.length} cultos`
          )
        );
      }))
    );
  }

  function editorEscala(escala) {
    const avisos = E.validarEscala(state, escala);
    const porCampo = {};
    for (const a of avisos) {
      const k = `${a.ci}|${a.campo}`;
      if (!porCampo[k] || a.nivel === "erro") porCampo[k] = a;
    }
    const erros = avisos.filter((a) => a.nivel === "erro").length;
    const alertas = avisos.length - erros;
    const local = !(window.claude && typeof window.claude.use === "function");

    const topo = h("div", { class: "editor-topo" },
      h("div", { class: "titulo" },
        h("div", { style: "min-width:0;flex:1 1 280px" },
          h("input", { type: "text", class: "titulo-input", id: "titulo-escala", value: escala.titulo, "aria-label": "Nome da escala", oninput: (e) => mudou(() => { escala.titulo = e.target.value; }, false) }),
          h("p", { class: "muted" }, `${E.formatarPeriodo(escala.inicio, escala.fim)} · ${escala.cultos.length} cultos`)
        ),
        h("div", { class: "segmentado", style: "grid-template-columns:1fr 1fr;min-width:220px", role: "group", "aria-label": "Situação" },
          h("button", { "aria-pressed": String(escala.status !== "confirmada"), onclick: () => mudou(() => { escala.status = "rascunho"; }) }, "Rascunho"),
          h("button", { "aria-pressed": String(escala.status === "confirmada"), onclick: () => mudou(() => { escala.status = "confirmada"; }) }, "Confirmada")
        )
      ),
      h("div", { class: "acoes" },
        h("button", { class: "btn primario", onclick: () => janelaWhatsApp(escala) }, icone("copy"), "Texto para o WhatsApp"),
        h("button", {
          class: "btn", title: "Sorteia de novo tudo o que não estiver travado",
          onclick: () => {
            const nova = E.gerarEscala(state, { inicio: escala.inicio, fim: escala.fim, tipo: escala.tipo }, escala);
            mudou(() => { state.escalas[state.escalas.indexOf(escala)] = nova; });
            toast("Escala sorteada de novo. O que estava travado foi mantido.");
          },
        }, icone("refresh"), "Sortear de novo"),
        h("button", { class: "btn", onclick: () => janelaCultoAvulso(escala) }, icone("plus"), "Culto avulso"),
        local ? h("button", { class: "btn", onclick: () => window.print() }, icone("print"), "Imprimir") : null,
        h("button", { class: "btn perigo", onclick: () => confirmar("Excluir esta escala?", `A escala de ${E.formatarPeriodo(escala.inicio, escala.fim)} será apagada. Isso não pode ser desfeito.`, "Excluir", () => mudou(() => { state.escalas = state.escalas.filter((e) => e !== escala); ui.escalaId = escalasOrdenadas()[0] ? escalasOrdenadas()[0].id : null; })) }, icone("trash"), "Excluir")
      ),
      avisos.length
        ? h("details", { class: "resumo-avisos" },
            h("summary", {}, erros ? h("span", { class: "selo erro" }, `${erros} pendência${erros > 1 ? "s" : ""}`) : null, alertas ? h("span", { class: "selo alerta" }, `${alertas} alerta${alertas > 1 ? "s" : ""}`) : null, h("span", { class: "small muted" }, "ver lista")),
            h("ul", {}, avisos.map((a) => h("li", {}, h("button", { onclick: () => irParaCulto(escala.cultos[a.ci].id) }, E.formatarData(escala.cultos[a.ci].data, "dia")), ` · ${a.msg}`)))
          )
        : h("p", { class: "selo ok", style: "justify-self:start" }, "Tudo certo nesta escala")
    );

    return h("div", {},
      topo,
      h("div", { class: "cultos" }, escala.cultos.map((c, ci) => cartaoCulto(escala, c, ci, porCampo))),
      resumoEquipe(escala)
    );
  }

  function irParaCulto(id) {
    const el = document.getElementById(`culto-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.classList.remove("destaque");
    void el.offsetWidth;
    el.classList.add("destaque");
  }

  function botaoTrava(culto, campo) {
    const travado = (culto.travados || []).includes(campo);
    return h("button", {
      class: "btn leve icone", "aria-pressed": String(travado), title: travado ? "Travado: não muda ao sortear de novo" : "Travar este campo",
      "aria-label": travado ? "Destravar" : "Travar",
      onclick: () => mudou(() => {
        culto.travados = travado ? culto.travados.filter((t) => t !== campo) : [...(culto.travados || []), campo];
      }),
    }, icone(travado ? "lock" : "unlock"));
  }

  function botaoSortear(escala, ci, campo) {
    return h("button", {
      class: "btn leve icone", title: "Sortear outro", "aria-label": "Sortear outro",
      onclick: () => mudou(() => { E.sortearCampo(state, escala, ci, campo); }),
    }, icone("refresh"));
  }

  function travar(culto, campo) {
    if (!(culto.travados || []).includes(campo)) culto.travados = [...(culto.travados || []), campo];
  }

  function campoValor(texto, aviso, onclick, direita) {
    return h("button", { class: `valor${texto ? "" : " vazio"}`, "data-nivel": aviso ? aviso.nivel : null, title: aviso ? aviso.msg : null, onclick },
      h("span", {}, texto || "a definir"), direita ? h("small", {}, direita) : null);
  }

  function cartaoCulto(escala, culto, ci, porCampo) {
    const d = E.parseData(culto.data);
    const lit = porId(state.liturgias, culto.liturgiaId);
    const aviso = (campo) => porCampo[`${ci}|${campo}`];

    const equipe = culto.equipe.map((s, si) => {
      const campo = `e:${si}`;
      const p = porId(state.pessoas, s.pessoaId);
      return h("div", { class: "linha-campo" },
        h("span", { class: "rotulo" }, E.nomeFuncao(state, s.funcao)),
        campoValor(p && p.nome, aviso(campo), () => escolherPessoa(escala, ci, si)),
        h("span", { class: "mini-acoes nao-imprimir" }, botaoSortear(escala, ci, campo), botaoTrava(culto, campo))
      );
    });

    const itens = culto.liturgia.map((it, ii) => {
      let corpo;
      if (it.tipo === "musica") {
        corpo = it.musicas.map((id, k) => {
          const campo = `m:${ii}:${k}`;
          const m = porId(state.musicas, id);
          return h("div", { class: "linha-valor" },
            campoValor(E.rotuloMusica(m), aviso(campo), () => escolherMusica(escala, ci, ii, k), m && m.tom ? `Tom ${m.tom}` : null),
            h("span", { class: "mini-acoes nao-imprimir" }, botaoSortear(escala, ci, campo), botaoTrava(culto, campo))
          );
        });
      } else if (it.tipo === "oficial") {
        corpo = it.oficiais.map((id, k) => {
          const campo = `o:${ii}:${k}`;
          return h("div", { class: "linha-valor" },
            campoValor(E.nomeOficial(porId(state.oficiais, id)), aviso(campo), () => escolherOficial(escala, ci, ii, k)),
            h("span", { class: "mini-acoes nao-imprimir" }, botaoSortear(escala, ci, campo), botaoTrava(culto, campo))
          );
        });
      } else {
        corpo = it.texto ? h("span", { class: "texto-fixo" }, it.texto) : null;
      }
      return h("li", {},
        h("div", { class: "item-corpo" },
          h("div", { class: "cab" }, h("strong", {}, it.titulo), it.tipo !== "texto" && it.texto ? h("span", { class: "small muted" }, it.texto) : null),
          corpo,
          h("input", {
            type: "text", class: "nota", id: `nota-${culto.id}-${ii}`, value: it.nota || "",
            placeholder: it.tipo === "oficial" ? "Texto bíblico ou observação" : "Observação (opcional)",
            "aria-label": `Observação: ${it.titulo}`,
            oninput: (e) => mudou(() => { it.nota = e.target.value; }, false),
          })
        )
      );
    });

    return h("article", { class: `culto${culto.solene ? " solene" : ""}`, id: `culto-${culto.id}` },
      h("header", {},
        h("div", { class: "data-bloco", "aria-hidden": "true" }, h("b", { class: "num" }, String(d.getDate()).padStart(2, "0")), h("span", {}, `${E.DIAS_CURTOS[d.getDay()]} · ${E.MESES[d.getMonth()].slice(0, 3)}`)),
        h("div", { style: "min-width:0" },
          h("h3", {}, culto.nome),
          h("div", { class: "sub" },
            h("span", {}, `${E.formatarData(culto.data, "longa")}${culto.hora ? ` · ${culto.hora}` : ""}`),
            culto.solene ? h("span", { class: "selo solene" }, "Solene") : null,
            culto.avulso ? h("span", { class: "selo neutro" }, "Avulso") : null
          ),
          lit ? h("div", { class: "sub" }, `Liturgia: ${lit.nome}`) : null
        ),
        h("div", { class: "mini-acoes nao-imprimir" },
          h("button", {
            class: "btn leve icone", title: "Sortear este culto de novo (mantém os travados)", "aria-label": "Sortear este culto de novo",
            onclick: () => mudou(() => {
              const trav = new Set(culto.travados || []);
              culto.equipe.forEach((s, si) => { if (!trav.has(`e:${si}`)) s.pessoaId = null; });
              culto.liturgia.forEach((it, ii) => {
                it.musicas = it.musicas.map((id, k) => (trav.has(`m:${ii}:${k}`) ? id : null));
                it.oficiais = it.oficiais.map((id, k) => (trav.has(`o:${ii}:${k}`) ? id : null));
              });
              E.preencherCulto(state, escala, ci, Math.random);
            }),
          }, icone("refresh")),
          culto.avulso ? h("button", { class: "btn leve icone perigo", title: "Remover este culto", "aria-label": "Remover este culto", onclick: () => confirmar("Remover este culto da escala?", `${culto.nome} de ${E.formatarData(culto.data)} sai desta escala.`, "Remover", () => mudou(() => { escala.cultos.splice(ci, 1); })) }, icone("trash")) : null
        )
      ),
      equipe.length ? h("section", { "aria-label": "Equipe" }, h("span", { class: "eyebrow" }, "Equipe"), equipe) : null,
      h("section", { "aria-label": "Ordem do culto" }, h("span", { class: "eyebrow" }, "Ordem do culto"), itens.length ? h("ol", { class: "ordem" }, itens) : h("p", { class: "muted small" }, "Este culto não tem liturgia definida.")),
      h("footer", {},
        h("textarea", { id: `obs-${culto.id}`, placeholder: "Observações para a equipe (ensaio, roupa, avisos…)", "aria-label": "Observações do culto", value: culto.obs || "", oninput: (e) => mudou(() => { culto.obs = e.target.value; }, false) })
      )
    );
  }

  function escolherPessoa(escala, ci, si) {
    const culto = escala.cultos[ci];
    const slot = culto.equipe[si];
    const cands = E.candidatosPessoa(state, escala, ci, si);
    const op = (c) => ({
      id: c.pessoa.id, rotulo: c.pessoa.nome,
      direita: `${c.vezes}× na escala`,
      meta: c.bloqueio ? h("span", { class: "ruim" }, c.bloqueio) : null,
    });
    escolherDe({
      titulo: E.nomeFuncao(state, slot.funcao),
      sub: `${culto.nome} · ${E.formatarData(culto.data, "dia")}`,
      atual: slot.pessoaId,
      grupos: [
        { titulo: "Disponíveis (quem serviu menos aparece primeiro)", itens: cands.filter((c) => !c.bloqueio).map(op) },
        { titulo: "Com restrição", itens: cands.filter((c) => c.bloqueio).map(op) },
      ],
      vazio: "Deixar sem ninguém",
      aoEscolher: (id) => mudou(() => { slot.pessoaId = id; if (id) travar(culto, `e:${si}`); }),
    });
    if (!cands.length) toast(`Ninguém cadastrado faz ${E.nomeFuncao(state, slot.funcao)}. Marque a função na aba Equipe do louvor.`);
  }

  function escolherOficial(escala, ci, ii, k) {
    const culto = escala.cultos[ci];
    const item = culto.liturgia[ii];
    const cands = E.candidatosOficial(state, escala, ci, ii, k);
    const op = (c) => ({
      id: c.oficial.id, rotulo: E.nomeOficial(c.oficial), busca: `${c.oficial.nome} ${c.oficial.cargo}`,
      direita: `${c.vezes}× na escala`,
      meta: c.bloqueio ? h("span", { class: "ruim" }, c.bloqueio) : c.noCulto ? "já tem outra parte neste culto" : c.oficial.cargo,
    });
    escolherDe({
      titulo: item.titulo,
      sub: `${culto.nome} · ${E.formatarData(culto.data, "dia")}`,
      atual: item.oficiais[k],
      grupos: [
        { titulo: "Disponíveis", itens: cands.filter((c) => !c.bloqueio).map(op) },
        { titulo: "Com restrição", itens: cands.filter((c) => c.bloqueio).map(op) },
      ],
      vazio: "Deixar a definir",
      aoEscolher: (id) => mudou(() => { item.oficiais[k] = id; if (id) travar(culto, `o:${ii}:${k}`); }),
    });
  }

  function escolherMusica(escala, ci, ii, k) {
    const culto = escala.cultos[ci];
    const item = culto.liturgia[ii];
    const modelo = E.itemModelo(state, culto, item) || item;
    const cands = E.candidatosMusica(state, escala, ci, ii, k);
    const op = (c) => {
      const partes = [];
      partes.push(c.ultima ? `última vez: ${E.formatarData(c.ultima, "curta")}` : "sem registro antes desta data");
      if (c.bloqueio) partes.push(h("span", { class: "ruim" }, ` · ${c.bloqueio}`));
      if (!c.atende && c.faltam.length) partes.push(h("span", { class: "ruim" }, ` · falta: ${c.faltam.map((t) => E.nomeTag(state, t)).join(", ")}`));
      return { id: c.musica.id, rotulo: E.rotuloMusica(c.musica), busca: `${c.musica.numero} ${c.musica.titulo} ${c.musica.autor}`, direita: c.musica.tom ? `Tom ${c.musica.tom}` : "", meta: partes };
    };
    const exigidas = new Set();
    for (const tipo of modelo.tipos || []) E.tagsExigidas(state, modelo, culto.solene, tipo).forEach((t) => exigidas.add(t));
    escolherDe({
      titulo: item.titulo,
      sub: `${culto.nome} · ${E.formatarData(culto.data, "dia")}${exigidas.size ? ` · exige: ${[...exigidas].map((t) => E.nomeTag(state, t)).join(", ")}` : ""}`,
      atual: item.musicas[k],
      grupos: [
        { titulo: "Atendem a este momento", itens: cands.filter((c) => c.atende && !c.bloqueio).map(op) },
        { titulo: "Atendem, mas cantadas há pouco", itens: cands.filter((c) => c.atende && c.bloqueio).map(op) },
        { titulo: "Não atendem às etiquetas exigidas", itens: cands.filter((c) => !c.atende).map(op) },
      ],
      vazio: "Deixar a definir",
      aoEscolher: (id) => mudou(() => { item.musicas[k] = id; if (id) travar(culto, `m:${ii}:${k}`); }),
    });
  }

  function resumoEquipe(escala) {
    const linhas = E.resumoPessoas(state, escala);
    if (!linhas.length) return null;
    return h("details", { class: "painel nao-imprimir", style: "margin-top:20px" },
      h("summary", { style: "cursor:pointer" }, h("strong", {}, "Quantas vezes cada pessoa serve nesta escala")),
      h("div", { class: "tabela-wrap" }, h("table", {},
        h("thead", {}, h("tr", {}, h("th", {}, "Pessoa"), h("th", {}, "Vezes"), h("th", {}, "Funções"))),
        h("tbody", {}, linhas.map((l) => h("tr", {},
          h("td", {}, l.pessoa.nome),
          h("td", { class: "num" }, String(l.total)),
          h("td", { class: "small muted" }, Object.entries(l.funcoes).map(([f, n]) => `${E.nomeFuncao(state, f)} (${n})`).join(", ") || "—")
        )))
      ))
    );
  }

  function janelaWhatsApp(escala) {
    let comLiturgia = true;
    let comLinks = false;
    const pre = h("pre", { class: "texto", id: "texto-whatsapp" });
    const atualizar = () => { pre.textContent = E.textoWhatsApp(state, escala, { liturgia: comLiturgia, links: comLinks }); };
    atualizar();
    abrirJanela({
      titulo: "Texto para o WhatsApp",
      sub: "Negrito e itálico aparecem formatados ao colar no WhatsApp.",
      larga: true,
      corpo: [
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "com-liturgia", checked: true, onchange: (e) => { comLiturgia = e.target.checked; atualizar(); } }), "Incluir a ordem do culto completa"),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "com-links", onchange: (e) => { comLinks = e.target.checked; atualizar(); } }), "Incluir os links do YouTube (para a equipe ensaiar)"),
        pre,
      ],
      rodape: (fechar) => [
        h("button", { class: "btn", onclick: fechar }, "Fechar"),
        h("button", { class: "btn primario", onclick: () => copiar(pre.textContent, pre) }, icone("copy"), "Copiar texto"),
      ],
    });
  }

  function janelaCultoAvulso(escala) {
    const modelos = state.cultos;
    const f = { data: escala.inicio, cultoId: modelos[0] ? modelos[0].id : "", nome: "", hora: "", liturgiaId: "", solene: null };
    const preencherDoModelo = () => {
      const m = porId(modelos, f.cultoId);
      f.nome = m ? m.nome : "";
      f.hora = m ? m.hora : "";
      f.liturgiaId = m ? m.liturgiaId : (state.liturgias[0] || {}).id;
      f.solene = m ? !!m.solene : false;
    };
    preencherDoModelo();
    const corpo = h("div", { class: "pilha" });
    const desenhar = () => corpo.replaceChildren(
      h("div", { class: "grade" },
        h("label", { class: "campo" }, "Data", h("input", { type: "date", id: "av-data", value: f.data, onchange: (e) => { f.data = e.target.value; } })),
        h("label", { class: "campo" }, "Equipe igual à do culto", h("select", { id: "av-modelo", onchange: (e) => { f.cultoId = e.target.value; preencherDoModelo(); desenhar(); } }, modelos.map((m) => h("option", { value: m.id, selected: m.id === f.cultoId || null }, m.nome)))),
        h("label", { class: "campo" }, "Nome do culto", h("input", { type: "text", id: "av-nome", value: f.nome, oninput: (e) => { f.nome = e.target.value; } })),
        h("label", { class: "campo" }, "Hora", h("input", { type: "time", id: "av-hora", value: f.hora, oninput: (e) => { f.hora = e.target.value; } })),
        h("label", { class: "campo" }, "Liturgia", h("select", { id: "av-lit", onchange: (e) => { f.liturgiaId = e.target.value; } }, state.liturgias.map((l) => h("option", { value: l.id, selected: l.id === f.liturgiaId || null }, l.nome))))
      ),
      h("label", { class: "check" }, h("input", { type: "checkbox", id: "av-solene", checked: f.solene, onchange: (e) => { f.solene = e.target.checked; } }), "Culto solene (aplica a orientação pastoral para as músicas)")
    );
    desenhar();
    abrirJanela({
      titulo: "Culto avulso",
      sub: "Para datas especiais: Natal, aniversário da igreja, culto de ação de graças…",
      corpo,
      rodape: (fechar) => [
        h("button", { class: "btn", onclick: fechar }, "Cancelar"),
        h("button", {
          class: "btn primario",
          onclick: () => {
            if (!f.data) return toast("Escolha a data do culto.");
            fechar();
            let ci = 0;
            mudou(() => { ci = E.adicionarCultoAvulso(state, escala, f); });
            const c = escala.cultos[ci];
            if (c) setTimeout(() => irParaCulto(c.id), 50);
          },
        }, "Adicionar"),
      ],
    });
  }

  /* -------------------------------------------------------- repertório */

  /** Para cada música: a última vez cantada (até hoje) e a próxima já programada. */
  function usosMusicas() {
    const mapa = {};
    const marcar = (id, data) => {
      const u = (mapa[id] = mapa[id] || { ultima: null, proxima: null });
      if (data <= hoje()) { if (!u.ultima || data > u.ultima) u.ultima = data; }
      else if (!u.proxima || data < u.proxima) u.proxima = data;
    };
    for (const m of state.musicas) if (m.ultimaVez) marcar(m.id, m.ultimaVez);
    for (const e of state.escalas) for (const c of e.cultos) for (const it of c.liturgia) for (const id of it.musicas) if (id) marcar(id, c.data);
    return mapa;
  }

  function aptaSolene(m) {
    const r = state.regras;
    const exig = m.tipo === "louvor" ? r.soleneTagsLouvor || [] : r.soleneTagsHinario || [];
    return exig.every((t) => (m.tags || []).includes(t));
  }

  function telaRepertorio() {
    const f = ui.rep;
    const lista = h("div", {});
    const usos = usosMusicas();
    const desenharLista = () => {
      const q = E.normalizar(f.busca);
      const filtradas = state.musicas
        .filter((m) => (!f.tipo || m.tipo === f.tipo) && (!f.tag || (m.tags || []).includes(f.tag)) && (!f.solene || aptaSolene(m)))
        .filter((m) => !q || E.normalizar(`${m.numero} ${m.titulo} ${m.autor}`).includes(q))
        .sort((a, b) => a.tipo.localeCompare(b.tipo) || String(a.numero).localeCompare(String(b.numero), "pt-BR", { numeric: true }) || a.titulo.localeCompare(b.titulo, "pt-BR"));
      if (!state.musicas.length) {
        lista.replaceChildren(h("div", { class: "vazio-estado" }, h("h2", {}, "Repertório vazio"), h("p", {}, "Importe a lista de Salmos e Hinos e a de louvores colando o texto, ou cadastre uma por uma.")));
        return;
      }
      lista.replaceChildren(
        h("p", { class: "small muted", style: "margin-bottom:8px" }, `${filtradas.length} de ${state.musicas.length} músicas`),
        h("div", { class: "tabela-wrap" }, h("table", {},
          h("thead", {}, h("tr", {}, h("th", {}, "Tipo"), h("th", {}, "Nº"), h("th", {}, "Título"), h("th", {}, "Etiquetas"), h("th", {}, "Solene"), h("th", {}, "Cantada em"), h("th", {}, ""))),
          h("tbody", {}, filtradas.map((m) => h("tr", { class: m.ativo === false ? "inativo" : "" },
            h("td", {}, (E.TIPOS_MUSICA.find((t) => t.id === m.tipo) || {}).nome || m.tipo),
            h("td", { class: "num" }, m.numero || "—"),
            h("td", {},
              h("strong", {}, m.titulo || (m.numero ? `Salmos e Hinos nº ${m.numero}` : "")),
              m.autor ? h("div", { class: "small muted" }, m.autor) : null,
              m.tom ? h("div", { class: "small muted" }, `Tom ${m.tom}`) : null,
              m.link ? h("div", { class: "small" }, h("a", { href: m.link, target: "_blank", rel: "noopener" }, "Ouvir no YouTube")) : null,
              m.obs ? h("div", { class: "small muted" }, m.obs) : null
            ),
            h("td", {}, h("div", { class: "chips" }, (m.tags || []).map((t) => h("span", { class: `chip tag-${t}` }, (porId(state.tags, t) || { nome: t }).nome)))),
            h("td", {}, aptaSolene(m) ? h("span", { class: "selo ok" }, "Apta") : h("span", { class: "selo neutro" }, "Não")),
            h("td", { class: "num small" },
              usos[m.id] && usos[m.id].ultima ? h("div", {}, E.formatarData(usos[m.id].ultima)) : h("div", { class: "muted" }, "—"),
              usos[m.id] && usos[m.id].proxima ? h("div", { class: "muted" }, `próxima: ${E.formatarData(usos[m.id].proxima, "curta")}`) : null
            ),
            h("td", {}, h("button", { class: "btn", onclick: () => janelaMusica(m) }, "Editar"))
          )))
        ))
      );
    };
    desenharLista();
    const r = state.regras;
    const nomes = (ts) => (ts || []).map((t) => E.nomeTag(state, t)).join(" e ") || "nenhuma etiqueta";
    const total = (fn) => state.musicas.filter((m) => m.ativo !== false && fn(m)).length;
    return h("div", { class: "pilha" },
      h("div", { class: "painel" },
        h("header", {}, h("h2", {}, "Repertório"), h("div", { class: "acoes" },
          h("button", { class: "btn", onclick: () => janelaImportar() }, "Importar lista"),
          h("button", { class: "btn primario", onclick: () => janelaMusica(null) }, icone("plus"), "Música")
        )),
        h("p", { class: "muted" },
          `Nos cultos solenes, salmos e hinos precisam ser ${nomes(r.soleneTagsHinario)}, e os louvores, ${nomes(r.soleneTagsLouvor)}. `,
          `Hoje há ${total((m) => E.HINARIO.has(m.tipo) && aptaSolene(m))} salmos/hinos e ${total((m) => m.tipo === "louvor" && aptaSolene(m))} louvores aptos.`
        ),
        h("div", { class: "barra" },
          h("label", { class: "campo" }, "Buscar", h("input", { type: "search", id: "rep-busca", value: f.busca, placeholder: "Título, número ou autor", oninput: (e) => { f.busca = e.target.value; desenharLista(); } })),
          h("label", { class: "campo" }, "Tipo", h("select", { id: "rep-tipo", onchange: (e) => { f.tipo = e.target.value; desenharLista(); } }, h("option", { value: "" }, "Todos"), E.TIPOS_MUSICA.map((t) => h("option", { value: t.id, selected: f.tipo === t.id || null }, t.nome)))),
          h("label", { class: "campo" }, "Etiqueta", h("select", { id: "rep-tag", onchange: (e) => { f.tag = e.target.value; desenharLista(); } }, h("option", { value: "" }, "Todas"), state.tags.map((t) => h("option", { value: t.id, selected: f.tag === t.id || null }, t.nome)))),
          h("div", { class: "acoes" }, h("label", { class: "check" }, h("input", { type: "checkbox", id: "rep-solene", checked: f.solene, onchange: (e) => { f.solene = e.target.checked; desenharLista(); } }), "Só aptas ao solene"))
        )
      ),
      lista
    );
  }

  function seletorTags(selecionadas, aoMudar) {
    const caixa = h("div", { class: "chips" });
    const desenhar = () => caixa.replaceChildren(...state.tags.map((t) => h("button", {
      type: "button", class: "chip", "aria-pressed": String(selecionadas.includes(t.id)),
      onclick: () => {
        const i = selecionadas.indexOf(t.id);
        if (i >= 0) selecionadas.splice(i, 1);
        else selecionadas.push(t.id);
        desenhar();
        if (aoMudar) aoMudar();
      },
    }, t.nome)));
    desenhar();
    return caixa;
  }

  function janelaMusica(original) {
    const m = original ? clone(original) : { id: E.novoId("m"), tipo: "hino", numero: "", titulo: "", autor: "", link: "", tags: [], tom: "", ativo: true, obs: "", ultimaVez: "" };
    const set = (k) => (e) => { m[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; };
    abrirJanela({
      titulo: original ? "Editar música" : "Nova música",
      corpo: [
        h("div", { class: "grade" },
          h("label", { class: "campo" }, "Tipo", h("select", { id: "mus-tipo", onchange: set("tipo") }, E.TIPOS_MUSICA.map((t) => h("option", { value: t.id, selected: m.tipo === t.id || null }, t.nome)))),
          h("label", { class: "campo" }, "Número no hinário", h("input", { type: "text", id: "mus-numero", value: m.numero, placeholder: "ex.: 12", oninput: set("numero") })),
          h("label", { class: "campo" }, "Tom", h("input", { type: "text", id: "mus-tom", value: m.tom, placeholder: "ex.: Ré", oninput: set("tom") }))
        ),
        h("label", { class: "campo" }, "Título", h("input", { type: "text", id: "mus-titulo", value: m.titulo, oninput: set("titulo") })),
        h("label", { class: "campo" }, "Autor ou ministério (opcional)", h("input", { type: "text", id: "mus-autor", value: m.autor, oninput: set("autor") })),
        h("label", { class: "campo" }, "Link para ouvir (YouTube)", h("input", { type: "text", id: "mus-link", value: m.link || "", placeholder: "https://youtu.be/…", oninput: set("link") })),
        h("label", { class: "campo" }, "Última vez que foi cantada fora das escalas daqui (opcional)", h("input", { type: "date", id: "mus-ultima", value: m.ultimaVez || "", onchange: set("ultimaVez") })),
        h("div", { class: "campo" }, "Etiquetas", seletorTags(m.tags)),
        h("label", { class: "campo" }, "Observações", h("textarea", { id: "mus-obs", value: m.obs, oninput: set("obs") })),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "mus-ativo", checked: m.ativo !== false, onchange: set("ativo") }), "Ativa (pode entrar nas escalas)"),
      ],
      rodape: (fechar) => [
        original ? h("button", { class: "btn perigo", style: "margin-right:auto", onclick: () => { fechar(); confirmar("Excluir esta música?", `${E.rotuloMusica(original)} sai do repertório. Nas escalas já feitas ela aparecerá como removida. Se quiser só tirá-la das próximas escalas, desmarque "Ativa".`, "Excluir", () => mudou(() => { state.musicas = state.musicas.filter((x) => x.id !== original.id); })); } }, "Excluir") : null,
        h("button", { class: "btn", onclick: fechar }, "Cancelar"),
        h("button", {
          class: "btn primario",
          onclick: () => {
            if (!m.titulo.trim() && !String(m.numero).trim()) return toast("Escreva o título ou o número da música.");
            fechar();
            mudou(() => {
              m.titulo = m.titulo.trim();
              if (original) Object.assign(original, m);
              else state.musicas.push(m);
            });
          },
        }, "Salvar"),
      ],
    });
  }

  function janelaImportar() {
    const padrao = { tipo: "hino", tags: [] };
    const area = h("textarea", { id: "imp-texto", rows: 9, placeholder: "Cole uma música por linha. Exemplos:\n12 - Santo! Santo! Santo!\nHino; 30; Castelo Forte; trinitário, doutrinário\nLouvor; Porque Ele Vive; cristocêntrico, doutrinário" });
    const previa = h("div", { class: "small" });
    let lidas = [];
    const chave = (m) => `${m.tipo}|${m.numero}|${E.normalizar(m.titulo)}`;
    const existentes = new Set(state.musicas.map(chave));
    const atualizar = () => {
      lidas = E.lerListaMusicas(state, area.value, padrao);
      const novas = lidas.filter((m) => !existentes.has(chave(m)));
      previa.replaceChildren(
        h("p", { class: "muted" }, lidas.length ? `${novas.length} nova${novas.length === 1 ? "" : "s"} para importar${lidas.length > novas.length ? ` (${lidas.length - novas.length} já estão no repertório)` : ""}.` : "Nada para importar ainda."),
        novas.length ? h("div", { class: "tabela-wrap", style: "max-height:220px;overflow:auto;margin-top:6px" }, h("table", {}, h("tbody", {}, novas.slice(0, 200).map((m) => h("tr", {},
          h("td", {}, (E.TIPOS_MUSICA.find((t) => t.id === m.tipo) || {}).nome),
          h("td", { class: "num" }, m.numero || "—"),
          h("td", {}, m.titulo || "—", m.autor ? h("span", { class: "muted" }, ` · ${m.autor}`) : null, m.link ? h("span", { class: "muted" }, " · com link") : null),
          h("td", { class: "small muted" }, m.tags.map((t) => E.nomeTag(state, t)).join(", "))
        ))))) : null
      );
    };
    area.addEventListener("input", atualizar);
    atualizar();
    abrirJanela({
      titulo: "Importar lista de músicas",
      sub: "Copie do Word, Excel, PDF ou WhatsApp e cole aqui. Colunas separadas por ponto e vírgula ou tabulação.",
      larga: true,
      corpo: [
        h("div", { class: "grade" },
          h("label", { class: "campo" }, "Tipo, quando a linha não disser", h("select", { id: "imp-tipo", onchange: (e) => { padrao.tipo = e.target.value; atualizar(); } }, E.TIPOS_MUSICA.map((t) => h("option", { value: t.id, selected: padrao.tipo === t.id || null }, t.nome))))
        ),
        h("div", { class: "campo" }, "Etiquetas para todas as músicas coladas (opcional)", seletorTags(padrao.tags, atualizar)),
        area,
        previa,
      ],
      rodape: (fechar) => [
        h("button", { class: "btn", onclick: fechar }, "Cancelar"),
        h("button", {
          class: "btn primario",
          onclick: () => {
            const novas = lidas.filter((m) => !existentes.has(chave(m)));
            if (!novas.length) return toast("Nenhuma música nova para importar.");
            fechar();
            mudou(() => { state.musicas.push(...novas); });
            toast(`${novas.length} músicas importadas.`);
          },
        }, "Importar"),
      ],
    });
  }

  /* ------------------------------------------- equipe, oficiais, datas */

  function editorIndisponivel(lista, aoMudar) {
    const caixa = h("div", { class: "pilha", style: "gap:8px" });
    const desenhar = () => {
      const de = h("input", { type: "date", "aria-label": "Indisponível de", min: hoje() });
      const ate = h("input", { type: "date", "aria-label": "até (opcional)" });
      const futuras = lista.filter((x) => (x.split("..")[1] || x) >= hoje());
      caixa.replaceChildren(
        futuras.length
          ? h("div", { class: "chips" }, futuras.sort().map((x) => {
              const [a, b] = x.split("..");
              return h("span", { class: "chip" }, b ? `${E.formatarData(a, "curta")} a ${E.formatarData(b, "curta")}` : E.formatarData(a, "dia"),
                h("button", { "aria-label": "Remover data", onclick: () => { lista.splice(lista.indexOf(x), 1); aoMudar(); desenhar(); } }, "×"));
            }))
          : h("p", { class: "small muted" }, "Nenhuma data marcada."),
        h("div", { style: "display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:6px;align-items:center" }, de, ate,
          h("button", {
            class: "btn", onclick: () => {
              if (!de.value) return toast("Escolha a data.");
              lista.push(ate.value && ate.value > de.value ? `${de.value}..${ate.value}` : de.value);
              aoMudar();
              desenhar();
            },
          }, "Marcar"))
      );
    };
    desenhar();
    return caixa;
  }

  function telaEquipe() {
    const pessoas = [...state.pessoas].sort((a, b) => (a.ativo === false) - (b.ativo === false) || a.nome.localeCompare(b.nome, "pt-BR"));
    const contagem = state.funcoes.map((f) => ({ f, n: state.pessoas.filter((p) => p.ativo !== false && (p.funcoes || []).includes(f.id)).length }));
    return h("div", { class: "pilha" },
      h("div", { class: "painel" },
        h("header", {}, h("h2", {}, "Equipe do louvor"), h("button", {
          class: "btn primario",
          onclick: () => mudou(() => { state.pessoas.unshift({ id: E.novoId("p"), nome: "", funcoes: [], cultos: [], indisponivel: [], ativo: true, obs: "" }); }),
        }, icone("plus"), "Pessoa")),
        h("p", { class: "muted" }, "Marque o que cada pessoa faz, em quais cultos ela serve e as datas em que não pode. A escala nunca coloca alguém numa data marcada como indisponível."),
        h("div", { class: "chips" }, contagem.map(({ f, n }) => h("span", { class: `selo ${n ? "neutro" : "erro"}` }, `${f.nome}: ${n}`)))
      ),
      pessoas.length ? h("div", { class: "cartoes" }, pessoas.map((p) => cartaoPessoa(p))) : h("div", { class: "vazio-estado" }, h("p", {}, "Ninguém cadastrado ainda. Toque em + Pessoa."))
    );
  }

  function cartaoPessoa(p) {
    const salvarSem = () => mudou(null, false);
    return h("div", { class: `cartao${p.ativo === false ? " inativo" : ""}` },
      h("div", { class: "cab" },
        h("input", { type: "text", id: `pes-nome-${p.id}`, value: p.nome, placeholder: "Nome", "aria-label": "Nome", oninput: (e) => { p.nome = e.target.value; salvarSem(); } }),
        h("button", { class: "btn leve icone perigo", "aria-label": "Excluir pessoa", title: "Excluir", onclick: () => confirmar("Excluir esta pessoa?", `${p.nome || "Esta pessoa"} sai da equipe. Nas escalas já feitas aparecerá como removida. Para só pausar, desmarque "Ativa".`, "Excluir", () => mudou(() => { state.pessoas = state.pessoas.filter((x) => x !== p); })) }, icone("trash"))
      ),
      h("div", { class: "campo" }, "Funções", h("div", { class: "chips" }, state.funcoes.map((f) => h("button", {
        class: "chip", "aria-pressed": String((p.funcoes || []).includes(f.id)),
        onclick: () => mudou(() => { p.funcoes = (p.funcoes || []).includes(f.id) ? p.funcoes.filter((x) => x !== f.id) : [...(p.funcoes || []), f.id]; }),
      }, f.nome)))),
      h("div", { class: "campo" }, "Serve nos cultos (nenhum marcado = todos)", h("div", { class: "chips" }, state.cultos.map((c) => h("button", {
        class: "chip", "aria-pressed": String((p.cultos || []).includes(c.id)),
        onclick: () => mudou(() => { p.cultos = (p.cultos || []).includes(c.id) ? p.cultos.filter((x) => x !== c.id) : [...(p.cultos || []), c.id]; }),
      }, `${E.DIAS_CURTOS[c.diaSemana]} · ${c.nome}`)))),
      h("div", { class: "campo" }, "Não pode servir em", editorIndisponivel(p.indisponivel = p.indisponivel || [], salvarSem)),
      h("label", { class: "campo" }, "Observações", h("input", { type: "text", id: `pes-obs-${p.id}`, value: p.obs || "", oninput: (e) => { p.obs = e.target.value; salvarSem(); } })),
      h("label", { class: "check" }, h("input", { type: "checkbox", checked: p.ativo !== false, onchange: (e) => mudou(() => { p.ativo = e.target.checked; }) }), "Ativa (entra nas escalas)")
    );
  }

  function telaOficiais() {
    const ordem = (o) => CARGOS.indexOf(o.cargo);
    const lista = [...state.oficiais].sort((a, b) => ordem(a) - ordem(b) || a.nome.localeCompare(b.nome, "pt-BR"));
    return h("div", { class: "pilha" },
      h("div", { class: "painel" },
        h("header", {}, h("h2", {}, "Oficiais da igreja"), h("button", {
          class: "btn primario",
          onclick: () => mudou(() => { state.oficiais.unshift({ id: E.novoId("o"), nome: "", cargo: "Presbítero", indisponivel: [], ativo: true }); }),
        }, icone("plus"), "Oficial")),
        h("p", { class: "muted" }, "Os oficiais são distribuídos nas partes da liturgia (chamada à adoração, orações, leitura, ofertório…). Em cada liturgia você define quais cargos podem fazer cada parte.")
      ),
      lista.length ? h("div", { class: "cartoes" }, lista.map((o) => h("div", { class: `cartao${o.ativo === false ? " inativo" : ""}` },
        h("div", { class: "cab" },
          h("input", { type: "text", id: `of-nome-${o.id}`, value: o.nome, placeholder: "Nome", "aria-label": "Nome", oninput: (e) => { o.nome = e.target.value; mudou(null, false); } }),
          h("button", { class: "btn leve icone perigo", "aria-label": "Excluir oficial", title: "Excluir", onclick: () => confirmar("Excluir este oficial?", `${E.nomeOficial(o) || "Este oficial"} sai do cadastro.`, "Excluir", () => mudou(() => { state.oficiais = state.oficiais.filter((x) => x !== o); })) }, icone("trash"))
        ),
        h("label", { class: "campo" }, "Cargo", h("select", { id: `of-cargo-${o.id}`, onchange: (e) => mudou(() => { o.cargo = e.target.value; }) }, CARGOS.map((c) => h("option", { value: c, selected: o.cargo === c || null }, c)))),
        h("div", { class: "campo" }, "Não pode servir em", editorIndisponivel(o.indisponivel = o.indisponivel || [], () => mudou(null, false))),
        h("label", { class: "check" }, h("input", { type: "checkbox", checked: o.ativo !== false, onchange: (e) => mudou(() => { o.ativo = e.target.checked; }) }), "Ativo (entra nas escalas)")
      ))) : h("div", { class: "vazio-estado" }, h("p", {}, "Nenhum oficial cadastrado ainda."))
    );
  }

  /* -------------------------------------------------------- liturgias */

  function telaLiturgias() {
    if (!porId(state.liturgias, ui.liturgiaId)) ui.liturgiaId = state.liturgias[0] ? state.liturgias[0].id : null;
    const lit = porId(state.liturgias, ui.liturgiaId);
    return h("div", { class: "liturgias" },
      h("aside", { class: "painel" },
        h("header", {}, h("h2", {}, "Liturgias")),
        h("div", { class: "lista-escalas" }, state.liturgias.map((l) => h("button", { class: "item-escala", "aria-current": String(l.id === ui.liturgiaId), onclick: () => { ui.liturgiaId = l.id; render(); } },
          h("strong", {}, l.nome || "Sem nome"),
          h("span", { class: "linha small muted" }, l.solene ? h("span", { class: "selo solene" }, "Solene") : null, `${l.itens.length} partes`)
        ))),
        h("button", {
          class: "btn", onclick: () => {
            const nova = { id: E.novoId("lit"), nome: "Nova liturgia", solene: false, itens: [] };
            mudou(() => { state.liturgias.push(nova); ui.liturgiaId = nova.id; });
          },
        }, icone("plus"), "Liturgia")
      ),
      lit ? editorLiturgia(lit) : h("div", { class: "vazio-estado" }, h("p", {}, "Crie a primeira liturgia."))
    );
  }

  function editorLiturgia(lit) {
    const usadaPor = state.cultos.filter((c) => c.liturgiaId === lit.id);
    const mover = (i, d) => mudou(() => { const [x] = lit.itens.splice(i, 1); lit.itens.splice(i + d, 0, x); });
    return h("section", { class: "painel" },
      h("header", {},
        h("input", { type: "text", class: "titulo-input", id: `lit-nome-${lit.id}`, value: lit.nome, "aria-label": "Nome da liturgia", oninput: (e) => { lit.nome = e.target.value; mudou(null, false); } }),
        h("div", { class: "acoes" },
          h("button", { class: "btn", onclick: () => { const c = clone(lit); c.id = E.novoId("lit"); c.nome = `${lit.nome} (cópia)`; mudou(() => { state.liturgias.push(c); ui.liturgiaId = c.id; }); } }, icone("copy"), "Duplicar"),
          h("button", {
            class: "btn perigo",
            onclick: () => usadaPor.length
              ? toast(`Esta liturgia é usada por: ${usadaPor.map((c) => c.nome).join(", ")}. Troque a liturgia desses cultos antes de excluir.`)
              : confirmar("Excluir esta liturgia?", `${lit.nome} será apagada.`, "Excluir", () => mudou(() => { state.liturgias = state.liturgias.filter((l) => l !== lit); })),
          }, icone("trash"), "Excluir")
        )
      ),
      h("label", { class: "check" }, h("input", { type: "checkbox", checked: !!lit.solene, onchange: (e) => mudou(() => { lit.solene = e.target.checked; }) }), "Liturgia de culto solene (salmos/hinos e louvores seguem a orientação pastoral)"),
      h("p", { class: "small muted" }, usadaPor.length ? `Usada por: ${usadaPor.map((c) => c.nome).join(", ")}. Mudanças valem para as próximas escalas geradas.` : "Nenhum culto semanal usa esta liturgia ainda; ela pode ser usada em cultos avulsos."),
      h("div", { class: "itens-lit" }, lit.itens.map((it, i) => h("div", { class: "item-lit" },
        h("div", { class: "cab" },
          h("span", { class: "numero num" }, String(i + 1)),
          h("input", { type: "text", id: `it-titulo-${lit.id}-${it.id}`, value: it.titulo, "aria-label": "Nome da parte", placeholder: "Nome da parte", oninput: (e) => { it.titulo = e.target.value; mudou(null, false); } }),
          h("select", {
            "aria-label": "Tipo da parte", id: `it-tipo-${lit.id}-${it.id}`,
            onchange: (e) => mudou(() => {
              it.tipo = e.target.value;
              if (it.tipo === "musica") { it.tipos = it.tipos || ["salmo", "hino"]; it.tags = it.tags || []; it.qtd = it.qtd || 1; }
              if (it.tipo === "oficial") { it.cargos = it.cargos || []; it.qtd = it.qtd || 1; }
            }),
          }, [["musica", "Música"], ["oficial", "Oficial"], ["texto", "Texto fixo"]].map(([v, n]) => h("option", { value: v, selected: it.tipo === v || null }, n))),
          h("span", { class: "mini-acoes" },
            h("button", { class: "btn leve icone", "aria-label": "Subir", disabled: i === 0 || null, onclick: () => mover(i, -1) }, icone("up")),
            h("button", { class: "btn leve icone", "aria-label": "Descer", disabled: i === lit.itens.length - 1 || null, onclick: () => mover(i, 1) }, icone("down")),
            h("button", { class: "btn leve icone perigo", "aria-label": "Remover parte", onclick: () => mudou(() => { lit.itens.splice(i, 1); }) }, icone("x"))
          )
        ),
        configItem(it)
      ))),
      h("button", { class: "btn", style: "justify-self:start", onclick: () => mudou(() => { lit.itens.push({ id: E.novoId("i"), titulo: "", tipo: "musica", tipos: ["salmo", "hino"], tags: [], qtd: 1, texto: "", notaPadrao: "" }); }) }, icone("plus"), "Parte da liturgia")
    );
  }

  function configItem(it) {
    const comuns = h("div", { class: "grade", style: "grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))" },
      h("label", { class: "campo" }, it.tipo === "texto" ? "Responsável ou orientação" : "Orientação (opcional)", h("input", { type: "text", id: `it-texto-${it.id}`, value: it.texto || "", placeholder: it.tipo === "texto" ? "ex.: Dirigente · em pé" : "ex.: Em pé", oninput: (e) => { it.texto = e.target.value; mudou(null, false); } })),
      h("label", { class: "campo" }, "Observação que já vem preenchida", h("input", { type: "text", id: `it-nota-${it.id}`, value: it.notaPadrao || "", placeholder: "ex.: Êxodo 20.1–17", oninput: (e) => { it.notaPadrao = e.target.value; mudou(null, false); } }))
    );
    const qtd = (rotulo) => h("label", { class: "campo", style: "max-width:120px" }, rotulo, h("input", { type: "number", min: 1, max: 6, value: it.qtd || 1, onchange: (e) => mudou(() => { it.qtd = Math.max(1, Math.min(6, Number(e.target.value) || 1)); }) }));
    if (it.tipo === "musica") {
      return h("div", { class: "pilha", style: "gap:10px;padding-left:36px" },
        h("div", { class: "campo" }, "Aceita", h("div", { class: "chips" }, E.TIPOS_MUSICA.map((t) => h("button", {
          class: "chip", "aria-pressed": String((it.tipos || []).includes(t.id)),
          onclick: () => mudou(() => { it.tipos = (it.tipos || []).includes(t.id) ? it.tipos.filter((x) => x !== t.id) : [...(it.tipos || []), t.id]; }),
        }, t.nome)))),
        h("div", { class: "campo" }, "Etiquetas exigidas neste momento (além da regra do solene)", seletorTags(it.tags = it.tags || [], () => mudou(null, false))),
        qtd("Quantas músicas"),
        comuns
      );
    }
    if (it.tipo === "oficial") {
      return h("div", { class: "pilha", style: "gap:10px;padding-left:36px" },
        h("div", { class: "campo" }, "Quem pode fazer (nenhum marcado = qualquer oficial)", h("div", { class: "chips" }, CARGOS.map((c) => h("button", {
          class: "chip", "aria-pressed": String((it.cargos || []).includes(c)),
          onclick: () => mudou(() => { it.cargos = (it.cargos || []).includes(c) ? it.cargos.filter((x) => x !== c) : [...(it.cargos || []), c]; }),
        }, c)))),
        qtd("Quantas pessoas"),
        comuns
      );
    }
    return h("div", { style: "padding-left:36px" }, comuns);
  }

  /* --------------------------------------------------- cultos e regras */

  function telaCultos() {
    const r = state.regras;
    return h("div", { class: "pilha" },
      h("section", { class: "painel" },
        h("header", {}, h("h2", {}, "Orientação pastoral para os cultos solenes")),
        h("div", { class: "grade", style: "grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))" },
          h("div", { class: "campo" }, "Salmos e hinos precisam ter", seletorTags(r.soleneTagsHinario = r.soleneTagsHinario || [], () => mudou(null, false))),
          h("div", { class: "campo" }, "Louvores precisam ter", seletorTags(r.soleneTagsLouvor = r.soleneTagsLouvor || [], () => mudou(null, false)))
        ),
        h("div", { class: "grade" },
          h("label", { class: "campo" }, "Não repetir uma música antes de (semanas)", h("input", { type: "number", id: "regra-intervalo", min: 0, max: 26, value: r.intervaloMusicaSemanas || 0, onchange: (e) => mudou(() => { r.intervaloMusicaSemanas = Math.max(0, Number(e.target.value) || 0); }) }))
        ),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "regra-acumular", checked: !!r.permitirAcumular, onchange: (e) => mudou(() => { r.permitirAcumular = e.target.checked; }) }), "Permitir que a mesma pessoa tenha duas funções no mesmo culto")
      ),
      h("section", { class: "painel" },
        h("header", {}, h("h2", {}, "Cultos da semana"), h("button", {
          class: "btn primario",
          onclick: () => mudou(() => { state.cultos.push({ id: E.novoId("cul"), nome: "Novo culto", diaSemana: 0, hora: "19:00", semanas: [], liturgiaId: (state.liturgias[0] || {}).id, solene: false, ativo: true, equipe: [{ funcao: (state.funcoes[0] || {}).id, qtd: 1 }] }); }),
        }, icone("plus"), "Culto")),
        h("p", { class: "muted" }, "Cada culto usa uma liturgia e uma equipe. Use as semanas do mês para cultos que só acontecem em alguns domingos, como a Santa Ceia no primeiro domingo."),
        h("div", { class: "cartoes" }, state.cultos.map((c) => cartaoCultoSemanal(c)))
      ),
      h("div", { class: "cartoes" },
        listaEditavel("Funções do louvor", state.funcoes, "Nova função", (id) => state.pessoas.some((p) => (p.funcoes || []).includes(id)) || state.cultos.some((c) => c.equipe.some((q) => q.funcao === id))),
        listaEditavel("Etiquetas das músicas", state.tags, "Nova etiqueta", (id) => state.musicas.some((m) => (m.tags || []).includes(id)) || (r.soleneTagsHinario || []).includes(id) || (r.soleneTagsLouvor || []).includes(id)),
        h("section", { class: "painel" },
          h("header", {}, h("h2", {}, "Igreja")),
          h("label", { class: "campo" }, "Nome que aparece nas escalas", h("input", { type: "text", id: "igreja-nome", value: state.igreja.nome || "", oninput: (e) => { state.igreja.nome = e.target.value; document.getElementById("nome-igreja").textContent = e.target.value; mudou(null, false); } }))
        )
      )
    );
  }

  function cartaoCultoSemanal(c) {
    const SEMANAS = [[1, "1ª"], [2, "2ª"], [3, "3ª"], [4, "4ª"], [5, "5ª"], ["ultima", "Última"]];
    return h("div", { class: `cartao${c.ativo === false ? " inativo" : ""}` },
      h("div", { class: "cab" },
        h("input", { type: "text", id: `cul-nome-${c.id}`, value: c.nome, "aria-label": "Nome do culto", oninput: (e) => { c.nome = e.target.value; mudou(null, false); } }),
        h("button", { class: "btn leve icone perigo", "aria-label": "Excluir culto", title: "Excluir", onclick: () => confirmar("Excluir este culto da semana?", `${c.nome} deixa de entrar nas próximas escalas. As escalas já feitas não mudam.`, "Excluir", () => mudou(() => { state.cultos = state.cultos.filter((x) => x !== c); })) }, icone("trash"))
      ),
      h("div", { class: "grade", style: "grid-template-columns:repeat(auto-fill,minmax(min(100%,130px),1fr))" },
        h("label", { class: "campo" }, "Dia", h("select", { id: `cul-dia-${c.id}`, onchange: (e) => mudou(() => { c.diaSemana = Number(e.target.value); }) }, E.DIAS.map((d, i) => h("option", { value: i, selected: Number(c.diaSemana) === i || null }, d)))),
        h("label", { class: "campo" }, "Hora", h("input", { type: "time", id: `cul-hora-${c.id}`, value: c.hora || "", onchange: (e) => mudou(() => { c.hora = e.target.value; }, false) }))
      ),
      h("label", { class: "campo" }, "Liturgia", h("select", { id: `cul-lit-${c.id}`, onchange: (e) => mudou(() => { c.liturgiaId = e.target.value; }) }, state.liturgias.map((l) => h("option", { value: l.id, selected: l.id === c.liturgiaId || null }, l.nome)))),
      h("div", { class: "campo" }, "Semanas do mês (nenhuma marcada = toda semana)", h("div", { class: "chips" }, SEMANAS.map(([v, n]) => h("button", {
        class: "chip", "aria-pressed": String((c.semanas || []).includes(v)),
        onclick: () => mudou(() => { c.semanas = (c.semanas || []).includes(v) ? c.semanas.filter((x) => x !== v) : [...(c.semanas || []), v]; }),
      }, n)))),
      h("div", { class: "campo" }, "Equipe necessária",
        h("div", { class: "pilha", style: "gap:6px" }, c.equipe.map((q, i) => h("div", { style: "display:grid;grid-template-columns:minmax(0,1fr) 70px auto;gap:6px;align-items:center" },
          h("select", { "aria-label": "Função", onchange: (e) => mudou(() => { q.funcao = e.target.value; }) }, state.funcoes.map((f) => h("option", { value: f.id, selected: f.id === q.funcao || null }, f.nome))),
          h("input", { type: "number", min: 1, max: 8, value: q.qtd, "aria-label": "Quantidade", onchange: (e) => mudou(() => { q.qtd = Math.max(1, Math.min(8, Number(e.target.value) || 1)); }) }),
          h("button", { class: "btn leve icone perigo", "aria-label": "Remover função", onclick: () => mudou(() => { c.equipe.splice(i, 1); }) }, icone("x"))
        ))),
        h("button", { class: "btn", style: "justify-self:start", onclick: () => mudou(() => { c.equipe.push({ funcao: (state.funcoes.find((f) => !c.equipe.some((q) => q.funcao === f.id)) || state.funcoes[0] || {}).id, qtd: 1 }); }) }, icone("plus"), "Função")
      ),
      h("label", { class: "check" }, h("input", { type: "checkbox", checked: !!c.solene, onchange: (e) => mudou(() => { c.solene = e.target.checked; }) }), "Culto solene"),
      h("label", { class: "check" }, h("input", { type: "checkbox", checked: c.ativo !== false, onchange: (e) => mudou(() => { c.ativo = e.target.checked; }) }), "Ativo (entra nas escalas)")
    );
  }

  function listaEditavel(titulo, lista, novoNome, emUso) {
    return h("section", { class: "painel" },
      h("header", {}, h("h2", {}, titulo)),
      h("div", { class: "pilha", style: "gap:6px" }, lista.map((x, i) => h("div", { style: "display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px" },
        h("input", { type: "text", value: x.nome, "aria-label": titulo, oninput: (e) => { x.nome = e.target.value; mudou(null, false); } }),
        h("button", {
          class: "btn leve icone perigo", "aria-label": "Remover",
          onclick: () => emUso(x.id) ? toast(`"${x.nome}" está em uso. Tire-a de quem usa antes de remover.`) : mudou(() => { lista.splice(i, 1); }),
        }, icone("x"))
      ))),
      h("button", {
        class: "btn", style: "justify-self:start",
        onclick: () => mudou(() => {
          const base = E.normalizar(novoNome).replace(/\s+/g, "-");
          let id = base, n = 2;
          while (porId(lista, id)) id = `${base}-${n++}`;
          lista.push({ id, nome: novoNome });
        }),
      }, icone("plus"), novoNome)
    );
  }

  /* ------------------------------------------------------------ backup */

  function nomeArquivo() {
    return `escala-louvor-${hoje()}.json`;
  }

  async function baixarBackup() {
    const dados = JSON.stringify(state, null, 2);
    if (armazem.downloads) {
      try {
        const r = await armazem.downloads.save({ filename: nomeArquivo(), data: dados });
        if (r && r.status === "saved") toast("Backup salvo.");
      } catch (e) {
        toast("O download não foi feito. Use Copiar dados para guardar o backup.");
      }
      return;
    }
    if (window.claude && typeof window.claude.use === "function") {
      toast("Downloads não estão disponíveis aqui. Use Copiar dados.");
      return;
    }
    const url = URL.createObjectURL(new Blob([dados], { type: "application/json" }));
    const a = h("a", { href: url, download: nomeArquivo() });
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
      return toast("Esse texto não é um backup válido da Escala do Louvor.");
    }
    if (!dados || typeof dados !== "object" || !Array.isArray(dados.musicas || []) || !(dados.cultos || dados.pessoas || dados.musicas)) {
      return toast("Esse arquivo não parece um backup da Escala do Louvor.");
    }
    confirmar("Substituir os dados atuais?", "Tudo o que está na ferramenta agora será trocado pelo conteúdo do backup.", "Substituir", () => {
      state = E.migrar(dados, X.configuracaoBase());
      ui.escalaId = escalasOrdenadas()[0] ? escalasOrdenadas()[0].id : null;
      mudou();
      renderAbas();
      toast("Backup restaurado.");
    });
  }

  function telaBackup() {
    const nuvem = !!armazem.db;
    const area = h("textarea", { id: "backup-texto", rows: 6, placeholder: "Cole aqui o conteúdo de um backup (.json)" });
    const arquivo = h("input", {
      type: "file", id: "backup-arquivo", accept: ".json,application/json",
      onchange: (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const leitor = new FileReader();
        leitor.onload = () => restaurar(String(leitor.result));
        leitor.readAsText(f);
        e.target.value = "";
      },
    });
    const n = (k) => state[k].length;
    return h("div", { class: "cartoes", style: "grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr))" },
      h("section", { class: "painel" },
        h("header", {}, h("h2", {}, "Onde os dados ficam")),
        h("p", {}, nuvem
          ? "Os dados ficam salvos na nuvem, junto com esta página: abrem iguais no celular e no computador."
          : "Os dados ficam salvos neste navegador, neste aparelho. Se limpar os dados do navegador ou trocar de aparelho, eles não vão junto: baixe um backup de vez em quando."),
        h("p", { class: "small muted num" }, `${n("pessoas")} pessoas · ${n("oficiais")} oficiais · ${n("musicas")} músicas · ${n("liturgias")} liturgias · ${n("cultos")} cultos semanais · ${n("escalas")} escalas`),
        h("div", { class: "acoes" },
          h("button", { class: "btn primario", onclick: baixarBackup }, icone("download"), "Baixar backup"),
          h("button", { class: "btn", onclick: () => copiar(JSON.stringify(state)) }, icone("copy"), "Copiar dados")
        )
      ),
      h("section", { class: "painel" },
        h("header", {}, h("h2", {}, "Restaurar um backup")),
        h("label", { class: "campo" }, "Arquivo de backup", arquivo),
        area,
        h("div", { class: "acoes" }, h("button", { class: "btn", onclick: () => area.value.trim() ? restaurar(area.value) : toast("Cole o backup no campo acima.") }, "Restaurar do texto colado"))
      ),
      h("section", { class: "painel" },
        h("header", {}, h("h2", {}, "Recomeçar")),
        h("p", { class: "muted" }, "Para voltar ao ponto de partida (repertório e liturgias da igreja, equipe de exemplo) ou para zerar tudo."),
        h("div", { class: "acoes" },
          h("button", { class: "btn", onclick: () => confirmar("Voltar aos dados iniciais?", "Tudo volta a como estava na primeira abertura: liturgias e repertório da igreja, com equipe de exemplo. Baixe um backup antes, se precisar.", "Voltar aos dados iniciais", () => { state = novoInicial(); ui.escalaId = state.escalas[0] ? state.escalas[0].id : null; mudou(); renderAbas(); }) }, "Voltar aos dados iniciais"),
          h("button", { class: "btn perigo", onclick: () => confirmar("Apagar tudo?", "Equipe, oficiais, repertório e escalas serão apagados. Liturgias, cultos e regras voltam ao padrão.", "Apagar tudo", () => { state = Object.assign(X.configuracaoBase(), { exemplo: false, pessoas: [], oficiais: [], musicas: [], escalas: [] }); ui.escalaId = null; mudou(); renderAbas(); }) }, "Apagar tudo")
        )
      )
    );
  }

  iniciar();
})();
