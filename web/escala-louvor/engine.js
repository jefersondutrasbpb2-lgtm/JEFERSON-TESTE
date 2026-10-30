/*
 * Motor da Escala do Louvor.
 *
 * Funções puras: recebem o estado (equipe, repertório, cultos e regras) e
 * devolvem escalas, candidatos, avisos e textos. Não mexem no DOM nem no
 * armazenamento, para poderem ser testadas com `node --test`.
 *
 * Cada culto de uma escala tem a equipe (uma vaga por pessoa) e a lista de
 * músicas, na ordem em que serão cantadas. A liturgia é organizada pelo pastor
 * e não faz parte da ferramenta.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.EscalaEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const TIPOS_MUSICA = [
    { id: "hino", nome: "Salmos e Hinos" },
    { id: "louvor", nome: "Louvor" },
  ];
  const SEM_USO = 1e6; // "nunca cantada": fica à frente de qualquer música já cantada
  const APOIO = 1000; // quem só apoia numa função entra apenas quando nenhum titular pode

  /* ---------------------------------------------------------------- datas */

  function parseData(iso) {
    const [y, m, d] = String(iso).split("-").map(Number);
    return new Date(y, m - 1, d, 12); // meio-dia evita surpresas de fuso/horário de verão
  }

  function isoData(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function somarDias(iso, n) {
    const d = parseData(iso);
    d.setDate(d.getDate() + n);
    return isoData(d);
  }

  const diasEntre = (a, b) => Math.round((parseData(b) - parseData(a)) / 86400000);
  const diaSemana = (iso) => parseData(iso).getDay();

  /** 1 = primeira ocorrência daquele dia da semana no mês, 2 = segunda… */
  const semanaDoMes = (iso) => Math.floor((parseData(iso).getDate() - 1) / 7) + 1;

  function ehUltimaSemana(iso) {
    const d = parseData(iso);
    const mes = d.getMonth();
    d.setDate(d.getDate() + 7);
    return d.getMonth() !== mes;
  }

  function fimDoMes(anoMes) {
    const [y, m] = anoMes.split("-").map(Number);
    return isoData(new Date(y, m, 0, 12));
  }

  function formatarData(iso, estilo) {
    const d = parseData(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    if (estilo === "curta") return `${dd}/${mm}`;
    if (estilo === "dia") return `${DIAS_CURTOS[d.getDay()]}, ${dd}/${mm}`;
    if (estilo === "longa") return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  function formatarPeriodo(inicio, fim) {
    const a = parseData(inicio);
    if (a.getDate() === 1 && fim === fimDoMes(inicio.slice(0, 7))) {
      return `${MESES[a.getMonth()][0].toUpperCase()}${MESES[a.getMonth()].slice(1)} de ${a.getFullYear()}`;
    }
    return `${formatarData(inicio, "curta")} a ${formatarData(fim)}`;
  }

  /** Indisponibilidades: "AAAA-MM-DD" ou "AAAA-MM-DD..AAAA-MM-DD". */
  function indisponivelEm(lista, iso) {
    return (lista || []).some((item) => {
      const [ini, fim] = String(item).split("..");
      return fim ? iso >= ini && iso <= fim : iso === ini;
    });
  }

  /* ------------------------------------------------------------- sorteio */

  function criarAleatorio(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function novoId(prefixo) {
    return `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Escolhe o melhor candidato livre, sorteando entre os empatados. */
  function escolher(candidatos, chave, rand, folga) {
    const livres = candidatos.filter((c) => !c.bloqueio && c.atende !== false);
    if (!livres.length) return null;
    const melhor = chave(livres[0]);
    const empatados = livres.filter((c) => Math.abs(chave(c) - melhor) <= folga);
    return empatados[Math.floor(rand() * empatados.length)];
  }

  /* ----------------------------------------------------------- consultas */

  const porId = (lista, id) => (lista || []).find((x) => x.id === id);

  function normalizar(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }

  function rotuloMusica(m) {
    if (!m) return "";
    if (m.tipo === "louvor") return m.autor ? `${m.titulo} (${m.autor})` : m.titulo;
    if (m.numero && m.titulo) return `SH ${m.numero} · ${m.titulo}`;
    return m.numero ? `SH ${m.numero}` : m.titulo;
  }

  function nomeFuncao(state, id) {
    const f = porId(state.funcoes, id);
    return f ? f.nome : id;
  }

  function nomeTag(state, id) {
    const t = porId(state.tags, id);
    return t ? t.nome.toLowerCase() : id;
  }

  const nomeTipo = (tipo) => (TIPOS_MUSICA.find((t) => t.id === tipo) || { nome: tipo }).nome;

  /** "principal", "apoio" ou null: como a pessoa faz esta função. */
  function nivelFuncao(pessoa, funcao) {
    if (!pessoa) return null;
    if ((pessoa.funcoes || []).includes(funcao)) return "principal";
    if ((pessoa.apoio || []).includes(funcao)) return "apoio";
    return null;
  }

  /** Etiquetas exigidas de uma música deste tipo (orientação pastoral do culto solene). */
  function tagsExigidas(state, tipo, solene) {
    if (!solene) return [];
    const r = state.regras || {};
    return (tipo === "louvor" ? r.soleneTagsLouvor : r.soleneTagsHinario) || [];
  }

  function aptaSolene(state, m) {
    return tagsExigidas(state, m.tipo, true).every((t) => (m.tags || []).includes(t));
  }

  /** Cultos do período, em ordem de data e hora, a partir dos cultos semanais ativos. */
  function listarOcorrencias(cultos, inicio, fim) {
    const lista = [];
    for (let d = inicio; d <= fim; d = somarDias(d, 1)) {
      const dow = diaSemana(d);
      const semana = semanaDoMes(d);
      const ultima = ehUltimaSemana(d);
      for (const c of cultos || []) {
        if (c.ativo === false || Number(c.diaSemana) !== dow) continue;
        const semanas = c.semanas || [];
        if (semanas.length && !semanas.includes(semana) && !(ultima && semanas.includes("ultima"))) continue;
        lista.push({ data: d, cultoId: c.id });
      }
    }
    const hora = (o) => (porId(cultos, o.cultoId) || {}).hora || "";
    return lista.sort((a, b) => (a.data + hora(a)).localeCompare(b.data + hora(b)));
  }

  /* ---------------------------------------------------- disponibilidade */

  /**
   * Respostas de disponibilidade: { id, pessoaId, inicio, fim, dias, obs, em }.
   * `dias` são as datas em que a pessoa PODE servir; as outras datas do período
   * contam como "não posso".
   */
  function respostaDe(state, pessoaId, data) {
    let achada = null;
    for (const r of state.respostas || []) {
      if (r.pessoaId !== pessoaId || data < r.inicio || data > r.fim) continue;
      if (!achada || String(r.em || "") > String(achada.em || "")) achada = r;
    }
    return achada;
  }

  /** "sim", "nao" ou null (a pessoa não respondeu para esta data). */
  function disponivelEm(state, pessoaId, data) {
    return estadoNoDia(respostaDe(state, pessoaId, data), data);
  }

  /**
   * "sim", "nao" ou null (não marcou) para um dia de uma resposta. Respostas novas guardam os dias
   * em que a pessoa NÃO pode em `nao`; nas antigas (sem `nao`), todo dia não marcado conta como "não posso".
   */
  function estadoNoDia(r, data) {
    if (!r) return null;
    if ((r.dias || []).includes(data)) return "sim";
    if (!Array.isArray(r.nao)) return "nao";
    return r.nao.includes(data) ? "nao" : null;
  }

  /** Há pedido de disponibilidade cobrindo esta data (alguém já respondeu)? */
  const pedidoCobre = (state, data) => (state.respostas || []).some((r) => data >= r.inicio && data <= r.fim);

  /** Dias de culto do período, cada um com os cultos daquele dia. */
  function diasDeCulto(state, inicio, fim) {
    const dias = [];
    for (const oc of listarOcorrencias(state.cultos, inicio, fim)) {
      const cfg = porId(state.cultos, oc.cultoId);
      let d = dias.find((x) => x.data === oc.data);
      if (!d) dias.push((d = { data: oc.data, cultos: [] }));
      d.cultos.push(cfg);
    }
    return dias;
  }

  const idResposta = (pessoaId, inicio) => `${pessoaId}__${inicio}`;

  /** Código curto que a pessoa manda pelo WhatsApp quando não consegue salvar direto. */
  function codigoResposta(r) {
    const lista = (ds) => (ds || []).slice().sort().map((d) => formatarData(d, "curta")).join(",");
    const nao = Array.isArray(r.nao) && r.nao.length ? ` nao:${lista(r.nao)}` : "";
    return `#disp ${r.pessoaId} ${r.inicio} ${r.fim} ${lista(r.dias) || "-"}${nao}`;
  }

  function textoResposta(state, r) {
    const pessoa = porId(state.pessoas, r.pessoaId);
    const todos = diasDeCulto(state, r.inicio, r.fim).map((d) => d.data);
    const com = (estado) => todos.filter((d) => estadoNoDia(r, d) === estado).map((d) => formatarData(d, "dia"));
    const pode = com("sim");
    const nao = com("nao");
    const semMarca = com(null);
    return [
      `*Disponibilidade · ${pessoa ? pessoa.nome : r.pessoaId}*`,
      `_${formatarPeriodo(r.inicio, r.fim)}_`,
      `Posso: ${pode.join(", ") || "nenhum dia"}`,
      nao.length ? `Não posso: ${nao.join(", ")}` : "",
      semMarca.length ? `Sem resposta: ${semMarca.join(", ")}` : "",
      r.obs ? `Recado: ${r.obs}` : "",
      "",
      codigoResposta(r),
    ].filter((l, i, a) => l || (i > 0 && a[i - 1])).join("\n");
  }

  /** Lê os códigos "#disp …" colados (de uma ou várias mensagens). */
  function lerRespostas(state, texto) {
    const saida = [];
    // "#disp pessoa início fim 25/10,27/10 nao:29/10" (o trecho "nao:" só existe nas respostas novas).
    const re = /#disp[ \t]+(\S+)[ \t]+(\d{4}-\d{2}-\d{2})[ \t]+(\d{4}-\d{2}-\d{2})[ \t]*([^\n#]*)/gi;
    let m;
    while ((m = re.exec(String(texto || "")))) {
      const [, pessoaId, inicio, fim, resto] = m;
      if (!porId(state.pessoas, pessoaId)) continue;
      const datas = diasDeCulto(state, inicio, fim).map((d) => d.data);
      const ler = (lista) => {
        const achadas = [];
        for (const parte of String(lista || "").split(/[,\s]+/)) {
          const [dd, mm] = parte.split("/").map(Number);
          if (!dd || !mm) continue;
          const data = datas.find((x) => parseData(x).getDate() === dd && parseData(x).getMonth() + 1 === mm);
          if (data && !achadas.includes(data)) achadas.push(data);
        }
        return achadas;
      };
      const [podeTxt, naoTxt] = resto.split(/n[aã]o\s*:/i);
      const r = { id: idResposta(pessoaId, inicio), pessoaId, inicio, fim, dias: ler(podeTxt), obs: "", em: new Date().toISOString() };
      if (naoTxt !== undefined) r.nao = ler(naoTxt).filter((d) => !r.dias.includes(d));
      saida.push(r);
    }
    return saida;
  }

  /* ------------------------------------------------------ cultos ligados */

  /** O culto do mesmo dia cuja equipe e músicas este repete (ex.: o das 18h repete o das 9h). */
  function liderDe(escala, culto) {
    return culto && culto.acompanha ? (escala.cultos || []).find((c) => c.id === culto.acompanha && c !== culto) || null : null;
  }

  /** Liga cada culto configurado com "acompanha" ao culto líder do mesmo dia. */
  function vincularCultos(state, escala) {
    for (const c of escala.cultos) {
      const cfg = !c.avulso && porId(state.cultos, c.cultoId);
      const alvo = cfg && cfg.acompanha;
      const alvoCfg = alvo && porId(state.cultos, alvo);
      const lider = alvoCfg && !alvoCfg.acompanha && escala.cultos.find((x) => x !== c && !x.avulso && x.data === c.data && x.cultoId === alvo);
      c.acompanha = lider ? lider.id : null;
    }
    return escala;
  }

  /**
   * Copia do culto líder a equipe e as músicas. A ordem das músicas escolhida
   * neste culto é mantida; as que o líder trocou entram no lugar das que saíram.
   */
  function sincronizarCulto(escala, culto) {
    const lider = liderDe(escala, culto);
    if (!lider) return culto;
    culto.equipe = lider.equipe.map((s) => ({ funcao: s.funcao, pessoaId: s.pessoaId }));
    const restantes = lider.musicas.map((m) => ({ tipo: m.tipo, id: m.id }));
    const nova = culto.musicas.map((m) => {
      const i = m.id ? restantes.findIndex((r) => r.id === m.id) : -1;
      return i >= 0 ? restantes.splice(i, 1)[0] : null;
    });
    for (let k = 0; k < nova.length && restantes.length; k++) if (!nova[k]) nova[k] = restantes.shift();
    culto.musicas = nova.filter(Boolean).concat(restantes);
    return culto;
  }

  function sincronizarEscala(escala) {
    escala.cultos.forEach((c) => sincronizarCulto(escala, c));
    return escala;
  }

  /* ---------------------------------------------------------- histórico */

  /**
   * Quem serviu e o que foi cantado, por data. Considera as outras escalas
   * salvas e os demais cultos da escala em edição; `ignorar` deixa de fora o
   * próprio campo que está sendo sorteado. Um culto que repete outro do mesmo
   * dia conta uma vez só.
   */
  function montarUsos(state, escala, ignorar) {
    const usos = { pessoas: {}, musicas: {} };
    const add = (mapa, id, data, ref) => {
      if (id) (mapa[id] = mapa[id] || []).push({ data, ref });
    };
    for (const m of state.musicas || []) if (m.ultimaVez) add(usos.musicas, m.id, m.ultimaVez, { atual: false });
    const escalas = (state.escalas || []).filter((e) => !escala || e.id !== escala.id);
    if (escala) escalas.push(escala);
    for (const e of escalas) {
      const atual = !!escala && e.id === escala.id;
      (e.cultos || []).forEach((c, ci) => {
        if (liderDe(e, c)) return;
        (c.equipe || []).forEach((s, si) => {
          if (!(atual && ignorar === `${ci}:e:${si}`)) add(usos.pessoas, s.pessoaId, c.data, { atual, ci });
        });
        (c.musicas || []).forEach((m, k) => {
          if (!(atual && ignorar === `${ci}:m:${k}`)) add(usos.musicas, m.id, c.data, { atual, ci });
        });
      });
    }
    return usos;
  }

  const serveNoCulto = (culto, pessoaId) => (culto.equipe || []).some((s) => s.pessoaId === pessoaId);

  /* ---------------------------------------------------------- candidatos */

  function pontuarPessoa(escala, ci, pessoa, usos) {
    const culto = escala.cultos[ci];
    const lista = usos.pessoas[pessoa.id] || [];
    const naEscala = lista.filter((u) => u.ref.atual).length;
    const recentes = lista.filter((u) => !u.ref.atual && Math.abs(diasEntre(u.data, culto.data)) <= 90).length;
    const proprios = escala.cultos.filter((c) => !liderDe(escala, c));
    const pos = proprios.indexOf(culto);
    const anterior = pos > 0 ? proprios[pos - 1] : null;
    const mesmoDia = proprios.some((c) => c !== culto && c.data === culto.data && serveNoCulto(c, pessoa.id));
    let score = naEscala * 10 + recentes * 1.5;
    if (anterior && serveNoCulto(anterior, pessoa.id)) score += 6;
    if (mesmoDia) score += 8;
    return score;
  }

  /**
   * Pessoas que podem ocupar uma vaga, das mais indicadas às menos indicadas.
   * `bloqueio` explica por que alguém não deveria ser escalado.
   */
  function candidatosPessoa(state, escala, ci, si) {
    const culto = escala.cultos[ci];
    const vaga = culto.equipe[si];
    const usos = montarUsos(state, escala, `${ci}:e:${si}`);
    const acumula = state.regras && state.regras.permitirAcumular;
    return (state.pessoas || [])
      .filter((p) => p.ativo !== false && nivelFuncao(p, vaga.funcao))
      .map((p) => {
        const apoio = nivelFuncao(p, vaga.funcao) === "apoio";
        const disp = disponivelEm(state, p.id, culto.data);
        const semResposta = disp === null && pedidoCobre(state, culto.data);
        let bloqueio = "";
        if (indisponivelEm(p.indisponivel, culto.data)) bloqueio = "não pode nesta data";
        else if (disp === "nao") bloqueio = "marcou que não pode";
        else if (semResposta && state.regras && state.regras.soQuemRespondeu) bloqueio = "não respondeu a disponibilidade";
        else if (p.cultos && p.cultos.length && culto.cultoId && !p.cultos.includes(culto.cultoId)) bloqueio = "não serve neste culto";
        else if (!acumula && culto.equipe.some((s, i) => i !== si && s.pessoaId === p.id)) bloqueio = "já tem outra função neste culto";
        const vezes = (usos.pessoas[p.id] || []).filter((u) => u.ref.atual).length;
        // Quem confirmou que pode vem antes de quem ainda não respondeu.
        const score = pontuarPessoa(escala, ci, p, usos) + (apoio ? APOIO : 0) + (semResposta ? 15 : 0);
        return { pessoa: p, apoio, disp, semResposta, bloqueio, vezes, score };
      })
      .sort((a, b) => (a.bloqueio ? 1 : 0) - (b.bloqueio ? 1 : 0) || a.score - b.score || a.pessoa.nome.localeCompare(b.pessoa.nome));
  }

  /**
   * Músicas para uma posição do culto. `atende` diz se a música segue a
   * orientação pastoral (culto solene); `distancia` é quantos dias faltam ou
   * passaram desde o uso mais próximo.
   */
  function candidatosMusica(state, escala, ci, k) {
    const culto = escala.cultos[ci];
    const vaga = culto.musicas[k];
    const usos = montarUsos(state, escala, `${ci}:m:${k}`);
    const intervalo = ((state.regras && state.regras.intervaloMusicaSemanas) || 0) * 7;
    const noCulto = new Set(culto.musicas.filter((m, kk) => kk !== k).map((m) => m.id));
    const exigidas = tagsExigidas(state, vaga.tipo, culto.solene);
    return (state.musicas || [])
      .filter((m) => m.ativo !== false && m.tipo === vaga.tipo)
      .map((m) => {
        const faltam = exigidas.filter((t) => !(m.tags || []).includes(t));
        let distancia = SEM_USO;
        let dataPerto = null;
        for (const u of usos.musicas[m.id] || []) {
          const dist = Math.abs(diasEntre(u.data, culto.data));
          if (dist < distancia) { distancia = dist; dataPerto = u.data; }
        }
        const passadas = (usos.musicas[m.id] || []).map((u) => u.data).filter((d) => d <= culto.data).sort();
        let bloqueio = "";
        if (noCulto.has(m.id)) bloqueio = "já está neste culto";
        else if (distancia < intervalo) {
          if (distancia === 0) bloqueio = "cantada no mesmo dia";
          else if (dataPerto < culto.data) bloqueio = `cantada há ${distancia} dias`;
          else bloqueio = `já programada para ${formatarData(dataPerto, "curta")}`;
        }
        return { musica: m, atende: !faltam.length, faltam, ultima: passadas[passadas.length - 1] || null, distancia, bloqueio };
      })
      .sort((a, b) =>
        (b.atende ? 1 : 0) - (a.atende ? 1 : 0) ||
        (a.bloqueio ? 1 : 0) - (b.bloqueio ? 1 : 0) ||
        b.distancia - a.distancia ||
        rotuloMusica(a.musica).localeCompare(rotuloMusica(b.musica), "pt-BR", { numeric: true })
      );
  }

  /* ------------------------------------------------------------- geração */

  function esqueletoCulto(state, data, cfg, extra) {
    extra = extra || {};
    const equipe = [];
    for (const req of cfg.equipe || []) {
      for (let i = 0; i < (Number(req.qtd) || 0); i++) equipe.push({ funcao: req.funcao, pessoaId: null });
    }
    const qtd = cfg.musicas || {};
    const musicas = [];
    for (const t of TIPOS_MUSICA) for (let i = 0; i < (Number(qtd[t.id]) || 0); i++) musicas.push({ tipo: t.id, id: null });
    return {
      id: novoId("c"),
      data,
      cultoId: cfg.id || null,
      nome: extra.nome || cfg.nome || "Culto",
      hora: extra.hora || cfg.hora || "",
      solene: extra.solene !== undefined && extra.solene !== null ? !!extra.solene : !!cfg.solene,
      acompanha: null,
      equipe,
      musicas,
      travados: [],
      obs: "",
    };
  }

  /** Preenche os campos vazios (e não fixados) de um culto já montado. */
  function preencherCulto(state, escala, ci, rand) {
    const culto = escala.cultos[ci];
    if (liderDe(escala, culto)) return sincronizarCulto(escala, culto);
    const fixo = new Set(culto.travados || []);
    const titulares = (f) => (state.pessoas || []).filter((p) => p.ativo !== false && nivelFuncao(p, f) === "principal").length;
    // Funções com menos gente são preenchidas primeiro, para não "gastar" quem é insubstituível.
    const ordem = culto.equipe.map((s, si) => si).sort((a, b) => titulares(culto.equipe[a].funcao) - titulares(culto.equipe[b].funcao));
    for (const si of ordem) {
      const vaga = culto.equipe[si];
      if (vaga.pessoaId || fixo.has(`e:${si}`)) continue;
      const c = escolher(candidatosPessoa(state, escala, ci, si), (x) => x.score, rand, 0.5);
      vaga.pessoaId = c ? c.pessoa.id : null;
    }
    culto.musicas.forEach((vaga, k) => {
      if (vaga.id || fixo.has(`m:${k}`)) return;
      const lista = candidatosMusica(state, escala, ci, k);
      // Músicas nunca cantadas empatam entre si; as já cantadas têm ~1 semana de folga.
      let c = escolher(lista, (x) => x.distancia, rand, 7);
      // Repertório curto: antes de deixar vazio, aceita repetir a cantada há mais tempo.
      if (!c) {
        const relaxada = lista.filter((x) => x.bloqueio && x.bloqueio !== "já está neste culto").map((x) => Object.assign({}, x, { bloqueio: "" }));
        c = escolher(relaxada, (x) => x.distancia, rand, 0);
      }
      vaga.id = c ? c.musica.id : null;
    });
    return culto;
  }

  function ordenarCultos(escala) {
    escala.cultos.sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || "")));
  }

  /** Recria o culto pela configuração atual, mantendo os campos fixados. */
  function manterFixos(state, velho, cfg) {
    const novo = velho.avulso ? JSON.parse(JSON.stringify(velho)) : esqueletoCulto(state, velho.data, cfg);
    const fixo = new Set(velho.travados || []);
    novo.id = velho.id;
    novo.avulso = !!velho.avulso;
    novo.obs = velho.obs || "";
    const travados = new Set();
    novo.equipe.forEach((s, si) => {
      const v = velho.equipe[si];
      s.pessoaId = fixo.has(`e:${si}`) && v && v.funcao === s.funcao ? v.pessoaId : null;
      if (s.pessoaId) travados.add(`e:${si}`);
    });
    novo.musicas.forEach((m, k) => {
      const v = velho.musicas[k];
      m.id = fixo.has(`m:${k}`) && v && v.tipo === m.tipo ? v.id : null;
      if (m.id) travados.add(`m:${k}`);
    });
    // Vagas acrescentadas à mão (além do que o culto pede) e já preenchidas continuam.
    if (!velho.avulso) {
      velho.equipe.forEach((v, si) => {
        if (si < novo.equipe.length || !fixo.has(`e:${si}`) || !v.pessoaId) return;
        novo.equipe.push({ funcao: v.funcao, pessoaId: v.pessoaId });
        travados.add(`e:${novo.equipe.length - 1}`);
      });
      velho.musicas.forEach((v, k) => {
        if (k < novo.musicas.length || !fixo.has(`m:${k}`) || !v.id) return;
        novo.musicas.push({ tipo: v.tipo, id: v.id });
        travados.add(`m:${novo.musicas.length - 1}`);
      });
    }
    novo.travados = [...travados];
    return novo;
  }

  /**
   * Gera uma escala para o período. Se `anterior` for informada, os campos
   * fixados dela são mantidos e os cultos extras continuam.
   */
  function gerarEscala(state, opcoes, anterior) {
    const seed = opcoes.seed !== undefined ? opcoes.seed : Math.floor(Math.random() * 2 ** 31);
    const rand = criarAleatorio(seed);
    const escala = {
      id: (anterior && anterior.id) || novoId("esc"),
      titulo: opcoes.titulo || (anterior && anterior.titulo) || "Escala do louvor",
      inicio: opcoes.inicio,
      fim: opcoes.fim,
      tipo: opcoes.tipo || (anterior && anterior.tipo) || "personalizado",
      status: (anterior && anterior.status) || "rascunho",
      criadaEm: (anterior && anterior.criadaEm) || new Date().toISOString(),
      seed,
      cultos: [],
    };
    for (const oc of listarOcorrencias(state.cultos, opcoes.inicio, opcoes.fim)) {
      const cfg = porId(state.cultos, oc.cultoId);
      const velho = anterior && anterior.cultos.find((c) => c.data === oc.data && c.cultoId === oc.cultoId && !c.avulso);
      escala.cultos.push(velho ? manterFixos(state, velho, cfg) : esqueletoCulto(state, oc.data, cfg));
    }
    for (const a of anterior ? anterior.cultos.filter((c) => c.avulso && c.data >= opcoes.inicio && c.data <= opcoes.fim) : []) {
      escala.cultos.push(manterFixos(state, a, {}));
    }
    ordenarCultos(escala);
    vincularCultos(state, escala);
    // Os cultos solenes escolhem primeiro: o repertório apto a eles costuma ser o mais curto.
    const ordem = escala.cultos.map((_, ci) => ci).sort((a, b) => (escala.cultos[b].solene ? 1 : 0) - (escala.cultos[a].solene ? 1 : 0) || a - b);
    // Com `vazia`, a escala sai só com as vagas: quem monta escolhe pessoas e músicas à mão.
    if (!opcoes.vazia) ordem.filter((ci) => !escala.cultos[ci].acompanha).forEach((ci) => preencherCulto(state, escala, ci, rand));
    return sincronizarEscala(escala);
  }

  /** Acrescenta um culto extra (Natal, aniversário da igreja…) com a equipe de um culto da semana. */
  function adicionarCultoExtra(state, escala, opcoes, rand) {
    const cfg = porId(state.cultos, opcoes.cultoId) || { equipe: [], musicas: { hino: 1, louvor: 2 } };
    const culto = esqueletoCulto(state, opcoes.data, cfg, opcoes);
    culto.avulso = true;
    culto.cultoId = null;
    escala.cultos.push(culto);
    ordenarCultos(escala);
    const ci = escala.cultos.indexOf(culto);
    if (!opcoes.vazia) preencherCulto(state, escala, ci, rand || Math.random);
    return ci;
  }

  /** Sorteia de novo um único campo: "e:si" (pessoa) ou "m:k" (música). */
  function sortearCampo(state, escala, ci, campo, rand) {
    rand = rand || Math.random;
    const culto = escala.cultos[ci];
    if (liderDe(escala, culto)) return escala; // segue o culto líder
    const [tipo, n] = campo.split(":");
    const i = Number(n);
    if (tipo === "e") {
      const atual = culto.equipe[i].pessoaId;
      const c = escolher(candidatosPessoa(state, escala, ci, i).filter((x) => x.pessoa.id !== atual), (x) => x.score, rand, 3);
      if (c) culto.equipe[i].pessoaId = c.pessoa.id;
    } else if (tipo === "m") {
      const atual = culto.musicas[i].id;
      const c = escolher(candidatosMusica(state, escala, ci, i).filter((x) => x.musica.id !== atual), (x) => x.distancia, rand, 21);
      if (c) culto.musicas[i].id = c.musica.id;
    }
    return sincronizarEscala(escala);
  }

  /** Limpa o que não está fixado e sorteia o culto de novo. */
  function sortearCulto(state, escala, ci, rand) {
    const culto = escala.cultos[ci];
    const fixo = new Set(culto.travados || []);
    if (!liderDe(escala, culto)) {
      culto.equipe.forEach((s, si) => { if (!fixo.has(`e:${si}`)) s.pessoaId = null; });
      culto.musicas.forEach((m, k) => { if (!fixo.has(`m:${k}`)) m.id = null; });
      preencherCulto(state, escala, ci, rand || Math.random);
    }
    return sincronizarEscala(escala);
  }

  /** Coloca a música na posição k; se ela já estava em outra posição do culto, as duas trocam. */
  function colocarMusica(culto, k, id) {
    const atual = culto.musicas[k].id;
    if (id) culto.musicas.forEach((m, kk) => { if (kk !== k && m.id === id) m.id = atual; });
    culto.musicas[k].id = id;
    return culto;
  }

  /** Move a música da posição k para k + delta (muda a ordem do culto). */
  function moverMusica(culto, k, delta) {
    const j = k + delta;
    if (j < 0 || j >= culto.musicas.length) return culto;
    [culto.musicas[k], culto.musicas[j]] = [culto.musicas[j], culto.musicas[k]];
    // A marca de "fixa" acompanha a música.
    const fixo = new Set(culto.travados || []);
    const fk = fixo.delete(`m:${k}`);
    const fj = fixo.delete(`m:${j}`);
    if (fk) fixo.add(`m:${j}`);
    if (fj) fixo.add(`m:${k}`);
    culto.travados = [...fixo];
    return culto;
  }

  /* ------------------------------------------------------------ avisos */

  /* ---------------------------------------------- temas do hinário */

  /**
   * Índice de Assuntos do Salmos e Hinos: seções e subtemas por faixa de números. `tambem` são os
   * números entre parênteses no índice: hinos de outras seções que servem também naquele assunto.
   */
  const S = (nome, de, ate, tambem) => ({ nome, de, ate, tambem: tambem || [] });
  const TEMAS_HINARIO = [
    { id: "salmos", nome: "Salmos", de: 1, ate: 28, subtemas: [] },
    { id: "trindade", nome: "Trindade", de: 29, ate: 36, subtemas: [S("Invocação", 29, 34, [245]), S("Louvor", 35, 36, [31, 32, 239, 241])] },
    { id: "deus", nome: "Deus", de: 37, ate: 70, subtemas: [
      S("Criador e Pai", 37, 38, [6]), S("Governo e Providência", 39, 42, [27, 67]), S("Amor e Compaixão", 43, 45, [22, 233]),
      S("Fidelidade e Promessa", 46, 50), S("Amparo e Direção", 51, 56, [14, 16, 18, 24]), S("Louvor", 57, 70, [11, 21, 28, 248])] },
    { id: "jesus-cristo", nome: "Jesus Cristo", de: 71, ate: 213, subtemas: [
      S("Advento", 71, 72), S("Nascimento", 73, 92), S("Ministério", 93, 102), S("Entrada Triunfal", 103, 107),
      S("Paixão e Morte", 108, 112, [100, 152, 155, 157]), S("Ressurreição e Ascensão", 113, 123), S("Segunda Vinda", 124, 133, [17]),
      S("Amor e Compaixão", 134, 150), S("Sacrifício Redentor", 151, 163), S("Pastor e Guia", 164, 167, [7, 8]),
      S("Amparo e Direção", 168, 177, [28, 144]), S("Obra Completa", 178, 182), S("Preciosidade de Jesus", 183, 193, [142]),
      S("Louvor e Exaltação", 194, 213, [5, 22, 160])] },
    { id: "espirito-santo", nome: "Espírito Santo", de: 214, ate: 218, subtemas: [] },
    { id: "culto-publico", nome: "Culto público", de: 219, ate: 272, subtemas: [
      S("Invocação", 219, 226), S("Convite à Adoração e Louvor", 227, 244, [20, 182]), S("Início do Culto", 245, 256, [31, 36, 195]),
      S("Para Leitura Bíblica", 257, 260), S("Ofertório", 261, 261), S("Encerramento do Culto", 262, 270), S("Bênção", 271, 272)] },
    { id: "evangelho", nome: "Evangelho e salvação", de: 273, ate: 311, subtemas: [
      S("Boas Novas de Salvação", 273, 276), S("Convite à Salvação", 277, 308), S("Brevidade da Vida", 309, 311)] },
    { id: "vida-crista", nome: "Vida cristã", de: 312, ate: 485, subtemas: [
      S("Arrependimento e Contrição", 312, 316), S("Conversão e Rendição", 317, 329), S("Consagração Pessoal", 330, 353),
      S("Santificação", 354, 357), S("Comunhão, Direção e Presença de Deus", 358, 370, [12, 13]),
      S("Proteção, Consolação e Paz", 371, 375, [53, 308]), S("Conflito e Vitória", 376, 377, [356]),
      S("Gratidão e Ação de Graças", 378, 383, [22, 23, 406]), S("Felicidade e Regozijo", 384, 403, [1, 2, 174, 185, 188, 323]),
      S("Confiança", 404, 418, [9, 54, 342]), S("Segurança e Proteção", 419, 428), S("Fraternidade Cristã", 429, 433, [26]),
      S("Testemunho Cristão", 434, 438), S("Fidelidade e Serviço", 439, 452), S("Evangelização e Missões", 453, 462),
      S("Combate e Coroa", 463, 476, [342]), S("Bênção e Salvação", 477, 484, [10, 110, 234, 276, 329, 438]), S("Reconciliação", 485, 485, [303])] },
    { id: "oracao", nome: "Oração e súplica", de: 486, ate: 534, subtemas: [
      S("Reunião de Oração", 486, 491, [3, 108, 219]), S("Direção, Compaixão e Auxílio", 492, 509, [4, 15, 25, 170]),
      S("Santificação, Avivamento e Submissão", 510, 517, [216, 357]), S("Órfãos e Viúvas", 518, 518), S("Viajantes", 519, 519),
      S("Oração Matutina", 520, 522), S("Oração Vespertina", 523, 524), S("Oração Noturna", 525, 531), S("Por Israel", 532, 533), S("Refeições", 534, 534)] },
    { id: "igreja", nome: "Igreja", de: 535, ate: 559, subtemas: [
      S("Alicerce e Redenção", 535, 536), S("Batismo e Recepção de Membros", 537, 539), S("Ceia do Senhor", 540, 548, [159]),
      S("Consagração de Templo", 549, 549), S("Escolha e Consagração de Obreiros", 550, 551), S("Oração pela Igreja", 552, 552, [432]),
      S("Casamento", 553, 555), S("Apresentação de Criança", 556, 556, [608]), S("Ofício Fúnebre", 557, 559)] },
    { id: "vida-futura", nome: "Vida futura", de: 560, ate: 592, subtemas: [
      S("Insatisfação da Presente Vida", 560, 562, [132, 193]), S("Certeza e Alegria do Céu", 563, 577, [125]),
      S("O Lar Celeste", 578, 585, [148]), S("A Pátria do Cristão", 586, 592)] },
    { id: "criancas", nome: "Crianças", de: 593, ate: 615, subtemas: [
      S("Louvor das Crianças", 593, 594), S("Testemunho de Cristo", 595, 603), S("Nos Estudos", 604, 605),
      S("Na Presença de Deus", 606, 607), S("Convite à Salvação", 608, 613), S("Oração Infantil", 614, 615)] },
    { id: "especiais", nome: "Assuntos especiais", de: 616, ate: 650, subtemas: [
      S("Ano Novo", 616, 620), S("Aniversário", 621, 621), S("Dia das Mães", 622, 622), S("Lar Cristão", 623, 624),
      S("Bíblia", 625, 626, [257, 260]), S("Pátria", 627, 629, [460, 461]), S("Dia do Senhor", 630, 632, [19]),
      S("Estudante Cristão", 633, 635), S("Escola Paroquial", 636, 639), S("Dia da Reforma", 640, 640),
      S("Uniões Femininas", 641, 643), S("Uniões da Mocidade", 644, 649, [469]), S("Despedida", 650, 650)] },
  ];
  TEMAS_HINARIO.forEach((t) => t.subtemas.forEach((st, i) => { st.id = `${t.id}:${i + 1}`; st.tema = t; }));

  const numeroDoHino = (m) => (m && m.tipo === "hino" ? parseInt(String(m.numero || ""), 10) : NaN);

  /** Tema (seção do hinário) de um hino pelo número; null para louvores ou hinos sem número. */
  function temaDoHino(m) {
    const n = numeroDoHino(m);
    return TEMAS_HINARIO.find((t) => n >= t.de && n <= t.ate) || null;
  }

  /** Subtema do hino pelo número (ex.: Jesus Cristo › Nascimento). */
  function subtemaDoHino(m) {
    const t = temaDoHino(m);
    const n = numeroDoHino(m);
    return t ? t.subtemas.find((st) => n >= st.de && n <= st.ate) || null : null;
  }

  /** Assuntos em que o índice indica o hino também (os números entre parênteses). */
  function tambemServeEm(m) {
    const n = numeroDoHino(m);
    if (!n) return [];
    return TEMAS_HINARIO.flatMap((t) => t.subtemas.filter((st) => st.tambem.includes(n)));
  }

  /** O hino entra no assunto `id` (tema ou subtema), pela faixa de números ou por indicação do índice. */
  function hinoNoAssunto(m, id) {
    if (!id) return true;
    const n = numeroDoHino(m);
    if (!n) return false;
    if (!id.includes(":")) {
      const t = TEMAS_HINARIO.find((x) => x.id === id);
      return !!t && ((n >= t.de && n <= t.ate) || t.subtemas.some((st) => st.tambem.includes(n)));
    }
    const st = TEMAS_HINARIO.flatMap((t) => t.subtemas).find((x) => x.id === id);
    return !!st && ((n >= st.de && n <= st.ate) || st.tambem.includes(n));
  }

  /* ------------------------------------------------- montagem à mão */

  /** Renumera os campos fixados ("e:3", "m:1") depois de tirar a vaga `removida` do tipo `prefixo`. */
  function renumerarFixos(culto, prefixo, removida) {
    culto.travados = (culto.travados || []).flatMap((t) => {
      const [p, n] = t.split(":");
      const i = Number(n);
      if (p !== prefixo) return [t];
      if (i === removida) return [];
      return [`${p}:${i > removida ? i - 1 : i}`];
    });
  }

  /** Mais uma vaga de pessoa no culto (ex.: um vocal a mais). Devolve o índice da vaga. */
  function adicionarVaga(culto, funcao) {
    culto.equipe.push({ funcao, pessoaId: null });
    return culto.equipe.length - 1;
  }

  function removerVaga(culto, si) {
    culto.equipe.splice(si, 1);
    renumerarFixos(culto, "e", si);
  }

  /** Mais uma música no culto, no fim da lista. Devolve a posição. */
  function adicionarMusica(culto, tipo) {
    culto.musicas.push({ tipo, id: null });
    return culto.musicas.length - 1;
  }

  function removerMusica(culto, k) {
    culto.musicas.splice(k, 1);
    renumerarFixos(culto, "m", k);
  }

  /** Tira todas as pessoas e músicas da escala (para montar do zero), mantendo os cultos e as vagas. */
  function esvaziarEscala(escala) {
    for (const c of escala.cultos) {
      c.equipe.forEach((s) => { s.pessoaId = null; });
      c.musicas.forEach((m) => { m.id = null; });
      c.travados = [];
    }
    return sincronizarEscala(escala);
  }

  function validarEscala(state, escala) {
    const avisos = [];
    const intervalo = ((state.regras && state.regras.intervaloMusicaSemanas) || 0) * 7;
    escala.cultos.forEach((culto, ci) => {
      if (liderDe(escala, culto)) return; // tudo o que vale para o líder vale para ele
      const push = (nivel, campo, msg) => avisos.push({ ci, campo, nivel, msg });
      culto.equipe.forEach((s, si) => {
        const campo = `e:${si}`;
        const funcao = nomeFuncao(state, s.funcao);
        if (!s.pessoaId) return push("erro", campo, `${funcao}: ninguém escalado`);
        const p = porId(state.pessoas, s.pessoaId);
        if (!p) return push("erro", campo, `${funcao}: pessoa removida da equipe`);
        if (indisponivelEm(p.indisponivel, culto.data) || disponivelEm(state, p.id, culto.data) === "nao") push("erro", campo, `${p.nome} não pode nesta data`);
        if (nivelFuncao(p, s.funcao) === "apoio") push("alerta", campo, `${p.nome} só apoia em ${funcao.toLowerCase()}`);
        if (!(state.regras && state.regras.permitirAcumular) && culto.equipe.some((o, i) => i < si && o.pessoaId === s.pessoaId)) {
          push("alerta", campo, `${p.nome} está em duas funções`);
        }
      });
      culto.musicas.forEach((vaga, k) => {
        const campo = `m:${k}`;
        if (!vaga.id) return push("erro", campo, `${nomeTipo(vaga.tipo)}: falta escolher a música`);
        const m = porId(state.musicas, vaga.id);
        if (!m) return push("erro", campo, "Música removida do repertório");
        const faltam = tagsExigidas(state, m.tipo, culto.solene).filter((t) => !(m.tags || []).includes(t));
        if (faltam.length) push("erro", campo, `${rotuloMusica(m)} não está marcada como ${faltam.map((t) => nomeTag(state, t)).join(" e ")}`);
        const antes = escala.cultos.find((outro, cj) => cj < ci && !liderDe(escala, outro) && Math.abs(diasEntre(outro.data, culto.data)) < intervalo && outro.musicas.some((x) => x.id === vaga.id));
        if (antes) push("alerta", campo, `${rotuloMusica(m)} repete a de ${formatarData(antes.data, "dia")}`);
      });
    });
    return avisos;
  }

  /* ----------------------------------------------------------- resumos */

  function resumoPessoas(state, escala) {
    const linhas = new Map();
    for (const p of state.pessoas || []) if (p.ativo !== false) linhas.set(p.id, { pessoa: p, total: 0, funcoes: {} });
    for (const c of escala.cultos) {
      if (liderDe(escala, c)) continue;
      for (const s of c.equipe) {
        const l = linhas.get(s.pessoaId);
        if (!l) continue;
        l.total++;
        l.funcoes[s.funcao] = (l.funcoes[s.funcao] || 0) + 1;
      }
    }
    return [...linhas.values()].sort((a, b) => b.total - a.total || a.pessoa.nome.localeCompare(b.pessoa.nome));
  }

  /** A equipe agrupada por função: [{ funcao, vagas: [{ si, pessoaId }] }]. */
  function equipePorFuncao(culto) {
    const grupos = [];
    culto.equipe.forEach((s, si) => {
      let g = grupos.find((x) => x.funcao === s.funcao);
      if (!g) grupos.push((g = { funcao: s.funcao, vagas: [] }));
      g.vagas.push({ si, pessoaId: s.pessoaId });
    });
    return grupos;
  }

  /** Texto pronto para colar no WhatsApp (negrito com *, itálico com _). */
  function textoWhatsApp(state, escala, opcoes) {
    opcoes = opcoes || {};
    const musica = (vaga, i) => {
      const m = porId(state.musicas, vaga.id);
      return `${i + 1}. ${m ? rotuloMusica(m) : "a definir"}${opcoes.links && m && m.link ? ` ${m.link}` : ""}`;
    };
    const igreja = (state.igreja && state.igreja.nome) || "";
    const linhas = [`*${escala.titulo}*${igreja ? ` · ${igreja}` : ""}`, `_${formatarPeriodo(escala.inicio, escala.fim)}_`];
    for (const c of escala.cultos) {
      if (liderDe(escala, c)) continue; // sai junto com o culto líder
      const seguidores = escala.cultos.filter((x) => liderDe(escala, x) === c);
      const todos = [c, ...seguidores];
      linhas.push("", `*${formatarData(c.data, "dia")}*`, `_${todos.map((x) => (x.hora ? `${x.nome} · ${x.hora}` : x.nome)).join("  |  ")}_`);
      for (const g of equipePorFuncao(c)) {
        const nomes = g.vagas.map((v) => (porId(state.pessoas, v.pessoaId) || {}).nome || "a definir");
        linhas.push(`${nomeFuncao(state, g.funcao)}: ${nomes.join(", ")}`);
      }
      if (c.musicas.length) {
        linhas.push("Músicas:");
        c.musicas.forEach((v, i) => linhas.push(musica(v, i)));
      }
      for (const s of seguidores) {
        if (s.musicas.map((m) => m.id).join() === c.musicas.map((m) => m.id).join()) continue;
        linhas.push(`Ordem às ${s.hora || s.nome}:`);
        s.musicas.forEach((v, i) => linhas.push(musica(v, i)));
      }
      for (const x of todos) if (x.obs) linhas.push(`Obs.${todos.length > 1 ? ` (${x.hora})` : ""}: ${x.obs}`);
    }
    return linhas.join("\n");
  }

  /* ------------------------------------------------------- importação */

  /** Converte nomes de etiquetas digitados ("Trinitário, cruz") em ids existentes. */
  function lerTags(state, texto) {
    const ids = [];
    for (const parte of String(texto || "").split(/[,/|]+/)) {
      const n = normalizar(parte).replace(/\s+/g, "-");
      if (!n) continue;
      const t = (state.tags || []).find((x) => x.id === n || normalizar(x.nome).replace(/\s+/g, "-") === n || normalizar(x.nome).startsWith(n));
      if (t && !ids.includes(t.id)) ids.push(t.id);
    }
    return ids;
  }

  function lerTipo(texto) {
    const n = normalizar(texto).replace(/\.$/, "");
    if (["sl", "salmo", "salmos", "h", "hino", "hinos", "sh", "salmos e hinos"].includes(n)) return "hino";
    if (["l", "louvor", "louvores", "c", "cantico", "canticos"].includes(n)) return "louvor";
    return null;
  }

  /**
   * Lê uma lista colada (do Word, Excel ou WhatsApp). Cada linha pode ser:
   *   "245"  ·  "12 - Santo! Santo! Santo!"  ·  "Hino; 30; Castelo Forte; trinitário"
   *   "Louvor<TAB>Porque Ele vive<TAB>cristocêntrico"  ·  "Isaías 53 - https://youtu.be/…"
   */
  function lerListaMusicas(state, texto, padrao) {
    padrao = padrao || {};
    const saida = [];
    for (const bruta of String(texto || "").split(/\r?\n/)) {
      const linha = bruta.trim();
      if (!linha) continue;
      let partes = linha.split(/\t|;/).map((p) => p.trim());
      let tipo = padrao.tipo || "hino";
      let numero = "";
      let tags = [];
      let autor = "";
      let link = "";
      if (partes.length > 1 && lerTipo(partes[0])) {
        tipo = lerTipo(partes[0]);
        partes = partes.slice(1);
      }
      if (partes.length > 1 && /^\d+[a-z]?$/i.test(partes[0])) numero = partes.shift();
      let titulo = partes.shift() || "";
      const url = titulo.match(/\s*[-–—]?\s*(https?:\/\/\S+)\s*$/i);
      if (url) {
        link = url[1];
        titulo = titulo.slice(0, url.index).trim();
      }
      if (!numero && /^\d+[a-z]?$/i.test(titulo)) {
        numero = titulo; // "245": hino só com o número
        titulo = "";
      }
      if (!numero) {
        const m = titulo.match(/^(?:(?:SH|Hino|Salmo|Sl|nº|n\.?)\s*)?(\d+[a-z]?)\s*[-–—.:)]\s*(.+)$/i);
        if (m) {
          numero = m[1];
          titulo = m[2];
        }
      }
      for (const p of partes) {
        if (/^https?:\/\//i.test(p)) { link = link || p; continue; }
        const lidas = lerTags(state, p);
        if (lidas.length) tags = tags.concat(lidas.filter((t) => !tags.includes(t)));
        else if (!autor) autor = p;
      }
      (padrao.tags || []).forEach((t) => { if (!tags.includes(t)) tags.push(t); });
      titulo = titulo.replace(/\s*[-–—]\s*$/, "");
      if (!titulo && !numero) continue;
      saida.push({ id: novoId("m"), tipo, numero, titulo, autor, link, tags, tom: "", ativo: true, obs: "", ultimaVez: "" });
    }
    return saida;
  }

  /* ---------------------------------------------------------- migração */

  /**
   * Leva dados salvos por versões anteriores para o formato atual (sem
   * liturgia nem oficiais: cada culto tem só equipe e músicas) e completa
   * campos novos.
   */
  function migrar(state, base, repertorioBase) {
    state = state || {};
    const s = Object.assign({}, base, state);
    for (const k of ["funcoes", "tags", "pessoas", "musicas", "cultos", "escalas", "respostas"]) {
      if (!Array.isArray(s[k])) s[k] = (base && base[k]) || [];
    }
    s.regras = Object.assign({}, base && base.regras, state.regras);
    s.igreja = Object.assign({}, base && base.igreja, state.igreja);
    s.musicas = s.musicas.map((m) => Object.assign({ tags: [], ativo: true, link: "", ultimaVez: "", obs: "", autor: "", tom: "", numero: "" }, m, { tipo: m.tipo === "louvor" ? "louvor" : "hino" }));
    s.pessoas = s.pessoas.map((p) => Object.assign({ funcoes: [], apoio: [], cultos: [], indisponivel: [], ativo: true, obs: "" }, p));
    const liturgias = state.liturgias || [];
    const soLouvor = (tipos) => (tipos || []).length > 0 && (tipos || []).every((t) => t === "louvor");
    s.cultos = s.cultos.map((c) => {
      if (c.musicas) return c;
      // Quantas músicas de cada tipo a liturgia antiga pedia.
      const lit = porId(liturgias, c.liturgiaId);
      let musicas = (porId(base && base.cultos, c.id) || {}).musicas || { hino: 1, louvor: 2 };
      if (lit) {
        musicas = { hino: 0, louvor: 0 };
        for (const it of lit.itens || []) if (it.tipo === "musica") musicas[soLouvor(it.tipos) ? "louvor" : "hino"] += Number(it.qtd) || 1;
      }
      const novo = Object.assign({}, c, { musicas: Object.assign({}, musicas) });
      delete novo.liturgiaId;
      return novo;
    });
    const tipoMusica = (id) => ((porId(s.musicas, id) || {}).tipo === "louvor" ? "louvor" : "hino");
    s.escalas = s.escalas.map((e) => Object.assign({}, e, {
      cultos: (e.cultos || []).map((c) => {
        if (Array.isArray(c.musicas)) return c;
        const musicas = (c.liturgia || []).filter((it) => it.tipo === "musica").flatMap((it) =>
          (it.musicas || []).map((id) => ({ tipo: id ? tipoMusica(id) : (soLouvor(it.tipos) ? "louvor" : "hino"), id: id || null })));
        const novo = Object.assign({}, c, { musicas, travados: (c.travados || []).filter((t) => t.startsWith("e:")) });
        delete novo.liturgia;
        delete novo.liturgiaId;
        return novo;
      }),
    }));
    for (const e of s.escalas) {
      if (e.cultos.some((c) => c.acompanha === undefined)) vincularCultos(s, e);
      sincronizarEscala(e);
    }
    // Versão 3: completa os Salmos e Hinos da seção Trindade (números e títulos).
    // Versão 4: acrescenta os hinos da coletânea da igreja e preenche número e título que faltavam.
    if ((Number(state.versao) || 0) < 4 && repertorioBase) {
      for (const m of repertorioBase) {
        if (m.tipo !== "hino") continue;
        const atual = porId(s.musicas, m.id) || (m.numero ? s.musicas.find((x) => x.tipo === "hino" && String(x.numero) === String(m.numero)) : null);
        if (!atual) {
          s.musicas.push(Object.assign({}, m));
          continue;
        }
        if (!atual.titulo && m.titulo) atual.titulo = m.titulo;
        if (!String(atual.numero || "").trim() && m.numero) atual.numero = m.numero;
        if (/a confirmar/i.test(atual.obs || "")) atual.obs = m.obs;
      }
    }
    delete s.liturgias;
    delete s.oficiais;
    delete s.exemplo;
    s.versao = 4;
    return s;
  }

  return {
    DIAS, DIAS_CURTOS, MESES, TIPOS_MUSICA,
    parseData, isoData, somarDias, diasEntre, diaSemana, semanaDoMes, fimDoMes,
    formatarData, formatarPeriodo, indisponivelEm,
    criarAleatorio, novoId, porId, normalizar, rotuloMusica, nomeFuncao, nomeTag, nomeTipo,
    nivelFuncao, tagsExigidas, aptaSolene, listarOcorrencias, montarUsos,
    liderDe, vincularCultos, sincronizarCulto, sincronizarEscala,
    candidatosPessoa, candidatosMusica,
    gerarEscala, preencherCulto, adicionarCultoExtra, sortearCampo, sortearCulto, colocarMusica, moverMusica,
    adicionarVaga, removerVaga, adicionarMusica, removerMusica, esvaziarEscala, TEMAS_HINARIO, temaDoHino, subtemaDoHino, tambemServeEm, hinoNoAssunto,
    validarEscala, resumoPessoas, equipePorFuncao, textoWhatsApp,
    lerListaMusicas, lerTags, migrar,
    respostaDe, disponivelEm, estadoNoDia, diasDeCulto, idResposta, codigoResposta, textoResposta, lerRespostas,
  };
});
