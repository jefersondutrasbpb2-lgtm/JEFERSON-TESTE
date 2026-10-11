import { scriptures } from "@/content/fe";
import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { ScriptureQuote } from "@/components/ui/ScriptureQuote";

export function Essencia() {
  return (
    <Section id="essencia" tone="paper" labelledBy="essencia-title" className="essencia">
      <div className="container essencia__grid">
        <div className="essencia__head">
          <div data-reveal>
            <Eyebrow index="01">Nossa essência</Eyebrow>
          </div>
          <h2 id="essencia-title" className="h2" data-split>
            Uma igreja firmada na <em>Palavra</em> e centrada em Jesus Cristo.
          </h2>
        </div>

        <div className="essencia__body">
          <div className="prose" data-reveal>
            <p className="lead lead--wide essencia__lead">
              Somos uma comunidade cristã de tradição congregacional, enraizada na Teologia Cristã Reformada.
            </p>
            <p>
              Cremos que as Escrituras são a Palavra de Deus e que a salvação é dom da graça, recebido mediante a fé em
              Cristo. Por isso, reunimo-nos para adorar a Deus, ouvir a pregação do Evangelho, cuidar uns dos outros e
              servir à cidade de Pombal e ao Sertão.
            </p>
            <p>Mais do que uma instituição, somos uma família da fé que deseja caminhar com você.</p>
          </div>
          <div data-reveal>
            <Button href="/quem-somos/" variant="text">
              No que cremos
            </Button>
          </div>
        </div>

        <div className="essencia__media">
          <Photo image={media.interiorTemplo} slot="Congregação reunida no templo, em culto" ratio="4 / 5" parallax={7} mask="up" />
        </div>

        <div className="essencia__verse">
          <ScriptureQuote verse={scriptures.fundamento} />
        </div>
      </div>
    </Section>
  );
}
