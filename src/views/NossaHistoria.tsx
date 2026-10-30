import { currentPastor, firstBoard, firstCouncil, founding, pastors, pastorsNote } from "@/content/historia";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { Story } from "@/components/history/Story";
import { Caminhada } from "@/components/home/Caminhada";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { t } from "@/i18n/server";

export const metadataFor = (locale: Locale) =>
  pageMetadata(locale, {
    path: "/nossa-historia/",
    title: { pt: "Nossa História", en: "Our History", es: "Nuestra Historia" },
    description: {
      pt: "Fundada em 13 de dezembro de 1970, a Igreja Evangélica Congregacional de Pombal nasceu de uma reunião de irmãos na residência de Gerson Martins de Sá e Eusa Dantas de Sá.",
      en: "Founded on December 13, 1970, the Congregational Evangelical Church of Pombal was born from a gathering of believers at the home of Gerson Martins de Sá and Eusa Dantas de Sá.",
      es: "Fundada el 13 de diciembre de 1970, la Iglesia Evangélica Congregacional de Pombal nació de una reunión de hermanos en la casa de Gerson Martins de Sá y Eusa Dantas de Sá.",
    },
  });

export default function HistoriaPage() {
  return (
    <>
      <PageHero
        tone="paper"
        title={t({
          pt: (
            <>
              Uma história de fé que começou <em>em um lar.</em>
            </>
          ),
          en: (
            <>
              A story of faith that began <em>in a home.</em>
            </>
          ),
          es: (
            <>
              Una historia de fe que comenzó <em>en un hogar.</em>
            </>
          ),
        })}
        lead={t({
          pt: "Da reunião fundadora em Pombal aos campos missionários no Sertão, no Seridó e na Amazônia: a trajetória de uma igreja dedicada à pregação do Evangelho de Jesus Cristo.",
          en: "From the founding gathering in Pombal to the mission fields in the Sertão, the Seridó and the Amazon: the journey of a church devoted to preaching the Gospel of Jesus Christ.",
          es: "De la reunión fundacional en Pombal a los campos misioneros en el Sertón, el Seridó y la Amazonía: la trayectoria de una iglesia dedicada a la predicación del Evangelio de Jesucristo.",
        })}
        aside={
          <dl className="hero-facts">
            <div>
              <dt>{t({ pt: "Fundação", en: "Founded", es: "Fundación" })}</dt>
              <dd className="numeral">{founding.dateShort}</dd>
            </div>
            <div>
              <dt>{t({ pt: "Membros fundadores", en: "Founding members", es: "Miembros fundadores" })}</dt>
              <dd className="numeral">{founding.initialMembers}</dd>
            </div>
            <div>
              <dt>{t({ pt: "Tradição", en: "Tradition", es: "Tradición" })}</dt>
              <dd>{t({ pt: "Congregacional · Reformada", en: "Congregational · Reformed", es: "Congregacional · Reformada" })}</dd>
            </div>
          </dl>
        }
      />

      <Story />

      <Section tone="sand" labelledBy="registros-title" className="records">
        <div className="container">
          <header className="section-head section-head--split">
            <div className="section-head__main">
              <h2 id="registros-title" className="h2" data-split>
                {t({
                  pt: (
                    <>
                      Os nomes que <em>lançaram as bases.</em>
                    </>
                  ),
                  en: (
                    <>
                      The names that <em>laid the foundations.</em>
                    </>
                  ),
                  es: (
                    <>
                      Los nombres que <em>pusieron las bases.</em>
                    </>
                  ),
                })}
              </h2>
            </div>
            <p className="prose" data-reveal>
              {t({
                pt: "A organização inicial da igreja, conforme o histórico institucional. Preservar estes nomes é honrar a fidelidade de homens e mulheres que serviram a Deus em sua geração.",
                en: "The church's first leadership, according to its institutional records. Preserving these names honors the faithfulness of men and women who served God in their generation.",
                es: "La organización inicial de la iglesia, según el registro institucional. Preservar estos nombres es honrar la fidelidad de hombres y mujeres que sirvieron a Dios en su generación.",
              })}
            </p>
          </header>

          <div className={`records__grid${media.arquivoDocumento ? "" : " records__grid--two"}`}>
            <article className="record" data-reveal>
              <p className="record__kicker">{t({ pt: "Ata · 1970", en: "Minutes · 1970", es: "Acta · 1970" })}</p>
              <h3 className="record__title">{t(firstCouncil.title)}</h3>
              {firstCouncil.groups.map((g) => (
                <div key={g.role.pt} className="record__group">
                  <p className="record__role">{t(g.role)}</p>
                  <ul>
                    {g.names.map((n) => (
                      <li key={n}>
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>

            <article className="record" data-reveal data-delay="0.1">
              <p className="record__kicker">{t({ pt: "Patrimônio · 1970", en: "Trustees · 1970", es: "Patrimonio · 1970" })}</p>
              <h3 className="record__title">{t(firstBoard.title)}</h3>
              <ul className="record__board">
                {firstBoard.members.map((m) => (
                  <li key={m.role.pt}>
                    <span className="record__role">{t(m.role)}</span>
                    <span>
                      {m.name}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            {media.arquivoDocumento && (
              <div className="records__media">
                <Photo
                  image={media.arquivoDocumento}
                  slot="Documento histórico digitalizado — ata ou registro de fundação"
                  ratio="3 / 4"
                  archival
                  mask="up"
                />
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section id="pastores" tone="paper" labelledBy="pastores-title" className="pastors">
        <div className="container pastors__grid">
          <div className="pastors__head">
            <h2 id="pastores-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Pastores que serviram <em>a esta igreja.</em>
                  </>
                ),
                en: (
                  <>
                    Pastors who have served <em>this church.</em>
                  </>
                ),
                es: (
                  <>
                    Pastores que sirvieron <em>a esta iglesia.</em>
                  </>
                ),
              })}
            </h2>
            <p className="note" data-reveal>
              {t(pastorsNote)}
            </p>
          </div>
          <ul className="pastors__list" data-reveal="stagger" data-stagger="0.05">
            {pastors.map((p) => (
              <li key={p}>
                {p}
              </li>
            ))}
            <li className="pastors__current">
              {currentPastor.name}
              <span className="pastors__status">
                {t(currentPastor.status)} {t({ pt: "desde", en: "since", es: "desde" })} {t(currentPastor.installationLabel)}
              </span>
            </li>
          </ul>
        </div>
      </Section>

      <Caminhada />

      <Section tone="ink" labelledBy="acervo-title" className="archive-call">
        <div className="container archive-call__grid">
          <div>
            <h2 id="acervo-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Ajude-nos a <em>preservar esta memória.</em>
                  </>
                ),
                en: (
                  <>
                    Help us <em>preserve this memory.</em>
                  </>
                ),
                es: (
                  <>
                    Ayúdanos a <em>preservar esta memoria.</em>
                  </>
                ),
              })}
            </h2>
          </div>
          <div className="archive-call__body" data-reveal>
            <p className="prose">
              {t({
                pt: "Você guarda fotografias, documentos, boletins ou lembranças da trajetória da igreja? Esses registros podem enriquecer esta página e preservar a história para as próximas gerações. Todo material será tratado com cuidado e publicado somente com autorização.",
                en: "Do you have photographs, documents, bulletins or memories of the church's history? These records can enrich this page and preserve our story for the generations to come. All material will be handled with care and published only with permission.",
                es: "¿Guardas fotografías, documentos, boletines o recuerdos de la trayectoria de la iglesia? Esos registros pueden enriquecer esta página y preservar la historia para las próximas generaciones. Todo el material se tratará con cuidado y se publicará solo con autorización.",
              })}
            </p>
            <Button href="/contato/" variant="outline">
              {t({ pt: "Entre em contato", en: "Get in touch", es: "Ponte en contacto" })}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
