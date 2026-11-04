// Testes do motor da escala: node --test web/escala-louvor/engine.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("./engine.js");
const D = require("./dados-iniciais.js");

// A maioria dos testes trata das outras regras: sem respostas de disponibilidade, sorteia com todos.
const novoEstado = () => {
  const s = D.estadoInicial();
  s.regras.soQuemPode = false;
  return s;
};
const cultoDe = (esc, cultoId, data) => esc.cultos.find((c) => c.cultoId === cultoId && (!data || c.data === data));
const musicasDo = (s, culto) => culto.musicas.map((m) => E.porId(s.musicas, m.id));
const todosCampos = (culto) => [...culto.equipe.map((x) => x.pessoaId), ...culto.musicas.map((m) => m.id)];

test("lista os cultos do período e respeita cultos desligados", () => {
  const s = novoEstado();
  const oc = E.listarOcorrencias(s.cultos, "2026-11-01", "2026-11-30");
  assert.equal(oc.filter((o) => o.cultoId === "dom-manha").length, 5);
  assert.equal(oc.filter((o) => o.cultoId === "dom-noite").length, 5);
  assert.equal(oc.filter((o) => o.cultoId === "ter-oracao").length, 4);
  assert.equal(oc.filter((o) => o.cultoId === "qui-doutrina").length, 4);
  assert.deepEqual(oc.slice(0, 2).map((o) => o.cultoId), ["dom-manha", "dom-noite"]); // ordem pela hora
  s.cultos.find((c) => c.id === "qui-doutrina").ativo = false;
  assert.equal(E.listarOcorrencias(s.cultos, "2026-11-01", "2026-11-30").filter((o) => o.cultoId === "qui-doutrina").length, 0);
});

test("semanas do mês: só as escolhidas, e 'ultima' pega o último domingo", () => {
  const cultos = [{ id: "u", diaSemana: 0, semanas: [1, "ultima"], ativo: true }];
  const oc = E.listarOcorrencias(cultos, "2026-11-01", "2026-12-31");
  assert.deepEqual(oc.map((o) => o.data), ["2026-11-01", "2026-11-29", "2026-12-06", "2026-12-27"]);
});

test("cada culto tem só equipe e músicas, na quantidade configurada", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-27", seed: 1 });
  const manha = cultoDe(esc, "dom-manha");
  assert.deepEqual(Object.keys(manha).sort(), ["acompanha", "cultoId", "data", "equipe", "hora", "id", "musicas", "nome", "obs", "solene", "travados"]);
  assert.equal(manha.equipe.length, 8);
  assert.deepEqual(manha.musicas.map((m) => m.tipo), ["hino", "louvor", "louvor", "louvor"]);
  assert.deepEqual(cultoDe(esc, "ter-oracao").musicas.map((m) => m.tipo), ["hino", "hino", "louvor", "louvor"]);
});

test("a escala quinzenal preenche tudo e cumpre a orientação pastoral nos cultos solenes", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-11-07", seed: 3 });
  assert.ok(esc.cultos.every((c) => todosCampos(c).every(Boolean)), "nenhum campo vazio");
  assert.deepEqual(E.validarEscala(s, esc).filter((a) => a.nivel === "erro"), []);
  for (const c of esc.cultos.filter((x) => x.solene)) {
    for (const m of musicasDo(s, c)) {
      const exig = m.tipo === "louvor" ? ["cristocentrico", "doutrinario"] : ["trinitario"];
      assert.ok(exig.every((t) => m.tags.includes(t)), `${E.rotuloMusica(m)} em ${c.nome}`);
    }
  }
});

test("respeita a última vez que a música foi cantada antes da ferramenta", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 4 });
  const manha = cultoDe(esc, "dom-manha");
  assert.notEqual(manha.musicas[0].id, "sh29");
  const c = E.candidatosMusica(s, esc, esc.cultos.indexOf(manha), 0).find((x) => x.musica.id === "sh29");
  assert.equal(c.ultima, "2026-10-18");
  assert.equal(c.bloqueio, "cantada há 7 dias");
});

test("ninguém é escalado em data indisponível nem em duas funções; o apoio cobre a falta", () => {
  const s = novoEstado();
  E.porId(s.pessoas, "leonar").indisponivel = ["2026-10-25"];
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 5 });
  assert.equal(cultoDe(esc, "dom-manha").equipe.find((x) => x.funcao === "bateria").pessoaId, "tulio");
  for (const culto of esc.cultos) {
    const ids = culto.equipe.map((x) => x.pessoaId).filter(Boolean);
    assert.ok(!ids.includes("leonar"));
    assert.equal(new Set(ids).size, ids.length);
  }
  assert.ok(E.validarEscala(s, esc).some((a) => a.nivel === "alerta" && /Tulio só apoia em bateria/.test(a.msg)));
});

test("quem só apoia não é escalado enquanto houver titular disponível", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-01", fim: "2026-11-30", seed: 9 });
  for (const c of esc.cultos) {
    for (const vaga of c.equipe) {
      const p = E.porId(s.pessoas, vaga.pessoaId);
      assert.equal(E.nivelFuncao(p, vaga.funcao), "principal", `${p.nome} em ${vaga.funcao} (${c.data})`);
    }
  }
});

