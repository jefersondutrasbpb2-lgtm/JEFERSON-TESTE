"use client";

import { site } from "@/content/site";
import { Field, Honeypot } from "./Field";
import { FormStatus, buildMailto } from "./FormStatus";
import { isEmail, useFormSubmit, type Errors } from "./useFormSubmit";
import { useLocale, useT } from "@/i18n/client";

export function ContactForm() {
  const t = useT();
  const locale = useLocale();
  const validate = (d: Record<string, string>): Errors => {
    const e: Errors = {};
    if (!d.nome || d.nome.length < 2) e.nome = t({ pt: "Informe seu nome.", en: "Please enter your name.", es: "Escribe tu nombre." });
    if (!d.email || !isEmail(d.email))
      e.email = t({ pt: "Informe um e-mail válido.", en: "Please enter a valid email.", es: "Escribe un correo válido." });
    if (!d.mensagem || d.mensagem.length < 10)
      e.mensagem = t({
        pt: "Escreva sua mensagem (mínimo de 10 caracteres).",
        en: "Please write your message (at least 10 characters).",
        es: "Escribe tu mensaje (mínimo de 10 caracteres).",
      });
    if (d.consentimento !== "sim")
      e.consentimento = t({
        pt: "É necessário concordar com o uso dos dados para responder.",
        en: "Please agree to the use of your data so we can reply.",
        es: "Es necesario aceptar el uso de los datos para responderte.",
      });
    return e;
  };

  const { status, errors, onSubmit, onFocusCapture, lastData } = useFormSubmit(
    process.env.NEXT_PUBLIC_CONTACT_ENDPOINT,
    validate,
  );
  const d = lastData.current;
  const mailto = buildMailto(
    site.email.value,
    `Contato pelo site${locale === "pt" ? "" : ` (${locale.toUpperCase()})`} — ${d.assunto || "mensagem"}`,
    `${d.mensagem ?? ""}\n\n${d.nome ?? ""}${d.telefone ? `\n${d.telefone}` : ""}`,
  );

  return (
    <form className="form" noValidate onSubmit={onSubmit} onFocusCapture={onFocusCapture} aria-describedby="contato-req">
      <p id="contato-req" className="xs muted">
        {t({
          pt: "Campos marcados com * são obrigatórios.",
          en: "Fields marked with * are required.",
          es: "Los campos marcados con * son obligatorios.",
        })}
      </p>
      <div className="form__row form__row--2">
        <Field id="nome" label={t({ pt: "Nome", en: "Name", es: "Nombre" })} required autoComplete="name" error={errors.nome} />
        <Field id="email" label={t({ pt: "E-mail", en: "Email", es: "Correo" })} type="email" required autoComplete="email" error={errors.email} />
      </div>
      <div className="form__row form__row--2">
        <Field
          id="telefone"
          label={t({ pt: "Telefone / WhatsApp", en: "Phone / WhatsApp", es: "Teléfono / WhatsApp" })} type="tel" autoComplete="tel" inputMode="tel" />
        <Field id="assunto" label={t({ pt: "Assunto", en: "Subject", es: "Asunto" })} as="select">
          <option>{t({ pt: "Informações gerais", en: "General information", es: "Información general" })}</option>
          <option>{t({ pt: "Visita e cultos", en: "Visiting and services", es: "Visitas y cultos" })}</option>
          <option>{t({ pt: "Departamentos", en: "Departments", es: "Departamentos" })}</option>
          <option>{t({ pt: "Missões e ação social", en: "Missions and outreach", es: "Misiones y acción social" })}</option>
          <option>{t({ pt: "Acervo histórico", en: "Historical archive", es: "Archivo histórico" })}</option>
          <option>{t({ pt: "Outro assunto", en: "Other", es: "Otro asunto" })}</option>
        </Field>
      </div>
      <Field id="mensagem" label={t({ pt: "Mensagem", en: "Message", es: "Mensaje" })} as="textarea" required rows={6} error={errors.mensagem} />
      <div className="field">
        <label className="check">
          <input
            type="checkbox"
            name="consentimento"
            value="sim"
            aria-invalid={errors.consentimento ? true : undefined}
            aria-describedby={errors.consentimento ? "consentimento-error" : undefined}
          />
          <span>
            {t({
              pt: "Concordo que meus dados sejam usados exclusivamente para responder a este contato, conforme a ",
              en: "I agree that my data will be used only to reply to this message, as described in the ",
              es: "Acepto que mis datos se usen exclusivamente para responder a este contacto, según la ",
            })}
            <a href="#privacidade">{t({ pt: "política de privacidade", en: "privacy policy", es: "política de privacidad" })}</a>.
          </span>
        </label>
        {errors.consentimento && (
          <p id="consentimento-error" className="field__error">
            {errors.consentimento}
          </p>
        )}
      </div>
      <Honeypot />
      <button type="submit" className="btn btn--solid" disabled={status === "sending"}>
        <span className="btn__label">
          {status === "sending"
            ? t({ pt: "Enviando…", en: "Sending…", es: "Enviando…" })
            : t({ pt: "Enviar mensagem", en: "Send message", es: "Enviar mensaje" })}
        </span>
      </button>
      <FormStatus
        status={status}
        mailto={mailto}
        success={t({
          pt: "Mensagem enviada. Obrigado pelo contato — responderemos assim que possível.",
          en: "Message sent. Thank you for writing — we will reply as soon as possible.",
          es: "Mensaje enviado. Gracias por escribirnos: responderemos lo antes posible.",
        })}
      />
    </form>
  );
}
