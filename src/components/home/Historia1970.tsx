import { founding } from "@/content/historia";
import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";

export function Historia1970() {
  return (
    <Section tone="ink" labelledBy="h1970-title" className="h1970">
      <div className="h1970__mega" aria-hidden="true">
        <span data-drift="6">1970</span>
      </div>

      <div className="container h1970__grid">
        <div className="h1970__head">
          <h2 id="h1970-title" className="h2" data-split>
            Tudo começou em uma casa, <em>numa reunião de irmãos.</em>
          </h2>
        </div>

        <div className="h1970__media">
          <Photo
            image={media.arquivo1970}
            slot="Registros da fundação — fotografias ou documentos de 1970"
            ratio="5 / 6"
            archival
            mask="left"
          />
        </div>

        <div className="h1970__text">
          <div className="prose" data-reveal>
            <p>
              Em <strong>{founding.dateLabel}</strong>, irmãos presbiterianos reuniram-se na residência do diácono Gerson
              Martins de Sá e de sua esposa, Eusa Dantas de Sá. Daquele encontro nasceu a Igreja Evangélica Congregacional
              de Pombal.
            </p>
            <p>
              A igreja iniciou suas atividades com 33 membros, além de jovens e crianças, tendo como primeiro pastor o
              Reverendo José Severino de Araújo.
            </p>
          </div>

          <dl className="h1970__facts" data-reveal="stagger">
            <div className="fact">
              <dt className="fact__label">Fundação</dt>
              <dd className="fact__value numeral">{founding.dateShort}</dd>
            </div>
            <div className="fact">
              <dt className="fact__label">Membros fundadores</dt>
              <dd className="fact__value numeral">
                <span data-count={founding.initialMembers}>{founding.initialMembers}</span>
                <span className="fact__unit">além de jovens e crianças</span>
              </dd>
            </div>
            <div className="fact">
              <dt className="fact__label">Primeiro pastor</dt>
              <dd className="fact__value fact__value--name">{founding.firstPastor}</dd>
            </div>
          </dl>

          <div data-reveal>
            <Button href="/nossa-historia/" variant="outline">
              Ler a história completa
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