test("a escala mensal distribui as vozes de forma equilibrada", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-01", fim: "2026-11-30", seed: 11 });
  const vozes = E.resumoPessoas(s, esc).filter((l) => l.funcoes.vocal).map((l) => l.total);
  assert.ok(Math.max(...vozes) - Math.min(...vozes) <= 2, `vocais: ${vozes}`);
});

test("sortear de novo mantém os campos fixados e as observações", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-11-07", seed: 1 });
  const c = esc.cultos[0];
  c.equipe[0].pessoaId = "germano";
  c.musicas[0].id = "sh247";
  c.obs = "Ensaio sábado 16h";
  c.travados = ["e:0", "m:0"];
  const nova = E.gerarEscala(s, { inicio: esc.inicio, fim: esc.fim }, esc);
  assert.equal(nova.id, esc.id);
  assert.equal(nova.cultos[0].equipe[0].pessoaId, "germano");
  assert.equal(nova.cultos[0].musicas[0].id, "sh247");
  assert.equal(nova.cultos[0].obs, "Ensaio sábado 16h");
});

test("louvores não se repetem dentro do intervalo quando há repertório", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-11-07", seed: 2 });
  const louvores = esc.cultos.filter((c) => !c.acompanha).flatMap((c) => musicasDo(s, c)).filter((m) => m.tipo === "louvor").map((m) => m.id);
  assert.equal(new Set(louvores).size, louvores.length);
});

test("não coloca música fora da orientação e avisa o que falta", () => {
  const s = novoEstado();
  s.musicas.forEach((m) => { m.tags = m.tags.filter((t) => t !== "trinitario"); });
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 1 });
  assert.equal(cultoDe(esc, "dom-manha").musicas[0].id, null);
  assert.ok(E.validarEscala(s, esc).some((a) => a.nivel === "erro" && a.msg === "Salmos e Hinos: falta escolher a música"));
});

test("domingo: o culto da noite repete a equipe e as músicas da manhã", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-11-07", seed: 6 });
  for (const manha of esc.cultos.filter((c) => c.cultoId === "dom-manha")) {
    const noite = cultoDe(esc, "dom-noite", manha.data);
    assert.equal(noite.acompanha, manha.id);
    assert.deepEqual(noite.equipe, manha.equipe);
    assert.deepEqual(noite.musicas, manha.musicas);
  }
  assert.ok(!E.validarEscala(s, esc).some((a) => esc.cultos[a.ci].cultoId === "dom-noite"));
  const total = E.resumoPessoas(s, esc).reduce((n, l) => n + l.total, 0);
  assert.equal(total, esc.cultos.filter((c) => !c.acompanha).reduce((n, c) => n + c.equipe.length, 0));
});

test("a ordem das músicas da noite é mantida quando a manhã troca uma música", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 8 });
  const manha = cultoDe(esc, "dom-manha");
  const noite = cultoDe(esc, "dom-noite");
  E.moverMusica(noite, 1, 1); // inverte o 1º e o 2º louvor à noite
  const ordemNoite = noite.musicas.map((m) => m.id);
  assert.notDeepEqual(ordemNoite, manha.musicas.map((m) => m.id));
  const antiga = manha.musicas[3].id;
  E.sortearCampo(s, esc, esc.cultos.indexOf(manha), "m:3");
  const nova = manha.musicas[3].id;
  assert.notEqual(nova, antiga);
  assert.deepEqual(noite.musicas.map((m) => m.id), ordemNoite.map((id) => (id === antiga ? nova : id)));
  const antes = JSON.stringify(noite.equipe);
  E.sortearCampo(s, esc, esc.cultos.indexOf(noite), "e:0");
  assert.equal(JSON.stringify(noite.equipe), antes, "a noite não sorteia sozinha");
});

test("sem o culto da manhã, o culto da noite é escalado normalmente", () => {
  const s = novoEstado();
  s.cultos.find((c) => c.id === "dom-manha").ativo = false;
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 3 });
  const noite = cultoDe(esc, "dom-noite");
  assert.equal(noite.acompanha, null);
  assert.ok(todosCampos(noite).every(Boolean));
});

test("escolher uma música que já está no culto troca as duas de lugar; mover leva a marca de fixa", () => {
  const culto = { musicas: [{ tipo: "hino", id: "a" }, { tipo: "louvor", id: "b" }, { tipo: "louvor", id: "c" }], travados: ["m:1"] };
  E.colocarMusica(culto, 1, "c");
  assert.deepEqual(culto.musicas.map((m) => m.id), ["a", "c", "b"]);
  E.moverMusica(culto, 1, 1);
  assert.deepEqual(culto.musicas.map((m) => m.id), ["a", "b", "c"]);
  assert.deepEqual(culto.travados, ["m:2"]);
});

test("culto extra usa a equipe e as músicas do culto escolhido e continua ao sortear de novo", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-12-20", fim: "2026-12-31", seed: 2 });
  const ci = E.adicionarCultoExtra(s, esc, { data: "2026-12-24", cultoId: "dom-noite", nome: "Culto de Natal", hora: "20:00", solene: true }, E.criarAleatorio(1));
  const natal = esc.cultos[ci];
  assert.equal(natal.nome, "Culto de Natal");
  assert.ok(natal.avulso);
  assert.equal(natal.equipe.length, 8);
  assert.ok(todosCampos(natal).every(Boolean));
  const refeita = E.gerarEscala(s, { inicio: esc.inicio, fim: esc.fim }, esc);
  assert.ok(refeita.cultos.some((c) => c.nome === "Culto de Natal"));
});

