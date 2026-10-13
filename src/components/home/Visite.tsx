import { site, fullAddress, mapsDirectionsUrl } from "@/content/site";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { Pending } from "@/components/ui/Pending";
import { Photo } from "@/components/ui/Photo";
import { media } from "@/content/media";

export function Visite() {
  return (
    <Section id="visite" tone="sand" labelledBy="visite-title" className="visite">
      <div className="container visite__grid">
        <div className="visite__copy">
          <h2 id="visite-title" className="h1" data-split>
            Há um lugar para você <em>caminhar conosco.</em>
          </h2>
          <p className="lead lead--wide" data-reveal>
            Será uma alegria receber sua visita e compartilhar um tempo de comunhão e ensino da Palavra de Deus.
          </p>

          <ul className="visite__info" data-reveal="stagger">
            <li>
              <span className="visite__label">Endereço</span>
              <span>
                {fullAddress} <Pending show={site.address.pending} />
              </span>
            </li>
            {site.phone && (
              <li>
                <span className="visite__label">Telefone</span>
                <span>
                  <a href={site.phone.href}>{site.phone.display}</a> <Pending show={site.phone.pending} />
                </span>
              </li>
            )}
            <li>
              <span className="visite__label">E-mail</span>
              <span>
                <a href={`mailto:${site.email.value}`}>{site.email.value}</a> <Pending show={site.email.pending} />
              </span>
            </li>
          </ul>

          <div className="btn-row" data-reveal>
            <Button href={mapsDirectionsUrl} icon="arrow-up-right" external>
              Como chegar
            </Button>
            <Button href="/contato/" variant="text">
              Fale conosco
            </Button>
          </div>
        </div>

        <div className="visite__media">
          <Photo
            image={media.fachadaRua}
            slot="Fachada do templo"
            ratio="16 / 10"
            mask="up"
            parallax={5}
            caption="Templo da IEC Pombal"
          />
          <div className="visite__map" data-reveal>
            <MapEmbed />
          </div>
        </div>
      </div>
    </Section>
  );
}
