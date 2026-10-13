/**
 * Áreas da vida da igreja.
 * Nomes oficiais dos ministérios, líderes, faixas etárias e horários
 * devem ser cadastrados aqui pela liderança (ver CONTENT-REVIEW.md).
 */

export type Ministry = {
  id: string;
  title: string;
  summary: string;
  /** Preencher quando a liderança informar */
  leaders?: string;
  schedule?: string;
  pending?: boolean;
};

export const ministries: Ministry[] = [
  {
    id: "ensino",
    title: "Ensino bíblico",
    summary: "Estudo sistemático das Escrituras para todas as idades, formando discípulos firmados na Palavra.",
    pending: true,
  },
  {
    id: "culto",
    title: "Culto e música",
    summary: "Serviço na liturgia, nos cânticos e na música, para que a congregação adore a Deus com reverência e alegria.",
    pending: true,
  },
  {
    id: "criancas",
    title: "Crianças",
    summary: "Ensino do Evangelho às crianças desde a fundação da igreja, com cuidado, segurança e amor.",
    pending: true,
  },
  {
    id: "jovens",
    title: "Jovens e adolescentes",
    summary: "Comunhão, discipulado e formação de uma nova geração comprometida com Cristo e com a igreja.",
    pending: true,
  },
  {
    id: "familias",
    title: "Famílias e comunhão",
    summary: "Encontros e cuidado mútuo que fortalecem os lares e os laços entre os membros.",
    pending: true,
  },
  {
    id: "oracao",
    title: "Oração",
    summary: "A igreja reunida em súplica e intercessão — pelos irmãos, pela cidade e pelos campos missionários.",
    pending: true,
  },
  {
    id: "missoes",
    title: "Evangelismo e missões",
    summary: "Proclamação do Evangelho em Pombal, nas comunidades rurais, no Sertão e nos campos apoiados pela igreja.",
  },
  {
    id: "social",
    title: "Ação social",
    summary: "Serviço ao próximo, com destaque para o CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano, com unidades em Pombal e Paulista.",
  },
];
