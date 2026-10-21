import { reviewMode } from "@/content/site";

/**
 * Sinaliza, no modo de revisão, conteúdos que aguardam confirmação da
 * liderança. Fora do modo de revisão não renderiza nada.
 */
export function Pending({ show = true, label = "a confirmar" }: { show?: boolean; label?: string }) {
  if (!reviewMode || !show) return null;
  return (
    <span className="pending" title="Informação aguardando confirmação da liderança">
      {label}
    </span>
  );
}
