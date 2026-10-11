import { messages, channelUrl } from "@/content/data";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { MessageCard } from "@/components/ui/MessageCard";

export function Mensagens() {
  const latest = messages.slice(0, 3);
  return (
    <Section tone="paper" labelledBy="mensagens-title" className="mensagens-home">
      <div className="container">
        <header className="section-head section-head--split">
          <div className="section-head__main">
            <div data-reveal>
              <Eyebrow index="06">Mensagens e ensino bíblico</Eyebrow>
            </div>
            <h2 id="mensagens-title" className="h2" data-split>
              A Palavra pregada, <em>semana após semana.</em>
            </h2>
          </div>
          <div className="section-head__aside" data-reveal>
            <p className="prose">
              Pregações e estudos bíblicos organizados por série, referência bíblica e pregador, para ouvir novamente,
              estudar e compartilhar.
            </p>
            <div className="btn-row">
              <Button href="/mensagens/">Biblioteca de mensagens</Button>
              {channelUrl && (
                <Button href={channelUrl} variant="text" icon="arrow-up-right" external>
                  Canal no YouTube
                </Button>
              )}
            </div>
          </div>
        </header>

        {latest.length > 0 ? (
          <div className="msg-grid" data-reveal="stagger">
            {latest.map((m, i) => (
              <MessageCard key={m.id} message={m} index={i} />
            ))}
          </div>
        ) : (
          <p className="note" data-reveal>
            As mensagens mais recentes aparecerão aqui assim que forem publicadas.
          </p>
        )}
      </div>
    </Section>
  );
}
