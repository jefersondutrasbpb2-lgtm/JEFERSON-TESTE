/**
 * Idiomas do site. O português fica nos endereços originais (/quem-somos/);
 * inglês e espanhol ganham um prefixo (/en/quem-somos/, /es/quem-somos/),
 * mantendo as mesmas rotas para facilitar a troca de idioma.
 */
export const locales = ["pt", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

/** Texto nos três idiomas. */
export type L10n<T = string> = Record<Locale, T>;
/** Texto traduzido ou literal (nomes próprios, siglas). */
export type Text = string | L10n;

export const htmlLang: Record<Locale, string> = { pt: "pt-BR", en: "en", es: "es" };
export const ogLocale: Record<Locale, string> = { pt: "pt_BR", en: "en_US", es: "es_ES" };
export const localeNames: Record<Locale, { short: string; name: string }> = {
  pt: { short: "PT", name: "Português" },
  en: { short: "EN", name: "English" },
  es: { short: "ES", name: "Español" },
};

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

export function pick<T>(locale: Locale, value: T | L10n<T>): T {
  if (value && typeof value === "object" && "pt" in (value as object) && "en" in (value as object)) {
    return (value as L10n<T>)[locale];
  }
  return value as T;
}

export const localePrefix = (locale: Locale) => (locale === defaultLocale ? "" : `/${locale}`);

/** Remove o prefixo de idioma de um caminho interno ("/en/agenda/" → "/agenda/"). */
export function stripLocale(path: string): string {
  const m = path.match(/^\/(en|es)(\/|$)/);
  return m ? path.slice(m[1].length + 1) || "/" : path;
}

/** Caminho interno no idioma indicado ("/agenda/#x" → "/en/agenda/#x"). */
export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const base = stripLocale(href);
  return `${localePrefix(locale)}${base}`;
}

/** Idioma de um caminho do site (também reconhece as páginas planas da prévia). */
export function localeFromPathname(pathname: string): Locale {
  const segs = pathname.split("/").filter(Boolean);
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/^\/|\/$/g, "");
  const first = basePath && segs[0] === basePath ? segs[1] : segs[0];
  if (first && isLocale(first)) return first;
  const last = segs[segs.length - 1] ?? "";
  const flat = last.match(/^(en|es)-.+\.html$/);
  return flat ? (flat[1] as Locale) : defaultLocale;
}
