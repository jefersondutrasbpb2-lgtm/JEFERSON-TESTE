import type { Locale } from "@/i18n/config";

/**
 * Bandeirinhas desenhadas em SVG (os emojis de bandeira não aparecem no
 * Windows). Simplificadas para o tamanho pequeno: Brasil (português),
 * Estados Unidos (inglês) e Espanha (espanhol). Decorativas: o nome do idioma
 * acompanha cada link.
 */
export function Flag({ locale }: { locale: Locale }) {
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
      {locale === "en" && (
        <>
          <rect width="30" height="20" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
          ))}
          <rect width="12" height={(20 / 13) * 7} fill="#3c3b6e" />
          {[
            [2, 2], [5, 2], [8, 2], [3.5, 4.4], [6.5, 4.4], [9.5, 4.4], [2, 6.8], [5, 6.8], [8, 6.8], [3.5, 9.2], [6.5, 9.2],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.6" fill="#fff" />
          ))}
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
