import { useId } from "react";
import type { Locale } from "@/i18n/config";

/**
 * Bandeirinhas desenhadas em SVG (os emojis de bandeira não aparecem no
 * Windows). Simplificadas para o tamanho pequeno: Brasil (português),
 * Reino Unido (inglês) e Espanha (espanhol). Decorativas: o nome do idioma
 * acompanha cada link.
 */
export function Flag({ locale }: { locale: Locale }) {
  const id = useId().replace(/:/g, "");
  if (locale === "en") {
    // Union Jack (proporção 2:1, recortada para caber no mesmo espaço 3:2)
    return (
      <svg
        className="flag"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid slice"
        width="18"
        height="12"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={`${id}-s`}>
            <path d="M0 0v30h60V0z" />
          </clipPath>
          <clipPath id={`${id}-t`}>
            <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-s)`}>
          <path d="M0 0v30h60V0z" fill="#012169" />
          <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0l60 30m0-30L0 30" clipPath={`url(#${id}-t)`} stroke="#c8102e" strokeWidth="4" />
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
        </g>
      </svg>
    );
  }
  return (
    <svg className="flag" viewBox="0 0 30 20" width="18" height="12" aria-hidden="true" focusable="false">
      {locale === "pt" && (
        <>
          <rect width="30" height="20" fill="#009c3b" />
          <path d="M15 2.2 27.2 10 15 17.8 2.8 10Z" fill="#ffdf00" />
          <circle cx="15" cy="10" r="4.6" fill="#002776" />
          <path d="M10.6 9.1c3-.9 6.3-.6 8.9.9" stroke="#fff" strokeWidth="0.9" fill="none" />
        </>
      )}
      {locale === "es" && (
        <>
          <rect width="30" height="20" fill="#aa151b" />
          <rect y="5" width="30" height="10" fill="#f1bf00" />
        </>
      )}
    </svg>
  );
}
