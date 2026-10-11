import type { Metadata } from "next";
import { congregationalNote, pillars, scriptures, solas } from "@/content/fe";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { ScriptureQuote } from "@/components/ui/ScriptureQuote";
import { Pending } from "@/components/ui/Pending";

export const metadata: Metadata = {
  title: "Quem Somos",
  description:
    "Identidade, fé e fundamentos da Igreja Evangélica Congregacional de Pombal: uma igreja de tradição congregacional, enraizada na Teologia Cristã Reformada.",
  alternates: { canonical: "/quem-somos/" },
};

export default function QuemSomosPage() {
  return (
    <>
      <PageHero
        tone="paper"
        index="Identidade"
        eyebrow="Quem somos"
        title={
          <>
            Firmados nas Escrituras, <em>centrados em Cristo.</em>
          </>
        }
        lead="Somos uma igreja de tradição congregacional, enraizada na Teologia Cristã Reformada, que existe para glorificar a Deus, proclamar o Evangelho de Jesus Cristo e servir ao próximo."
      />

      <Section tone="paper" labelledBy="missao-title" className="identity section--tight">
        <div className="container identity__grid">
          <div className="identity__media">
            <Photo image={media.interiorTemplo} slot="Bíblia aberta sobre o púlpito, durante o culto" ratio="4 / 5" parallax={6} mask="up" />
          </div>
          <div className="identity__copy">
            <div data-reveal>
              <Eyebrow>Nossa missão</Eyebrow>
            </div>
            <h2 id="missao-title" className="h2" data-split>
              Glorificar a Deus, anunciar o Evangelho, <em>servir ao próximo.</em>
            </h2>
            <div className="prose" data-reveal>
              <p>
                Desde 1970, a igreja se reúne em Pombal para adorar a Deus, ouvir a pregação da Palavra e viver em
                comunhão. Essa mesma fé a conduziu ao Sertão, ao Seridó e à Amazônia, e se expressa no cuidado com
                crianças e famílias.
              </p>
              <p>
                Não buscamos promover pessoas, mas apresentar Jesus Cristo — o único fundamento sobre o qual a igreja é
                edificada.
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
              <div data-reveal>
                <Eyebrow index="Reforma">As cinco solas</Eyebrow>
              </div>
              <h2 id="solas-title" className="h2" data-split>
                Uma herança <em>reformada.</em>
              </h2>
            </div>
            <p className="prose" data-reveal>
              As cinco solas resumem convicções recuperadas pela Reforma Protestante do século XVI. Elas expressam, de
              forma simples, o coração da fé que proclamamos.
            </p>
          </header>

          <ol className="solas__list">
            {solas.map((s, i) => (
              <li key={s.latin} className="solas__item" data-reveal data-delay={String(i * 0.04)}>
                <span className="solas__num numeral">{String(i + 1).padStart(2, "0")}</span>
                <div className="solas__name">
                  <h3 className="solas__latin">{s.latin}</h3>
                  <p className="solas__pt">{s.pt}</p>
                </div>
                <p className="solas__text">{s.text}</p>
                <p className="solas__ref">{s.ref}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="paper" labelledBy="cremos-title" className="pillars">
        <div className="container">
          <header className="section-head section-head--split">
            <div className="section-head__main">
              <div data-reveal>
                <Eyebrow index="Fé e prática">No que cremos e como vivemos</Eyebrow>
              </div>
              <h2 id="cremos-title" className="h2" data-split>
                Convicções que <em>orientam a vida da igreja.</em>
              </h2>
            </div>
            <p className="prose" data-reveal>
              Uma apresentação introdutória e acessível. Documentos doutrinários oficiais serão disponibilizados nesta
              página conforme orientação da liderança. <Pending label="conteúdo em validação" />
            </p>
          </header>

          <div className="cards cards--3" data-reveal="stagger">
            {pillars.map((p, i) => (
              <article key={p.title} className="card">
                <p className="card__index">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="card__title serif">{p.title}</h3>
                <p className="card__text">{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="sand" labelledBy="tradicao-title" className="tradition">
        <div className="container tradition__grid">
          <div>
            <div data-reveal>
              <Eyebrow index="Tradição">Congregacional</Eyebrow>
            </div>
            <h2 id="tradicao-title" className="h2" data-split>
              {congregationalNote.title}
            </h2>
          </div>
          <div className="tradition__body">
            <div className="prose" data-reveal>
              {congregationalNote.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="note" data-reveal>
              {congregationalNote.disclaimer}
            </p>
            <div className="btn-row" data-reveal>
              <Button href="/nossa-historia/">Nossa história</Button>
              <Button href="/visite/" variant="text">
                Participe de um culto
              </Button>
            </div>
          </div>
        </div>
      </Section>

    </>
  );
}
