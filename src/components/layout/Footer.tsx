import { SiteLink } from "@/components/ui/SiteLink";
import { mainNav, site, visitCta, fullAddress, mapsDirectionsUrl } from "@/content/site";
import { scriptures } from "@/content/fe";
import { Icon } from "@/components/ui/Icon";
import { Pending } from "@/components/ui/Pending";
import { t } from "@/i18n/server";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer section-tone" data-tone="ink" data-tone-section="ink">
      <div className="container">
        <div className="site-footer__doxology" data-reveal>
          <p className="site-footer__latin">Soli Deo Gloria</p>
          <p className="site-footer__dox h2">
            {t({
              pt: (
                <>
                  A Deus toda a honra, <em>glória e louvor.</em>
                </>
              ),
              en: (
                <>
                  To God be all honor, <em>glory and praise.</em>
                </>
              ),
              es: (
                <>
                  A Dios sea toda la honra, <em>la gloria y la alabanza.</em>
                </>
              ),
            })}
          </p>
          <p className="site-footer__ref xs">
            “{t(scriptures.gloria.text)}” — {t(scriptures.gloria.ref)}
          </p>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <BrandLogo />
            <p className="small muted">
              {t({ pt: "Fundada em", en: "Founded on", es: "Fundada el" })} {t(site.foundedLabel)}.<br />
              {site.city} — {site.state}, {t(site.region)}.
            </p>
          </div>

          <nav className="site-footer__col" aria-label={t({ pt: "Rodapé — páginas", en: "Footer — pages", es: "Pie de página — páginas" })}>
            <h2 className="site-footer__title">{t({ pt: "Navegação", en: "Navigation", es: "Navegación" })}</h2>
            <ul>
              {mainNav.map((item) => (
                <li key={item.href}>
                  <SiteLink href={item.href}>{t(item.label)}</SiteLink>
                </li>
              ))}
              <li>
                <SiteLink href={visitCta.href}>{t(visitCta.label)}</SiteLink>
              </li>
            </ul>
          </nav>

          <div className="site-footer__col">
            <h2 className="site-footer__title">{t({ pt: "Visite-nos", en: "Visit us", es: "Visítanos" })}</h2>
            <address>
              <p className="small">
                {fullAddress} <Pending show={site.address.pending} />
              </p>
              {site.phone && (
                <p className="small">
                  <a href={site.phone.href}>{site.phone.display}</a> <Pending show={site.phone.pending} />
                </p>
              )}
              <p className="small">
                <a href={`mailto:${site.email.value}`}>{site.email.value}</a> <Pending show={site.email.pending} />
              </p>
            </address>
            <a className="link-arrow small" href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
              {t({ pt: "Como chegar", en: "Get directions", es: "Cómo llegar" })} <Icon name="arrow-up-right" size={14} />
              <span className="sr-only">
                {t({
                  pt: " (abre o Google Maps em nova aba)",
                  en: " (opens Google Maps in a new tab)",
                  es: " (abre Google Maps en una pestaña nueva)",
                })}
              </span>
            </a>
          </div>

          <div className="site-footer__col">
            <h2 className="site-footer__title">{t({ pt: "Acompanhe", en: "Follow us", es: "Síguenos" })}</h2>
            <ul className="site-footer__social">
              {site.social.map((s) =>
                s.href ? (
                  <li key={s.id}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      <Icon name={s.id} size={18} />
                      <span>
                        {s.label} <span className="muted">{s.handle}</span>
                      </span>
                      <span className="sr-only">
                        {t({ pt: " (abre em nova aba)", en: " (opens in a new tab)", es: " (se abre en una pestaña nueva)" })}
                      </span>
                    </a>{" "}
                    <Pending show={s.pending} />
                  </li>
                ) : (
                  <li key={s.id} className="muted">
                    <Icon name={s.id} size={18} />
                    <span>
                      {s.label} — {s.handle}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="site-footer__base xs">
          <p>
            © {year} {site.name}.
          </p>
          <p>
            <SiteLink href="/contato/#privacidade">
              {t({ pt: "Privacidade e proteção de dados", en: "Privacy and data protection", es: "Privacidad y protección de datos" })}
            </SiteLink>
          </p>
        </div>
      </div>
    </footer>
  );
}
