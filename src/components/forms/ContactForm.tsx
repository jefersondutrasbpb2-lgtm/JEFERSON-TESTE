"use client";

import { site } from "@/content/site";
import { Field, Honeypot } from "./Field";
import { FormStatus, buildMailto } from "./FormStatus";
import { isEmail, useFormSubmit, type Errors } from "./useFormSubmit";

const validate = (d: Record<string, string>): Errors => {
  const e: Errors = {};
  if (!d.nome || d.nome.length < 2) e.nome = "Informe seu nome.";
  if (!d.email || !isEmail(d.email)) e.email = "Informe um e-mail válido.";
  if (!d.mensagem || d.mensagem.length < 10) e.mensagem = "Escreva sua mensagem (mínimo de 10 caracteres).";
  if (d.consentimento !== "sim") e.consentimento = "É necessário concordar com o uso dos dados para responder.";
  return e;
};

export function ContactForm() {
  const { status, errors, onSubmit, onFocusCapture, lastData } = useFormSubmit(
    process.env.NEXT_PUBLIC_CONTACT_ENDPOINT,
    validate,
  );
  const d = lastData.current;
  const mailto = buildMailto(
    site.email.value,
    `Contato pelo site — ${d.assunto || "mensagem"}`,
    `${d.mensagem ?? ""}\n\n${d.nome ?? ""}${d.telefone ? `\n${d.telefone}` : ""}`,
  );

  return (
    <form className="form" noValidate onSubmit={onSubmit} onFocusCapture={onFocusCapture} aria-describedby="contato-req">
      <p id="contato-req" className="xs muted">
        Campos marcados com * são obrigatórios.
      </p>
      <div className="form__row form__row--2">
        <Field id="nome" label="Nome" required autoComplete="name" error={errors.nome} />
        <Field id="email" label="E-mail" type="email" required autoComplete="email" error={errors.email} />
      </div>
      <div className="form__row form__row--2">
        <Field id="telefone" label="Telefone / WhatsApp" type="tel" autoComplete="tel" inputMode="tel" />
        <Field id="assunto" label="Assunto" as="select">
          <option>Informações gerais</option>
          <option>Visita e cultos</option>
          <option>Ministérios</option>
          <option>Missões e ação social</option>
          <option>Acervo histórico</option>
          <option>Outro assunto</option>
        </Field>
      </div>
      <Field id="mensagem" label="Mensagem" as="textarea" required rows={6} error={errors.mensagem} />
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
            Concordo que meus dados sejam usados exclusivamente para responder a este contato, conforme a{" "}
            <a href="#privacidade">política de privacidade</a>.
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
        <span className="btn__label">{status === "sending" ? "Enviando…" : "Enviar mensagem"}</span>
      </button>
      <FormStatus
        status={status}
        mailto={mailto}
        success="Mensagem enviada. Obrigado pelo contato — responderemos assim que possível."
      />
    </form>
  );
}
