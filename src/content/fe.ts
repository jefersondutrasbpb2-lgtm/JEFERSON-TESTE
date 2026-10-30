/**
 * Conteúdos de identidade e fé.
 * Textos introdutórios e acessíveis. A confissão de fé e a filiação à Aliança
 * foram confirmadas pela liderança; o estatuto ainda não foi enviado.
 */

export type Scripture = { text: string; ref: string; version: string; pending?: boolean };

/** Sugestões de textos bíblicos — a seleção final cabe à liderança. */
export const scriptures = {
  fundamento: {
    text: "Porque ninguém pode lançar outro fundamento, além do que foi posto, o qual é Jesus Cristo.",
    ref: "1 Coríntios 3.11",
    version: "ARA",
    pending: true,
  },
  gloria: {
    text: "Porque dele, e por meio dele, e para ele são todas as coisas. A ele, pois, a glória eternamente. Amém.",
    ref: "Romanos 11.36",
    version: "ARA",
    pending: true,
  },
} satisfies Record<string, Scripture>;

export const solas = [
  {
    latin: "Sola Scriptura",
    pt: "Somente a Escritura",
    text: "A Bíblia é a Palavra de Deus e a regra suprema de fé e prática para a igreja.",
    ref: "2 Timóteo 3.16–17",
  },
  {
    latin: "Solus Christus",
    pt: "Somente Cristo",
    text: "Jesus Cristo é o único mediador entre Deus e os homens, centro da pregação e da adoração.",
    ref: "1 Timóteo 2.5",
  },
  {
    latin: "Sola Gratia",
    pt: "Somente a graça",
    text: "A salvação é dom imerecido de Deus, e não resultado de mérito humano.",
    ref: "Efésios 2.8–9",
  },
  {
    latin: "Sola Fide",
    pt: "Somente a fé",
    text: "Somos justificados diante de Deus mediante a fé em Cristo.",
    ref: "Romanos 5.1",
  },
  {
    latin: "Soli Deo Gloria",
    pt: "Glória somente a Deus",
    text: "Toda a vida — o culto, o trabalho e o serviço — existe para a glória de Deus.",
    ref: "Romanos 11.36",
  },
];

export const pillars = [
  {
    title: "Centralidade das Escrituras",
    text: "A leitura, a pregação e o estudo da Bíblia ocupam o centro da vida da igreja e orientam suas decisões.",
  },
  {
    title: "O Evangelho de Jesus Cristo",
    text: "Anunciamos Cristo crucificado e ressurreto, por meio de quem Deus reconcilia pecadores consigo.",
  },
  {
    title: "Salvação pela graça mediante a fé",
    text: "Recebemos a salvação como dom de Deus, não por obras, para que ninguém se glorie.",
  },
  {
    title: "Culto e adoração",
    text: "Reunimo-nos para adorar a Deus com reverência e alegria, em oração, cânticos e ministração da Palavra.",
  },
  {
    title: "Comunhão e discipulado",
    text: "Crescemos juntos na fé, cuidando uns dos outros e aprendendo a seguir a Cristo em todas as áreas da vida.",
  },
  {
    title: "Evangelização e missões",
    text: "Desde sua fundação, a igreja leva o Evangelho para além de Pombal — no Sertão, no Seridó e na Amazônia.",
  },
  {
    title: "Serviço cristão",
    text: "A fé se expressa em amor ao próximo, no cuidado com crianças, famílias e comunidades.",
  },
];

export const congregationalNote = {
  title: "A tradição congregacional",
  paragraphs: [
    "O congregacionalismo é uma tradição protestante nascida da Reforma, que valoriza a autoridade das Escrituras, a comunhão dos membros e a participação da congregação local na vida da igreja.",
    "No Brasil, essa tradição remonta ao trabalho missionário do médico escocês Robert Reid Kalley, iniciado em 1855 no Rio de Janeiro.",
    "A Igreja Evangélica Congregacional de Pombal é filiada à Aliança das Igrejas Evangélicas Congregacionais do Brasil.",
  ],
};

/** Confissão de fé adotada pela igreja (texto e imagem enviados pela liderança). */
export const confession = {
  title: "Confissão de Fé Congregacional",
  subtitle: "Declaração de Fé da Aliança das Igrejas Evangélicas Congregacionais do Brasil",
  publisher: "Editora AGEP",
  availability: "Edição impressa, vendida pela Aliança.",
  image: { src: "/images/confissao-de-fe-congregacional.webp", width: 900, height: 1163 },
  paragraphs: [
    "A história do Cristianismo é testemunho vivo de que os cristãos, desde cedo, confessaram e publicaram suas crenças por meio de declarações de fé. Quando surgiram os problemas doutrinários, as definições teológicas a respeito de Deus, de Cristo e de outras doutrinas da fé cristã exigiram muita reflexão. Em resposta, a Igreja convocou concílios, estudou os temas controversos e elaborou seus credos.",
    "Com o advento do Protestantismo vieram as suas primeiras expressões de fé, numa caminhada que culmina no Congregacionalismo. Essa história mostra que nem a fé cristã em geral, nem os congregacionais em particular, são avessos a confissões: expressar as crenças em documentos é parte inerente da história do Cristianismo e do Congregacionalismo.",
    "Fiel a essa herança e filiada à Aliança das Igrejas Evangélicas Congregacionais do Brasil, a Igreja Evangélica Congregacional de Pombal tem como sua confissão de fé a Confissão de Fé Congregacional, a Declaração de Fé da Aliança.",
  ],
};
