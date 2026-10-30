import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { t } from "@/i18n/server";

const tiles = [
  { key: "louvor", slot: "Louvor", caption: { pt: "Louvor", en: "Praise", es: "Alabanza" }, ratio: "4 / 5", cls: "mosaic__a" },
  { key: "leitura", slot: "Leitura", caption: { pt: "Leitura", en: "Reading", es: "Lectura" }, ratio: "1 / 1", cls: "mosaic__b" },
  { key: "oracao", slot: "Oração", caption: { pt: "Oração", en: "Prayer", es: "Oración" }, ratio: "3 / 2", cls: "mosaic__c" },
  {
    key: "congregacao",
    slot: "Adoração congregacional",
    caption: { pt: "Adoração congregacional", en: "Congregational worship", es: "Adoración congregacional" },
    ratio: "4 / 5",
    cls: "mosaic__d",
  },
  {
    key: "criancas",
    slot: "Crianças na igreja",
    caption: { pt: "As crianças na vida da igreja", en: "Children in the life of the church", es: "Los niños en la vida de la iglesia" },
    ratio: "1 / 1",
    cls: "mosaic__e",
  },
];

export function Comunidade() {
  return (
    <Section tone="sand" labelledBy="comunidade-title" className="comunidade">
      <div className="container">
        <header className="section-head section-head--split">
          <div className="section-head__main">
            <h2 id="comunidade-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Uma família da fé, <em>reunida ao redor da Palavra.</em>
                  </>
                ),
                en: (
                  <>
                    A family of faith, <em>gathered around the Word.</em>
                  </>
                ),
                es: (
                  <>
                    Una familia de la fe, <em>reunida en torno a la Palabra.</em>
                  </>
                ),
              })}
            </h2>
          </div>
          <p className="prose" data-reveal>
            {t({
              pt: "Culto, ensino, oração e comunhão marcam a vida da igreja. Aqui, gerações caminham juntas — crianças, jovens, famílias e irmãos que acompanham esta história há décadas.",
              en: "Worship, teaching, prayer and fellowship mark the life of the church. Here, generations walk together — children, young people, families and members who have been part of this story for decades.",
              es: "Culto, enseñanza, oración y comunión marcan la vida de la iglesia. Aquí, las generaciones caminan juntas: niños, jóvenes, familias y hermanos que acompañan esta historia desde hace décadas.",
            })}
          </p>
        </header>

        <div className="mosaic">
          {tiles.map((tile, i) => (
            <Photo
              key={tile.key}
              className={tile.cls}
              image={media[tile.key]}
              slot={tile.slot}
              caption={tile.caption}
              ratio={tile.ratio}
              sizes="(min-width: 900px) 33vw, 50vw"
              parallax={i % 2 ? 5 : 8}
              mask={i % 2 ? "left" : "up"}
              maskDelay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
