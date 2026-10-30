/**
 * Conteúdos de identidade e fé.
 * Textos introdutórios e acessíveis. A confissão de fé e a filiação à Aliança
 * foram confirmadas pela liderança; o estatuto ainda não foi enviado.
 */

import type { L10n } from "@/i18n/config";

export type Scripture = { text: L10n; ref: L10n; version: L10n; pending?: boolean };

/**
 * Textos bíblicos aprovados pela liderança.
 * Português: Almeida Revista e Atualizada (ARA); inglês: King James Version
 * (KJV); espanhol: Reina-Valera 1960 (RVR1960).
 */
const versions = { pt: "ARA", en: "KJV", es: "RVR1960" };

export const scriptures = {
  fundamento: {
    text: {
      pt: "Porque ninguém pode lançar outro fundamento, além do que foi posto, o qual é Jesus Cristo.",
      en: "For other foundation can no man lay than that is laid, which is Jesus Christ.",
      es: "Porque nadie puede poner otro fundamento que el que está puesto, el cual es Jesucristo.",
    },
    ref: { pt: "1 Coríntios 3.11", en: "1 Corinthians 3:11", es: "1 Corintios 3:11" },
    version: versions,
  },
  gloria: {
    text: {
      pt: "Porque dele, e por meio dele, e para ele são todas as coisas. A ele, pois, a glória eternamente. Amém.",
      en: "For of him, and through him, and to him, are all things: to whom be glory for ever. Amen.",
      es: "Porque de él, y por él, y para él, son todas las cosas. A él sea la gloria por los siglos. Amén.",
    },
    ref: { pt: "Romanos 11.36", en: "Romans 11:36", es: "Romanos 11:36" },
    version: versions,
  },
  servico: {
    text: {
      pt: "Servi uns aos outros, cada um conforme o dom que recebeu.",
      en: "As every man hath received the gift, even so minister the same one to another.",
      es: "Cada uno según el don que ha recibido, minístrelo a los otros.",
    },
    ref: { pt: "1 Pedro 4.10", en: "1 Peter 4:10", es: "1 Pedro 4:10" },
    version: versions,
  },
} satisfies Record<string, Scripture>;

export const solas: { latin: string; name: L10n; text: L10n; ref: L10n }[] = [
  {
    latin: "Sola Scriptura",
    name: { pt: "Somente a Escritura", en: "Scripture alone", es: "Solo la Escritura" },
    text: {
      pt: "A Bíblia é a Palavra de Deus e a regra suprema de fé e prática para a igreja.",
      en: "The Bible is the Word of God and the supreme rule of faith and practice for the church.",
      es: "La Biblia es la Palabra de Dios y la regla suprema de fe y práctica para la iglesia.",
    },
    ref: { pt: "2 Timóteo 3.16–17", en: "2 Timothy 3:16–17", es: "2 Timoteo 3:16–17" },
  },
  {
    latin: "Solus Christus",
    name: { pt: "Somente Cristo", en: "Christ alone", es: "Solo Cristo" },
    text: {
      pt: "Jesus Cristo é o único mediador entre Deus e os homens, centro da pregação e da adoração.",
      en: "Jesus Christ is the only mediator between God and humanity, the center of our preaching and worship.",
      es: "Jesucristo es el único mediador entre Dios y los hombres, centro de la predicación y de la adoración.",
    },
    ref: { pt: "1 Timóteo 2.5", en: "1 Timothy 2:5", es: "1 Timoteo 2:5" },
  },
  {
    latin: "Sola Gratia",
    name: { pt: "Somente a graça", en: "Grace alone", es: "Solo la gracia" },
    text: {
      pt: "A salvação é dom imerecido de Deus, e não resultado de mérito humano.",
      en: "Salvation is God's undeserved gift, not the result of human merit.",
      es: "La salvación es un don inmerecido de Dios, y no el resultado del mérito humano.",
    },
    ref: { pt: "Efésios 2.8–9", en: "Ephesians 2:8–9", es: "Efesios 2:8–9" },
  },
  {
    latin: "Sola Fide",
    name: { pt: "Somente a fé", en: "Faith alone", es: "Solo la fe" },
    text: {
      pt: "Somos justificados diante de Deus mediante a fé em Cristo.",
      en: "We are justified before God through faith in Christ.",
      es: "Somos justificados delante de Dios mediante la fe en Cristo.",
    },
    ref: { pt: "Romanos 5.1", en: "Romans 5:1", es: "Romanos 5:1" },
  },
  {
    latin: "Soli Deo Gloria",
    name: { pt: "Glória somente a Deus", en: "To God alone be the glory", es: "Solo a Dios la gloria" },
    text: {
      pt: "Toda a vida — o culto, o trabalho e o serviço — existe para a glória de Deus.",
      en: "All of life — worship, work and service — exists for the glory of God.",
      es: "Toda la vida —el culto, el trabajo y el servicio— existe para la gloria de Dios.",
    },
    ref: { pt: "Romanos 11.36", en: "Romans 11:36", es: "Romanos 11:36" },
  },
];

