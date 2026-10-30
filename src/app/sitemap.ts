import type { MetadataRoute } from "next";
import { mainNav, siteUrl, visitCta } from "@/content/site";
import { htmlLang, localizeHref, locales } from "@/i18n/config";

export const dynamic = "force-static";

const base = `${siteUrl}${process.env.NEXT_PUBLIC_BASE_PATH || ""}`;

/** Cada página nos três idiomas, com as versões equivalentes (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [...mainNav, visitCta].flatMap((item) => {
    const languages = Object.fromEntries(locales.map((l) => [htmlLang[l], `${base}${localizeHref(l, item.href)}`]));
    return locales.map((l) => ({
      url: `${base}${localizeHref(l, item.href)}`,
      changeFrequency: item.href === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: item.href === "/" ? (l === "pt" ? 1 : 0.8) : l === "pt" ? 0.7 : 0.5,
      alternates: { languages },
    }));
  });
}
