"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { Field, Honeypot } from "./Field";
import { FormStatus, buildMailto } from "./FormStatus";
import { isEmail, useFormSubmit, type Errors } from "./useFormSubmit";
import { useLocale, useT } from "@/i18n/client";

export function PrayerForm() {
  const t = useT();
  const locale = useLocale();
  const validate = (d: Record<string, string>): Errors => {
    const e: Errors = {};
    if (!d.pedido || d.pedido.length < 5)
      e.pedido = t({ pt: "Escreva seu pedido de oração.", en: "Please write your prayer request.", es: "Escribe tu petición de oración." });
    if (d.retorno === "sim" && !d.contato)
      e.contato = t({
        pt: "Informe um telefone ou e-mail para retorno.",
        en: "Please give a phone number or email so we can reach you.",
        es: "Indica un teléfono o correo para responderte.",
      });
    if (d.contato && d.contato.includes("@") && !isEmail(d.contato))
      e.contato = t({ pt: "Verifique o e-mail informado.", en: "Please check the email address.", es: "Verifica el correo indicado." });
    if (d.consentimento !== "sim")
      e.consentimento = t({
        pt: "É necessário concordar com o tratamento confidencial dos dados.",
        en: "Please agree to the confidential handling of your data.",
        es: "Es necesario aceptar el tratamiento confidencial de los datos.",
      });
    return e;
  };
  const [wantsReply, setWantsReply] = useState(false);
  const { status, errors, onSubmit, onFocusCapture, lastData } = useFormSubmit(
    process.env.NEXT_PUBLIC_PRAYER_ENDPOINT,
    validate,
  );
  const d = lastData.current;
  const mailto = buildMailto(
    site.email.value,
    `Pedido de oração (confidencial)${locale === "pt" ? "" : ` (${locale.toUpperCase()})`}`,
    `${d.pedido ?? ""}\n\n${d["nome-oracao"] || t({ pt: "Anônimo", en: "Anonymous", es: "Anónimo" })}${d.contato ? `\n${d.contato}` : ""}`,
  );

  return (
    <form className="form" noValidate onSubmit={onSubmit} onFocusCapture={onFocusCapture}>
      <Field
        id="pedido"
        label={t({ pt: "Seu pedido de oração", en: "Your prayer request", es: "Tu petición de oración" })}
        as="textarea"
        required
        rows={6}
        error={errors.pedido}
        hint={t({
          pt: "Compartilhe apenas o que se sentir à vontade para compartilhar.",
          en: "Share only what you feel comfortable sharing.",
          es: "Comparte solo lo que te sientas cómodo compartiendo.",
        })}
      />
      <div className="form__row form__row--2">
        <Field
          id="nome-oracao"
          label={t({ pt: "Nome", en: "Name", es: "Nombre" })}
          autoComplete="name"
          hint={t({
            pt: "Deixe em branco para enviar anonimamente.",
            en: "Leave blank to send anonymously.",
            es: "Déjalo en blanco para enviar de forma anónima.",
          })}
        />
        <Field
          id="contato"
          label={t({ pt: "Telefone ou e-mail", en: "Phone or email", es: "Teléfono o correo" })}
          required={wantsReply}
          error={errors.contato}
          hint={wantsReply ? t({ pt: "Necessário para o retorno.", en: "Needed so we can reach you.", es: "Necesario para responderte." }) : undefined}
        />
      </div>
      <label className="check">
        <input type="checkbox" name="retorno" value="sim" checked={wantsReply} onChange={(e) => setWantsReply(e.target.checked)} />
        <span>
          {t({
            pt: "Gostaria que alguém da igreja entrasse em contato comigo.",
            en: "I would like someone from the church to contact me.",
            es: "Me gustaría que alguien de la iglesia se pusiera en contacto conmigo.",
          })}
        </span>
      </label>
      <div className="field">
        <label className="check">
          <input
            type="checkbox"
            name="consentimento"
            value="sim"
            aria-invalid={errors.consentimento ? true : undefined}
            aria-describedby={errors.consentimento ? "consent-prayer-error" : undefined}
          />
          <span>
            {t({
              pt: "Entendo que meu pedido será tratado de forma confidencial, apenas para fins de oração e cuidado pastoral, e não será publicado.",
              en: "I understand that my request will be handled confidentially, only for prayer and pastoral care, and will not be published.",
              es: "Entiendo que mi petición será tratada de forma confidencial, solo con fines de oración y cuidado pastoral, y no será publicada.",
            })}
          </span>
        </label>
        {errors.consentimento && (
          <p id="consent-prayer-error" className="field__error">
            {errors.consentimento}
          </p>
        )}
      </div>
      <Honeypot />
      <button type="submit" className="btn btn--solid" disabled={status === "sending"}>
        <span className="btn__label">
          {status === "sending"
            ? t({ pt: "Enviando…", en: "Sending…", es: "Enviando…" })
            : t({ pt: "Enviar pedido", en: "Send request", es: "Enviar petición" })}
        </span>
      </button>
      <FormStatus
        status={status}
        mailto={mailto}
        success={t({
          pt: "Pedido recebido. Estaremos orando por você. “Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.” (1 Pedro 5.7)",
          en: "Request received. We will be praying for you. “Casting all your care upon him; for he careth for you.” (1 Peter 5:7)",
          es: "Petición recibida. Estaremos orando por ti. “Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.” (1 Pedro 5:7)",
        })}
      />
    </form>
  );
}
