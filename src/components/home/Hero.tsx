import { site, visitCta } from "@/content/site";
import { media } from "@/content/media";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Icon } from "@/components/ui/Icon";

export function Hero() {
  return (
    <section className="hero section-tone" data-tone="ink" data-tone-section="ink" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__kicker" data-reveal data-load="">
            <span>
              {site.city} — Paraíba
            </span>
            <span className="hero__kicker-sep" aria-hidden="true" />
            <span>Desde 1970</span>
          </p>

          <h1 id="hero-title" className="display hero__title" data-split="load">
            Uma história de <em>fé, Palavra</em> e serviço.
          </h1>

          <p className="lead hero__lead" data-reveal data-load="" data-delay="0.65">
            {site.description}
          </p>

          <div className="btn-row hero__ctas" data-reveal data-load="" data-delay="0.85">
            <Button href="/nossa-historia/">Conheça nossa história</Button>
            <Button href={visitCta.href} variant="outline">
              {visitCta.label}
            </Button>
          </div>
        </div>

        <div className="hero__media" aria-hidden={media.heroFachada ? undefined : true}>
          <svg className="hero__arch-lines" viewBox="0 0 400 620" fill="none" aria-hidden="true">
            <path
              d="M6 620 V206 A194 194 0 0 1 394 206 V620"
              stroke="currentColor"
              strokeWidth="1"
              data-draw="load"
              data-delay="0.3"
              data-duration="2.4"
            />
          </svg>
          <Photo
            className="hero__arch"
            image={media.heroFachada}
            slot="Fachada ou interior do templo da IEC Pombal"
            ratio="400 / 620"
            priority
            parallax={6}
            mask="up"
            maskOnLoad
            maskDelay={0.25}
          />
        </div>
      </div>

      <div className="container hero__foot" data-reveal data-load="" data-delay="1.1">
        <p className="hero__foot-item">
          <span className="hero__foot-label">Fundada em</span>
          <span className="numeral">13 · 12 · 1970</span>
        </p>
        <p className="hero__foot-item hero__foot-item--coords">
          <span className="hero__foot-label">Pombal, Paraíba</span>
          <span className="numeral">{site.coordinates}</span>
        </p>
        <a href="#essencia" className="hero__scroll">
          <span>Role para conhecer</span>
          <Icon name="arrow-down" size={16} />
        </a>
      </div>
    </section>
  );
}
