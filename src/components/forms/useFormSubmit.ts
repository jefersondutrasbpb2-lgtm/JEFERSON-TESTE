"use client";

import { useRef, useState } from "react";

export type Status = "idle" | "sending" | "success" | "error" | "unconfigured";
export type Errors = Record<string, string>;
export type Validator = (data: Record<string, string>) => Errors;

const MIN_FILL_MS = 2500;

/**
 * Envio de formulários para um serviço externo (ex.: Formspree, Getform ou
 * endpoint próprio), com validação, honeypot e checagem de tempo contra spam.
 * Sem endpoint configurado, o formulário oferece envio por e-mail.
 */
export function useFormSubmit(endpoint: string | undefined, validate: Validator) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const startedAt = useRef<number>(0);
  const lastData = useRef<Record<string, string>>({});

  const onFocusCapture = () => {
    if (!startedAt.current) startedAt.current = Date.now();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => {
      data[k] = typeof v === "string" ? v.trim() : "";
    });

    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      setStatus("idle");
      return;
    }

    // Honeypot preenchido ou envio instantâneo: provável robô. Simula sucesso.
    const tooFast = !startedAt.current || Date.now() - startedAt.current < MIN_FILL_MS;
    if (data.website || tooFast) {
      setStatus("success");
      form.reset();
      return;
    }
    delete data.website;
    lastData.current = data;

    if (!endpoint) {
      setStatus("unconfigured");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
      startedAt.current = 0;
    } catch {
      setStatus("error");
    }
  };

  return { status, errors, onSubmit, onFocusCapture, lastData };
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
