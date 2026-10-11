import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource-variable/manrope/wght.css";
import "@/styles/index.css";

import { site, siteUrl, fullAddress } from "@/content/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReviewBanner } from "@/components/layout/ReviewBanner";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — Pombal, PB`,
    template: `%s · ${site.shortName}`,
  },
  description: `${site.name}. ${site.description}`,
  applicationName: site.shortName,
  keywords: ["igreja", "congregacional", "Pombal", "Paraíba", "Sertão", "evangélica", "reformada", "culto", "missões"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: site.tagline,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#111b24" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Ativa as classes de movimento antes da primeira pintura (evita flashes).
const motionBoot = `(function(){var d=document.documentElement;d.classList.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion')}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Church",
  name: site.name,
  alternateName: site.shortName,
  foundingDate: site.foundedISO,
  url: siteUrl,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.zip,
    addressCountry: "BR",
  },
  telephone: site.phone.display,
  email: site.email.value,
  sameAs: site.social.filter((s) => s.href).map((s) => s.href),
  areaServed: fullAddress,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Precisa ser síncrono para aplicar os estados iniciais antes da primeira pintura. */}
        <script dangerouslySetInnerHTML={{ __html: motionBoot }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <SmoothScroll />
        <Header />
        <main id="conteudo" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <ReviewBanner />
      </body>
    </html>
  );
}
