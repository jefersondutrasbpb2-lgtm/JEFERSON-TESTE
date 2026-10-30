import type { Metadata } from "next";
import { departments } from "@/content/departamentos";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Departamentos",
  description:
    "UHC, UAC, DIC, UMEC e UAEC: conheça os departamentos da Igreja Evangélica Congregacional de Pombal, que reúnem homens, mulheres, jovens, adolescentes e crianças.",
  alternates: { canonical: "/departamentos/" },
};

export default function DepartamentosPage() {
  return (
    <>
      <PageHero
        tone="paper"
        title={
          <>
            Muitos dons, <em>um só corpo.</em>
          </>
        }
        lead="A vida da igreja se organiza em departamentos que reúnem homens, mulheres, jovens, adolescentes e crianças — cada um a serviço do Evangelho."
        aside={
          <p className="small muted">
            “Servi uns aos outros, cada um conforme o dom que recebeu.”
            <br />
            <span className="xs">1 Pedro 4.10 · ARA</span>
          </p>
        }
      />

      <Section tone="paper" labelledBy="areas-title" className="section--tight ministries">
        <div className="container">
          <h2 id="areas-title" className="sr-only">
            Departamentos da igreja
          </h2>
          <ol className="ministries__list">
            {departments.map((m) => (
              <li key={m.id} id={m.id} className="ministry" data-reveal>
                <h3 className="ministry__title">
                  <abbr className="ministry__acronym font-display" title={m.name}>
                    {m.acronym}
                  </abbr>
                  <span className="ministry__name">{m.name}</span>
                </h3>
                <div className="ministry__body">
                  <p>{m.summary}</p>
                  {(m.leaders || m.schedule) && (
                    <dl className="ministry__meta">
                      {m.leaders && (
                        <div>
                          <dt>Coordenação</dt>
                          <dd>{m.leaders}</dd>
                        </div>
                      )}
                      {m.schedule && (
                        <div>
                          <dt>Quando</dt>
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
              Há um lugar para você <em>servir.</em>
            </h2>
          </div>
          <div className="serve-call__body" data-reveal>
            <p className="prose">
              Quer conhecer melhor algum departamento ou saber como participar? Converse conosco: teremos alegria em
              orientar você.
            </p>
            <div className="btn-row">
              <Button href="/contato/">Fale conosco</Button>
              <Button href="/agenda/" variant="outline">
                Ver agenda
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
