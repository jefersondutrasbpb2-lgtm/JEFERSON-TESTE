import type { Metadata } from "next";
import { events, formatTime, parseDate } from "@/content/data";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
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
        title={
          <>
            Tempo de adorar, <em>aprender e servir.</em>
          </>
        }
        lead="Programação regular da igreja. Participe — todos são bem-vindos."
      />

      <Section tone="paper" labelledBy="semana-title" className="section--tight agenda-week">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <h2 id="semana-title" className="h2" data-split>
              Toda semana
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
              Eventos e <em>celebrações</em>
            </h2>
          </div>

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
                      {e.verse && (
                        <p className="small event__verse">
                          “{e.verse.text}” <span className="muted">— {e.verse.ref}</span>
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
