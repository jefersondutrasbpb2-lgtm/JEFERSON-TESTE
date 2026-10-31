import { bomSamaritano, kindLabel, missionFields } from "@/content/missoes";
import { media } from "@/content/media";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { Button } from "@/components/ui/Button";
import { Pending } from "@/components/ui/Pending";
import { MissionAtlas } from "@/components/maps/MissionAtlas";
import { InstagramCarousel } from "@/components/ui/InstagramCarousel";
import { CedibsUnits } from "@/components/ui/CedibsUnits";
import { instagramFeeds } from "@/content/instagram";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { t } from "@/i18n/server";

export const metadataFor = (locale: Locale) =>
  pageMetadata(locale, {
    path: "/missoes/",
    title: { pt: "Missões e Ação Social", en: "Missions and Outreach", es: "Misiones y Acción Social" },
    description: {
      pt: "Do Sertão Paraibano à Região Amazônica: igrejas organizadas, congregações, comunidades rurais, campos missionários e o CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano.",
      en: "From the Sertão of Paraíba to the Amazon: churches planted, congregations, rural communities, mission fields and CEDIBS, the O Bom Samaritano Integral Development Center.",
      es: "Del Sertón de Paraíba a la Amazonía: iglesias organizadas, congregaciones, comunidades rurales, campos misioneros y el CEDIBS, Centro de Desarrollo Integral O Bom Samaritano.",
    },
  });

const byKind = (k: string) => missionFields.filter((f) => f.kind === k);

