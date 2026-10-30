import type { ImageData } from "@/components/ui/Photo";

/**
 * Registro central de fotografias.
 *
 * Coloque os arquivos em /public/images (preferencialmente AVIF ou WebP,
 * com no máximo ~2400px no maior lado) e preencha as entradas abaixo.
 * Enquanto uma entrada estiver `undefined`, o site exibe um espaço reservado
 * descrevendo a fotografia esperada.
 *
 * Use apenas imagens reais e autorizadas. Para crianças e adolescentes,
 * é obrigatória a autorização dos responsáveis (LGPD, art. 14).
 *
 * Exemplo:
 *   pregacao: { src: "/images/pregacao.webp", alt: "Descrição da cena", width: 1200, height: 1600 },
 */
export const media: Record<string, ImageData | undefined> = {
  heroFachada: {
    src: "/images/hero-fachada-2000.webp",
    alt: {
      pt: "Fachada do templo da Igreja Evangélica Congregacional de Pombal, com o letreiro, a cruz e a entrada em arcos",
      en: "Front of the Congregational Evangelical Church of Pombal, with its sign, the cross and the arched entrance",
      es: "Fachada del templo de la Iglesia Evangélica Congregacional de Pombal, con el letrero, la cruz y la entrada en arcos",
    },
    width: 2000,
    height: 1125,
    variants: [{ src: "/images/hero-fachada-1200.webp", width: 1200 }],
  },
  fachadaRua: {
    src: "/images/fachada-rua-2000.webp",
    alt: {
      pt: "Vista da rua com a fachada do templo da Igreja Evangélica Congregacional de Pombal, de muros vermelhos e paredes creme",
      en: "Street view of the church building, with red walls and cream-colored façade",
      es: "Vista desde la calle del templo de la iglesia, con muros rojos y paredes color crema",
    },
    width: 2000,
    height: 1128,
    variants: [{ src: "/images/fachada-rua-960.webp", width: 960 }],
  },
  pregacao: {
    src: "/images/pr-felipe-pregando.webp",
    alt: {
      pt: "Pr. Felipe Oliveira pregando ao púlpito da igreja, com o microfone na mão",
      en: "Pastor Felipe Oliveira preaching from the church pulpit, microphone in hand",
      es: "El Pastor Felipe Oliveira predicando desde el púlpito de la iglesia, con el micrófono en la mano",
    },
    width: 1086,
    height: 1448,
    focus: "60% 35%",
  },
  congregacao: {
    src: "/images/culto-louvor-congregacao.webp",
    alt: {
      pt: "Membros da igreja, de pé, cantando durante o culto",
      en: "Church members standing and singing during the worship service",
      es: "Miembros de la iglesia, de pie, cantando durante el culto",
    },
    width: 1200,
    height: 1600,
    focus: "50% 35%",
  },
  arquivo1970: undefined,
  arquivoDocumento: undefined,
  louvor: {
    src: "/images/louvor-violao.webp",
    alt: {
      pt: "Músico ao violão conduzindo os cânticos, com a letra projetada ao fundo",
      en: "Guitarist leading the singing, with the lyrics projected in the background",
      es: "Músico con la guitarra dirigiendo los cantos, con la letra proyectada al fondo",
    },
    width: 1080,
    height: 1350,
    focus: "50% 30%",
  },
  leitura: {
    src: "/images/leitura-biblica.webp",
    alt: {
      pt: "Menino sentado no banco da igreja, lendo um livro com atenção",
      en: "A boy sitting on a church pew, reading attentively",
      es: "Un niño sentado en el banco de la iglesia, leyendo con atención",
    },
    width: 757,
    height: 567,
    focus: "55% 40%",
  },
  oracao: {
    src: "/images/oracao.webp",
    alt: {
      pt: "Menina de olhos fechados em oração, sentada entre adultos no banco da igreja",
      en: "A girl with her eyes closed in prayer, seated among adults on a church pew",
      es: "Una niña con los ojos cerrados en oración, sentada entre adultos en el banco de la iglesia",
    },
    width: 757,
    height: 606,
    focus: "50% 38%",
  },
  criancas: {
    src: "/images/criancas-comunhao.webp",
    alt: {
      pt: "Meninas sentadas nos bancos da igreja, sorrindo, durante uma atividade com as crianças",
      en: "Smiling girls seated on the church pews during a children's activity",
      es: "Niñas sentadas en los bancos de la iglesia, sonriendo, durante una actividad infantil",
    },
    width: 531,
    height: 619,
    focus: "50% 40%",
  },
  missoesSertao: undefined,
  missoesAmazonia: undefined,
  missoesCaico: undefined,
  bomSamaritano: {
    src: "/images/bs-consulta-familia.webp",
    alt: {
      pt: "Médica do projeto O Bom Samaritano atende uma família, com a criança no colo da mãe, em sala colorida",
      en: "A doctor from the O Bom Samaritano project sees a family, the child on the mother's lap, in a colorful room",
      es: "Una médica del proyecto O Bom Samaritano atiende a una familia, con el niño en brazos de la madre, en una sala colorida",
    },
    width: 1080,
    height: 1347,
    focus: "50% 50%",
  },
  bsEnsino: {
    src: "/images/bs-ensino-biblico.webp",
    alt: {
      pt: "Mãos de uma criança respondendo, com lápis de cor, uma atividade bíblica sobre o livro de Provérbios",
      en: "A child's hands completing, with colored pencils, a Bible activity on the book of Proverbs",
      es: "Manos de un niño respondiendo, con lápices de colores, una actividad bíblica sobre el libro de Proverbios",
    },
    width: 1080,
    height: 1349,
    focus: "50% 50%",
  },
  bsEquipe: {
    src: "/images/bs-equipe.webp",
    alt: {
      pt: "Equipe do CEDIBS, o Centro de Desenvolvimento Integral O Bom Samaritano, reunida na sala de atendimento",
      en: "The CEDIBS team (O Bom Samaritano Integral Development Center) gathered in the care room",
      es: "El equipo del CEDIBS (Centro de Desarrollo Integral O Bom Samaritano) reunido en la sala de atención",
    },
    width: 1080,
    height: 1347,
    focus: "50% 62%",
  },
  bsAcolhimento: {
    src: "/images/bs-acolhimento.webp",
    alt: {
      pt: "Voluntária do projeto sorri na recepção, ao lado de kits preparados para as famílias",
      en: "A project volunteer smiles at the reception desk, next to kits prepared for families",
      es: "Una voluntaria del proyecto sonríe en la recepción, junto a kits preparados para las familias",
    },
    width: 1080,
    height: 1351,
    focus: "40% 45%",
  },
  bsCuidado: {
    src: "/images/bs-cuidado-bebe.webp",
    alt: {
      pt: "Voluntária acompanha a pesagem e a medição de um bebê",
      en: "A volunteer helps weigh and measure a baby",
      es: "Una voluntaria acompaña el pesaje y la medición de un bebé",
    },
    width: 1080,
    height: 1351,
    focus: "50% 50%",
  },
  bsConsulta: {
    src: "/images/bs-consulta.webp",
    alt: {
      pt: "Atendimento médico no projeto O Bom Samaritano",
      en: "Medical care at the O Bom Samaritano project",
      es: "Atención médica en el proyecto O Bom Samaritano",
    },
    width: 1200,
    height: 748,
    focus: "60% 40%",
  },
  visitaEntrada: {
    src: "/images/fachada-frontal-1500.webp",
    alt: {
      pt: "Entrada do templo, com portas de vidro sob a marquise em arcos e o número 265 na parede",
      en: "Church entrance, with glass doors under the arched canopy and the number 265 on the wall",
      es: "Entrada del templo, con puertas de vidrio bajo la marquesina en arcos y el número 265 en la pared",
    },
    width: 1500,
    height: 1125,
    variants: [{ src: "/images/fachada-frontal-900.webp", width: 900 }],
  },
};
