import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { WeeklySchedule } from "@/components/ui/WeeklySchedule";
import { t } from "@/i18n/server";

const tips = [
  {
    title: { pt: "Chegue com tranquilidade", en: "Arrive at ease", es: "Llega con tranquilidad" },
    text: {
      pt: "Recomendamos chegar alguns minutos antes para ser recebido com calma.",
      en: "We suggest arriving a few minutes early so we can welcome you without rush.",
      es: "Te recomendamos llegar unos minutos antes para recibirte con calma.",
    },
  },
  {
    title: { pt: "Venha como você é", en: "Come as you are", es: "Ven como eres" },
    text: {
      pt: "Você é bem-vindo, seja na primeira visita ou voltando após muito tempo.",
      en: "You are welcome, whether it is your first visit or you are coming back after a long time.",
      es: "Eres bienvenido, ya sea tu primera visita o vuelvas después de mucho tiempo.",
    },
  },
  {
    title: { pt: "Traga sua família", en: "Bring your family", es: "Trae a tu familia" },
    text: {
      pt: "Crianças, jovens e adultos participam juntos da vida da igreja.",
      en: "Children, young people and adults take part in church life together.",
      es: "Niños, jóvenes y adultos participan juntos de la vida de la iglesia.",
    },
  },
];

export function Cultos() {
  return (
    <Section id="cultos" tone="paper" labelledBy="cultos-title" className="cultos">
      <div className="container cultos__grid">
        <div className="cultos__head">
          <h2 id="cultos-title" className="h2" data-split>
            {t({
              pt: (
                <>
                  Reunidos para <em>adorar a Deus.</em>
                </>
              ),
              en: (
                <>
                  Gathered to <em>worship God.</em>
                </>
              ),
              es: (
                <>
                  Reunidos para <em>adorar a Dios.</em>
                </>
              ),
            })}
          </h2>
          <p className="prose" data-reveal>
            {t({
              pt: "Nossas reuniões são abertas a todos. Confira a programação regular e, se for sua primeira vez, veja como planejar sua visita.",
              en: "Our gatherings are open to everyone. See our regular schedule and, if it is your first time, how to plan your visit.",
              es: "Nuestras reuniones están abiertas a todos. Consulta la programación regular y, si es tu primera vez, cómo planificar tu visita.",
            })}
          </p>
          <div className="btn-row" data-reveal>
            <Button href="/visite/">{t({ pt: "Planeje sua visita", en: "Plan your visit", es: "Planifica tu visita" })}</Button>
            <Button href="/agenda/" variant="text">
              {t({ pt: "Agenda completa", en: "Full schedule", es: "Agenda completa" })}
            </Button>
          </div>
        </div>

        <div className="cultos__list">
          <WeeklySchedule />
          <ul className="tips" data-reveal="stagger">
            {tips.map((tip) => (
              <li key={tip.title.pt} className="tips__item">
                <p className="tips__title">{t(tip.title)}</p>
                <p className="tips__text">{t(tip.text)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
