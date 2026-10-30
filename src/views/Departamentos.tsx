import { departments } from "@/content/departamentos";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { scriptures } from "@/content/fe";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { t } from "@/i18n/server";

export const metadataFor = (locale: Locale) =>
  pageMetadata(locale, {
    path: "/departamentos/",
    title: { pt: "Departamentos", en: "Departments", es: "Departamentos" },
    description: {
      pt: "UHC, UAC, DIC, UMEC e UAEC: conheça os departamentos da Igreja Evangélica Congregacional de Pombal, que reúnem homens, mulheres, jovens, adolescentes e crianças.",
      en: "UHC, UAC, DIC, UMEC and UAEC: meet the departments of the Congregational Evangelical Church of Pombal, which bring together men, women, youth, teenagers and children.",
      es: "UHC, UAC, DIC, UMEC y UAEC: conoce los departamentos de la Iglesia Evangélica Congregacional de Pombal, que reúnen a hombres, mujeres, jóvenes, adolescentes y niños.",
    },
  });

export default function DepartamentosPage() {
  return (
    <>
      <PageHero
        tone="paper"
        title={t({
          pt: (
            <>
              Muitos dons, <em>um só corpo.</em>
            </>
          ),
          en: (
            <>
              Many gifts, <em>one body.</em>
            </>
          ),
          es: (
            <>
              Muchos dones, <em>un solo cuerpo.</em>
            </>
          ),
        })}
        lead={t({
          pt: "A vida da igreja se organiza em departamentos que reúnem homens, mulheres, jovens, adolescentes e crianças — cada um a serviço do Evangelho.",
          en: "Church life is organized into departments that bring together men, women, youth, teenagers and children — each one serving the Gospel.",
          es: "La vida de la iglesia se organiza en departamentos que reúnen a hombres, mujeres, jóvenes, adolescentes y niños, cada uno al servicio del Evangelio.",
        })}
        aside={
          <p className="small muted">
            “{t(scriptures.servico.text)}”
            <br />
            <span className="xs">
              {t(scriptures.servico.ref)} · {t(scriptures.servico.version)}
            </span>
          </p>
        }
      />

      <Section tone="paper" labelledBy="areas-title" className="section--tight ministries">
        <div className="container">
          <h2 id="areas-title" className="sr-only">
            {t({ pt: "Departamentos da igreja", en: "Church departments", es: "Departamentos de la iglesia" })}
          </h2>
          <ol className="ministries__list">
            {departments.map((m) => (
              <li key={m.id} id={m.id} className="ministry" data-reveal>
                <h3 className="ministry__title">
                  <abbr className="ministry__acronym font-display" title={m.name}>
                    {m.acronym}
                  </abbr>
                  <span className="ministry__name" lang="pt-BR">
                    {m.name}
                  </span>
                  {t(m.nameTranslation) && t(m.nameTranslation) !== m.name && (
                    <span className="ministry__translation">{t(m.nameTranslation)}</span>
                  )}
                </h3>
                <div className="ministry__body">
                  <p>{t(m.summary)}</p>
                  {(m.leaders || m.schedule) && (
                    <dl className="ministry__meta">
                      {m.leaders && (
                        <div>
                          <dt>{t({ pt: "Coordenação", en: "Leadership", es: "Coordinación" })}</dt>
                          <dd>{m.leaders}</dd>
                        </div>
                      )}
                      {m.schedule && (
                        <div>
                          <dt>{t({ pt: "Quando", en: "When", es: "Cuándo" })}</dt>
                          <dd>{m.schedule}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="ink" labelledBy="servir-title" className="serve-call">
        <div className="container serve-call__grid">
          <div>
            <h2 id="servir-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Há um lugar para você <em>servir.</em>
                  </>
                ),
                en: (
                  <>
                    There is a place for you <em>to serve.</em>
                  </>
                ),
                es: (
                  <>
                    Hay un lugar para que <em>sirvas.</em>
                  </>
                ),
              })}
            </h2>
          </div>
          <div className="serve-call__body" data-reveal>
            <p className="prose">
              {t({
                pt: "Quer conhecer melhor algum departamento ou saber como participar? Converse conosco: teremos alegria em orientar você.",
                en: "Would you like to know more about a department or how to take part? Talk to us — we will be glad to help.",
                es: "¿Quieres conocer mejor algún departamento o saber cómo participar? Conversa con nosotros: tendremos el gusto de orientarte.",
              })}
            </p>
            <div className="btn-row">
              <Button href="/contato/">{t({ pt: "Fale conosco", en: "Contact us", es: "Contáctanos" })}</Button>
              <Button href="/agenda/" variant="outline">
                {t({ pt: "Ver agenda", en: "See schedule", es: "Ver agenda" })}
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
