import type { Metadata } from "next";
import { confession, congregationalNote, pillars, scriptures, solas } from "@/content/fe";
import { currentPastor } from "@/content/historia";
import { asset } from "@/lib/asset";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { ScriptureQuote } from "@/components/ui/ScriptureQuote";

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
            <Photo image={media.congregacao} slot="Congregação em culto" ratio="4 / 5" parallax={6} mask="up" />
          </div>
          <div className="identity__copy">
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
              <h2 id="cremos-title" className="h2" data-split>
                Convicções que <em>orientam a vida da igreja.</em>
              </h2>
            </div>
            <p className="prose" data-reveal>
              Um resumo do que cremos. A declaração completa da nossa fé está na{" "}
              <a href="#confissao">{confession.title}</a>, adotada pela igreja.
            </p>
          </header>

          <div className="cards cards--3" data-reveal="stagger">
            {pillars.map((p, i) => (
              <article key={p.title} className="card">
                <h3 className="card__title font-display">{p.title}</h3>
                <p className="card__text">{p.text}</p>
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
              alt={`Capa do livro ${confession.title}: ${confession.subtitle}, ${confession.publisher}`}
              width={confession.image.width}
              height={confession.image.height}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <strong>{confession.title}</strong>
              <span>{confession.subtitle}</span>
            </figcaption>
          </figure>
          <div className="confession__copy">
            <h2 id="confissao-title" className="h2" data-split>
              A Igreja Cristã, os Congregacionais e as <em>Confissões de Fé</em>
            </h2>
            <div className="prose" data-reveal>
              {confession.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="ink" labelledBy="lideranca-title" className="leadership">
        <figure className="leadership__photo" data-slide="left">
          <img
            src={asset(currentPastor.image.src)}
            alt={`${currentPastor.title} ${currentPastor.name}`}
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
                {currentPastor.title}
              </span>{" "}
              <em data-slide="right" data-delay="0.32">
                {currentPastor.name}
              </em>
            </h2>
            <p className="leadership__status" data-slide="right" data-distance="12" data-delay="0.5">
              {currentPastor.status} · posse em {currentPastor.installationLabel}
            </p>
            <p className="prose" data-slide="right" data-distance="8" data-delay="0.6">
              Eleito pela igreja, o {currentPastor.title} {currentPastor.name} toma posse como pastor da IEC Pombal em{" "}
              {currentPastor.installationLabel}, dando continuidade a uma trajetória pastoral iniciada em 1970.
            </p>
            <div className="btn-row" data-slide="right" data-distance="8" data-delay="0.7">
              <Button href="/nossa-historia/#pastores" variant="outline">
                Pastores ao longo da história
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="sand" labelledBy="tradicao-title" className="tradition">
        <div className="container tradition__grid">
          <div>
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
