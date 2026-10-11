import type { Metadata } from "next";
import { events, formatTime, parseDate } from "@/content/data";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { WeeklySchedule } from "@/components/ui/WeeklySchedule";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Cultos, reuniões e eventos da Igreja Evangélica Congregacional de Pombal.",
  alternates: { canonical: "/agenda/" },
};

export default function AgendaPage() {
  return (
    <>
      <PageHero
        tone="paper"
        index="Programação"
        eyebrow="Agenda"
        title={
          <>
            Tempo de adorar, <em>aprender e servir.</em>
          </>
        }
        lead="Programação regular da igreja e próximos eventos. Participe — todos são bem-vindos."
      />

      <Section tone="paper" labelledBy="semana-title" className="section--tight agenda-week">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <div data-reveal>
              <Eyebrow index="Semanal">Programação regular</Eyebrow>
            </div>
            <h2 id="semana-title" className="h2" data-split>
              Toda semana
            </h2>
          </div>
          <WeeklySchedule />
        </div>
      </Section>

      <Section tone="sand" labelledBy="eventos-title" className="agenda-events">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <div data-reveal>
              <Eyebrow index="Calendário">Próximos eventos</Eyebrow>
            </div>
            <h2 id="eventos-title" className="h2" data-split>
              Eventos e <em>celebrações</em>
            </h2>
          </div>

          {events.length > 0 ? (
            <ol className="events" data-reveal="stagger">
              {events.map((e) => {
                const d = parseDate(e.date);
                return (
                  <li key={e.id} className="event">
                    <time className="event__date" dateTime={e.date}>
                      <span className="event__day numeral">{String(d.day).padStart(2, "0")}</span>
                      <span className="event__month">
                        {d.monthShort} {d.year}
                      </span>
                    </time>
                    <div className="event__body">
                      {e.category && <p className="event__cat">{e.category}</p>}
                      <h3 className="event__title">{e.title}</h3>
                      <p className="event__meta small">
                        {e.time && <span>{formatTime(e.time)}</span>}
                        {e.location && <span>{e.location}</span>}
                      </p>
                      {e.description && <p className="small muted">{e.description}</p>}
                      {e.example && <span className="pending">exemplo de layout</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="library-empty">
              <p className="muted">Nenhum evento especial programado no momento. Acompanhe a programação regular.</p>
            </div>
          )}
        </div>
      </Section>

      <Section tone="ink" className="section--tight cta-band">
        <div className="container cta-band__inner">
          <p className="h3 serif" data-reveal>
            Primeira vez por aqui?
          </p>
          <div data-reveal>
            <Button href="/visite/">Planeje sua visita</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
