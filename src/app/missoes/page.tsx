import type { Metadata } from "next";
import { bomSamaritano, kindLabel, missionFields } from "@/content/missoes";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { Pending } from "@/components/ui/Pending";
import { MissionAtlas } from "@/components/maps/MissionAtlas";

export const metadata: Metadata = {
  title: "Missões e Ação Social",
  description:
    "Do Sertão Paraibano à Região Amazônica: igrejas organizadas, congregações, comunidades rurais, campos missionários e o projeto social O Bom Samaritano.",
  alternates: { canonical: "/missoes/" },
};

const byKind = (k: string) => missionFields.filter((f) => f.kind === k);

export default function MissoesPage() {
  const organizadas = byKind("organizada");
  const locais = [...byKind("congregacao"), ...byKind("rural")];
  const campos = byKind("missionarios");

  return (
    <>
      <PageHero
        tone="paper"
        index="Missão"
        eyebrow="Missões e ação social"
        title={
          <>
            Uma igreja enviada <em>para além de seus muros.</em>
          </>
        }
        lead="Desde sua fundação, a IEC Pombal entende que o Evangelho deve ser anunciado em todo lugar. Esta página documenta o alcance dessa missão — no Sertão, no Seridó, na Amazônia e no cuidado com as pessoas."
      />

      <Section tone="ink" labelledBy="atlas-title" className="atlas-section">
        <div className="container">
          <header className="section-head section-head--split">
            <div className="section-head__main">
              <div data-reveal>
                <Eyebrow index="Mapa">Campos e trabalhos</Eyebrow>
              </div>
              <h2 id="atlas-title" className="h2" data-split>
                Onde a Palavra <em>tem sido semeada.</em>
              </h2>
            </div>
            <p className="prose" data-reveal>
              Selecione um local para ver detalhes. Os vínculos históricos e a situação atual de cada trabalho estão em
              validação com a liderança da igreja.
            </p>
          </header>
          <div data-reveal>
            <MissionAtlas />
          </div>
        </div>
      </Section>

      <Section tone="paper" labelledBy="sertao-title" className="fields">
        <div className="container">
          <div className="fields__block">
            <div className="fields__head">
              <div data-reveal>
                <Eyebrow index="I">Sertão Paraibano</Eyebrow>
              </div>
              <h2 id="sertao-title" className="h2" data-split>
                Igrejas organizadas <em>na região.</em>
              </h2>
              <p className="prose" data-reveal>
                Ao longo de sua história, a IEC Pombal contribuiu para a organização de igrejas em cidades do Sertão
                Paraibano — fruto do trabalho evangelístico que ultrapassou os limites da cidade.
              </p>
            </div>
            <ul className="fields__cards" data-reveal="stagger">
              {organizadas.map((f) => (
                <li key={f.id} className="field-card">
                  <p className="field-card__kind">{kindLabel[f.kind]}</p>
                  <h3 className="field-card__name">{f.name}</h3>
                  <p className="field-card__place">{f.place}</p>
                  <Pending show={f.pending} label="vínculo atual a confirmar" />
                </li>
              ))}
            </ul>
          </div>

          <div className="fields__block">
            <div className="fields__head">
              <div data-reveal>
                <Eyebrow index="II">Pombal e região</Eyebrow>
              </div>
              <h2 className="h2" data-split>
                Congregação e <em>comunidades rurais.</em>
              </h2>
              <p className="prose" data-reveal>
                A igreja mantém, conforme seu histórico, uma congregação em Condado e trabalhos congregacionais nas
                comunidades rurais de Santa Maria, São João e Carvalhadas.
              </p>
            </div>
            <ul className="fields__cards" data-reveal="stagger">
              {locais.map((f) => (
                <li key={f.id} className="field-card">
                  <p className="field-card__kind">{kindLabel[f.kind]}</p>
                  <h3 className="field-card__name">{f.name}</h3>
                  <p className="field-card__place">{f.place}</p>
                  <p className="field-card__text">{f.summary}</p>
                  <Pending show={f.pending} label="situação atual a confirmar" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="sand" labelledBy="campos-title" className="far-fields">
        <div className="container">
          <header className="section-head">
            <div data-reveal>
              <Eyebrow index="III">Campos missionários</Eyebrow>
            </div>
            <h2 id="campos-title" className="h2" data-split>
              Missionários que <em>a igreja apoia.</em>
            </h2>
          </header>

          <div className="far-fields__grid">
            {campos.map((f, i) => (
              <article key={f.id} id={`campo-${f.id}`} className="far-field">
                <Photo
                  image={f.id === "purus" ? media.missoesAmazonia : media.missoesCaico}
                  slot={f.id === "purus" ? "Comunidades ribeirinhas do Rio Purus" : "Trabalho missionário em Caicó — RN"}
                  ratio="4 / 3"
                  mask={i ? "left" : "up"}
                  parallax={5}
                />
                <div className="far-field__body" data-reveal>
                  <p className="field-card__kind">{f.place}</p>
                  <h3 className="h3">{f.name}</h3>
                  <p className="far-field__people">{f.people}</p>
                  <p className="muted">{f.summary}</p>
                  <Pending show={f.pending} label="situação atual a confirmar" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="bom-samaritano" tone="green" labelledBy="bs-title" className="bs">
        <div className="container bs__grid">
          <div className="bs__copy">
            <div data-reveal>
              <Eyebrow index="IV">Ação social</Eyebrow>
            </div>
            <h2 id="bs-title" className="h1" data-split>
              {bomSamaritano.name}
            </h2>
            <p className="bs__place" data-reveal>
              {bomSamaritano.place}
            </p>
            <div className="prose" data-reveal>
              <p>{bomSamaritano.summary}</p>
              <p>
                O nome do projeto remete à parábola contada por Jesus ({bomSamaritano.reference}), que nos ensina a
                enxergar e cuidar de quem está ao nosso lado.
              </p>
            </div>
            <div className="servico__stat" data-reveal>
              <p className="servico__stat-value numeral">+200</p>
              <p className="servico__stat-label">
                {bomSamaritano.reachLabel} <Pending show={bomSamaritano.pending} />
              </p>
            </div>
          </div>
          <div className="bs__media">
            <Photo
              image={media.bomSamaritano}
              slot="O Bom Samaritano — imagens autorizadas, sem identificação das crianças"
              ratio="4 / 5"
              mask="up"
              parallax={6}
            />
          </div>
        </div>

        <div className="container">
          <div className="bs__privacy" data-reveal>
            <h3 className="h4">Cuidado com a imagem das crianças</h3>
            <p className="small">
              Em respeito ao Estatuto da Criança e do Adolescente e à Lei Geral de Proteção de Dados (LGPD), fotografias e
              informações das crianças atendidas são publicadas somente com autorização expressa dos responsáveis,
              preferencialmente sem identificação de rostos ou nomes.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="paper" labelledBy="apoiar-title" className="support">
        <div className="container support__grid">
          <div>
            <div data-reveal>
              <Eyebrow>Caminhe conosco</Eyebrow>
            </div>
            <h2 id="apoiar-title" className="h2" data-split>
              Ore, acompanhe <em>e participe.</em>
            </h2>
          </div>
          <ul className="support__list" data-reveal="stagger">
            <li>
              <h3 className="h4">Ore pelos campos</h3>
              <p className="muted">Interceda pelos missionários, pelas congregações e pelas famílias alcançadas.</p>
            </li>
            <li>
              <h3 className="h4">Acompanhe as notícias</h3>
              <p className="muted">Atualizações dos campos serão compartilhadas nos canais oficiais da igreja.</p>
            </li>
            <li>
              <h3 className="h4">Fale conosco</h3>
              <p className="muted">Para saber como servir ou apoiar, entre em contato com a igreja.</p>
              <Button href="/contato/" variant="text">
                Entrar em contato
              </Button>
            </li>
          </ul>
        </div>
      </Section>
    </>
  );
}
