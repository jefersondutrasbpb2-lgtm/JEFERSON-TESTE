import { site, fullAddress, mapsDirectionsUrl } from "@/content/site";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { Pending } from "@/components/ui/Pending";
import { Photo } from "@/components/ui/Photo";
import { media } from "@/content/media";
import { t } from "@/i18n/server";

export function Visite() {
  return (
    <Section id="visite" tone="sand" labelledBy="visite-title" className="visite">
      <div className="container visite__grid">
        <div className="visite__copy">
          <h2 id="visite-title" className="h1" data-split>
            {t({
              pt: (
                <>
                  Há um lugar para você <em>caminhar conosco.</em>
                </>
              ),
              en: (
                <>
                  There is a place for you <em>to walk with us.</em>
                </>
              ),
              es: (
                <>
                  Hay un lugar para ti <em>para caminar con nosotros.</em>
                </>
              ),
            })}
          </h2>
          <p className="lead lead--wide" data-reveal>
            {t({
              pt: "Será uma alegria receber sua visita e compartilhar um tempo de comunhão e ensino da Palavra de Deus.",
              en: "It will be a joy to welcome you and share a time of fellowship and teaching from God's Word.",
              es: "Será una alegría recibir tu visita y compartir un tiempo de comunión y enseñanza de la Palabra de Dios.",
            })}
          </p>

          <ul className="visite__info" data-reveal="stagger">
            <li>
              <span className="visite__label">{t({ pt: "Endereço", en: "Address", es: "Dirección" })}</span>
              <span>
                {fullAddress} <Pending show={site.address.pending} />
              </span>
            </li>
            {site.phone && (
              <li>
                <span className="visite__label">{t({ pt: "Telefone", en: "Phone", es: "Teléfono" })}</span>
                <span>
                  <a href={site.phone.href}>{site.phone.display}</a> <Pending show={site.phone.pending} />
                </span>
              </li>
            )}
            <li>
              <span className="visite__label">{t({ pt: "E-mail", en: "Email", es: "Correo" })}</span>
              <span>
                <a href={`mailto:${site.email.value}`}>{site.email.value}</a> <Pending show={site.email.pending} />
              </span>
            </li>
          </ul>

          <div className="btn-row" data-reveal>
            <Button href={mapsDirectionsUrl} icon="arrow-up-right" external>
              {t({ pt: "Como chegar", en: "Get directions", es: "Cómo llegar" })}
            </Button>
            <Button href="/contato/" variant="text">
              {t({ pt: "Fale conosco", en: "Contact us", es: "Contáctanos" })}
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
            caption={{ pt: "Templo da IEC Pombal", en: "IEC Pombal church building", es: "Templo de la IEC Pombal" }}
          />
          <div className="visite__map" data-reveal>
            <MapEmbed />
          </div>
        </div>
      </div>
    </Section>
  );
}
