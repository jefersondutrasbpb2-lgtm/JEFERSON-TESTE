/**
 * Campos missionários e trabalhos regionais, com a situação atual
 * confirmada pela igreja.
 */

import type { L10n } from "@/i18n/config";

export type FieldKind = "organizada" | "congregacao" | "rural" | "missionarios" | "social";

export type MissionField = {
  id: string;
  /** Nome do lugar (não traduzido) */
  name: string;
  place: L10n;
  kind: FieldKind;
  /** Chave do ponto no mapa (src/content/geo.generated.ts) */
  point?: "sousa" | "cajazeiras" | "catole" | "condado" | "caico" | "purus" | "pombal" | "paulista";
  map: "regional" | "overview";
  summary: L10n;
  people?: L10n;
  pending?: boolean;
};

export const kindLabel: Record<FieldKind, L10n> = {
  organizada: {
    pt: "Igreja organizada com contribuição da IEC Pombal",
    en: "Church planted with the help of IEC Pombal",
    es: "Iglesia organizada con la contribución de la IEC Pombal",
  },
  congregacao: { pt: "Congregação", en: "Congregation", es: "Congregación" },
  rural: { pt: "Trabalho congregacional rural", en: "Rural congregational work", es: "Obra congregacional rural" },
  missionarios: { pt: "Campo missionário", en: "Mission field", es: "Campo misionero" },
  social: { pt: "Projeto social", en: "Social project", es: "Proyecto social" },
};

const paraiba: L10n = { pt: "Paraíba", en: "Paraíba", es: "Paraíba" };
const plantedSummary: L10n = {
  pt: "Igreja para cuja fundação a IEC Pombal contribuiu; hoje é uma igreja independente.",
  en: "A church IEC Pombal helped to found; today it is an independent church.",
  es: "Iglesia a cuya fundación contribuyó la IEC Pombal; hoy es una iglesia independiente.",
};

export const missionFields: MissionField[] = [
  {
    id: "catole",
    name: "Catolé do Rocha",
    place: paraiba,
    kind: "organizada",
    point: "catole",
    map: "regional",
    summary: plantedSummary,
  },
  {
    id: "sousa",
    name: "Sousa",
    place: paraiba,
    kind: "organizada",
    point: "sousa",
    map: "regional",
    summary: plantedSummary,
  },
  {
    id: "cajazeiras",
    name: "Cajazeiras",
    place: paraiba,
    kind: "organizada",
    point: "cajazeiras",
    map: "regional",
    summary: plantedSummary,
  },
  {
    id: "condado",
    name: "Condado",
    place: paraiba,
    kind: "congregacao",
    point: "condado",
    map: "regional",
    summary: {
      pt: "Congregação com certa autonomia, ainda filiada à IEC Pombal.",
      en: "A congregation with some autonomy, still affiliated with IEC Pombal.",
      es: "Congregación con cierta autonomía, todavía afiliada a la IEC Pombal.",
    },
  },
  {
    id: "rurais",
    name: "Santa Maria, São João e Carvalhadas",
    place: { pt: "Comunidades rurais", en: "Rural communities", es: "Comunidades rurales" },
    kind: "rural",
    point: "pombal",
    map: "regional",
    summary: {
      pt: "Trabalhos congregacionais nas comunidades rurais, levando o ensino da Palavra e a comunhão para perto das famílias do campo.",
      en: "Congregational work in rural communities, bringing the teaching of the Word and Christian fellowship close to farming families.",
      es: "Obra congregacional en las comunidades rurales, que acerca la enseñanza de la Palabra y la comunión a las familias del campo.",
    },
  },
  {
    id: "cedibs-paulista",
    name: "Paulista",
    place: paraiba,
    kind: "social",
    point: "paulista",
    map: "regional",
    summary: {
      pt: "Unidade 02 do CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano, com 110 crianças atendidas.",
      en: "Unit 02 of CEDIBS, the O Bom Samaritano Integral Development Center, serving 110 children.",
      es: "Unidad 02 del CEDIBS, el Centro de Desarrollo Integral O Bom Samaritano, que atiende a 110 niños.",
    },
  },
  {
    id: "purus",
    name: "Rio Purus",
    place: { pt: "Região Amazônica", en: "Amazon region", es: "Región amazónica" },
    kind: "missionarios",
    point: "purus",
    map: "overview",
    people: { pt: "Missionários Eduardo e Donária", en: "Missionaries Eduardo and Donária", es: "Misioneros Eduardo y Donária" },
    summary: {
      pt: "Atuação entre comunidades ribeirinhas do Rio Purus. A posição no mapa é aproximada.",
      en: "Ministry among the riverside communities of the Purus River. The position on the map is approximate.",
      es: "Labor entre las comunidades ribereñas del río Purus. La posición en el mapa es aproximada.",
    },
  },
  {
    id: "caico",
    name: "Caicó",
    place: { pt: "Rio Grande do Norte", en: "Rio Grande do Norte", es: "Rio Grande do Norte" },
    kind: "missionarios",
    point: "caico",
    map: "overview",
    people: { pt: "Missionários Alberto e Istênia", en: "Missionaries Alberto and Istênia", es: "Misioneros Alberto e Istênia" },
    summary: {
      pt: "Trabalho missionário no Seridó potiguar. Caicó já é uma igreja independente e emancipada, e segue entre os campos missionários atuais da IEC Pombal.",
      en: "Mission work in the Seridó region of Rio Grande do Norte. Caicó is now an independent, self-governing church and remains one of IEC Pombal's current mission fields.",
      es: "Obra misionera en el Seridó de Rio Grande do Norte. Caicó ya es una iglesia independiente y emancipada, y sigue entre los campos misioneros actuales de la IEC Pombal.",
    },
  },
];

