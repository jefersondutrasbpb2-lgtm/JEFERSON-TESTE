import { bomSamaritano, cedibsTotalServed } from "@/content/missoes";
import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";

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
            O Bom Samaritano, <em>em Pombal e Paulista.</em>
          </h2>
          <div className="prose" data-reveal>
            <p>
              A igreja abriga e apoia o <strong>{bomSamaritano.entity}</strong>, dedicado ao desenvolvimento integral de
              crianças, adolescentes e jovens e ao cuidado de suas famílias — expressão concreta do amor ao próximo
              ensinado por Jesus.
            </p>
          </div>

          <div className="servico__stat" data-reveal>
            <p className="servico__stat-value numeral" data-count={cedibsTotalServed}>
              {cedibsTotalServed}
            </p>
            <p className="servico__stat-label">
              crianças, adolescentes e jovens atendidos —{" "}
              {bomSamaritano.units.map((u) => `${u.served} em ${u.city.replace(" — PB", "")}`).join(" e ")}
            </p>
          </div>

          <p className="servico__privacy xs" data-reveal>
            Preservamos a imagem e a privacidade das crianças atendidas. Fotografias do projeto são publicadas apenas com
            autorização dos responsáveis.
          </p>

          <div className="btn-row" data-reveal>
            <Button href="/missoes/#bom-samaritano" variant="outline">
              Conheça o projeto
            </Button>
            <Button href={`https://www.instagram.com/${bomSamaritano.instagram}/`} variant="text" icon="arrow-up-right" external>
              @{bomSamaritano.instagram}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
