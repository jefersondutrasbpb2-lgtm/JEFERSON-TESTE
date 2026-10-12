import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";

const tiles = [
  { key: "louvor", slot: "Louvor", caption: "Louvor", ratio: "4 / 5", cls: "mosaic__a" },
  { key: "leitura", slot: "Leitura", caption: "Leitura", ratio: "1 / 1", cls: "mosaic__b" },
  { key: "oracao", slot: "Oração", caption: "Oração", ratio: "3 / 2", cls: "mosaic__c" },
  { key: "congregacao", slot: "Adoração congregacional", caption: "Adoração congregacional", ratio: "4 / 5", cls: "mosaic__d" },
  { key: "criancas", slot: "Crianças na igreja", caption: "As crianças na vida da igreja", ratio: "1 / 1", cls: "mosaic__e" },
];

export function Comunidade() {
  return (
    <Section tone="sand" labelledBy="comunidade-title" className="comunidade">
      <div className="container">
        <header className="section-head section-head--split">
          <div className="section-head__main">
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
              caption={t.caption}
              ratio={t.ratio}
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
