"use client";

import { usePathname } from "next/navigation";
import { SiteLink } from "@/components/ui/SiteLink";
import { htmlLang, localeNames, localizeHref, locales } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/client";
import { routeFromPathname } from "@/lib/links";

/** Troca de idioma: leva à mesma página na versão escolhida. */
export function LanguageSwitcher({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const current = useLocale();
  const t = useT();
  const route = routeFromPathname(usePathname() || "/");

  return (
    <nav className={`lang-switch ${className}`.trim()} aria-label={t({ pt: "Idioma", en: "Language", es: "Idioma" })}>
      <ul>
        {locales.map((l) => (
          <li key={l}>
            <SiteLink
              raw
              href={localizeHref(l, route)}
              hrefLang={htmlLang[l]}
              lang={htmlLang[l]}
              title={localeNames[l].name}
              aria-current={l === current ? "true" : undefined}
              onClick={onNavigate}
            >
              <span aria-hidden="true">{localeNames[l].short}</span>
              <span className="sr-only">{localeNames[l].name}</span>
            </SiteLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
