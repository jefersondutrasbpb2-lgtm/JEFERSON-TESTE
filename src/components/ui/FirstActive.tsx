"use client";

import { Children, useEffect, useState } from "react";
import { todayInPombal } from "@/content/data";

/**
 * Mostra só o primeiro bloco cujo último dia (AAAA-MM-DD, horário de Pombal)
 * ainda não passou. Como o site é estático, a troca acontece no navegador:
 * quando um evento termina, o próximo assume o lugar sem nova publicação.
 */
export function FirstActive({ until, children }: { until: string[]; children: React.ReactNode }) {
  const items = Children.toArray(children);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const today = todayInPombal();
    setIndex(until.findIndex((d) => d >= today));
  }, [until]);
  if (index < 0) return null;
  return <>{items[index] ?? null}</>;
}
