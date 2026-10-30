import { scriptures } from "@/content/fe";
import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { ScriptureQuote } from "@/components/ui/ScriptureQuote";
import { t } from "@/i18n/server";

export function Essencia() {
  return (
    <Section id="essencia" tone="paper" labelledBy="essencia-title" className="essencia">
      <div className="container essencia__grid">
        <div className="essencia__head">
          <h2 id="essencia-title" className="h2" data-split>
            {t({
              pt: (
                <>
                  Uma igreja firmada na <em>Palavra</em> e centrada em Jesus Cristo.
                </>
              ),
              en: (
                <>
                  A church grounded in the <em>Word</em> and centered on Jesus Christ.
                </>
              ),
              es: (
                <>
                  Una iglesia firmada en la <em>Palabra</em> y centrada en Jesucristo.
                </>
              ),
            })}
          </h2>
        </div>

        <div className="essencia__body">
          <div className="prose" data-reveal>
            <p className="lead lead--wide essencia__lead">
              {t({
                pt: "Somos uma comunidade cristã de tradição congregacional, enraizada na Teologia Cristã Reformada.",
                en: "We are a Christian community of the Congregational tradition, rooted in Reformed Christian theology.",
                es: "Somos una comunidad cristiana de tradición congregacional, arraigada en la Teología Cristiana Reformada.",
              })}
            </p>
            <p>
              {t({
                pt: "Cremos que as Escrituras são a Palavra de Deus e que a salvação é dom da graça, recebido mediante a fé em Cristo. Por isso, reunimo-nos para adorar a Deus, ouvir a pregação do Evangelho, cuidar uns dos outros e servir à cidade de Pombal e ao Sertão.",
                en: "We believe that the Scriptures are the Word of God and that salvation is a gift of grace, received through faith in Christ. That is why we gather to worship God, hear the preaching of the Gospel, care for one another and serve the city of Pombal and the Sertão.",
                es: "Creemos que las Escrituras son la Palabra de Dios y que la salvación es un don de la gracia, recibido mediante la fe en Cristo. Por eso nos reunimos para adorar a Dios, escuchar la predicación del Evangelio, cuidarnos unos a otros y servir a la ciudad de Pombal y al Sertón.",
              })}
            </p>
            <p>
              {t({
                pt: "Mais do que uma instituição, somos uma família da fé que deseja caminhar com você.",
                en: "More than an institution, we are a family of faith that would love to walk alongside you.",
                es: "Más que una institución, somos una familia de la fe que desea caminar contigo.",
              })}
            </p>
          </div>
          <div data-reveal>
            <Button href="/quem-somos/" variant="text">
              {t({ pt: "No que cremos", en: "What we believe", es: "Lo que creemos" })}
            </Button>
          </div>
        </div>

        <div className="essencia__media">
          <Photo image={media.pregacao} slot="Pregação da Palavra" ratio="4 / 5" parallax={7} mask="up" />
        </div>

        <div className="essencia__verse">
          <ScriptureQuote verse={scriptures.fundamento} />
        </div>
      </div>
    </Section>
  );
}
