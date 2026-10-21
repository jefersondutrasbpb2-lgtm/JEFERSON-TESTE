import { milestones } from "@/content/historia";
import { reviewMode } from "@/content/site";
import { Section } from "@/components/ui/Section";

export function Caminhada() {
  return (
    <Section tone="paper" labelledBy="caminhada-title" className="caminhada">
      <div className="container">
        <header className="section-head section-head--split">
          <div className="section-head__main">
            <h2 id="caminhada-title" className="h2" data-split>
              Marcos de uma trajetória <em>de fidelidade.</em>
            </h2>
          </div>
          <p className="prose" data-reveal>
            Da reunião fundadora às congregações e campos missionários, cada etapa testemunha a mesma missão: anunciar o
            Evangelho de Jesus Cristo.
            {reviewMode && " As datas dos marcos posteriores à fundação serão incluídas mediante confirmação histórica."}
          </p>
        </header>

        <div className="timeline" data-progress-track>
          <span className="timeline__track" aria-hidden="true">
            <span className="timeline__progress" data-progress />
          </span>
          <ol className="timeline__list">
          {milestones.map((m, i) => (
            <li key={m.mark} className={`timeline__item ${i % 2 ? "timeline__item--right" : ""}`} data-activate>
              <span className="timeline__node" aria-hidden="true" />
              <div className="timeline__card" data-reveal>
                <p className="timeline__mark">
                  <span className="timeline__roman">{m.mark}</span>
                  {m.date ? <span className="timeline__date numeral">{m.date}</span> : null}
                </p>
                <h3 className="h4 timeline__title">{m.title}</h3>
                <p className="timeline__text">{m.text}</p>
              </div>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
