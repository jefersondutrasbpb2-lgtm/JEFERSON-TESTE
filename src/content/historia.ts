/**
 * Registro histórico da igreja, conforme o histórico institucional fornecido.
 * Não acrescente datas, nomes ou fatos sem comprovação documental.
 */

import type { L10n } from "@/i18n/config";

export const founding = {
  dateLabel: { pt: "13 de dezembro de 1970", en: "December 13, 1970", es: "13 de diciembre de 1970" } as L10n,
  dateShort: "13.12.1970",
  place: {
    pt: "Residência do diácono Gerson Martins de Sá e de sua esposa, Eusa Dantas de Sá",
    en: "Home of Deacon Gerson Martins de Sá and his wife, Eusa Dantas de Sá",
    es: "Casa del diácono Gerson Martins de Sá y de su esposa, Eusa Dantas de Sá",
  } as L10n,
  origin: {
    pt: "Reunião de irmãos presbiterianos",
    en: "A gathering of Presbyterian believers",
    es: "Una reunión de hermanos presbiterianos",
  } as L10n,
  initialMembers: 33,
  firstPastor: "Rev. José Severino de Araújo",
};

export const firstCouncil = {
  title: { pt: "Primeiro Conselho Eclesiástico", en: "First Church Council", es: "Primer Consejo Eclesiástico" } as L10n,
  groups: [
    {
      role: { pt: "Presbíteros", en: "Elders", es: "Presbíteros" } as L10n,
      names: [
        "Neemias Tertuliano de Sousa",
        "Autinoel Martins Ferreira",
        "Manoel Tertuliano Martins",
        "Francisco Tertuliano Martins",
      ],
    },
    {
      role: { pt: "Diáconos", en: "Deacons", es: "Diáconos" } as L10n,
      names: [
        "Oseas Martins Ferreira",
        "José Roberto dos Santos",
        "Antônio Tertuliano Martins",
        "Gerson Martins de Sá",
      ],
    },
  ],
};

