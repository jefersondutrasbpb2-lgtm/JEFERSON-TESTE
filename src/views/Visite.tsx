import { fullAddress, mapsDirectionsUrl, site } from "@/content/site";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Pending } from "@/components/ui/Pending";
import { WeeklySchedule } from "@/components/ui/WeeklySchedule";
import { MapEmbed } from "@/components/ui/MapEmbed";
import type { L10n, Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { getLocale, t } from "@/i18n/server";

export const metadataFor = (locale: Locale) =>
  pageMetadata(locale, {
    path: "/visite/",
    title: { pt: "Planeje sua visita", en: "Plan your visit", es: "Planifica tu visita" },
    description: {
      pt: "Horários dos cultos, endereço e orientações para quem deseja visitar a Igreja Evangélica Congregacional de Pombal pela primeira vez.",
      en: "Service times, address and tips for anyone who would like to visit the Congregational Evangelical Church of Pombal for the first time.",
      es: "Horarios de los cultos, dirección y orientaciones para quien desea visitar la Iglesia Evangélica Congregacional de Pombal por primera vez.",
    },
  });

const steps: { title: L10n; text: L10n }[] = [
  {
    title: { pt: "Escolha um culto", en: "Choose a service", es: "Elige un culto" },
    text: {
      pt: "Confira a programação regular e escolha o melhor momento para nos visitar.",
      en: "Check our regular schedule and pick the best time to visit us.",
      es: "Consulta la programación regular y elige el mejor momento para visitarnos.",
    },
  },
  {
    title: { pt: "Chegue com tranquilidade", en: "Arrive at ease", es: "Llega con tranquilidad" },
    text: {
      pt: "Chegar alguns minutos antes ajuda você a se acomodar e conhecer algumas pessoas.",
      en: "Arriving a few minutes early helps you settle in and meet a few people.",
      es: "Llegar unos minutos antes te ayuda a acomodarte y conocer a algunas personas.",
    },
  },
  {
    title: { pt: "Participe do culto", en: "Join the service", es: "Participa del culto" },
    text: {
      pt: "Cânticos, orações, leitura das Escrituras e a pregação da Palavra de Deus.",
      en: "Songs, prayers, Scripture reading and the preaching of God's Word.",
      es: "Cánticos, oraciones, lectura de las Escrituras y la predicación de la Palabra de Dios.",
    },
  },
  {
    title: { pt: "Vamos conversar", en: "Let's talk", es: "Conversemos" },
    text: {
      pt: "Ao final, ficaremos felizes em conhecer você e responder às suas perguntas.",
      en: "Afterwards, we will be glad to meet you and answer your questions.",
      es: "Al final, estaremos felices de conocerte y responder tus preguntas.",
    },
  },
];

/** `only`: pergunta exibida apenas nas versões indicadas. */
const faq: { q: L10n; a: L10n; only?: Locale[] }[] = [
  {
    q: {
      pt: "Os cultos são em português?",
      en: "Are the services in English?",
      es: "¿Los cultos son en español?",
    },
    a: {
      pt: "Sim.",
      en: "The services are held in Portuguese. Visitors who speak other languages are very welcome — let us know you are coming and we will do our best to help.",
      es: "Los cultos se realizan en portugués. Quienes hablan otros idiomas son muy bienvenidos: avísanos que vienes y haremos lo posible por ayudarte.",
    },
    only: ["en", "es"],
  },
  {
    q: {
      pt: "Preciso ser membro para participar?",
      en: "Do I need to be a member to take part?",
      es: "¿Necesito ser miembro para participar?",
    },
    a: {
      pt: "Não. Os cultos são abertos a todas as pessoas que desejam adorar a Deus e ouvir a pregação da Palavra.",
      en: "No. Our services are open to everyone who wishes to worship God and hear the preaching of the Word.",
      es: "No. Los cultos están abiertos a todas las personas que desean adorar a Dios y escuchar la predicación de la Palabra.",
    },
  },
  {
    q: {
      pt: "Como é um culto na IEC Pombal?",
      en: "What is a service at IEC Pombal like?",
      es: "¿Cómo es un culto en la IEC Pombal?",
    },
    a: {
      pt: "O culto é centrado em Deus e na Bíblia: reunimo-nos para cantar, orar, ler as Escrituras e ouvir a pregação do Evangelho de Jesus Cristo.",
      en: "Our worship is centered on God and the Bible: we gather to sing, pray, read the Scriptures and hear the preaching of the Gospel of Jesus Christ.",
      es: "El culto está centrado en Dios y en la Biblia: nos reunimos para cantar, orar, leer las Escrituras y escuchar la predicación del Evangelio de Jesucristo.",
    },
  },
  {
    q: { pt: "Posso levar meus filhos?", en: "Can I bring my children?", es: "¿Puedo llevar a mis hijos?" },
    a: {
      pt: "Sim. Crianças são bem-vindas. Para informações sobre atividades específicas para crianças, fale conosco.",
      en: "Yes. Children are welcome. For information about activities for children, please contact us.",
      es: "Sí. Los niños son bienvenidos. Para información sobre actividades para niños, contáctanos.",
    },
  },
  {
    q: {
      pt: "Como faço para conhecer melhor a igreja?",
      en: "How can I get to know the church better?",
      es: "¿Cómo puedo conocer mejor la iglesia?",
    },
    a: {
      pt: "Converse conosco após o culto ou entre em contato pela página de contato. Teremos alegria em apresentar a história, a fé e a vida da igreja.",
      en: "Talk to us after the service or reach us through the contact page. We will be glad to tell you about the church's history, faith and life.",
      es: "Conversa con nosotros después del culto o escríbenos desde la página de contacto. Tendremos el gusto de presentarte la historia, la fe y la vida de la iglesia.",
    },
  },
];

export default function VisitePage() {
  const locale = getLocale();
  return (
    <>
      <PageHero
        tone="paper"
        title={t({
          pt: (
            <>
              Será uma alegria <em>receber você.</em>
            </>
          ),
          en: (
            <>
              It will be a joy <em>to welcome you.</em>
            </>
          ),
          es: (
            <>
              Será una alegría <em>recibirte.</em>
            </>
          ),
        })}
        lead={t({
          pt: "Tudo o que você precisa saber para participar de um culto pela primeira vez: horários, endereço e o que esperar.",
          en: "Everything you need to know to attend a service for the first time: times, address and what to expect.",
          es: "Todo lo que necesitas saber para participar de un culto por primera vez: horarios, dirección y qué esperar.",
        })}
        aside={
          <div className="visit-aside">
            <p className="visite__label">{t({ pt: "Endereço", en: "Address", es: "Dirección" })}</p>
            <p>
              {fullAddress} <Pending show={site.address.pending} />
            </p>
            <Button href={mapsDirectionsUrl} icon="arrow-up-right" external variant="outline">
              {t({ pt: "Como chegar", en: "Get directions", es: "Cómo llegar" })}
            </Button>
          </div>
        }
      />

      <Section id="horarios" tone="paper" labelledBy="horarios-title" className="section--tight">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <h2 id="horarios-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Quando nos <em>reunimos</em>
                  </>
                ),
                en: (
                  <>
                    When we <em>gather</em>
                  </>
                ),
                es: (
                  <>
                    Cuándo nos <em>reunimos</em>
                  </>
                ),
              })}
            </h2>
          </div>
          <WeeklySchedule />
        </div>
      </Section>

      <Section tone="sand" labelledBy="esperar-title" className="expect">
        <div className="container expect__grid">
          <div className="expect__head">
            <h2 id="esperar-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Sua primeira visita, <em>passo a passo.</em>
                  </>
                ),
                en: (
                  <>
                    Your first visit, <em>step by step.</em>
                  </>
                ),
                es: (
                  <>
                    Tu primera visita, <em>paso a paso.</em>
                  </>
                ),
              })}
            </h2>
            <Photo image={media.visitaEntrada} slot="Entrada do templo, recepção aos visitantes" ratio="4 / 3" mask="up" />
          </div>
          <ol className="steps" data-reveal="stagger">
            {steps.map((s, i) => (
              <li key={s.title.pt} className="steps__item">
                <span className="steps__num numeral">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="h4">{t(s.title)}</h3>
                  <p className="muted">{t(s.text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="paper" labelledBy="faq-title" className="section--tight">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <h2 id="faq-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Perguntas <em>comuns</em>
                  </>
                ),
                en: (
                  <>
                    Common <em>questions</em>
                  </>
                ),
                es: (
                  <>
                    Preguntas <em>frecuentes</em>
                  </>
                ),
              })}
            </h2>
          </div>
          <div className="faq" data-reveal>
            {faq
              .filter((f) => !f.only || f.only.includes(locale))
              .map((f) => (
              <details key={f.q.pt}>
                <summary>{t(f.q)}</summary>
                <p className="faq__body">{t(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="ink" labelledBy="local-title" className="location">
        <div className="container visite__grid">
          <div className="visite__copy">
            <h2 id="local-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Em Pombal, <em>Paraíba.</em>
                  </>
                ),
                en: (
                  <>
                    In Pombal, <em>Paraíba, Brazil.</em>
                  </>
                ),
                es: (
                  <>
                    En Pombal, <em>Paraíba, Brasil.</em>
                  </>
                ),
              })}
            </h2>
            <p className="lead lead--wide" data-reveal>
              {fullAddress} <Pending show={site.address.pending} />
            </p>
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
            <Photo image={media.fachadaRua} slot="Fachada do templo" ratio="16 / 10" mask="up" parallax={5} />
            <div data-reveal>
              <MapEmbed />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
