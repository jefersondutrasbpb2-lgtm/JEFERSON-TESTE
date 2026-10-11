import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { MissionAtlas } from "@/components/maps/MissionAtlas";

export function Missao() {
  return (
    <Section tone="ink" labelledBy="missao-title" className="missao">
      <div className="container">
        <header className="section-head section-head--split">
          <div className="section-head__main">
            <div data-reveal>
              <Eyebrow index="04">Uma igreja em missão</Eyebrow>
            </div>
            <h2 id="missao-title" className="h2" data-split>
              Do Sertão da Paraíba <em>às margens do Purus.</em>
            </h2>
          </div>
          <div className="section-head__aside" data-reveal>
            <p className="prose">
              Ao longo de sua história, a igreja contribuiu para a organização de igrejas no Sertão Paraibano, mantém
              trabalhos em Condado e em comunidades rurais e apoia missionários na Região Amazônica e no Seridó potiguar.
            </p>
            <Button href="/missoes/" variant="outline">
              Conheça os campos missionários
            </Button>
          </div>
        </header>

        <div data-reveal>
          <MissionAtlas compact />
        </div>
      </div>
    </Section>
  );
}
