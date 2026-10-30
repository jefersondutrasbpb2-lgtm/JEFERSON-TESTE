"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { Field, Honeypot } from "./Field";
import { FormStatus, buildMailto } from "./FormStatus";
import { isEmail, useFormSubmit, type Errors } from "./useFormSubmit";

const validate = (d: Record<string, string>): Errors => {
  const e: Errors = {};
  if (!d.pedido || d.pedido.length < 5) e.pedido = "Escreva seu pedido de oração.";
  if (d.retorno === "sim" && !d.contato) e.contato = "Informe um telefone ou e-mail para retorno.";
  if (d.contato && d.contato.includes("@") && !isEmail(d.contato)) e.contato = "Verifique o e-mail informado.";
  if (d.consentimento !== "sim") e.consentimento = "É necessário concordar com o tratamento confidencial dos dados.";
  return e;
};

export function PrayerForm() {
  const [wantsReply, setWantsReply] = useState(false);
  const { status, errors, onSubmit, onFocusCapture, lastData } = useFormSubmit(
    process.env.NEXT_PUBLIC_PRAYER_ENDPOINT,
    validate,
  );
  const d = lastData.current;
  const mailto = buildMailto(
    site.email.value,
    "Pedido de oração (confidencial)",
    `${d.pedido ?? ""}\n\n${d["nome-oracao"] || "Anônimo"}${d.contato ? `\n${d.contato}` : ""}`,
  );

  return (
    <form className="form" noValidate onSubmit={onSubmit} onFocusCapture={onFocusCapture}>
      <Field
        id="pedido"
        label="Seu pedido de oração"
        as="textarea"
        required
        rows={6}
        error={errors.pedido}
        hint="Compartilhe apenas o que se sentir à vontade para compartilhar."
      />
      <div className="form__row form__row--2">
        <Field id="nome-oracao" label="Nome" autoComplete="name" hint="Deixe em branco para enviar anonimamente." />
        <Field
          id="contato"
          label="Telefone ou e-mail"
          required={wantsReply}
          error={errors.contato}
          hint={wantsReply ? "Necessário para o retorno." : undefined}
        />
      </div>
      <label className="check">
        <input type="checkbox" name="retorno" value="sim" checked={wantsReply} onChange={(e) => setWantsReply(e.target.checked)} />
        <span>Gostaria que alguém da igreja entrasse em contato comigo.</span>
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
            Entendo que meu pedido será tratado de forma confidencial, apenas para fins de oração e cuidado pastoral, e
            não será publicado.
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
        <span className="btn__label">{status === "sending" ? "Enviando…" : "Enviar pedido"}</span>
      </button>
      <FormStatus
        status={status}
        mailto={mailto}
        success="Pedido recebido. Estaremos orando por você. “Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.” (1 Pedro 5.7)"
      />
    </form>
  );
}
