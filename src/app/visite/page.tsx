import type { Metadata } from "next";
import { fullAddress, mapsDirectionsUrl, site } from "@/content/site";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Pending } from "@/components/ui/Pending";
import { WeeklySchedule } from "@/components/ui/WeeklySchedule";
import { MapEmbed } from "@/components/ui/MapEmbed";

export const metadata: Metadata = {
  title: "Planeje sua visita",
  description: "Horários dos cultos, endereço e orientações para quem deseja visitar a Igreja Evangélica Congregacional de Pombal pela primeira vez.",
  alternates: { canonical: "/visite/" },
};

const steps = [
  {
    title: "Escolha um culto",
    text: "Confira a programação regular e escolha o melhor momento para nos visitar.",
  },
  {
    title: "Chegue com tranquilidade",
    text: "Chegar alguns minutos antes ajuda você a se acomodar e conhecer algumas pessoas.",
  },
  {
    title: "Participe do culto",
    text: "Cânticos, orações, leitura das Escrituras e a pregação da Palavra de Deus.",
  },
  {
    title: "Vamos conversar",
    text: "Ao final, ficaremos felizes em conhecer você e responder às suas perguntas.",
  },
];

const faq = [
  {
    q: "Preciso ser membro para participar?",
    a: "Não. Os cultos são abertos a todas as pessoas que desejam adorar a Deus e ouvir a pregação da Palavra.",
  },
  {
    q: "Como é um culto na IEC Pombal?",
    a: "O culto é centrado em Deus e na Bíblia: reunimo-nos para cantar, orar, ler as Escrituras e ouvir a pregação do Evangelho de Jesus Cristo.",
  },
  {
    q: "Posso levar meus filhos?",
    a: "Sim. Crianças são bem-vindas. Para informações sobre atividades específicas para crianças, fale conosco.",
  },
  {
    q: "Como faço para conhecer melhor a igreja?",
    a: "Converse conosco após o culto ou entre em contato pela página de contato. Teremos alegria em apresentar a história, a fé e a vida da igreja.",
  },
];

export default function VisitePage() {
  return (
    <>
      <PageHero
        tone="paper"
        index="Boas-vindas"
        eyebrow="Planeje sua visita"
        title={
          <>
            Será uma alegria <em>receber você.</em>
          </>
        }
        lead="Tudo o que você precisa saber para participar de um culto pela primeira vez: horários, endereço e o que esperar."
        aside={
          <div className="visit-aside">
            <p className="visite__label">Endereço</p>
            <p>
              {fullAddress} <Pending show={site.address.pending} />
            </p>
            <Button href={mapsDirectionsUrl} icon="arrow-up-right" external variant="outline">
              Como chegar
            </Button>
          </div>
        }
      />

      <Section id="horarios" tone="paper" labelledBy="horarios-title" className="section--tight">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <div data-reveal>
              <Eyebrow index="01">Horários</Eyebrow>
            </div>
            <h2 id="horarios-title" className="h2" data-split>
              Quando nos <em>reunimos</em>
            </h2>
          </div>
          <WeeklySchedule />
        </div>
      </Section>

      <Section tone="sand" labelledBy="esperar-title" className="expect">
        <div className="container expect__grid">
          <div className="expect__head">
            <div data-reveal>
              <Eyebrow index="02">O que esperar</Eyebrow>
            </div>
            <h2 id="esperar-title" className="h2" data-split>
              Sua primeira visita, <em>passo a passo.</em>
            </h2>
            <Photo image={media.visitaEntrada} slot="Entrada do templo, recepção aos visitantes" ratio="4 / 3" mask="up" />
          </div>
          <ol className="steps" data-reveal="stagger">
            {steps.map((s, i) => (
              <li key={s.title} className="steps__item">
                <span className="steps__num numeral">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="h4">{s.title}</h3>
                  <p className="muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="paper" labelledBy="faq-title" className="section--tight">
        <div className="container agenda__grid">
          <div className="agenda__head">
            <div data-reveal>
              <Eyebrow index="03">Dúvidas frequentes</Eyebrow>
            </div>
            <h2 id="faq-title" className="h2" data-split>
              Perguntas <em>comuns</em>
            </h2>
          </div>
          <div className="faq" data-reveal>
            {faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p className="faq__body">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="ink" labelledBy="local-title" className="location">
        <div className="container visite__grid">
          <div className="visite__copy">
            <div data-reveal>
              <Eyebrow index="04">Localização</Eyebrow>
            </div>
            <h2 id="local-title" className="h2" data-split>
              No Centro de <em>Pombal.</em>
            </h2>
            <p className="lead lead--wide" data-reveal>
              {fullAddress} <Pending show={site.address.pending} />
            </p>
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
