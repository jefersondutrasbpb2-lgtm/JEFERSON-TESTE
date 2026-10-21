import { events, formatDateLong, formatTime } from "@/content/data";
import { fullAddress, mapsDirectionsUrl } from "@/content/site";
import { asset } from "@/lib/asset";
import { Button } from "@/components/ui/Button";
import { ExpiresAfter } from "@/components/ui/ExpiresAfter";

/** Destaque do próximo evento marcado com `highlight` em agenda.json. */
export function Destaque() {
  const ev = events.find((e) => e.highlight && !e.example);
  if (!ev) return null;
  return (
    <ExpiresAfter date={ev.date}>
      <section className="section section--tight section-tone destaque" data-tone="green" data-tone-section="green" aria-labelledby="destaque-title">
        <div className="container destaque__grid">
          {ev.image && (
            <figure className="destaque__media" data-mask="up">
              <img src={asset(ev.image)} alt="Pr. Felipe Oliveira" width={620} height={775} loading="lazy" decoding="async" />
            </figure>
          )}
          <div className="destaque__copy">
            <p className="destaque__kicker" data-reveal>
              <span>Próximo evento</span>
              <span aria-hidden="true">·</span>
              <time dateTime={ev.date}>{formatDateLong(ev.date)}</time>
              {ev.time && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{formatTime(ev.time)}</span>
                </>
              )}
            </p>
            <h2 id="destaque-title" className="h1" data-split>
              {ev.title}
            </h2>
            {ev.description && (
              <p className="lead lead--wide" data-reveal>
                {ev.description}
              </p>
            )}
            {ev.verse && (
              <blockquote className="destaque__verse" data-reveal>
                <p>“{ev.verse.text}”</p>
                <cite>{ev.verse.ref}</cite>
              </blockquote>
            )}
            <p className="destaque__place small" data-reveal>
              {ev.location} — {fullAddress}
            </p>
            <div className="btn-row" data-reveal>
              <Button href={mapsDirectionsUrl} icon="arrow-up-right" external>
                Como chegar
              </Button>
              <Button href="/agenda/" variant="outline">
                Ver agenda
              </Button>
            </div>
          </div>
        </div>
      </section>
    </ExpiresAfter>
  );
}
