import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Photo } from "@/components/ui/Photo";

const tiles = [
  { key: "comunidadeCulto", slot: "Culto de domingo", ratio: "4 / 5", cls: "mosaic__a" },
  { key: "comunidadeEstudo", slot: "Estudo bíblico", ratio: "1 / 1", cls: "mosaic__b" },
  { key: "comunidadeComunhao", slot: "Comunhão entre irmãos", ratio: "3 / 2", cls: "mosaic__c" },
  { key: "comunidadeLouvor", slot: "Música e cânticos", ratio: "4 / 5", cls: "mosaic__d" },
  { key: "comunidadeJovens", slot: "Encontro de jovens", ratio: "1 / 1", cls: "mosaic__e" },
];

export function Comunidade() {
  return (
    <Section tone="sand" labelledBy="comunidade-title" className="comunidade">
      <div className="container">
        <header className="section-head section-head--split">
          <div className="section-head__main">
            <div data-reveal>
              <Eyebrow index="07">Nossa comunidade</Eyebrow>
            </div>
            <h2 id="comunidade-title" className="h2" data-split>
              Uma família da fé, <em>reunida ao redor da Palavra.</em>
            </h2>
          </div>
          <p className="prose" data-reveal>
            Culto, ensino, oração e comunhão marcam a vida da igreja. Aqui, gerações caminham juntas — crianças, jovens,
            famílias e irmãos que acompanham esta história há décadas.
          </p>
        </header>

        <div className="mosaic">
          {tiles.map((t, i) => (
            <Photo
              key={t.key}
              className={t.cls}
              image={media[t.key]}
              slot={t.slot}
              ratio={t.ratio}
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
