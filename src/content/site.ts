/**
 * Dados institucionais centrais.
 *
 * Itens com `pending: true` ainda precisam ser confirmados pela liderança
 * antes da publicação definitiva (ver CONTENT-REVIEW.md). Enquanto
 * `reviewMode` estiver ativo, o site sinaliza visualmente esses itens.
 */

import type { L10n } from "@/i18n/config";

export type Pendable<T> = T & { pending?: boolean };

/** Ative até que a liderança valide todos os itens marcados como pendentes. */
export const reviewMode = false;

export type SocialLink = {
  id: "instagram" | "youtube" | "facebook";
  label: string;
  handle: string;
  /** Vazio enquanto o perfil não for informado */
  href: string;
  pending: boolean;
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const site = {
  name: "Igreja Evangélica Congregacional de Pombal",
  shortName: "IEC Pombal",
  /** Nome em tradução livre, exibido ao lado do nome oficial nas versões em inglês e espanhol */
  nameTranslation: {
    pt: "",
    en: "Congregational Evangelical Church of Pombal",
    es: "Iglesia Evangélica Congregacional de Pombal",
  } as L10n,
  tagline: {
    pt: "Uma história de fé, Palavra e serviço.",
    en: "A story of faith, the Word and service.",
    es: "Una historia de fe, Palabra y servicio.",
  } as L10n,
  description: {
    pt: "Desde 1970, proclamando o Evangelho de Jesus Cristo e servindo à comunidade no Sertão da Paraíba.",
    en: "Since 1970, proclaiming the Gospel of Jesus Christ and serving the community in the backlands of Paraíba, Brazil.",
    es: "Desde 1970, proclamando el Evangelio de Jesucristo y sirviendo a la comunidad en el Sertón de Paraíba, Brasil.",
  } as L10n,
  foundedISO: "1970-12-13",
  foundedLabel: {
    pt: "13 de dezembro de 1970",
    en: "December 13, 1970",
    es: "13 de diciembre de 1970",
  } as L10n,
  city: "Pombal",
  state: "PB",
  region: { pt: "Sertão da Paraíba", en: "Sertão of Paraíba, Brazil", es: "Sertón de Paraíba, Brasil" } as L10n,
  coordinates: { pt: "6°46′ S · 37°48′ O", en: "6°46′ S · 37°48′ W", es: "6°46′ S · 37°48′ O" } as L10n,

  address: {
    street: "Rua Afro Bandeira, 265",
    district: "Nova Vida",
    city: "Pombal",
    state: "PB",
    zip: "58840-000",
    pending: false,
  } satisfies Pendable<Record<string, unknown>>,

  /** Telefone oficial: ainda não há. Preencha { display, href, pending } quando houver. */
  phone: null as null | { display: string; href: string; pending: boolean },
  email: { value: "sec.iec.2017@gmail.com", pending: false },

  social: [
    { id: "instagram", label: "Instagram", handle: "@iecdepombal", href: "https://www.instagram.com/iecdepombal/", pending: false },
    { id: "youtube", label: "YouTube", handle: "@iecdepombal", href: "https://www.youtube.com/@iecdepombal", pending: false },
    { id: "facebook", label: "Facebook", handle: "@iecdepombal", href: "https://www.facebook.com/iecdepombal", pending: false },
  ] as SocialLink[],
} as const;

export const fullAddress = `${site.address.street} — ${site.address.district}, ${site.address.city} — ${site.address.state}, ${site.address.zip}`;

const mapsQuery = encodeURIComponent(`${site.name}, ${site.address.street}, ${site.address.city} - ${site.address.state}`);
export const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

export type NavItem = { href: string; label: L10n; short?: L10n; description?: L10n };

/** Rotas iguais nos três idiomas; o prefixo /en ou /es é aplicado pelos links. */
export const mainNav: NavItem[] = [
  { href: "/", label: { pt: "Início", en: "Home", es: "Inicio" } },
  {
    href: "/nossa-historia/",
    label: { pt: "Nossa História", en: "Our History", es: "Nuestra Historia" },
    short: { pt: "História", en: "History", es: "Historia" },
    description: { pt: "Desde 13 de dezembro de 1970", en: "Since December 13, 1970", es: "Desde el 13 de diciembre de 1970" },
  },
  {
    href: "/quem-somos/",
    label: { pt: "Quem Somos", en: "About Us", es: "Quiénes Somos" },
    description: { pt: "Fé, identidade e fundamentos", en: "Faith, identity and foundations", es: "Fe, identidad y fundamentos" },
  },
  {
    href: "/departamentos/",
    label: { pt: "Departamentos", en: "Departments", es: "Departamentos" },
    description: {
      pt: "Homens, mulheres, jovens, adolescentes e crianças",
      en: "Men, women, youth, teenagers and children",
      es: "Hombres, mujeres, jóvenes, adolescentes y niños",
    },
  },
  {
    href: "/missoes/",
    label: { pt: "Missões e Ação Social", en: "Missions and Outreach", es: "Misiones y Acción Social" },
    short: { pt: "Missões", en: "Missions", es: "Misiones" },
    description: { pt: "Sertão, Amazônia e Seridó", en: "Sertão, Amazon and Seridó", es: "Sertón, Amazonía y Seridó" },
  },
  {
    href: "/agenda/",
    label: { pt: "Agenda", en: "Schedule", es: "Agenda" },
    description: { pt: "Cultos e programações", en: "Services and gatherings", es: "Cultos y actividades" },
  },
  {
    href: "/contato/",
    label: { pt: "Contato", en: "Contact", es: "Contacto" },
    description: {
      pt: "Fale conosco e pedidos de oração",
      en: "Get in touch and prayer requests",
      es: "Escríbenos y peticiones de oración",
    },
  },
];

export const visitCta: NavItem = {
  href: "/visite/",
  label: { pt: "Planeje sua visita", en: "Plan your visit", es: "Planifica tu visita" },
};
