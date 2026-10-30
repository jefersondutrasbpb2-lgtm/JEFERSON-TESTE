import { site, visitCta } from "@/content/site";
import { media } from "@/content/media";
import { asset } from "@/lib/asset";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { t } from "@/i18n/server";

/**
 * Abertura em tela cheia com a fotografia do templo. Um véu em azul-marinho
 * (mais denso sob o texto) garante a leitura sem esconder a fachada.
 */
export function Hero() {
  const img = media.heroFachada;
  return (
    <section className="hero section-tone" data-tone="ink" data-tone-section="ink" aria-labelledby="hero-title">
      {img && (
        <div className="hero__bg">
          <div className="hero__bg-inner" data-parallax="7">
            <img
              className="hero__img"
              src={asset(img.src)}
              srcSet={[...(img.variants ?? []), { src: img.src, width: img.width }]
                .map((v) => `${asset(v.src)} ${v.width}w`)
                .join(", ")}
              sizes="(min-width: 1000px) 82vw, 100vw"
              alt={t(img.alt)}
              width={img.width}
              height={img.height}
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      )}
      <div className="hero__scrim" aria-hidden="true" />

      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__kicker" data-reveal data-load="">
            <span>{site.city} — Paraíba</span>
            <span className="hero__kicker-sep" aria-hidden="true" />
            <span>{t({ pt: "Desde 1970", en: "Since 1970", es: "Desde 1970" })}</span>
          </p>

          <h1 id="hero-title" className="display hero__title" data-split="load">
            {t({
              pt: (
                <>
                  Uma história de <em>fé, Palavra</em> e serviço.
                </>
              ),
              en: (
                <>
                  A story of <em>faith, the Word</em> and service.
                </>
              ),
              es: (
                <>
                  Una historia de <em>fe, Palabra</em> y servicio.
                </>
              ),
            })}
          </h1>

          <p className="lead hero__lead" data-reveal data-load="" data-delay="0.65">
            {t(site.description)}
          </p>

          <div className="btn-row hero__ctas" data-reveal data-load="" data-delay="0.85">
            <Button href="/nossa-historia/">
              {t({ pt: "Conheça nossa história", en: "Discover our history", es: "Conoce nuestra historia" })}
            </Button>
            <Button href={visitCta.href} variant="outline">
              {t(visitCta.label)}
            </Button>
          </div>
        </div>
      </div>

      <div className="container hero__foot" data-reveal data-load="" data-delay="1.1">
        <p className="hero__foot-item">
          <span className="hero__foot-label">{t({ pt: "Fundada em", en: "Founded", es: "Fundada el" })}</span>
          <span className="numeral">{t({ pt: "13 · 12 · 1970", en: "Dec 13 · 1970", es: "13 · 12 · 1970" })}</span>
        </p>
        <p className="hero__foot-item hero__foot-item--coords">
          <span className="hero__foot-label">Pombal, Paraíba</span>
          <span className="numeral">{t(site.coordinates)}</span>
        </p>
        <a href="#essencia" className="hero__scroll">
          <span>{t({ pt: "Role para conhecer", en: "Scroll to explore", es: "Desliza para conocer" })}</span>
          <Icon name="arrow-down" size={16} />
        </a>
      </div>
    </section>
  );
}
