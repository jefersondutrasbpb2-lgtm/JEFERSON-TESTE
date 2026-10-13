/**
 * Feeds do Instagram exibidos no site.
 *
 * As publicações são baixadas no momento do build por
 * scripts/fetch-instagram.mjs e gravadas em src/content/instagram/<id>.json,
 * com as imagens copiadas para /public/instagram/<id>/. Assim o site não
 * depende do Instagram para carregar e não envia dados dos visitantes a ele.
 *
 * O Instagram não permite ler publicações apenas pelo @: a conta precisa
 * autorizar o acesso uma vez (veja "Feed do Instagram" no README).
 */
import bomSamaritanoFeed from "./instagram/bom-samaritano.json";

export type InstagramPost = {
  id: string;
  /** Caminho local da imagem (em /public) */
  image: string;
  caption?: string;
  permalink: string;
  timestamp?: string;
  type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
};

export type InstagramFeed = {
  id: string;
  handle: string;
  updatedAt: string | null;
  posts: InstagramPost[];
};

// A lista de perfis e as variáveis de ambiente de cada um ficam em
// scripts/fetch-instagram.mjs (FEEDS). Ao incluir um perfil, crie também
// o arquivo JSON correspondente e registre-o abaixo.
export const instagramFeedsConfig = [
  { id: "bom-samaritano", handle: "obom.samaritano", feedEnv: "IG_FEED_BOM_SAMARITANO", tokenEnv: "IG_TOKEN_BOM_SAMARITANO" },
] as const;

export const instagramFeeds: Record<string, InstagramFeed> = {
  "bom-samaritano": bomSamaritanoFeed as InstagramFeed,
};

export const instagramProfileUrl = (handle: string) => `https://www.instagram.com/${handle}/`;
