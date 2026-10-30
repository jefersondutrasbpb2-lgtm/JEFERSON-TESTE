import { events, formatTime, parseDate } from "@/content/data";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { WeeklySchedule } from "@/components/ui/WeeklySchedule";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { getLocale, t } from "@/i18n/server";

export const metadataFor = (locale: Locale) =>
  pageMetadata(locale, {
    path: "/agenda/",
    title: { pt: "Agenda", en: "Schedule", es: "Agenda" },
    description: {
      pt: "Cultos, reuniões e eventos da Igreja Evangélica Congregacional de Pombal.",
      en: "Worship services, gatherings and events of the Congregational Evangelical Church of Pombal.",
      es: "Cultos, reuniones y eventos de la Iglesia Evangélica Congregacional de Pombal.",
    },
  });

export default function AgendaPage() {
  const locale = getLocale();
  return (
    <>
      <PageHero
        tone="paper"
        title={t({
          pt: (
            <>
              Tempo de adorar, <em>aprender e servir.</em>
            </>
          ),
          en: (
            <>
              A time to worship, <em>learn and serve.</em>
            </>
          ),
          es: (
            <>
              Tiempo de adorar, <em>aprender y servir.</em>
            </>
          ),
        })}
        lead={t({
          pt: "Programação regular da igreja. Participe — todos são bem-vindos.",
          en: "The church's regular schedule. Join us — everyone is welcome. Services are held in Portuguese.",
          es: "Programación regular de la iglesia. Participa: todos son bienvenidos. Los cultos se realizan en portugués.",
        })}
      />

      <Section tone="paper" labelledBy="semana-title" className="section--tight agenda-week">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <h2 id="semana-title" className="h2" data-split>
              {t({ pt: "Toda semana", en: "Every week", es: "Cada semana" })}
            </h2>
          </div>
          <WeeklySchedule />
        </div>
      </Section>

      {/* Eventos especiais: a seção aparece quando houver eventos em agenda.json */}
      {events.length > 0 && (
      <Section tone="sand" labelledBy="eventos-title" className="agenda-events">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <h2 id="eventos-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Eventos e <em>celebrações</em>
                  </>
                ),
                en: (
                  <>
                    Events and <em>celebrations</em>
                  </>
                ),
                es: (
                  <>
                    Eventos y <em>celebraciones</em>
                  </>
                ),
              })}
            </h2>
          </div>

          <ol className="events" data-reveal="stagger">
              {events.map((e) => {
                const d = parseDate(e.date, locale);
                return (
                  <li key={e.id} className="event">
                    <time className="event__date" dateTime={e.date}>
                      <span className="event__day numeral">{String(d.day).padStart(2, "0")}</span>
                      <span className="event__month">
                        {d.monthShort} {d.year}
                      </span>
                    </time>
                    <div className="event__body">
                      {e.category && <p className="event__cat">{t(e.category)}</p>}
                      <h3 className="event__title">{t(e.title)}</h3>
                      <p className="event__meta small">
                        {e.time && <span>{formatTime(e.time, locale)}</span>}
                        {e.location && <span>{t(e.location)}</span>}
                      </p>
                      {e.description && <p className="small muted">{t(e.description)}</p>}
                      {e.verse && (
                        <p className="small event__verse">
                          “{t(e.verse.text)}” <span className="muted">— {t(e.verse.ref)}</span>
                        </p>
                      )}
                      {e.example && <span className="pending">exemplo de layout</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
        </div>
      </Section>
      )}

      <Section tone="ink" className="section--tight cta-band">
        <div className="container cta-band__inner">
          <p className="h3 font-display" data-reveal>
            {t({ pt: "Primeira vez por aqui?", en: "First time here?", es: "¿Primera vez por aquí?" })}
          </p>
          <div data-reveal>
            <Button href="/visite/">{t({ pt: "Planeje sua visita", en: "Plan your visit", es: "Planifica tu visita" })}</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
