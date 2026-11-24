import {
  events,
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
import { Button } from "@/components/ui/Button";
import { ExpiresAfter } from "@/components/ui/ExpiresAfter";
import { FirstActive } from "@/components/ui/FirstActive";
import { SiteLink } from "@/components/ui/SiteLink";
import { getLocale, t } from "@/i18n/server";

/**
 * Destaque dos eventos marcados com `highlight` em agenda.json: aparece o
 * próximo; quando ele termina, o seguinte assume sozinho (horário de Pombal).
 */
export function Destaque() {
  const today = todayInPombal();
  const list = events.filter((e) => e.highlight && !e.example && isUpcoming(e, today));
  if (!list.length) return null;
  return (
    <FirstActive until={list.map(lastDay)}>
      {list.map((ev, i) => (
        <DestaqueEvento key={ev.id} ev={ev} also={list.slice(i + 1, i + 3)} />
      ))}
    </FirstActive>
  );
}

function DestaqueEvento({ ev, also }: { ev: EventItem; also: EventItem[] }) {
  const locale = getLocale();
  return (
      <section className="section section--tight section-tone destaque" data-tone="green" data-tone-section="green" aria-labelledby="destaque-title">
        <div className="container destaque__grid">
          {ev.poster && (
            <figure className="destaque__media destaque__media--poster" data-mask="up">
              <img
                src={asset(ev.poster.src)}
                alt={t(ev.poster.alt)}
                width={ev.poster.width}
                height={ev.poster.height}
                loading="lazy"
                decoding="async"
              />
            </figure>
          )}
          <div className="destaque__copy">
            <p className="destaque__kicker" data-reveal>
              <span>{t({ pt: "Próximo evento", en: "Upcoming event", es: "Próximo evento" })}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={ev.date}>{formatDateRange(ev.date, ev.endDate, locale)}</time>
              {ev.time && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{formatTime(ev.time, locale)}</span>
                </>
              )}
              {!ev.time && ev.when && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{t(ev.when)}</span>
                </>
              )}
            </p>
            <h2 id="destaque-title" className="h1" data-split>
              {t(ev.title)}
            </h2>
            {ev.description && (
              <p className="lead lead--wide" data-reveal>
                {t(ev.description)}
              </p>
            )}
            {ev.verse && (
              <blockquote className="destaque__verse" data-reveal>
                <p>“{t(ev.verse.text)}”</p>
                <cite>{t(ev.verse.ref)}</cite>
              </blockquote>
            )}
            {ev.program && ev.program.length > 0 && (
              <ul className="destaque__program" data-reveal>
                {ev.program.map((d) => (
                  <li key={d.date + (d.time ?? "")}>
                    <span className="destaque__program-day">
                      {t({ pt: "Dia", en: "Day", es: "Día" })} {Number(d.date.slice(8, 10))}
                      <small>
                        {weekdayOf(d.date, locale).replace(/-feira$/, "").toLowerCase()}
                        {d.time && ` · ${formatTime(d.time, locale)}`}
                      </small>
                    </span>
                    {d.speaker && <strong>{t(d.speaker)}</strong>}
                    {d.role && <span className="destaque__program-role">{t(d.role)}</span>}
                  </li>
                ))}
              </ul>
            )}
            {ev.speaker && (
              <p className="destaque__speaker" data-reveal>
                {t({ pt: "Com ", en: "With ", es: "Con " })}
                <strong>{t(ev.speaker)}</strong>
              </p>
            )}
            {ev.signup && (
              <ExpiresAfter date={ev.signup.deadline}>
                <p className="destaque__signup" data-reveal>
                  {t(ev.signup.how)}{" "}
                  <strong>
                    {t({ pt: "até ", en: "by ", es: "hasta el " })}
                    {formatDateLong(ev.signup.deadline, locale)}
                  </strong>
                </p>
              </ExpiresAfter>
            )}
            <p className="destaque__place small" data-reveal>
              {ev.location ? t(ev.location) : null} — {fullAddress}
            </p>
            <div className="btn-row" data-reveal>
              <Button href={mapsDirectionsUrl} icon="arrow-up-right" external>
                {t({ pt: "Como chegar", en: "Get directions", es: "Cómo llegar" })}
              </Button>
              <Button href="/agenda/#eventos" variant="outline">
                {t({ pt: "Ver todos os eventos", en: "See all events", es: "Ver todos los eventos" })}
              </Button>
            </div>
            {also.length > 0 && (
              <div className="destaque__also" data-reveal>
                <p className="destaque__also-label">{t({ pt: "Também na agenda", en: "Also coming up", es: "También en la agenda" })}</p>
                <ul>
                  {also.map((e) => (
                    <li key={e.id}>
                      <SiteLink href={`/agenda/#evento-${e.id}`}>
                        <strong>{t(e.title)}</strong> · {formatDateRange(e.date, e.endDate, locale)}
                      </SiteLink>
                      {e.signup && (
                        <ExpiresAfter date={e.signup.deadline}>
                          <span className="destaque__also-note">
                            {t({ pt: "Dê seu nome até ", en: "Sign up by ", es: "Da tu nombre hasta el " })}
                            {formatDateLong(e.signup.deadline, locale)}
                          </span>
                        </ExpiresAfter>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
  );
}
