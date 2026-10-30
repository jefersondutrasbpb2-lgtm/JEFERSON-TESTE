"use client";

import { useT } from "@/i18n/client";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Field({ id, label, error, hint, required, as = "input", children, ...rest }: Props) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: id,
    className: "field__input",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    required,
  };
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label} {required ? <span aria-hidden="true">*</span> : <span className="muted xs">(opcional)</span>}
      </label>
      {as === "textarea" ? (
        <textarea {...common} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : as === "select" ? (
        <select {...common}>{children}</select>
      ) : (
        <input {...common} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export function Honeypot() {
  const t = useT();
  return (
    <div className="hp-field" aria-hidden="true">
      <label htmlFor="website">
        {t({ pt: "Não preencha este campo", en: "Leave this field empty", es: "No completes este campo" })}
      </label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
