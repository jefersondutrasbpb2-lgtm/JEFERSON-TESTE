"use client";

import { useEffect, useState } from "react";
import {
  formatDateLong,
  formatDateRange,
  formatTime,
  isUpcoming,
  lastDay,
  todayInPombal,
  weekdayOf,
  type EventItem,
} from "@/content/data";
import { fullAddress, mapsDirectionsUrl } from "@/content/site";
import { asset } from "@/lib/asset";
import { useLocale, useT } from "@/i18n/client";
import { Icon } from "./Icon";

const RECENT_MAX = 6;

const addHours = (time: string, h: number) => {
  const [hh, mm] = time.split(":").map(Number);
  return `${String(Math.min(hh + h, 23)).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/** Link "Adicionar à agenda" do Google Agenda, no fuso de Pombal. */
function calendarUrl(e: EventItem, title: string, details: string) {
  const day = e.date.replace(/-/g, "");
  const endDay = lastDay(e).replace(/-/g, "");
  let dates: string;
  if (e.time) {
    const end = e.endTime ?? addHours(e.time, 2);
    dates = `${day}T${e.time.replace(":", "")}00/${endDay}T${end.replace(":", "")}00`;
  } else {
    const [y, m, d] = lastDay(e).split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replace(/-/g, "");
    dates = `${day}/${next}`;
  }
  const q = new URLSearchParams({ action: "TEMPLATE", text: title, dates, ctz: "America/Fortaleza", location: fullAddress, details });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

/**
 * Próximos eventos e eventos recentes. A divisão é refeita no navegador com a
 * data de hoje: depois do dia do evento, ele passa sozinho para "Eventos recentes".
 */
export function EventsBoard({ items, builtOn }: { items: EventItem[]; builtOn: string }) {
  const locale = useLocale();
  const t = useT();
  const [today, setToday] = useState(builtOn);
  useEffect(() => setToday(todayInPombal()), []);

  const upcoming = items.filter((e) => isUpcoming(e, today));
  const recent = items
    .filter((e) => !isUpcoming(e, today))
    .reverse()
    .slice(0, RECENT_MAX);

  const newTab = t({ pt: " (abre em nova aba)", en: " (opens in a new tab)", es: " (se abre en una pestaña nueva)" });

  const Poster = ({ e, className }: { e: EventItem; className: string }) =>
    e.poster ? (
      <a className={className} href={asset(e.poster.src)} target="_blank" rel="noopener">
        <img
          src={asset(e.poster.src)}
          alt={t(e.poster.alt)}
          width={e.poster.width}
          height={e.poster.height}
          loading="lazy"
          decoding="async"
        />
        <span className="ev-poster__zoom" aria-hidden="true">
          <Icon name="arrow-up-right" size={14} />
          {t({ pt: "Ver cartaz", en: "View poster", es: "Ver cartel" })}
        </span>
        <span className="sr-only">
          {t({ pt: "Ver o cartaz em tamanho real", en: "View the full-size poster", es: "Ver el cartel en tamaño real" })}
          {newTab}
        </span>
      </a>
    ) : null;

  return (
    <div className="events-board">
      <div className="events-board__group">
        <h2 id="eventos-title" className="h2">
          {t({ pt: "Próximos eventos", en: "Upcoming events", es: "Próximos eventos" })}
        </h2>
        {upcoming.length ? (
          <ol className="ev-list">
            {upcoming.map((e) => {
              const title = t(e.title);
              return (
                <li key={e.id} id={`evento-${e.id}`} className="ev-feature">
                  <Poster e={e} className="ev-poster ev-feature__poster" />
                  <div className="ev-feature__body">
                    <p className="ev-kicker">
                      {e.category && <span>{t(e.category)}</span>}
                      <time dateTime={e.date}>{formatDateRange(e.date, e.endDate, locale)}</time>
                    </p>
                    <h3 className="ev-feature__title">{title}</h3>
                    <dl className="ev-facts">
                      <div>
                        <dt>{t({ pt: "Quando", en: "When", es: "Cuándo" })}</dt>
                        <dd>
                          {e.endDate && e.endDate !== e.date
                            ? formatDateRange(e.date, e.endDate, locale)
                            : `${weekdayOf(e.date, locale)}, ${formatDateLong(e.date, locale)}`}
                          {e.time && ` · ${formatTime(e.time, locale)}`}
                        </dd>
                      </div>
                      {e.program && e.program.length > 0 && (
                        <div>
                          <dt>{t({ pt: "Programação", en: "Program", es: "Programa" })}</dt>
                          <dd>
                            <ul className="ev-program">
                              {e.program.map((d) => {
                                const day = Number(d.date.slice(8, 10));
                                return (
                                  <li key={d.date + (d.time ?? "")}>
                                    <span className="ev-program__day">
                                      {t({ pt: "Dia", en: "Day", es: "Día" })} {day}
                                      <span className="ev-program__wd">
                                        {" "}
                                        · {weekdayOf(d.date, locale).replace(/-feira$/, "").toLowerCase()}
                                        {d.time && ` · ${formatTime(d.time, locale)}`}
                                      </span>
                                    </span>
                                    {d.speaker && <span className="ev-program__who">{t(d.speaker)}</span>}
                                    {d.role && <span className="ev-program__role">{t(d.role)}</span>}
                                  </li>
                                );
                              })}
                            </ul>
                          </dd>
                        </div>
                      )}
                      {e.speaker && (
                        <div>
                          <dt>{t({ pt: "Com", en: "With", es: "Con" })}</dt>
                          <dd>{t(e.speaker)}</dd>
                        </div>
                      )}
                      <div>
                        <dt>{t({ pt: "Onde", en: "Where", es: "Dónde" })}</dt>
                        <dd>
                          {e.location ? `${t(e.location)} — ` : ""}
                          {fullAddress}
                        </dd>
                      </div>
                    </dl>
                    {e.description && <p className="ev-feature__text">{t(e.description)}</p>}
                    {e.verse && (
                      <blockquote className="ev-verse">
                        <p>“{t(e.verse.text)}”</p>
                        <cite>{t(e.verse.ref)}</cite>
                      </blockquote>
                    )}
                    <div className="btn-row">
                      <a
                        className="btn btn--solid"
                        href={calendarUrl(e, title, e.description ? t(e.description) : "")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="btn__label">
                          {t({ pt: "Adicionar à agenda", en: "Add to calendar", es: "Añadir al calendario" })}
                        </span>
                        <span className="btn__icon" aria-hidden="true">
                          <Icon name="arrow-up-right" size={16} />
                        </span>
                        <span className="sr-only">{newTab}</span>
                      </a>
                      <a className="btn btn--outline" href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
                        <span className="btn__label">{t({ pt: "Como chegar", en: "Get directions", es: "Cómo llegar" })}</span>
                        <span className="btn__icon" aria-hidden="true">
                          <Icon name="arrow-up-right" size={16} />
                        </span>
                        <span className="sr-only">{newTab}</span>
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="note">
            {t({
              pt: "Nenhum evento especial marcado no momento. Os cultos da semana continuam normalmente.",
              en: "No special events scheduled at the moment. Weekly services continue as usual.",
              es: "No hay eventos especiales programados por ahora. Los cultos de la semana siguen con normalidad.",
            })}
          </p>
        )}
      </div>

      {recent.length > 0 && (
        <div className="events-board__group">
          <h2 className="h3">{t({ pt: "Eventos recentes", en: "Recent events", es: "Eventos recientes" })}</h2>
          <ul className="ev-grid">
            {recent.map((e) => (
              <li key={e.id} id={`evento-${e.id}`} className="ev-card">
                <Poster e={e} className="ev-poster ev-card__poster" />
                <div className="ev-card__body">
                  <p className="ev-kicker">
                    {e.category && <span>{t(e.category)}</span>}
                    <time dateTime={e.date}>
                      {t({ pt: "Realizado em ", en: "Held on ", es: "Realizado el " })}
                      {formatDateRange(e.date, e.endDate, locale)}
                    </time>
                  </p>
                  <h3 className="ev-card__title">{t(e.title)}</h3>
                  {e.speaker && <p className="ev-card__speaker">{t(e.speaker)}</p>}
                  {(e.recap ?? e.description) && <p className="small muted">{t(e.recap ?? e.description!)}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