test("lê listas coladas em vários formatos", () => {
  const s = novoEstado();
  const lidas = E.lerListaMusicas(s, [
    "245",
    "Hino; 30; Castelo Forte; trinitário, doutrinário",
    "Louvor\tPorque Ele vive\tcristocêntrico",
    "SH 45. Rude Cruz",
    "Isaías 53 - https://youtu.be/yTkby6Vgfms",
    "Hosana; adoração",
    "",
  ].join("\n"), { tipo: "hino" });
  assert.equal(lidas.length, 6);
  assert.deepEqual([lidas[0].numero, lidas[0].titulo], ["245", ""]);
  assert.deepEqual(lidas[1].tags, ["trinitario", "doutrinario"]);
  assert.equal(lidas[2].tipo, "louvor");
  assert.deepEqual(lidas[2].tags, ["cristocentrico"]);
  assert.deepEqual([lidas[3].numero, lidas[3].titulo], ["45", "Rude Cruz"]);
  assert.deepEqual([lidas[4].titulo, lidas[4].link], ["Isaías 53", "https://youtu.be/yTkby6Vgfms"]);
  assert.deepEqual([lidas[5].titulo, lidas[5].tags], ["Hosana", ["adoracao"]]);
});

test("texto do WhatsApp: domingo num bloco só, com a ordem da noite quando muda", () => {
  const s = novoEstado();
  assert.equal(E.rotuloMusica(E.porId(s.musicas, "sh247")), "SH 247 · Santo! Santo! Santo!");
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 1 });
  let txt = E.textoWhatsApp(s, esc, { links: true });
  assert.match(txt, /\*Dom, 25\/10\*\n_Culto matinal e EBD · 09:00 {2}\| {2}Culto solene · 18:00_/);
  assert.match(txt, /Vocal: \S+, \S+, \S+/);
  assert.match(txt, /https:\/\/youtu\.be\//);
  assert.doesNotMatch(txt, /Ordem às/);
  assert.doesNotMatch(txt, /Ministro|Dirigente|Pregação/);
  E.moverMusica(cultoDe(esc, "dom-noite"), 1, 1);
  txt = E.textoWhatsApp(s, esc);
  assert.match(txt, /Ordem às 18:00:\n1\. /);
});

test("migra dados salvos com liturgia e oficiais para o formato novo", () => {
  const base = D.configuracaoBase();
  const antigo = {
    funcoes: base.funcoes, tags: base.tags, regras: base.regras, igreja: base.igreja,
    pessoas: D.estadoInicial().pessoas,
    musicas: [{ id: "sh1", tipo: "salmo", numero: "1", titulo: "", tags: ["trinitario"] }, { id: "lv1", tipo: "louvor", titulo: "X", tags: [] }],
    oficiais: [{ id: "o1", nome: "Ariostenes", cargo: "Presbítero" }],
    liturgias: [{ id: "lit-matinal", itens: [
      { id: "m01", tipo: "oficial", cargos: ["Presbítero"], qtd: 1 },
      { id: "m02", tipo: "musica", tipos: ["salmo", "hino"], qtd: 1 },
      { id: "m06", tipo: "musica", tipos: ["louvor"], qtd: 2 },
      { id: "m07", tipo: "musica", tipos: ["louvor"], qtd: 1 },
    ] }],
    cultos: [
      { id: "dom-manha", nome: "Culto matinal e EBD", diaSemana: 0, hora: "09:00", liturgiaId: "lit-matinal", solene: true, ativo: true, equipe: [{ funcao: "vocal", qtd: 1 }] },
      { id: "dom-noite", nome: "Culto solene", diaSemana: 0, hora: "18:00", liturgiaId: "lit-x", solene: true, ativo: true, equipe: [{ funcao: "vocal", qtd: 1 }], acompanha: "dom-manha" },
    ],
    escalas: [{ id: "e1", inicio: "2026-10-25", fim: "2026-10-25", cultos: [
      { id: "c1", data: "2026-10-25", cultoId: "dom-manha", nome: "Culto matinal e EBD", hora: "09:00", solene: true, equipe: [{ funcao: "vocal", pessoaId: "germano" }],
        liturgia: [{ itemId: "m01", tipo: "oficial", musicas: [], oficiais: ["o1"] }, { itemId: "m02", tipo: "musica", musicas: ["sh1"], oficiais: [] }, { itemId: "m06", tipo: "musica", tipos: ["louvor"], musicas: ["lv1", null], oficiais: [] }],
        travados: ["e:0", "m:1:0", "o:0:0"] },
      { id: "c2", data: "2026-10-25", cultoId: "dom-noite", nome: "Culto solene", hora: "18:00", solene: true, equipe: [{ funcao: "vocal", pessoaId: "leticia" }],
        liturgia: [{ itemId: "s02", tipo: "musica", tipos: ["salmo", "hino"], musicas: ["sh1"], oficiais: [] }], travados: [] },
    ] }],
  };
  const s = E.migrar(antigo, base);
  assert.equal(s.oficiais, undefined);
  assert.equal(s.liturgias, undefined);
  assert.equal(E.porId(s.musicas, "sh1").tipo, "hino");
  assert.deepEqual(E.porId(s.cultos, "dom-manha").musicas, { hino: 1, louvor: 3 });
  assert.deepEqual(E.porId(s.cultos, "dom-noite").musicas, { hino: 1, louvor: 3 }); // liturgia sumiu: usa o padrão do culto
  const [manha, noite] = s.escalas[0].cultos;
  assert.equal(manha.liturgia, undefined);
  assert.deepEqual(manha.musicas, [{ tipo: "hino", id: "sh1" }, { tipo: "louvor", id: "lv1" }, { tipo: "louvor", id: null }]);
  assert.deepEqual(manha.travados, ["e:0"]);
  assert.equal(noite.acompanha, "c1", "liga os cultos de domingo de escalas antigas");
  assert.deepEqual(noite.equipe, manha.equipe);
  assert.deepEqual(noite.musicas, manha.musicas);
});

