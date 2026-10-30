/**
 * Campos missionários e trabalhos regionais, com a situação atual
 * confirmada pela igreja.
 */

export type FieldKind = "organizada" | "congregacao" | "rural" | "missionarios" | "social";

export type MissionField = {
  id: string;
  name: string;
  place: string;
  kind: FieldKind;
  /** Chave do ponto no mapa (src/content/geo.generated.ts) */
  point?: "sousa" | "cajazeiras" | "catole" | "condado" | "caico" | "purus" | "pombal" | "paulista";
  map: "regional" | "overview";
  summary: string;
  people?: string;
  pending?: boolean;
};

export const kindLabel: Record<FieldKind, string> = {
  organizada: "Igreja organizada com contribuição da IEC Pombal",
  congregacao: "Congregação",
  rural: "Trabalho congregacional rural",
  missionarios: "Campo missionário",
  social: "Projeto social",
};

export const missionFields: MissionField[] = [
  {
    id: "catole",
    name: "Catolé do Rocha",
    place: "Paraíba",
    kind: "organizada",
    point: "catole",
    map: "regional",
    summary: "Igreja para cuja fundação a IEC Pombal contribuiu; hoje é uma igreja independente.",
  },
  {
    id: "sousa",
    name: "Sousa",
    place: "Paraíba",
    kind: "organizada",
    point: "sousa",
    map: "regional",
    summary: "Igreja para cuja fundação a IEC Pombal contribuiu; hoje é uma igreja independente.",
  },
  {
    id: "cajazeiras",
    name: "Cajazeiras",
    place: "Paraíba",
    kind: "organizada",
    point: "cajazeiras",
    map: "regional",
    summary: "Igreja para cuja fundação a IEC Pombal contribuiu; hoje é uma igreja independente.",
  },
  {
    id: "condado",
    name: "Condado",
    place: "Paraíba",
    kind: "congregacao",
    point: "condado",
    map: "regional",
    summary: "Congregação com certa autonomia, ainda filiada à IEC Pombal.",
  },
  {
    id: "rurais",
    name: "Santa Maria, São João e Carvalhadas",
    place: "Comunidades rurais",
    kind: "rural",
    point: "pombal",
    map: "regional",
    summary: "Trabalhos congregacionais nas comunidades rurais, levando o ensino da Palavra e a comunhão para perto das famílias do campo.",
  },
  {
    id: "cedibs-paulista",
    name: "Paulista",
    place: "Paraíba",
    kind: "social",
    point: "paulista",
    map: "regional",
    summary: "Unidade 02 do CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano, com 110 crianças atendidas.",
  },
  {
    id: "purus",
    name: "Rio Purus",
    place: "Região Amazônica",
    kind: "missionarios",
    point: "purus",
    map: "overview",
    people: "Missionários Eduardo e Donária",
    summary: "Atuação entre comunidades ribeirinhas do Rio Purus. A posição no mapa é aproximada.",
  },
  {
    id: "caico",
    name: "Caicó",
    place: "Rio Grande do Norte",
    kind: "missionarios",
    point: "caico",
    map: "overview",
    people: "Missionários Alberto e Istênia",
    summary: "Trabalho missionário no Seridó potiguar. Caicó já é uma igreja independente e emancipada, e segue entre os campos missionários atuais da IEC Pombal.",
  },
];

export type CedibsUnit = {
  id: string;
  label: string;
  city: string;
  served: number;
  servedLabel: string;
  volunteers: number;
  note?: string;
};

export const bomSamaritano = {
  name: "O Bom Samaritano",
  entity: "CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano",
  short: "CEDIBS",
  instagram: "obom.samaritano",
  place: "Pombal e Paulista — PB",
  summary:
    "Projeto social abrigado e apoiado pela igreja, dedicado ao desenvolvimento integral de crianças, adolescentes e jovens e ao cuidado de suas famílias.",
  /** Atividades do projeto (descrição confirmada pela igreja). */
  activities:
    "O CEDIBS oferece atendimentos de saúde, acompanhamento do desenvolvimento de bebês e crianças, atividades educativas com ensino bíblico e apoio às famílias.",
  /** Voluntários que atuam como agentes de desenvolvimento. */
  volunteersTitle: "Agentes de desenvolvimento",
  units: [
    {
      id: "pombal",
      label: "Unidade 01",
      city: "Pombal — PB",
      served: 330,
      servedLabel: "crianças, adolescentes e jovens atendidos, de 0 a 22 anos",
      volunteers: 25,
      note: "Equipe formada por membros da Igreja Evangélica Congregacional de Pombal, da Assembleia de Deus Missão, da Primeira Igreja Batista de Pombal e da Igreja Presbiteriana.",
    },
    {
      id: "paulista",
      label: "Unidade 02",
      city: "Paulista — PB",
      served: 110,
      servedLabel: "crianças atendidas",
      volunteers: 15,
      note: "Cerca de 90% da equipe é formada por membros da congregação da Igreja Presbiteriana em Paulista.",
    },
  ] as CedibsUnit[],
  /** Fotos do carrossel "Fotos do projeto" (arquivos em /public/images). */
  gallery: [
    { image: "/images/bs-equipe.webp", alt: "Equipe do CEDIBS reunida na sala de atendimento", caption: "Equipe do CEDIBS" },
    { image: "/images/bs-ensino-atividade.webp", alt: "Criança faz uma atividade bíblica com lápis de cor; nas imagens, as marcas do CEDIBS e da IEC Pombal", caption: "Ensino bíblico" },
    { image: "/images/bs-consulta-medica.webp", alt: "Médica do projeto examina uma paciente com o estetoscópio", caption: "Consultas médicas" },
    { image: "/images/bs-atendimento-familia.webp", alt: "Médica conversa com uma mãe durante o atendimento", caption: "Atendimento às famílias" },
    { image: "/images/bs-cuidado-bebe.webp", alt: "Voluntária acompanha a pesagem e a medição de um bebê", caption: "Acompanhamento de bebês" },
    { image: "/images/bs-kits-bebe.webp", alt: "Voluntária segura um bebê ao lado de kits com fraldas preparados para as famílias", caption: "Kits para as famílias" },
    { image: "/images/bs-familias.webp", alt: "Mãe com a bebê no colo, a médica e outra participante sorriem juntas", caption: "Famílias acompanhadas" },
    { image: "/images/bs-acolhimento.webp", alt: "Voluntária sorri na recepção, ao lado de kits preparados para as famílias", caption: "Acolhimento" },
    { image: "/images/bs-consulta.webp", alt: "Atendimento médico no projeto O Bom Samaritano", caption: "Cuidado com a saúde" },
  ],
  reference: "Lucas 10.25–37",
  pending: false,
};

export const cedibsTotalServed = bomSamaritano.units.reduce((n, u) => n + u.served, 0);
export const cedibsTotalVolunteers = bomSamaritano.units.reduce((n, u) => n + u.volunteers, 0);