export type CedibsUnit = {
  id: string;
  label: L10n;
  city: string;
  served: number;
  servedLabel: L10n;
  volunteers: number;
  note?: L10n;
};

export const bomSamaritano = {
  name: "O Bom Samaritano",
  /** Nome oficial (não traduzido) e tradução livre para as versões em inglês e espanhol */
  entity: "CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano",
  entityTranslation: {
    pt: "",
    en: "O Bom Samaritano (The Good Samaritan) Integral Development Center",
    es: "Centro de Desarrollo Integral O Bom Samaritano (El Buen Samaritano)",
  } as L10n,
  short: "CEDIBS",
  instagram: "obom.samaritano",
  place: { pt: "Pombal e Paulista — PB", en: "Pombal and Paulista, Paraíba", es: "Pombal y Paulista, Paraíba" } as L10n,
  summary: {
    pt: "Projeto social abrigado e apoiado pela igreja, dedicado ao desenvolvimento integral de crianças, adolescentes e jovens e ao cuidado de suas famílias.",
    en: "A social project hosted and supported by the church, devoted to the integral development of children, teenagers and young people and to the care of their families.",
    es: "Proyecto social acogido y apoyado por la iglesia, dedicado al desarrollo integral de niños, adolescentes y jóvenes y al cuidado de sus familias.",
  } as L10n,
  /** Atividades do projeto (descrição confirmada pela igreja). */
  activities: {
    pt: "O CEDIBS oferece atendimentos de saúde, acompanhamento do desenvolvimento de bebês e crianças, atividades educativas com ensino bíblico e apoio às famílias.",
    en: "CEDIBS offers health care, developmental follow-up for babies and children, educational activities with Bible teaching, and support for families.",
    es: "El CEDIBS ofrece atención de salud, seguimiento del desarrollo de bebés y niños, actividades educativas con enseñanza bíblica y apoyo a las familias.",
  } as L10n,
  /** Voluntários que atuam como agentes de desenvolvimento. */
  volunteersTitle: {
    pt: "Agentes de desenvolvimento",
    en: "Development agents",
    es: "Agentes de desarrollo",
  } as L10n,
  units: [
    {
      id: "pombal",
      label: { pt: "Unidade 01", en: "Unit 01", es: "Unidad 01" },
      city: "Pombal — PB",
      served: 330,
      servedLabel: {
        pt: "crianças, adolescentes e jovens atendidos, de 0 a 22 anos",
        en: "children, teenagers and young people served, ages 0 to 22",
        es: "niños, adolescentes y jóvenes atendidos, de 0 a 22 años",
      },
      volunteers: 25,
      note: {
        pt: "Equipe formada por membros da Igreja Evangélica Congregacional de Pombal, da Assembleia de Deus Missão, da Primeira Igreja Batista de Pombal e da Igreja Presbiteriana.",
        en: "A team of members from the Congregational Evangelical Church of Pombal, the Assembleia de Deus Missão, the First Baptist Church of Pombal and the Presbyterian Church.",
        es: "Equipo formado por miembros de la Iglesia Evangélica Congregacional de Pombal, la Assembleia de Deus Missão, la Primera Iglesia Bautista de Pombal y la Iglesia Presbiteriana.",
      },
    },
    {
      id: "paulista",
      label: { pt: "Unidade 02", en: "Unit 02", es: "Unidad 02" },
      city: "Paulista — PB",
      served: 110,
      servedLabel: { pt: "crianças atendidas", en: "children served", es: "niños atendidos" },
      volunteers: 15,
      note: {
        pt: "Cerca de 90% da equipe é formada por membros da congregação da Igreja Presbiteriana em Paulista.",
        en: "About 90% of the team are members of the Presbyterian Church congregation in Paulista.",
        es: "Cerca del 90% del equipo está formado por miembros de la congregación de la Iglesia Presbiteriana en Paulista.",
      },
    },
  ] as CedibsUnit[],
  /** Fotos do carrossel "Fotos do projeto" (arquivos em /public/images). */
  gallery: [
    {
      image: "/images/bs-equipe.webp",
      alt: {
        pt: "Equipe do CEDIBS reunida na sala de atendimento",
        en: "The CEDIBS team gathered in the care room",
        es: "El equipo del CEDIBS reunido en la sala de atención",
      },
      caption: { pt: "Equipe do CEDIBS", en: "The CEDIBS team", es: "Equipo del CEDIBS" },
    },
    {
      image: "/images/bs-ensino-atividade.webp",
      alt: {
        pt: "Criança faz uma atividade bíblica com lápis de cor; nas imagens, as marcas do CEDIBS e da IEC Pombal",
        en: "A child does a Bible activity with colored pencils; the CEDIBS and IEC Pombal logos appear on the page",
        es: "Un niño hace una actividad bíblica con lápices de colores; en la hoja, los logotipos del CEDIBS y de la IEC Pombal",
      },
      caption: { pt: "Ensino bíblico", en: "Bible teaching", es: "Enseñanza bíblica" },
    },
    {
      image: "/images/bs-consulta-medica.webp",
      alt: {
        pt: "Médica do projeto examina uma paciente com o estetoscópio",
        en: "A project doctor examines a patient with a stethoscope",
        es: "Una médica del proyecto examina a una paciente con el estetoscopio",
      },
      caption: { pt: "Consultas médicas", en: "Medical appointments", es: "Consultas médicas" },
    },
    {
      image: "/images/bs-atendimento-familia.webp",
      alt: {
        pt: "Médica conversa com uma mãe durante o atendimento",
        en: "A doctor talks with a mother during an appointment",
        es: "Una médica conversa con una madre durante la atención",
      },
      caption: { pt: "Atendimento às famílias", en: "Care for families", es: "Atención a las familias" },
    },
    {
      image: "/images/bs-cuidado-bebe.webp",
      alt: {
        pt: "Voluntária acompanha a pesagem e a medição de um bebê",
        en: "A volunteer helps weigh and measure a baby",
        es: "Una voluntaria acompaña el pesaje y la medición de un bebé",
      },
      caption: { pt: "Acompanhamento de bebês", en: "Baby check-ups", es: "Seguimiento de bebés" },
    },
    {
      image: "/images/bs-kits-bebe.webp",
      alt: {
        pt: "Voluntária segura um bebê ao lado de kits com fraldas preparados para as famílias",
        en: "A volunteer holds a baby next to diaper kits prepared for families",
        es: "Una voluntaria sostiene a un bebé junto a kits de pañales preparados para las familias",
      },
      caption: { pt: "Kits para as famílias", en: "Kits for families", es: "Kits para las familias" },
    },
    {
      image: "/images/bs-familias.webp",
      alt: {
        pt: "Mãe com a bebê no colo, a médica e outra participante sorriem juntas",
        en: "A mother holding her baby, the doctor and another participant smile together",
        es: "Una madre con su bebé en brazos, la médica y otra participante sonríen juntas",
      },
      caption: { pt: "Famílias acompanhadas", en: "Families we accompany", es: "Familias acompañadas" },
    },
    {
      image: "/images/bs-acolhimento.webp",
      alt: {
        pt: "Voluntária sorri na recepção, ao lado de kits preparados para as famílias",
        en: "A volunteer smiles at the reception desk, next to kits prepared for families",
        es: "Una voluntaria sonríe en la recepción, junto a kits preparados para las familias",
      },
      caption: { pt: "Acolhimento", en: "Welcome", es: "Acogida" },
    },
    {
      image: "/images/bs-consulta.webp",
      alt: {
        pt: "Atendimento médico no projeto O Bom Samaritano",
        en: "Medical care at the O Bom Samaritano project",
        es: "Atención médica en el proyecto O Bom Samaritano",
      },
      caption: { pt: "Cuidado com a saúde", en: "Health care", es: "Cuidado de la salud" },
    },
  ],
  reference: { pt: "Lucas 10.25–37", en: "Luke 10:25–37", es: "Lucas 10:25–37" } as L10n,
  pending: false,
};

export const cedibsTotalServed = bomSamaritano.units.reduce((n, u) => n + u.served, 0);
export const cedibsTotalVolunteers = bomSamaritano.units.reduce((n, u) => n + u.volunteers, 0);
