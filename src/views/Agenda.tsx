import { events, todayInPombal } from "@/content/data";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { WeeklySchedule } from "@/components/ui/WeeklySchedule";
import { EventsBoard } from "@/components/ui/EventsBoard";
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

      {/* Eventos especiais (agenda.json): próximos e recentes */}
      {events.length > 0 && (
        <Section id="eventos" tone="sand" labelledBy="eventos-title" className="agenda-events">
          <div className="container" data-reveal>
            <EventsBoard items={events} builtOn={todayInPombal()} />
          </div>
        </Section>
      )}

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
