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

export type EventDay = {
  /** AAAA-MM-DD */
  date: string;
  time?: string;
  /** Pregador ou responsável do dia */
  speaker?: Text;
  /** Igreja ou função de quem ministra (ex.: "IEC Cajazeiras") */
  role?: Text;
};

export type EventItem = {
  id: string;
  date: string;
  /** Último dia, para eventos de mais de um dia (AAAA-MM-DD) */
  endDate?: string;
  /** Programação por dia (eventos de mais de um dia) */
  program?: EventDay[];
  time?: string;
  /** Horário em texto, quando não há hora marcada (ex.: "Após o Culto de Natal") */
  when?: Text;
  /** Inscrição: prazo (AAAA-MM-DD) e como se inscrever */
  signup?: { deadline: string; how: Text };
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

/** Evento ainda por acontecer (ou acontecendo hoje, inclusive no último dia). */
export const isUpcoming = (e: EventItem, today = todayInPombal()) => (e.endDate ?? e.date) >= today;

/** Último dia do evento. */
export const lastDay = (e: EventItem) => e.endDate ?? e.date;

/** "19 e 20 de dezembro de 2026" / "December 19–20, 2026" / "19 y 20 de diciembre de 2026". */
export const formatDateRange = (start: string, end: string | undefined, locale: Locale = "pt") => {
  if (!end || end === start) return formatDateLong(start, locale);
  const a = parseDate(start, locale);
  const b = parseDate(end, locale);
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const twoDays = Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000) === 1;
  if (a.year === b.year && a.month === b.month) {
    if (locale === "en") return `${a.monthLong} ${a.day}–${b.day}, ${a.year}`;
    const sep = twoDays ? (locale === "es" ? " y " : " e ") : locale === "es" ? " al " : " a ";
    return `${a.day}${sep}${b.day} de ${a.monthLong} de ${a.year}`;
  }
  const to = locale === "en" ? " – " : locale === "es" ? " al " : " a ";
  return `${formatDateLong(start, locale)}${to}${formatDateLong(end, locale)}`;
};

/** Dia da semana de uma data AAAA-MM-DD. */
export const weekdayOf = (iso: string, locale: Locale = "pt") => {
  const [y, m, d] = iso.split("-").map(Number);
  return weekdays[locale][new Date(y, m - 1, d).getDay()];
};

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
