/**
 * Departamentos da igreja (nomes oficiais enviados pela liderança).
 * Coordenação e horários podem ser preenchidos quando a liderança informar.
 * Os nomes oficiais ficam em português; a descrição é traduzida.
 */

import type { L10n } from "@/i18n/config";

export type Department = {
  id: string;
  acronym: string;
  name: string;
  /** Tradução livre do nome, exibida nas versões em inglês e espanhol */
  nameTranslation: L10n;
  summary: L10n;
  /** Preencher quando a liderança informar */
  leaders?: string;
  schedule?: string;
};

export const departments: Department[] = [
  {
    id: "uhc",
    acronym: "UHC",
    name: "União de Homens Congregacionais",
    nameTranslation: { pt: "", en: "Union of Congregational Men", es: "Unión de Hombres Congregacionales" },
    summary: {
      pt: "Reúne os homens da igreja em comunhão, estudo da Palavra e serviço.",
      en: "Brings together the men of the church for fellowship, study of the Word and service.",
      es: "Reúne a los hombres de la iglesia en comunión, estudio de la Palabra y servicio.",
    },
  },
  {
    id: "uac",
    acronym: "UAC",
    name: "União de Auxiliadoras Congregacionais",
    nameTranslation: { pt: "", en: "Union of Congregational Women's Auxiliaries", es: "Unión de Auxiliadoras Congregacionales" },
    summary: {
      pt: "Reúne as mulheres da igreja em comunhão, oração, estudo da Palavra e serviço.",
      en: "Brings together the women of the church for fellowship, prayer, study of the Word and service.",
      es: "Reúne a las mujeres de la iglesia en comunión, oración, estudio de la Palabra y servicio.",
    },
  },
  {
    id: "dic",
    acronym: "DIC",
    name: "Departamento Infantil Congregacional",
    nameTranslation: { pt: "", en: "Congregational Children's Department", es: "Departamento Infantil Congregacional" },
    summary: {
      pt: "Ensino do Evangelho às crianças, com cuidado, segurança e amor.",
      en: "Teaching the Gospel to children with care, safety and love.",
      es: "Enseñanza del Evangelio a los niños, con cuidado, seguridad y amor.",
    },
  },
  {
    id: "umec",
    acronym: "UMEC",
    name: "União de Mocidades Congregacionais",
    nameTranslation: { pt: "", en: "Union of Congregational Youth", es: "Unión de Juventudes Congregacionales" },
    summary: {
      pt: "Reúne os jovens da igreja em comunhão, discipulado e serviço.",
      en: "Brings together the young people of the church for fellowship, discipleship and service.",
      es: "Reúne a los jóvenes de la iglesia en comunión, discipulado y servicio.",
    },
  },
  {
    id: "uaec",
    acronym: "UAEC",
    name: "União dos Adolescentes Evangélicos Congregacionais",
    nameTranslation: { pt: "", en: "Union of Congregational Evangelical Teenagers", es: "Unión de los Adolescentes Evangélicos Congregacionales" },
    summary: {
      pt: "Reúne os adolescentes da igreja em comunhão, discipulado e formação na fé.",
      en: "Brings together the teenagers of the church for fellowship, discipleship and growth in the faith.",
      es: "Reúne a los adolescentes de la iglesia en comunión, discipulado y formación en la fe.",
    },
  },
];
