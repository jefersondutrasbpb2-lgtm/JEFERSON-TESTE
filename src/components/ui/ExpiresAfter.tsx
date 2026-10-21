"use client";

import { useEffect, useState } from "react";

/**
 * Exibe o conteúdo até o fim do dia informado (AAAA-MM-DD). Como o site é
 * estático, a verificação acontece no navegador: depois da data, o bloco
 * deixa de aparecer sem precisar de uma nova publicação.
 */
export function ExpiresAfter({ date, children }: { date: string; children: React.ReactNode }) {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const [y, m, d] = date.split("-").map(Number);
    setExpired(Date.now() > new Date(y, m - 1, d, 23, 59, 59).getTime());
  }, [date]);
  if (expired) return null;
  return <>{children}</>;
}
