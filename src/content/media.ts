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
 *   heroFachada: { src: "/images/fachada.webp", alt: "Fachada do templo...", width: 1800, height: 2400 },
 */
export const media: Record<string, ImageData | undefined> = {
  heroFachada: {
    src: "/images/fachada-arco-726.webp",
    alt: "Fachada do templo da Igreja Evangélica Congregacional de Pombal, com o letreiro e a cruz sobre a entrada em arcos",
    width: 726,
    height: 1125,
  },
  fachadaRua: {
    src: "/images/fachada-rua-2000.webp",
    alt: "Vista da rua com a fachada do templo da Igreja Evangélica Congregacional de Pombal, de muros vermelhos e paredes creme",
    width: 2000,
    height: 1128,
    variants: [{ src: "/images/fachada-rua-960.webp", width: 960 }],
  },
  pregacao: {
    src: "/images/pregacao-pulpito.webp",
    alt: "Pregador ao púlpito com a Bíblia aberta; à frente do púlpito, o símbolo da cruz da igreja",
    width: 768,
    height: 1025,
    focus: "50% 45%",
  },
  congregacao: {
    src: "/images/culto-louvor-congregacao.webp",
    alt: "Membros da igreja, de pé, cantando durante o culto",
    width: 1200,
    height: 1600,
    focus: "50% 35%",
  },
  arquivo1970: undefined,
  arquivoDocumento: undefined,
  louvor: {
    src: "/images/louvor-violao.webp",
    alt: "Músico ao violão conduzindo os cânticos, com a letra projetada ao fundo",
    width: 1080,
    height: 1350,
    focus: "50% 30%",
  },
  leitura: {
    src: "/images/leitura-biblica.webp",
    alt: "Menino sentado no banco da igreja, lendo um livro com atenção",
    width: 757,
    height: 567,
    focus: "55% 40%",
  },
  oracao: {
    src: "/images/oracao.webp",
    alt: "Menina de olhos fechados em oração, sentada entre adultos no banco da igreja",
    width: 757,
    height: 606,
    focus: "50% 38%",
  },
  criancas: {
    src: "/images/criancas-comunhao.webp",
    alt: "Meninas sentadas nos bancos da igreja, sorrindo, durante uma atividade com as crianças",
    width: 531,
    height: 619,
    focus: "50% 40%",
  },
  missoesSertao: undefined,
  missoesAmazonia: undefined,
  missoesCaico: undefined,
  bomSamaritano: undefined,
  visitaEntrada: {
    src: "/images/fachada-frontal-1500.webp",
    alt: "Entrada do templo, com portas de vidro sob a marquise em arcos e o número 265 na parede",
    width: 1500,
    height: 1125,
    variants: [{ src: "/images/fachada-frontal-900.webp", width: 900 }],
  },
};
