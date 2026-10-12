import Link from "next/link";
import { mainNav, site, visitCta, fullAddress, mapsDirectionsUrl } from "@/content/site";
import { scriptures } from "@/content/fe";
import { Icon } from "@/components/ui/Icon";
import { Pending } from "@/components/ui/Pending";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer section-tone" data-tone="ink" data-tone-section="ink">
      <div className="container">
        <div className="site-footer__doxology" data-reveal>
          <p className="site-footer__latin">Soli Deo Gloria</p>
          <p className="site-footer__dox h2">
            A Deus toda a honra, <em>glória e louvor.</em>
          </p>
          <p className="site-footer__ref xs">
            “{scriptures.gloria.text}” — {scriptures.gloria.ref}
          </p>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <BrandLogo />
            <p className="small muted">
              Fundada em {site.foundedLabel}.<br />
              {site.city} — {site.state}, {site.region}.
            </p>
          </div>

          <nav className="site-footer__col" aria-label="Rodapé — páginas">
            <h2 className="site-footer__title">Navegação</h2>
            <ul>
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href={visitCta.href}>{visitCta.label}</Link>
              </li>
            </ul>
          </nav>

          <div className="site-footer__col">
            <h2 className="site-footer__title">Visite-nos</h2>
            <address>
              <p className="small">
                {fullAddress} <Pending show={site.address.pending} />
              </p>
              <p className="small">
                <a href={site.phone.href}>{site.phone.display}</a> <Pending show={site.phone.pending} />
              </p>
              <p className="small">
                <a href={`mailto:${site.email.value}`}>{site.email.value}</a> <Pending show={site.email.pending} />
              </p>
            </address>
            <a className="link-arrow small" href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
              Como chegar <Icon name="arrow-up-right" size={14} />
              <span className="sr-only"> (abre o Google Maps em nova aba)</span>
            </a>
          </div>

          <div className="site-footer__col">
            <h2 className="site-footer__title">Acompanhe</h2>
            <ul className="site-footer__social">
              {site.social.map((s) =>
                s.href ? (
                  <li key={s.id}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      <Icon name={s.id as "instagram" | "youtube"} size={18} />
                      <span>
                        {s.label} <span className="muted">{s.handle}</span>
                      </span>
                      <span className="sr-only"> (abre em nova aba)</span>
                    </a>{" "}
                    <Pending show={s.pending} />
                  </li>
                ) : (
                  <li key={s.id} className="muted">
                    <Icon name={s.id as "instagram" | "youtube"} size={18} />
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
            <Link href="/contato/#privacidade">Privacidade e proteção de dados</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