test("disponibilidade: quem marcou que não pode fica de fora; quem confirmou vem antes de quem não respondeu", () => {
  const s = novoEstado();
  const inicio = "2026-10-25";
  const fim = "2026-11-07";
  const em = "2026-10-21T10:00:00Z";
  // Leonar não pode no dia 25; os vocais Germano e Alexandre confirmam todos os dias; o resto não respondeu.
  const todos = E.diasDeCulto(s, inicio, fim).map((d) => d.data);
  s.respostas = [
    { id: E.idResposta("leonar", inicio), pessoaId: "leonar", inicio, fim, dias: todos.filter((d) => d !== "2026-10-25"), em },
    { id: E.idResposta("germano", inicio), pessoaId: "germano", inicio, fim, dias: todos, em },
    { id: E.idResposta("alexandre", inicio), pessoaId: "alexandre", inicio, fim, dias: todos, em },
  ];
  assert.equal(E.disponivelEm(s, "leonar", "2026-10-25"), "nao");
  assert.equal(E.disponivelEm(s, "leonar", "2026-11-01"), "sim");
  assert.equal(E.disponivelEm(s, "natan", "2026-11-01"), null);
  const esc = E.gerarEscala(s, { inicio, fim, seed: 4 });
  const manha = cultoDe(esc, "dom-manha", "2026-10-25");
  assert.notEqual(manha.equipe.find((x) => x.funcao === "bateria").pessoaId, "leonar");
  const vozes = manha.equipe.filter((x) => x.funcao === "vocal").map((x) => x.pessoaId);
  assert.ok(vozes.includes("germano") && vozes.includes("alexandre"), `vozes: ${vozes}`);
  const cand = E.candidatosPessoa(s, esc, esc.cultos.indexOf(manha), manha.equipe.findIndex((x) => x.funcao === "bateria"));
  assert.equal(cand.find((c) => c.pessoa.id === "leonar").bloqueio, "marcou que não pode");
  assert.ok(cand.find((c) => c.pessoa.id === "tulio").semResposta);
});

test("disponibilidade: o sorteio só põe quem marcou que pode no dia (regra padrão)", () => {
  const s = D.estadoInicial();
  assert.equal(E.soQuemPode(s), true);
  const inicio = "2026-10-25";
  const fim = "2026-10-31";
  s.respostas = [
    // Germano pode na terça; Alexandre respondeu mas deixou a terça sem marcar; Kaio não pode; o resto não respondeu.
    { id: E.idResposta("germano", inicio), pessoaId: "germano", inicio, fim, dias: ["2026-10-27"], nao: [], em: "x" },
    { id: E.idResposta("alexandre", inicio), pessoaId: "alexandre", inicio, fim, dias: ["2026-10-29"], nao: [], em: "x" },
    { id: E.idResposta("kaio", inicio), pessoaId: "kaio", inicio, fim, dias: [], nao: ["2026-10-27"], em: "x" },
  ];
  const esc = E.gerarEscala(s, { inicio, fim, seed: 1 });
  const ter = cultoDe(esc, "ter-oracao");
  assert.deepEqual(ter.equipe.map((x) => x.pessoaId), ["germano", null, null]);
  // Em nenhum culto entra alguém que não marcou "posso" naquele dia.
  for (const c of esc.cultos) for (const v of c.equipe) if (v.pessoaId) assert.equal(E.disponivelEm(s, v.pessoaId, c.data), "sim", `${v.pessoaId} em ${c.data}`);
  // Vaga vazia à espera de quem marque "posso" não conta como erro.
  assert.ok(E.validarEscala(s, esc).some((a) => a.nivel === "espera" && /aguardando/.test(a.msg)));
  assert.ok(!E.validarEscala(s, esc).some((a) => /ninguém escalado/.test(a.msg)));
  // Na lista para escolher à mão, quem não marcou aparece com o motivo.
  const cand = E.candidatosPessoa(s, esc, esc.cultos.indexOf(ter), 1);
  assert.equal(cand.find((c) => c.pessoa.id === "alexandre").bloqueio, "não marcou que pode");
  assert.equal(cand.find((c) => c.pessoa.id === "kaio").bloqueio, "marcou que não pode");
  // Se alguém põe à mão quem não marcou, a escala avisa.
  ter.equipe[1].pessoaId = "alexandre";
  assert.ok(E.validarEscala(s, esc).some((a) => a.nivel === "alerta" && /Alexandre não marcou que pode/.test(a.msg)));
});

test("versão 5: dados antigos passam a sortear só quem marcou que pode", () => {
  const s = D.estadoInicial();
  s.versao = 4;
  s.regras = Object.assign({}, s.regras, { soQuemRespondeu: false });
  delete s.regras.soQuemPode;
  const m = E.migrar(s, D.configuracaoBase());
  assert.equal(m.versao, 5);
  assert.equal(m.regras.soQuemPode, true);
  assert.equal("soQuemRespondeu" in m.regras, false);
});

