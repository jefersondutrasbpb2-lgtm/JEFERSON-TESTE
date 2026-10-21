/*
 * Motor da Escala do Louvor.
 *
 * Funções puras: recebem o estado (equipe, oficiais, repertório, liturgias,
 * cultos e regras) e devolvem escalas, candidatos, avisos e textos. Não mexem
 * no DOM nem no armazenamento, para poderem ser testadas com `node --test`.
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
    { id: "salmo", nome: "Salmo" },
    { id: "hino", nome: "Hino" },
    { id: "louvor", nome: "Louvor" },
  ];
  const HINARIO = new Set(["salmo", "hino"]);
  const SEM_USO = 1e6; // "nunca usada": fica à frente de qualquer música já cantada

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

  function diasEntre(a, b) {
    return Math.round((parseData(b) - parseData(a)) / 86400000);
  }

  function diaSemana(iso) {
    return parseData(iso).getDay();
  }

  /** 1 = primeira ocorrência daquele dia da semana no mês, 2 = segunda… */
  function semanaDoMes(iso) {
    return Math.floor((parseData(iso).getDate() - 1) / 7) + 1;
  }

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
    const b = parseData(fim);
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear() && a.getDate() === 1 && isoData(b) === fimDoMes(inicio.slice(0, 7))) {
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

  /* ----------------------------------------------------------- consultas */

  const porId = (lista, id) => (lista || []).find((x) => x.id === id);

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

  function nomeOficial(o) {
    if (!o) return "";
    const abrev = { Pastor: "Pr.", Presbítero: "Pb.", Diácono: "Diác.", Evangelista: "Ev.", Missionário: "Miss." };
    return abrev[o.cargo] ? `${abrev[o.cargo]} ${o.nome}` : o.nome;
  }

  /** Etiquetas que uma música precisa ter para ocupar um item da liturgia. */
  function tagsExigidas(state, item, solene, tipoMusica) {
    const regras = state.regras || {};
    const tags = new Set(item.tags || []);
    if (solene) {
      const extra = tipoMusica === "louvor" ? regras.soleneTagsLouvor : regras.soleneTagsHinario;
      (extra || []).forEach((t) => tags.add(t));
    }
    return [...tags];
  }

  function atendeItem(state, musica, item, solene) {
    if (!musica) return { ok: false, faltam: [] };
    const tipos = item.tipos && item.tipos.length ? item.tipos : ["salmo", "hino", "louvor"];
    if (!tipos.includes(musica.tipo)) return { ok: false, tipoErrado: true, faltam: [] };
    const faltam = tagsExigidas(state, item, solene, musica.tipo).filter((t) => !(musica.tags || []).includes(t));
    return { ok: faltam.length === 0, faltam };
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

  /* ---------------------------------------------------------- histórico */

  /**
   * Quem serviu e o que foi cantado, por data. Considera as outras escalas
   * salvas e os demais cultos da escala em edição; `ignorar` deixa de fora o
   * próprio campo que está sendo sorteado.
   */
  function montarUsos(state, escala, ignorar) {
    const usos = { pessoas: {}, oficiais: {}, musicas: {} };
    const add = (mapa, id, data, ref) => {
      if (!id) return;
      (mapa[id] = mapa[id] || []).push({ data, ref });
    };
    const ignora = (ref) => ignorar && ref === ignorar;
    // "Última vez cantada" informada no repertório (antes de existir a escala na ferramenta).
    for (const m of state.musicas || []) if (m.ultimaVez) add(usos.musicas, m.id, m.ultimaVez, { atual: false });
    const escalas = (state.escalas || []).filter((e) => !escala || e.id !== escala.id);
    if (escala) escalas.push(escala);
    for (const e of escalas) {
      const atual = escala && e.id === escala.id;
      (e.cultos || []).forEach((c, ci) => {
        (c.equipe || []).forEach((s, si) => {
          const ref = atual ? `${ci}:e:${si}` : null;
          if (!ignora(ref)) add(usos.pessoas, s.pessoaId, c.data, { atual, ci });
        });
        (c.liturgia || []).forEach((it, ii) => {
          (it.musicas || []).forEach((id, k) => {
            const ref = atual ? `${ci}:m:${ii}:${k}` : null;
            if (!ignora(ref)) add(usos.musicas, id, c.data, { atual, ci });
          });
          (it.oficiais || []).forEach((id, k) => {
            const ref = atual ? `${ci}:o:${ii}:${k}` : null;
            if (!ignora(ref)) add(usos.oficiais, id, c.data, { atual, ci });
          });
        });
      });
    }
    return usos;
  }

  function cultoAnterior(escala, ci) {
    return ci > 0 ? escala.cultos[ci - 1] : null;
  }

  function serveNoCulto(culto, pessoaId) {
    return (culto.equipe || []).some((s) => s.pessoaId === pessoaId);
  }

  function oficialNoCulto(culto, oficialId) {
    return (culto.liturgia || []).some((it) => (it.oficiais || []).includes(oficialId));
  }

  /* ---------------------------------------------------------- candidatos */

  const APOIO = 1000; // quem só apoia numa função entra apenas quando nenhum titular pode

  /** "principal", "apoio" ou null: como a pessoa faz esta função. */
  function nivelFuncao(pessoa, funcao) {
    if ((pessoa.funcoes || []).includes(funcao)) return "principal";
    if ((pessoa.apoio || []).includes(funcao)) return "apoio";
    return null;
  }

  /** O oficial que é esta pessoa do louvor (ex.: um presbítero que toca bateria). */
  const oficialDaPessoa = (state, pessoaId) => (state.oficiais || []).find((o) => o.pessoaId && o.pessoaId === pessoaId);

  function pontuarPessoa(state, escala, ci, pessoa, usos) {
    const culto = escala.cultos[ci];
    const lista = usos.pessoas[pessoa.id] || [];
    const naEscala = lista.filter((u) => u.ref.atual).length;
    const recentes = lista.filter((u) => !u.ref.atual && Math.abs(diasEntre(u.data, culto.data)) <= 90).length;
    const anterior = cultoAnterior(escala, ci);
    const mesmoDia = escala.cultos.some((c, i) => i !== ci && c.data === culto.data && serveNoCulto(c, pessoa.id));
    let score = naEscala * 10 + recentes * 1.5;
    if (anterior && serveNoCulto(anterior, pessoa.id)) score += 6;
    if (mesmoDia) score += 8;
    return score;
  }

  /**
   * Pessoas que podem ocupar uma função num culto, das mais indicadas às
   * menos indicadas. `bloqueio` explica por que alguém não deveria ser escalado.
   */
  function candidatosPessoa(state, escala, ci, si) {
    const culto = escala.cultos[ci];
    const slot = culto.equipe[si];
    const usos = montarUsos(state, escala, `${ci}:e:${si}`);
    const acumula = state.regras && state.regras.permitirAcumular;
    return (state.pessoas || [])
      .filter((p) => p.ativo !== false && nivelFuncao(p, slot.funcao))
      .map((p) => {
        const apoio = nivelFuncao(p, slot.funcao) === "apoio";
        const oficial = oficialDaPessoa(state, p.id);
        let bloqueio = "";
        if (indisponivelEm(p.indisponivel, culto.data)) bloqueio = "indisponível nesta data";
        else if (p.cultos && p.cultos.length && culto.cultoId && !p.cultos.includes(culto.cultoId)) bloqueio = "não serve neste culto";
        else if (!acumula && culto.equipe.some((s, i) => i !== si && s.pessoaId === p.id)) bloqueio = "já está em outra função neste culto";
        else if (oficial && oficialNoCulto(culto, oficial.id)) bloqueio = "tem parte na liturgia como oficial";
        const vezes = (usos.pessoas[p.id] || []).filter((u) => u.ref.atual).length;
        return { pessoa: p, apoio, bloqueio, vezes, score: pontuarPessoa(state, escala, ci, p, usos) + (apoio ? APOIO : 0) };
      })
      .sort((a, b) => (a.bloqueio ? 1 : 0) - (b.bloqueio ? 1 : 0) || a.score - b.score || a.pessoa.nome.localeCompare(b.pessoa.nome));
  }

  function candidatosOficial(state, escala, ci, ii, k) {
    const culto = escala.cultos[ci];
    const item = culto.liturgia[ii];
    const modelo = itemModelo(state, culto, item) || item;
    const cargos = modelo.cargos || [];
    const usos = montarUsos(state, escala, `${ci}:o:${ii}:${k}`);
    const anterior = cultoAnterior(escala, ci);
    return (state.oficiais || [])
      .filter((o) => o.ativo !== false && (!cargos.length || cargos.includes(o.cargo)))
      .map((o) => {
        let bloqueio = "";
        if (indisponivelEm(o.indisponivel, culto.data)) bloqueio = "indisponível nesta data";
        else if (o.pessoaId && serveNoCulto(culto, o.pessoaId)) bloqueio = "está na equipe do louvor neste culto";
        const lista = usos.oficiais[o.id] || [];
        const vezes = lista.filter((u) => u.ref.atual).length;
        const recentes = lista.filter((u) => !u.ref.atual && Math.abs(diasEntre(u.data, culto.data)) <= 90).length;
        const noCulto = culto.liturgia.some((it, i) => (it.oficiais || []).some((id, kk) => id === o.id && !(i === ii && kk === k)));
        let score = vezes * 10 + recentes * 1.5 + (noCulto ? 12 : 0);
        if (anterior && oficialNoCulto(anterior, o.id)) score += 4;
        return { oficial: o, bloqueio, vezes, noCulto, score };
      })
      .sort((a, b) => (a.bloqueio ? 1 : 0) - (b.bloqueio ? 1 : 0) || a.score - b.score || a.oficial.nome.localeCompare(b.oficial.nome));
  }

  /**
   * Músicas para um item da liturgia. `atende` diz se a música cumpre o tipo e
   * as etiquetas exigidas (incluindo a regra do culto solene); `diasDesde`
   * mostra há quanto tempo foi cantada pela última vez.
   */
  function candidatosMusica(state, escala, ci, ii, k) {
    const culto = escala.cultos[ci];
    const item = culto.liturgia[ii];
    const modelo = itemModelo(state, culto, item) || item;
    const usos = montarUsos(state, escala, `${ci}:m:${ii}:${k}`);
    const intervalo = ((state.regras && state.regras.intervaloMusicaSemanas) || 0) * 7;
    const noCulto = new Set();
    culto.liturgia.forEach((it, i) => (it.musicas || []).forEach((id, kk) => { if (!(i === ii && kk === k)) noCulto.add(id); }));
    return (state.musicas || [])
      .filter((m) => m.ativo !== false)
      .map((m) => {
        const crit = atendeItem(state, m, modelo, culto.solene);
        const datas = (usos.musicas[m.id] || []).map((u) => u.data);
        let maisPerto = SEM_USO;
        let dataPerto = null;
        for (const d of datas) {
          const dist = Math.abs(diasEntre(d, culto.data));
          if (dist < maisPerto) { maisPerto = dist; dataPerto = d; }
        }
        const passadas = datas.filter((d) => d <= culto.data).sort();
        const ultima = passadas.length ? passadas[passadas.length - 1] : null;
        let bloqueio = "";
        if (noCulto.has(m.id)) bloqueio = "já está neste culto";
        else if (maisPerto < intervalo) {
          if (maisPerto === 0) bloqueio = "cantada no mesmo dia";
          else if (dataPerto < culto.data) bloqueio = `cantada há ${maisPerto} dias`;
          else bloqueio = `já programada para ${formatarData(dataPerto, "curta")}`;
        }
        return { musica: m, atende: crit.ok, tipoErrado: !!crit.tipoErrado, faltam: crit.faltam, ultima, distancia: maisPerto, bloqueio };
      })
      .filter((c) => !c.tipoErrado)
      .sort((a, b) =>
        (b.atende ? 1 : 0) - (a.atende ? 1 : 0) ||
        (a.bloqueio ? 1 : 0) - (b.bloqueio ? 1 : 0) ||
        b.distancia - a.distancia ||
        rotuloMusica(a.musica).localeCompare(rotuloMusica(b.musica), "pt-BR", { numeric: true })
      );
  }

  function itemModelo(state, culto, item) {
    const lit = porId(state.liturgias, culto.liturgiaId);
    return lit ? porId(lit.itens, item.itemId) : null;
  }

  /* ------------------------------------------------------------- geração */

  /** Escolhe o melhor candidato livre, sorteando entre os empatados. */
  function escolher(candidatos, chave, rand, folga) {
    const livres = candidatos.filter((c) => !c.bloqueio && c.atende !== false);
    if (!livres.length) return null;
    const melhor = chave(livres[0]);
    const empatados = livres.filter((c) => Math.abs(chave(c) - melhor) <= folga);
    return empatados[Math.floor(rand() * empatados.length)];
  }

  function esqueletoCulto(state, data, cultoCfg, extra) {
    const liturgia = porId(state.liturgias, (extra && extra.liturgiaId) || cultoCfg.liturgiaId);
    const solene = extra && extra.solene !== undefined ? extra.solene : !!(cultoCfg.solene || (liturgia && liturgia.solene));
    const equipe = [];
    for (const req of cultoCfg.equipe || []) {
      for (let i = 0; i < (Number(req.qtd) || 0); i++) equipe.push({ funcao: req.funcao, pessoaId: null });
    }
    const itens = ((liturgia && liturgia.itens) || []).map((it) => ({
      itemId: it.id,
      titulo: it.titulo,
      tipo: it.tipo,
      musicas: it.tipo === "musica" ? Array(Number(it.qtd) || 1).fill(null) : [],
      oficiais: it.tipo === "oficial" ? Array(Number(it.qtd) || 1).fill(null) : [],
      texto: it.texto || "",
      nota: it.notaPadrao || "",
    }));
    return {
      id: novoId("c"),
      data,
      cultoId: cultoCfg.id,
      nome: (extra && extra.nome) || cultoCfg.nome,
      hora: (extra && extra.hora) || cultoCfg.hora || "",
      liturgiaId: liturgia ? liturgia.id : null,
      solene,
      equipe,
      liturgia: itens,
      travados: [],
      obs: "",
    };
  }

  /** Preenche os campos vazios (e não travados) de um culto já montado. */
  function preencherCulto(state, escala, ci, rand) {
    const culto = escala.cultos[ci];
    const travado = new Set(culto.travados || []);
    const pessoasPorFuncao = (f) => (state.pessoas || []).filter((p) => p.ativo !== false && nivelFuncao(p, f) === "principal").length;
    // Funções com menos gente são preenchidas primeiro, para não "gastar" quem é insubstituível.
    const ordem = culto.equipe.map((s, si) => si).sort((a, b) => pessoasPorFuncao(culto.equipe[a].funcao) - pessoasPorFuncao(culto.equipe[b].funcao));
    for (const si of ordem) {
      const slot = culto.equipe[si];
      if (slot.pessoaId || travado.has(`e:${si}`)) continue;
      const c = escolher(candidatosPessoa(state, escala, ci, si), (x) => x.score, rand, 0.5);
      slot.pessoaId = c ? c.pessoa.id : null;
    }
    culto.liturgia.forEach((item, ii) => {
      item.musicas.forEach((id, k) => {
        if (id || travado.has(`m:${ii}:${k}`)) return;
        const lista = candidatosMusica(state, escala, ci, ii, k);
        // Músicas nunca cantadas empatam entre si; as já cantadas têm ~1 semana de folga.
        let c = escolher(lista, (x) => Math.min(x.distancia, SEM_USO), rand, 7);
        // Repertório curto: antes de deixar vazio, aceita repetir a cantada há mais tempo.
        if (!c) {
          const relaxada = lista.filter((x) => x.bloqueio && x.bloqueio !== "já está neste culto").map((x) => Object.assign({}, x, { bloqueio: "" }));
          c = escolher(relaxada, (x) => x.distancia, rand, 0);
        }
        item.musicas[k] = c ? c.musica.id : null;
      });
      item.oficiais.forEach((id, k) => {
        if (id || travado.has(`o:${ii}:${k}`)) return;
        const c = escolher(candidatosOficial(state, escala, ci, ii, k), (x) => x.score, rand, 0.5);
        item.oficiais[k] = c ? c.oficial.id : null;
      });
    });
    return culto;
  }

  /**
   * Gera uma escala para o período. Se `anterior` for informada, os campos
   * travados dela são mantidos (mesma data e mesmo culto).
   */
  function gerarEscala(state, opcoes, anterior) {
    const seed = opcoes.seed !== undefined ? opcoes.seed : Math.floor(Math.random() * 2 ** 31);
    const rand = criarAleatorio(seed);
    const escala = {
      id: (anterior && anterior.id) || novoId("esc"),
      titulo: opcoes.titulo || (anterior && anterior.titulo) || "Escala do louvor",
      inicio: opcoes.inicio,
      fim: opcoes.fim,
      tipo: opcoes.tipo || "personalizado",
      status: (anterior && anterior.status) || "rascunho",
      criadaEm: (anterior && anterior.criadaEm) || new Date().toISOString(),
      seed,
      cultos: [],
    };
    const ocorrencias = listarOcorrencias(state.cultos, opcoes.inicio, opcoes.fim);
    const avulsos = anterior ? anterior.cultos.filter((c) => c.avulso && c.data >= opcoes.inicio && c.data <= opcoes.fim) : [];
    for (const oc of ocorrencias) {
      const cfg = porId(state.cultos, oc.cultoId);
      const velho = anterior && anterior.cultos.find((c) => c.data === oc.data && c.cultoId === oc.cultoId && !c.avulso);
      escala.cultos.push(velho ? manterTravados(state, velho, cfg) : esqueletoCulto(state, oc.data, cfg));
    }
    for (const a of avulsos) escala.cultos.push(manterTravados(state, a, porId(state.cultos, a.cultoId) || { equipe: [] }, true));
    ordenarCultos(escala);
    // Os cultos solenes escolhem primeiro: o repertório apto a eles costuma ser o mais curto.
    const ordem = escala.cultos.map((_, ci) => ci).sort((a, b) => (escala.cultos[b].solene ? 1 : 0) - (escala.cultos[a].solene ? 1 : 0) || a - b);
    ordem.forEach((ci) => preencherCulto(state, escala, ci, rand));
    return escala;
  }

  function manterTravados(state, velho, cfg, avulso) {
    // Cultos semanais seguem a configuração atual (liturgia, equipe); avulsos mantêm a sua.
    const novo = avulso ? JSON.parse(JSON.stringify(velho)) : esqueletoCulto(state, velho.data, cfg);
    const travados = new Set(velho.travados || []);
    novo.id = velho.id;
    novo.obs = velho.obs || "";
    novo.travados = [...travados];
    novo.equipe.forEach((s, si) => {
      const v = velho.equipe[si];
      s.pessoaId = travados.has(`e:${si}`) && v && v.funcao === s.funcao ? v.pessoaId : null;
    });
    novo.liturgia.forEach((it, ii) => {
      const v = velho.liturgia[ii];
      if (v && v.itemId === it.itemId) it.nota = v.nota || it.nota;
      it.musicas = it.musicas.map((id, k) => (travados.has(`m:${ii}:${k}`) && v && v.itemId === it.itemId ? v.musicas[k] : null));
      it.oficiais = it.oficiais.map((id, k) => (travados.has(`o:${ii}:${k}`) && v && v.itemId === it.itemId ? v.oficiais[k] : null));
    });
    return novo;
  }

  function ordenarCultos(escala) {
    escala.cultos.sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || "")));
  }

  /** Acrescenta um culto avulso (Santa Ceia, Natal, aniversário da igreja…). */
  function adicionarCultoAvulso(state, escala, opcoes, rand) {
    const cfg = porId(state.cultos, opcoes.cultoId) || { id: null, nome: opcoes.nome, equipe: [] };
    const culto = esqueletoCulto(state, opcoes.data, cfg, opcoes);
    culto.avulso = true;
    escala.cultos.push(culto);
    ordenarCultos(escala);
    const ci = escala.cultos.indexOf(culto);
    preencherCulto(state, escala, ci, rand || Math.random);
    return ci;
  }

  /** Sorteia de novo um único campo: "e:si", "m:ii:k" ou "o:ii:k". */
  function sortearCampo(state, escala, ci, campo, rand) {
    rand = rand || Math.random;
    const culto = escala.cultos[ci];
    const [tipo, a, b] = campo.split(":").map((x, i) => (i ? Number(x) : x));
    if (tipo === "e") {
      const atual = culto.equipe[a].pessoaId;
      const lista = candidatosPessoa(state, escala, ci, a).filter((c) => c.pessoa.id !== atual);
      const c = escolher(lista, (x) => x.score, rand, 3);
      culto.equipe[a].pessoaId = c ? c.pessoa.id : atual;
    } else if (tipo === "m") {
      const atual = culto.liturgia[a].musicas[b];
      const lista = candidatosMusica(state, escala, ci, a, b).filter((c) => c.musica.id !== atual);
      const c = escolher(lista, (x) => Math.min(x.distancia, SEM_USO), rand, 21);
      culto.liturgia[a].musicas[b] = c ? c.musica.id : atual;
    } else if (tipo === "o") {
      const atual = culto.liturgia[a].oficiais[b];
      const lista = candidatosOficial(state, escala, ci, a, b).filter((c) => c.oficial.id !== atual);
      const c = escolher(lista, (x) => x.score, rand, 3);
      culto.liturgia[a].oficiais[b] = c ? c.oficial.id : atual;
    }
    return escala;
  }

  /* ------------------------------------------------------------ avisos */

  function validarEscala(state, escala) {
    const avisos = [];
    const intervalo = ((state.regras && state.regras.intervaloMusicaSemanas) || 0) * 7;
    const nomeMusica = (id) => rotuloMusica(porId(state.musicas, id)) || "música removida";
    escala.cultos.forEach((culto, ci) => {
      const push = (nivel, campo, msg) => avisos.push({ ci, campo, nivel, msg });
      culto.equipe.forEach((s, si) => {
        const campo = `e:${si}`;
        if (!s.pessoaId) return push("erro", campo, `${nomeFuncao(state, s.funcao)} sem ninguém escalado`);
        const p = porId(state.pessoas, s.pessoaId);
        if (!p) return push("erro", campo, `${nomeFuncao(state, s.funcao)}: pessoa removida do cadastro`);
        if (nivelFuncao(p, s.funcao) === "apoio") push("alerta", campo, `${p.nome} só apoia em ${nomeFuncao(state, s.funcao).toLowerCase()}`);
        if (indisponivelEm(p.indisponivel, culto.data)) push("erro", campo, `${p.nome} marcou indisponibilidade nesta data`);
        if (!(state.regras && state.regras.permitirAcumular) && culto.equipe.some((o, i) => i < si && o.pessoaId === s.pessoaId)) {
          push("alerta", campo, `${p.nome} aparece em mais de uma função`);
        }
      });
      culto.liturgia.forEach((item, ii) => {
        const modelo = itemModelo(state, culto, item) || item;
        item.musicas.forEach((id, k) => {
          const campo = `m:${ii}:${k}`;
          if (!id) return push("erro", campo, `${item.titulo}: falta escolher a música`);
          const m = porId(state.musicas, id);
          if (!m) return push("erro", campo, `${item.titulo}: música removida do repertório`);
          const crit = atendeItem(state, m, modelo, culto.solene);
          if (crit.tipoErrado) push("alerta", campo, `${rotuloMusica(m)} não é do tipo pedido em "${item.titulo}"`);
          else if (!crit.ok) {
            const nomes = crit.faltam.map((t) => nomeTag(state, t)).join(", ");
            push(culto.solene ? "erro" : "alerta", campo, `${rotuloMusica(m)} não está marcada como ${nomes}${culto.solene ? " (exigido no culto solene)" : ""}`);
          }
          escala.cultos.forEach((outro, cj) => {
            if (cj >= ci) return;
            const repetida = outro.liturgia.some((it) => it.musicas.includes(id));
            const dist = Math.abs(diasEntre(outro.data, culto.data));
            if (repetida && dist < intervalo) push("alerta", campo, `${nomeMusica(id)} repete a de ${formatarData(outro.data, "dia")}`);
          });
        });
        item.oficiais.forEach((id, k) => {
          const campo = `o:${ii}:${k}`;
          if (!id) return push("erro", campo, `${item.titulo}: falta definir o oficial`);
          const o = porId(state.oficiais, id);
          if (!o) return push("erro", campo, `${item.titulo}: oficial removido do cadastro`);
          if (indisponivelEm(o.indisponivel, culto.data)) push("erro", campo, `${nomeOficial(o)} marcou indisponibilidade nesta data`);
          if (o.pessoaId && serveNoCulto(culto, o.pessoaId)) push("alerta", campo, `${nomeOficial(o)} também está na equipe do louvor neste culto`);
        });
      });
    });
    return avisos;
  }

  function nomeTag(state, id) {
    const t = porId(state.tags, id);
    return t ? t.nome.toLowerCase() : id;
  }

  /* ----------------------------------------------------------- resumos */

  function resumoPessoas(state, escala) {
    const linhas = new Map();
    for (const p of state.pessoas || []) {
      if (p.ativo === false) continue;
      linhas.set(p.id, { pessoa: p, total: 0, funcoes: {} });
    }
    for (const c of escala.cultos) {
      for (const s of c.equipe) {
        const l = linhas.get(s.pessoaId);
        if (!l) continue;
        l.total++;
        l.funcoes[s.funcao] = (l.funcoes[s.funcao] || 0) + 1;
      }
    }
    return [...linhas.values()].sort((a, b) => b.total - a.total || a.pessoa.nome.localeCompare(b.pessoa.nome));
  }

  /** Texto pronto para colar no WhatsApp (negrito com *, itálico com _). */
  function textoWhatsApp(state, escala, opcoes) {
    opcoes = opcoes || {};
    const comLink = (m) => (m ? (opcoes.links && m.link ? `${rotuloMusica(m)} ${m.link}` : rotuloMusica(m)) : "a definir");
    const igreja = (state.igreja && state.igreja.nome) || "";
    const linhas = [`*${escala.titulo}*${igreja ? ` · ${igreja}` : ""}`, `_${formatarPeriodo(escala.inicio, escala.fim)}_`];
    for (const c of escala.cultos) {
      linhas.push("", `*${formatarData(c.data, "dia")}${c.hora ? ` · ${c.hora}` : ""} · ${c.nome}*${c.solene ? " (solene)" : ""}`);
      const grupos = [];
      c.equipe.forEach((s) => {
        const nome = (porId(state.pessoas, s.pessoaId) || {}).nome || "a definir";
        const g = grupos.find((x) => x.funcao === s.funcao);
        if (g) g.nomes.push(nome);
        else grupos.push({ funcao: s.funcao, nomes: [nome] });
      });
      grupos.forEach((g) => linhas.push(`${nomeFuncao(state, g.funcao)}: ${g.nomes.join(", ")}`));
      if (opcoes.liturgia !== false) {
        linhas.push("_Liturgia_");
        c.liturgia.forEach((it, i) => {
          let det = "";
          if (it.tipo === "musica") det = it.musicas.map((id) => comLink(porId(state.musicas, id))).join(" / ");
          else if (it.tipo === "oficial") det = it.oficiais.map((id) => nomeOficial(porId(state.oficiais, id)) || "a definir").join(", ");
          else det = it.texto || "";
          const nota = it.nota ? ` (${it.nota})` : "";
          linhas.push(`${i + 1}. ${it.titulo}${det ? ` — ${det}` : ""}${nota}`);
        });
      } else {
        const musicas = c.liturgia.flatMap((it) => it.musicas).filter(Boolean).map((id) => comLink(porId(state.musicas, id)));
        if (musicas.length) linhas.push(`Músicas: ${musicas.join("; ")}`);
      }
      if (c.obs) linhas.push(`Obs.: ${c.obs}`);
    }
    return linhas.join("\n");
  }

  /* ------------------------------------------------------- importação */

  function normalizar(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }

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
    if (["sl", "salmo", "salmos"].includes(n)) return "salmo";
    if (["h", "hino", "hinos", "sh", "salmos e hinos"].includes(n)) return "hino";
    if (["l", "louvor", "louvores", "c", "cantico", "canticos"].includes(n)) return "louvor";
    return null;
  }

  /**
   * Lê uma lista colada (do Word, Excel ou WhatsApp). Cada linha pode ser:
   *   "12 - Santo! Santo! Santo!"
   *   "Hino; 12; Santo! Santo! Santo!; trinitário, adoração"
   *   "Louvor<TAB>Em Cristo somente<TAB>cristocêntrico"
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
      let titulo = "";
      let tags = [];
      let autor = "";
      if (partes.length > 1 && lerTipo(partes[0]) && !/^\d/.test(partes[0])) {
        tipo = lerTipo(partes[0]);
        partes = partes.slice(1);
      }
      if (partes.length > 1 && /^\d+[a-z]?$/i.test(partes[0])) {
        numero = partes.shift();
      }
      titulo = partes.shift() || "";
      const url = titulo.match(/\s*[-–—]?\s*(https?:\/\/\S+)\s*$/i);
      if (url) {
        partes.unshift(url[1]);
        titulo = titulo.slice(0, url.index).trim();
      }
      if (!numero && /^\d+[a-z]?$/i.test(titulo)) {
        numero = titulo; // "245": hino só com o número
        titulo = "";
      }
      if (!numero) {
        const m = titulo.match(/^(?:(?:SH|HNC|Hino|Salmo|Sl|nº|n\.?)\s*)?(\d+[a-z]?)\s*[-–—.:)]\s*(.+)$/i);
        if (m) {
          numero = m[1];
          titulo = m[2];
        }
      }
      let link = "";
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

  /** Garante campos novos em dados salvos por versões anteriores. */
  function migrar(state, base) {
    const s = Object.assign({}, base, state);
    for (const k of ["funcoes", "tags", "pessoas", "oficiais", "musicas", "liturgias", "cultos", "escalas"]) {
      if (!Array.isArray(s[k])) s[k] = (base && base[k]) || [];
    }
    s.regras = Object.assign({}, base && base.regras, state && state.regras);
    s.igreja = Object.assign({}, base && base.igreja, state && state.igreja);
    s.versao = 1;
    return s;
  }

  return {
    DIAS, DIAS_CURTOS, MESES, TIPOS_MUSICA, HINARIO,
    parseData, isoData, somarDias, diasEntre, diaSemana, semanaDoMes, fimDoMes,
    formatarData, formatarPeriodo, indisponivelEm,
    criarAleatorio, novoId, porId, rotuloMusica, nomeFuncao, nomeOficial, nomeTag,
    tagsExigidas, atendeItem, listarOcorrencias, montarUsos,
    candidatosPessoa, candidatosOficial, candidatosMusica, itemModelo,
    nivelFuncao, gerarEscala, preencherCulto, adicionarCultoAvulso, sortearCampo,
    validarEscala, resumoPessoas, textoWhatsApp,
    lerListaMusicas, lerTags, normalizar, migrar,
  };
});
