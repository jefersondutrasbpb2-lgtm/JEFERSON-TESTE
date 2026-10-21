/**
 * Conteúdos de identidade e fé.
 * Textos introdutórios e acessíveis. Documentos confessionais, estatuto
 * e posições doutrinárias detalhadas devem vir da liderança da igreja.
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
  ],
  disclaimer:
    "Vínculos denominacionais, documentos confessionais e estatuto da igreja serão apresentados nesta página conforme orientação oficial da liderança.",
};