test("disponibilidade pelo WhatsApp: o código vai e volta", () => {
  const s = novoEstado();
  const r = { id: E.idResposta("kaio", "2026-10-25"), pessoaId: "kaio", inicio: "2026-10-25", fim: "2026-11-07", dias: ["2026-10-25", "2026-11-05"], obs: "Só à noite no dia 25", em: "x" };
  const texto = E.textoResposta(s, r);
  assert.match(texto, /\*Disponibilidade · Kaio\*/);
  assert.match(texto, /Posso: Dom, 25\/10, Qui, 05\/11/);
  assert.match(texto, /Recado: Só à noite no dia 25/);
  const colado = `Bom dia!\n${texto}\n\noutra coisa\n#disp ninguem 2026-10-25 2026-11-07 25/10`;
  const lidas = E.lerRespostas(s, colado);
  assert.equal(lidas.length, 1, "ignora código de pessoa que não existe");
  assert.deepEqual([lidas[0].pessoaId, lidas[0].inicio, lidas[0].fim, lidas[0].dias], ["kaio", "2026-10-25", "2026-11-07", ["2026-10-25", "2026-11-05"]]);
});

test("disponibilidade em três estados: posso, não posso e sem marcar", () => {
  const s = novoEstado();
  const inicio = "2026-10-25";
  const fim = "2026-11-07";
  // Resposta nova: Kaio pode no dia 25, não pode no 27 e não marcou os outros dias.
  const r = { id: E.idResposta("kaio", inicio), pessoaId: "kaio", inicio, fim, dias: ["2026-10-25"], nao: ["2026-10-27"], obs: "", em: "x" };
  s.respostas = [r];
  assert.equal(E.disponivelEm(s, "kaio", "2026-10-25"), "sim");
  assert.equal(E.disponivelEm(s, "kaio", "2026-10-27"), "nao");
  assert.equal(E.disponivelEm(s, "kaio", "2026-10-29"), null);
  // Resposta antiga (sem "nao"): todo dia não marcado continua valendo como "não posso".
  assert.equal(E.estadoNoDia({ dias: ["2026-10-25"] }, "2026-10-29"), "nao");

  const texto = E.textoResposta(s, r);
  assert.match(texto, /Posso: Dom, 25\/10/);
  assert.match(texto, /Não posso: Ter, 27\/10\n/);
  assert.match(texto, /Sem resposta: Qui, 29\/10/);
  assert.match(texto, /#disp kaio 2026-10-25 2026-11-07 25\/10 nao:27\/10/);
  const [lida] = E.lerRespostas(s, texto);
  assert.deepEqual([lida.dias, lida.nao], [["2026-10-25"], ["2026-10-27"]]);
  // Código antigo, sem "nao:", volta como resposta antiga.
  const [antiga] = E.lerRespostas(s, "#disp kaio 2026-10-25 2026-11-07 25/10");
  assert.equal(antiga.nao, undefined);
  assert.equal(E.estadoNoDia(antiga, "2026-10-27"), "nao");
  // Só "não posso" em todos os dias.
  const [nenhum] = E.lerRespostas(s, "#disp kaio 2026-10-25 2026-11-07 - nao:25/10,27/10");
  assert.deepEqual([nenhum.dias, nenhum.nao], [[], ["2026-10-25", "2026-10-27"]]);
});

test("escalas cumpridas vão para o arquivo e a disponibilidade segue a escala nova", () => {
  const s = novoEstado();
  const velha = { id: "a", inicio: "2026-10-25", fim: "2026-11-01", cultos: [] };
  const nova = { id: "b", inicio: "2026-11-03", fim: "2026-11-30", cultos: [] };
  s.escalas = [nova, velha];
  s.pedido = { inicio: "2026-10-25", fim: "2026-11-07" };
  const hoje = "2026-11-02";
  assert.equal(E.escalaCumprida(velha, hoje), true);
  assert.equal(E.escalaCumprida(nova, hoje), false);
  assert.equal(E.escalaCumprida({ fim: hoje }, hoje), false, "no último dia ainda está em vigor");
  assert.deepEqual(E.escalasAtivas(s, hoje).map((e) => e.id), ["b"]);
  assert.deepEqual(E.escalasArquivadas(s, hoje).map((e) => e.id), ["a"]);
  // O pedido antigo ainda não terminou, mas a escala nova começa depois: vale a escala nova.
  assert.deepEqual(E.periodoDeDisponibilidade(s, hoje), { inicio: "2026-11-03", fim: "2026-11-30" });
  // Um pedido escolhido à mão para depois da escala nova passa na frente.
  s.pedido = { inicio: "2026-12-01", fim: "2026-12-31" };
  assert.deepEqual(E.periodoDeDisponibilidade(s, hoje), s.pedido);
  // Tudo cumprido e pedido vencido: nada em aberto.
  s.pedido = { inicio: "2026-10-25", fim: "2026-11-07" };
  assert.equal(E.periodoDeDisponibilidade(s, "2026-12-10"), null);
});

test("lista de louvores para compartilhar: só cânticos, com os tocados no período", () => {
  const s = novoEstado();
  const louvores = s.musicas.filter((m) => m.tipo === "louvor" && m.ativo !== false);
  const [a, b, c] = louvores;
  const hino = s.musicas.find((m) => m.tipo === "hino");
  s.escalas = [{ id: "e", inicio: "2026-10-01", fim: "2026-11-30", cultos: [
    { data: "2026-09-20", musicas: [{ tipo: "louvor", id: c.id }], equipe: [] },
    { data: "2026-10-11", musicas: [{ tipo: "louvor", id: a.id }, { tipo: "hino", id: hino.id }], equipe: [] },
    { data: "2026-11-01", musicas: [{ tipo: "louvor", id: a.id }], equipe: [] },
    { data: "2026-11-01", musicas: [{ tipo: "louvor", id: a.id }], equipe: [] }, // culto da noite, mesmo dia
    { data: "2026-11-08", musicas: [{ tipo: "louvor", id: b.id }], equipe: [] },
  ] }];
  const hoje = "2026-11-04";
  const lista = E.listaLouvores(s, hoje, 30);
  assert.equal(lista.length, louvores.length);
  assert.ok(lista.every((x) => x.musica.tipo === "louvor"), "sem Salmos e Hinos");
  const de = (m) => lista.find((x) => x.musica.id === m.id);
  assert.deepEqual(de(a).tocadas, ["2026-10-11", "2026-11-01"]);
  assert.deepEqual([de(b).tocadas, de(b).proxima], [[], "2026-11-08"]);
  assert.deepEqual([de(c).tocadas, de(c).ultima], [[], "2026-09-20"], "fora dos 30 dias");
  assert.equal(E.listaLouvores(s, hoje, 60).find((x) => x.musica.id === c.id).tocadas.length, 1);
  const texto = E.textoListaLouvores(s, hoje, 30, { link: "https://exemplo/#louvores?dias=30" });
  assert.match(texto, new RegExp(`✅ ${a.titulo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*\\(2×\\)`));
  assert.match(texto, /1 de \d+_/);
  assert.match(texto, /Lista completa, com links para ouvir: https:\/\/exemplo/);
  assert.doesNotMatch(texto, new RegExp(hino.titulo || "SH-sem-titulo"));
});

test("da lista de louvores: pôr um louvor no culto do fim de semana", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-08", fim: "2026-11-21", seed: 3 });
  s.escalas = [esc];
  const cultos = E.cultosParaAdicionar(s, "2026-11-04");
  assert.ok(cultos.length > 0);
  assert.ok(cultos.every((x) => !E.liderDe(esc, x.culto)), "a noite de domingo vem junto com a manhã");
  const domingo = cultos.find((x) => x.fimDeSemana);
  assert.equal(domingo.culto.data, "2026-11-08");
  assert.ok(domingo.junto.length >= 1, "culto da noite junto");
  const louvor = s.musicas.find((m) => m.tipo === "louvor" && m.ativo !== false && !domingo.culto.musicas.some((v) => v.id === m.id));
  const antes = domingo.culto.musicas.length;

  // Sem vaga livre de louvor: entra uma vaga nova, fixada, e o culto da noite recebe também.
  const r = E.adicionarMusicaAoCulto(s, esc, domingo.ci, louvor.id);
  assert.equal(r.ok, true);
  assert.equal(r.novaVaga, true);
  assert.equal(domingo.culto.musicas.length, antes + 1);
  assert.ok(domingo.culto.travados.includes(`m:${r.k}`));
  assert.ok(domingo.junto[0].musicas.some((v) => v.id === louvor.id));
  // De novo: já está, nada muda.
  assert.deepEqual(E.adicionarMusicaAoCulto(s, esc, domingo.ci, louvor.id), { ok: false, motivo: "já está neste culto" });
  // Com vaga livre de louvor, usa a vaga.
  const k = domingo.culto.musicas.findIndex((v) => v.tipo === "louvor" && v.id !== louvor.id);
  domingo.culto.musicas[k].id = null;
  const outro = s.musicas.find((m) => m.tipo === "louvor" && !domingo.culto.musicas.some((v) => v.id === m.id));
  const r2 = E.adicionarMusicaAoCulto(s, esc, domingo.ci, outro.id);
  assert.deepEqual([r2.ok, r2.novaVaga, r2.k], [true, false, k]);
  // Sorteando de novo, o que foi posto à mão fica.
  const nova = E.gerarEscala(s, { inicio: esc.inicio, fim: esc.fim, seed: 9 }, esc);
  const dom = nova.cultos.find((c) => c.id === domingo.culto.id);
  assert.ok(dom.musicas.some((v) => v.id === louvor.id) && dom.musicas.some((v) => v.id === outro.id));
});