export const pillars: { title: L10n; text: L10n }[] = [
  {
    title: { pt: "Centralidade das Escrituras", en: "The centrality of Scripture", es: "Centralidad de las Escrituras" },
    text: {
      pt: "A leitura, a pregação e o estudo da Bíblia ocupam o centro da vida da igreja e orientam suas decisões.",
      en: "Reading, preaching and studying the Bible stand at the center of church life and guide its decisions.",
      es: "La lectura, la predicación y el estudio de la Biblia ocupan el centro de la vida de la iglesia y orientan sus decisiones.",
    },
  },
  {
    title: { pt: "O Evangelho de Jesus Cristo", en: "The Gospel of Jesus Christ", es: "El Evangelio de Jesucristo" },
    text: {
      pt: "Anunciamos Cristo crucificado e ressurreto, por meio de quem Deus reconcilia pecadores consigo.",
      en: "We proclaim Christ crucified and risen, through whom God reconciles sinners to himself.",
      es: "Anunciamos a Cristo crucificado y resucitado, por medio de quien Dios reconcilia a los pecadores consigo.",
    },
  },
  {
    title: {
      pt: "Salvação pela graça mediante a fé",
      en: "Salvation by grace through faith",
      es: "Salvación por gracia mediante la fe",
    },
    text: {
      pt: "Recebemos a salvação como dom de Deus, não por obras, para que ninguém se glorie.",
      en: "We receive salvation as God's gift, not by works, so that no one may boast.",
      es: "Recibimos la salvación como don de Dios, no por obras, para que nadie se gloríe.",
    },
  },
  {
    title: { pt: "Culto e adoração", en: "Worship", es: "Culto y adoración" },
    text: {
      pt: "Reunimo-nos para adorar a Deus com reverência e alegria, em oração, cânticos e ministração da Palavra.",
      en: "We gather to worship God with reverence and joy, in prayer, song and the ministry of the Word.",
      es: "Nos reunimos para adorar a Dios con reverencia y alegría, en oración, cánticos y ministración de la Palabra.",
    },
  },
  {
    title: { pt: "Comunhão e discipulado", en: "Fellowship and discipleship", es: "Comunión y discipulado" },
    text: {
      pt: "Crescemos juntos na fé, cuidando uns dos outros e aprendendo a seguir a Cristo em todas as áreas da vida.",
      en: "We grow together in faith, caring for one another and learning to follow Christ in every area of life.",
      es: "Crecemos juntos en la fe, cuidándonos unos a otros y aprendiendo a seguir a Cristo en todas las áreas de la vida.",
    },
  },
  {
    title: { pt: "Evangelização e missões", en: "Evangelism and missions", es: "Evangelización y misiones" },
    text: {
      pt: "Desde sua fundação, a igreja leva o Evangelho para além de Pombal — no Sertão, no Seridó e na Amazônia.",
      en: "Since its founding, the church has carried the Gospel beyond Pombal — to the Sertão, the Seridó and the Amazon.",
      es: "Desde su fundación, la iglesia lleva el Evangelio más allá de Pombal: al Sertón, al Seridó y a la Amazonía.",
    },
  },
  {
    title: { pt: "Serviço cristão", en: "Christian service", es: "Servicio cristiano" },
    text: {
      pt: "A fé se expressa em amor ao próximo, no cuidado com crianças, famílias e comunidades.",
      en: "Faith is expressed in love for our neighbor, in caring for children, families and communities.",
      es: "La fe se expresa en el amor al prójimo, en el cuidado de niños, familias y comunidades.",
    },
  },
];

export const congregationalNote: { title: L10n; paragraphs: L10n[] } = {
  title: { pt: "A tradição congregacional", en: "The Congregational tradition", es: "La tradición congregacional" },
  paragraphs: [
    {
      pt: "O congregacionalismo é uma tradição protestante nascida da Reforma, que valoriza a autoridade das Escrituras, a comunhão dos membros e a participação da congregação local na vida da igreja.",
      en: "Congregationalism is a Protestant tradition born of the Reformation that values the authority of Scripture, the fellowship of the members and the participation of the local congregation in the life of the church.",
      es: "El congregacionalismo es una tradición protestante nacida de la Reforma, que valora la autoridad de las Escrituras, la comunión de los miembros y la participación de la congregación local en la vida de la iglesia.",
    },
    {
      pt: "No Brasil, essa tradição remonta ao trabalho missionário do médico escocês Robert Reid Kalley, iniciado em 1855 no Rio de Janeiro.",
      en: "In Brazil, this tradition goes back to the missionary work of the Scottish physician Robert Reid Kalley, begun in 1855 in Rio de Janeiro.",
      es: "En Brasil, esta tradición se remonta a la obra misionera del médico escocés Robert Reid Kalley, iniciada en 1855 en Río de Janeiro.",
    },
    {
      pt: "A Igreja Evangélica Congregacional de Pombal é filiada à Aliança das Igrejas Evangélicas Congregacionais do Brasil.",
      en: "The Congregational Evangelical Church of Pombal is affiliated with the Aliança das Igrejas Evangélicas Congregacionais do Brasil (Alliance of Congregational Evangelical Churches of Brazil).",
      es: "La Iglesia Evangélica Congregacional de Pombal está afiliada a la Aliança das Igrejas Evangélicas Congregacionais do Brasil (Alianza de las Iglesias Evangélicas Congregacionales de Brasil).",
    },
  ],
};

