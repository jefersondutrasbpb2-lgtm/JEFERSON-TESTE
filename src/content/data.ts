import agendaData from "./agenda.json";
import mensagensData from "./mensagens.json";
import { reviewMode } from "./site";
import type { Locale, Text } from "@/i18n/config";

export type WeeklyItem = {
  id: string;
  /** 0 = domingo … 6 = sábado (o nome do dia vem de `weekdays`) */
  dayIndex: number;
  time: string;
  title: Text;
  description?: Text;
  pending?: boolean;
};

export type EventPoster = { src: string; width: number; height: number; alt: Text };

export type EventItem = {
  id: string;
  date: string;
  time?: string;
  /** Horário de término (só usado no link "Adicionar à agenda"; padrão: 2 h depois) */
  endTime?: string;
  title: Text;
  location?: Text;
  description?: Text;
  /** Texto para "Eventos recentes", depois que o evento passou (padrão: description) */
  recap?: Text;
  category?: Text;
  speaker?: Text;
  example?: boolean;
  /** Destacar na página inicial até a data do evento */
  highlight?: boolean;
  verse?: { text: Text; ref: Text };
  /** Cartaz do evento (arquivo em public/images/eventos/) */
  poster?: EventPoster;
};

/** Data de hoje em Pombal (UTC−3), no formato AAAA-MM-DD. */
export const todayInPombal = (now = Date.now()) => new Date(now - 3 * 3600 * 1000).toISOString().slice(0, 10);

/** Evento ainda por acontecer (ou acontecendo hoje). */
export const isUpcoming = (e: EventItem, today = todayInPombal()) => e.date >= today;

export type Message = {
  id: string;
  title: string;
  date: string;
  preacher?: string;
  passage?: string;
  series?: string;
  youtubeId?: string;
  example?: boolean;
};

const visible = <T extends { example?: boolean }>(items: T[]) => items.filter((i) => reviewMode || !i.example);

export const weekly: WeeklyItem[] = agendaData.weekly as WeeklyItem[];
export const events: EventItem[] = visible(agendaData.events as EventItem[]).sort((a, b) => a.date.localeCompare(b.date));
export const messages: Message[] = visible(mensagensData.items as Message[]).sort((a, b) => b.date.localeCompare(a.date));
export const channelUrl: string = mensagensData.channelUrl;

export const weekdays: Record<Locale, string[]> = {
  pt: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
};

/** "18:00" → "18h" (pt), "6:00 p.m." (en), "18:00" (es). */
export const formatTime = (t: string, locale: Locale = "pt") => {
  const [h, m] = t.split(":");
  const hour = Number(h);
  if (locale === "en") return `${hour % 12 || 12}:${m} ${hour < 12 ? "a.m." : "p.m."}`;
  if (locale === "es") return `${hour}:${m}`;
  return m === "00" ? `${hour}h` : `${hour}h${m}`;
};

const months: Record<Locale, string[]> = {
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
};
const monthsLong: Record<Locale, string[]> = {
  pt: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};

export const parseDate = (iso: string, locale: Locale = "pt") => {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m, day: d, monthShort: months[locale][m - 1], monthLong: monthsLong[locale][m - 1] };
};

export const formatDateLong = (iso: string, locale: Locale = "pt") => {
  const p = parseDate(iso, locale);
  if (locale === "en") return `${p.monthLong} ${p.day}, ${p.year}`;
  return `${p.day} de ${p.monthLong} de ${p.year}`;
};
