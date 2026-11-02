import feedData from "@/content/youtube.json";
import { site } from "@/content/site";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { VideoFeed } from "@/components/ui/VideoFeed";
import type { VideoFeed as Feed } from "@/lib/youtube";
import { getLocale, t } from "@/i18n/server";

const feed = feedData as Feed;

export function Assista() {
  const channel = site.social.find((s) => s.id === "youtube")?.href;
  if (!feed.videos.length || !channel) return null;

  return (
    <Section id="assista" tone="ink" labelledBy="assista-title" className="watch">
      <div className="container">
        <header className="section-head section-head--split">
          <div className="section-head__main">
            <h2 id="assista-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Não pôde vir? <em>Assista aos cultos.</em>
                  </>
                ),
                en: (
                  <>
                    Couldn&rsquo;t make it? <em>Watch our services.</em>
                  </>
                ),
                es: (
                  <>
                    ¿No pudiste venir? <em>Mira los cultos.</em>
                  </>
                ),
              })}
            </h2>
          </div>
          <div className="section-head__aside" data-reveal>
            <p className="prose">
              {t({
                pt: "Os cultos de domingo são transmitidos ao vivo pelo nosso canal no YouTube. Assista de onde estiver e reveja as mensagens da semana.",
                en: "Our Sunday services are streamed live on our YouTube channel. Watch from wherever you are and catch up on the week's messages.",
                es: "Los cultos del domingo se transmiten en vivo por nuestro canal de YouTube. Míralos desde donde estés y repasa los mensajes de la semana.",
              })}
              {getLocale() !== "pt" &&
                t({
                  pt: "",
                  en: " Services are held in Portuguese.",
                  es: " Los cultos son en portugués.",
                })}
            </p>
            <div className="btn-row">
              <Button href={`${channel}?sub_confirmation=1`} icon="arrow-up-right" external>
                {t({ pt: "Inscreva-se no canal", en: "Subscribe to the channel", es: "Suscríbete al canal" })}
              </Button>
              <Button href={`${channel}/streams`} variant="text" icon="arrow-up-right" external>
                {t({ pt: "Todas as transmissões", en: "All live streams", es: "Todas las transmisiones" })}
              </Button>
            </div>
          </div>
        </header>

        <div data-reveal>
          <VideoFeed initial={feed} />
        </div>
      </div>
    </Section>
  );
}
