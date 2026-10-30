import { currentPastor, founding, pastors } from "@/content/historia";
import { MiniMap } from "@/components/maps/MiniMap";
import type { L10n } from "@/i18n/config";
import { t } from "@/i18n/server";

type Chapter = {
  id: string;
  title: L10n<React.ReactNode>;
  body: L10n<React.ReactNode>;
  visual: React.ReactNode;
};

/** Capítulos da narrativa; montados na renderização para usar o idioma da página. */
function chapters(): Chapter[] {
  return [
    {
      id: "origem",
      title: {
        pt: "Um encontro em 13 de dezembro de 1970",
        en: "A gathering on December 13, 1970",
        es: "Un encuentro el 13 de diciembre de 1970",
      },
      body: {
        pt: (
          <>
            <p>
              A Igreja Evangélica Congregacional de Pombal nasceu de uma reunião de irmãos presbiterianos, realizada na
              residência do diácono <strong>Gerson Martins de Sá</strong> e de sua esposa,{" "}
              <strong>Eusa Dantas de Sá</strong>.
            </p>
            <p>Foi ali, em um lar, que começou uma história de fé que atravessaria gerações.</p>
          </>
        ),
        en: (
          <>
            <p>
              The Congregational Evangelical Church of Pombal was born from a gathering of Presbyterian believers held at
              the home of Deacon <strong>Gerson Martins de Sá</strong> and his wife, <strong>Eusa Dantas de Sá</strong>.
            </p>
            <p>It was there, in a family home, that a story of faith began that would span generations.</p>
          </>
        ),
        es: (
          <>
            <p>
              La Iglesia Evangélica Congregacional de Pombal nació de una reunión de hermanos presbiterianos, celebrada en
              la casa del diácono <strong>Gerson Martins de Sá</strong> y de su esposa, <strong>Eusa Dantas de Sá</strong>.
            </p>
            <p>Fue allí, en un hogar, donde comenzó una historia de fe que atravesaría generaciones.</p>
          </>
        ),
      },
      visual: (
        <div className="story-visual story-visual--date">
          <span className="story-visual__big numeral">{t({ pt: "13.12", en: "12.13", es: "13.12" })}</span>
          <span className="story-visual__year numeral">1970</span>
          <span className="story-visual__caption">Pombal — Paraíba</span>
        </div>
      ),
    },
    {
      id: "primeiros-passos",
      title: {
        pt: "33 membros, além de jovens e crianças",
        en: "33 members, plus young people and children",
        es: "33 miembros, además de jóvenes y niños",
      },
      body: {
        pt: (
          <>
            <p>
              A igreja iniciou suas atividades com 33 membros, além de jovens e crianças. Seu primeiro pastor foi o
              <strong> Reverendo José Severino de Araújo</strong>.
            </p>
            <p>
              A organização inicial contou com o primeiro Conselho Eclesiástico, formado por presbíteros e diáconos, e com
              a primeira diretoria do patrimônio — registros que preservam os nomes de quem lançou as bases desta obra.
            </p>
          </>
        ),
        en: (
          <>
            <p>
              The church began with 33 members, plus young people and children. Its first pastor was the
              <strong> Reverend José Severino de Araújo</strong>.
            </p>
            <p>
              Its first structure included the first Church Council, made up of elders and deacons, and the first Board of
              Trustees — records that preserve the names of those who laid the foundations of this work.
            </p>
          </>
        ),
        es: (
          <>
            <p>
              La iglesia inició sus actividades con 33 miembros, además de jóvenes y niños. Su primer pastor fue el
              <strong> Reverendo José Severino de Araújo</strong>.
            </p>
            <p>
              La organización inicial contó con el primer Consejo Eclesiástico, formado por presbíteros y diáconos, y con
              la primera junta directiva del patrimonio: registros que preservan los nombres de quienes pusieron las bases
              de esta obra.
            </p>
          </>
        ),
      },
      visual: (
        <div className="story-visual story-visual--count">
          <span className="story-visual__big numeral">{founding.initialMembers}</span>
          <span className="story-visual__caption">
            {t({ pt: "membros fundadores", en: "founding members", es: "miembros fundadores" })}
          </span>
        </div>
      ),
    },
    {
      id: "lideranca",
      title: {
        pt: "Pastores que conduziram a igreja",
        en: "Pastors who have led the church",
        es: "Pastores que condujeron la iglesia",
      },
      body: {
        pt: (
          <>
            <p>
              Ao longo de sua trajetória, a igreja foi conduzida por diferentes pastores, que serviram à congregação na
              pregação da Palavra e no cuidado do rebanho.
            </p>
            <p>
              Os registros históricos disponíveis apresentam uma lacuna na numeração dos pastorados; por isso, a relação
              completa segue em pesquisa e é apresentada mais abaixo sem períodos atribuídos. Em 14 de outubro de 2026, a
              igreja celebrou a posse de seu pastor, o <strong>Pr. Felipe Oliveira</strong>.
            </p>
          </>
        ),
        en: (
          <>
            <p>
              Throughout its history, the church has been led by different pastors, who served the congregation in
              preaching the Word and caring for the flock.
            </p>
            <p>
              The available historical records have a gap in the numbering of the pastorates, so research on the complete
              list continues; it is shown further below without dates. On October 14, 2026, the church celebrated the
              installation of its pastor, <strong>Pastor Felipe Oliveira</strong>.
            </p>
          </>
        ),
        es: (
          <>
            <p>
              A lo largo de su trayectoria, la iglesia fue conducida por distintos pastores, que sirvieron a la
              congregación en la predicación de la Palabra y en el cuidado del rebaño.
            </p>
            <p>
              Los registros históricos disponibles presentan un vacío en la numeración de los pastorados; por eso, la
              relación completa sigue en investigación y se presenta más abajo sin períodos. El 14 de octubre de 2026, la
              iglesia celebró la toma de posesión de su pastor, el <strong>Pastor Felipe Oliveira</strong>.
            </p>
          </>
        ),
      },
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
      title: {
        pt: "Igrejas e congregações no Sertão",
        en: "Churches and congregations in the Sertão",
        es: "Iglesias y congregaciones en el Sertón",
      },
      body: {
        pt: (
          <>
            <p>
              O trabalho missionário no Sertão Paraibano contribuiu para a organização de igrejas em{" "}
              <strong>Catolé do Rocha</strong>, <strong>Sousa</strong> e <strong>Cajazeiras</strong>, hoje igrejas
              independentes.
            </p>
            <p>
              A igreja também mantém uma congregação em <strong>Condado</strong> e trabalhos congregacionais nas
              comunidades rurais de <strong>Santa Maria</strong>, <strong>São João</strong> e{" "}
              <strong>Carvalhadas</strong>.
            </p>
          </>
        ),
        en: (
          <>
            <p>
              Mission work in the Sertão of Paraíba helped plant churches in <strong>Catolé do Rocha</strong>,{" "}
              <strong>Sousa</strong> and <strong>Cajazeiras</strong>, which are independent churches today.
            </p>
            <p>
              The church also keeps a congregation in <strong>Condado</strong> and congregational work in the rural
              communities of <strong>Santa Maria</strong>, <strong>São João</strong> and <strong>Carvalhadas</strong>.
            </p>
          </>
        ),
        es: (
          <>
            <p>
              La obra misionera en el Sertón de Paraíba contribuyó a organizar iglesias en{" "}
              <strong>Catolé do Rocha</strong>, <strong>Sousa</strong> y <strong>Cajazeiras</strong>, hoy iglesias
              independientes.
            </p>
            <p>
              La iglesia también mantiene una congregación en <strong>Condado</strong> y obras congregacionales en las
              comunidades rurales de <strong>Santa Maria</strong>, <strong>São João</strong> y{" "}
              <strong>Carvalhadas</strong>.
            </p>
          </>
        ),
      },
      visual: (
        <div className="story-visual story-visual--map">
          <MiniMap variant="regional" />
          <span className="story-visual__caption">
            {t({ pt: "Sertão Paraibano · ilustrativo", en: "Sertão of Paraíba · illustrative", es: "Sertón de Paraíba · ilustrativo" })}
          </span>
        </div>
      ),
    },
    {
      id: "alem",
      title: {
        pt: "Da Paraíba ao Rio Purus",
        en: "From Paraíba to the Purus River",
        es: "De Paraíba al río Purus",
      },
      body: {
        pt: (
          <>
            <p>
              O compromisso missionário se estende a outros campos: na <strong>Região Amazônica</strong>, com o casal de
              missionários <strong>Eduardo e Donária</strong>, entre comunidades ribeirinhas do Rio Purus; e em{" "}
              <strong>Caicó — RN</strong>, com o trabalho do casal <strong>Alberto e Istênia</strong>.
            </p>
            <p>
              A igreja também abriga e apoia o <strong>CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano</strong>,
              que hoje atende 440 crianças, adolescentes e jovens em suas unidades de Pombal e Paulista.
            </p>
          </>
        ),
        en: (
          <>
            <p>
              The missionary commitment reaches other fields: in the <strong>Amazon region</strong>, with missionary couple{" "}
              <strong>Eduardo and Donária</strong>, among the riverside communities of the Purus River; and in{" "}
              <strong>Caicó, Rio Grande do Norte</strong>, with the work of <strong>Alberto and Istênia</strong>.
            </p>
            <p>
              The church also hosts and supports <strong>CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano</strong>{" "}
              (O Bom Samaritano Integral Development Center), which today serves 440 children, teenagers and young people in
              its units in Pombal and Paulista.
            </p>
          </>
        ),
        es: (
          <>
            <p>
              El compromiso misionero se extiende a otros campos: en la <strong>región amazónica</strong>, con el matrimonio
              de misioneros <strong>Eduardo y Donária</strong>, entre las comunidades ribereñas del río Purus; y en{" "}
              <strong>Caicó, Rio Grande do Norte</strong>, con la obra del matrimonio <strong>Alberto e Istênia</strong>.
            </p>
            <p>
              La iglesia también acoge y apoya el{" "}
              <strong>CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano</strong> (Centro de Desarrollo Integral
              El Buen Samaritano), que hoy atiende a 440 niños, adolescentes y jóvenes en sus unidades de Pombal y Paulista.
            </p>
          </>
        ),
      },
      visual: (
        <div className="story-visual story-visual--map">
          <MiniMap variant="overview" />
          <span className="story-visual__caption">
            {t({ pt: "Campos missionários · ilustrativo", en: "Mission fields · illustrative", es: "Campos misioneros · ilustrativo" })}
          </span>
        </div>
      ),
    },
    {
      id: "legado",
      title: {
        pt: "A Deus toda honra, glória e louvor",
        en: "To God be all honor, glory and praise",
        es: "A Dios sea toda la honra, la gloria y la alabanza",
      },
      body: {
        pt: (
          <>
            <p>
              A trajetória da igreja é marcada pelo compromisso com a pregação do Evangelho de Jesus Cristo, fundamentada
              na Teologia Cristã Reformada.
            </p>
            <p>
              Olhando para o caminho percorrido, reconhecemos que tudo foi obra da graça. Por isso, toda honra, glória e
              louvor pertencem a Deus — e a missão continua, para as próximas gerações.
            </p>
          </>
        ),
        en: (
          <>
            <p>
              The church&apos;s journey is marked by its commitment to preaching the Gospel of Jesus Christ, grounded in
              Reformed Christian theology.
            </p>
            <p>
              Looking back on the road we have traveled, we recognize that it was all the work of grace. That is why all
              honor, glory and praise belong to God — and the mission continues, for the generations to come.
            </p>
          </>
        ),
        es: (
          <>
            <p>
              La trayectoria de la iglesia está marcada por el compromiso con la predicación del Evangelio de Jesucristo,
              fundamentada en la Teología Cristiana Reformada.
            </p>
            <p>
              Al mirar el camino recorrido, reconocemos que todo fue obra de la gracia. Por eso, toda la honra, la gloria y
              la alabanza pertenecen a Dios, y la misión continúa para las próximas generaciones.
            </p>
          </>
        ),
      },
      visual: (
        <div className="story-visual story-visual--gloria">
          <span className="story-visual__latin">Soli Deo Gloria</span>
          <span className="story-visual__caption">{t({ pt: "Romanos 11.36", en: "Romans 11:36", es: "Romanos 11:36" })}</span>
        </div>
      ),
    },
  ];
}

