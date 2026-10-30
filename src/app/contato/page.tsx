import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Igreja Evangélica Congregacional de Pombal: endereço, telefone, e-mail, redes sociais, formulário de contato e pedido de oração.",
  alternates: { canonical: "/contato/" },
};

export default function ContatoPage() {
  return (
    <>
      <PageHero
        tone="paper"
        title={
          <>
            Estamos aqui <em>para ouvir você.</em>
          </>
        }
        lead="Envie sua mensagem, faça um pedido de oração ou encontre os canais oficiais da igreja."
      />

      <Section tone="paper" labelledBy="canais-title" className="section--tight">
        <div className="container contact__grid">
          <aside className="contact__channels" aria-labelledby="canais-title">
            <h2 id="canais-title" className="h3">
              Canais oficiais
            </h2>
            <ul className="channels">
              <li>
                <Icon name="pin" />
                <div>
                  <p className="channels__label">Endereço</p>
                  <p>
                    {fullAddress} <Pending show={site.address.pending} />
                  </p>
                  <a className="link-arrow small" href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
                    Como chegar <Icon name="arrow-up-right" size={14} />
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </div>
              </li>
              {site.phone && (
                <li>
                  <Icon name="phone" />
                  <div>
                    <p className="channels__label">Telefone</p>
                    <p>
                      <a href={site.phone.href}>{site.phone.display}</a> <Pending show={site.phone.pending} />
                    </p>
                  </div>
                </li>
              )}
              <li>
                <Icon name="mail" />
                <div>
                  <p className="channels__label">E-mail</p>
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
                          <span className="sr-only"> (abre em nova aba)</span>
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
              Escreva <em>para nós.</em>
            </h2>
            <ContactForm />
          </div>
        </div>
      </Section>

      <Section id="oracao" tone="ink" labelledBy="oracao-title" className="prayer">
        <div className="container prayer__grid">
          <div className="prayer__intro">
            <h2 id="oracao-title" className="h2" data-split>
              Podemos orar <em>por você?</em>
            </h2>
            <div className="prose" data-reveal>
              <p>
                Compartilhe seu pedido. Você pode se identificar ou enviá-lo de forma anônima.
              </p>
            </div>
            <div className="note" data-reveal>
              <strong>Confidencialidade</strong>
              <span>
                Os pedidos de oração são recebidos de forma reservada pelo secretário da igreja, Valdeci Junior, não são
                publicados e não são compartilhados com terceiros.
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
            Privacidade e proteção de dados
          </h2>
          <div className="prose">
            <p>
              Os dados enviados por meio dos formulários deste site (nome, e-mail, telefone e mensagem) são utilizados
              exclusivamente para responder ao seu contato ou para fins de oração e cuidado pastoral, em conformidade com
              a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
            <p>
              As informações não são vendidas, publicadas nem compartilhadas com terceiros, exceto o serviço técnico
              responsável pelo envio dos formulários. Você pode solicitar a exclusão dos seus dados a qualquer momento
              pelo e-mail <a href={`mailto:${site.email.value}`}>{site.email.value}</a>.
            </p>
            <p>
              Imagens de crianças e adolescentes, inclusive das atividades do projeto O Bom Samaritano, só são publicadas
              com autorização expressa dos responsáveis. Mapas e vídeos de terceiros (Google Maps e YouTube) são
              carregados apenas quando você solicita.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
