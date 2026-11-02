import type { Locale } from "@/i18n/config";
import { formatDateLong } from "@/content/data";

export type Video = { id: string; title: string; published: string };
export type VideoFeed = { channelId: string; fetchedAt: string | null; live: Video | null; videos: Video[] };

/** Palavras que ficam minúsculas quando um título em CAIXA ALTA é ajustado. */
const small = new Set(["de", "da", "do", "das", "dos", "e", "a", "o", "em", "na", "no", "para", "com"]);

const softCase = (part: string) => {
  const letters = part.replace(/[^\p{L}]/gu, "");
  if (letters.length <= 4 || letters !== letters.toUpperCase()) return part;
  return part
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
};

const DATE = /\s*[-–—]?\s*(\d{2})\/(\d{2})\/(\d{4})\s*$/;
const CHURCH = /^(igreja (evang[eé]lica )?congregacional de pombal|iec( de)? pombal)$/i;

/**
 * "CULTO NOTURNO | Igreja Congregacional de Pombal - 01/11/2026" → "Culto Noturno".
 * Tira o nome da igreja, o "AO VIVO" e a data (que aparece à parte).
 */
export function cleanTitle(title: string): string {
  const parts = title
    .split("|")
    .map((p) => p.replace(DATE, "").trim())
    .filter((p) => p && !CHURCH.test(p) && !/^ao vivo$/i.test(p));
  return parts.length ? parts.map(softCase).join(" — ") : title;
}

/** Data do culto: a do título, quando houver; senão, a da publicação no horário de Pombal. */
export function videoDate(v: Video): string {
  const m = v.title.match(DATE);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(v.published);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

export const videoDateLabel = (v: Video, locale: Locale) => {
  const iso = videoDate(v);
  return iso ? formatDateLong(iso, locale) : "";
};

export const thumb = (id: string, size: "hq" | "max" = "hq") =>
  `https://i.ytimg.com/vi/${id}/${size === "max" ? "maxresdefault" : "hqdefault"}.jpg`;

export const isFeed = (j: unknown): j is VideoFeed =>
  !!j && typeof j === "object" && Array.isArray((j as VideoFeed).videos);
