"use client";

import { useRef, useState } from "react";

export type Status = "idle" | "sending" | "success" | "error" | "unconfigured";
export type Errors = Record<string, string>;
export type Validator = (data: Record<string, string>) => Errors;

const MIN_FILL_MS = 2500;

/**
 * Endereço que recebe os formulários: por padrão, o serviço em PHP do próprio
 * site na Hostinger (public/api/formulario.php), que envia por e-mail à
 * secretaria. NEXT_PUBLIC_CONTACT_ENDPOINT / NEXT_PUBLIC_PRAYER_ENDPOINT
 * permitem trocar por outro serviço.
 */
export const defaultFormEndpoint = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/formulario.php`;

/**
 * Envio de formulários com validação, honeypot e checagem de tempo contra spam.
 * `extra` vai junto no corpo (ex.: tipo do formulário e idioma da página).
 * Sem endpoint ou se o envio falhar, o formulário oferece envio por e-mail.
 */
export function useFormSubmit(endpoint: string | undefined, validate: Validator, extra: Record<string, string> = {}) {
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
        body: JSON.stringify({ ...extra, ...data }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !json?.ok) throw new Error(String(res.status));
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
