/**
 * Registro histórico da igreja, conforme o histórico institucional fornecido.
 * Não acrescente datas, nomes ou fatos sem comprovação documental.
 */

export const founding = {
  dateLabel: "13 de dezembro de 1970",
  dateShort: "13.12.1970",
  place: "Residência do diácono Gerson Martins de Sá e de sua esposa, Eusa Dantas de Sá",
  origin: "Reunião de irmãos presbiterianos",
  initialMembers: 33,
  firstPastor: "Rev. José Severino de Araújo",
};

export const firstCouncil = {
  title: "Primeiro Conselho Eclesiástico",
  groups: [
    {
      role: "Presbíteros",
      names: [
        "Neemias Tertuliano Martins",
        "Autinoel Martins Ferreira",
        "Manoel Tertuliano Martins",
        "Francisco Tertuliano Martins",
      ],
    },
    {
      role: "Diáconos",
      names: [
        "Oseas Martins Ferreira",
        "José Norbeto dos Santos",
        "Antônio Tertuliano Martins",
        "Gerson Martins de Sá",
      ],
    },
  ],
};

export const firstBoard = {
  title: "Primeira diretoria do patrimônio",
  members: [
    { role: "Presidente", name: "Neemias Tertuliano Martins" },
    { role: "Vice-presidente", name: "Autinoel Martins Ferreira" },
    { role: "Tesoureiro", name: "José Roberto dos Santos" },
    { role: "Secretário", name: "Teodomiso Pereira Formiga" },
  ],
};

/** Ordem conforme o registro fornecido. A numeração original apresenta lacuna. */
export const pastors = [
  "José Severino de Araújo",
  "Antônio Hilário Bezerra",
  "Samuel Dionísio de Veras",
  "Davi Inácio de Oliveira",
  "Filadelfo Paz de Lira",
  "Raimundo Ferreira de Amorim",
  "Eliézer Zulianelle de Andrade",
  "José Lucena da Silva",
  "Nivaldo Luiz dos Santos",
  "Carlos Alberto Almeida Viegas",
  "Cláudio Alves da Silva",
  "Marcone de Carvalho Santana",
];

/** Pastor da igreja, empossado em 14/10/2026 (convite oficial da posse pastoral). */
export const currentPastor = {
  name: "Felipe Oliveira",
  title: "Pr.",
  status: "Pastor",
  installationISO: "2026-10-14",
  installationLabel: "14 de outubro de 2026",
  image: { src: "/images/pr-felipe-oliveira.webp", width: 1122, height: 1402 },
};

export const pastorsNote =
  "Relação conforme os registros históricos disponíveis. A numeração original dos pastorados apresenta uma lacuna; por isso, esta lista pode não estar completa e não informa períodos.";

/** Marcos da caminhada. Somente a fundação possui data confirmada. */
export const milestones: { mark: string; date?: string; title: string; text: string }[] = [
  {
    mark: "I",
    date: "1970",
    title: "Fundação da igreja",
    text: "Em 13 de dezembro, irmãos reunidos na residência do diácono Gerson Martins de Sá e de Eusa Dantas de Sá dão início à Igreja Evangélica Congregacional de Pombal, com 33 membros, além de jovens e crianças.",
  },
  {
    mark: "II",
    title: "Início das atividades ministeriais",
    text: "Sob o pastorado do Rev. José Severino de Araújo, com o primeiro Conselho Eclesiástico e a primeira diretoria do patrimônio, a igreja organiza sua vida de culto, ensino e serviço.",
  },
  {
    mark: "III",
    title: "Trabalho missionário no Sertão",
    text: "A proclamação do Evangelho ultrapassa os limites da cidade e alcança outros municípios do Sertão Paraibano.",
  },
  {
    mark: "IV",
    title: "Igrejas organizadas na região",
    text: "A igreja contribui para a organização de igrejas em Catolé do Rocha, Sousa e Cajazeiras.",
  },
  {
    mark: "V",
    title: "Congregações e comunidades rurais",
    text: "O trabalho alcança Condado e as comunidades rurais de Santa Maria, São João e Carvalhadas.",
  },
  {
    mark: "VI",
    title: "Missões e ação social",
    text: "Apoio a missionários na Região Amazônica e em Caicó — RN, e ao CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano, hoje com unidades em Pombal e Paulista.",
  },
  {
    mark: "VII",
    title: "A missão continua",
    text: "Fiel às Escrituras, a igreja segue proclamando o Evangelho de Jesus Cristo em Pombal e além — para a glória de Deus.",
  },
];
