"use client";

import { useEffect, useState } from "react";
import { reviewMode } from "@/content/site";

/** Aviso discreto de que o site está em revisão de conteúdo. */
export function ReviewBanner() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem("review-banner") === "0");
    } catch {
      setDismissed(false);
    }
  }, []);
  if (!reviewMode || dismissed) return null;
  return (
    <aside className="review-banner" aria-label="Aviso de revisão de conteúdo">
      <p>
        <strong>Versão em revisão.</strong> Itens marcados com <span className="pending">a confirmar</span> aguardam
        validação da liderança antes da publicação.
      </p>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem("review-banner", "0");
          } catch {}
        }}
      >
        Ocultar aviso
      </button>
    </aside>
  );
}
