import agendaData from "./agenda.json";
import mensagensData from "./mensagens.json";
import { reviewMode } from "./site";

export type WeeklyItem = {
  id: string;
  day: string;
  dayIndex: number;
  time: string;
  title: string;
  description?: string;
  pending?: boolean;
};

export type EventItem = {
  id: string;
  date: string;
  time?: string;
  title: string;
  location?: string;
  description?: string;
  category?: string;
  example?: boolean;
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

export const weekly: WeeklyItem[] = agendaData.weekly;
export const events: EventItem[] = visible(agendaData.events as EventItem[]).sort((a, b) => a.date.localeCompare(b.date));
export const messages: Message[] = visible(mensagensData.items as Message[]).sort((a, b) => b.date.localeCompare(a.date));
export const channelUrl: string = mensagensData.channelUrl;

export const formatTime = (t: string) => {
  const [h, m] = t.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
};

const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const monthsLong = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export const parseDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m, day: d, monthShort: months[m - 1], monthLong: monthsLong[m - 1] };
};

export const formatDateLong = (iso: string) => {
  const p = parseDate(iso);
  return `${p.day} de ${p.monthLong} de ${p.year}`;
};
