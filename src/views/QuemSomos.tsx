import { confession, congregationalNote, pillars, scriptures, solas } from "@/content/fe";
import { currentPastor } from "@/content/historia";
import { asset } from "@/lib/asset";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { ScriptureQuote } from "@/components/ui/ScriptureQuote";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { t } from "@/i18n/server";

export const metadataFor = (locale: Locale) =>
  pageMetadata(locale, {
    path: "/quem-somos/",
    title: { pt: "Quem Somos", en: "About Us", es: "Quiénes Somos" },
    description: {
      pt: "Identidade, fé e fundamentos da Igreja Evangélica Congregacional de Pombal: uma igreja de tradição congregacional, enraizada na Teologia Cristã Reformada.",
      en: "Identity, faith and foundations of the Congregational Evangelical Church of Pombal: a church of the Congregational tradition, rooted in Reformed Christian theology.",
      es: "Identidad, fe y fundamentos de la Iglesia Evangélica Congregacional de Pombal: una iglesia de tradición congregacional, arraigada en la Teología Cristiana Reformada.",
    },
  });

export default function QuemSomosPage() {
  return (
    <>
      <PageHero
        tone="paper"
        title={t({
          pt: (
            <>
              Firmados nas Escrituras, <em>centrados em Cristo.</em>
            </>
          ),
          en: (
            <>
              Grounded in Scripture, <em>centered on Christ.</em>
            </>
          ),
          es: (
            <>
              Firmes en las Escrituras, <em>centrados en Cristo.</em>
            </>
          ),
        })}
        lead={t({
          pt: "Somos uma igreja de tradição congregacional, enraizada na Teologia Cristã Reformada, que existe para glorificar a Deus, proclamar o Evangelho de Jesus Cristo e servir ao próximo.",
          en: "We are a church of the Congregational tradition, rooted in Reformed Christian theology, that exists to glorify God, proclaim the Gospel of Jesus Christ and serve our neighbor.",
          es: "Somos una iglesia de tradición congregacional, arraigada en la Teología Cristiana Reformada, que existe para glorificar a Dios, proclamar el Evangelio de Jesucristo y servir al prójimo.",
        })}
      />

      <Section tone="paper" labelledBy="missao-title" className="identity section--tight">
        <div className="container identity__grid">
          <div className="identity__media">
            <Photo image={media.congregacao} slot="Congregação em culto" ratio="4 / 5" parallax={6} mask="up" />
          </div>
          <div className="identity__copy">
            <h2 id="missao-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Glorificar a Deus, anunciar o Evangelho, <em>servir ao próximo.</em>
                  </>
                ),
                en: (
                  <>
                    To glorify God, proclaim the Gospel, <em>serve our neighbor.</em>
                  </>
                ),
                es: (
                  <>
                    Glorificar a Dios, anunciar el Evangelio, <em>servir al prójimo.</em>
                  </>
                ),
              })}
            </h2>
            <div className="prose" data-reveal>
              <p>
                {t({
                  pt: "Desde 1970, a igreja se reúne em Pombal para adorar a Deus, ouvir a pregação da Palavra e viver em comunhão. Essa mesma fé a conduziu ao Sertão, ao Seridó e à Amazônia, e se expressa no cuidado com crianças e famílias.",
                  en: "Since 1970, the church has gathered in Pombal to worship God, hear the preaching of the Word and live in fellowship. That same faith led it to the Sertão, the Seridó and the Amazon, and it is expressed in caring for children and families.",
                  es: "Desde 1970, la iglesia se reúne en Pombal para adorar a Dios, escuchar la predicación de la Palabra y vivir en comunión. Esa misma fe la llevó al Sertón, al Seridó y a la Amazonía, y se expresa en el cuidado de niños y familias.",
                })}
              </p>
              <p>
                {t({
                  pt: "Não buscamos promover pessoas, mas apresentar Jesus Cristo — o único fundamento sobre o qual a igreja é edificada.",
                  en: "We do not seek to promote people, but to present Jesus Christ — the only foundation on which the church is built.",
                  es: "No buscamos promover personas, sino presentar a Jesucristo, el único fundamento sobre el cual se edifica la iglesia.",
                })}
              </p>
            </div>
            <ScriptureQuote verse={scriptures.fundamento} />
          </div>
        </div>
      </Section>

      <Section tone="ink" labelledBy="solas-title" className="solas">
        <div className="container">
          <header className="section-head section-head--split">
            <div className="section-head__main">
              <h2 id="solas-title" className="h2" data-split>
                {t({
                  pt: (
                    <>
                      Uma herança <em>reformada.</em>
                    </>
                  ),
                  en: (
                    <>
                      A <em>Reformed</em> heritage.
                    </>
                  ),
                  es: (
                    <>
                      Una herencia <em>reformada.</em>
                    </>
                  ),
                })}
              </h2>
            </div>
            <p className="prose" data-reveal>
              {t({
                pt: "As cinco solas resumem convicções recuperadas pela Reforma Protestante do século XVI. Elas expressam, de forma simples, o coração da fé que proclamamos.",
                en: "The five solas sum up convictions recovered by the Protestant Reformation of the sixteenth century. In simple terms, they express the heart of the faith we proclaim.",
                es: "Las cinco solas resumen convicciones recuperadas por la Reforma Protestante del siglo XVI. Expresan, de forma sencilla, el corazón de la fe que proclamamos.",
              })}
            </p>
          </header>

          <ol className="solas__list">
            {solas.map((s, i) => (
              <li key={s.latin} className="solas__item" data-reveal data-delay={String(i * 0.04)}>
                <div className="solas__name">
                  <h3 className="solas__latin">{s.latin}</h3>
                  <p className="solas__pt">{t(s.name)}</p>
                </div>
                <p className="solas__text">{t(s.text)}</p>
                <p className="solas__ref">{t(s.ref)}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="paper" labelledBy="cremos-title" className="pillars">
        <div className="container">
          <header className="section-head section-head--split">
            <div className="section-head__main">
              <h2 id="cremos-title" className="h2" data-split>
                {t({
                  pt: (
                    <>
                      Convicções que <em>orientam a vida da igreja.</em>
                    </>
                  ),
                  en: (
                    <>
                      Convictions that <em>shape the life of the church.</em>
                    </>
                  ),
                  es: (
                    <>
                      Convicciones que <em>orientan la vida de la iglesia.</em>
                    </>
                  ),
                })}
              </h2>
            </div>
            <p className="prose" data-reveal>
              {t({
                pt: (
                  <>
                    Um resumo do que cremos. A declaração completa da nossa fé está na{" "}
                    <a href="#confissao">{confession.title}</a>, adotada pela igreja.
                  </>
                ),
                en: (
                  <>
                    A summary of what we believe. The full statement of our faith is the{" "}
                    <a href="#confissao">{confession.title}</a> ({t(confession.titleTranslation)}), adopted by the church.
                  </>
                ),
                es: (
                  <>
                    Un resumen de lo que creemos. La declaración completa de nuestra fe está en la{" "}
                    <a href="#confissao">{confession.title}</a> ({t(confession.titleTranslation)}), adoptada por la iglesia.
                  </>
                ),
              })}
            </p>
          </header>

          <div className="cards cards--3" data-reveal="stagger">
            {pillars.map((p, i) => (
              <article key={p.title.pt} className="card">
                <h3 className="card__title font-display">{t(p.title)}</h3>
                <p className="card__text">{t(p.text)}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="confissao" tone="sand" labelledBy="confissao-title" className="confession">
        <div className="container confession__grid">
          <figure className="confession__book" data-slide="left">
            <img
              src={asset(confession.image.src)}
              alt={`${t({ pt: "Capa do livro", en: "Cover of the book", es: "Portada del libro" })} ${confession.title}: ${confession.subtitle}, ${confession.publisher}`}
              width={confession.image.width}
              height={confession.image.height}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <strong lang="pt-BR">{confession.title}</strong>
              {t(confession.titleTranslation) && <span>({t(confession.titleTranslation)})</span>}
              <span lang="pt-BR">{confession.subtitle}</span>
              <span className="confession__availability">{t(confession.availability)}</span>
            </figcaption>
          </figure>
          <div className="confession__copy">
            <h2 id="confissao-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    A Igreja Cristã, os Congregacionais e as <em>Confissões de Fé</em>
                  </>
                ),
                en: (
                  <>
                    The Christian Church, Congregationalists and <em>Confessions of Faith</em>
                  </>
                ),
                es: (
                  <>
                    La Iglesia Cristiana, los Congregacionales y las <em>Confesiones de Fe</em>
                  </>
                ),
              })}
            </h2>
            <div className="prose" data-reveal>
              {confession.paragraphs.map((p) => (
                <p key={p.pt}>{t(p)}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="ink" labelledBy="lideranca-title" className="leadership">
        <figure className="leadership__photo" data-slide="left">
          <img
            src={asset(currentPastor.image.src)}
            alt={`${t(currentPastor.title)} ${currentPastor.name}`}
            width={currentPastor.image.width}
            height={currentPastor.image.height}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="container leadership__grid">
          <div className="leadership__copy">
            <h2 id="lideranca-title" className="h2 leadership__title">
              <span data-slide="right" data-delay="0.2">
                {t(currentPastor.title)}
              </span>{" "}
              <em data-slide="right" data-delay="0.32">
                {currentPastor.name}
              </em>
            </h2>
            <p className="leadership__status" data-slide="right" data-distance="12" data-delay="0.5">
              {t({
                pt: `${t(currentPastor.status)} da igreja desde ${t(currentPastor.installationLabel)}`,
                en: `Church pastor since ${t(currentPastor.installationLabel)}`,
                es: `Pastor de la iglesia desde el ${t(currentPastor.installationLabel)}`,
              })}
            </p>
            <p className="prose" data-slide="right" data-distance="8" data-delay="0.6">
              {t({
                pt: `Eleito pela igreja, o Pr. ${currentPastor.name} tomou posse como pastor da IEC Pombal em ${t(currentPastor.installationLabel)}, dando continuidade a uma trajetória pastoral iniciada em 1970.`,
                en: `Elected by the church, Pastor ${currentPastor.name} was installed as pastor of IEC Pombal on ${t(currentPastor.installationLabel)}, continuing a pastoral journey that began in 1970.`,
                es: `Elegido por la iglesia, el Pastor ${currentPastor.name} tomó posesión como pastor de la IEC Pombal el ${t(currentPastor.installationLabel)}, dando continuidad a una trayectoria pastoral iniciada en 1970.`,
              })}
            </p>
            <div className="btn-row" data-slide="right" data-distance="8" data-delay="0.7">
              <Button href="/nossa-historia/#pastores" variant="outline">
                {t({ pt: "Pastores ao longo da história", en: "Pastors through the years", es: "Pastores a lo largo de la historia" })}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="sand" labelledBy="tradicao-title" className="tradition">
        <div className="container tradition__grid">
          <div>
            <h2 id="tradicao-title" className="h2" data-split>
              {t(congregationalNote.title)}
            </h2>
          </div>
          <div className="tradition__body">
            <div className="prose" data-reveal>
              {congregationalNote.paragraphs.map((p) => (
                <p key={p.pt}>{t(p)}</p>
              ))}
            </div>
            <div className="btn-row" data-reveal>
              <Button href="/nossa-historia/">{t({ pt: "Nossa história", en: "Our history", es: "Nuestra historia" })}</Button>
              <Button href="/visite/" variant="text">
                {t({ pt: "Participe de um culto", en: "Join us for worship", es: "Participa de un culto" })}
              </Button>
            </div>
          </div>
        </div>
      </Section>

    </>
  );
}
