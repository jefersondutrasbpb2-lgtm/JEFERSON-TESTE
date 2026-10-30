import { bomSamaritano, cedibsTotalServed } from "@/content/missoes";
import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { t } from "@/i18n/server";

export function Servico() {
  return (
    <Section tone="green" labelledBy="servico-title" className="servico">
      <div className="container servico__grid">
        <div className="servico__media">
          <Photo
            image={media.bsEnsino}
            slot="Atividades do projeto O Bom Samaritano"
            ratio="4 / 5"
            parallax={6}
            mask="up"
          />
        </div>

        <div className="servico__copy">
          <h2 id="servico-title" className="h2" data-split>
            {t({
              pt: (
                <>
                  O Bom Samaritano, <em>em Pombal e Paulista.</em>
                </>
              ),
              en: (
                <>
                  O Bom Samaritano, <em>in Pombal and Paulista.</em>
                </>
              ),
              es: (
                <>
                  O Bom Samaritano, <em>en Pombal y Paulista.</em>
                </>
              ),
            })}
          </h2>
          <div className="prose" data-reveal>
            {t({
              pt: (
                <p>
                  A igreja abriga e apoia o <strong>{bomSamaritano.entity}</strong>, dedicado ao desenvolvimento integral
                  de crianças, adolescentes e jovens e ao cuidado de suas famílias — expressão concreta do amor ao próximo
                  ensinado por Jesus.
                </p>
              ),
              en: (
                <p>
                  The church hosts and supports <strong>{bomSamaritano.entity}</strong> ({t(bomSamaritano.entityTranslation)}
                  ), devoted to the integral development of children, teenagers and young people and to the care of their
                  families — a concrete expression of the love for our neighbor taught by Jesus.
                </p>
              ),
              es: (
                <p>
                  La iglesia acoge y apoya el <strong>{bomSamaritano.entity}</strong> ({t(bomSamaritano.entityTranslation)}
                  ), dedicado al desarrollo integral de niños, adolescentes y jóvenes y al cuidado de sus familias,
                  expresión concreta del amor al prójimo que enseñó Jesús.
                </p>
              ),
            })}
          </div>

          <div className="servico__stat" data-reveal>
            <p className="servico__stat-value numeral" data-count={cedibsTotalServed}>
              {cedibsTotalServed}
            </p>
            <p className="servico__stat-label">
              {t({
                pt: "crianças, adolescentes e jovens atendidos",
                en: "children, teenagers and young people served",
                es: "niños, adolescentes y jóvenes atendidos",
              })}{" "}
              —{" "}
              {bomSamaritano.units
                .map((u) => `${u.served} ${t({ pt: "em", en: "in", es: "en" })} ${u.city.replace(" — PB", "")}`)
                .join(t({ pt: " e ", en: " and ", es: " y " }))}
            </p>
          </div>

          <p className="servico__privacy xs" data-reveal>
            {t({
              pt: "Preservamos a imagem e a privacidade das crianças atendidas. Fotografias do projeto são publicadas apenas com autorização dos responsáveis.",
              en: "We protect the image and privacy of the children we serve. Project photos are published only with the consent of their parents or guardians.",
              es: "Protegemos la imagen y la privacidad de los niños atendidos. Las fotografías del proyecto se publican solo con autorización de sus padres o tutores.",
            })}
          </p>

          <div className="btn-row" data-reveal>
            <Button href="/missoes/#bom-samaritano" variant="outline">
              {t({ pt: "Conheça o projeto", en: "Learn about the project", es: "Conoce el proyecto" })}
            </Button>
            <Button href={`https://www.instagram.com/${bomSamaritano.instagram}/`} variant="text" icon="arrow-up-right" external>
              @{bomSamaritano.instagram}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
