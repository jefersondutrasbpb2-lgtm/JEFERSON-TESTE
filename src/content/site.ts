/**
 * Dados institucionais centrais.
 *
 * Itens com `pending: true` ainda precisam ser confirmados pela liderança
 * antes da publicação definitiva (ver CONTENT-REVIEW.md). Enquanto
 * `reviewMode` estiver ativo, o site sinaliza visualmente esses itens.
 */

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
  tagline: "Uma história de fé, Palavra e serviço.",
  description:
    "Desde 1970, proclamando o Evangelho de Jesus Cristo e servindo à comunidade no Sertão da Paraíba.",
  foundedISO: "1970-12-13",
  foundedLabel: "13 de dezembro de 1970",
  city: "Pombal",
  state: "PB",
  region: "Sertão da Paraíba",
  coordinates: "6°46′ S · 37°48′ O",

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

export type NavItem = { href: string; label: string; short?: string; description?: string };

export const mainNav: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/nossa-historia/", label: "Nossa História", short: "História", description: "Desde 13 de dezembro de 1970" },
  { href: "/quem-somos/", label: "Quem Somos", description: "Fé, identidade e fundamentos" },
  { href: "/ministerios/", label: "Ministérios", description: "A vida da igreja" },
  { href: "/missoes/", label: "Missões e Ação Social", short: "Missões", description: "Sertão, Amazônia e Seridó" },
  { href: "/agenda/", label: "Agenda", description: "Cultos e programações" },
  { href: "/contato/", label: "Contato", description: "Fale conosco e pedidos de oração" },
];

export const visitCta: NavItem = { href: "/visite/", label: "Planeje sua visita" };