/** Confissão de fé adotada pela igreja (texto e imagem enviados pela liderança). */
export const confession = {
  /** Título oficial do livro (não traduzido) */
  title: "Confissão de Fé Congregacional",
  titleTranslation: {
    pt: "",
    en: "Congregational Confession of Faith",
    es: "Confesión de Fe Congregacional",
  } as L10n,
  subtitle: "Declaração de Fé da Aliança das Igrejas Evangélicas Congregacionais do Brasil",
  publisher: "Editora AGEP",
  availability: {
    pt: "Edição impressa, vendida pela Aliança.",
    en: "Print edition, sold by the Alliance (in Portuguese).",
    es: "Edición impresa, a la venta por la Alianza (en portugués).",
  } as L10n,
  image: { src: "/images/confissao-de-fe-congregacional.webp", width: 900, height: 1163 },
  paragraphs: [
    {
      pt: "A história do Cristianismo é testemunho vivo de que os cristãos, desde cedo, confessaram e publicaram suas crenças por meio de declarações de fé. Quando surgiram os problemas doutrinários, as definições teológicas a respeito de Deus, de Cristo e de outras doutrinas da fé cristã exigiram muita reflexão. Em resposta, a Igreja convocou concílios, estudou os temas controversos e elaborou seus credos.",
      en: "The history of Christianity is living testimony that Christians, from early on, confessed and published their beliefs through declarations of faith. When doctrinal problems arose, theological definitions about God, about Christ and about other doctrines of the Christian faith required much reflection. In response, the Church convened councils, studied the disputed questions and drew up its creeds.",
      es: "La historia del cristianismo es un testimonio vivo de que los cristianos, desde temprano, confesaron y publicaron sus creencias mediante declaraciones de fe. Cuando surgieron los problemas doctrinales, las definiciones teológicas acerca de Dios, de Cristo y de otras doctrinas de la fe cristiana exigieron mucha reflexión. En respuesta, la Iglesia convocó concilios, estudió los temas controvertidos y elaboró sus credos.",
    },
    {
      pt: "Com o advento do Protestantismo vieram as suas primeiras expressões de fé, numa caminhada que culmina no Congregacionalismo. Essa história mostra que nem a fé cristã em geral, nem os congregacionais em particular, são avessos a confissões: expressar as crenças em documentos é parte inerente da história do Cristianismo e do Congregacionalismo.",
      en: "With the rise of Protestantism came its first expressions of faith, in a journey that culminates in Congregationalism. This history shows that neither the Christian faith in general nor Congregationalists in particular are averse to confessions: expressing beliefs in written documents is an inherent part of the history of Christianity and of Congregationalism.",
      es: "Con el advenimiento del protestantismo llegaron sus primeras expresiones de fe, en un camino que culmina en el congregacionalismo. Esa historia muestra que ni la fe cristiana en general, ni los congregacionales en particular, son contrarios a las confesiones: expresar las creencias en documentos es parte inherente de la historia del cristianismo y del congregacionalismo.",
    },
    {
      pt: "Fiel a essa herança e filiada à Aliança das Igrejas Evangélicas Congregacionais do Brasil, a Igreja Evangélica Congregacional de Pombal tem como sua confissão de fé a Confissão de Fé Congregacional, a Declaração de Fé da Aliança.",
      en: "Faithful to this heritage and affiliated with the Aliança das Igrejas Evangélicas Congregacionais do Brasil, the Congregational Evangelical Church of Pombal holds as its confession of faith the Confissão de Fé Congregacional (Congregational Confession of Faith), the Alliance's Declaration of Faith.",
      es: "Fiel a esa herencia y afiliada a la Aliança das Igrejas Evangélicas Congregacionais do Brasil, la Iglesia Evangélica Congregacional de Pombal tiene como su confesión de fe la Confissão de Fé Congregacional (Confesión de Fe Congregacional), la Declaración de Fe de la Alianza.",
    },
  ] as L10n[],
};
