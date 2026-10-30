import { stripLocale } from "@/i18n/config";

/**
 * Modo de prévia estática (NEXT_PUBLIC_PREVIEW_STATIC=1): gera páginas
 * planas (inicio.html, nossa-historia.html, en-inicio.html…) com links e
 * arquivos relativos, para visualizar o site fora do domínio definitivo.
 * Em produção, os links continuam sendo as rotas normais do site.
 */
export const isPreviewStatic = process.env.NEXT_PUBLIC_PREVIEW_STATIC === "1";

export function pageHref(href: string): string {
  if (!isPreviewStatic || !href.startsWith("/")) return href;
  const [path, hash] = href.split("#");
  const lang = path.match(/^\/(en|es)(\/|$)/)?.[1];
  const slug = stripLocale(path).replace(/^\/|\/$/g, "") || "inicio";
  return `${lang ? `${lang}-` : ""}${slug}.html${hash ? `#${hash}` : ""}`;
}

/** Rota do site sem o idioma ("/en/agenda/" → "/agenda/"); funciona nos dois modos. */
export function routeFromPathname(pathname: string): string {
  const last = pathname.replace(/\/$/, "").split("/").pop() ?? "";
  if (last.endsWith(".html")) {
    const slug = last.replace(/\.html$/, "").replace(/^(en|es)-/, "");
    return slug === "inicio" || slug === "index" ? "/" : `/${slug}/`;
  }
  const route = stripLocale(pathname || "/");
  return route.endsWith("/") ? route : `${route}/`;
}
