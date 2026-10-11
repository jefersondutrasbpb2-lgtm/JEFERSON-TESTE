/**
 * Assinatura tipográfica provisória. Não substitui o logotipo oficial:
 * quando a igreja fornecer sua marca, insira-a aqui.
 */
export function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <span className={`wordmark ${compact ? "wordmark--compact" : ""}`}>
      <span className="wordmark__top">Igreja Evangélica</span>
      <span className="wordmark__name">Congregacional de Pombal</span>
    </span>
  );
}