export default function MissoesPage() {
  const organizadas = byKind("organizada");
  const locais = [...byKind("congregacao"), ...byKind("rural")];
  const campos = byKind("missionarios");

  return (
    <>
      <PageHero
        tone="paper"
        title={t({
          pt: (
            <>
              Uma igreja enviada <em>para além de seus muros.</em>
            </>
          ),
          en: (
            <>
              A church sent <em>beyond its walls.</em>
            </>
          ),
          es: (
            <>
              Una iglesia enviada <em>más allá de sus muros.</em>
            </>
          ),
        })}
        lead={t({
          pt: "Desde sua fundação, a IEC Pombal entende que o Evangelho deve ser anunciado em todo lugar. Esta página documenta o alcance dessa missão — no Sertão, no Seridó, na Amazônia e no cuidado com as pessoas.",
          en: "Since its founding, IEC Pombal has understood that the Gospel must be proclaimed everywhere. This page records the reach of that mission — in the Sertão, the Seridó, the Amazon and in caring for people.",
          es: "Desde su fundación, la IEC Pombal entiende que el Evangelio debe anunciarse en todo lugar. Esta página documenta el alcance de esa misión: en el Sertón, el Seridó, la Amazonía y el cuidado de las personas.",
        })}
      />

      <Section tone="ink" labelledBy="atlas-title" className="atlas-section">
        <div className="container">
          <header className="section-head section-head--split">
            <div className="section-head__main">
              <h2 id="atlas-title" className="h2" data-split>
                {t({
                  pt: (
                    <>
                      Onde a Palavra <em>tem sido semeada.</em>
                    </>
                  ),
                  en: (
                    <>
                      Where the Word <em>has been sown.</em>
                    </>
                  ),
                  es: (
                    <>
                      Donde la Palabra <em>ha sido sembrada.</em>
                    </>
                  ),
                })}
              </h2>
            </div>
            <p className="prose" data-reveal>
              {t({
                pt: "Selecione um local para ver os detalhes de cada trabalho.",
                en: "Select a place to see the details of each work.",
                es: "Selecciona un lugar para ver los detalles de cada obra.",
              })}
            </p>
          </header>
          <div data-reveal>
            <MissionAtlas />
          </div>
        </div>
      </Section>

      <Section tone="paper" labelledBy="sertao-title" className="fields">
        <div className="container">
          <div className="fields__block">
            <div className="fields__head">
              <h2 id="sertao-title" className="h2" data-split>
                {t({
                  pt: (
                    <>
                      Igrejas organizadas <em>na região.</em>
                    </>
                  ),
                  en: (
                    <>
                      Churches planted <em>in the region.</em>
                    </>
                  ),
                  es: (
                    <>
                      Iglesias organizadas <em>en la región.</em>
                    </>
                  ),
                })}
              </h2>
              <p className="prose" data-reveal>
                {t({
                  pt: "Ao longo de sua história, a IEC Pombal contribuiu para a organização de igrejas em cidades do Sertão Paraibano — fruto do trabalho evangelístico que ultrapassou os limites da cidade. Hoje, são igrejas independentes.",
                  en: "Throughout its history, IEC Pombal helped plant churches in towns of the Sertão of Paraíba — the fruit of evangelistic work that reached beyond the city. Today they are independent churches.",
                  es: "A lo largo de su historia, la IEC Pombal contribuyó a organizar iglesias en ciudades del Sertón de Paraíba, fruto de la obra evangelística que superó los límites de la ciudad. Hoy son iglesias independientes.",
                })}
              </p>
            </div>
            <ul className="fields__cards" data-reveal="stagger">
              {organizadas.map((f) => (
                <li key={f.id} className="field-card">
                  <p className="field-card__kind">{t(kindLabel[f.kind])}</p>
                  <h3 className="field-card__name">{f.name}</h3>
                  <p className="field-card__place">{t(f.place)}</p>
                  <Pending show={f.pending} label="vínculo atual a confirmar" />
                </li>
              ))}
            </ul>
          </div>

          <div className="fields__block">
            <div className="fields__head">
              <h2 className="h2" data-split>
                {t({
                  pt: (
                    <>
                      Congregação e <em>comunidades rurais.</em>
                    </>
                  ),
                  en: (
                    <>
                      A congregation and <em>rural communities.</em>
                    </>
                  ),
                  es: (
                    <>
                      Congregación y <em>comunidades rurales.</em>
                    </>
                  ),
                })}
              </h2>
              <p className="prose" data-reveal>
                {t({
                  pt: "A igreja mantém uma congregação em Condado e trabalhos congregacionais nas comunidades rurais de Santa Maria, São João e Carvalhadas.",
                  en: "The church keeps a congregation in Condado and congregational work in the rural communities of Santa Maria, São João and Carvalhadas.",
                  es: "La iglesia mantiene una congregación en Condado y obras congregacionales en las comunidades rurales de Santa Maria, São João y Carvalhadas.",
                })}
              </p>
            </div>
            <ul className="fields__cards" data-reveal="stagger">
              {locais.map((f) => (
                <li key={f.id} className="field-card">
                  <p className="field-card__kind">{t(kindLabel[f.kind])}</p>
                  <h3 className="field-card__name">{f.name}</h3>
                  <p className="field-card__place">{t(f.place)}</p>
                  <p className="field-card__text">{t(f.summary)}</p>
                  <Pending show={f.pending} label="situação atual a confirmar" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="sand" labelledBy="campos-title" className="far-fields">
        <div className="container">
          <header className="section-head">
            <h2 id="campos-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Missionários que <em>a igreja apoia.</em>
                  </>
                ),
                en: (
                  <>
                    Missionaries <em>the church supports.</em>
                  </>
                ),
                es: (
                  <>
                    Misioneros que <em>la iglesia apoya.</em>
                  </>
                ),
              })}
            </h2>
          </header>

          <div className="far-fields__grid">
            {campos.map((f, i) => {
              const image = f.id === "purus" ? media.missoesAmazonia : media.missoesCaico;
              return (
              <article key={f.id} id={`campo-${f.id}`} className={`far-field${image ? "" : " far-field--text"}`}>
                {image && (
                  <Photo
                    image={image}
                    slot={f.id === "purus" ? "Comunidades ribeirinhas do Rio Purus" : "Trabalho missionário em Caicó — RN"}
                    ratio="4 / 3"
                    mask={i ? "left" : "up"}
                    parallax={5}
                  />
                )}
                <div className="far-field__body" data-reveal>
                  <p className="field-card__kind">{t(f.place)}</p>
                  <h3 className="h3">{f.name}</h3>
                  {f.people && <p className="far-field__people">{t(f.people)}</p>}
                  <p className="muted">{t(f.summary)}</p>
                  <Pending show={f.pending} label="situação atual a confirmar" />
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </Section>

      <Section id="bom-samaritano" tone="green" labelledBy="bs-title" className="bs">
        <div className="container bs__grid">
          <div className="bs__copy">
            <p className="bs__entity" data-reveal>
              {bomSamaritano.short}
            </p>
            <h2 id="bs-title" className="h1" data-split>
              {bomSamaritano.name}
            </h2>
            {t(bomSamaritano.entityTranslation) && (
              <p className="bs__translation" data-reveal>
                {t(bomSamaritano.entityTranslation)}
              </p>
            )}
            <p className="bs__place" data-reveal>
              {t(bomSamaritano.place)}
            </p>
            <div className="prose" data-reveal>
              <p>{t(bomSamaritano.summary)}</p>
              <p>
                {t(bomSamaritano.activities)} <Pending show={bomSamaritano.pending} label="descrição a confirmar" />
              </p>
              <p>
                {t({
                  pt: `O nome do projeto remete à parábola contada por Jesus (${t(bomSamaritano.reference)}), que nos ensina a enxergar e cuidar de quem está ao nosso lado.`,
                  en: `The project's name ("The Good Samaritan") comes from the parable told by Jesus (${t(bomSamaritano.reference)}), which teaches us to see and care for those around us.`,
                  es: `El nombre del proyecto ("El Buen Samaritano") remite a la parábola contada por Jesús (${t(bomSamaritano.reference)}), que nos enseña a ver y cuidar a quien está a nuestro lado.`,
                })}
              </p>
            </div>
          </div>
          <div className="bs__media">
            <Photo
              image={media.bomSamaritano}
              slot="O Bom Samaritano"
              ratio="4 / 5"
              mask="up"
              parallax={6}
            />
          </div>
        </div>

        <div className="container">
          <CedibsUnits />
          <div data-reveal>
            <InstagramCarousel
              feed={instagramFeeds["bom-samaritano"]}
              title={{ pt: "Fotos do projeto", en: "Project photos", es: "Fotos del proyecto" }}
              fallback={bomSamaritano.gallery}
            />
          </div>
          <div className="bs__privacy" data-reveal>
            <h3 className="h4">
              {t({ pt: "Cuidado com a imagem das crianças", en: "Protecting children's images", es: "Cuidado con la imagen de los niños" })}
            </h3>
            <p className="small">
              {t({
                pt: "Em respeito ao Estatuto da Criança e do Adolescente e à Lei Geral de Proteção de Dados (LGPD), fotografias e informações das crianças atendidas são publicadas somente com autorização expressa dos responsáveis, preferencialmente sem identificação de rostos ou nomes.",
                en: "In keeping with Brazil's Child and Adolescent Statute and its General Data Protection Law (LGPD), photos and information about the children we serve are published only with the express consent of their parents or guardians, preferably without identifying faces or names.",
                es: "En respeto al Estatuto del Niño y del Adolescente y a la Ley General de Protección de Datos (LGPD) de Brasil, las fotografías y la información de los niños atendidos se publican solo con autorización expresa de sus padres o tutores, preferentemente sin identificar rostros ni nombres.",
              })}
            </p>
          </div>
        </div>
      </Section>

      <Section tone="paper" labelledBy="apoiar-title" className="support">
        <div className="container support__grid">
          <div>
            <h2 id="apoiar-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Ore, acompanhe <em>e participe.</em>
                  </>
                ),
                en: (
                  <>
                    Pray, follow along <em>and take part.</em>
                  </>
                ),
                es: (
                  <>
                    Ora, acompaña <em>y participa.</em>
                  </>
                ),
              })}
            </h2>
          </div>
          <ul className="support__list" data-reveal="stagger">
            <li>
              <h3 className="h4">{t({ pt: "Ore pelos campos", en: "Pray for the fields", es: "Ora por los campos" })}</h3>
              <p className="muted">
                {t({
                  pt: "Interceda pelos missionários, pelas congregações e pelas famílias alcançadas.",
                  en: "Intercede for the missionaries, the congregations and the families being reached.",
                  es: "Intercede por los misioneros, las congregaciones y las familias alcanzadas.",
                })}
              </p>
            </li>
            <li>
              <h3 className="h4">{t({ pt: "Acompanhe as notícias", en: "Follow the news", es: "Sigue las noticias" })}</h3>
              <p className="muted">
                {t({
                  pt: "Atualizações dos campos serão compartilhadas nos canais oficiais da igreja.",
                  en: "Updates from the fields will be shared on the church's official channels.",
                  es: "Las novedades de los campos se compartirán en los canales oficiales de la iglesia.",
                })}
              </p>
            </li>
            <li>
              <h3 className="h4">{t({ pt: "Fale conosco", en: "Talk to us", es: "Habla con nosotros" })}</h3>
              <p className="muted">
                {t({
                  pt: "Para saber como servir ou apoiar, entre em contato com a igreja.",
                  en: "To learn how to serve or support, get in touch with the church.",
                  es: "Para saber cómo servir o apoyar, ponte en contacto con la iglesia.",
                })}
              </p>
              <Button href="/contato/" variant="text">
                {t({ pt: "Entrar em contato", en: "Get in touch", es: "Ponerse en contacto" })}
              </Button>
            </li>
            <li>
              <h3 className="h4">{t({ pt: "Contribua", en: "Give", es: "Contribuye" })}</h3>
              <p className="muted">
                {t({
                  pt: "Ofertas pelo PIX ou transferência ajudam a sustentar as missões e as obras sociais.",
                  en: "Offerings by PIX or bank transfer help sustain the missions and social outreach.",
                  es: "Las ofrendas por PIX o transferencia ayudan a sostener las misiones y las obras sociales.",
                })}
              </p>
              <Button href="/contribua/" variant="text">
                {t({ pt: "Como contribuir", en: "How to give", es: "Cómo contribuir" })}
              </Button>
            </li>
          </ul>
        </div>
      </Section>
    </>
  );
}
