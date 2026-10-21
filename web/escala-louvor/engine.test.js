// Testes do motor da escala: node --test web/escala-louvor/engine.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("./engine.js");
const D = require("./dados-iniciais.js");

const novoEstado = () => D.estadoInicial();
const todosCampos = (escala) =>
  escala.cultos.flatMap((c) => [
    ...c.equipe.map((s) => s.pessoaId),
    ...c.liturgia.flatMap((it) => [...it.musicas, ...it.oficiais]),
  ]);
const musicasDo = (s, culto) => culto.liturgia.flatMap((it) => it.musicas).map((id) => E.porId(s.musicas, id));

test("lista os cultos do período e respeita cultos desligados", () => {
  const s = novoEstado();
  const oc = E.listarOcorrencias(s.cultos, "2026-11-01", "2026-11-30");
  assert.equal(oc.filter((o) => o.cultoId === "dom-manha").length, 5);
  assert.equal(oc.filter((o) => o.cultoId === "dom-noite").length, 5);
  assert.equal(oc.filter((o) => o.cultoId === "ter-oracao").length, 4);
  assert.equal(oc.filter((o) => o.cultoId === "qui-doutrina").length, 4);
  s.cultos.find((c) => c.id === "qui-doutrina").ativo = false;
  assert.equal(E.listarOcorrencias(s.cultos, "2026-11-01", "2026-11-30").filter((o) => o.cultoId === "qui-doutrina").length, 0);
  assert.deepEqual(oc.slice(0, 2).map((o) => o.cultoId), ["dom-manha", "dom-noite"]); // ordem pela hora
});

test("semanas do mês: só as escolhidas, e 'ultima' pega o último domingo", () => {
  const cultos = [{ id: "u", diaSemana: 0, semanas: [1, "ultima"], ativo: true }];
  const oc = E.listarOcorrencias(cultos, "2026-11-01", "2026-12-31");
  assert.deepEqual(oc.map((o) => o.data), ["2026-11-01", "2026-11-29", "2026-12-06", "2026-12-27"]);
});

test("a escala quinzenal preenche tudo e cumpre a orientação pastoral nos cultos solenes", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-11-07", seed: 3 });
  assert.ok(todosCampos(esc).every(Boolean), "nenhum campo vazio");
  assert.deepEqual(E.validarEscala(s, esc).filter((a) => a.nivel === "erro"), []);
  for (const c of esc.cultos.filter((x) => x.solene)) {
    for (const m of musicasDo(s, c)) {
      const exig = m.tipo === "louvor" ? ["cristocentrico", "doutrinario"] : ["trinitario"];
      assert.ok(exig.every((t) => m.tags.includes(t)), `${E.rotuloMusica(m)} em ${c.nome}`);
    }
  }
});

test("a liturgia segue o modelo da igreja, com a observação padrão preenchida", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 1 });
  const solene = esc.cultos.find((c) => c.cultoId === "dom-noite");
  assert.equal(solene.liturgia.length, 14);
  assert.equal(solene.liturgia[3].titulo, "Confissão de pecado");
  assert.equal(solene.liturgia[3].nota, "Êxodo 20.1–17, leitura participativa");
  assert.equal(solene.liturgia[5].musicas.length, 2); // 2 louvores
  assert.equal(solene.liturgia[6].musicas.length, 1); // louvor da contribuição
});

test("respeita a última vez que a música foi cantada antes da ferramenta", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 4 });
  const usadas = esc.cultos.flatMap((c) => musicasDo(s, c)).map((m) => m.id);
  assert.ok(!usadas.includes("sh29"), "SH 29 foi cantado em 18/10");
  const c = E.candidatosMusica(s, esc, 0, 1, 0).find((x) => x.musica.id === "sh29");
  assert.equal(c.ultima, "2026-10-18");
  assert.match(c.bloqueio, /^cantada há 7 dias$/);
});

test("ninguém é escalado em data indisponível nem em duas funções; o apoio cobre a falta", () => {
  const s = novoEstado();
  E.porId(s.pessoas, "leonar").indisponivel = ["2026-10-25"];
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 5 });
  const bateristas = esc.cultos.map((c) => c.equipe.find((x) => x.funcao === "bateria").pessoaId);
  assert.ok(bateristas.includes("tulio"), "Tulio apoia na bateria quando Leonar não pode");
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
    for (const slot of c.equipe) {
      const p = E.porId(s.pessoas, slot.pessoaId);
      assert.equal(E.nivelFuncao(p, slot.funcao), "principal", `${p.nome} em ${slot.funcao} (${c.data})`);
    }
  }
});

test("o presbítero que toca bateria não recebe parte da liturgia no mesmo culto", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-01", fim: "2026-11-30", seed: 2 });
  for (const c of esc.cultos) {
    const toca = c.equipe.some((x) => x.pessoaId === "leonar");
    const dirige = c.liturgia.some((it) => it.oficiais.includes("leonar-pb"));
    assert.ok(!(toca && dirige), c.data);
  }
  const ci = esc.cultos.findIndex((c) => c.cultoId === "dom-noite");
  const cand = E.candidatosOficial(s, esc, ci, 0, 0).find((x) => x.oficial.id === "leonar-pb");
  assert.equal(cand.bloqueio, "está na equipe do louvor neste culto");
  assert.ok(!E.candidatosOficial(s, esc, ci, 0, 0).some((x) => x.oficial.id === "inacio"), "oficial inativo fica de fora");
});

