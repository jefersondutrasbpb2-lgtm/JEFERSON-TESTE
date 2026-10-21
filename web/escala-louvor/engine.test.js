// Testes do motor da escala: node --test web/escala-louvor/engine.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("./engine.js");
const D = require("./dados-iniciais.js");

const novoEstado = () => D.estadoInicial();
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
  assert.equal(E.rotuloMusica(E.porId(s.musicas, "sh247")), "SH 247");
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