export const firstBoard = {
  title: {
    pt: "Primeira diretoria do patrimônio",
    en: "First Board of Trustees",
    es: "Primera junta directiva del patrimonio",
  } as L10n,
  members: [
    { role: { pt: "Presidente", en: "President", es: "Presidente" } as L10n, name: "Neemias Tertuliano de Sousa" },
    { role: { pt: "Vice-presidente", en: "Vice President", es: "Vicepresidente" } as L10n, name: "Autinoel Martins Ferreira" },
    { role: { pt: "Tesoureiro", en: "Treasurer", es: "Tesorero" } as L10n, name: "José Roberto dos Santos" },
    { role: { pt: "Secretário", en: "Secretary", es: "Secretario" } as L10n, name: "Teodomiso Pereira Formiga" },
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
  title: { pt: "Pr.", en: "Pastor", es: "Pastor" } as L10n,
  status: { pt: "Pastor", en: "Pastor", es: "Pastor" } as L10n,
  installationISO: "2026-10-14",
  installationLabel: { pt: "14 de outubro de 2026", en: "October 14, 2026", es: "14 de octubre de 2026" } as L10n,
  image: { src: "/images/pr-felipe-oliveira.webp", width: 1122, height: 1402 },
};

export const pastorsNote: L10n = {
  pt: "Relação conforme os registros históricos disponíveis. A numeração original dos pastorados apresenta uma lacuna; por isso, esta lista pode não estar completa e não informa períodos.",
  en: "List based on the available historical records. The original numbering of the pastorates has a gap, so this list may be incomplete and does not give dates.",
  es: "Relación según los registros históricos disponibles. La numeración original de los pastorados presenta un vacío; por eso, esta lista puede no estar completa y no indica períodos.",
};

/** Marcos da caminhada. Somente a fundação possui data confirmada. */
export const milestones: { mark: string; date?: string; title: L10n; text: L10n }[] = [
  {
    mark: "I",
    date: "1970",
    title: { pt: "Fundação da igreja", en: "The church is founded", es: "Fundación de la iglesia" },
    text: {
      pt: "Em 13 de dezembro, irmãos reunidos na residência do diácono Gerson Martins de Sá e de Eusa Dantas de Sá dão início à Igreja Evangélica Congregacional de Pombal, com 33 membros, além de jovens e crianças.",
      en: "On December 13, believers gathered at the home of Deacon Gerson Martins de Sá and Eusa Dantas de Sá begin the Congregational Evangelical Church of Pombal, with 33 members, plus young people and children.",
      es: "El 13 de diciembre, hermanos reunidos en la casa del diácono Gerson Martins de Sá y de Eusa Dantas de Sá dan inicio a la Iglesia Evangélica Congregacional de Pombal, con 33 miembros, además de jóvenes y niños.",
    },
  },
  {
    mark: "II",
    title: { pt: "Início das atividades ministeriais", en: "Ministry begins", es: "Inicio de las actividades ministeriales" },
    text: {
      pt: "Sob o pastorado do Rev. José Severino de Araújo, com o primeiro Conselho Eclesiástico e a primeira diretoria do patrimônio, a igreja organiza sua vida de culto, ensino e serviço.",
      en: "Under the pastorate of Rev. José Severino de Araújo, with the first Church Council and the first Board of Trustees, the church organizes its life of worship, teaching and service.",
      es: "Bajo el pastorado del Rev. José Severino de Araújo, con el primer Consejo Eclesiástico y la primera junta directiva del patrimonio, la iglesia organiza su vida de culto, enseñanza y servicio.",
    },
  },
  {
    mark: "III",
    title: { pt: "Trabalho missionário no Sertão", en: "Mission work in the Sertão", es: "Obra misionera en el Sertón" },
    text: {
      pt: "A proclamação do Evangelho ultrapassa os limites da cidade e alcança outros municípios do Sertão Paraibano.",
      en: "The proclamation of the Gospel reaches beyond the city to other towns in the Sertão of Paraíba.",
      es: "La proclamación del Evangelio supera los límites de la ciudad y alcanza otros municipios del Sertón de Paraíba.",
    },
  },
  {
    mark: "IV",
    title: { pt: "Igrejas organizadas na região", en: "Churches planted in the region", es: "Iglesias organizadas en la región" },
    text: {
      pt: "A igreja contribui para a organização de igrejas em Catolé do Rocha, Sousa e Cajazeiras.",
      en: "The church helps establish churches in Catolé do Rocha, Sousa and Cajazeiras.",
      es: "La iglesia contribuye a la organización de iglesias en Catolé do Rocha, Sousa y Cajazeiras.",
    },
  },
  {
    mark: "V",
    title: { pt: "Congregações e comunidades rurais", en: "Congregations and rural communities", es: "Congregaciones y comunidades rurales" },
    text: {
      pt: "O trabalho alcança Condado e as comunidades rurais de Santa Maria, São João e Carvalhadas.",
      en: "The work reaches Condado and the rural communities of Santa Maria, São João and Carvalhadas.",
      es: "La obra alcanza Condado y las comunidades rurales de Santa Maria, São João y Carvalhadas.",
    },
  },
  {
    mark: "VI",
    title: { pt: "Missões e ação social", en: "Missions and outreach", es: "Misiones y acción social" },
    text: {
      pt: "Apoio a missionários na Região Amazônica e em Caicó — RN, e ao CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano, hoje com unidades em Pombal e Paulista.",
      en: "Support for missionaries in the Amazon region and in Caicó, Rio Grande do Norte, and for CEDIBS, the O Bom Samaritano Integral Development Center, now with units in Pombal and Paulista.",
      es: "Apoyo a misioneros en la región amazónica y en Caicó, Rio Grande do Norte, y al CEDIBS, el Centro de Desarrollo Integral O Bom Samaritano, hoy con unidades en Pombal y Paulista.",
    },
  },
  {
    mark: "VII",
    title: { pt: "A missão continua", en: "The mission continues", es: "La misión continúa" },
    text: {
      pt: "Fiel às Escrituras, a igreja segue proclamando o Evangelho de Jesus Cristo em Pombal e além — para a glória de Deus.",
      en: "Faithful to the Scriptures, the church keeps proclaiming the Gospel of Jesus Christ in Pombal and beyond — to the glory of God.",
      es: "Fiel a las Escrituras, la iglesia sigue proclamando el Evangelio de Jesucristo en Pombal y más allá, para la gloria de Dios.",
    },
  },
];