/**
 * Narrativa cronológica com painel fixo (desktop). A etapa em foco
 * controla o painel visível via data-story (MotionDirector).
 * No mobile, cada capítulo exibe seu próprio elemento visual.
 */
export function Story() {
  const list = chapters();
  return (
    <section
      className="story section-tone"
      data-tone="ink"
      data-tone-section="ink"
      data-story
      data-active="0"
      aria-label={t({ pt: "A história em capítulos", en: "Our story in chapters", es: "La historia en capítulos" })}
    >
      <div className="container story__grid">
        <div className="story__visual" aria-hidden="true">
          <div className="story__sticky">
            <div className="story__panels">
              {list.map((c, i) => (
                <div key={c.id} className={`story__panel ${i === 0 ? "is-active" : ""}`} data-story-panel>
                  {c.visual}
                </div>
              ))}
            </div>
            <ol className="story__markers">
              {list.map((c, i) => (
                <li key={c.id} className={i === 0 ? "is-active" : undefined} data-story-marker>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="story__steps">
          {list.map((c, i) => (
            <article key={c.id} id={c.id} className={`story__step ${i === 0 ? "is-active" : ""}`} data-story-step>
              <div className="story__inline-visual" aria-hidden="true">
                {c.visual}
              </div>
              <h2 className="h2 story__title" data-split>
                {t(c.title)}
              </h2>
              <div className="prose story__body" data-reveal>
                {t(c.body)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
