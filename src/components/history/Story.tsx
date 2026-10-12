import { currentPastor, founding, pastors } from "@/content/historia";
import { MiniMap } from "@/components/maps/MiniMap";

type Chapter = {
  id: string;
  kicker: string;
  title: React.ReactNode;
  body: React.ReactNode;
  visual: React.ReactNode;
};

const chapters: Chapter[] = [
  {
    id: "origem",
    kicker: "A origem",
    title: "Um encontro em 13 de dezembro de 1970",
    body: (
      <>
        <p>
          A Igreja Evangélica Congregacional de Pombal nasceu de uma reunião de irmãos presbiterianos, realizada na
          residência do diácono <strong>Gerson Martins de Sá</strong> e de sua esposa, <strong>Eusa Dantas de Sá</strong>.
        </p>
        <p>Foi ali, em um lar, que começou uma história de fé que atravessaria gerações.</p>
      </>
    ),
    visual: (
      <div className="story-visual story-visual--date">
        <span className="story-visual__big numeral">13.12</span>
        <span className="story-visual__year numeral">1970</span>
        <span className="story-visual__caption">Pombal — Paraíba</span>
      </div>
    ),
  },
  {
    id: "primeiros-passos",
    kicker: "Os primeiros passos",
    title: "33 membros, além de jovens e crianças",
    body: (
      <>
        <p>
          A igreja iniciou suas atividades com 33 membros, além de jovens e crianças. Seu primeiro pastor foi o
          <strong> Reverendo José Severino de Araújo</strong>.
        </p>
        <p>
          A organização inicial contou com o primeiro Conselho Eclesiástico, formado por presbíteros e diáconos, e com a
          primeira diretoria do patrimônio — registros que preservam os nomes de quem lançou as bases desta obra.
        </p>
      </>
    ),
    visual: (
      <div className="story-visual story-visual--count">
        <span className="story-visual__big numeral">{founding.initialMembers}</span>
        <span className="story-visual__caption">membros fundadores</span>
      </div>
    ),
  },
  {
    id: "lideranca",
    kicker: "A liderança ao longo do tempo",
    title: "Pastores que conduziram a igreja",
    body: (
      <>
        <p>
          Ao longo de sua trajetória, a igreja foi conduzida por diferentes pastores, que serviram à congregação na
          pregação da Palavra e no cuidado do rebanho.
        </p>
        <p>
          Os registros históricos disponíveis apresentam uma lacuna na numeração dos pastorados; por isso, a relação
          completa segue em pesquisa e é apresentada mais abaixo sem períodos atribuídos. Em 14 de outubro de 2026, a
          igreja celebra a posse de seu pastor eleito, o <strong>Pr. Felipe Oliveira</strong>.
        </p>
      </>
    ),
    visual: (
      <ul className="story-visual story-visual--names">
        {pastors.map((p) => (
          <li key={p}>{p}</li>
        ))}
        <li className="story-visual__current">{currentPastor.name}</li>
      </ul>
    ),
  },
  {
    id: "crescimento",
    kicker: "O crescimento da obra",
    title: "Igrejas e congregações no Sertão",
    body: (
      <>
        <p>
          O trabalho missionário no Sertão Paraibano contribuiu para a organização de igrejas em{" "}
          <strong>Catolé do Rocha</strong>, <strong>Sousa</strong> e <strong>Cajazeiras</strong>.
        </p>
        <p>
          A igreja também mantém, conforme seu histórico, uma congregação em <strong>Condado</strong> e trabalhos
          congregacionais nas comunidades rurais de <strong>Santa Maria</strong>, <strong>São João</strong> e{" "}
          <strong>Carvalhadas</strong>.
        </p>
      </>
    ),
    visual: (
      <div className="story-visual story-visual--map">
        <MiniMap variant="regional" />
        <span className="story-visual__caption">Sertão Paraibano · ilustrativo</span>
      </div>
    ),
  },
  {
    id: "alem",
    kicker: "A missão além dos limites da cidade",
    title: "Da Paraíba ao Rio Purus",
    body: (
      <>
        <p>
          O compromisso missionário se estende a outros campos: na <strong>Região Amazônica</strong>, com o casal de
          missionários <strong>Eduardo e Donária</strong>, entre comunidades ribeirinhas do Rio Purus; e em{" "}
          <strong>Caicó — RN</strong>, com o trabalho do casal <strong>Alberto e Istênia</strong>.
        </p>
        <p>
          Em Carvalhadas, a igreja abriga e apoia o projeto social <strong>O Bom Samaritano</strong>, com histórico de
          atendimento a mais de 200 crianças.
        </p>
      </>
    ),
    visual: (
      <div className="story-visual story-visual--map">
        <MiniMap variant="overview" />
        <span className="story-visual__caption">Campos missionários · ilustrativo</span>
      </div>
    ),
  },
  {
    id: "legado",
    kicker: "O legado que permanece",
    title: "A Deus toda honra, glória e louvor",
    body: (
      <>
        <p>
          A trajetória da igreja é marcada pelo compromisso com a pregação do Evangelho de Jesus Cristo, fundamentada na
          Teologia Cristã Reformada.
        </p>
        <p>
          Olhando para o caminho percorrido, reconhecemos que tudo foi obra da graça. Por isso, toda honra, glória e
          louvor pertencem a Deus — e a missão continua, para as próximas gerações.
        </p>
      </>
    ),
    visual: (
      <div className="story-visual story-visual--gloria">
        <span className="story-visual__latin">Soli Deo Gloria</span>
        <span className="story-visual__caption">Romanos 11.36</span>
      </div>
    ),
  },
];

/**
 * Narrativa cronológica com painel fixo (desktop). A etapa em foco
 * controla o painel visível via data-story (MotionDirector).
 * No mobile, cada capítulo exibe seu próprio elemento visual.
 */
export function Story() {
  return (
    <section className="story section-tone" data-tone="ink" data-tone-section="ink" data-story data-active="0" aria-label="A história em capítulos">
      <div className="container story__grid">
        <div className="story__visual" aria-hidden="true">
          <div className="story__sticky">
            <div className="story__panels">
              {chapters.map((c, i) => (
                <div key={c.id} className={`story__panel ${i === 0 ? "is-active" : ""}`} data-story-panel>
                  {c.visual}
                </div>
              ))}
            </div>
            <ol className="story__markers">
              {chapters.map((c, i) => (
                <li key={c.id} className={i === 0 ? "is-active" : undefined} data-story-marker>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="story__steps">
          {chapters.map((c, i) => (
            <article key={c.id} id={c.id} className={`story__step ${i === 0 ? "is-active" : ""}`} data-story-step>
              <div className="story__inline-visual" aria-hidden="true">
                {c.visual}
              </div>
              <h2 className="h2 story__title" data-split>
                {c.title}
              </h2>
              <div className="prose story__body" data-reveal>
                {c.body}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
