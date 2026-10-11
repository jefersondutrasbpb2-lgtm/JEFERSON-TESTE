import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { WeeklySchedule } from "@/components/ui/WeeklySchedule";

const tips = [
  { title: "Chegue com tranquilidade", text: "Recomendamos chegar alguns minutos antes para ser recebido com calma." },
  { title: "Venha como você é", text: "Você é bem-vindo, seja na primeira visita ou voltando após muito tempo." },
  { title: "Traga sua família", text: "Crianças, jovens e adultos participam juntos da vida da igreja." },
];

export function Cultos() {
  return (
    <Section id="cultos" tone="paper" labelledBy="cultos-title" className="cultos">
      <div className="container cultos__grid">
        <div className="cultos__head">
          <div data-reveal>
            <Eyebrow index="08">Cultos e programações</Eyebrow>
          </div>
          <h2 id="cultos-title" className="h2" data-split>
            Reunidos para <em>adorar a Deus.</em>
          </h2>
          <p className="prose" data-reveal>
            Nossas reuniões são abertas a todos. Confira a programação regular e, se for sua primeira vez, veja como
            planejar sua visita.
          </p>
          <div className="btn-row" data-reveal>
            <Button href="/visite/">Planeje sua visita</Button>
            <Button href="/agenda/" variant="text">
              Agenda completa
            </Button>
          </div>
        </div>

        <div className="cultos__list">
          <WeeklySchedule />
          <ul className="tips" data-reveal="stagger">
            {tips.map((t) => (
              <li key={t.title} className="tips__item">
                <p className="tips__title">{t.title}</p>
                <p className="tips__text">{t.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
