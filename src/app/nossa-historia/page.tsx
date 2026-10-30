import type { Metadata } from "next";
import { currentPastor, firstBoard, firstCouncil, founding, pastors, pastorsNote } from "@/content/historia";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { Story } from "@/components/history/Story";
import { Caminhada } from "@/components/home/Caminhada";

export const metadata: Metadata = {
  title: "Nossa História",
  description:
    "Fundada em 13 de dezembro de 1970, a Igreja Evangélica Congregacional de Pombal nasceu de uma reunião de irmãos na residência de Gerson Martins de Sá e Eusa Dantas de Sá.",
  alternates: { canonical: "/nossa-historia/" },
};

/** Nomes cuja grafia diverge entre os registros fornecidos. */

export default function HistoriaPage() {
  return (
    <>
      <PageHero
        tone="paper"
        title={
          <>
            Uma história de fé que começou <em>em um lar.</em>
          </>
        }
        lead="Da reunião fundadora em Pombal aos campos missionários no Sertão, no Seridó e na Amazônia: a trajetória de uma igreja dedicada à pregação do Evangelho de Jesus Cristo."
        aside={
          <dl className="hero-facts">
            <div>
              <dt>Fundação</dt>
              <dd className="numeral">{founding.dateShort}</dd>
            </div>
            <div>
              <dt>Membros fundadores</dt>
              <dd className="numeral">{founding.initialMembers}</dd>
            </div>
            <div>
              <dt>Tradição</dt>
              <dd>Congregacional · Reformada</dd>
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
                Os nomes que <em>lançaram as bases.</em>
              </h2>
            </div>
            <p className="prose" data-reveal>
              A organização inicial da igreja, conforme o histórico institucional. Preservar estes nomes é honrar a
              fidelidade de homens e mulheres que serviram a Deus em sua geração.
            </p>
          </header>

          <div className={`records__grid${media.arquivoDocumento ? "" : " records__grid--two"}`}>
            <article className="record" data-reveal>
              <p className="record__kicker">Ata · 1970</p>
              <h3 className="record__title">{firstCouncil.title}</h3>
              {firstCouncil.groups.map((g) => (
                <div key={g.role} className="record__group">
                  <p className="record__role">{g.role}</p>
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
              <p className="record__kicker">Patrimônio · 1970</p>
              <h3 className="record__title">{firstBoard.title}</h3>
              <ul className="record__board">
                {firstBoard.members.map((m) => (
                  <li key={m.role}>
                    <span className="record__role">{m.role}</span>
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
              Pastores que serviram <em>a esta igreja.</em>
            </h2>
            <p className="note" data-reveal>
              {pastorsNote}
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
                {currentPastor.status} desde {currentPastor.installationLabel}
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
              Ajude-nos a <em>preservar esta memória.</em>
            </h2>
          </div>
          <div className="archive-call__body" data-reveal>
            <p className="prose">
              Você guarda fotografias, documentos, boletins ou lembranças da trajetória da igreja? Esses registros podem
              enriquecer esta página e preservar a história para as próximas gerações. Todo material será tratado com
              cuidado e publicado somente com autorização.
            </p>
            <Button href="/contato/" variant="outline">
              Entre em contato
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