test("quem muda a disponibilidade depois da escala montada: a escala se ajusta sozinha", () => {
  const s = D.estadoInicial(); // regra padrão: só quem marcou "posso"
  const inicio = "2026-11-08";
  const fim = "2026-11-14";
  const hoje = "2026-11-04";
  const resp = (id, dias, nao) => ({ id: E.idResposta(id, inicio), pessoaId: id, inicio, fim, dias, nao, obs: "", em: `2026-11-0${resp.n++}T10:00:00Z` });
  resp.n = 1;
  s.respostas = [resp("germano", ["2026-11-10"], []), resp("kaio", ["2026-11-10"], [])];
  const esc = E.gerarEscala(s, { inicio, fim, seed: 2 });
  s.escalas = [esc];
  const ter = cultoDe(esc, "ter-oracao", "2026-11-10");
  const ci = esc.cultos.indexOf(ter);
  const vozes = () => ter.equipe.filter((v) => v.funcao === "vocal").map((v) => v.pessoaId);
  assert.ok(vozes().includes("germano"));
  assert.ok(!vozes().includes("alexandre"));

  // Alexandre marca depois que pode na terça: entra na vaga vazia.
  s.respostas.push(resp("alexandre", ["2026-11-10"], []));
  let m = E.ajustarEscalaComRespostas(s, esc, hoje, () => 0);
  assert.ok(vozes().includes("alexandre"), `vozes: ${vozes()}`);
  assert.ok(m.some((x) => x.ci === ci && x.entrou === "alexandre" && !x.saiu));

  // Germano muda de ideia: sai, e ninguém mais pode no lugar dele.
  s.respostas.push(resp("germano", [], ["2026-11-10"]));
  m = E.ajustarEscalaComRespostas(s, esc, hoje, () => 0);
  assert.ok(!vozes().includes("germano"));
  assert.ok(m.some((x) => x.saiu === "germano"));

  // Fixado à mão depois do "não posso": continua (a escala avisa).
  const si = ter.equipe.findIndex((v) => v.funcao === "vocal" && !v.pessoaId);
  ter.equipe[si].pessoaId = "germano";
  ter.equipe[si].fixadoEm = "2026-11-09T00:00:00Z";
  ter.travados = [...(ter.travados || []), `e:${si}`];
  E.ajustarEscalaComRespostas(s, esc, hoje, () => 0);
  assert.equal(ter.equipe[si].pessoaId, "germano");
  // Fixado à mão e, depois, a própria pessoa diz "não posso": sai e a vaga deixa de ser fixa.
  const sa = ter.equipe.findIndex((v) => v.pessoaId === "alexandre");
  ter.equipe[sa].fixadoEm = "2026-11-01T00:00:00Z";
  ter.travados.push(`e:${sa}`);
  s.respostas.push(resp("alexandre", [], ["2026-11-10"]));
  m = E.ajustarEscalaComRespostas(s, esc, hoje, () => 0);
  assert.ok(!vozes().includes("alexandre"));
  assert.ok(!ter.travados.includes(`e:${sa}`));
  assert.ok(m.some((x) => x.saiu === "alexandre"));

  // Sem nada novo, nada muda; culto que já passou não muda.
  assert.deepEqual(E.ajustarEscalaComRespostas(s, esc, hoje, () => 0), []);
  s.respostas.push(resp("leonar", [], ["2026-11-08"]));
  const antes = JSON.stringify(esc.cultos.filter((c) => c.data === "2026-11-08"));
  E.ajustarEscalaComRespostas(s, esc, "2026-11-09", () => 0);
  assert.equal(JSON.stringify(esc.cultos.filter((c) => c.data === "2026-11-08")), antes);

  // Escala montada à mão: as respostas novas não preenchem sozinhas.
  E.esvaziarEscala(esc);
  s.respostas.push(resp("natan", ["2026-11-12"], []));
  E.ajustarEscalaComRespostas(s, esc, hoje, () => 0);
  assert.ok(esc.cultos.every((c) => c.equipe.every((v) => !v.pessoaId)));
});

