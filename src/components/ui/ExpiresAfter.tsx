"use client";

import { useEffect, useState } from "react";
import { todayInPombal } from "@/content/data";

/**
 * Exibe o conteúdo até o fim do dia informado (AAAA-MM-DD), no horário de
 * Pombal. Como o site é estático, a verificação acontece no navegador: depois
 * da data, o bloco deixa de aparecer sem precisar de uma nova publicação.
 */
export function ExpiresAfter({ date, children }: { date: string; children: React.ReactNode }) {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    setExpired(todayInPombal() > date);
  }, [date]);
  if (expired) return null;
  return <>{children}</>;
}
