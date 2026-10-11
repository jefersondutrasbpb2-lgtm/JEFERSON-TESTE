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
  heroFachada: undefined,
  interiorTemplo: undefined,
  arquivo1970: undefined,
  arquivoDocumento: undefined,
  missoesSertao: undefined,
  missoesAmazonia: undefined,
  missoesCaico: undefined,
  bomSamaritano: undefined,
  comunidadeCulto: undefined,
  comunidadeEstudo: undefined,
  comunidadeComunhao: undefined,
  comunidadeLouvor: undefined,
  comunidadeJovens: undefined,
  visitaEntrada: undefined,
};
