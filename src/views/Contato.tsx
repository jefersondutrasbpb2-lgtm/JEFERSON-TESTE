import { fullAddress, mapsDirectionsUrl, site } from "@/content/site";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Pending } from "@/components/ui/Pending";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { Photo } from "@/components/ui/Photo";
import { media } from "@/content/media";
import { ContactForm } from "@/components/forms/ContactForm";
import { PrayerForm } from "@/components/forms/PrayerForm";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { t } from "@/i18n/server";

export const metadataFor = (locale: Locale) =>
  pageMetadata(locale, {
    path: "/contato/",
    title: { pt: "Contato", en: "Contact", es: "Contacto" },
    description: {
      pt: "Fale com a Igreja Evangélica Congregacional de Pombal: endereço, e-mail, redes sociais, formulário de contato e pedido de oração.",
      en: "Get in touch with the Congregational Evangelical Church of Pombal: address, email, social media, contact form and prayer requests.",
      es: "Comunícate con la Iglesia Evangélica Congregacional de Pombal: dirección, correo, redes sociales, formulario de contacto y peticiones de oración.",
    },
  });

export default function ContatoPage() {
  return (
    <>
      <PageHero
        tone="paper"
        title={t({
          pt: (
            <>
              Estamos aqui <em>para ouvir você.</em>
            </>
          ),
          en: (
            <>
              We are here <em>to listen.</em>
            </>
          ),
          es: (
            <>
              Estamos aquí <em>para escucharte.</em>
            </>
          ),
        })}
        lead={t({
          pt: "Envie sua mensagem, faça um pedido de oração ou encontre os canais oficiais da igreja.",
          en: "Send us a message, share a prayer request or find the church's official channels. You can write in English — we will do our best to reply.",
          es: "Envíanos tu mensaje, haz una petición de oración o encuentra los canales oficiales de la iglesia. Puedes escribir en español: haremos lo posible por responderte.",
        })}
      />

      <Section tone="paper" labelledBy="canais-title" className="section--tight">
        <div className="container contact__grid">
          <aside className="contact__channels" aria-labelledby="canais-title">
            <h2 id="canais-title" className="h3">
              {t({ pt: "Canais oficiais", en: "Official channels", es: "Canales oficiales" })}
            </h2>
            <ul className="channels">
              <li>
                <Icon name="pin" />
                <div>
                  <p className="channels__label">{t({ pt: "Endereço", en: "Address", es: "Dirección" })}</p>
                  <p>
                    {fullAddress} <Pending show={site.address.pending} />
                  </p>
                  <a className="link-arrow small" href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
                    {t({ pt: "Como chegar", en: "Get directions", es: "Cómo llegar" })} <Icon name="arrow-up-right" size={14} />
                    <span className="sr-only">{t({ pt: " (abre em nova aba)", en: " (opens in a new tab)", es: " (se abre en una pestaña nueva)" })}</span>
                  </a>
                </div>
              </li>
              {site.phone && (
                <li>
                  <Icon name="phone" />
                  <div>
                    <p className="channels__label">{t({ pt: "Telefone", en: "Phone", es: "Teléfono" })}</p>
                    <p>
                      <a href={site.phone.href}>{site.phone.display}</a> <Pending show={site.phone.pending} />
                    </p>
                  </div>
                </li>
              )}
              <li>
                <Icon name="mail" />
                <div>
                  <p className="channels__label">{t({ pt: "E-mail", en: "Email", es: "Correo" })}</p>
                  <p>
                    <a href={`mailto:${site.email.value}`}>{site.email.value}</a> <Pending show={site.email.pending} />
                  </p>
                </div>
              </li>
              {site.social.map((s) => (
                <li key={s.id}>
                  <Icon name={s.id} />
                  <div>
                    <p className="channels__label">{s.label}</p>
                    <p>
                      {s.href ? (
                        <a href={s.href} target="_blank" rel="noopener noreferrer">
                          {s.handle}
                          <span className="sr-only">{t({ pt: " (abre em nova aba)", en: " (opens in a new tab)", es: " (se abre en una pestaña nueva)" })}</span>
                        </a>
                      ) : (
                        <span className="muted">{s.handle}</span>
                      )}{" "}
                      <Pending show={s.pending} />
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className="contact__form">
            <h2 className="h2 contact__title" data-split>
              {t({
                pt: (
                  <>
                    Escreva <em>para nós.</em>
                  </>
                ),
                en: (
                  <>
                    Write <em>to us.</em>
                  </>
                ),
                es: (
                  <>
                    Escríbenos <em>un mensaje.</em>
                  </>
                ),
              })}
            </h2>
            <ContactForm />
          </div>
        </div>
      </Section>

      <Section id="oracao" tone="ink" labelledBy="oracao-title" className="prayer">
        <div className="container prayer__grid">
          <div className="prayer__intro">
            <h2 id="oracao-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Podemos orar <em>por você?</em>
                  </>
                ),
                en: (
                  <>
                    May we <em>pray for you?</em>
                  </>
                ),
                es: (
                  <>
                    ¿Podemos orar <em>por ti?</em>
                  </>
                ),
              })}
            </h2>
            <div className="prose" data-reveal>
              <p>
                {t({
                  pt: "Compartilhe seu pedido. Você pode se identificar ou enviá-lo de forma anônima.",
                  en: "Share your request. You can include your name or send it anonymously.",
                  es: "Comparte tu petición. Puedes identificarte o enviarla de forma anónima.",
                })}
              </p>
            </div>
            <div className="note" data-reveal>
              <strong>{t({ pt: "Confidencialidade", en: "Confidentiality", es: "Confidencialidad" })}</strong>
              <span>
                {t({
                  pt: "Os pedidos de oração são recebidos de forma reservada pelo secretário da igreja, Valdeci Junior, não são publicados e não são compartilhados com terceiros.",
                  en: "Prayer requests are received confidentially by the church secretary, Valdeci Junior. They are not published or shared with third parties.",
                  es: "Las peticiones de oración las recibe de forma reservada el secretario de la iglesia, Valdeci Junior; no se publican ni se comparten con terceros.",
                })}
              </span>
            </div>
          </div>
          <div className="prayer__form" data-tone="paper">
            <PrayerForm />
          </div>
        </div>
      </Section>

      <Section tone="sand" className="section--tight">
        <div className="container visite__grid">
          <div className="visite__copy">
            <p className="h3 font-display" data-reveal>
              {site.address.street} — {site.address.district}, {site.address.city} — {site.address.state}
            </p>
            <Photo image={media.visitaEntrada} slot="Entrada do templo" ratio="4 / 3" mask="up" />
          </div>
          <div data-reveal>
            <MapEmbed />
          </div>
        </div>
      </Section>

      <Section id="privacidade" tone="paper" labelledBy="privacidade-title" className="section--tight privacy">
        <div className="container container--narrow">
          <h2 id="privacidade-title" className="h3">
            {t({ pt: "Privacidade e proteção de dados", en: "Privacy and data protection", es: "Privacidad y protección de datos" })}
          </h2>
          <div className="prose">
            {t({
              pt: (
                <>
                  <p>
                    Os dados enviados por meio dos formulários deste site (nome, e-mail, telefone e mensagem) são
                    utilizados exclusivamente para responder ao seu contato ou para fins de oração e cuidado pastoral, em
                    conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                  </p>
                  <p>
                    As informações não são vendidas, publicadas nem compartilhadas com terceiros, exceto o serviço técnico
                    responsável pelo envio dos formulários. Você pode solicitar a exclusão dos seus dados a qualquer
                    momento pelo e-mail <a href={`mailto:${site.email.value}`}>{site.email.value}</a>.
                  </p>
                  <p>
                    Imagens de crianças e adolescentes, inclusive das atividades do projeto O Bom Samaritano, só são
                    publicadas com autorização expressa dos responsáveis. Mapas e vídeos de terceiros (Google Maps e
                    YouTube) são carregados apenas quando você solicita.
                  </p>
                </>
              ),
              en: (
                <>
                  <p>
                    The data you send through the forms on this site (name, email, phone and message) is used only to
                    reply to you or for prayer and pastoral care, in accordance with Brazil&apos;s General Data Protection
                    Law (Law No. 13,709/2018, LGPD).
                  </p>
                  <p>
                    Your information is not sold, published or shared with third parties, except for the technical service
                    that delivers the forms. You can ask us to delete your data at any time by writing to{" "}
                    <a href={`mailto:${site.email.value}`}>{site.email.value}</a>.
                  </p>
                  <p>
                    Images of children and teenagers, including from the O Bom Samaritano project, are published only with
                    the express consent of their parents or guardians. Third-party maps and videos (Google Maps and
                    YouTube) load only when you ask for them.
                  </p>
                </>
              ),
              es: (
                <>
                  <p>
                    Los datos enviados mediante los formularios de este sitio (nombre, correo, teléfono y mensaje) se
                    utilizan exclusivamente para responder a tu contacto o con fines de oración y cuidado pastoral,
                    conforme a la Ley General de Protección de Datos de Brasil (Ley n.º 13.709/2018, LGPD).
                  </p>
                  <p>
                    La información no se vende, publica ni comparte con terceros, salvo el servicio técnico responsable del
                    envío de los formularios. Puedes solicitar la eliminación de tus datos en cualquier momento escribiendo
                    a <a href={`mailto:${site.email.value}`}>{site.email.value}</a>.
                  </p>
                  <p>
                    Las imágenes de niños y adolescentes, incluso de las actividades del proyecto O Bom Samaritano, solo se
                    publican con autorización expresa de sus padres o tutores. Los mapas y videos de terceros (Google Maps y
                    YouTube) se cargan solo cuando lo solicitas.
                  </p>
                </>
              ),
            })}
          </div>
        </div>
      </Section>
    </>
  );
}
