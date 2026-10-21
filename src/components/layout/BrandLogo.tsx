import { asset } from "@/lib/asset";
import { site } from "@/content/site";

/**
 * Logotipo oficial da igreja.
 * Versão azul (com símbolo) sobre fundos claros; versão branca sobre fundos
 * escuros. O CSS exibe a versão adequada ao tom do cabeçalho ou da seção.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-logo ${className}`.trim()}>
      <img
        className="brand-logo__img brand-logo__img--light"
        src={asset("/brand/logo-azul.webp")}
        alt={site.name}
        width={800}
        height={166}
        decoding="async"
      />
      <img
        className="brand-logo__img brand-logo__img--dark"
        src={asset("/brand/logo-branco.webp")}
        alt=""
        aria-hidden="true"
        width={800}
        height={204}
        decoding="async"
      />
    </span>
  );
}
