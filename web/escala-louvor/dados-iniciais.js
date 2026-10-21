/*
 * Dados iniciais da Escala do Louvor — IEC Pombal.
 *
 * Louvores: "Repertório – Grupo de louvor IEC de Pombal/PB" (100 itens; títulos
 * repetidos foram unidos, com o segundo link guardado nas observações).
 * Salmos e Hinos: números informados pelo ministério de louvor e a seção
 * "Trindade" do hinário (nº 29 a 35, 228 e 245), conforme hinologia.org.
 * Equipe, dias e horários: informados pelo ministério de louvor (out/2026). O
 * grupo canta e conduz a igreja à adoração; a liturgia fica com o pastor.
 * Quantidade de músicas por culto: tirada dos "Modelos de liturgia IEC Pombal".
 *
 * As ETIQUETAS (trinitário, cristocêntrico, doutrinário e temas) são uma
 * primeira sugestão para revisar com o pastor na aba Músicas.
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
    // Disponibilidade: quem não respondeu ainda pode ser escalado (depois de quem confirmou).
    soQuemRespondeu: false,
  };

  // Composição da equipe: sugestão inicial; ajuste em Ajustes › Cultos.
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
    { id: "dom-manha", nome: "Culto matinal e EBD", diaSemana: 0, hora: "09:00", semanas: [], solene: true, ativo: true, equipe: equipeDomingo, musicas: { hino: 1, louvor: 3 } },
    // Mesmo grupo e mesmas músicas do culto da manhã; muda só a ordem, se preciso.
    { id: "dom-noite", nome: "Culto solene", diaSemana: 0, hora: "18:00", semanas: [], solene: true, ativo: true, equipe: equipeDomingo, musicas: { hino: 1, louvor: 3 }, acompanha: "dom-manha" },
    { id: "ter-oracao", nome: "Culto de oração", diaSemana: 2, hora: "19:30", semanas: [], solene: false, ativo: true, equipe: equipeSemana, musicas: { hino: 2, louvor: 2 } },
    { id: "qui-doutrina", nome: "Culto de doutrina (estudo bíblico)", diaSemana: 4, hora: "19:30", semanas: [], solene: false, ativo: true, equipe: equipeSemana, musicas: { hino: 2, louvor: 2 } },
  ];

  /* ------------------------------------------------------- repertório */

  const L = (n, titulo, link, ts, autor, obs) => ({
    id: `lv${n}`, tipo: "louvor", numero: "", titulo, autor: autor || "", link, tags: ts ? ts.split(" ") : [], tom: "", ativo: true, obs: obs || "", ultimaVez: "",
  });
  const H = (id, numero, titulo, ts, ultimaVez, obs) => ({
    id, tipo: "hino", numero, titulo, autor: "", link: "", tags: ts.split(" "), tom: "", ativo: true, obs: obs || "", ultimaVez: ultimaVez || "",
  });

  // Seção "Trindade" do hinário Salmos e Hinos (nº 29 a 35) e outros dois hinos à Trindade,
  // conforme o índice publicado em hinologia.org. Confira os títulos no hinário da igreja.
  const FONTE = "Seção Trindade do Salmos e Hinos (índice do hinologia.org).";
  const salmosEHinos = [
    H("sh29", "29", "Invocação", "trinitario adoracao", "2026-10-18", `${FONTE} Cantado no domingo 18/10.`),
    H("sh30", "30", "Vem, ó Todo-Poderoso!", "trinitario adoracao", "", FONTE),
    H("sh31", "31", "Adoração à Trindade", "trinitario adoracao", "", FONTE),
    H("sh32", "32", "Aleluia ao Deus triúno", "trinitario adoracao", "", FONTE),
    H("sh33", "33", "Invocação e Louvor", "trinitario adoracao", "", FONTE),
    H("sh34", "34", "Santíssima Trindade", "trinitario adoracao", "", FONTE),
    H("sh35", "35", "Glória à Trindade", "trinitario adoracao", "", FONTE),
    H("sh228", "228", "Louvor à Trindade", "trinitario adoracao", "", "Índice do hinologia.org."),
    H("sh245", "245", "Culto à Trindade", "trinitario adoracao", "", "Índice do hinologia.org."),
    H("sh247", "247", "", "trinitario", "", "Usado no modelo de liturgia do culto solene. Título a confirmar."),
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

  /* ----------------------------------------------------------- equipe */

  // `funcoes`: o que a pessoa faz de fato; `apoio`: só quando falta quem faça.
  const pessoa = (id, nome, funcoes, apoio, obs) => ({ id, nome, funcoes, apoio: apoio || [], cultos: [], indisponivel: [], ativo: true, obs: obs || "" });
  const pessoas = [
    pessoa("jeferson", "Jeferson", ["guitarra", "baixo", "violao"], ["vocal"], "Às vezes apoia cantando; não é cantor oficial."),
    pessoa("valdeci", "Valdeci Junior", ["teclado"]),
    pessoa("tulio", "Tulio", ["guitarra", "violao"], ["bateria", "vocal"], "Bateria só como apoio; às vezes apoia no vocal."),
    pessoa("kaio", "Kaio", ["baixo"], ["violao", "vocal"], "Às vezes violão; apoia no vocal, nunca como principal."),
    pessoa("leonar", "Leonar", ["bateria"]),
    pessoa("natan", "Natan", ["violao"]),
    pessoa("germano", "Germano", ["vocal"]),
    pessoa("leticia", "Letícia", ["vocal"]),
    pessoa("damares", "Dâmares", ["vocal"]),
    pessoa("suenia", "Suênia", ["vocal"]),
    pessoa("joacema", "Joacema", ["vocal"]),
    pessoa("jerlandia", "Jerlandia", ["vocal"]),
    pessoa("alexandre", "Alexandre", ["vocal"]),
  ];

  function configuracaoBase() {
    return JSON.parse(JSON.stringify({ versao: 3, igreja: { nome: "IEC Pombal", link: "https://escalas.igrejacongregacionalpombal.com.br" }, funcoes, tags, regras, cultos }));
  }

  function repertorio() {
    return JSON.parse(JSON.stringify(salmosEHinos.concat(louvores)));
  }

  /** Configuração, repertório e equipe da igreja. */
  function estadoInicial() {
    return Object.assign(configuracaoBase(), {
      pessoas: JSON.parse(JSON.stringify(pessoas)),
      musicas: repertorio(),
      escalas: [],
      respostas: [],
    });
  }

  return { configuracaoBase, repertorio, estadoInicial };
});
