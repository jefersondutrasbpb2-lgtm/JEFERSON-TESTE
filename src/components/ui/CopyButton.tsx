"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";
import { Icon } from "./Icon";

/** Botão que copia um texto (chave PIX, código copia e cola) e confirma na tela. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Navegadores sem acesso à área de transferência: seleciona o texto num campo temporário
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button type="button" className={`btn btn--outline btn--sm copy-btn${copied ? " is-copied" : ""}`} onClick={copy}>
      <span className="btn__label">{copied ? t({ pt: "Copiado!", en: "Copied!", es: "¡Copiado!" }) : label}</span>
      <span className="btn__icon" aria-hidden="true">
        <Icon name={copied ? "check" : "copy"} size={16} />
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? t({ pt: "Copiado para a área de transferência", en: "Copied to clipboard", es: "Copiado al portapapeles" }) : ""}
      </span>
    </button>
  );
}
