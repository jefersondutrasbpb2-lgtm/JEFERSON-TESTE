import type { Metadata } from "next";
import { site } from "@/content/site";
import { htmlLang, localizeHref, locales, ogLocale, pick, type L10n, type Locale } from "./config";

/** Endereços equivalentes nos três idiomas (hreflang) para uma rota. */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[htmlLang[l]] = localizeHref(l, path);
  languages["x-default"] = path;
  return languages;
}

type PageMeta = { path: string; title?: L10n; description?: L10n };

/** Metadados de uma página no idioma indicado. */
export function pageMetadata(locale: Locale, { path, title, description }: PageMeta): Metadata {
  const url = localizeHref(locale, path);
  const desc = description ? pick(locale, description) : pick(locale, site.description);
  return {
    ...(title ? { title: pick(locale, title) } : {}),
    description: desc,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      siteName: site.name,
      title: title ? pick(locale, title) : pick(locale, site.tagline),
      description: desc,
      url,
    },
  };
}
