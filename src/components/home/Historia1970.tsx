import { founding } from "@/content/historia";
import { media } from "@/content/media";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { t } from "@/i18n/server";

export function Historia1970() {
  return (
    <Section tone="ink" labelledBy="h1970-title" className="h1970">
      <div className="h1970__mega" aria-hidden="true">
        <span data-drift="6">1970</span>
      </div>

      <div className={`container h1970__grid${media.arquivo1970 ? "" : " h1970__grid--text"}`}>
        <div className="h1970__head">
          <h2 id="h1970-title" className="h2" data-split>
            {t({
              pt: (
                <>
                  Tudo começou em uma casa, <em>numa reunião de irmãos.</em>
                </>
              ),
              en: (
                <>
                  It all began in a home, <em>at a gathering of believers.</em>
                </>
              ),
              es: (
                <>
                  Todo comenzó en una casa, <em>en una reunión de hermanos.</em>
                </>
              ),
            })}
          </h2>
        </div>

        {media.arquivo1970 && (
          <div className="h1970__media">
            <Photo
              image={media.arquivo1970}
              slot="Registros da fundação — fotografias ou documentos de 1970"
              ratio="5 / 6"
              archival
              mask="left"
            />
          </div>
        )}

        <div className="h1970__text">
          <div className="prose" data-reveal>
            {t({
              pt: (
                <>
                  <p>
                    Em <strong>{t(founding.dateLabel)}</strong>, irmãos presbiterianos reuniram-se na residência do diácono
                    Gerson Martins de Sá e de sua esposa, Eusa Dantas de Sá. Daquele encontro nasceu a Igreja Evangélica
                    Congregacional de Pombal.
                  </p>
                  <p>
                    A igreja iniciou suas atividades com 33 membros, além de jovens e crianças, tendo como primeiro pastor o
                    Reverendo José Severino de Araújo.
                  </p>
                </>
              ),
              en: (
                <>
                  <p>
                    On <strong>{t(founding.dateLabel)}</strong>, Presbyterian believers met at the home of Deacon Gerson
                    Martins de Sá and his wife, Eusa Dantas de Sá. From that gathering the Congregational Evangelical Church
                    of Pombal was born.
                  </p>
                  <p>
                    The church began with 33 members, plus young people and children, and its first pastor was the Reverend
                    José Severino de Araújo.
                  </p>
                </>
              ),
              es: (
                <>
                  <p>
                    El <strong>{t(founding.dateLabel)}</strong>, hermanos presbiterianos se reunieron en la casa del diácono
                    Gerson Martins de Sá y de su esposa, Eusa Dantas de Sá. De aquel encuentro nació la Iglesia Evangélica
                    Congregacional de Pombal.
                  </p>
                  <p>
                    La iglesia inició sus actividades con 33 miembros, además de jóvenes y niños, y tuvo como primer pastor
                    al Reverendo José Severino de Araújo.
                  </p>
                </>
              ),
            })}
          </div>

          <dl className="h1970__facts" data-reveal="stagger">
            <div className="fact">
              <dt className="fact__label">{t({ pt: "Fundação", en: "Founded", es: "Fundación" })}</dt>
              <dd className="fact__value numeral">{founding.dateShort}</dd>
            </div>
            <div className="fact">
              <dt className="fact__label">{t({ pt: "Membros fundadores", en: "Founding members", es: "Miembros fundadores" })}</dt>
              <dd className="fact__value numeral">
                <span data-count={founding.initialMembers}>{founding.initialMembers}</span>
                <span className="fact__unit">
                  {t({ pt: "além de jovens e crianças", en: "plus young people and children", es: "además de jóvenes y niños" })}
                </span>
              </dd>
            </div>
            <div className="fact">
              <dt className="fact__label">{t({ pt: "Primeiro pastor", en: "First pastor", es: "Primer pastor" })}</dt>
              <dd className="fact__value fact__value--name">{founding.firstPastor}</dd>
            </div>
          </dl>

          <div data-reveal>
            <Button href="/nossa-historia/" variant="outline">
              {t({ pt: "Ler a história completa", en: "Read the full story", es: "Leer la historia completa" })}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