test("dias de culto do período agrupam os cultos de cada dia", () => {
  const s = novoEstado();
  const dias = E.diasDeCulto(s, "2026-10-25", "2026-10-31");
  assert.deepEqual(dias.map((d) => [d.data, d.cultos.map((c) => c.id)]), [
    ["2026-10-25", ["dom-manha", "dom-noite"]],
    ["2026-10-27", ["ter-oracao"]],
    ["2026-10-29", ["qui-doutrina"]],
  ]);
});

test("a migração completa a seção Trindade do Salmos e Hinos sem duplicar", () => {
  const s = novoEstado();
  s.versao = 2;
  s.musicas = s.musicas.filter((m) => !["sh32", "sh33", "sh34", "sh35", "sh228"].includes(m.id));
  E.porId(s.musicas, "sh30").titulo = "";
  const m = E.migrar(s, D.configuracaoBase(), D.repertorio());
  assert.equal(m.versao, 5);
  for (const id of ["sh32", "sh33", "sh34", "sh35", "sh228"]) assert.ok(E.porId(m.musicas, id), id);
  assert.equal(E.porId(m.musicas, "sh30").titulo, "Vem, ó Todo-Poderoso!");
  assert.equal(m.musicas.filter((x) => x.id === "sh29").length, 1);
  assert.equal(E.rotuloMusica(E.porId(m.musicas, "sh31")), "SH 31 · Adoração à Trindade");
  const de_novo = E.migrar(Object.assign(m, { musicas: m.musicas.filter((x) => x.id !== "sh33") }), D.configuracaoBase(), D.repertorio());
  assert.ok(!E.porId(de_novo.musicas, "sh33"), "não recoloca um hino que a igreja apagou depois");
});

test("escala do zero: só as vagas, e o domingo à noite continua seguindo a manhã", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-01", fim: "2026-11-14", vazia: true });
  assert.ok(esc.cultos.length > 0);
  for (const c of esc.cultos) assert.ok(todosCampos(c).every((x) => x === null));
  const manha = cultoDe(esc, "dom-manha", "2026-11-01");
  manha.equipe[0].pessoaId = s.pessoas[0].id;
  E.sincronizarEscala(esc);
  assert.equal(cultoDe(esc, "dom-noite", "2026-11-01").equipe[0].pessoaId, s.pessoas[0].id);
});

