/**
 * Campos missionários e trabalhos regionais.
 * `status` descreve a natureza do vínculo conforme o histórico fornecido;
 * a situação atual de cada campo deve ser confirmada pela liderança.
 */

export type FieldKind = "organizada" | "congregacao" | "rural" | "missionarios" | "social";

export type MissionField = {
  id: string;
  name: string;
  place: string;
  kind: FieldKind;
  /** Chave do ponto no mapa (src/content/geo.generated.ts) */
  point?: "sousa" | "cajazeiras" | "catole" | "condado" | "caico" | "purus" | "pombal";
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
    summary: "Uma das igrejas do Sertão Paraibano para cuja organização a IEC Pombal contribuiu ao longo de sua trajetória.",
    pending: true,
  },
  {
    id: "sousa",
    name: "Sousa",
    place: "Paraíba",
    kind: "organizada",
    point: "sousa",
    map: "regional",
    summary: "Igreja organizada com a contribuição do trabalho missionário da IEC Pombal no Sertão.",
    pending: true,
  },
  {
    id: "cajazeiras",
    name: "Cajazeiras",
    place: "Paraíba",
    kind: "organizada",
    point: "cajazeiras",
    map: "regional",
    summary: "Igreja organizada com a contribuição do trabalho missionário da IEC Pombal no Sertão.",
    pending: true,
  },
  {
    id: "condado",
    name: "Condado",
    place: "Paraíba",
    kind: "congregacao",
    point: "condado",
    map: "regional",
    summary: "Congregação mantida pela igreja, conforme o histórico institucional.",
    pending: true,
  },
  {
    id: "rurais",
    name: "Santa Maria, São João e Carvalhadas",
    place: "Comunidades rurais",
    kind: "rural",
    point: "pombal",
    map: "regional",
    summary: "Trabalhos congregacionais nas comunidades rurais, levando o ensino da Palavra e a comunhão para perto das famílias do campo.",
    pending: true,
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
    pending: true,
  },
  {
    id: "caico",
    name: "Caicó",
    place: "Rio Grande do Norte",
    kind: "missionarios",
    point: "caico",
    map: "overview",
    people: "Missionários Alberto e Istênia",
    summary: "Trabalho missionário desenvolvido no Seridó potiguar.",
    pending: true,
  },
];

export const bomSamaritano = {
  name: "O Bom Samaritano",
  entity: "CEDIBS — Centro de Desenvolvimento Integral “O Bom Samaritano” de Pombal-PB",
  place: "Comunidade de Carvalhadas — Pombal, PB",
  instagram: "obom.samaritano",
  /** Atividades vistas nas fotografias do projeto; confirmar a descrição com a coordenação. */
  activities:
    "Por meio do CEDIBS, o projeto oferece atendimentos de saúde, acompanhamento do desenvolvimento de bebês e crianças e apoio às famílias.",
  summary:
    "Projeto social abrigado e apoiado pela igreja na comunidade de Carvalhadas, dedicado ao cuidado de crianças e de suas famílias.",
  reach: "mais de 200 crianças",
  reachLabel: "crianças já atendidas ao longo da história do projeto",
  reference: "Lucas 10.25–37",
  pending: true,
};