test("a escala mensal distribui o serviço de forma equilibrada", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-11-01", fim: "2026-11-30", seed: 11 });
  const totais = E.resumoPessoas(s, esc).map((l) => l.total);
  assert.ok(Math.max(...totais) - Math.min(...totais) <= 4, `totais: ${totais}`);
});

test("sortear de novo mantém os campos travados", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-11-07", seed: 1 });
  const c = esc.cultos[0];
  c.equipe[0].pessoaId = "germano";
  c.liturgia[1].musicas[0] = "sh247";
  c.liturgia[1].nota = "Todos em pé";
  c.travados = ["e:0", "m:1:0"];
  const nova = E.gerarEscala(s, { inicio: esc.inicio, fim: esc.fim }, esc);
  assert.equal(nova.id, esc.id);
  assert.equal(nova.cultos[0].equipe[0].pessoaId, "germano");
  assert.equal(nova.cultos[0].liturgia[1].musicas[0], "sh247");
  assert.equal(nova.cultos[0].liturgia[1].nota, "Todos em pé");
});

test("louvores não se repetem dentro do intervalo quando há repertório", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-11-07", seed: 2 });
  const louvores = esc.cultos.filter((c) => !c.acompanha).flatMap((c) => musicasDo(s, c)).filter((m) => m.tipo === "louvor").map((m) => m.id);
  assert.equal(new Set(louvores).size, louvores.length);
});

test("não coloca música sem a etiqueta exigida e avisa o que falta", () => {
  const s = novoEstado();
  s.musicas.forEach((m) => { m.tags = m.tags.filter((t) => t !== "trinitario"); });
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 1 });
  const solene = esc.cultos.find((c) => c.cultoId === "dom-noite");
  assert.equal(solene.liturgia[1].musicas[0], null);
  assert.ok(E.validarEscala(s, esc).some((a) => a.nivel === "erro" && /Cântico: falta escolher a música/.test(a.msg)));
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

test("rótulos e texto do WhatsApp", () => {
  const s = novoEstado();
  assert.equal(E.rotuloMusica(E.porId(s.musicas, "sh247")), "SH 247");
  assert.equal(E.rotuloMusica(E.porId(s.musicas, "sh-abraao")), "Ao Deus de Abraão");
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 1 });
  const txt = E.textoWhatsApp(s, esc, { links: true });
  assert.match(txt, /\*Dom, 25\/10 · 18:00 · Culto solene\* \(solene\)/);
  assert.match(txt, /Vocal: \S+, \S+, \S+/);
  assert.doesNotMatch(txt, /Ministro/);
  assert.match(txt, /4\. Confissão de pecado — Dirigente · em pé \(Êxodo 20\.1–17, leitura participativa\)/);
  assert.match(txt, /https:\/\/youtu\.be\//);
});

test("o culto solene de domingo repete a equipe e as músicas do culto da manhã", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-11-07", seed: 6 });
  const manhas = esc.cultos.filter((c) => c.cultoId === "dom-manha");
  assert.equal(manhas.length, 2);
  for (const manha of manhas) {
    const noite = esc.cultos.find((c) => c.cultoId === "dom-noite" && c.data === manha.data);
    assert.equal(noite.acompanha, manha.id);
    assert.deepEqual(noite.equipe.map((x) => x.pessoaId), manha.equipe.map((x) => x.pessoaId));
    const ids = (c) => c.liturgia.flatMap((it) => it.musicas).sort();
    assert.deepEqual(ids(noite), ids(manha));
    assert.ok(noite.liturgia[0].oficiais[0], "o dirigente da noite é escolhido à parte");
  }
  assert.ok(!E.validarEscala(s, esc).some((a) => /repete a de Dom/.test(a.msg) && esc.cultos[a.ci].cultoId === "dom-noite"));
  // Domingo conta uma vez no resumo de quem serviu.
  const total = E.resumoPessoas(s, esc).reduce((n, l) => n + l.total, 0);
  const vagas = esc.cultos.filter((c) => !c.acompanha).reduce((n, c) => n + c.equipe.length, 0);
  assert.equal(total, vagas);
});

test("a ordem das músicas da noite é mantida quando a manhã troca uma música", () => {
  const s = novoEstado();
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 8 });
  const manha = esc.cultos.find((c) => c.cultoId === "dom-manha");
  const noite = esc.cultos.find((c) => c.cultoId === "dom-noite");
  const [a, b] = noite.liturgia[5].musicas;
  noite.liturgia[5].musicas = [b, a]; // inverte os dois louvores
  const antiga = manha.liturgia[6].musicas[0];
  E.sortearCampo(s, esc, esc.cultos.indexOf(manha), "m:6:0");
  const nova = manha.liturgia[6].musicas[0];
  assert.notEqual(nova, antiga);
  E.sincronizarEscala(s, esc);
  assert.deepEqual(noite.liturgia[5].musicas, [b, a]);
  assert.equal(noite.liturgia[6].musicas[0], nova);
  // A noite não sorteia equipe nem música por conta própria.
  const antes = JSON.stringify(noite.equipe);
  E.sortearCampo(s, esc, esc.cultos.indexOf(noite), "e:0");
  assert.equal(JSON.stringify(noite.equipe), antes);
});

test("sem o culto da manhã, o culto da noite é escalado normalmente", () => {
  const s = novoEstado();
  s.cultos.find((c) => c.id === "dom-manha").ativo = false;
  const esc = E.gerarEscala(s, { inicio: "2026-10-25", fim: "2026-10-25", seed: 3 });
  const noite = esc.cultos.find((c) => c.cultoId === "dom-noite");
  assert.equal(noite.acompanha, null);
  assert.ok(todosCampos({ cultos: [noite] }).every(Boolean));
});
