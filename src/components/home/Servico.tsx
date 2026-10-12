import { bomSamaritano } from "@/content/missoes";
import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Pending } from "@/components/ui/Pending";

export function Servico() {
  return (
    <Section tone="green" labelledBy="servico-title" className="servico">
      <div className="container servico__grid">
        <div className="servico__media">
          <Photo
            image={media.bomSamaritano}
            slot="Atividades do projeto O Bom Samaritano"
            ratio="4 / 5"
            parallax={6}
            mask="up"
          />
        </div>

        <div className="servico__copy">
          <h2 id="servico-title" className="h2" data-split>
            O Bom Samaritano, <em>em Carvalhadas.</em>
          </h2>
          <div className="prose" data-reveal>
            <p>
              Na comunidade de Carvalhadas, a igreja abriga e apoia o projeto social <strong>O Bom Samaritano</strong>,
              dedicado ao cuidado de crianças e de suas famílias — expressão concreta do amor ao próximo ensinado por
              Jesus.
            </p>
            <p>{bomSamaritano.activities}</p>
          </div>

          <div className="servico__stat" data-reveal>
            <p className="servico__stat-value numeral">+200</p>
            <p className="servico__stat-label">
              {bomSamaritano.reachLabel} <Pending show={bomSamaritano.pending} />
            </p>
          </div>

          <p className="servico__privacy xs" data-reveal>
            Preservamos a imagem e a privacidade das crianças atendidas. Fotografias do projeto são publicadas apenas com
            autorização dos responsáveis.
          </p>

          <div data-reveal>
            <Button href="/missoes/#bom-samaritano" variant="outline">
              Conheça o projeto
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
