import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { MissionAtlas } from "@/components/maps/MissionAtlas";
import { t } from "@/i18n/server";

export function Missao() {
  return (
    <Section tone="ink" labelledBy="missao-title" className="missao">
      <div className="container">
        <header className="section-head section-head--split">
          <div className="section-head__main">
            <h2 id="missao-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Do Sertão da Paraíba <em>às margens do Purus.</em>
                  </>
                ),
                en: (
                  <>
                    From the Sertão of Paraíba <em>to the banks of the Purus.</em>
                  </>
                ),
                es: (
                  <>
                    Del Sertón de Paraíba <em>a las orillas del Purus.</em>
                  </>
                ),
              })}
            </h2>
          </div>
          <div className="section-head__aside" data-reveal>
            <p className="prose">
              {t({
                pt: "Ao longo de sua história, a igreja contribuiu para a organização de igrejas no Sertão Paraibano, mantém trabalhos em Condado e em comunidades rurais e apoia missionários na Região Amazônica e no Seridó potiguar.",
                en: "Throughout its history, the church has helped plant churches in the Sertão of Paraíba, keeps congregational work in Condado and in rural communities, and supports missionaries in the Amazon region and in the Seridó of Rio Grande do Norte.",
                es: "A lo largo de su historia, la iglesia contribuyó a organizar iglesias en el Sertón de Paraíba, mantiene obras en Condado y en comunidades rurales y apoya a misioneros en la región amazónica y en el Seridó de Rio Grande do Norte.",
              })}
            </p>
            <Button href="/missoes/" variant="outline">
              {t({ pt: "Conheça os campos missionários", en: "See our mission fields", es: "Conoce los campos misioneros" })}
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
