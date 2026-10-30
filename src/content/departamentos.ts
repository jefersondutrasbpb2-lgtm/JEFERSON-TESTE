/**
 * Departamentos da igreja (nomes oficiais enviados pela liderança).
 * Coordenação e horários podem ser preenchidos quando a liderança informar.
 */

export type Department = {
  id: string;
  acronym: string;
  name: string;
  summary: string;
  /** Preencher quando a liderança informar */
  leaders?: string;
  schedule?: string;
};

export const departments: Department[] = [
  {
    id: "uhc",
    acronym: "UHC",
    name: "União de Homens Congregacionais",
    summary: "Reúne os homens da igreja em comunhão, estudo da Palavra e serviço.",
  },
  {
    id: "uac",
    acronym: "UAC",
    name: "União de Auxiliadoras Congregacionais",
    summary: "Reúne as mulheres da igreja em comunhão, oração, estudo da Palavra e serviço.",
  },
  {
    id: "dic",
    acronym: "DIC",
    name: "Departamento Infantil Congregacional",
    summary: "Ensino do Evangelho às crianças, com cuidado, segurança e amor.",
  },
  {
    id: "umec",
    acronym: "UMEC",
    name: "União de Mocidades Congregacionais",
    summary: "Reúne os jovens da igreja em comunhão, discipulado e serviço.",
  },
  {
    id: "uaec",
    acronym: "UAEC",
    name: "União dos Adolescentes Evangélicos Congregacionais",
    summary: "Reúne os adolescentes da igreja em comunhão, discipulado e formação na fé.",
  },
];
