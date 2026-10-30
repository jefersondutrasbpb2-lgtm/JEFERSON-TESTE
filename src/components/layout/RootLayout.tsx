import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/manrope/wght.css";
import "@/styles/index.css";

import { site, siteUrl, fullAddress } from "@/content/site";
import { htmlLang, pick, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/server";
import { pageMetadata } from "@/i18n/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

const keywords = {
  pt: ["igreja", "congregacional", "Pombal", "Paraíba", "Sertão", "evangélica", "reformada", "culto", "missões"],
  en: ["church", "congregational", "Pombal", "Paraíba", "Brazil", "evangelical", "reformed", "worship", "missions"],
  es: ["iglesia", "congregacional", "Pombal", "Paraíba", "Brasil", "evangélica", "reformada", "culto", "misiones"],
};

/** Metadados comuns a todas as páginas de um idioma. */
export function rootMetadata(locale: Locale): Metadata {
  const base = pageMetadata(locale, { path: "/" });
  return {
    ...base,
    metadataBase: new URL(siteUrl),
    title: {
      default: `${site.name} — Pombal, PB`,
      template: `%s · ${site.shortName}`,
    },
    description: `${site.name}. ${pick(locale, site.description)}`,
    applicationName: site.shortName,
    keywords: keywords[locale],
    twitter: { card: "summary_large_image", title: site.name, description: pick(locale, site.description) },
    formatDetection: { telephone: false },
  };
}

export const rootViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0b2447" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Ativa as classes de movimento antes da primeira pintura (evita flashes).
const motionBoot = `(function(){var d=document.documentElement;d.classList.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion')}catch(e){}})();`;

const skipLabel = { pt: "Pular para o conteúdo", en: "Skip to content", es: "Saltar al contenido" };

/** Layout raiz compartilhado pelos três idiomas (cada idioma tem o seu layout.tsx). */
export function RootLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  setLocale(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: site.name,
    alternateName: site.shortName,
    foundingDate: site.foundedISO,
    url: siteUrl,
    description: pick(locale, site.description),
    inLanguage: htmlLang[locale],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: "BR",
    },
    ...(site.phone ? { telephone: site.phone.display } : {}),
    email: site.email.value,
    sameAs: site.social.filter((s) => s.href).map((s) => s.href),
    areaServed: fullAddress,
  };

  return (
    <html lang={htmlLang[locale]} suppressHydrationWarning>
      <head>
        {/* Precisa ser síncrono para aplicar os estados iniciais antes da primeira pintura. */}
        <script dangerouslySetInnerHTML={{ __html: motionBoot }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a className="skip-link" href="#conteudo">
          {skipLabel[locale]}
        </a>
        <SmoothScroll />
        <Header />
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
