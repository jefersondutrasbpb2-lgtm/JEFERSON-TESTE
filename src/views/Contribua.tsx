import { contribuicao } from "@/content/contribuicao";
import { scriptures } from "@/content/fe";
import { asset } from "@/lib/asset";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { SiteLink } from "@/components/ui/SiteLink";
import { ScriptureQuote } from "@/components/ui/ScriptureQuote";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { getLocale, t } from "@/i18n/server";

export const metadataFor = (locale: Locale) =>
  pageMetadata(locale, {
    path: "/contribua/",
    title: { pt: "Contribua", en: "Give", es: "Ofrendas" },
    description: {
      pt: "Dízimos e ofertas para a Igreja Evangélica Congregacional de Pombal pelo PIX (CNPJ 09.317.231/0001-06) ou por transferência bancária. Contribua com nossas obras sociais e missões.",
      en: "Tithes and offerings to the Congregational Evangelical Church of Pombal by PIX (CNPJ 09.317.231/0001-06) or bank transfer. Support our social outreach and missions.",
      es: "Diezmos y ofrendas para la Iglesia Evangélica Congregacional de Pombal por PIX (CNPJ 09.317.231/0001-06) o transferencia bancaria. Contribuye con nuestras obras sociales y misiones.",
    },
  });

export default function ContribuaPage() {
  const locale = getLocale();
  const { pix, banco } = contribuicao;

  return (
    <>
      <PageHero
        tone="paper"
        title={t({
          pt: (
            <>
              Contribua com nossas <em>obras sociais e missões.</em>
            </>
          ),
          en: (
            <>
              Support our <em>social outreach and missions.</em>
            </>
          ),
          es: (
            <>
              Contribuye con nuestras <em>obras sociales y misiones.</em>
            </>
          ),
        })}
        lead={t({
          pt: "Seu dízimo e sua oferta podem ser entregues pelo PIX ou por transferência bancária, para a conta da igreja.",
          en: "You can give your tithe and offering by PIX or by bank transfer to the church's account.",
          es: "Puedes entregar tu diezmo y tu ofrenda por PIX o por transferencia bancaria a la cuenta de la iglesia.",
        })}
      />

      <Section tone="sand" labelledBy="pix-title" className="give">
        <div className="container give__grid">
          <figure className="give__qr" data-slide="left">
            <img
              src={asset(pix.imagem.src)}
              alt={t({
                pt: "QR Code PIX da IEC de Pombal: escaneie e deixe sua oferta e dízimos",
                en: "IEC Pombal PIX QR code: scan it to give your offering and tithes",
                es: "Código QR PIX de la IEC de Pombal: escanéalo para dejar tu ofrenda y diezmos",
              })}
              width={pix.imagem.width}
              height={pix.imagem.height}
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div className="give__copy">
            <h2 id="pix-title" className="h2" data-split>
              {t({
                pt: (
                  <>
                    Pelo <em>PIX</em>
                  </>
                ),
                en: (
                  <>
                    By <em>PIX</em>
                  </>
                ),
                es: (
                  <>
                    Por <em>PIX</em>
                  </>
                ),
              })}
            </h2>

            <ol className="give__steps" data-reveal="stagger">
              <li>
                {t({
                  pt: "Abra o aplicativo do seu banco e entre na área PIX.",
                  en: "Open your banking app and go to PIX.",
                  es: "Abre la aplicación de tu banco y entra en la sección PIX.",
                })}
              </li>
              <li>
                {t({
                  pt: "Escaneie o QR Code ou cole a chave ou o código copia e cola.",
                  en: "Scan the QR code, or paste the key or the copy-and-paste code.",
                  es: "Escanea el código QR o pega la clave o el código para copiar y pegar.",
                })}
              </li>
              <li>
                {t({
                  pt: "Informe o valor da sua oferta ou do seu dízimo e confirme.",
                  en: "Enter the amount of your offering or tithe and confirm.",
                  es: "Indica el monto de tu ofrenda o diezmo y confirma.",
                })}
              </li>
            </ol>

            <div className="give__key" data-reveal>
              <p className="give__label">
                {t({ pt: "Chave PIX", en: "PIX key", es: "Clave PIX" })} · {t(pix.tipo)}
              </p>
              <p className="give__value numeral">{pix.chave}</p>
              <div className="btn-row">
                <CopyButton value={pix.chaveCopia} label={t({ pt: "Copiar chave", en: "Copy key", es: "Copiar clave" })} />
                <CopyButton
                  value={pix.copiaECola}
                  label={t({ pt: "Copiar código copia e cola", en: "Copy PIX code", es: "Copiar código PIX" })}
                />
              </div>
              <p className="give__hint xs">
                {t({
                  pt: "No celular, use os botões de copiar e cole no app do banco: não é possível escanear o QR Code da própria tela.",
                  en: "On your phone, use the copy buttons and paste into your banking app — you can't scan a QR code on your own screen.",
                  es: "En el celular, usa los botones para copiar y pega en la app del banco: no es posible escanear el código QR de tu propia pantalla.",
                })}
              </p>
            </div>

            <div className="give__bank" data-reveal>
              <h3 className="h4">{t({ pt: "Transferência bancária", en: "Bank transfer", es: "Transferencia bancaria" })}</h3>
              <dl>
                <div>
                  <dt>{t({ pt: "Banco", en: "Bank", es: "Banco" })}</dt>
                  <dd>{banco.nome}</dd>
                </div>
                <div>
                  <dt>{t({ pt: "Agência", en: "Branch", es: "Agencia" })}</dt>
                  <dd className="numeral">{banco.agencia}</dd>
                </div>
                <div>
                  <dt>{t({ pt: "Conta corrente", en: "Checking account", es: "Cuenta corriente" })}</dt>
                  <dd className="numeral">{banco.conta}</dd>
                </div>
                <div>
                  <dt>CNPJ</dt>
                  <dd className="numeral">{banco.cnpj}</dd>
                </div>
              </dl>
            </div>

            {locale !== "pt" && (
              <p className="give__abroad small" data-reveal>
                {t({
                  pt: "",
                  en: "PIX and these bank details work with Brazilian bank accounts. If you would like to give from abroad, please contact us and we will help you.",
                  es: "PIX y estos datos bancarios funcionan con cuentas de bancos brasileños. Si deseas contribuir desde el exterior, contáctanos y te ayudaremos.",
                })}{" "}
                <SiteLink href="/contato/">{t({ pt: "", en: "Contact us", es: "Contáctanos" })}</SiteLink>
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section tone="paper" labelledBy="generosidade-title" className="section--tight give-verse">
        <div className="container container--narrow">
          <h2 id="generosidade-title" className="sr-only">
            {t({ pt: "Generosidade", en: "Generosity", es: "Generosidad" })}
          </h2>
          <ScriptureQuote verse={scriptures.generosidade} size="lg" />
          <div className="btn-row give-verse__ctas" data-reveal>
            <Button href="/missoes/" variant="outline">
              {t({ pt: "Conheça as missões e o CEDIBS", en: "See our missions and CEDIBS", es: "Conoce las misiones y el CEDIBS" })}
            </Button>
            <Button href="/contato/" variant="text">
              {t({ pt: "Dúvidas? Fale conosco", en: "Questions? Contact us", es: "¿Dudas? Contáctanos" })}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