test("montar à mão: vagas a mais entram e saem, e os fixos são renumerados", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-01", fim: "2026-11-07", seed: 3 });
  const culto = cultoDe(esc, "ter-oracao");
  const antes = culto.equipe.length;
  const si = E.adicionarVaga(culto, "vocal");
  assert.equal(culto.equipe.length, antes + 1);
  culto.equipe[si].pessoaId = s.pessoas[0].id;
  culto.travados = ["e:0", `e:${si}`, "m:1"];
  E.removerVaga(culto, 0);
  assert.deepEqual(culto.travados.sort(), [`e:${si - 1}`, "m:1"].sort());
  const k = E.adicionarMusica(culto, "louvor");
  assert.equal(culto.musicas[k].id, null);
  E.removerMusica(culto, 0);
  assert.deepEqual(culto.travados.filter((t) => t.startsWith("m:")), ["m:0"]);
});

test("sortear de novo mantém a vaga acrescentada à mão e preenchida", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-01", fim: "2026-11-07", seed: 5 });
  const culto = cultoDe(esc, "ter-oracao");
  const si = E.adicionarVaga(culto, "teclado");
  const tecladista = s.pessoas.find((p) => (p.funcoes || []).includes("teclado"));
  culto.equipe[si].pessoaId = tecladista.id;
  culto.travados = [...(culto.travados || []), `e:${si}`];
  const nova = E.gerarEscala(s, { inicio: esc.inicio, fim: esc.fim }, esc);
  const depois = cultoDe(nova, "ter-oracao");
  assert.ok(depois.equipe.some((v) => v.funcao === "teclado" && v.pessoaId === tecladista.id));
});

test("esvaziar a escala tira pessoas, músicas e fixos", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-01", fim: "2026-11-14", seed: 2 });
  esc.cultos[0].travados = ["e:0"];
  E.esvaziarEscala(esc);
  for (const c of esc.cultos) {
    assert.ok(todosCampos(c).every((x) => x === null));
    assert.deepEqual(c.travados, []);
  }
});

test("versão 4: entra a coletânea, sem duplicar, e completa o 232 e o 247", () => {
  const s = novoEstado();
  s.versao = 3;
  s.musicas = s.musicas.filter((m) => m.tipo === "louvor" || ["sh29", "sh30", "sh247", "sh-abraao"].includes(m.id));
  E.porId(s.musicas, "sh247").titulo = "";
  E.porId(s.musicas, "sh-abraao").numero = "";
  E.porId(s.musicas, "sh-abraao").obs = "Número no hinário a confirmar.";
  s.musicas.push({ id: "m-manual", tipo: "hino", numero: "640", titulo: "Castelo Forte", tags: [] });
  const m = E.migrar(s, D.configuracaoBase(), D.repertorio());
  const hinos = m.musicas.filter((x) => x.tipo === "hino");
  assert.equal(m.versao, 5);
  assert.equal(hinos.filter((x) => x.numero === "640").length, 1, "não duplica hino que a igreja já tinha");
  assert.equal(hinos.filter((x) => x.numero === "29").length, 1);
  assert.equal(E.porId(m.musicas, "sh247").titulo, "Santo! Santo! Santo!");
  assert.equal(E.porId(m.musicas, "sh-abraao").numero, "232");
  assert.ok(!/a confirmar/.test(E.porId(m.musicas, "sh-abraao").obs));
  assert.ok(E.porId(m.musicas, "sh51"), "hino da coletânea entra");
  assert.deepEqual(E.porId(m.musicas, "sh51").tags, [], "sem etiquetas: o pastor marca");
  assert.equal(E.temaDoHino(E.porId(m.musicas, "sh51")).nome, "Deus");
  assert.equal(E.temaDoHino({ tipo: "louvor" }), null);
});

test("índice de assuntos: subtema pela faixa e hinos indicados entre parênteses", () => {
  const h = (numero) => ({ tipo: "hino", numero: String(numero) });
  assert.equal(E.subtemaDoHino(h(74)).nome, "Nascimento");
  assert.equal(E.subtemaDoHino(h(537)).nome, "Batismo e Recepção de Membros");
  assert.equal(E.subtemaDoHino(h(556)).nome, "Apresentação de Criança");
  assert.equal(E.subtemaDoHino(h(216)), null, "Espírito Santo não tem subtemas");
  assert.ok(E.hinoNoAssunto(h(245), "trindade"), "245 é indicado na Trindade");
  assert.ok(E.hinoNoAssunto(h(245), "trindade:1"));
  assert.ok(!E.hinoNoAssunto(h(245), "trindade:2"));
  assert.ok(E.hinoNoAssunto(h(608), "igreja:8"), "608 serve na apresentação de criança");
  assert.deepEqual(E.tambemServeEm(h(31)).map((x) => x.nome), ["Louvor", "Início do Culto"]);
  assert.ok(!E.hinoNoAssunto({ tipo: "louvor" }, "trindade"));
  // as faixas dos subtemas cobrem cada seção sem buracos
  for (const t of E.TEMAS_HINARIO) {
    if (!t.subtemas.length) continue;
    let n = t.de;
    for (const st of t.subtemas) { assert.equal(st.de, n, `${t.nome} › ${st.nome}`); n = st.ate + 1; }
    assert.equal(n, t.ate + 1, t.nome);
  }
});
