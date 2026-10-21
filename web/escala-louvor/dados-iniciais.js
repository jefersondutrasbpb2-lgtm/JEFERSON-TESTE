/*
 * Dados iniciais da Escala do Louvor — IEC Pombal.
 *
 * Liturgias: "Modelos de liturgia IEC Pombal" (culto solene, culto matinal,
 * reunião de oração e reunião de doutrina).
 * Louvores: "Repertório – Grupo de louvor IEC de Pombal/PB" (100 itens; títulos
 * repetidos foram unidos, com o segundo link guardado nas observações).
 * Salmos e Hinos: números informados pelo ministério de louvor.
 *
 * Equipe do louvor, oficiais, dias e horários: informados pelo ministério de
 * louvor (out/2026). O grupo canta e conduz a igreja à adoração; não há a
 * função de "ministro de louvor".
 *
 * As ETIQUETAS (trinitário, cristocêntrico, doutrinário e temas) são uma
 * primeira sugestão para revisar com o pastor na aba Repertório.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.EscalaDados = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const funcoes = [
    { id: "vocal", nome: "Vocal" },
    { id: "violao", nome: "Violão" },
    { id: "guitarra", nome: "Guitarra" },
    { id: "teclado", nome: "Teclado" },
    { id: "baixo", nome: "Contrabaixo" },
    { id: "bateria", nome: "Bateria" },
  ];

  const tags = [
    { id: "trinitario", nome: "Trinitário" },
    { id: "cristocentrico", nome: "Cristocêntrico" },
    { id: "doutrinario", nome: "Doutrinário" },
    { id: "adoracao", nome: "Adoração" },
    { id: "confissao", nome: "Confissão" },
    { id: "gratidao", nome: "Gratidão" },
    { id: "consagracao", nome: "Consagração" },
    { id: "cruz", nome: "Cruz e redenção" },
    { id: "ressurreicao", nome: "Ressurreição" },
    { id: "espirito", nome: "Espírito Santo" },
    { id: "palavra", nome: "Palavra" },
    { id: "graca", nome: "Graça" },
    { id: "esperanca", nome: "Esperança" },
    { id: "oracao", nome: "Oração" },
    { id: "ceia", nome: "Santa Ceia" },
    { id: "batismo", nome: "Batismo" },
    { id: "missoes", nome: "Missões" },
    { id: "comunhao", nome: "Comunhão" },
    { id: "natal", nome: "Natal" },
  ];

  const regras = {
    // Orientação pastoral: nos cultos de domingo (solenes), salmos e hinos
    // trinitários e louvores cristocêntricos de forte conteúdo doutrinário.
    soleneTagsHinario: ["trinitario"],
    soleneTagsLouvor: ["cristocentrico", "doutrinario"],
    intervaloMusicaSemanas: 3,
    permitirAcumular: false,
  };

  const SH = ["salmo", "hino"];
  const LOUVOR = ["louvor"];
  const DIRIGENTES = ["Presbítero", "Diácono"];
  const item = (id, titulo, tipo, extra) => Object.assign({ id, titulo, tipo, texto: "", notaPadrao: "" }, extra);
  const musica = (id, titulo, tipos, qtd, texto) => item(id, titulo, "musica", { tipos, tags: [], qtd, texto: texto || "" });
  const texto = (id, titulo, t, nota) => item(id, titulo, "texto", { texto: t || "", notaPadrao: nota || "" });

  const liturgias = [
    {
      id: "lit-solene",
      nome: "Culto solene",
      solene: true,
      itens: [
        item("s01", "Chamada à adoração", "oficial", { cargos: DIRIGENTES, qtd: 1, texto: "Dirigente do culto · em pé" }),
        musica("s02", "Cântico", SH, 1, "Em pé"),
        texto("s03", "Oração de invocação", "Dirigente · em pé"),
        texto("s04", "Confissão de pecado", "Dirigente · em pé", "Êxodo 20.1–17, leitura participativa"),
        texto("s05", "Oração de confissão", "Dirigente · em pé"),
        musica("s06", "Cânticos", LOUVOR, 2, "Grupo de louvor"),
        musica("s07", "Dízimos e ofertas", LOUVOR, 1, "Dirigente · 1 louvor durante a contribuição"),
        texto("s08", "Oração de consagração das ofertas", "Dirigente"),
        texto("s09", "Oração pelas crianças", "Dirigente"),
        texto("s10", "Pregação", "Pastor"),
        texto("s11", "Oração de agradecimento"),
        texto("s12", "Bênção apostólica"),
        texto("s13", "Avisos"),
        texto("s14", "Apresentação de visitantes"),
      ],
    },
    {
      id: "lit-matinal",
      nome: "Culto matinal",
      solene: true,
      itens: [
        item("m01", "Chamada à adoração", "oficial", { cargos: DIRIGENTES, qtd: 1, texto: "Dirigente do culto · em pé" }),
        musica("m02", "Cântico", SH, 1, "Em pé"),
        texto("m03", "Oração de invocação", "Dirigente · em pé"),
        texto("m04", "Confissão de pecado", "Dirigente · em pé", "Êxodo 20.1–17"),
        texto("m05", "Oração de confissão", "Dirigente · em pé"),
        musica("m06", "Cânticos", LOUVOR, 2, "Grupo de louvor · sentados"),
        musica("m07", "Dízimos e ofertas", LOUVOR, 1, "Dirigente · 1 louvor durante a contribuição · sentados"),
        texto("m08", "Oração de consagração das ofertas e pelas crianças", "Dirigente · sentados"),
        texto("m09", "Oração de agradecimento"),
        texto("m10", "Bênção apostólica"),
        texto("m11", "Escola Bíblica Dominical (EBD)"),
      ],
    },
    {
      id: "lit-oracao",
      nome: "Reunião de oração",
      solene: false,
      itens: [
        texto("o01", "Leitura de um salmo", "Pode ser relacionado à oração"),
        texto("o02", "Oração"),
        musica("o03", "Cânticos", SH, 2),
        texto("o04", "Momento de oração com pedidos do povo", "Uma pessoa ora pelos pedidos do povo; uma, por avivamento e conversões; uma, pela liderança da igreja e pelas congregações"),
        musica("o05", "Cânticos", LOUVOR, 2),
        texto("o06", "Momento de oração", "20 minutos de joelhos"),
        texto("o07", "Reflexão bíblica", "15 a 20 minutos"),
        texto("o08", "Encerramento com oração"),
      ],
    },
    {
      id: "lit-doutrina",
      nome: "Reunião de doutrina",
      solene: false,
      itens: [
        texto("d01", "Leitura bíblica", "Pode ser um salmo"),
        texto("d02", "Oração"),
        musica("d03", "Cânticos", SH, 2),
        texto("d04", "Leitura de um texto doutrinário"),
        musica("d05", "Cânticos", LOUVOR, 2),
        texto("d06", "Estudo da Escritura"),
      ],
    },
  ];

  // Composição da equipe: ainda não informada; ajuste na aba "Cultos e regras".
  const equipeDomingo = [
    { funcao: "vocal", qtd: 3 },
    { funcao: "violao", qtd: 1 },
    { funcao: "guitarra", qtd: 1 },
    { funcao: "teclado", qtd: 1 },
    { funcao: "baixo", qtd: 1 },
    { funcao: "bateria", qtd: 1 },
  ];
  const equipeSemana = [
    { funcao: "vocal", qtd: 2 },
    { funcao: "violao", qtd: 1 },
  ];

  const cultos = [
    { id: "dom-manha", nome: "Culto matinal e EBD", diaSemana: 0, hora: "09:00", semanas: [], liturgiaId: "lit-matinal", solene: true, ativo: true, equipe: equipeDomingo },
    { id: "dom-noite", nome: "Culto solene", diaSemana: 0, hora: "18:00", semanas: [], liturgiaId: "lit-solene", solene: true, ativo: true, equipe: equipeDomingo },
    { id: "ter-oracao", nome: "Culto de oração", diaSemana: 2, hora: "19:30", semanas: [], liturgiaId: "lit-oracao", solene: false, ativo: true, equipe: equipeSemana },
    { id: "qui-doutrina", nome: "Culto de doutrina (estudo bíblico)", diaSemana: 4, hora: "19:30", semanas: [], liturgiaId: "lit-doutrina", solene: false, ativo: true, equipe: equipeSemana },
  ];

  /* ------------------------------------------------------- repertório */

  const L = (n, titulo, link, ts, autor, obs) => ({
    id: `lv${n}`, tipo: "louvor", numero: "", titulo, autor: autor || "", link, tags: ts ? ts.split(" ") : [], tom: "", ativo: true, obs: obs || "", ultimaVez: "",
  });
  const H = (id, numero, titulo, ts, ultimaVez, obs) => ({
    id, tipo: "hino", numero, titulo, autor: "", link: "", tags: ts.split(" "), tom: "", ativo: true, obs: obs || "", ultimaVez: ultimaVez || "",
  });

  const salmosEHinos = [
    H("sh29", "29", "", "trinitario", "2026-10-18", "Cantado no domingo 18/10."),
    H("sh30", "30", "", "trinitario"),
    H("sh31", "31", "", "trinitario"),
    H("sh245", "245", "", "trinitario"),
    H("sh247", "247", "", "trinitario"),
    H("sh-abraao", "", "Ao Deus de Abraão", "trinitario adoracao", "", "Número no hinário a confirmar."),
  ];

  const louvores = [
    L(1, "Nosso Deus é soberano", "https://youtu.be/SacFg6uq_EE", "doutrinario adoracao", ""),
    L(2, "Grande é o Senhor", "https://youtu.be/Eu6pr3N-UXE", "adoracao", ""),
    L(3, "Maravilhosa Graça", "https://youtu.be/XjZQHVjJO8E", "graca cristocentrico doutrinario", ""),
    L(4, "Quebrantado", "https://youtu.be/QbnmpJo3DiI", "confissao consagracao", ""),
    L(5, "Quem nos separará?", "https://youtu.be/tDeDQFNoDnk", "cristocentrico doutrinario esperanca", ""),
    L(6, "Aclame ao Senhor", "https://youtu.be/G1Lkk-3Mcns", "adoracao cristocentrico", ""),
    L(7, "Digno é o Senhor", "https://youtu.be/stKPXkcW5v8", "adoracao", ""),
    L(8, "O Espírito de Deus está aqui", "https://youtu.be/7ivOU0qJUbQ", "espirito", ""),
    L(9, "Seja engrandecido", "https://youtu.be/34qRF15Z87o", "adoracao", ""),
    L(10, "Santidade", "https://youtu.be/ouFh7zKwgAU", "consagracao", ""),
    L(11, "Alto Preço", "https://youtu.be/4MFsMX0Hf-g", "cruz cristocentrico doutrinario", "", "Outra versão (nº 40 da lista): https://youtu.be/ZAGX5eFXEdA"),
    L(12, "Isaías 53", "https://youtu.be/yTkby6Vgfms", "cruz cristocentrico doutrinario", ""),
    L(13, "Conta as bênçãos", "https://youtu.be/wWcmdZLw-yY", "gratidao", ""),
    L(14, "Vinho e pão", "https://youtu.be/s0bCgdBk_AA", "ceia cruz cristocentrico doutrinario", ""),
    L(15, "É o teu povo", "https://youtu.be/jnNA0_cbvzY", "adoracao comunhao", ""),
    L(16, "Autor da minha fé", "https://youtu.be/IKxsj5Hp4jA", "cristocentrico doutrinario", ""),
    L(17, "A Ele a Glória", "https://youtu.be/Q_MerFW9qA4", "adoracao doutrinario", ""),
    L(18, "Vim para adorar-te", "https://youtu.be/ACX1VtGoeg8", "adoracao cristocentrico doutrinario cruz", ""),
    L(19, "Castelo Forte", "https://youtu.be/OE0ScEm4Y98", "trinitario cristocentrico doutrinario palavra", ""),
    L(20, "Ao único", "https://youtu.be/s1hbYcRFw-s", "adoracao", "", "Outra versão (nº 73 da lista): https://youtu.be/tRcTodrN3_k"),
    L(21, "Efésios 1", "https://youtu.be/6UFnLQJ-Z1Q", "trinitario cristocentrico doutrinario graca", "", "Outra versão (nº 90 da lista): https://youtu.be/_vk_GATcUu0"),
    L(22, "Oração", "https://youtu.be/oJl25jy0d8U", "oracao", ""),
    L(23, "Ele é exaltado", "https://youtu.be/22c5Flzd8Iw", "adoracao", ""),
    L(24, "Oh quão lindo esse nome é", "https://youtu.be/mTPgy4VuXyo", "cristocentrico doutrinario ressurreicao", ""),
    L(25, "Nada além do sangue", "https://youtu.be/tGmA8WR_IIk", "cruz cristocentrico doutrinario", ""),
    L(26, "Eu vou construir", "https://youtu.be/1htnqzaKLP8", "consagracao", ""),
    L(27, "Reina hoje", "https://youtu.be/segFk6SoCCY", "adoracao", ""),
    L(28, "Ele continua sendo bom", "https://youtu.be/LQPYaPNGa38", "gratidao", ""),
    L(29, "Essência da Adoração", "https://youtu.be/3BA3RNjMSos", "consagracao adoracao", ""),
    L(30, "Não tenha sobre Ti", "https://youtu.be/v0vbOLiKGTI", "esperanca", "", "Outra versão (nº 100 da lista): https://youtu.be/i4ZnoJZFJ1k"),
    L(31, "Preciso de Ti", "https://youtu.be/Hy6QJ6LJW2I", "oracao consagracao", ""),
    L(32, "Senhor te quero", "https://youtu.be/JMV-K0d1QYQ", "consagracao", "", "Outra versão (nº 87 da lista): https://youtu.be/59wAeEz3iYQ"),
    L(33, "Sonda-me, usa-me", "https://youtu.be/cL19_5aZUQI", "consagracao confissao", ""),
    L(34, "Teus altares", "https://youtu.be/-YsdPQtjkuo", "consagracao", ""),
    L(35, "Tu és soberano", "https://youtu.be/5PbLOsbuqE8", "adoracao doutrinario", ""),
    L(36, "Bondoso amigo", "https://youtu.be/rAz_hrOFFp4", "cristocentrico oracao", "", "No PDF, o link é o mesmo de \"Santo pra sempre\": confira."),
    L(37, "Santo pra sempre", "https://youtu.be/rAz_hrOFFp4", "adoracao", "", "No PDF, o link é o mesmo de \"Bondoso amigo\": confira."),
    L(38, "Santo Espírito", "https://youtu.be/sIbzTuT3syQ", "espirito", ""),
    L(39, "Bondade de Deus", "https://youtu.be/esodHzEXUrE", "gratidao", ""),
    L(41, "Somente Cristo", "https://youtu.be/7sX_vqk8VeE", "cristocentrico doutrinario graca", ""),
    L(42, "A boa parte", "https://youtu.be/dlGOiuxSzVw", "consagracao", ""),
    L(43, "É Ele", "https://youtu.be/L3b2gRB7YVc", "", ""),
    L(44, "O amor de Deus", "https://youtu.be/t3uT_xGD4T0", "graca", ""),
    L(45, "Eu te louvarei, meu bom Jesus", "https://youtu.be/_xVuItEPVQE", "cristocentrico adoracao", ""),
    L(46, "Alvo mais que a neve", "https://youtu.be/JCLWNBjTVfQ", "confissao cruz", ""),
    L(47, "Quero louvar-te", "https://youtu.be/K9QW3myzLAY", "adoracao", ""),
    L(48, "Porque Ele vive", "https://youtu.be/3o1suXgQYfE", "cristocentrico doutrinario ressurreicao esperanca", ""),
    L(49, "Tu és", "https://youtu.be/YXnQ02HYB1w", "adoracao", ""),
    L(50, "Eu me rendo", "https://youtu.be/P4Wk2PkEWqM", "consagracao", ""),
    L(51, "De todas as tribos", "https://youtu.be/U94w-ZR0OfA", "cristocentrico doutrinario missoes", ""),
    L(52, "Oferta de amor", "https://youtu.be/37NTtPilj0A", "consagracao", ""),
    L(53, "Tu és fiel, Senhor", "https://youtu.be/tDyVw3vqFNg", "gratidao doutrinario", ""),
    L(54, "Cantarei teu amor para sempre", "https://youtu.be/3JUS_ueGjnA", "gratidao", ""),
    L(55, "Jesus, em Tua presença", "https://youtu.be/epIkebY66mA", "cristocentrico adoracao", ""),
    L(56, "Colossenses 1", "https://youtu.be/gk7XWCMwO94", "cristocentrico doutrinario", ""),
    L(57, "Brilho Celeste", "https://youtu.be/s_VoYseqBoc", "adoracao", ""),
    L(58, "Pra sempre", "https://youtu.be/AXStg--5v_s", "cristocentrico doutrinario ressurreicao", ""),
    L(59, "Rei das Nações", "https://youtu.be/hJ2WXJvmUHg", "adoracao cristocentrico", ""),
    L(60, "Estrela da Manhã", "https://youtu.be/TEZTU_yvpjc", "adoracao cristocentrico", ""),
    L(61, "Consagração", "https://youtu.be/9WklxuZ6UKQ", "consagracao", ""),
    L(62, "Espírito, enche a minha vida", "https://youtu.be/SGYtOc9EeRI", "espirito", ""),
    L(63, "Entrega", "https://youtu.be/z1vnYfxqIZ8", "consagracao", ""),
    L(64, "Digno de Glória", "https://youtu.be/G42EangP43A", "adoracao", ""),
    L(65, "Diante da Cruz", "https://youtu.be/Uo_0wr_iXJg", "cruz cristocentrico doutrinario", ""),
    L(66, "Deus forte", "https://youtu.be/Raerz_GTr4E", "adoracao", ""),
    L(67, "Coração igual ao Teu", "https://youtu.be/4AOcImUAOfk", "consagracao", ""),
    L(68, "Calmo, sereno e tranquilo", "https://youtu.be/-RSRH5wO-vU", "esperanca", ""),
    L(69, "Não há Deus maior", "https://youtu.be/nTaoumovXDM", "adoracao", ""),
    L(70, "Teu amor não falha", "https://youtu.be/3q-pRKf-VaQ", "esperanca", ""),
    L(71, "Meu respirar", "https://youtu.be/oyZ3-sCb2xY", "consagracao", ""),
    L(72, "Meu prazer", "https://youtu.be/YBJHkUP_fbs", "adoracao", ""),
    L(75, "Tua obra em nós", "https://youtu.be/bPiMH3Mh1ao", "graca", ""),
    L(76, "Bem mais que tudo", "https://youtu.be/tG0ZM8xqAhg", "consagracao", ""),
    L(77, "Recomeçar", "https://youtu.be/-liljRfI-UQ", "graca", ""),
    L(78, "O poder do teu amor", "https://youtu.be/mef3E1cuurg", "graca", ""),
    L(79, "Vou te alegrar", "https://youtu.be/yvzCrVBZvpE", "adoracao", ""),
    L(80, "Poder para salvar", "https://youtu.be/PIXxFpNK16Q", "cristocentrico doutrinario cruz ressurreicao", ""),
    L(81, "Te adorar é o meu prazer", "https://youtu.be/ef-ADl6_PsY", "adoracao", ""),
    L(82, "Rendido estou", "https://youtu.be/iXTCIBAHq7Q", "consagracao", "Aline Barros"),
    L(83, "Para sempre te adorarei", "https://youtu.be/5duPun4bYBA", "adoracao", ""),
    L(84, "Quem sou eu", "https://youtu.be/LFASRxvhg1k", "graca", ""),
    L(85, "Maravilhoso", "https://youtu.be/0MYXrpczA_w", "adoracao", ""),
    L(86, "Abra os olhos do meu coração", "https://youtu.be/OdPk0Jt9Txk", "oracao", ""),
    L(88, "Filho do Deus vivo", "https://youtu.be/PdJoTcOgwUA", "cristocentrico doutrinario", ""),
    L(89, "Vem, esta é a hora", "https://youtu.be/gApxDG3C8AU", "adoracao", ""),
    L(91, "Redenção", "https://youtu.be/tXxRZ1SlpDY", "cruz cristocentrico doutrinario", ""),
    L(92, "Canção aos filipenses", "https://youtu.be/KhVSYlfiL84", "cristocentrico doutrinario", ""),
    L(93, "Reina em mim", "https://youtu.be/bpabvrhSJ6Y", "consagracao", ""),
    L(94, "Vou seguir com fé", "https://youtu.be/kThZpQdeX0E", "esperanca", ""),
    L(95, "Aos pés da cruz", "https://youtu.be/GW3gAF1KPB4", "cruz cristocentrico", ""),
    L(97, "Muito mais de Deus", "https://youtu.be/_eDkivW08W4", "consagracao", ""),
    L(98, "Louvemos ao Senhor", "https://youtu.be/H9W7YMNCXsM", "adoracao", ""),
    L(99, "Livre acesso", "https://youtu.be/-rKr_xS32Q0", "cristocentrico doutrinario graca", ""),
  ];

  /* ------------------------------------------------- equipe e oficiais */

  // `funcoes`: o que a pessoa faz de fato; `apoio`: só quando falta quem faça.
  const pessoa = (id, nome, funcoes, apoio, obs) => ({ id, nome, funcoes, apoio: apoio || [], cultos: [], indisponivel: [], ativo: true, obs: obs || "" });
  const pessoas = [
    pessoa("jeferson", "Jeferson", ["guitarra", "baixo", "violao"], ["vocal"], "Às vezes apoia cantando; não é cantor oficial."),
    pessoa("valdeci", "Valdeci Junior", ["teclado"]),
    pessoa("tulio", "Tulio", ["guitarra", "violao"], ["bateria", "vocal"], "Bateria só como apoio; às vezes apoia no vocal."),
    pessoa("kaio", "Kaio", ["baixo"], ["violao", "vocal"], "Às vezes violão; apoia no vocal, nunca como principal."),
    pessoa("leonar", "Leonar", ["bateria"], [], "Também é presbítero."),
    pessoa("natan", "Natan", ["violao"]),
    pessoa("germano", "Germano", ["vocal"]),
    pessoa("leticia", "Letícia", ["vocal"]),
    pessoa("damares", "Dâmares", ["vocal"]),
    pessoa("suenia", "Suênia", ["vocal"]),
    pessoa("joacema", "Joacema", ["vocal"]),
    pessoa("jerlandia", "Jerlandia", ["vocal"]),
    pessoa("alexandre", "Alexandre", ["vocal"]),
  ];

  const oficial = (id, nome, cargo, extra) => Object.assign({ id, nome, cargo, indisponivel: [], ativo: true, obs: "", pessoaId: "" }, extra);
  const oficiais = [
    oficial("felipe", "Felipe Oliveira", "Pastor"),
    oficial("ariostenes", "Ariostenes", "Presbítero"),
    oficial("rodrigo", "Rodrigo", "Presbítero"),
    oficial("leonar-pb", "Leonar", "Presbítero", { pessoaId: "leonar", obs: "Também toca bateria no louvor." }),
    oficial("inacio", "Inácio Marinho", "Presbítero", { ativo: false, obs: "Sem condições de servir por problemas de saúde." }),
    oficial("marcos-sergio", "Marcos Sergio", "Presbítero"),
    oficial("jose-carlos", "José Carlos", "Diácono"),
    oficial("marcos", "Marcos", "Diácono"),
    oficial("eliezer", "Eliezer", "Diácono"),
  ];

  function configuracaoBase() {
    return JSON.parse(JSON.stringify({ versao: 1, igreja: { nome: "IEC Pombal" }, funcoes, tags, regras, liturgias, cultos }));
  }

  function repertorio() {
    return JSON.parse(JSON.stringify(salmosEHinos.concat(louvores)));
  }

  /** Configuração, repertório, equipe e oficiais da igreja. */
  function estadoInicial() {
    return Object.assign(configuracaoBase(), {
      exemplo: false,
      pessoas: JSON.parse(JSON.stringify(pessoas)),
      oficiais: JSON.parse(JSON.stringify(oficiais)),
      musicas: repertorio(),
      escalas: [],
    });
  }

  return { configuracaoBase, repertorio, estadoInicial };
});
