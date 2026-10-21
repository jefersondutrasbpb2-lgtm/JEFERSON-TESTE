/**
 * Modo de prévia estática (NEXT_PUBLIC_PREVIEW_STATIC=1): gera páginas
 * planas (inicio.html, nossa-historia.html…) com links e arquivos
 * relativos, para visualizar o site fora do domínio definitivo.
 * Em produção, os links continuam sendo as rotas normais do site.
 */
export const isPreviewStatic = process.env.NEXT_PUBLIC_PREVIEW_STATIC === "1";

export function pageHref(href: string): string {
  if (!isPreviewStatic || !href.startsWith("/")) return href;
  const [path, hash] = href.split("#");
  const slug = path.replace(/^\/|\/$/g, "") || "inicio";
  return `${slug}.html${hash ? `#${hash}` : ""}`;
}

/** Normaliza o caminho atual para a rota do site (funciona nos dois modos). */
export function routeFromPathname(pathname: string): string {
  const last = pathname.replace(/\/$/, "").split("/").pop() ?? "";
  if (last.endsWith(".html")) {
    const slug = last.replace(/\.html$/, "");
    return slug === "inicio" || slug === "index" ? "/" : `/${slug}/`;
  }
  return pathname || "/";
}
